import React, { useEffect, useState } from 'react';
import {
  Wifi,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { NetworkObservation } from '../types';

export const NetworkExplorer: React.FC = () => {
  const { activeProject } = useAppStore();

  const [observations, setObservations] = useState<NetworkObservation[]>([]);
  const [selectedObs, setSelectedObs] = useState<NetworkObservation | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchObs = async () => {
      try {
        setLoading(true);
        const data = await api.getNetworkObservations(activeProject.id);
        setObservations(data);
        if (data.length > 0) setSelectedObs(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchObs();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const filtered = observations.filter((o) => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'api' && o.is_api_candidate) ||
      (filterType === 'fetch' && (o.resource_type === 'xhr' || o.resource_type === 'fetch'));
    const matchesSearch = o.url.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              filterType === 'all' ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
            }`}
          >
            All Requests ({observations.length})
          </button>
          <button
            onClick={() => setFilterType('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              filterType === 'api' ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
            }`}
          >
            API Endpoints ({observations.filter((o) => o.is_api_candidate).length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request URLs..."
            className="w-full bg-surface-elevated text-main text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Requests Table */}
        <div className="lg:col-span-7 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-main">Network Activity Stream</h2>
            <span className="text-xs font-mono text-secondary">{filtered.length} captured</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center text-secondary text-xs">No network events recorded.</div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto font-mono text-xs">
              {filtered.map((obs) => {
                const isSelected = selectedObs?.id === obs.id;
                return (
                  <div
                    key={obs.id}
                    onClick={() => setSelectedObs(obs)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-surface-elevated/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          obs.method === 'GET'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : obs.method === 'POST'
                            ? 'bg-ai/15 text-ai'
                            : 'bg-warning/15 text-warning'
                        }`}
                      >
                        {obs.method}
                      </span>
                      <span className="text-main truncate text-[11px] font-medium">{obs.url}</span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-right">
                      {obs.is_api_candidate && (
                        <span className="px-1.5 py-0.2 rounded bg-ai/20 text-ai text-[9px] border border-ai/30">
                          API
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          obs.status_code >= 200 && obs.status_code < 300
                            ? 'text-primary bg-primary/10'
                            : 'text-error bg-error/10'
                        }`}
                      >
                        {obs.status_code}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Request & Redacted Headers Inspector */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4 sticky top-6">
          {selectedObs ? (
            <>
              <div className="border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary/15 text-primary">
                    {selectedObs.method}
                  </span>
                  <span className="text-xs font-mono text-secondary uppercase">{selectedObs.resource_type}</span>
                </div>
                <div className="text-xs font-mono text-main font-semibold break-all mt-1">{selectedObs.url}</div>
              </div>

              {/* Redacted Headers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-secondary uppercase">Sanitized Response Headers</span>
                  <span className="flex items-center space-x-1 text-[10px] font-mono text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Redaction Applied</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-border max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {Object.entries(selectedObs.headers_json || {}).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-border/40 pb-1">
                      <span className="text-secondary mr-2">{k}:</span>
                      <span className="text-main truncate max-w-[200px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inferred Schema Preview */}
              {selectedObs.is_api_candidate && (
                <div>
                  <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Inferred Response Schema</span>
                  <pre className="p-3 rounded-lg bg-surface-elevated border border-border text-[11px] font-mono text-primary overflow-x-auto max-h-40">
                    {JSON.stringify(selectedObs.response_schema_json, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-secondary text-xs">Select an observation to inspect details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
