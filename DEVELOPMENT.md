# WebX-Ray AI — Developer & Contributor Guide

## 1. Directory Structure

```
WebX-Ray/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # FastAPI route controllers
│   │   ├── models/              # SQLAlchemy declarative ORM models
│   │   ├── schemas/             # Pydantic v2 validation models
│   │   ├── services/            # Engine services (Crawler, Browser, AI, etc.)
│   │   ├── config.py            # Application settings & environment
│   │   ├── database.py          # Asynchronous database connection
│   │   └── main.py              # Application entrypoint
│   ├── requirements.txt         # Python dependencies
│   └── storage/                 # Local persistent storage for screenshots
├── frontend/
│   ├── src/
│   │   ├── api/                 # Typed API client
│   │   ├── components/layout/   # Sidebar, Header, Layout
│   │   ├── pages/               # The 24 Platform screens
│   │   ├── store/               # Zustand application store
│   │   └── types/               # TypeScript interface models
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js       # Color tokens and design system
│   └── vite.config.ts
├── tests/                       # Pytest test suite
├── pytest.ini
├── .env.example
└── README.md
```

---

## 2. Running Automated Tests

Run the backend test suite:
```powershell
.\venv\Scripts\python -m pytest -v
```

Type-check and verify frontend compilation:
```bash
cd frontend && npm run build
```

---

## 3. Code Standards & Behavioral Rules

1. **No Fake Functionality**: Never build mock buttons that pretend to perform an action without executing underlying logic.
2. **Strict SSRF Enforcement**: Never bypass the SSRF validator for unverified targets.
3. **Secret Redaction**: Always run `security_service.redact_headers` and `security_service.sanitize_content` on recorded network traffic.
4. **Deterministic Local Fallbacks**: If external AI providers fail or are unconfigured, always provide verified static analysis results.
