import re
from urllib.parse import urlparse
from typing import Dict, List, Any

class NetworkAnalyzer:
    @staticmethod
    def analyze_api_contracts(network_observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Groups API requests into structured endpoints with inferred schemas and HTTP methods."""
        endpoints: Dict[str, Dict[str, Any]] = {}

        for obs in network_observations:
            if not obs.get("is_api_candidate"):
                continue

            full_url = obs.get("url", "")
            method = obs.get("method", "GET").upper()
            status_code = obs.get("status_code", 200)
            res_schema = obs.get("response_schema", {})
            parsed = urlparse(full_url)
            path = parsed.path

            # Normalize parameterized IDs in paths, e.g. /users/123 -> /users/{id}
            normalized_path = re.sub(r'/\d+', '/{id}', path)
            normalized_path = re.sub(r'/[a-f0-9\-]{36}', '/{uuid}', normalized_path)

            key = f"{method} {normalized_path}"

            if key not in endpoints:
                endpoints[key] = {
                    "endpoint_path": normalized_path,
                    "method": method,
                    "summary": f"Observed API route serving {normalized_path}",
                    "request_schema": {},
                    "response_schema": res_schema,
                    "status_codes": [status_code],
                    "auth_required": bool(obs.get("headers", {}).get("authorization")),
                    "confidence": 0.85,
                    "source_evidence": f"Observed via browser network request to {full_url}"
                }
            else:
                if status_code not in endpoints[key]["status_codes"]:
                    endpoints[key]["status_codes"].append(status_code)
                if not endpoints[key]["response_schema"] and res_schema:
                    endpoints[key]["response_schema"] = res_schema

        return list(endpoints.values())

    @staticmethod
    def generate_network_report(contracts: List[Dict[str, Any]]) -> str:
        md = ["# Observed API & Network Contracts Report\n"]
        md.append("Identified by WebX-Ray AI through non-destructive browser network observation.\n")
        md.append("| Method | Endpoint | Inferred Response Schema | Status Codes | Auth Required |")
        md.append("|---|---|---|---|---|")

        for c in contracts:
            schema_keys = ", ".join(c.get("response_schema", {}).keys()) or "opaque/primitive"
            statuses = ", ".join(map(str, c.get("status_codes", [])))
            auth = "Yes" if c.get("auth_required") else "No"
            md.append(f"| `{c['method']}` | `{c['endpoint_path']}` | `{schema_keys}` | `{statuses}` | {auth} |")

        return "\n".join(md)

network_analyzer = NetworkAnalyzer()
