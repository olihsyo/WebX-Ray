import {
  Project,
  ScanJob,
  DiscoveredPage,
  PageSnapshot,
  ComponentItem,
  DesignToken,
  AssetItem,
  NetworkObservation,
  ApiContract,
  SourceArchive,
  DatabaseSchema,
  AIAnalysis,
  Blueprint,
  VisualComparison,
  TestRun,
  ExportJob
} from '../types';

const API_BASE = '/api';

class ApiClient {
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Scans
  async getScans(projectId: string): Promise<ScanJob[]> {
    return this.request<ScanJob[]>(`/scans?project_id=${projectId}`);
  }

  async startScan(projectId: string, params: { mode: string; max_pages: number; max_depth: number }): Promise<ScanJob> {
    return this.request<ScanJob>(`/scans/start?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getScanStatus(scanId: string): Promise<ScanJob> {
    return this.request<ScanJob>(`/scans/${scanId}`);
  }

  async cancelScan(scanId: string): Promise<ScanJob> {
    return this.request<ScanJob>(`/scans/${scanId}/cancel`, {
      method: 'POST',
    });
  }

  // Pages
  async getPages(projectId: string): Promise<DiscoveredPage[]> {
    return this.request<DiscoveredPage[]>(`/pages?project_id=${projectId}`);
  }

  async getPage(pageId: string): Promise<DiscoveredPage> {
    return this.request<DiscoveredPage>(`/pages/${pageId}`);
  }

  async getPageSnapshots(pageId: string): Promise<PageSnapshot[]> {
    return this.request<PageSnapshot[]>(`/pages/${pageId}/snapshots`);
  }

  // Components
  async getComponents(projectId: string, category?: string): Promise<ComponentItem[]> {
    const query = category ? `?project_id=${projectId}&category=${encodeURIComponent(category)}` : `?project_id=${projectId}`;
    return this.request<ComponentItem[]>(`/components${query}`);
  }

  // Design Tokens
  async getDesignTokens(projectId: string): Promise<DesignToken[]> {
    return this.request<DesignToken[]>(`/design-tokens?project_id=${projectId}`);
  }

  // Assets
  async getAssets(projectId: string): Promise<AssetItem[]> {
    return this.request<AssetItem[]>(`/assets?project_id=${projectId}`);
  }

  // Network & API
  async getNetworkObservations(projectId: string): Promise<NetworkObservation[]> {
    return this.request<NetworkObservation[]>(`/network?project_id=${projectId}`);
  }

  async getApiContracts(projectId: string): Promise<ApiContract[]> {
    return this.request<ApiContract[]>(`/api-contracts?project_id=${projectId}`);
  }

  // Backend & Database Analysis
  async getSourceAnalysis(projectId: string): Promise<SourceArchive[]> {
    return this.request<SourceArchive[]>(`/backend-analysis?project_id=${projectId}`);
  }

  async getDatabaseSchemas(projectId: string): Promise<DatabaseSchema[]> {
    return this.request<DatabaseSchema[]>(`/database-analysis?project_id=${projectId}`);
  }

  // AI Analysis
  async getAIAnalyses(projectId: string): Promise<AIAnalysis[]> {
    return this.request<AIAnalysis[]>(`/ai-analyses?project_id=${projectId}`);
  }

  async runAIAnalysis(projectId: string, data: { task_type: string; provider?: string; model?: string; custom_prompt?: string }): Promise<AIAnalysis> {
    return this.request<AIAnalysis>(`/ai-analyses/run?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Blueprints
  async getBlueprints(projectId: string): Promise<Blueprint[]> {
    return this.request<Blueprint[]>(`/blueprints?project_id=${projectId}`);
  }

  async generateBlueprint(projectId: string, title?: string): Promise<Blueprint> {
    return this.request<Blueprint>(`/blueprints/generate?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ title: title || 'Comprehensive Reconstruction Blueprint' }),
    });
  }

  // Verification & Testing
  async getVisualComparisons(projectId: string): Promise<VisualComparison[]> {
    return this.request<VisualComparison[]>(`/verification/visual?project_id=${projectId}`);
  }

  async runVisualComparison(projectId: string, data: any): Promise<VisualComparison> {
    return this.request<VisualComparison>(`/verification/visual/compare?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTestRuns(projectId: string): Promise<TestRun[]> {
    return this.request<TestRun[]>(`/verification/tests?project_id=${projectId}`);
  }

  async runFunctionalTests(projectId: string, data: any): Promise<TestRun> {
    return this.request<TestRun>(`/verification/tests/run?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Export
  async exportProject(projectId: string, format: string = 'zip'): Promise<ExportJob> {
    return this.request<ExportJob>(`/exports/create?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async getExports(projectId: string): Promise<ExportJob[]> {
    return this.request<ExportJob[]>(`/exports?project_id=${projectId}`);
  }

  // Settings
  async getSettings(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/settings');
  }

  async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiClient();
