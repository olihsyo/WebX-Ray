import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  Download,
  FileCheck
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { AssetItem } from '../types';

export const AssetExplorer: React.FC = () => {
  const { activeProject } = useAppStore();

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const data = await api.getAssets(activeProject.id);
        setAssets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const filtered = assets.filter((a) => {
    const matchesCat = filterCat === 'all' || a.category === filterCat;
    const matchesSearch = a.original_url.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['all', 'image', 'svg', 'icon', 'font'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                filterCat === cat ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
              }`}
            >
              {cat} ({cat === 'all' ? assets.length : assets.filter((a) => a.category === cat).length})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset URLs..."
            className="w-full bg-surface-elevated text-main text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center text-secondary text-xs">
          No public assets found for this filter. Run a scan to populate.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="surface-card p-3 flex flex-col justify-between border border-border hover:border-primary/40 transition-colors group"
            >
              {/* Asset Preview Box */}
              <div className="w-full h-36 rounded-lg bg-surface-elevated border border-border overflow-hidden flex items-center justify-center p-2 mb-3 relative">
                {asset.category === 'image' || asset.category === 'svg' || asset.category === 'icon' ? (
                  <img
                    src={asset.original_url}
                    alt="Asset"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-secondary flex flex-col items-center space-y-1 font-mono text-[10px]">
                    <FileCheck className="w-6 h-6 text-primary" />
                    <span>{asset.category.toUpperCase()} File</span>
                  </div>
                )}
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface/90 text-primary border border-border">
                  {asset.category}
                </span>
              </div>

              {/* Metadata */}
              <div className="space-y-1 font-mono text-[11px]">
                <a
                  href={asset.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-main hover:text-primary transition-colors flex items-center space-x-1 truncate font-medium"
                >
                  <span className="truncate">{asset.original_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-secondary" />
                </a>

                <div className="flex items-center justify-between text-secondary text-[10px] pt-1 border-t border-border/60">
                  <span>{asset.mime_type || 'image/png'}</span>
                  <span>{asset.width && asset.height ? `${asset.width}x${asset.height}px` : 'Dynamic'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
