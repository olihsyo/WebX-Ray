import re
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Optional
from backend.app.config import settings

# Sensitive header names to redact
SENSITIVE_HEADERS = {
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "api-key",
    "x-auth-token",
    "proxy-authorization",
    "session",
    "x-csrf-token",
    "x-xsrf-token",
}

# Regex patterns for common secret keys and tokens
SECRET_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|secret|password|token|bearer|auth)["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?'), r'\1="[REDACTED]"'),
    (re.compile(r'Bearer\s+[a-zA-Z0-9_\-\.]{15,}'), 'Bearer [REDACTED]'),
    (re.compile(r'(?i)AIza[0-9A-Za-z\-_]{35}'), '[REDACTED_GEMINI_KEY]'),
    (re.compile(r'sk-[a-zA-Z0-9]{20,}'), '[REDACTED_OPENAI_KEY]'),
]

# RFC 6052 Well-Known Prefix for NAT64 (IPv4/IPv6 translation)
NAT64_WELL_KNOWN_PREFIX = ipaddress.IPv6Network("64:ff9b::/96")

class SecurityService:
    @classmethod
    def is_private_ip(cls, ip_str: str) -> bool:
        """Check if an IP is private, loopback, link-local, or reserved."""
        try:
            ip = ipaddress.ip_address(ip_str)

            # Handle RFC 6052 NAT64 Well-Known Prefix (64:ff9b::/96)
            # which ISPs and cellular networks use for DNS64 translation of public IPv4 addresses.
            if isinstance(ip, ipaddress.IPv6Address) and ip in NAT64_WELL_KNOWN_PREFIX:
                embedded_v4 = ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF)
                return cls.is_private_ip(str(embedded_v4))

            return (
                ip.is_loopback
                or ip.is_private
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
                or ip.is_unspecified
            )
        except ValueError:
            return True

    @classmethod
    def validate_target_url(
        cls,
        url: str,
        allow_private: Optional[bool] = None,
        allowed_domains: Optional[list[str]] = None
    ) -> Tuple[bool, str]:
        """
        SSRF Protection:
        1. Validate URL syntax and protocol (http/https only).
        2. Resolve DNS hostname and ensure it does not resolve to private/loopback IPs.
        3. Check against optional allowed domains list.
        """
        if not url:
            return False, "Target URL is empty."

        parsed = urlparse(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False, f"Invalid URL scheme '{parsed.scheme}'. Only http and https are allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: missing hostname."

        # Domain whitelist check if configured
        effective_allowed = allowed_domains if allowed_domains is not None else settings.ALLOWED_DOMAINS
        if effective_allowed and hostname not in effective_allowed:
            return False, f"Domain '{hostname}' is not in the allowed domains list."

        # Check if private IPs are explicitly allowed (e.g. for local test environments)
        effective_allow_private = allow_private if allow_private is not None else settings.ALLOW_PRIVATE_IPS
        if effective_allow_private:
            return True, "URL allowed (private IP access enabled for authorized profile)."

        # DNS resolution check for SSRF prevention
        try:
            # Resolve both IPv4 and IPv6
            addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
            for family, _, _, _, sockaddr in addr_info:
                ip_address = sockaddr[0]
                if cls.is_private_ip(ip_address):
                    return False, f"Access to private or local network address ({ip_address}) is forbidden by SSRF protection."
        except socket.gaierror:
            return False, f"Unable to resolve hostname '{hostname}'."
        except Exception as e:
            return False, f"URL validation error: {str(e)}"

        return True, "Valid target URL."

    @staticmethod
    def redact_headers(headers: dict) -> dict:
        """Redact sensitive authorization, cookies, and tokens from recorded network traffic."""
        redacted = {}
        for k, v in headers.items():
            k_lower = str(k).lower()
            if any(s in k_lower for s in SENSITIVE_HEADERS):
                redacted[k] = "[REDACTED_BY_SECURITY_POLICY]"
            else:
                redacted[k] = str(v)
        return redacted

    @classmethod
    def sanitize_content(cls, content: str) -> str:
        """Mask potential API keys and tokens from logs or public blueprint outputs."""
        if not content:
            return content
        sanitized = content
        for pattern, replacement in SECRET_PATTERNS:
            sanitized = pattern.sub(replacement, sanitized)
        return sanitized

security_service = SecurityService()
