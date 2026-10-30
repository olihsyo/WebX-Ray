import hashlib
import mimetypes
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Any
from bs4 import BeautifulSoup

class AssetAnalyzer:
    @staticmethod
    def extract_assets(base_url: str, html: str, network_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extracts and inventories all public images, icons, SVGs, and fonts with deduplication."""
        assets: Dict[str, Dict[str, Any]] = {}

        soup = BeautifulSoup(html, "html.parser")

        # 1. Image tags
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src")
            if src:
                full_url = urljoin(base_url, src)
                category = "image"
                if full_url.lower().endswith(".svg") or "svg" in full_url.lower():
                    category = "svg"
                
                assets[full_url] = {
                    "original_url": full_url,
                    "mime_type": mimetypes.guess_type(full_url)[0] or "image/png",
                    "category": category,
                    "width": int(img.get("width")) if img.get("width") and img.get("width").isdigit() else None,
                    "height": int(img.get("height")) if img.get("height") and img.get("height").isdigit() else None,
                    "file_size": 0,
                    "download_status": "identified"
                }

        # 2. Favicons & Icons
        for link in soup.find_all("link", rel=lambda r: r and any(k in str(r).lower() for k in ["icon", "apple-touch-icon"])):
            href = link.get("href")
            if href:
                full_url = urljoin(base_url, href)
                assets[full_url] = {
                    "original_url": full_url,
                    "mime_type": link.get("type") or "image/x-icon",
                    "category": "icon",
                    "width": 32,
                    "height": 32,
                    "file_size": 0,
                    "download_status": "identified"
                }

        # 3. Network observed images/fonts
        for obs in network_events:
            url = obs.get("url", "")
            res_type = obs.get("resource_type", "")
            content_type = obs.get("content_type", "") or ""

            if res_type in ("image", "font", "media") or any(k in content_type for k in ["image", "font", "video"]):
                cat = "image"
                if "font" in res_type or "font" in content_type:
                    cat = "font"
                elif "svg" in content_type:
                    cat = "svg"
                elif "video" in content_type:
                    cat = "video"

                if url not in assets:
                    assets[url] = {
                        "original_url": url,
                        "mime_type": content_type or mimetypes.guess_type(url)[0],
                        "category": cat,
                        "width": None,
                        "height": None,
                        "file_size": 0,
                        "download_status": "observed"
                    }

        return list(assets.values())

asset_analyzer = AssetAnalyzer()
