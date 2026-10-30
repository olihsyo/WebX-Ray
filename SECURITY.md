# WebX-Ray AI — Security & Access Architecture

## 1. Threat Model & Mitigations

WebX-Ray AI is engineered with security enforced at the architectural foundation.

### 1.1 Server-Side Request Forgery (SSRF) Defense
- **Private & Loopback IP Guard**: All crawl targets are checked via DNS resolution against RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`), and reserved multicast IP spaces.
- **Protocol Restrictions**: Only `http://` and `https://` URI schemes are accepted. Protocols such as `file://`, `gopher://`, `dict://`, and `ftp://` are rejected immediately.
- **Explicit Test Environment Override**: Internal testing environments (e.g. `localhost:3000`) are accessible ONLY when an authorized user selects the `test_env` access profile with explicit configuration.

### 1.2 Secret & Credential Redaction
- **Header Sanitization**: During network capture, sensitive headers including `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`, and `Proxy-Authorization` are replaced with `[REDACTED_BY_SECURITY_POLICY]`.
- **Public Blueprint Sanitization**: All exported files in ZIP archives are scanned with pattern-matching filters to strip bearer tokens, private keys, and API credentials.

### 1.3 Untrusted Code Execution Prevention
- **Static Code Parsing Only**: When analyzing owner-provided backend repositories, WebX-Ray AI strictly parses Abstract Syntax Trees (AST) and regex tokens. Source code is never dynamically executed or evaluated in the backend runtime.

---

## 2. Reporting Vulnerabilities
If you discover a security vulnerability in WebX-Ray AI, please report it privately to the system administrator or create an authorized internal security ticket.
