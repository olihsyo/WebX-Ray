import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Palette,
  Type,
  LayoutGrid,
  Maximize2,
  Box,
  Copy,
  Check
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { DesignToken } from '../types';

export const CSSInspector: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'color' | 'typography' | 'radius' | 'spacing'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProject) return;
    const fetchTokens = async () => {
      try {
        const list = await api.getDesignTokens(activeProject.id);
        setTokens(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTokens();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleCopy = (val: string, name: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(name);
    addNotification('info', `Copied "${val}" to clipboard.`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filtered = tokens.filter((t) => activeCategory === 'all' || t.token_type === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeCategory === 'all' ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
            }`}
          >
            All CSS Properties ({tokens.length})
          </button>
          <button
            onClick={() => setActiveCategory('color')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeCategory === 'color' ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
            }`}
          >
            Colors ({tokens.filter((t) => t.token_type === 'color').length})
          </button>
          <button
            onClick={() => setActiveCategory('radius')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activeCategory === 'radius' ? 'bg-primary text-background font-semibold' : 'bg-surface-elevated text-secondary hover:text-main'
            }`}
          >
            Border Radii ({tokens.filter((t) => t.token_type === 'radius').length})
          </button>
        </div>

        <span className="text-xs font-mono text-secondary">
          Computed from active browser DOM inspection
        </span>
      </div>

      {/* Grid of Extracted CSS Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full surface-card p-12 text-center text-secondary text-xs">
            No CSS properties extracted for this category. Run a scan to populate.
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="surface-card p-4 flex items-center justify-between border border-border hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center space-x-3 truncate mr-2">
                {t.token_type === 'color' && (
                  <div
                    className="w-8 h-8 rounded-lg border border-border shadow-inner shrink-0"
                    style={{ backgroundColor: t.value }}
                  />
                )}
                {t.token_type === 'radius' && (
                  <div className="w-8 h-8 rounded-lg border border-primary/40 bg-surface-elevated flex items-center justify-center shrink-0 text-[10px] font-mono text-primary">
                    {t.value}
                  </div>
                )}
                <div className="truncate">
                  <div className="font-mono text-xs font-semibold text-main truncate">{t.name}</div>
                  <div className="text-[11px] font-mono text-secondary truncate">{t.value}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-secondary">
                  {t.usage_count}x
                </span>
                <button
                  onClick={() => handleCopy(t.value, t.name)}
                  className="p-1.5 rounded hover:bg-surface-elevated text-secondary hover:text-main transition-colors"
                  title="Copy value"
                >
                  {copiedToken === t.name ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
