import os
import zipfile
import pytest
from backend.app.services.blueprint_generator import blueprint_generator
from backend.app.services.export_service import export_service

def test_full_blueprint_package_generation():
    pages = [
        {"path": "/", "url": "https://example.com", "title": "Home", "page_type": "home", "http_status": 200, "confidence_level": 1.0},
        {"path": "/dashboard", "url": "https://example.com/dashboard", "title": "Dashboard", "page_type": "dashboard", "http_status": 200, "confidence_level": 0.95}
    ]
    components = [
        {"name": "SiteHeader", "category": "header", "dom_selector": "header", "bounding_box": {"x": 0, "y": 0, "width": 1920, "height": 64}, "visual_properties": {}, "reusability_score": 0.9, "confidence_score": 0.95}
    ]
    design_system = {
        "colors": [{"name": "primary", "value": "#24C78B", "role": "primary", "usage_count": 20, "confidence": 0.95}],
        "typography": {"font_families": [{"family": "Inter", "raw": "Inter", "usage_count": 50}]}
    }
    api_contracts = [
        {"method": "GET", "endpoint_path": "/api/v1/user", "response_schema": {"id": "str", "name": "str"}, "auth_required": True}
    ]

    pkg = blueprint_generator.generate_full_blueprint_package(
        project_name="Acme SaaS",
        target_url="https://example.com",
        pages=pages,
        components=components,
        design_system=design_system,
        assets=[],
        api_contracts=api_contracts,
        source_analysis={},
        db_schema={}
    )

    # Verify 15-file blueprint deliverables
    assert "# WebX-Ray AI Technical Reconstruction Blueprint" in pkg["complete_blueprint_md"]
    assert len(pkg["page_inventory_json"]) == 2
    assert len(pkg["component_tree_json"]) == 1
    assert "antigravity_prompt_md" in pkg
    assert "claude_prompt_md" in pkg
    assert "gemini_prompt_md" in pkg
    assert "cursor_prompt_md" in pkg
    assert "MANDATORY RECONSTRUCTION PROTOCOL" in pkg["antigravity_prompt_md"]

def test_zip_export_packaging(tmp_path):
    project_id = "test-proj-uuid-12345"
    pkg = {
        "complete_blueprint_md": "# Acme Blueprint",
        "website_analysis_json": {"pages_count": 2},
        "reconstruction_master_prompt_md": "Reconstruct carefully.",
        "implementation_roadmap_md": "## Phase 1",
        "testing_requirements_md": "## Tests",
        "page_inventory_json": [],
        "component_tree_json": [],
        "design_system_json": {},
        "api_contracts_json": [],
        "claude_prompt_md": "Claude instructions",
        "gemini_prompt_md": "Gemini instructions",
        "antigravity_prompt_md": "AGY instructions",
        "cursor_prompt_md": "Cursor instructions",
        "generic_prompt_md": "Generic instructions"
    }

    zip_file = export_service.create_zip_package(
        project_id=project_id,
        project_name="Acme Platform",
        blueprint_data=pkg,
        er_diagram="erDiagram\n    USERS ||--o{ POSTS : writes"
    )

    assert os.path.exists(zip_file)
    assert zip_file.endswith(".zip")

    # Validate inside ZIP
    with zipfile.ZipFile(zip_file, "r") as z:
        namelist = z.namelist()
        assert "complete-blueprint.md" in namelist
        assert "README.md" in namelist
        assert "ai-prompts/antigravity.md" in namelist
        assert "ai-prompts/claude-code.md" in namelist
        assert "analysis/design/design-system.json" in namelist
        assert "diagrams/database-er.mmd" in namelist
