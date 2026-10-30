# Changelog

All notable changes to the WebX-Ray AI platform are documented in this file.

## [1.0.0] - 2026-10-30

### Added
- **Intelligent Headless Crawler**: Multi-mode crawling (sitemap, internal links, dynamic SPA) with deduplication and route classification.
- **Playwright Browser Intelligence Engine**: Multi-viewport rendering (Desktop 1920x1080, Tablet 768x1024, Mobile 375x812), full-page screenshots, computed CSSOM extraction, and accessibility tree snapshots.
- **Design System Extraction Engine**: Automated synthesis of color tokens, typography hierarchy, 8pt spacing scales, border radii, and shadows (`design-system.json`).
- **Component Detection**: Automatic identification of Headers, Navbars, Footers, Buttons, Cards, Modals, and Forms with geometry and reusability scoring.
- **Network & API Intelligence**: Non-destructive request observation, sensitive header redaction, and inferred JSON schemas (`api-contracts.json`).
- **Static Backend & Database Analyzer**: Source repository AST analysis and SQL DDL parser generating Mermaid ER diagrams.
- **AI Synthesis Pipeline**: Multi-provider support (Gemini 2.5 Flash, OpenAI GPT-4o-mini, Claude, and offline deterministic local heuristics).
- **Master Blueprint Generator**: Standardized 15-file blueprint package generation and specialized prompts for Claude Code, Gemini, Antigravity, and Cursor.
- **Visual Reconstruction Verification Engine**: Side-by-side view, magenta pixel difference overlay, and SSIM similarity scoring.
- **Functional Testing Runner**: Automated Playwright regression suite checking route availability, console cleanliness, and responsive overflow.
- **Export Center**: Full project bundling into structured ZIP archives.
- **24 Professional Developer Screens**: Comprehensive dark UI with emerald and AI violet accents matching strict design specifications.
- **Automated Test Suite**: 15 automated test suites with 100% pass rate.
