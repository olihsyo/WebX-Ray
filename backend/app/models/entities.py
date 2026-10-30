import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="idle")  # idle, scanning, analyzing, completed, error
    access_profile: Mapped[str] = mapped_column(String(50), default="public")  # public, test_env, source_repo, api_docs, db_schema, full
    auth_config: Mapped[dict] = mapped_column(JSON, default=dict)
    source_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    db_schema_input: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scans: Mapped[List["ScanJob"]] = relationship("ScanJob", back_populates="project", cascade="all, delete-orphan")
    pages: Mapped[List["DiscoveredPage"]] = relationship("DiscoveredPage", back_populates="project", cascade="all, delete-orphan")
    components: Mapped[List["Component"]] = relationship("Component", back_populates="project", cascade="all, delete-orphan")
    design_tokens: Mapped[List["DesignToken"]] = relationship("DesignToken", back_populates="project", cascade="all, delete-orphan")
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="project", cascade="all, delete-orphan")
    network_observations: Mapped[List["NetworkObservation"]] = relationship("NetworkObservation", back_populates="project", cascade="all, delete-orphan")
    api_contracts: Mapped[List["ApiContract"]] = relationship("ApiContract", back_populates="project", cascade="all, delete-orphan")
    source_archives: Mapped[List["SourceArchive"]] = relationship("SourceArchive", back_populates="project", cascade="all, delete-orphan")
    database_schemas: Mapped[List["DatabaseSchema"]] = relationship("DatabaseSchema", back_populates="project", cascade="all, delete-orphan")
    ai_analyses: Mapped[List["AIAnalysis"]] = relationship("AIAnalysis", back_populates="project", cascade="all, delete-orphan")
    blueprints: Mapped[List["Blueprint"]] = relationship("Blueprint", back_populates="project", cascade="all, delete-orphan")
    test_runs: Mapped[List["TestRun"]] = relationship("TestRun", back_populates="project", cascade="all, delete-orphan")
    visual_comparisons: Mapped[List["VisualComparison"]] = relationship("VisualComparison", back_populates="project", cascade="all, delete-orphan")
    export_jobs: Mapped[List["ExportJob"]] = relationship("ExportJob", back_populates="project", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")


class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="queued")  # queued, running, completed, failed, cancelled
    mode: Mapped[str] = mapped_column(String(50), default="internal_links")  # sitemap, internal_links, dynamic, manifest, source
    max_pages: Mapped[int] = mapped_column(Integer, default=25)
    max_depth: Mapped[int] = mapped_column(Integer, default=3)
    pages_discovered: Mapped[int] = mapped_column(Integer, default=0)
    pages_analyzed: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="scans")
    pages: Mapped[List["DiscoveredPage"]] = relationship("DiscoveredPage", back_populates="scan", cascade="all, delete-orphan")


class DiscoveredPage(Base):
    __tablename__ = "discovered_pages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    scan_job_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("scan_jobs.id", ondelete="CASCADE"), nullable=True)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    path: Mapped[str] = mapped_column(String(1024), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    discovery_method: Mapped[str] = mapped_column(String(50), default="internal_link")  # sitemap, internal_link, dynamic, manifest, user
    http_status: Mapped[int] = mapped_column(Integer, default=200)
    page_type: Mapped[str] = mapped_column(String(50), default="standard")  # home, landing, form, dashboard, detail, list, auth, not_found
    depth: Mapped[int] = mapped_column(Integer, default=0)
    analysis_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, analyzing, completed, failed
    confidence_level: Mapped[float] = mapped_column(Float, default=1.0)
    screenshot_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    thumbnail_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="pages")
    scan: Mapped[Optional["ScanJob"]] = relationship("ScanJob", back_populates="pages")
    snapshots: Mapped[List["PageSnapshot"]] = relationship("PageSnapshot", back_populates="page", cascade="all, delete-orphan")


class PageSnapshot(Base):
    __tablename__ = "page_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    page_id: Mapped[str] = mapped_column(String(36), ForeignKey("discovered_pages.id", ondelete="CASCADE"), nullable=False)
    viewport: Mapped[str] = mapped_column(String(50), default="desktop")  # desktop, tablet, mobile
    html_snapshot_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    dom_tree_json: Mapped[dict] = mapped_column(JSON, default=dict)
    computed_styles_json: Mapped[dict] = mapped_column(JSON, default=dict)
    screenshot_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    timing_data_json: Mapped[dict] = mapped_column(JSON, default=dict)
    a11y_tree_json: Mapped[dict] = mapped_column(JSON, default=dict)
    console_logs_json: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    page: Mapped["DiscoveredPage"] = relationship("DiscoveredPage", back_populates="snapshots")


