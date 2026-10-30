import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Play,
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCode,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { AIAnalysis } from '../types';

const analysisTasks = [
  { id: 'page_structure', name: '1. Page Structure Analysis', desc: 'Synthesizes route hierarchy, page types, and layout relationships.' },
  { id: 'component', name: '2. Component Architecture Analysis', desc: 'Identifies reusable visual elements, bounding boxes, and states.' },
  { id: 'design_system', name: '3. Design System Synthesis', desc: 'Extracts cohesive color tokens, typography scales, and spacing systems.' },
  { id: 'api_contract', name: '4. API Contract & Schema Analysis', desc: 'Derives REST endpoint schemas from observed network events.' },
  { id: 'backend_arch', name: '5. Backend Architecture Analysis', desc: 'Maps controllers, routes, and services from source evidence.' },
  { id: 'database_arch', name: '6. Database Architecture Modeling', desc: 'Analyzes entity relationships and constructs ER models.' },
  { id: 'reconstruction_plan', name: '7. Reconstruction Planning', desc: 'Builds phase-by-phase implementation instructions for coding agents.' },
  { id: 'quality_verification', name: '8. Quality & Regression Verification', desc: 'Defines visual similarity targets and functional criteria.' },
];

export const AIAnalysisWorkspace: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [selectedTask, setSelectedTask] = useState('reconstruction_plan');
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [customPrompt, setCustomPrompt] = useState('');
  const [running, setRunning] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    if (!activeProject) return;
    const fetchAnalyses = async () => {
      try {
        const data = await api.getAIAnalyses(activeProject.id);
        setAnalyses(data);
        if (data.length > 0) setActiveAnalysis(data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalyses();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleRunTask = async () => {
    try {
      setRunning(true);
      const res = await api.runAIAnalysis(activeProject.id, {
        task_type: selectedTask,
        provider: selectedProvider,
        custom_prompt: customPrompt.trim() || undefined,
      });
      setAnalyses([res, ...analyses]);
      setActiveAnalysis(res);
      addNotification('success', `Completed AI analysis for ${selectedTask.replace('_', ' ')}.`);
    } catch (err: any) {
      addNotification('error', err.message || 'AI analysis task failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-ai/30 bg-ai/5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <BrainCircuit className="w-5 h-5 text-ai" />
            <h1 className="text-xl font-bold text-main font-mono">AI Intelligence & Synthesis Workspace</h1>
          </div>
          <p className="text-xs text-secondary">
            Execute structured AI technical analysis tasks against verified DOM, CSS, network, and source evidence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-surface-elevated text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-ai font-mono cursor-pointer"
          >
            <option value="gemini">Google Gemini 2.5 Flash</option>
            <option value="openai">OpenAI GPT-4o-mini</option>
            <option value="local">Local Heuristic Engine (Offline)</option>
          </select>

          <button
            onClick={handleRunTask}
            disabled={running}
            className="flex items-center space-x-2 px-4 py-2 bg-ai hover:bg-ai/90 text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-ai/20 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{running ? 'Synthesizing...' : 'Run Analysis Task'}</span>
          </button>
        </div>
      </div>

      {/* Task Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {analysisTasks.map((t) => {
          const isSelected = selectedTask === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-ai/15 border-ai shadow-sm text-ai'
                  : 'bg-surface border-border hover:border-border/80 text-secondary hover:text-main'
              }`}
            >
              <div className="text-xs font-semibold font-mono mb-1">{t.name}</div>
              <p className="text-[11px] text-secondary leading-relaxed line-clamp-2">{t.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Results Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Previous Analyses List */}
        <div className="lg:col-span-4 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-main">Analysis History</h3>
            <span className="text-xs font-mono text-secondary">{analyses.length} runs</span>
          </div>

          {analyses.length === 0 ? (
            <div className="p-8 text-center text-secondary text-xs">
              No AI analyses executed yet. Choose a task above and click "Run Analysis Task".
            </div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[60vh] overflow-y-auto">
              {analyses.map((a) => {
                const isSelected = activeAnalysis?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setActiveAnalysis(a)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-ai/15 border-l-2 border-ai' : 'hover:bg-surface-elevated/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-main capitalize truncate">
                        {a.task_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-secondary">
                        {a.provider}
                      </span>
                    </div>
                    <div className="text-[10px] text-secondary font-mono flex items-center justify-between">
                      <span>{a.findings_json?.length || 0} findings</span>
                      <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Findings Card */}
        <div className="lg:col-span-8 surface-card p-6 space-y-4">
          {activeAnalysis ? (
            <>
              {/* Header details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-main font-mono capitalize">
                    {activeAnalysis.task_type.replace('_', ' ')} Findings
                  </h3>
                  <div className="text-xs font-mono text-secondary mt-0.5">
                    Model: {activeAnalysis.model} • Provider: {activeAnalysis.provider}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="p-1.5 px-2.5 rounded bg-surface-elevated border border-border">
                    <span className="text-secondary text-[10px] block">Tokens</span>
                    <span className="text-main font-bold">{activeAnalysis.prompt_tokens + activeAnalysis.completion_tokens}</span>
                  </div>
                  <div className="p-1.5 px-2.5 rounded bg-surface-elevated border border-border">
                    <span className="text-secondary text-[10px] block">Est. Cost</span>
                    <span className="text-primary font-bold">${activeAnalysis.cost_estimate.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Structured Findings Stream */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {activeAnalysis.findings_json?.map((finding: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-surface-elevated border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-mono text-ai">{finding.id}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-secondary capitalize">
                          {finding.category || 'Architecture'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          finding.status === 'verified'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-ai/15 text-ai border border-ai/30'
                        }`}
                      >
                        {finding.status || 'Verified'} ({Math.round((finding.confidence || 0.9) * 100)}%)
                      </span>
                    </div>

                    <p className="text-xs text-main leading-relaxed">{finding.description}</p>

                    <div className="text-[10px] font-mono text-secondary/80 flex items-center space-x-1 pt-1 border-t border-border/40">
                      <span className="text-secondary/60 uppercase">Evidence:</span>
                      <span className="truncate">{finding.evidence_reference || 'WebX-Ray Scanned DOM Hierarchy'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-secondary text-xs">
              Select an analysis from the history to view technical findings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
