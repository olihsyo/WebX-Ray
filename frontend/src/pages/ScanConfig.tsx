import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Sliders,
  Globe,
  Compass,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';

const crawlModes = [
  {
    id: 'internal_links',
    title: 'Internal-Link Dynamic Crawl',
    desc: 'Starts from root URL, executes JavaScript in headless Chromium, and follows all discovered internal routes.',
    icon: Compass,
    badge: 'Recommended',
  },
  {
    id: 'sitemap',
    title: 'Sitemap-Based Crawling',
    desc: 'Discovers XML sitemaps via robots.txt and sitemap endpoints to catalog all indexed pages.',
    icon: Globe,
    badge: 'XML Sitemap',
  },
  {
    id: 'dynamic',
    title: 'Browser-Assisted SPA Crawl',
    desc: 'Interacts with client-side routers (React, Vue, Next.js) and extracts dynamic DOM transitions.',
    icon: Layers,
    badge: 'SPA / Hydration',
  },
  {
    id: 'source',
    title: 'Source-Project Route Manifest',
    desc: 'Extracts routes statically from owner-provided backend controllers or router manifests.',
    icon: FileCode,
    badge: 'Code-Backed',
  },
];

export const ScanConfig: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, setActiveScan, addNotification } = useAppStore();

  const [mode, setMode] = useState('internal_links');
  const [maxPages, setMaxPages] = useState(25);
  const [maxDepth, setMaxDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeProject) {
    return (
      <div className="surface-card p-8 text-center text-secondary text-xs">
        Please select or create an active project to configure a scan.
      </div>
    );
  }

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject.target_url) {
      setError('Active project has no target URL configured.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const scan = await api.startScan(activeProject.id, {
        mode,
        max_pages: Number(maxPages),
        max_depth: Number(maxDepth),
      });

      setActiveScan(scan);
      addNotification('success', `Scan initiated in ${mode} mode.`);
      navigate('/scans/monitor');
    } catch (err: any) {
      setError(err.message || 'Failed to start scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-main font-mono">Scan & Crawler Configuration</h1>
          <p className="text-xs text-secondary">
            Set crawl depth, concurrency, discovery modes, and viewport rendering for {activeProject.name}.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartScan} className="space-y-6">
        {/* Target URL Banner */}
        <div className="surface-card p-5 flex items-center justify-between border border-primary/30 bg-primary/5">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <div className="text-[11px] font-mono text-secondary uppercase">Target Endpoint</div>
              <div className="text-sm font-bold text-main font-mono">{activeProject.target_url || 'No URL specified'}</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-primary/15 text-primary text-xs font-mono font-medium border border-primary/30">
            {activeProject.access_profile.replace('_', ' ')}
          </span>
        </div>

        {/* Crawl Mode Cards */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">1. Select Crawl & Discovery Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crawlModes.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-surface-elevated/40 border-border hover:border-border/80 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-secondary'}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-main'}`}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-surface border border-border text-secondary">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Limits & Throttling */}
        <div className="surface-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-main">2. Crawl Bounds & Resource Limits</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-mono text-secondary">Maximum Pages to Scan</label>
                <span className="font-mono font-bold text-primary">{maxPages} pages</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full accent-primary bg-surface-elevated cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-secondary/60 font-mono mt-1">
                <span>1 page (Single target)</span>
                <span>50</span>
                <span>100 pages</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-mono text-secondary">Maximum Crawl Depth</label>
                <span className="font-mono font-bold text-primary">{maxDepth} levels</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="w-full accent-primary bg-surface-elevated cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-secondary/60 font-mono mt-1">
                <span>Level 1 (Direct links)</span>
                <span>Level 3</span>
                <span>Level 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-xs text-secondary hover:text-main font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-background" />
            <span>{loading ? 'Initializing Scan...' : 'Start Dynamic Browser Scan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
