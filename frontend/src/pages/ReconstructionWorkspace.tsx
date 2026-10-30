import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hammer,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Eye,
  CheckSquare,
  FileCode,
  Download,
  ScrollText
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const phases = [
  {
    phase: 1,
    title: 'Phase 1: Foundation & Design System',
    desc: 'Establish clean workspace, inject extracted Tailwind CSS color tokens, font families, and responsive spacing scale.',
    tasks: [
      'Initialize Vite + React + TypeScript app matching specification',
      'Configure tailwind.config with extracted color tokens',
      'Load Inter, JetBrains Mono, and Noto Sans Bengali font stacks',
      'Build responsive application frame with header and sidebar'
    ],
  },
  {
    phase: 2,
    title: 'Phase 2: Atomic & Composite Component Library',
    desc: 'Construct reusable UI components identified in component-tree.json without ad-hoc inline styles.',
    tasks: [
      'Implement SiteHeader and Navigation controls',
      'Implement ContentCard, Buttons, and Surface containers',
      'Implement Form controls with input validation states',
      'Implement Modal dialogs and backdrop transitions'
    ],
  },
  {
    phase: 3,
    title: 'Phase 3: Page Hierarchy & Route Assembly',
    desc: 'Assemble the discovered pages from page-inventory.json into a seamless client-side routing structure.',
    tasks: [
      'Wire routes in React Router matching discovered paths',
      'Reconstruct Home, Dashboard, Auth, and Detail page layouts',
      'Verify mobile drawer navigation collapse on small viewports'
    ],
  },
  {
    phase: 4,
    title: 'Phase 4: API Contracts & Data Integration',
    desc: 'Follow api-contracts.json specifications. Implement mock data handlers where remote services are unavailable.',
    tasks: [
      'Implement typed API client matching inferred response schemas',
      'Wire TanStack Query hooks for server state caching',
      'Provide fallback mock responses for external dependencies'
    ],
  },
  {
    phase: 5,
    title: 'Phase 5: Visual Verification & Correction',
    desc: 'Capture reconstructed page screenshots and run automated pixel diff comparisons against original evidence.',
    tasks: [
      'Execute screenshot comparison on Desktop (1920x1080)',
      'Execute screenshot comparison on Tablet (768x1024)',
      'Execute screenshot comparison on Mobile (375x812)',
      'Resolve geometry, padding, or typography weight discrepancies'
    ],
  },
];

export const ReconstructionWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, addNotification } = useAppStore();

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalTasks = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((doneCount / totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-ai/40 bg-ai/5">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Hammer className="w-5 h-5 text-ai" />
            <h1 className="text-xl font-bold text-main font-mono">AI Reconstruction Orchestration Workspace</h1>
          </div>
          <p className="text-xs text-secondary">
            Execute guided reconstruction following verified blueprints. Track progress across all 5 implementation phases.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/visual-compare')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Launch Visual Verification</span>
          </button>
        </div>
      </div>

      {/* Progress Metric */}
      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-secondary">Reconstruction Execution Progress</span>
          <span className="text-ai font-bold">{doneCount} of {totalTasks} milestones completed ({progressPercent}%)</span>
        </div>
        <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-ai to-purple-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5 Implementation Phases */}
      <div className="space-y-4">
        {phases.map((p) => (
          <div key={p.phase} className="surface-card p-5 space-y-3 border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-main font-mono">{p.title}</h3>
                <p className="text-xs text-secondary mt-0.5">{p.desc}</p>
              </div>
              <span className="text-xs font-mono text-ai font-bold">Phase {p.phase}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {p.tasks.map((task, idx) => {
                const key = `${p.phase}-${idx}`;
                const isDone = !!completedTasks[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleTask(key)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-3 transition-colors ${
                      isDone
                        ? 'bg-primary/10 border-primary/40 text-main'
                        : 'bg-surface-elevated/40 border-border text-secondary hover:text-main hover:bg-surface-elevated'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-secondary/60 shrink-0" />
                    )}
                    <span className="text-xs font-medium leading-tight">{task}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
