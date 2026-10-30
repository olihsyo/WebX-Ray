# WebX-Ray AI — REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 1. Projects Endpoints

### `GET /projects`
Returns a list of all analysis projects ordered by creation date.

### `POST /projects`
Creates a new analysis project.
```json
{
  "name": "Acme SaaS Reconstruction",
  "description": "Deep architecture analysis",
  "target_url": "https://example.com",
  "access_profile": "public",
  "auth_config": {},
  "source_path": null,
  "db_schema_input": null
}
```

### `GET /projects/{project_id}`
Returns project details including counts of scans, pages, components, tokens, assets, and blueprint status.

### `PUT /projects/{project_id}`
Updates project metadata.

### `DELETE /projects/{project_id}`
Deletes project and cascades deletion across all child records and disk storage.

---

## 2. Scans Endpoints

### `GET /scans?project_id={project_id}`
Lists all crawl jobs for a project.

### `POST /scans/start?project_id={project_id}`
Initiates an asynchronous background scan.
```json
{
  "mode": "internal_links",
  "max_pages": 25,
  "max_depth": 3
}
```

### `GET /scans/{scan_id}`
Retrieves real-time status, progress counters, and error diagnostics for a scan.

### `POST /scans/{scan_id}/cancel`
Cancels a running crawl job.

---

## 3. Pages & DOM Endpoints

### `GET /pages?project_id={project_id}`
Lists all discovered routes, status codes, page types, and screenshot thumbnail paths.

### `GET /pages/{page_id}/snapshots`
Retrieves rendered DOM tree, computed CSS rules, accessibility tree, and console logs.

---

## 4. Components & Design System Endpoints

### `GET /components?project_id={project_id}&category={category}`
Returns detected UI components with bounding boxes and reusability scores.

### `GET /design-tokens?project_id={project_id}`
Returns synthesized color, typography, radius, and spacing tokens.

---

## 5. Network & API Contracts

### `GET /network?project_id={project_id}`
Lists recorded HTTP requests with sanitized headers.

### `GET /api-contracts?project_id={project_id}`
Lists normalized API endpoints with inferred JSON response schemas.

---

## 6. Blueprints & Export Endpoints

### `POST /blueprints/generate?project_id={project_id}`
Synthesizes the complete 15-file blueprint package and agent prompts.

### `POST /exports/create?project_id={project_id}`
Creates a structured ZIP bundle of the complete project analysis.

### `GET /exports/{export_id}/download`
Downloads the compiled `.zip` file archive.
