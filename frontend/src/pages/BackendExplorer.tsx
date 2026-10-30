import React, { useEffect, useState } from 'react';
import {
  Server,
  FileCode,
  FolderGit2,
  Play,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { SourceArchive } from '../types';

export const BackendExplorer: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [archives, setArchives] = useState<SourceArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchArchives = async () => {
      try {
        setLoading(true);
        const data = await api.getSourceAnalysis(activeProject.id);
        setArchives(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleRunStaticAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await api.request<SourceArchive>(`/backend-analysis/run?project_id=${activeProject.id}`, { method: 'POST' });
      setArchives([res, ...archives]);
      addNotification('success', 'Completed static backend source inspection.');
    } catch (err: any) {
      addNotification('error', err.message || 'Static analysis error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const latestArchive = archives.length > 0 ? archives[0] : null;
  const detectedStack = latestArchive?.detected_stack_json || {
    languages: ['Python', 'TypeScript'],
    frameworks: ['FastAPI', 'React'],
    package_managers: ['pip', 'npm'],
  };
  const routes = latestArchive?.routes_json || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Server className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-main font-mono">Backend Source & Controller Intelligence</h1>
          </div>
          <p className="text-xs text-secondary">
            Non-destructive static analysis of backend source code, routes, controllers, and middleware.
          </p>
        </div>

        <button
          onClick={handleRunStaticAnalysis}
          disabled={analyzing}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-background" />
          <span>{analyzing ? 'Inspecting AST...' : 'Run Static Source Analysis'}</span>
        </button>
      </div>

      {/* Detected Tech Stack Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-5 space-y-2">
          <span className="text-[10px] font-mono text-secondary uppercase block">Detected Languages</span>
          <div className="flex flex-wrap gap-1.5">
            {(detectedStack.languages || []).map((l: string) => (
              <span key={l} className="px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-semibold">
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card p-5 space-y-2">
          <span className="text-[10px] font-mono text-secondary uppercase block">Backend Frameworks</span>
          <div className="flex flex-wrap gap-1.5">
            {(detectedStack.frameworks || []).map((f: string) => (
              <span key={f} className="px-2.5 py-1 rounded bg-ai/10 text-ai border border-ai/20 text-xs font-mono font-semibold">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card p-5 space-y-2">
          <span className="text-[10px] font-mono text-secondary uppercase block">Package Systems</span>
          <div className="flex flex-wrap gap-1.5">
            {(detectedStack.package_managers || []).map((p: string) => (
              <span key={p} className="px-2.5 py-1 rounded bg-surface-elevated text-secondary border border-border text-xs font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discovered Backend Routes from Code */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-main">Discovered Code Routes & Controllers ({routes.length})</h2>
          </div>
          <span className="text-xs font-mono text-secondary">Extracted via AST & Decorator Parsing</span>
        </div>

        {routes.length === 0 ? (
          <div className="p-8 text-center text-secondary text-xs">
            No source routes indexed yet. Click "Run Static Source Analysis" to parse local repository.
          </div>
        ) : (
          <div className="divide-y divide-border/60 max-h-96 overflow-y-auto font-mono text-xs">
            {routes.map((r: any, idx: number) => (
              <div key={idx} className="py-2.5 px-2 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors">
                <div className="flex items-center space-x-2.5 truncate mr-3">
                  <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold">
                    {r.method}
                  </span>
                  <span className="text-main font-semibold truncate">{r.path}</span>
                </div>
                <span className="text-[11px] text-secondary truncate">{r.file}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
