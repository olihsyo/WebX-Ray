import json
from typing import Dict, List, Any

class BlueprintGenerator:
    @staticmethod
    def generate_full_blueprint_package(
        project_name: str,
        target_url: str,
        pages: List[Dict[str, Any]],
        components: List[Dict[str, Any]],
        design_system: Dict[str, Any],
        assets: List[Dict[str, Any]],
        api_contracts: List[Dict[str, Any]],
        source_analysis: Dict[str, Any],
        db_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synthesizes all discovered technical evidence into the standardized
        15-file WebX-Ray AI Reconstruction Blueprint Package.
        """

        # 1. Page Inventory JSON
        page_inventory = [
            {
                "path": p.get("path"),
                "url": p.get("url"),
                "title": p.get("title"),
                "page_type": p.get("page_type"),
                "http_status": p.get("http_status"),
                "confidence": p.get("confidence_level", 1.0)
            }
            for p in pages
        ]

        # 2. Component Tree JSON
        component_tree = [
            {
                "name": c.get("name"),
                "category": c.get("category"),
                "dom_selector": c.get("dom_selector"),
                "bounding_box": c.get("bounding_box"),
                "visual_properties": c.get("visual_properties"),
                "reusability_score": c.get("reusability_score", 0.5),
                "confidence_score": c.get("confidence_score", 0.8)
            }
            for c in components
        ]

        # 3. Complete Blueprint Markdown
        complete_blueprint_md = f"""# WebX-Ray AI Technical Reconstruction Blueprint
## Target: {project_name} ({target_url or 'Source Code Repository'})

### Executive Reconstruction Summary
This comprehensive blueprint provides evidence-backed architectural instructions for AI coding agents to faithfully reconstruct the target application. All specifications are derived from verified browser DOM inspection, computed CSS analysis, non-destructive network observation, and owner-provided source models.

---

### 1. Site Hierarchy & Discovered Pages ({len(pages)} Total)
| Route | Page Type | Status | Confidence |
|---|---|---|---|
"""
        for p in pages:
            complete_blueprint_md += f"| `{p.get('path')}` | `{p.get('page_type')}` | {p.get('http_status')} | {int(p.get('confidence_level', 1.0)*100)}% |\n"

        complete_blueprint_md += f"""
---

### 2. Component Architecture ({len(components)} Identified Reusable Components)
The application user interface is constructed from the following modular components:
"""
        for c in components:
            complete_blueprint_md += f"- **{c.get('name')}** (`{c.get('category')}`): Selector `{c.get('dom_selector')}`. Reusability: {int(c.get('reusability_score', 0.5)*100)}%.\n"

        complete_blueprint_md += f"""
---

### 3. Design System & Tokens
- **Colors**: {len(design_system.get('colors', []))} verified color tokens extracted from browser CSS.
- **Typography**: Primary font family `{design_system.get('typography', {}).get('font_families', [{}])[0].get('family', 'Inter') if design_system.get('typography', {}).get('font_families') else 'Inter'}`.
- **Layout**: Fluid responsive design with standard 8pt spacing grid.

---

### 4. API & Backend Contracts ({len(api_contracts)} Endpoints)
"""
        for a in api_contracts:
            complete_blueprint_md += f"- `{a.get('method')}` **{a.get('endpoint_path')}**: Schema keys: `{list(a.get('response_schema', {}).keys())}`. Auth: {a.get('auth_required')}.\n"

        complete_blueprint_md += """
---

### 5. Non-Invention & Verification Rules
1. **Never invent missing endpoints or private business logic**: When observable API responses are incomplete, supply clearly commented mock data handlers.
2. **Preserve exact responsive behavior**: Verify layouts across Desktop (1920x1080), Tablet (768x1024), and Mobile (375x812).
3. **Follow the Design Tokens strictly**: Do not introduce ad-hoc CSS colors or random margins.
"""

        # 4. Implementation Roadmap
        roadmap_md = f"""# Implementation Roadmap: {project_name}

## Phase 1: Foundation & Design System Setup
- Initialize clean workspace matching the specified stack.
- Configure Tailwind CSS tokens matching `design-system.json`.
- Implement responsive base shell, sidebar, and navigation header.

## Phase 2: Core Components Development
- Reconstruct the detected component tree in `components/`.
- Validate atomic buttons, cards, forms, and dialogs.

## Phase 3: Route & Page Assembly
- Assemble the {len(pages)} identified routes in `page-inventory.json`.
- Implement client-side routing and layout nesting.

## Phase 4: API & State Integration
- Wire API contracts from `api-contracts.json`.
- Provide fallback mock data handlers for external services.

## Phase 5: Verification & Visual Regression
- Compare reconstructed page screenshots against original evidence.
- Verify across Desktop, Tablet, and Mobile viewports.
"""

        # 5. Testing Requirements
        testing_requirements_md = f"""# Testing & Verification Requirements: {project_name}

1. **Visual Fidelity Verification**:
   - Original vs Reconstructed screenshot SSIM similarity score must exceed 0.90.
   - Header, main content container, and navigation bounding geometries must match.

2. **Functional Integrity**:
   - All client-side navigation links must transition cleanly without 404 errors.
   - Form controls must validate inputs.
   - Modals and dropdowns must open and close correctly.

3. **Responsive Viewport Conformance**:
   - Desktop: 1920x1080 (full layout)
   - Tablet: 768x1024 (adaptive layout)
   - Mobile: 375x812 (collapsible navigation drawer)
"""

        # 6. Master Prompt Generator for AI Coding Agents
        def make_agent_prompt(agent_name: str) -> str:
            return f"""# Master Reconstruction Prompt for {agent_name}
# Project: {project_name}

You are an expert autonomous software engineer tasked with accurately reconstructing **{project_name}**.

## MANDATORY RECONSTRUCTION PROTOCOL:
1. **Inspect Blueprint First**: Read `complete-blueprint.md`, `page-inventory.json`, and `design-system.json` before writing any code.
2. **Fidelity to Evidence**: Reproduce the page hierarchy, components, and design tokens exactly as documented.
3. **Strict Truthfulness**: NEVER invent unavailable backend logic or proprietary algorithms. Where API behavior is inferred or unavailable, implement clean, well-typed mock service providers.
4. **Responsive Precision**: Ensure desktop (1920x1080), tablet (768x1024), and mobile (375x812) viewports render properly.
5. **Quality Verification**: Execute automated tests and screenshot comparisons to verify reconstruction accuracy.

Begin reconstruction now by setting up the project foundation.
"""

        return {
            "complete_blueprint_md": complete_blueprint_md,
            "website_analysis_json": {
                "project_name": project_name,
                "target_url": target_url,
                "pages_count": len(pages),
                "components_count": len(components),
                "design_tokens_count": len(design_system.get("colors", [])),
                "api_contracts_count": len(api_contracts)
            },
            "page_inventory_json": page_inventory,
            "component_tree_json": component_tree,
            "design_system_json": design_system,
            "asset_manifest_json": assets,
            "api_contracts_json": api_contracts,
            "implementation_roadmap_md": roadmap_md,
            "testing_requirements_md": testing_requirements_md,
            "reconstruction_master_prompt_md": make_agent_prompt("Generic AI Coding Agent"),
            "claude_prompt_md": make_agent_prompt("Claude Code"),
            "gemini_prompt_md": make_agent_prompt("Gemini CLI / Agent"),
            "antigravity_prompt_md": make_agent_prompt("Antigravity AI Agent"),
            "cursor_prompt_md": make_agent_prompt("Cursor AI Composer"),
            "generic_prompt_md": make_agent_prompt("Autonomous Coding Agent")
        }

blueprint_generator = BlueprintGenerator()
