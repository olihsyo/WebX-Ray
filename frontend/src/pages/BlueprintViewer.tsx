import React, { useEffect, useState } from 'react';
import {
  ScrollText,
  FileCode,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { Blueprint } from '../types';

export const BlueprintViewer: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('complete-blueprint.md');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBlueprints = async () => {
    if (!activeProject) return;
    try {
      const list = await api.getBlueprints(activeProject.id);
      setBlueprints(list);
      if (list.length > 0) setActiveBlueprint(list[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const bp = await api.generateBlueprint(activeProject.id, `${activeProject.name} Reconstruction Blueprint`);
      setActiveBlueprint(bp);
      setBlueprints([bp, ...blueprints]);
      addNotification('success', 'Synthesized new master reconstruction blueprint.');
    } catch (err: any) {
      addNotification('error', err.message || 'Blueprint generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const getFileContent = (): string => {
    if (!activeBlueprint) return '# No Blueprint Generated Yet\nClick "Generate Master Blueprint" to synthesize one from collected evidence.';
    switch (selectedFile) {
      case 'complete-blueprint.md':
        return activeBlueprint.complete_blueprint_md;
      case 'website-analysis.json':
        return JSON.stringify(activeBlueprint.website_analysis_json, null, 2);
      case 'implementation-roadmap.md':
        return activeBlueprint.implementation_roadmap_md;
      case 'testing-requirements.md':
        return activeBlueprint.testing_requirements_md;
      case 'reconstruction-master-prompt.md':
        return activeBlueprint.reconstruction_master_prompt_md;
      case 'claude-code.md':
        return activeBlueprint.claude_prompt_md;
      case 'gemini.md':
        return activeBlueprint.gemini_prompt_md;
      case 'antigravity.md':
        return activeBlueprint.antigravity_prompt_md;
      case 'cursor.md':
        return activeBlueprint.cursor_prompt_md;
      case 'generic-agent.md':
        return activeBlueprint.generic_prompt_md;
      default:
        return activeBlueprint.complete_blueprint_md;
    }
  };

  const content = getFileContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    addNotification('info', `Copied ${selectedFile} to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    a.click();
    addNotification('success', `Downloaded ${selectedFile}`);
  };

  const files = [
    { id: 'complete-blueprint.md', label: 'complete-blueprint.md', badge: 'Master Doc' },
    { id: 'website-analysis.json', label: 'website-analysis.json', badge: 'Metrics' },
    { id: 'implementation-roadmap.md', label: 'implementation-roadmap.md', badge: 'Phases' },
    { id: 'testing-requirements.md', label: 'testing-requirements.md', badge: 'QA' },
    { id: 'reconstruction-master-prompt.md', label: 'reconstruction-master-prompt.md', badge: 'Prompt' },
    { id: 'antigravity.md', label: 'ai-prompts/antigravity.md', badge: 'AGY' },
    { id: 'claude-code.md', label: 'ai-prompts/claude-code.md', badge: 'Claude' },
    { id: 'gemini.md', label: 'ai-prompts/gemini.md', badge: 'Gemini' },
    { id: 'cursor.md', label: 'ai-prompts/cursor.md', badge: 'Cursor' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-ai/40 bg-ai/5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <ScrollText className="w-5 h-5 text-ai" />
            <h1 className="text-xl font-bold text-main font-mono">Master AI Reconstruction Blueprint</h1>
          </div>
          <p className="text-xs text-secondary">
            AI-independent technical specification package. Ready for consumption by Claude Code, Gemini, Antigravity, or Cursor.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center space-x-2 px-4 py-2 bg-ai hover:bg-ai/90 text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-ai/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Synthesizing...' : 'Generate New Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* Split Explorer: File List on Left, Editor/Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Blueprint Package Files */}
        <div className="lg:col-span-4 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-main">Package Manifest</h3>
            <span className="text-xs font-mono text-ai">15 Files</span>
          </div>

          <div className="divide-y divide-border/60">
            {files.map((f) => {
              const isSelected = selectedFile === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFile(f.id)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-ai/15 text-ai border-l-2 border-ai font-semibold' : 'text-secondary hover:text-main hover:bg-surface-elevated/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono truncate">{f.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border shrink-0">
                    {f.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Viewer / Editor */}
        <div className="lg:col-span-8 surface-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-main">{selectedFile}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-surface-elevated hover:bg-border text-secondary hover:text-main text-xs font-mono border border-border transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-surface-elevated hover:bg-border text-secondary hover:text-main text-xs font-mono border border-border transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-main/90 overflow-x-auto max-h-[68vh] leading-relaxed whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};
