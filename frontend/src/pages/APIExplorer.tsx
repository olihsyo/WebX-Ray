import React, { useEffect, useState } from 'react';
import {
  Terminal,
  Download,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  FileCode
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { ApiContract } from '../types';

export const APIExplorer: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await api.getApiContracts(activeProject.id);
        setContracts(data);
        if (data.length > 0) setSelectedContract(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Terminal className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-main font-mono">Synthesized API & Endpoint Contracts</h1>
          </div>
          <p className="text-xs text-secondary">
            Inferred non-destructive JSON contracts and REST schema endpoints observed during browser execution.
          </p>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(contracts, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `api-contracts-${activeProject.name.replace(' ', '_')}.json`;
            a.click();
            addNotification('success', 'Exported api-contracts.json');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export api-contracts.json</span>
        </button>
      </div>

      {/* Split Pane: Endpoints List on Left, Schema on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Endpoint Contracts */}
        <div className="lg:col-span-6 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-main">Observed Endpoints</h2>
            <span className="text-xs font-mono text-primary">{contracts.length} contracts</span>
          </div>

          {contracts.length === 0 ? (
            <div className="p-10 text-center text-secondary text-xs">
              No API requests observed yet. Crawl pages that perform dynamic data fetching.
            </div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {contracts.map((c) => {
                const isSelected = selectedContract?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContract(c)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-surface-elevated/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.method === 'GET'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-ai/15 text-ai'
                        }`}
                      >
                        {c.method}
                      </span>
                      <span className="font-mono text-xs font-semibold text-main truncate">{c.endpoint_path}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 font-mono text-[10px]">
                      {c.auth_required ? (
                        <span className="flex items-center space-x-1 text-warning px-1.5 py-0.5 rounded bg-warning/10 border border-warning/20">
                          <Lock className="w-3 h-3" />
                          <span>Auth</span>
                        </span>
                      ) : (
                        <span className="text-secondary/70">Public</span>
                      )}
                      <span className="text-secondary">
                        {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inferred Schema & Contract Details */}
        <div className="lg:col-span-6 surface-card p-5 space-y-4 sticky top-6">
          {selectedContract ? (
            <>
              <div className="border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary/15 text-primary">
                    {selectedContract.method}
                  </span>
                  <span className="text-xs font-mono text-main font-bold truncate">{selectedContract.endpoint_path}</span>
                </div>
                <p className="text-xs text-secondary mt-1">{selectedContract.summary}</p>
              </div>

              {/* Status Codes & Confidence */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-[10px] text-secondary uppercase block mb-1">Status Codes</span>
                  <div className="flex items-center space-x-1.5">
                    {selectedContract.status_codes_json.map((st) => (
                      <span key={st} className="px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-[10px] text-secondary uppercase block mb-1">Confidence</span>
                  <span className="text-main font-bold">{Math.round(selectedContract.confidence * 100)}% Evidence Score</span>
                </div>
              </div>

              {/* Inferred JSON Schema */}
              <div>
                <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Inferred Response Schema</span>
                <pre className="p-4 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-primary overflow-x-auto max-h-64 leading-relaxed">
                  {JSON.stringify(selectedContract.response_schema_json, null, 2)}
                </pre>
              </div>

              {/* Evidence Reference */}
              <div className="p-3 rounded-lg bg-surface-elevated border border-border text-[11px] font-mono text-secondary">
                <span className="text-[10px] uppercase block mb-0.5 text-secondary/70">Evidence Chain</span>
                <span>{selectedContract.source_evidence}</span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-secondary text-xs">Select an API contract to inspect schemas.</div>
          )}
        </div>
      </div>
    </div>
  );
};
