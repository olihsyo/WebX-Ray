# WebX-Ray AI — End-to-End User Guide

## Step 1: Create an Analysis Project
1. Open the dashboard at `http://localhost:5173`.
2. Click **New Project** in the header or sidebar.
3. Fill in the **Project Name** and **Target Website URL**.
4. Choose an **Access Profile**:
   - `Public Website Analysis`: Safe public crawl.
   - `Authenticated Test Environment`: Provide sandbox credentials.
   - `Owner-Provided Source Repository`: Point to local folder.
   - `Authorized Database Schema`: Paste SQL DDL.
5. Click **Initialize Project**.

---

## Step 2: Configure & Launch Crawl
1. Navigate to **Scan Config** (`/scans/config`).
2. Select your Crawl Mode:
   - `Internal-Link Dynamic Crawl` (Recommended)
   - `Sitemap-Based Crawling`
   - `Browser-Assisted SPA Crawl`
3. Set your **Max Pages** (e.g. 25) and **Max Depth** (e.g. 3).
4. Click **Start Dynamic Browser Scan**.
5. You will be redirected to the **Live Scan Monitor**, where you can watch discovered pages, progress percentage, and console diagnostics in real time.

---

## Step 3: Inspect Extracted Intelligence
- **Page Explorer** (`/pages`): Review site hierarchy and route classifications.
- **Browser Inspector** (`/browser`): Switch viewports (Desktop, Tablet, Mobile) to inspect responsive layout.
- **DOM Explorer** (`/dom`): Explore extracted DOM tags and computed styles.
- **Design System** (`/design-system`): View color tokens, typography scales, and 8pt spacing grids.
- **Components** (`/components`): Review detected atomic and composite UI elements.
- **API Explorer** (`/api-explorer`): Inspect observed REST endpoints and inferred JSON response schemas.

---

## Step 4: Generate & Export Master Reconstruction Blueprint
1. Open **Blueprint Viewer** (`/blueprint`) or **AI Analysis** (`/ai-analysis`).
2. Click **Generate New Blueprint**.
3. Review the synthesized master technical blueprint and agent-specific prompts for Claude Code, Gemini, Antigravity, and Cursor.
4. Navigate to **Export Center** (`/export`) and click **Download Full ZIP Bundle**.
5. Deliver the extracted ZIP package to your AI coding agent to begin accurate reconstruction.

---

## Step 5: Visual Verification & Testing
1. Reconstruct the page in your development workspace.
2. In **Visual Comparison** (`/visual-compare`), execute a pixel comparison against the original screenshot.
3. In **Functional Testing** (`/testing`), run Playwright tests to ensure console errors are zero and responsive layouts fit without horizontal scroll.
