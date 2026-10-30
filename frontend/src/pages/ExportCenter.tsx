import React, { useEffect, useState } from 'react';
import {
  Download,
  FileArchive,
  FileText,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { ExportJob } from '../types';

export const ExportCenter: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [exports, setExports] = useState<ExportJob[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchExports = async () => {
      try {
        const data = await api.getExports(activeProject.id);
        setExports(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExports();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleExportZip = async () => {
    try {
      setExporting(true);
      const res = await api.exportProject(activeProject.id, 'zip');
      setExports([res, ...exports]);
      addNotification('success', 'Created full AI Reconstruction ZIP package.');
      // Auto-trigger download
      window.location.href = `/api/exports/${res.id}/download`;
    } catch (err: any) {
      addNotification('error', err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Download className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-main font-mono">Export & Delivery Center</h1>
          </div>
          <p className="text-xs text-secondary">
            Package verified blueprints, design tokens, component hierarchies, screenshots, and AI agent prompts.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Sanitized: Zero Secrets or Private Credentials</span>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: Full ZIP */}
        <div className="surface-card p-6 flex flex-col justify-between space-y-4 border border-primary/40 bg-primary/5">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <FileArchive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-main font-mono">1. Full Reconstruction ZIP Package</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Complete archive containing the 15-file blueprint structure, analysis subfolders, diagrams, screenshot assets, and specialized prompts for Claude Code, Gemini, Antigravity, and Cursor.
            </p>
          </div>

          <button
            onClick={handleExportZip}
            disabled={exporting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Packaging Archive...' : 'Download Full ZIP Bundle'}</span>
          </button>
        </div>

        {/* Option 2: Master Blueprint Markdown */}
        <div className="surface-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-ai/20 flex items-center justify-center text-ai">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-main font-mono">2. Master Blueprint Markdown</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Single consolidated Markdown blueprint (`complete-blueprint.md`) containing page routes, component trees, design system tokens, and non-invention rules.
            </p>
          </div>

          <button
            onClick={async () => {
              const bps = await api.getBlueprints(activeProject.id);
              if (bps.length > 0) {
                const blob = new Blob([bps[0].complete_blueprint_md], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `complete-blueprint-${activeProject.name.replace(' ', '_')}.md`;
                a.click();
                addNotification('success', 'Downloaded complete-blueprint.md');
              } else {
                addNotification('warning', 'Please generate a blueprint first.');
              }
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-surface-elevated hover:bg-border text-main font-semibold text-xs rounded-lg border border-border transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download complete-blueprint.md</span>
          </button>
        </div>

        {/* Option 3: Analysis JSON */}
        <div className="surface-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-secondary">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-main font-mono">3. Technical Specifications JSON</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Machine-readable structured technical blueprint and metadata index (`website-analysis.json`) for automated pipelines.
            </p>
          </div>

          <button
            onClick={async () => {
              const bps = await api.getBlueprints(activeProject.id);
              if (bps.length > 0) {
                const blob = new Blob([JSON.stringify(bps[0].website_analysis_json, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `website-analysis-${activeProject.name.replace(' ', '_')}.json`;
                a.click();
                addNotification('success', 'Downloaded website-analysis.json');
              } else {
                addNotification('warning', 'Please generate a blueprint first.');
              }
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-surface-elevated hover:bg-border text-main font-semibold text-xs rounded-lg border border-border transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <span>Download website-analysis.json</span>
          </button>
        </div>
      </div>

      {/* Export History Table */}
      <div className="surface-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-main">Generated Packages & Download History</h2>

        {exports.length === 0 ? (
          <div className="p-8 text-center text-secondary text-xs">
            No previous exports generated. Click "Download Full ZIP Bundle" above to create your first package.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {exports.map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 truncate mr-4">
                  <FileArchive className="w-4 h-4 text-primary shrink-0" />
                  <div className="truncate">
                    <div className="font-mono text-main font-semibold truncate">
                      {job.file_path.split('\\').pop() || job.file_path.split('/').pop()}
                    </div>
                    <div className="text-[11px] text-secondary font-mono">
                      {(job.file_size / 1024).toFixed(1)} KB • {new Date(job.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <a
                  href={`/api/exports/${job.id}/download`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary text-xs rounded-lg border border-primary/30 font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
