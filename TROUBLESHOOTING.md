# WebX-Ray AI — Troubleshooting & Diagnostic Guide

## 1. Playwright / Browser Issues

### Error: `Executable doesn't exist at C:\Users\...\chromium`
**Cause**: Playwright Chromium browser binaries have not been downloaded.  
**Resolution**:
```powershell
.\venv\Scripts\playwright install chromium
```

### Headless Browser Timed Out
**Cause**: The target website took longer than 30 seconds to reach `networkidle` state due to heavy assets or slow streaming.  
**Resolution**:
- In `.env` or settings, increase `DEFAULT_TIMEOUT_MS=45000`.
- Verify the website is accessible in your normal web browser.

---

## 2. SSRF Protection Blocks Target

### Error: `Access to private or local network address is forbidden by SSRF protection`
**Cause**: Attempting to crawl `localhost`, `127.0.0.1`, or local LAN IPs under the `public` access profile.  
**Resolution**:
- Edit project settings and switch access profile to `Authenticated Test Environment` (`test_env`) or `Full Authorized Project Analysis` (`full`).
- In `.env`, set `ALLOW_PRIVATE_IPS=true` for local development testing.

---

## 3. Database Connection Issues

### Error: `database locked` in SQLite
**Cause**: Multiple concurrent threads holding write locks.  
**Resolution**:
- WebX-Ray AI uses `check_same_thread=False` and async session pooling. For high-concurrency enterprise scans, configure PostgreSQL in `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/webxray
```
