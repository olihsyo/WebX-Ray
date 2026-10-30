import asyncio
import logging
from datetime import datetime
from typing import List
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db, AsyncSessionLocal
from backend.app.models.entities import (
    Project, ScanJob, DiscoveredPage, PageSnapshot, Component, DesignToken,
    Asset, NetworkObservation, ApiContract, AuditLog
)
from backend.app.schemas.all_schemas import (
    ScanJobCreate, ScanJobRead
)
from backend.app.services.security import security_service
from backend.app.services.crawler import crawler_service, normalize_url, classify_page_type
from backend.app.services.browser_engine import browser_engine
from backend.app.services.design_analyzer import design_analyzer
from backend.app.services.component_detector import component_detector
from backend.app.services.asset_analyzer import asset_analyzer
from backend.app.services.network_analyzer import network_analyzer

logger = logging.getLogger("webxray.scans")
router = APIRouter(prefix="/scans", tags=["Scans"])

async def execute_crawl_and_analysis_pipeline(scan_id: str, project_id: str, mode: str, max_pages: int, max_depth: int):
    """
    Background worker that runs the full browser crawl, DOM extraction,
    design token extraction, component detection, and API observation pipeline.
    """
    async with AsyncSessionLocal() as db:
        # Load ScanJob and Project
        scan = await db.get(ScanJob, scan_id)
        project = await db.get(Project, project_id)
        if not scan or not project or not project.target_url:
            return

        scan.status = "running"
        scan.started_at = datetime.utcnow()
        project.status = "scanning"
        await db.commit()

        target_url = normalize_url(project.target_url)
        discovered_urls: set[str] = {target_url}
        queue: list[tuple[str, int]] = [(target_url, 0)] # (url, depth)
        pages_processed = 0

        # Optional Sitemap discovery
        if mode in ("sitemap", "dynamic", "internal_links"):
            try:
                robots_data = await crawler_service.fetch_robots_txt(target_url)
                sitemaps = await crawler_service.discover_sitemaps(target_url, robots_data.get("sitemaps", []))
                for s_url in sitemaps:
                    s_links = await crawler_service.parse_sitemap_urls(s_url, max_urls=max_pages)
                    for l in s_links:
                        if l not in discovered_urls and len(discovered_urls) < max_pages:
                            discovered_urls.add(l)
                            queue.append((l, 1))
            except Exception as sm_err:
                logger.warning(f"Sitemap discovery error: {sm_err}")

        scan.pages_discovered = len(discovered_urls)
        await db.commit()

        # Crawl Loop
        while queue and pages_processed < max_pages:
            current_url, current_depth = queue.pop(0)

            # Check if cancelled
            await db.refresh(scan)
            if scan.status == "cancelled":
                break

            parsed_url = urlparse(current_url)
            page_path = parsed_url.path or "/"

            # Create DiscoveredPage record
            page = DiscoveredPage(
                project_id=project_id,
                scan_job_id=scan_id,
                url=current_url,
                path=page_path,
                discovery_method="initial_target" if pages_processed == 0 else "internal_link",
                depth=current_depth,
                analysis_status="analyzing"
            )
            db.add(page)
            await db.flush()

            try:
                # Render via Playwright Browser Engine
                render_data = await browser_engine.render_page(
                    project_id=project_id,
                    page_id=page.id,
                    url=current_url,
                    viewport_name="desktop",
                    auth_config=project.auth_config,
                    allow_private=(project.access_profile in ("test_env", "full"))
                )

                page.title = render_data.get("title")
                page.http_status = render_data.get("http_status", 200)
                page.page_type = classify_page_type(page_path, page.title or "")
                page.screenshot_path = render_data.get("screenshot_path")
                page.thumbnail_path = render_data.get("viewport_screenshot_path")
                page.analysis_status = "completed"

                # Save PageSnapshot
                snapshot = PageSnapshot(
                    page_id=page.id,
                    viewport="desktop",
                    html_snapshot_path=render_data.get("html_snapshot_path"),
                    dom_tree_json=render_data.get("dom_tree", {}),
                    computed_styles_json=render_data.get("dom_tree", {}).get("tokensSummary", {}),
                    screenshot_path=render_data.get("screenshot_path"),
                    timing_data_json=render_data.get("timing", {}),
                    a11y_tree_json=render_data.get("a11y_tree", {}),
                    console_logs_json=render_data.get("console_logs", [])
                )
                db.add(snapshot)

                # Extract Design Tokens
                dom_summary = render_data.get("dom_tree", {})
                ds_tokens = design_analyzer.extract_design_system(dom_summary)
                for color_tok in ds_tokens.get("colors", []):
                    dt = DesignToken(
                        project_id=project_id,
                        token_type="color",
                        name=color_tok["name"],
                        value=color_tok["value"],
                        category=color_tok["role"],
                        usage_count=color_tok["usage_count"],
                        source_evidence=f"Computed CSS on page {page_path}",
                        confidence=color_tok["confidence"]
                    )
                    db.add(dt)

                for rad in ds_tokens.get("border_radii", []):
                    dt = DesignToken(
                        project_id=project_id,
                        token_type="radius",
                        name=rad["name"],
                        value=rad["value"],
                        category="radius",
                        usage_count=rad["usage_count"],
                        source_evidence=f"Computed CSS on page {page_path}",
                        confidence=rad["confidence"]
                    )
                    db.add(dt)

                # Detect UI Components
                elements = dom_summary.get("elements", [])
                detected_comps = component_detector.detect_components(elements)
                for comp_data in detected_comps:
                    comp = Component(
                        project_id=project_id,
                        name=comp_data["name"],
                        category=comp_data["category"],
                        bounding_box_json=comp_data["bounding_box"],
                        visual_properties_json=comp_data["visual_properties"],
                        dom_selector=comp_data["dom_selector"],
                        css_properties_json=comp_data["css_properties"],
                        interaction_desc=comp_data["interaction_desc"],
                        responsive_behavior=comp_data["responsive_behavior"],
                        reusability_score=comp_data["reusability_score"],
                        confidence_score=comp_data["confidence_score"]
                    )
                    db.add(comp)

                # Inventory Assets
                net_obs = render_data.get("network_observations", [])
                with open(render_data.get("html_snapshot_path", ""), "r", encoding="utf-8", errors="ignore") as hf:
                    html_content = hf.read()
                assets = asset_analyzer.extract_assets(current_url, html_content, net_obs)
                for ast in assets:
                    asset_obj = Asset(
                        project_id=project_id,
                        original_url=ast["original_url"],
                        mime_type=ast.get("mime_type"),
                        file_size=ast.get("file_size", 0),
                        width=ast.get("width"),
                        height=ast.get("height"),
                        category=ast.get("category", "image"),
                        download_status="observed"
                    )
                    db.add(asset_obj)

                # Record Network Observations & Infer API Contracts
                for obs in net_obs:
                    no = NetworkObservation(
                        project_id=project_id,
                        page_id=page.id,
                        url=obs["url"],
                        method=obs["method"],
                        status_code=obs["status_code"],
                        resource_type=obs["resource_type"],
                        content_type=obs.get("content_type"),
                        duration_ms=obs.get("duration_ms", 0.0),
                        headers_json=obs.get("headers", {}),
                        response_schema_json=obs.get("response_schema", {}),
                        is_api_candidate=obs.get("is_api_candidate", False)
                    )
                    db.add(no)

                contracts = network_analyzer.analyze_api_contracts(net_obs)
                for c in contracts:
                    api_c = ApiContract(
                        project_id=project_id,
                        endpoint_path=c["endpoint_path"],
                        method=c["method"],
                        summary=c["summary"],
                        request_schema_json=c["request_schema"],
                        response_schema_json=c["response_schema"],
                        status_codes_json=c["status_codes"],
                        auth_required=c["auth_required"],
                        confidence=c["confidence"],
                        source_evidence=c["source_evidence"]
                    )
                    db.add(api_c)

                # Discovered internal links for further crawling
                if current_depth < max_depth:
                    for link_item in render_data.get("discovered_links", []):
                        link_url = normalize_url(link_item["href"])
                        if link_url not in discovered_urls and len(discovered_urls) < max_pages:
                            # Verify internal domain match
                            if urlparse(link_url).netloc.lower() == parsed_url.netloc.lower():
                                discovered_urls.add(link_url)
                                queue.append((link_url, current_depth + 1))

            except Exception as page_err:
                import traceback
                tb = traceback.format_exc()
                logger.error(f"Error processing page {current_url}: {page_err}\n{tb}")
                scan.error_message = f"{current_url}: {page_err}\n{tb}"
                with open("debug_error.log", "a", encoding="utf-8") as ef:
                    ef.write(f"Error processing {current_url}: {page_err}\n{tb}\n{'='*50}\n")
                page.analysis_status = "failed"

            pages_processed += 1
            scan.pages_analyzed = pages_processed
            scan.pages_discovered = len(discovered_urls)
            await db.commit()

        if scan.status != "cancelled":
            scan.status = "completed"
            project.status = "completed"
        scan.completed_at = datetime.utcnow()
        await db.commit()

