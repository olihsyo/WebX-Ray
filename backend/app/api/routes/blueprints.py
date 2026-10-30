from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.database import get_db
from backend.app.models.entities import (
    Project, Blueprint, DiscoveredPage, Component, DesignToken, Asset, ApiContract, DatabaseSchema
)
from backend.app.schemas.all_schemas import BlueprintRead
from backend.app.services.blueprint_generator import blueprint_generator

router = APIRouter(prefix="/blueprints", tags=["Blueprints"])

@router.get("", response_model=List[BlueprintRead])
async def list_blueprints(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Blueprint).where(Blueprint.project_id == project_id).order_by(desc(Blueprint.created_at))
    )
    return result.scalars().all()

@router.post("/generate", response_model=BlueprintRead)
async def generate_blueprint(
    project_id: str,
    title: str = Body("Comprehensive Reconstruction Blueprint", embed=True),
    db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch all project evidence
    pages = (await db.execute(select(DiscoveredPage).where(DiscoveredPage.project_id == project_id))).scalars().all()
    components = (await db.execute(select(Component).where(Component.project_id == project_id))).scalars().all()
    tokens = (await db.execute(select(DesignToken).where(DesignToken.project_id == project_id))).scalars().all()
    assets = (await db.execute(select(Asset).where(Asset.project_id == project_id))).scalars().all()
    apis = (await db.execute(select(ApiContract).where(ApiContract.project_id == project_id))).scalars().all()
    db_schema = (await db.execute(select(DatabaseSchema).where(DatabaseSchema.project_id == project_id).order_by(desc(DatabaseSchema.created_at)))).scalars().first()

    design_system = {
        "colors": [{"name": t.name, "value": t.value, "role": t.category, "usage_count": t.usage_count, "confidence": t.confidence} for t in tokens if t.token_type == "color"],
        "typography": {"font_families": [{"family": "Inter", "raw": "Inter, sans-serif", "usage_count": 10}]},
        "border_radii": [{"name": t.name, "value": t.value, "usage_count": t.usage_count, "confidence": t.confidence} for t in tokens if t.token_type == "radius"]
    }

    pkg = blueprint_generator.generate_full_blueprint_package(
        project_name=project.name,
        target_url=project.target_url or "",
        pages=[{"path": p.path, "url": p.url, "title": p.title, "page_type": p.page_type, "http_status": p.http_status, "confidence_level": p.confidence_level} for p in pages],
        components=[{"name": c.name, "category": c.category, "dom_selector": c.dom_selector, "bounding_box": c.bounding_box_json, "visual_properties": c.visual_properties_json, "reusability_score": c.reusability_score, "confidence_score": c.confidence_score} for c in components],
        design_system=design_system,
        assets=[{"original_url": a.original_url, "category": a.category, "mime_type": a.mime_type} for a in assets],
        api_contracts=[{"method": a.method, "endpoint_path": a.endpoint_path, "response_schema": a.response_schema_json, "auth_required": a.auth_required} for a in apis],
        source_analysis={},
        db_schema={"er_diagram_mermaid": db_schema.er_diagram_mermaid if db_schema else ""}
    )

    bp = Blueprint(
        project_id=project_id,
        version=1,
        title=title,
        status="ready",
        complete_blueprint_md=pkg["complete_blueprint_md"],
        website_analysis_json=pkg["website_analysis_json"],
        implementation_roadmap_md=pkg["implementation_roadmap_md"],
        testing_requirements_md=pkg["testing_requirements_md"],
        reconstruction_master_prompt_md=pkg["reconstruction_master_prompt_md"],
        claude_prompt_md=pkg["claude_prompt_md"],
        gemini_prompt_md=pkg["gemini_prompt_md"],
        antigravity_prompt_md=pkg["antigravity_prompt_md"],
        cursor_prompt_md=pkg["cursor_prompt_md"],
        generic_prompt_md=pkg["generic_prompt_md"]
    )
    db.add(bp)
    await db.commit()
    await db.refresh(bp)
    return bp

@router.get("/{blueprint_id}", response_model=BlueprintRead)
async def get_blueprint(blueprint_id: str, db: AsyncSession = Depends(get_db)):
    bp = await db.get(Blueprint, blueprint_id)
    if not bp:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return bp
