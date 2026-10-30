import React, { useEffect, useState } from 'react';
import {
  Palette,
  Type,
  Box,
  Layers,
  Download,
  Copy,
  Check,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { DesignToken } from '../types';

export const DesignSystemViewer: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [tokens, setTokens] = useState<DesignToken[]>([]);
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

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(label);
    addNotification('info', `Copied "${val}" to clipboard.`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colors = tokens.filter((t) => t.token_type === 'color');
  const radii = tokens.filter((t) => t.token_type === 'radius');

  const typographyScale = [
    { name: 'text-xs', size: '12px', lh: '16px', sample: 'Microcopy & Meta Badges' },
    { name: 'text-sm', size: '14px', lh: '20px', sample: 'Body & Secondary Descriptions' },
    { name: 'text-base', size: '16px', lh: '24px', sample: 'Standard Paragraph & Content' },
    { name: 'text-lg', size: '18px', lh: '28px', sample: 'Subheadings & Card Titles' },
    { name: 'text-xl', size: '20px', lh: '28px', sample: 'Section Headers & Modals' },
    { name: 'text-2xl', size: '24px', lh: '32px', sample: 'Page Titles & Main Hero' },
  ];

  const spacingScale = [
    { token: 'space-1', value: '4px', desc: 'Minimal offset' },
    { token: 'space-2', value: '8px', desc: 'Compact padding' },
    { token: 'space-3', value: '12px', desc: 'Card border spacing' },
    { token: 'space-4', value: '16px', desc: 'Standard element gap' },
    { token: 'space-6', value: '24px', desc: 'Section padding' },
    { token: 'space-8', value: '32px', desc: 'Major container padding' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-ai/30 bg-ai/5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Palette className="w-5 h-5 text-ai" />
            <h1 className="text-xl font-bold text-main font-mono">Extracted Design System Specifications</h1>
          </div>
          <p className="text-xs text-secondary">
            Verified design tokens extracted from {activeProject.name} computed stylesheets and visual layout engine.
          </p>
        </div>

        <button
          onClick={() => {
            const jsonStr = JSON.stringify(tokens, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `design-system-${activeProject.name.replace(' ', '_')}.json`;
            a.click();
            addNotification('success', 'Downloaded design-system.json');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-ai hover:bg-ai/90 text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-ai/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export design-system.json</span>
        </button>
      </div>

      {/* 1. Color Palette Section */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-main">1. Color Palette Tokens ({colors.length})</h2>
          </div>
          <span className="text-xs font-mono text-secondary">Tailwind Compatible Hex/RGB</span>
        </div>

        {colors.length === 0 ? (
          <div className="py-8 text-center text-secondary text-xs">Run a crawl to populate color tokens.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border flex items-center justify-between group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center space-x-3 truncate mr-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-border/80 shadow-inner shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  <div className="truncate">
                    <span className="text-[11px] font-mono text-secondary block capitalize">{c.category}</span>
                    <span className="text-xs font-bold text-main font-mono truncate block">{c.value}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(c.value, c.id)}
                  className="p-1.5 rounded hover:bg-surface text-secondary hover:text-main"
                  title="Copy color"
                >
                  {copiedToken === c.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Typography Hierarchy */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-border pb-3">
          <Type className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-main">2. Typography Scale & Hierarchy</h2>
        </div>

        <div className="divide-y divide-border/60">
          {typographyScale.map((t) => (
            <div key={t.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-mono text-xs w-48 shrink-0">
                <span className="text-primary font-semibold">{t.name}</span>
                <span className="text-secondary/70 ml-2">({t.size} / {t.lh})</span>
              </div>
              <div className="text-main" style={{ fontSize: t.size, lineHeight: t.lh }}>
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Spacing Scale & Border Radii */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spacing */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Layers className="w-4 h-4 text-ai" />
            <h2 className="text-sm font-semibold text-main">3. Spacing System (8pt Grid)</h2>
          </div>

          <div className="space-y-2">
            {spacingScale.map((s) => (
              <div key={s.token} className="p-2.5 rounded bg-surface-elevated border border-border flex items-center justify-between text-xs font-mono">
                <span className="text-main font-semibold">{s.token}</span>
                <span className="text-secondary">{s.desc}</span>
                <span className="text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Border Radii */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Box className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-main">4. Border Radii & Elevation</h2>
          </div>

          {radii.length === 0 ? (
            <div className="p-6 text-center text-secondary text-xs">Run scan to extract radii.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {radii.map((r) => (
                <div key={r.id} className="p-3 rounded bg-surface-elevated border border-border flex items-center justify-between text-xs font-mono">
                  <span className="text-main font-semibold">{r.name}</span>
                  <span className="text-primary">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
