import os
import re
from pathlib import Path
from typing import Dict, List, Any

class SourceAnalyzer:
    @staticmethod
    def analyze_source_directory(source_path: str) -> Dict[str, Any]:
        """
        Statically inspects an owner-provided source repository directory.
        Identifies backend framework, routes, controllers, and services without executing code.
        """
        path = Path(source_path)
        if not path.exists():
            return {
                "status": "error",
                "message": f"Source directory '{source_path}' does not exist on disk."
            }

        detected_stack = {
            "languages": set(),
            "frameworks": set(),
            "package_managers": set()
        }

        routes: List[Dict[str, Any]] = []
        controllers: List[str] = []
        middleware: List[str] = []

        # File scan
        for root, dirs, files in os.walk(path):
            # Exclude node_modules, .git, venv
            dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "venv", "__pycache__", ".next", "dist")]

            for file in files:
                file_lower = file.lower()
                rel_path = os.path.relpath(os.path.join(root, file), path)

                # Language detection
                if file_lower.endswith((".py")):
                    detected_stack["languages"].add("Python")
                elif file_lower.endswith((".ts", ".tsx")):
                    detected_stack["languages"].add("TypeScript")
                elif file_lower.endswith((".js", ".jsx")):
                    detected_stack["languages"].add("JavaScript")
                elif file_lower.endswith((".go")):
                    detected_stack["languages"].add("Go")
                elif file_lower.endswith((".rs")):
                    detected_stack["languages"].add("Rust")

                # Package Manifests
                if file_lower == "package.json":
                    detected_stack["package_managers"].add("npm/yarn/pnpm")
                elif file_lower in ("requirements.txt", "pyproject.toml"):
                    detected_stack["package_managers"].add("pip/poetry")

                # Static route detection in Python (FastAPI/Flask) and JS/TS (Express/Next)
                if file_lower.endswith((".py", ".ts", ".js")):
                    try:
                        file_full = os.path.join(root, file)
                        if os.path.getsize(file_full) < 500_000: # Max 500KB per file
                            with open(file_full, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()

                                # FastAPI / Flask routes
                                for match in re.finditer(r'@(?:app|router)\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']', content):
                                    routes.append({
                                        "method": match.group(1).upper(),
                                        "path": match.group(2),
                                        "file": rel_path
                                    })

                                # Express / Koa routes
                                for match in re.finditer(r'(?:app|router)\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']', content):
                                    routes.append({
                                        "method": match.group(1).upper(),
                                        "path": match.group(2),
                                        "file": rel_path
                                    })

                                # Controllers
                                if "controller" in file_lower or "handler" in file_lower:
                                    controllers.append(rel_path)

                                # Middleware
                                if "middleware" in file_lower:
                                    middleware.append(rel_path)

                    except Exception:
                        pass

        # Framework heuristics
        if routes:
            if "Python" in detected_stack["languages"]:
                detected_stack["frameworks"].add("FastAPI / Flask")
            if "TypeScript" in detected_stack["languages"] or "JavaScript" in detected_stack["languages"]:
                detected_stack["frameworks"].add("Express / NestJS / Next.js")

        return {
            "source_path": source_path,
            "detected_stack": {
                "languages": list(detected_stack["languages"]),
                "frameworks": list(detected_stack["frameworks"]),
                "package_managers": list(detected_stack["package_managers"])
            },
            "routes_count": len(routes),
            "routes": routes[:100],
            "controllers": list(set(controllers))[:50],
            "middleware": list(set(middleware))[:30]
        }

source_analyzer = SourceAnalyzer()
