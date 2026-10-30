export interface Project {
  id: string;
  name: string;
  description?: string;
  target_url?: string;
  status: 'idle' | 'scanning' | 'analyzing' | 'completed' | 'error';
  access_profile: 'public' | 'test_env' | 'source_repo' | 'api_docs' | 'db_schema' | 'full';
  auth_config?: Record<string, any>;
  source_path?: string;
  db_schema_input?: string;
  created_at: string;
  updated_at: string;
  scans_count?: number;
  pages_count?: number;
  components_count?: number;
  tokens_count?: number;
  assets_count?: number;
  apis_count?: number;
  has_blueprint?: boolean;
  latest_blueprint_id?: string;
}

export interface ScanJob {
  id: string;
  project_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  mode: 'sitemap' | 'internal_links' | 'dynamic' | 'manifest' | 'source';
  max_pages: number;
  max_depth: number;
  pages_discovered: number;
  pages_analyzed: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface DiscoveredPage {
  id: string;
  project_id: string;
  scan_job_id?: string;
  url: string;
  path: string;
  title?: string;
  discovery_method: string;
  http_status: number;
  page_type: string;
  depth: number;
  analysis_status: string;
  confidence_level: number;
  screenshot_path?: string;
  thumbnail_path?: string;
  created_at: string;
}

export interface PageSnapshot {
  id: string;
  page_id: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  html_snapshot_path?: string;
  dom_tree_json: Record<string, any>;
  computed_styles_json: Record<string, any>;
  screenshot_path?: string;
  timing_data_json: Record<string, any>;
  a11y_tree_json: Record<string, any>;
  console_logs_json: any[];
  created_at: string;
}

export interface ComponentItem {
  id: string;
  project_id: string;
  name: string;
  category: string;
  bounding_box_json: { x: number; y: number; width: number; height: number };
  visual_properties_json: Record<string, any>;
  dom_selector: string;
  css_properties_json: Record<string, any>;
  interaction_desc?: string;
  responsive_behavior?: string;
  reusability_score: number;
  confidence_score: number;
  screenshot_path?: string;
  occurrences_count: number;
  created_at: string;
}

export interface DesignToken {
  id: string;
  project_id: string;
  token_type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'layout';
  name: string;
  value: string;
  raw_css_value?: string;
  category: string;
  usage_count: number;
  source_evidence?: string;
  confidence: number;
  created_at: string;
}

export interface AssetItem {
  id: string;
  project_id: string;
  original_url: string;
  local_path?: string;
  mime_type?: string;
  file_size: number;
  width?: number;
  height?: number;
  category: 'image' | 'svg' | 'icon' | 'font' | 'video' | 'static';
  page_references_json: string[];
  download_status: string;
  sha256_hash?: string;
  created_at: string;
}

export interface NetworkObservation {
  id: string;
  project_id: string;
  page_id?: string;
  url: string;
  method: string;
  status_code: number;
  resource_type: string;
  content_type?: string;
  duration_ms: number;
  headers_json: Record<string, any>;
  response_schema_json: Record<string, any>;
  is_api_candidate: boolean;
  created_at: string;
}

export interface ApiContract {
  id: string;
  project_id: string;
  endpoint_path: string;
  method: string;
  summary?: string;
  request_schema_json: Record<string, any>;
  response_schema_json: Record<string, any>;
  status_codes_json: number[];
  auth_required: boolean;
  confidence: number;
  source_evidence?: string;
  created_at: string;
}

export interface SourceArchive {
  id: string;
  project_id: string;
  source_type: string;
  original_filename: string;
  extracted_path: string;
  detected_stack_json: Record<string, any>;
  routes_json: any[];
  controllers_json: any[];
  middleware_json: any[];
  analysis_summary_json: Record<string, any>;
  created_at: string;
}

export interface DatabaseSchema {
  id: string;
  project_id: string;
  dialect: string;
  tables_json: any[];
  relations_json: any[];
  indexes_json: any[];
  orm_models_json: any[];
  er_diagram_mermaid?: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  project_id: string;
  task_type: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_estimate: number;
  raw_response?: string;
  findings_json: any[];
  status: string;
  created_at: string;
}

export interface Blueprint {
  id: string;
  project_id: string;
  version: number;
  title: string;
  status: string;
  complete_blueprint_md: string;
  website_analysis_json: Record<string, any>;
  implementation_roadmap_md: string;
  testing_requirements_md: string;
  reconstruction_master_prompt_md: string;
  claude_prompt_md: string;
  gemini_prompt_md: string;
  antigravity_prompt_md: string;
  cursor_prompt_md: string;
  generic_prompt_md: string;
  created_at: string;
}

export interface VisualComparison {
  id: string;
  project_id: string;
  page_id?: string;
  viewport: string;
  original_image_path: string;
  reconstructed_image_path: string;
  diff_image_path?: string;
  ssim_score: number;
  pixel_diff_score: number;
  discrepancies_json: any[];
  correction_report_md?: string;
  created_at: string;
}

export interface TestRun {
  id: string;
  project_id: string;
  test_type: string;
  status: 'passed' | 'failed' | 'error';
  results_json: Record<string, any>;
  report_md?: string;
  created_at: string;
}

export interface ExportJob {
  id: string;
  project_id: string;
  format: 'zip' | 'json' | 'markdown' | 'html';
  file_path: string;
  file_size: number;
  status: string;
  created_at: string;
}
