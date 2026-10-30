import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Eye,
  Code,
  Sparkles,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { ComponentItem } from '../types';

const categories = ['all', 'header', 'navigation', 'footer', 'button', 'card', 'form', 'input', 'sidebar', 'modal'];

export const ComponentExplorer: React.FC = () => {
  const { activeProject } = useAppStore();

  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<ComponentItem | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchComps = async () => {
      try {
        setLoading(true);
        const data = await api.getComponents(activeProject.id, category === 'all' ? undefined : category);
        setComponents(data);
        if (data.length > 0) setSelectedComp(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComps();
  }, [activeProject, category]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const filtered = components.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dom_selector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors ${
                category === cat
                  ? 'bg-primary text-background font-semibold'
                  : 'bg-surface-elevated text-secondary hover:text-main'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full bg-surface-elevated text-main text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Component Cards Grid */}
        <div className="lg:col-span-7 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-main">Detected UI Component Inventory</h2>
            <span className="text-xs font-mono text-primary">{filtered.length} components</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-10 text-center text-secondary text-xs">No components match active filter.</div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {filtered.map((comp) => {
                const isSelected = selectedComp?.id === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComp(comp)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-surface-elevated/50'
                    }`}
                  >
                    <div className="truncate mr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-main">{comp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-secondary font-mono capitalize">
                          {comp.category}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-secondary truncate mt-1">
                        {comp.dom_selector}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-right">
                      <div className="text-[11px] font-mono">
                        <span className="text-secondary block text-[9px] uppercase">Reusability</span>
                        <span className="text-primary font-bold">{Math.round(comp.reusability_score * 100)}%</span>
                      </div>
                      <div className="text-[11px] font-mono">
                        <span className="text-secondary block text-[9px] uppercase">Confidence</span>
                        <span className="text-main font-bold">{Math.round(comp.confidence_score * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Component Detail Card */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4 sticky top-6">
          {selectedComp ? (
            <>
              <div className="border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-secondary uppercase">Component Identifier</span>
                  <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono capitalize">
                    {selectedComp.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-main font-mono mt-1">{selectedComp.name}</h3>
                <div className="text-xs font-mono text-primary truncate mt-0.5">{selectedComp.dom_selector}</div>
              </div>

              {/* Bounding Geometry */}
              <div>
                <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Bounding Box Dimensions</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[9px] text-secondary block">X</span>
                    <span>{selectedComp.bounding_box_json.x || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[9px] text-secondary block">Y</span>
                    <span>{selectedComp.bounding_box_json.y || 0}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[9px] text-secondary block">W</span>
                    <span>{selectedComp.bounding_box_json.width || 0}px</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[9px] text-secondary block">H</span>
                    <span>{selectedComp.bounding_box_json.height || 0}px</span>
                  </div>
                </div>
              </div>

              {/* Responsive & Interaction Notes */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-[10px] font-mono text-secondary uppercase block mb-0.5">Interaction Description</span>
                  <p className="text-secondary">{selectedComp.interaction_desc || 'Standard element.'}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                  <span className="text-[10px] font-mono text-secondary uppercase block mb-0.5">Responsive Behavior</span>
                  <p className="text-secondary">{selectedComp.responsive_behavior || 'Adaptive layout container.'}</p>
                </div>
              </div>

              {/* Visual CSS Properties */}
              <div>
                <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Key Visual Properties</span>
                <div className="space-y-1 font-mono text-[11px] max-h-44 overflow-y-auto">
                  {Object.entries(selectedComp.visual_properties_json || {}).map(([k, v]: any) => (
                    <div key={k} className="p-2 rounded bg-surface-elevated border border-border flex items-center justify-between">
                      <span className="text-secondary">{k}</span>
                      <span className="text-main font-semibold truncate max-w-[180px]">{String(v || 'none')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-secondary text-xs">Select a component to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
