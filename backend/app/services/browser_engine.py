import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, urljoin

from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Response, Request
from backend.app.config import settings
from backend.app.services.security import security_service

logger = logging.getLogger("webxray.browser_engine")

VIEWPORTS = {
    "desktop": {"width": 1920, "height": 1080},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812, "is_mobile": True, "has_touch": True},
}

# Injected JavaScript for DOM & Computed CSS extraction
DOM_EXTRACTION_SCRIPT = """
() => {
    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
    const elementsData = [];
    const colorCounts = {};
    const fontCounts = {};
    const spacingCounts = {};
    const radiusCounts = {};
    const shadowCounts = {};

    function parseColor(val) {
        if (!val || val === 'transparent' || val === 'rgba(0, 0, 0, 0)') return null;
        return val;
    }

    function recordToken(dict, val) {
        if (!val) return;
        dict[val] = (dict[val] || 0) + 1;
    }

    const walker = document.createTreeWalker(
        document.body || document.documentElement,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: function(node) {
                if (ignoredTags.has(node.tagName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode = walker.currentNode;
    let index = 0;
    const maxElements = 1200; // Guard against massive memory bloat

    while (currentNode && index < maxElements) {
        const el = currentNode;
        const rect = el.getBoundingClientRect();
        
        // Only inspect visible or layout-affecting elements
        if (rect.width > 0 && rect.height > 0) {
            const computed = window.getComputedStyle(el);
            
            const color = parseColor(computed.color);
            const bgColor = parseColor(computed.backgroundColor);
            const fontFamily = computed.fontFamily;
            const fontSize = computed.fontSize;
            const fontWeight = computed.fontWeight;
            const borderRadius = computed.borderRadius;
            const boxShadow = computed.boxShadow;
            const padding = `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`;

            recordToken(colorCounts, color);
            recordToken(colorCounts, bgColor);
            recordToken(fontCounts, fontFamily);
            if (borderRadius && borderRadius !== '0px') recordToken(radiusCounts, borderRadius);
            if (boxShadow && boxShadow !== 'none') recordToken(shadowCounts, boxShadow);

            // Compute unique selector
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector += `#${el.id}`;
            } else if (el.className && typeof el.className === 'string') {
                const classes = el.className.trim().split(/\\s+/).slice(0, 2).join('.');
                if (classes) selector += `.${classes}`;
            }

            elementsData.push({
                index: index,
                tagName: el.tagName.toLowerCase(),
                id: el.id || null,
                classes: typeof el.className === 'string' ? el.className.split(/\\s+/).filter(Boolean) : [],
                selector: selector,
                rect: {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                },
                styles: {
                    display: computed.display,
                    position: computed.position,
                    color: color,
                    backgroundColor: bgColor,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    fontWeight: fontWeight,
                    lineHeight: computed.lineHeight,
                    borderRadius: borderRadius,
                    boxShadow: boxShadow,
                    padding: padding,
                    margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
                    zIndex: computed.zIndex,
                    flexDirection: computed.flexDirection,
                    justifyContent: computed.justifyContent,
                    alignItems: computed.alignItems,
                    gridTemplateColumns: computed.gridTemplateColumns,
                },
                text: el.children.length === 0 ? (el.innerText || '').slice(0, 150).trim() : null
            });
            index++;
        }
        currentNode = walker.nextNode();
    }

    return {
        totalElementsScanned: index,
        elements: elementsData,
        tokensSummary: {
            colors: colorCounts,
            fonts: fontCounts,
            radii: radiusCounts,
            shadows: shadowCounts
        }
    };
}
"""

