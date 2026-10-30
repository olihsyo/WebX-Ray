import pytest
from backend.app.services.crawler import normalize_url, classify_page_type, crawler_service

def test_url_normalization():
    assert normalize_url("https://example.com/") == "https://example.com"
    assert normalize_url("https://example.com/pricing#features") == "https://example.com/pricing"
    assert normalize_url("HTTPS://EXAMPLE.COM/about/") == "https://example.com/about"
    assert normalize_url("https://example.com/search?q=test#top") == "https://example.com/search?q=test"

def test_page_classification():
    assert classify_page_type("/", "Home") == "home"
    assert classify_page_type("/login", "Sign In") == "auth"
    assert classify_page_type("/app/dashboard", "User Portal") == "dashboard"
    assert classify_page_type("/pricing", "Plans & Pricing") == "landing"
    assert classify_page_type("/blog/posts", "Latest Articles") == "list"
    assert classify_page_type("/products/42", "Product Detail") == "detail"

def test_internal_link_extraction():
    html = """
    <html>
        <body>
            <a href="/about">About Us</a>
            <a href="https://example.com/pricing">Pricing</a>
            <a href="https://external.com/blog">External</a>
            <a href="mailto:test@example.com">Email</a>
            <a href="#section">Jump</a>
        </body>
    </html>
    """
    links = crawler_service.extract_internal_links("https://example.com/", html)
    paths = [l["path"] for l in links]
    assert "/about" in paths
    assert "/pricing" in paths
    assert "/blog" not in paths
    assert len(links) == 2
