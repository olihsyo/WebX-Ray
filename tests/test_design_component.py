import pytest
from backend.app.services.design_analyzer import design_analyzer
from backend.app.services.component_detector import component_detector

def test_design_system_extraction():
    dom_summary = {
        "tokensSummary": {
            "colors": {
                "rgb(16, 21, 29)": 45,
                "rgb(36, 199, 139)": 20,
                "rgb(241, 245, 249)": 80
            },
            "fonts": {
                "'Inter', sans-serif": 90,
                "'JetBrains Mono', monospace": 15
            },
            "radii": {
                "12px": 25,
                "8px": 10
            },
            "shadows": {
                "0 4px 6px -1px rgba(0, 0, 0, 0.1)": 12
            }
        }
    }
    ds = design_analyzer.extract_design_system(dom_summary)
    assert len(ds["colors"]) == 3
    assert ds["typography"]["font_families"][0]["family"] == "Inter"
    assert len(ds["border_radii"]) == 2
    assert "sm" in ds["breakpoints"]

    md_report = design_analyzer.generate_markdown_report(ds)
    assert "# Extracted Design System Specifications" in md_report
    assert "Inter" in md_report

def test_component_detection():
    elements = [
        {
            "tagName": "header",
            "classes": ["site-header", "navbar"],
            "selector": "header.site-header",
            "rect": {"x": 0, "y": 0, "width": 1920, "height": 64},
            "styles": {"display": "flex", "backgroundColor": "#171F2B"},
            "text": "Acme SaaS"
        },
        {
            "tagName": "button",
            "classes": ["btn", "btn-primary"],
            "selector": "button.btn",
            "rect": {"x": 100, "y": 200, "width": 120, "height": 40},
            "styles": {"display": "inline-flex", "backgroundColor": "#24C78B"},
            "text": "Get Started"
        },
        {
            "tagName": "footer",
            "classes": ["site-footer"],
            "selector": "footer.site-footer",
            "rect": {"x": 0, "y": 1000, "width": 1920, "height": 120},
            "styles": {"display": "block", "backgroundColor": "#10151D"},
            "text": "Copyright 2026"
        }
    ]
    comps = component_detector.detect_components(elements)
    cats = [c["category"] for c in comps]
    assert "header" in cats
    assert "button" in cats
    assert "footer" in cats
    assert len(comps) == 3
