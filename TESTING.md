# WebX-Ray AI — Testing & Verification Guide

## 1. Automated Test Architecture

The testing suite covers all layers of WebX-Ray AI:

1. **Security & SSRF Tests** (`tests/test_security.py`):
   - Private IP address blocking
   - Loopback and link-local validation
   - Sensitive header redaction
   - Secret key pattern masking
2. **Crawler Tests** (`tests/test_crawler.py`):
   - URL normalization and fragment stripping
   - Page type classification heuristics
   - Internal hyperlink extraction and domain matching
3. **Design & Component Detection Tests** (`tests/test_design_component.py`):
   - Computed CSS color palette extraction
   - Typography font family ranking
   - Component category identification
4. **Database DDL Tests** (`tests/test_database_analyzer.py`):
   - Relational table parsing
   - Foreign key constraint extraction
   - Mermaid ER syntax generation
5. **Blueprint & Export Tests** (`tests/test_blueprint_export.py`):
   - 15-file blueprint package generation
   - AI agent prompt customization
   - ZIP archive verification
6. **API Endpoints Integration Tests** (`tests/test_api_endpoints.py`):
   - Project CRUD lifecycle
   - Settings update and persistence

---

## 2. Running Automated Tests

```bash
# Run complete test suite with verbose output
.\venv\Scripts\python -m pytest -v

# Run a specific test module
.\venv\Scripts\python -m pytest tests/test_security.py -v
```
