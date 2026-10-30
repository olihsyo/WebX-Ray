import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Monitor,
  FileCode2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { DiscoveredPage } from '../types';

export const PageExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useAppStore();

  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<DiscoveredPage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchPages = async () => {
      try {
        setLoading(true);
        const list = await api.getPages(activeProject.id);
        setPages(list);
        if (list.length > 0) setSelectedPage(list[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const filtered = pages.filter((p) => {
    const matchesSearch = p.path.toLowerCase().includes(searchQuery.toLowerCase()) || (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.page_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="surface-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter routes (/dashboard, /login)..."
              className="w-full bg-surface-elevated text-main text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-elevated text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Page Types</option>
            <option value="home">Home / Root</option>
            <option value="auth">Auth / Login</option>
            <option value="dashboard">Dashboard</option>
            <option value="landing">Landing</option>
            <option value="list">Catalog / List</option>
            <option value="detail">Detail View</option>
          </select>
        </div>

        <div className="text-xs font-mono text-secondary">
          Showing {filtered.length} of {pages.length} discovered pages
        </div>
      </div>

      {/* Split View: List on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Page Table */}
        <div className="lg:col-span-7 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-main">Route Hierarchy Inventory</h2>
            <span className="text-[11px] font-mono text-primary">{pages.length} Routes</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-secondary text-xs">No pages matching criteria.</div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {filtered.map((page) => {
                const isSelected = selectedPage?.id === page.id;
                return (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-surface-elevated/50'
                    }`}
                  >
                    <div className="truncate mr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-main truncate">{page.path}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-secondary font-mono">
                          {page.page_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-secondary truncate mt-0.5">{page.title || 'Untitled Document'}</div>
                    </div>

                    <div className="flex items-center space-x-3 text-right shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${page.http_status === 200 ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                        HTTP {page.http_status}
                      </span>
                      <span className="text-[11px] font-mono text-secondary">
                        {Math.round(page.confidence_level * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Page Inspector Card */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4 sticky top-6">
          {selectedPage ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-main font-mono truncate">{selectedPage.path}</h3>
                  <div className="text-xs text-secondary truncate">{selectedPage.title || 'Untitled'}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono">
                  {selectedPage.analysis_status}
                </span>
              </div>

              {/* Screenshot Preview */}
              <div className="w-full h-56 bg-surface-elevated rounded-lg border border-border overflow-hidden relative group flex items-center justify-center">
                {selectedPage.screenshot_path ? (
                  <img
                    src={`/storage/${activeProject.id}/screenshots/${selectedPage.id}_desktop.png`}
                    alt={selectedPage.path}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-xs text-secondary font-mono">No Screenshot Rendered</div>
                )}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-surface-elevated border border-border">
                  <span className="text-[10px] text-secondary block uppercase">Discovery</span>
                  <span className="text-main">{selectedPage.discovery_method}</span>
                </div>
                <div className="p-2 rounded bg-surface-elevated border border-border">
                  <span className="text-[10px] text-secondary block uppercase">Crawl Depth</span>
                  <span className="text-main">Level {selectedPage.depth}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  onClick={() => navigate('/browser')}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-primary/15 hover:bg-primary/25 text-primary text-xs rounded-lg border border-primary/30 font-semibold transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Inspect in Browser Engine</span>
                </button>
                <button
                  onClick={() => navigate('/dom')}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-surface-elevated hover:bg-border text-secondary hover:text-main text-xs rounded-lg border border-border font-medium transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>View DOM Hierarchy</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-secondary text-xs">
              Select a page from the inventory list to view inspection details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