class Component(Base):
    __tablename__ = "components"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="other")  # header, navigation, footer, button, card, form, modal, etc.
    bounding_box_json: Mapped[dict] = mapped_column(JSON, default=dict)
    visual_properties_json: Mapped[dict] = mapped_column(JSON, default=dict)
    dom_selector: Mapped[str] = mapped_column(Text, nullable=False)
    css_properties_json: Mapped[dict] = mapped_column(JSON, default=dict)
    interaction_desc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    responsive_behavior: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reusability_score: Mapped[float] = mapped_column(Float, default=0.5)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.8)
    screenshot_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    occurrences_count: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="components")


class DesignToken(Base):
    __tablename__ = "design_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    token_type: Mapped[str] = mapped_column(String(50), nullable=False)  # color, typography, spacing, radius, shadow, layout
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    raw_css_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="generic")
    usage_count: Mapped[int] = mapped_column(Integer, default=1)
    source_evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.9)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="design_tokens")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    original_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    local_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="image")  # image, svg, icon, font, video, static
    page_references_json: Mapped[list] = mapped_column(JSON, default=list)
    download_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, downloaded, failed, skipped
    sha256_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="assets")


class NetworkObservation(Base):
    __tablename__ = "network_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    page_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("discovered_pages.id", ondelete="SET NULL"), nullable=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    method: Mapped[str] = mapped_column(String(10), default="GET")
    status_code: Mapped[int] = mapped_column(Integer, default=200)
    resource_type: Mapped[str] = mapped_column(String(50), default="xhr")
    content_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0)
    headers_json: Mapped[dict] = mapped_column(JSON, default=dict)  # Redacted
    response_schema_json: Mapped[dict] = mapped_column(JSON, default=dict)  # Inferred schema, sanitized
    is_api_candidate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="network_observations")


class ApiContract(Base):
    __tablename__ = "api_contracts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    endpoint_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    method: Mapped[str] = mapped_column(String(10), default="GET")
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    request_schema_json: Mapped[dict] = mapped_column(JSON, default=dict)
    response_schema_json: Mapped[dict] = mapped_column(JSON, default=dict)
    status_codes_json: Mapped[list] = mapped_column(JSON, default=list)
    auth_required: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    source_evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="api_contracts")


class SourceArchive(Base):
    __tablename__ = "source_archives"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), default="zip")  # git, zip, folder
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    extracted_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    detected_stack_json: Mapped[dict] = mapped_column(JSON, default=dict)
    routes_json: Mapped[list] = mapped_column(JSON, default=list)
    controllers_json: Mapped[list] = mapped_column(JSON, default=list)
    middleware_json: Mapped[list] = mapped_column(JSON, default=list)
    analysis_summary_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="source_archives")


class DatabaseSchema(Base):
    __tablename__ = "database_schemas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    dialect: Mapped[str] = mapped_column(String(50), default="postgresql")  # postgresql, mysql, sqlite, mongodb
    tables_json: Mapped[list] = mapped_column(JSON, default=list)
    relations_json: Mapped[list] = mapped_column(JSON, default=list)
    indexes_json: Mapped[list] = mapped_column(JSON, default=list)
    orm_models_json: Mapped[list] = mapped_column(JSON, default=list)
    er_diagram_mermaid: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="database_schemas")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), default="gemini")
    model: Mapped[str] = mapped_column(String(100), default="gemini-2.5-flash")
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_estimate: Mapped[float] = mapped_column(Float, default=0.0)
    raw_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    findings_json: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(50), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="ai_analyses")


class Blueprint(Base):
    __tablename__ = "blueprints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ready")
    complete_blueprint_md: Mapped[str] = mapped_column(Text, nullable=False)
    website_analysis_json: Mapped[dict] = mapped_column(JSON, default=dict)
    implementation_roadmap_md: Mapped[str] = mapped_column(Text, nullable=False)
    testing_requirements_md: Mapped[str] = mapped_column(Text, nullable=False)
    reconstruction_master_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    claude_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    gemini_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    antigravity_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    cursor_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    generic_prompt_md: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="blueprints")


class VisualComparison(Base):
    __tablename__ = "visual_comparisons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    page_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("discovered_pages.id", ondelete="SET NULL"), nullable=True)
    viewport: Mapped[str] = mapped_column(String(50), default="desktop")
    original_image_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    reconstructed_image_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    diff_image_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    ssim_score: Mapped[float] = mapped_column(Float, default=1.0)
    pixel_diff_score: Mapped[float] = mapped_column(Float, default=0.0)
    discrepancies_json: Mapped[list] = mapped_column(JSON, default=list)
    correction_report_md: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="visual_comparisons")


class TestRun(Base):
    __tablename__ = "test_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    test_type: Mapped[str] = mapped_column(String(100), default="functional")
    status: Mapped[str] = mapped_column(String(50), default="passed")  # passed, failed, error
    results_json: Mapped[dict] = mapped_column(JSON, default=dict)
    report_md: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="test_runs")


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    format: Mapped[str] = mapped_column(String(20), default="zip")  # zip, json, markdown, html
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="export_jobs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    details_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="audit_logs")