class BrowserEngine:
    def __init__(self):
        self._playwright = None
        self._browser: Optional[Browser] = None

    async def initialize(self):
        if not self._playwright:
            self._playwright = await async_playwright().start()
        if not self._browser:
            self._browser = await self._playwright.chromium.launch(
                headless=settings.HEADLESS_BROWSER,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ]
            )

    async def close(self):
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    async def render_page(
        self,
        project_id: str,
        page_id: str,
        url: str,
        viewport_name: str = "desktop",
        auth_config: Optional[Dict[str, Any]] = None,
        timeout_ms: int = 30000,
        allow_private: bool = False
    ) -> Dict[str, Any]:
        """
        Renders a page, records network events, console messages, timings,
        captures full-page and viewport screenshots, extracts DOM and computed CSS.
        """
        # SSRF Check
        is_valid, msg = security_service.validate_target_url(url, allow_private=allow_private)
        if not is_valid:
            raise ValueError(f"SSRF Security Violation: {msg}")

        # On Windows, if running under an event loop that does not implement subprocess transport
        # (e.g. SelectorEventLoop forced by uvicorn reload), run the browser in a ProactorEventLoop worker thread.
        try:
            loop = asyncio.get_running_loop()
            is_selector = sys.platform == "win32" and isinstance(loop, asyncio.SelectorEventLoop)
        except RuntimeError:
            is_selector = False

        if is_selector:
            logger.info("SelectorEventLoop detected on Windows; executing Playwright render in ProactorEventLoop thread.")
            def _run_in_proactor():
                p_loop = asyncio.windows_events.ProactorEventLoop()
                asyncio.set_event_loop(p_loop)
                try:
                    return p_loop.run_until_complete(
                        self._render_standalone(
                            project_id=project_id,
                            page_id=page_id,
                            url=url,
                            viewport_name=viewport_name,
                            auth_config=auth_config,
                            timeout_ms=timeout_ms
                        )
                    )
                finally:
                    p_loop.close()
            return await asyncio.to_thread(_run_in_proactor)

        await self.initialize()
        return await self._render_with_browser(
            browser=self._browser,
            project_id=project_id,
            page_id=page_id,
            url=url,
            viewport_name=viewport_name,
            auth_config=auth_config,
            timeout_ms=timeout_ms
        )

    async def _render_standalone(
        self,
        project_id: str,
        page_id: str,
        url: str,
        viewport_name: str = "desktop",
        auth_config: Optional[Dict[str, Any]] = None,
        timeout_ms: int = 30000
    ) -> Dict[str, Any]:
        """Run isolated Playwright instance on dedicated Proactor thread."""
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                headless=settings.HEADLESS_BROWSER,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ]
            )
            try:
                return await self._render_with_browser(
                    browser=browser,
                    project_id=project_id,
                    page_id=page_id,
                    url=url,
                    viewport_name=viewport_name,
                    auth_config=auth_config,
                    timeout_ms=timeout_ms
                )
            finally:
                await browser.close()

    async def _render_with_browser(
        self,
        browser: Browser,
        project_id: str,
        page_id: str,
        url: str,
        viewport_name: str = "desktop",
        auth_config: Optional[Dict[str, Any]] = None,
        timeout_ms: int = 30000
    ) -> Dict[str, Any]:
        viewport_cfg = VIEWPORTS.get(viewport_name, VIEWPORTS["desktop"])
        storage_dir = settings.get_storage_path(project_id, "screenshots")
        html_dir = settings.get_storage_path(project_id, "snapshots")

        screenshot_path = storage_dir / f"{page_id}_{viewport_name}.png"
        viewport_screenshot_path = storage_dir / f"{page_id}_{viewport_name}_viewport.png"
        html_path = html_dir / f"{page_id}_{viewport_name}.html"

        network_observations: List[Dict[str, Any]] = []
        console_logs: List[Dict[str, Any]] = []

        context: BrowserContext = await browser.new_context(
            viewport={"width": viewport_cfg["width"], "height": viewport_cfg["height"]},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WebXRay/1.0",
            bypass_csp=True,
            ignore_https_errors=True
        )

        page: Page = await context.new_page()

        # Listen to console logs
        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": security_service.sanitize_content(msg.text),
            "location": msg.location,
            "timestamp": time.time()
        }))

        # Listen to network requests & responses
        async def on_response(response: Response):
            try:
                req: Request = response.request
                res_url = response.url
                is_api = any(part in res_url.lower() for part in ["/api/", "/v1/", "/v2/", "/graphql", ".json"]) or "application/json" in (response.headers.get("content-type", ""))
                
                # Redact headers
                clean_headers = security_service.redact_headers(dict(response.headers))

                # Infer JSON schema if available
                res_schema = {}
                if is_api:
                    try:
                        data = await response.json()
                        if isinstance(data, dict):
                            res_schema = {k: type(v).__name__ for k, v in list(data.items())[:20]}
                        elif isinstance(data, list) and data and isinstance(data[0], dict):
                            res_schema = {"items": {k: type(v).__name__ for k, v in list(data[0].items())[:20]}}
                    except Exception:
                        pass

                network_observations.append({
                    "url": res_url,
                    "method": req.method,
                    "status_code": response.status,
                    "resource_type": req.resource_type,
                    "content_type": response.headers.get("content-type"),
                    "duration_ms": 0.0,
                    "headers": clean_headers,
                    "response_schema": res_schema,
                    "is_api_candidate": is_api
                })
            except Exception as e:
                logger.debug(f"Error recording network response: {e}")

        page.on("response", on_response)

        start_time = time.time()
        http_status = 200

        try:
            # Navigate to page
            res = await page.goto(url, wait_until="networkidle", timeout=timeout_ms)
            if res:
                http_status = res.status
            
            # Wait short time for dynamic client renders (React/Vue/Svelte)
            await page.wait_for_timeout(1000)

            # Optional Authenticated Test Profile Login
            if auth_config and auth_config.get("login_url") and url == auth_config.get("login_url"):
                try:
                    if auth_config.get("username") and auth_config.get("password"):
                        # Fill standard input selectors
                        user_input = page.locator("input[type='text'], input[type='email'], input[name*='user']").first
                        pass_input = page.locator("input[type='password']").first
                        if await user_input.count() > 0 and await pass_input.count() > 0:
                            await user_input.fill(auth_config["username"])
                            await pass_input.fill(auth_config["password"])
                            submit_btn = page.locator("button[type='submit'], input[type='submit']").first
                            if await submit_btn.count() > 0:
                                await submit_btn.click()
                                await page.wait_for_timeout(2000)
                except Exception as auth_err:
                    logger.warning(f"Auth login attempt error: {auth_err}")

            # Capture screenshots
            await page.screenshot(path=str(screenshot_path), full_page=True)
            await page.screenshot(path=str(viewport_screenshot_path), full_page=False)

            # Extract full HTML
            html_content = await page.content()
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)

            # Extract DOM hierarchy and computed styles
            dom_data = await page.evaluate(DOM_EXTRACTION_SCRIPT)

            # Extract Accessibility tree
            a11y_tree = {}
            try:
                a11y_tree = await page.accessibility.snapshot() or {}
            except Exception as a11y_err:
                logger.debug(f"A11y snapshot exception: {a11y_err}")

            # Collect timing
            timing = {
                "total_render_duration_ms": round((time.time() - start_time) * 1000, 2),
                "timestamp": time.time()
            }

            # Discover links on page for crawler
            links = await page.evaluate("""
                () => Array.from(document.querySelectorAll('a[href]'))
                    .map(a => ({
                        href: a.href,
                        text: (a.innerText || '').trim(),
                        title: a.getAttribute('title') || ''
                    }))
                    .filter(l => l.href.startsWith('http'))
            """)

            page_title = await page.title()

            return {
                "http_status": http_status,
                "title": page_title,
                "screenshot_path": str(screenshot_path),
                "viewport_screenshot_path": str(viewport_screenshot_path),
                "html_snapshot_path": str(html_path),
                "dom_tree": dom_data,
                "a11y_tree": a11y_tree,
                "timing": timing,
                "console_logs": console_logs,
                "network_observations": network_observations,
                "discovered_links": links
            }

        finally:
            await context.close()

browser_engine = BrowserEngine()
