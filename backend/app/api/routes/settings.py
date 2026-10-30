from typing import Dict, Any
from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_system_settings() -> Dict[str, Any]:
    return {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "has_anthropic_key": bool(settings.ANTHROPIC_API_KEY),
        "ssrf_protection": settings.SSRF_PROTECTION,
        "allow_private_ips": settings.ALLOW_PRIVATE_IPS,
        "headless_browser": settings.HEADLESS_BROWSER,
        "default_max_pages": settings.DEFAULT_MAX_PAGES,
        "default_max_depth": settings.DEFAULT_MAX_DEPTH
    }

@router.post("")
async def update_system_settings(payload: Dict[str, Any]) -> Dict[str, Any]:
    if "gemini_api_key" in payload and payload["gemini_api_key"]:
        settings.GEMINI_API_KEY = payload["gemini_api_key"]
    if "openai_api_key" in payload and payload["openai_api_key"]:
        settings.OPENAI_API_KEY = payload["openai_api_key"]
    if "anthropic_api_key" in payload and payload["anthropic_api_key"]:
        settings.ANTHROPIC_API_KEY = payload["anthropic_api_key"]
    if "default_ai_provider" in payload:
        settings.DEFAULT_AI_PROVIDER = payload["default_ai_provider"]
    if "allow_private_ips" in payload:
        settings.ALLOW_PRIVATE_IPS = bool(payload["allow_private_ips"])

    return await get_system_settings()
