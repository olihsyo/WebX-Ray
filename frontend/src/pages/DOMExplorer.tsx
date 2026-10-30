import React, { useEffect, useState } from 'react';
import {
  FileCode2,
  ChevronRight,
  ChevronDown,
  Search,
  Layers,
  Sliders,
  Code
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { DiscoveredPage, PageSnapshot } from '../types';

export const DOMExplorer: React.FC = () => {
  const { activeProject } = useAppStore();

  const [pages, setPages] = useState<DiscoveredPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [snapshots, setSnapshots] = useState<PageSnapshot[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!activeProject) return;
    const load = async () => {
      const pList = await api.getPages(activeProject.id);
      setPages(pList);
      if (pList.length > 0) setSelectedPageId(pList[0].id);
    };
    load();
  }, [activeProject]);

  useEffect(() => {
    if (!selectedPageId) return;
    const loadSnapshots = async () => {
      const data = await api.getPageSnapshots(selectedPageId);
      setSnapshots(data);
      if (data.length > 0) {
        const elements = data[0].dom_tree_json?.elements || [];
        if (elements.length > 0) setSelectedNode(elements[0]);
      }
    };
    loadSnapshots();
  }, [selectedPageId]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const elements: any[] = snapshots[0]?.dom_tree_json?.elements || [];
  const filteredElements = elements.filter((el) => {
    const text = (el.tagName + ' ' + (el.id || '') + ' ' + el.classes.join(' ')).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Selector & Search Bar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <FileCode2 className="w-4 h-4 text-primary" />
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="bg-surface-elevated text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary font-mono cursor-pointer"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.path} ({p.title || 'Untitled'})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags, classes, or IDs..."
            className="w-full bg-surface-elevated text-main text-xs rounded-lg pl-9 pr-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Split Pane: DOM Tree vs Node Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: DOM Nodes Tree */}
        <div className="lg:col-span-7 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-main">Extracted DOM Hierarchy</h3>
            <span className="text-xs font-mono text-secondary">{elements.length} nodes parsed</span>
          </div>

          <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto font-mono text-xs">
            {filteredElements.slice(0, 150).map((el, idx) => {
              const isSelected = selectedNode?.index === el.index;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedNode(el)}
                  className={`py-2 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/15 text-primary border-l-2 border-primary font-bold' : 'hover:bg-surface-elevated/60 text-secondary'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <span className="text-emerald-400 font-semibold">&lt;{el.tagName}&gt;</span>
                    {el.id && <span className="text-ai">#{el.id}</span>}
                    {el.classes.length > 0 && (
                      <span className="text-secondary/70 truncate text-[11px]">
                        .{el.classes.slice(0, 2).join('.')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-secondary/60 shrink-0">
                    {el.rect.width}x{el.rect.height}px
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Computed Details */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4 sticky top-6">
          {selectedNode ? (
            <>
              <div className="border-b border-border pb-3">
                <span className="text-[10px] font-mono text-secondary uppercase block">Selected Element</span>
                <div className="text-sm font-bold text-main font-mono">
                  &lt;{selectedNode.tagName}&gt; {selectedNode.id ? `#${selectedNode.id}` : ''}
                </div>
                <div className="text-xs font-mono text-primary mt-0.5 truncate">{selectedNode.selector}</div>
              </div>

              {/* Box Model Dimensions */}
              <div>
                <span className="text-xs font-mono text-secondary block mb-1.5 uppercase text-[10px]">Bounding Box</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[10px] text-secondary block">X</span>
                    <span>{selectedNode.rect.x}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[10px] text-secondary block">Y</span>
                    <span>{selectedNode.rect.y}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[10px] text-secondary block">W</span>
                    <span>{selectedNode.rect.width}px</span>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <span className="text-[10px] text-secondary block">H</span>
                    <span>{selectedNode.rect.height}px</span>
                  </div>
                </div>
              </div>

              {/* Computed CSS Styles */}
              <div>
                <span className="text-xs font-mono text-secondary block mb-1.5 uppercase text-[10px]">Computed CSS</span>
                <div className="space-y-1.5 font-mono text-xs max-h-56 overflow-y-auto">
                  {Object.entries(selectedNode.styles || {}).map(([prop, val]: any) => (
                    <div key={prop} className="p-2 rounded bg-surface-elevated border border-border flex items-center justify-between text-[11px]">
                      <span className="text-secondary">{prop}</span>
                      <span className="text-main truncate max-w-[180px] font-medium">{String(val || 'none')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-secondary text-xs">Select a DOM element to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
