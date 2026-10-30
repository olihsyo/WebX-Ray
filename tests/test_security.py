import pytest
from backend.app.services.security import security_service

def test_ssrf_private_ip_blocking():
    # 127.0.0.1 loopback
    valid, msg = security_service.validate_target_url("http://127.0.0.1:8080/admin", allow_private=False)
    assert not valid
    assert "forbidden by SSRF protection" in msg

    # localhost
    valid, msg = security_service.validate_target_url("http://localhost:3000", allow_private=False)
    assert not valid
    assert "forbidden by SSRF protection" in msg

    # Invalid scheme
    valid, msg = security_service.validate_target_url("ftp://example.com/file")
    assert not valid
    assert "scheme" in msg

def test_ssrf_allowed_when_explicitly_configured():
    # When test environment profile permits private IP
    valid, msg = security_service.validate_target_url("http://127.0.0.1:8000/api", allow_private=True)
    assert valid

def test_header_sanitization():
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer secret-token-12345",
        "Cookie": "session_id=abcdef123456",
        "X-Api-Key": "my-secret-key-xyz",
        "User-Agent": "WebXRay/1.0"
    }
    redacted = security_service.redact_headers(headers)
    assert redacted["Content-Type"] == "application/json"
    assert redacted["User-Agent"] == "WebXRay/1.0"
    assert redacted["Authorization"] == "[REDACTED_BY_SECURITY_POLICY]"
    assert redacted["Cookie"] == "[REDACTED_BY_SECURITY_POLICY]"
    assert redacted["X-Api-Key"] == "[REDACTED_BY_SECURITY_POLICY]"

def test_content_secret_masking():
    raw_text = 'Use your key AIzaSyD4b5c6e7f8g9h0i1j2k3l4m5n6o7p8q9r and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz'
    sanitized = security_service.sanitize_content(raw_text)
    assert "AIzaSy" not in sanitized
    assert "[REDACTED_GEMINI_KEY]" in sanitized
    assert "[REDACTED]" in sanitized

def test_ssrf_nat64_handling():
    # Public IPv4 in NAT64 (RFC 6052 Well-Known Prefix 64:ff9b::/96)
    assert not security_service.is_private_ip("64:ff9b::d8c6:4f01")  # 216.198.79.1
    # Loopback IPv4 embedded in NAT64
    assert security_service.is_private_ip("64:ff9b::7f00:0001")     # 127.0.0.1
    # Private 10.x.x.x IPv4 embedded in NAT64
    assert security_service.is_private_ip("64:ff9b::0a00:0001")     # 10.0.0.1
    # Private 192.168.x.x IPv4 embedded in NAT64
    assert security_service.is_private_ip("64:ff9b::c0a8:0101")     # 192.168.1.1

