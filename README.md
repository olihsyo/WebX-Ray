# WebX-Ray AI — Website Intelligence & AI Reconstruction Platform

> **WebX-Ray AI** is a production-quality Website Intelligence and AI Reconstruction Platform designed to deeply analyze authorized websites, extract visual design systems and component hierarchies, observe network contracts, parse backend architectures, and generate comprehensive, evidence-backed technical blueprints consumed by AI coding agents (Claude Code, Gemini, Antigravity, Cursor, and custom agents).

---

## ⚡ Core Capabilities

- **Intelligent Headless Crawler**: Full Playwright & Chromium browser engine extracting real DOM hierarchies, computed CSS styles, and accessibility trees across Desktop (1920x1080), Tablet (768x1024), and Mobile (375x812) viewports.
- **Design System Extraction**: Synthesizes verified color palettes, typography scales, 8pt spacing systems, border radii, and elevation shadows into standard tokens (`design-system.json` & `design-system.md`).
- **Component Detection**: Automatically identifies atomic and composite visual components (Headers, Navbars, Footers, Buttons, Cards, Modals, Forms) with bounding geometry, CSS selectors, and reusability scores.
- **API & Network Intelligence**: Non-destructively observes browser network events, infers JSON request/response schemas, categorizes REST endpoints, and redacts sensitive credentials.
- **Backend & Database Modeling**: Statically inspects owner-provided source repositories and parses SQL DDL (PostgreSQL, MySQL, SQLite) to produce Mermaid ER diagrams and relational models without executing untrusted code.
- **AI Synthesis Layer**: Multi-provider intelligence pipeline supporting Google Gemini, OpenAI, Claude, and 100% offline deterministic heuristic synthesis.
- **Visual Reconstruction Verification**: Image comparison engine calculating perceptual SSIM, pixel discrepancy percentages, and actionable correction instructions.
- **Complete Reconstruction Package Export**: One-click generation of the standardized 15-file blueprint bundle packaged into a structured ZIP archive.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router DOM, Zustand, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Alembic, SQLite / PostgreSQL |
| **Browser Engine** | Playwright, Chromium Headless Sandbox, Accessibility Tree Inspector, CSSOM Extractor |
| **Analysis** | BeautifulSoup4, lxml, tinycss2, cssselect2, Pillow (SSIM & Pixel Diff) |
| **AI Providers** | Google Gemini 2.5 Flash, OpenAI GPT-4o-mini, Anthropic Claude, Offline Heuristic Engine |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.12+ (Python 3.13 supported)
- Node.js 18+ (Node.js 24 supported) & npm
- Chromium headless browser (installed via Playwright)

### 2. Backend Setup
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# Install Playwright browser binaries
playwright install chromium

# Launch the FastAPI backend server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The REST API and interactive Swagger documentation will be available at:
- **API Server**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser to:
- **WebX-Ray Dashboard**: `http://localhost:5173`

---

## 📋 The 24 Platform Screens

1. **Overview Dashboard** (`/`): Health metrics, active target status, recent crawl runs, and design token summary.
2. **Create Project** (`/projects/new`): Configurable access profiles (Public, Test Env, Source Repo, API Specs, Database).
3. **Scan Configuration** (`/scans/config`): Crawl bounds, max depth, concurrency, and mode selection.
4. **Live Scan Monitor** (`/scans/monitor`): Real-time progress bar, live discovered routes feed, and console log diagnostics.
5. **Page Explorer** (`/pages`): Visual route hierarchy table and live screenshot previews.
6. **Browser Inspector** (`/browser`): Multi-viewport preview (Desktop, Tablet, Mobile) and render timing diagnostics.
7. **DOM Explorer** (`/dom`): Extracted DOM node tree, selectors, bounding rects, and computed styles.
8. **CSS Inspector** (`/css`): Categorized CSS rules, color frequency distribution, and copyable values.
9. **Design System Viewer** (`/design-system`): Verified color palette, typography scale, and 8pt spacing grid.
10. **Component Explorer** (`/components`): Reusable UI component cards, visual properties, and confidence scores.
11. **Asset Explorer** (`/assets`): Public images, SVGs, icons, fonts, and dimensions.
12. **Network Explorer** (`/network`): Network traffic stream with redacted authorization headers and cookies.
13. **API Explorer** (`/api-explorer`): Synthesized REST endpoints with inferred JSON response schemas.
14. **Backend Explorer** (`/backend`): Static source code AST analysis, framework detection, and route handlers.
15. **Database Explorer** (`/database`): SQL DDL parser, relational tables, and Mermaid ER diagrams.
16. **Technology Stack** (`/tech-stack`): Detected framework and runtime matrix.
17. **AI Analysis Workspace** (`/ai-analysis`): 8 specialized AI analysis tasks with token usage and cost estimation.
18. **Blueprint Viewer** (`/blueprint`): 15-file blueprint package reader with agent-specific prompts.
19. **Reconstruction Workspace** (`/reconstruction`): 5-phase guided implementation checklist for coding agents.
20. **Visual Comparison** (`/visual-compare`): Perceptual SSIM score, side-by-side view, and magenta difference overlay.
21. **Functional Testing** (`/testing`): Playwright-driven test runner validating route status, console errors, and mobile overflow.
22. **Export Center** (`/export`): Structured ZIP packaging preserving complete analysis tree and AI prompts.
23. **AI Provider Settings** (`/settings/ai`): Configure Gemini, OpenAI, Claude keys, or toggle offline heuristic mode.
24. **Project Settings** (`/settings/project`): Edit project metadata, target URLs, and security scope.

---

## 🔒 Security & Privacy Architecture

- **Strict SSRF Guard**: Prohibits requests to `127.0.0.1`, `localhost`, `10.0.0.0/8`, `192.168.0.0/16`, link-local, and loopback IPs by default.
- **Header Sanitization**: Redacts `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`, and sensitive tokens before storing or exporting.
- **Non-Destructive Execution**: Does not submit state-changing or destructive forms on target websites.
- **Static Source Analysis**: Ingests owner-provided source files via AST parsing; never executes untrusted code.

---

## 🧪 Testing

Run backend tests:
```bash
.\venv\Scripts\python -m pytest -v
```

Build and type-check frontend:
```bash
cd frontend && npm run build
```

---

## 📄 License
Personal & authorized use only. Designed for software architecture inspection and evidence-backed reconstruction.
