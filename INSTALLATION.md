# WebX-Ray AI — Installation Guide

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS (12+), or Linux (Ubuntu 22.04+).
- **Python**: Version 3.12 or 3.13 (64-bit).
- **Node.js**: Version 18.x, 20.x, 22.x, or 24.x.
- **Package Manager**: npm 9+ (or pnpm/yarn).
- **Memory**: 4 GB RAM minimum (8 GB recommended for browser automation).

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/WebX-Ray.git
cd WebX-Ray
```

### Step 2: Set up Python Virtual Environment
On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

On Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Install Playwright Chromium Browser
```bash
playwright install chromium
```

### Step 5: Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env
```
Edit `.env` if you wish to provide optional external AI API keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`). WebX-Ray AI functions 100% offline out-of-the-box using its deterministic local heuristic engine if no API keys are provided.

### Step 6: Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 3. Running WebX-Ray AI

### Start the Backend Server:
```powershell
.\venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start the Frontend Dev Server:
In a separate terminal:
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` to access the WebX-Ray AI Dashboard.
