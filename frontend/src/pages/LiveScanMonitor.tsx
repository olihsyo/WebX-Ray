import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  StopCircle,
  ArrowRight,
  Compass,
  FileCode2,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { ScanJob, DiscoveredPage } from '../types';

export const LiveScanMonitor: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeScan, setActiveScan, addNotification } = useAppStore();

  const [scan, setScan] = useState<ScanJob | null>(activeScan);
  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!activeProject) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        if (!scan) {
          const scans = await api.getScans(activeProject.id);
          if (scans.length > 0 && isMounted) {
            setScan(scans[0]);
            setActiveScan(scans[0]);
          }
        } else {
          const updated = await api.getScanStatus(scan.id);
          if (isMounted) setScan(updated);
        }

        const discovered = await api.getPages(activeProject.id);
        if (isMounted) setPages(discovered);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeProject, scan?.id]);

  const handleCancel = async () => {
    if (!scan) return;
    try {
      setCancelling(true);
      const updated = await api.cancelScan(scan.id);
      setScan(updated);
      addNotification('warning', 'Scan was cancelled by user.');
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to cancel scan.');
    } finally {
      setCancelling(false);
    }
  };

  if (!activeProject || !scan) {
    return (
      <div className="surface-card p-12 text-center text-secondary text-xs space-y-3">
        <Activity className="w-8 h-8 text-primary mx-auto animate-pulse" />
        <h3 className="text-sm font-semibold text-main">No Active Scan Session</h3>
        <p className="max-w-xs mx-auto">Launch a new crawl session from the Scan Configuration screen.</p>
        <button
          onClick={() => navigate('/scans/config')}
          className="px-4 py-2 bg-primary text-background font-semibold rounded-lg text-xs"
        >
          Go to Scan Config
        </button>
      </div>
    );
  }

  const progressPercent = scan.pages_discovered > 0
    ? Math.min(100, Math.round((scan.pages_analyzed / scan.pages_discovered) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-main font-mono">Live Browser Scan Monitor</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                scan.status === 'running'
                  ? 'bg-primary/20 text-primary border border-primary/40 animate-pulse'
                  : scan.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-border text-secondary'
              }`}
            >
              {scan.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-secondary font-mono">
            Mode: {scan.mode.replace('_', ' ')} • Target: {activeProject.target_url}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {scan.status === 'running' ? (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center space-x-1.5 px-4 py-2 bg-error/20 hover:bg-error/30 text-error text-xs rounded-lg border border-error/40 font-semibold transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Crawl'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/blueprint')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-ai/20 hover:bg-ai/30 text-ai text-xs rounded-lg border border-ai/40 font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Proceed to AI Blueprint</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Real-Time Counters */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-secondary">Crawl & Rendering Progress</span>
          <span className="text-primary font-bold">{scan.pages_analyzed} of {scan.pages_discovered} pages analyzed ({progressPercent}%)</span>
        </div>

        <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border text-center">
            <div className="text-[10px] font-mono text-secondary uppercase">Discovered</div>
            <div className="text-xl font-bold font-mono text-main">{scan.pages_discovered}</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border text-center">
            <div className="text-[10px] font-mono text-secondary uppercase">Analyzed</div>
            <div className="text-xl font-bold font-mono text-primary">{scan.pages_analyzed}</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border text-center">
            <div className="text-[10px] font-mono text-secondary uppercase">Max Depth</div>
            <div className="text-xl font-bold font-mono text-main">{scan.max_depth}</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border text-center">
            <div className="text-[10px] font-mono text-secondary uppercase">Max Limit</div>
            <div className="text-xl font-bold font-mono text-secondary">{scan.max_pages}</div>
          </div>
        </div>
      </div>

      {/* Discovered Pages Live Feed */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-main">Live Discovered Routes & DOM Snapshots</h3>
          </div>
          <span className="text-xs font-mono text-secondary">{pages.length} recorded</span>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-10 text-secondary text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span>Discovering initial routes from headless Chromium...</span>
          </div>
        ) : (
          <div className="divide-y divide-border/60 max-h-96 overflow-y-auto">
            {pages.map((p) => (
              <div
                key={p.id}
                className="py-3 px-2 flex items-center justify-between text-xs hover:bg-surface-elevated/40 transition-colors"
              >
                <div className="flex items-center space-x-3 truncate mr-4">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      p.analysis_status === 'completed'
                        ? 'bg-primary'
                        : p.analysis_status === 'failed'
                        ? 'bg-error'
                        : 'bg-ai animate-pulse'
                    }`}
                  />
                  <div className="truncate">
                    <div className="font-mono text-main truncate font-medium">{p.path}</div>
                    <div className="text-[11px] text-secondary truncate">{p.title || 'Rendering title...'}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated text-secondary">
                    {p.page_type}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${p.http_status === 200 ? 'text-primary bg-primary/10' : 'text-warning bg-warning/10'}`}>
                    HTTP {p.http_status}
                  </span>
                  <span className="text-secondary/70">
                    Depth {p.depth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