@router.get("", response_model=List[ScanJobRead])
async def list_scans(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScanJob).where(ScanJob.project_id == project_id).order_by(desc(ScanJob.created_at))
    )
    return result.scalars().all()

@router.post("/start", response_model=ScanJobRead, status_code=status.HTTP_202_ACCEPTED)
async def start_scan(
    project_id: str,
    data: ScanJobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.target_url:
        raise HTTPException(status_code=400, detail="Cannot crawl project without a target URL")

    # SSRF check
    is_valid, err_msg = security_service.validate_target_url(
        project.target_url,
        allow_private=(project.access_profile in ("test_env", "full"))
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Target URL Security Validation Failed: {err_msg}")

    scan = ScanJob(
        project_id=project_id,
        status="queued",
        mode=data.mode,
        max_pages=data.max_pages,
        max_depth=data.max_depth
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    background_tasks.add_task(
        execute_crawl_and_analysis_pipeline,
        scan.id,
        project_id,
        data.mode,
        data.max_pages,
        data.max_depth
    )

    return scan

@router.get("/{scan_id}", response_model=ScanJobRead)
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    scan = await db.get(ScanJob, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan job not found")
    return scan

@router.post("/{scan_id}/cancel", response_model=ScanJobRead)
async def cancel_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    scan = await db.get(ScanJob, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan job not found")

    scan.status = "cancelled"
    await db.commit()
    await db.refresh(scan)
    return scan
