from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, ConfigDict

# Common / Base
class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details_json: Dict[str, Any]
    created_at: datetime

# Project Schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    target_url: Optional[str] = None
    access_profile: str = Field(default="public")  # public, test_env, source_repo, api_docs, db_schema, full
    auth_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    source_path: Optional[str] = None
    db_schema_input: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_url: Optional[str] = None
    access_profile: Optional[str] = None
    auth_config: Optional[Dict[str, Any]] = None
    source_path: Optional[str] = None
    db_schema_input: Optional[str] = None
    status: Optional[str] = None

class ProjectRead(ProjectBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Scan Schemas
class ScanJobCreate(BaseModel):
    mode: str = Field(default="internal_links")  # sitemap, internal_links, dynamic, manifest, source
    max_pages: int = Field(default=25, ge=1, le=200)
    max_depth: int = Field(default=3, ge=1, le=10)

class ScanJobRead(BaseModel):
    id: str
    project_id: str
    status: str
    mode: str
    max_pages: int
    max_depth: int
    pages_discovered: int
    pages_analyzed: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Page Schemas
class PageSnapshotRead(BaseModel):
    id: str
    page_id: str
    viewport: str
    html_snapshot_path: Optional[str] = None
    dom_tree_json: Dict[str, Any]
    computed_styles_json: Dict[str, Any]
    screenshot_path: Optional[str] = None
    timing_data_json: Dict[str, Any]
    a11y_tree_json: Dict[str, Any]
    console_logs_json: List[Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DiscoveredPageRead(BaseModel):
    id: str
    project_id: str
    scan_job_id: Optional[str]
    url: str
    path: str
    title: Optional[str]
    discovery_method: str
    http_status: int
    page_type: str
    depth: int
    analysis_status: str
    confidence_level: float
    screenshot_path: Optional[str]
    thumbnail_path: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Component Schemas
class ComponentRead(BaseModel):
    id: str
    project_id: str
    name: str
    category: str
    bounding_box_json: Dict[str, Any]
    visual_properties_json: Dict[str, Any]
    dom_selector: str
    css_properties_json: Dict[str, Any]
    interaction_desc: Optional[str]
    responsive_behavior: Optional[str]
    reusability_score: float
    confidence_score: float
    screenshot_path: Optional[str]
    occurrences_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Design Token Schemas
class DesignTokenRead(BaseModel):
    id: str
    project_id: str
    token_type: str
    name: str
    value: str
    raw_css_value: Optional[str]
    category: str
    usage_count: int
    source_evidence: Optional[str]
    confidence: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Asset Schemas
class AssetRead(BaseModel):
    id: str
    project_id: str
    original_url: str
    local_path: Optional[str]
    mime_type: Optional[str]
    file_size: int
    width: Optional[int]
    height: Optional[int]
    category: str
    page_references_json: List[str]
    download_status: str
    sha256_hash: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Network & API Schemas
class NetworkObservationRead(BaseModel):
    id: str
    project_id: str
    page_id: Optional[str]
    url: str
    method: str
    status_code: int
    resource_type: str
    content_type: Optional[str]
    duration_ms: float
    headers_json: Dict[str, Any]
    response_schema_json: Dict[str, Any]
    is_api_candidate: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApiContractRead(BaseModel):
    id: str
    project_id: str
    endpoint_path: str
    method: str
    summary: Optional[str]
    request_schema_json: Dict[str, Any]
    response_schema_json: Dict[str, Any]
    status_codes_json: List[int]
    auth_required: bool
    confidence: float
    source_evidence: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Source Archive & Database Schemas
class SourceArchiveRead(BaseModel):
    id: str
    project_id: str
    source_type: str
    original_filename: str
    extracted_path: str
    detected_stack_json: Dict[str, Any]
    routes_json: List[Any]
    controllers_json: List[Any]
    middleware_json: List[Any]
    analysis_summary_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DatabaseSchemaRead(BaseModel):
    id: str
    project_id: str
    dialect: str
    tables_json: List[Any]
    relations_json: List[Any]
    indexes_json: List[Any]
    orm_models_json: List[Any]
    er_diagram_mermaid: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# AI Schemas
class AIAnalysisRequest(BaseModel):
    task_type: str
    provider: Optional[str] = None
    model: Optional[str] = None
    custom_prompt: Optional[str] = None

class AIAnalysisRead(BaseModel):
    id: str
    project_id: str
    task_type: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    cost_estimate: float
    raw_response: Optional[str]
    findings_json: List[Any]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Blueprint Schemas
class BlueprintRead(BaseModel):
    id: str
    project_id: str
    version: int
    title: str
    status: str
    complete_blueprint_md: str
    website_analysis_json: Dict[str, Any]
    implementation_roadmap_md: str
    testing_requirements_md: str
    reconstruction_master_prompt_md: str
    claude_prompt_md: str
    gemini_prompt_md: str
    antigravity_prompt_md: str
    cursor_prompt_md: str
    generic_prompt_md: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Verification Schemas
class VisualComparisonRequest(BaseModel):
    original_image_path: str
    reconstructed_image_path: str
    viewport: str = "desktop"
    page_id: Optional[str] = None

class VisualComparisonRead(BaseModel):
    id: str
    project_id: str
    page_id: Optional[str]
    viewport: str
    original_image_path: str
    reconstructed_image_path: str
    diff_image_path: Optional[str]
    ssim_score: float
    pixel_diff_score: float
    discrepancies_json: List[Any]
    correction_report_md: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TestRunRequest(BaseModel):
    test_type: str = "functional"
    target_url: Optional[str] = None

class TestRunRead(BaseModel):
    id: str
    project_id: str
    test_type: str
    status: str
    results_json: Dict[str, Any]
    report_md: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Export Schemas
class ExportRequest(BaseModel):
    format: str = "zip"  # zip, json, markdown, html

class ExportJobRead(BaseModel):
    id: str
    project_id: str
    format: str
    file_path: str
    file_size: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Project Detail Summary
class ProjectDetail(ProjectRead):
    scans_count: int = 0
    pages_count: int = 0
    components_count: int = 0
    tokens_count: int = 0
    assets_count: int = 0
    apis_count: int = 0
    has_blueprint: bool = False
    latest_blueprint_id: Optional[str] = None
