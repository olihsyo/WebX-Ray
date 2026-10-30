import asyncio
import logging
import re
from urllib.parse import urlparse, urljoin, urldefrag
from typing import Dict, List, Set, Optional, Tuple, Any
from bs4 import BeautifulSoup
import httpx

from backend.app.config import settings
from backend.app.services.security import security_service

logger = logging.getLogger("webxray.crawler")

COMMON_SITEMAP_PATHS = [
    "/sitemap.xml",
    "/sitemap_index.xml",
    "/sitemap/sitemap.xml",
    "/sitemaps.xml"
]

def normalize_url(url: str) -> str:
    """Normalize URL by stripping fragments and trailing slashes for consistent deduplication."""
    clean, _ = urldefrag(url.strip())
    parsed = urlparse(clean)
    path = parsed.path.rstrip('/')
    
    # Reassemble
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    query = parsed.query
    return f"{scheme}://{netloc}{path}{'?' + query if query else ''}"

def classify_page_type(path: str, title: str = "", html_text: str = "") -> str:
    """Classifies the functional role of a page using route patterns and content clues."""
    path_lower = path.lower()
    title_lower = title.lower()

    if path_lower in ("", "/", "/home", "/index", "/index.html"):
        return "home"
    if any(k in path_lower for k in ["/login", "/signin", "/auth", "/register", "/signup", "/forgot-password"]):
        return "auth"
    if any(k in path_lower for k in ["/dashboard", "/app", "/console", "/overview", "/portal"]):
        return "dashboard"
    if any(k in path_lower for k in ["/pricing", "/plans", "/features", "/about", "/contact", "/landing"]):
        return "landing"
    if re.search(r'/\d+$|/[a-f0-9\-]{8,}$', path_lower):
        return "detail"
    if any(k in path_lower for k in ["/products", "/items", "/articles", "/posts", "/blog", "/catalog", "/list"]):
        return "list"
    if "404" in title_lower or "not found" in title_lower:
        return "not_found"

    return "standard"

class IntelligentCrawler:
    def __init__(self):
        self.client = httpx.AsyncClient(
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebXRay-Crawler/1.0"},
            timeout=15.0,
            follow_redirects=True,
            verify=False
        )

    async def fetch_robots_txt(self, base_url: str) -> Dict[str, Any]:
        """Parses robots.txt to find disallowed paths and linked sitemaps."""
        parsed = urlparse(base_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        disallowed: List[str] = []
        sitemaps: List[str] = []

        try:
            res = await self.client.get(robots_url)
            if res.status_code == 200:
                for line in res.text.splitlines():
                    line = line.strip()
                    if line.lower().startswith("disallow:"):
                        part = line.split(":", 1)[1].strip()
                        if part:
                            disallowed.append(part)
                    elif line.lower().startswith("sitemap:"):
                        smap = line.split(":", 1)[1].strip()
                        if smap:
                            sitemaps.append(smap)
        except Exception as e:
            logger.debug(f"robots.txt lookup failed: {e}")

        return {"disallowed": disallowed, "sitemaps": sitemaps}

    async def discover_sitemaps(self, base_url: str, robots_sitemaps: List[str]) -> List[str]:
        """Discovers sitemap URLs via robots.txt and standard endpoints."""
        candidates = list(robots_sitemaps)
        parsed = urlparse(base_url)
        for path in COMMON_SITEMAP_PATHS:
            full = f"{parsed.scheme}://{parsed.netloc}{path}"
            if full not in candidates:
                candidates.append(full)

        valid_sitemaps: List[str] = []
        for s_url in candidates:
            try:
                res = await self.client.get(s_url)
                if res.status_code == 200 and ("xml" in res.headers.get("content-type", "") or res.text.strip().startswith("<?xml")):
                    valid_sitemaps.append(s_url)
            except Exception:
                pass
        return valid_sitemaps

    async def parse_sitemap_urls(self, sitemap_url: str, max_urls: int = 100) -> List[str]:
        """Extracts location URLs from an XML sitemap."""
        urls: List[str] = []
        try:
            res = await self.client.get(sitemap_url)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, "xml")
                # Handle standard sitemap
                for loc in soup.find_all("loc"):
                    u = loc.text.strip()
                    if u and u not in urls:
                        urls.append(normalize_url(u))
                    if len(urls) >= max_urls:
                        break
        except Exception as e:
            logger.warning(f"Error parsing sitemap {sitemap_url}: {e}")
        return urls

    def extract_internal_links(self, base_url: str, html: str) -> List[Dict[str, str]]:
        """Parses HTML and finds all valid internal hyperlinks."""
        parsed_base = urlparse(base_url)
        base_domain = parsed_base.netloc.lower()
        discovered = []
        seen = set()

        try:
            soup = BeautifulSoup(html, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                    continue

                full_url = urljoin(base_url, href)
                norm_url = normalize_url(full_url)
                parsed_link = urlparse(norm_url)

                # Check internal domain match
                if parsed_link.netloc.lower() == base_domain and norm_url not in seen:
                    seen.add(norm_url)
                    discovered.append({
                        "url": norm_url,
                        "path": parsed_link.path or "/",
                        "text": a.get_text(strip=True)[:100],
                        "discovery_method": "internal_link"
                    })
        except Exception as e:
            logger.debug(f"Error extracting links: {e}")

        return discovered

crawler_service = IntelligentCrawler()
