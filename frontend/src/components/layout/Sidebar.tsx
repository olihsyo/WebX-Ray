import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  PlaySquare,
  Activity,
  Compass,
  Monitor,
  FileCode2,
  Palette,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Wifi,
  Terminal,
  Server,
  Database,
  Cpu,
  BrainCircuit,
  ScrollText,
  Hammer,
  Eye,
  CheckCircle2,
  Download,
  Settings2,
  Sliders,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface NavGroup {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    isAI?: boolean;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Create Project', path: '/projects/new', icon: PlusCircle },
      { name: 'Scan Config', path: '/scans/config', icon: PlaySquare },
      { name: 'Live Scan Monitor', path: '/scans/monitor', icon: Activity, badge: 'LIVE' },
    ],
  },
  {
    title: 'INSPECTION & DOM',
    items: [
      { name: 'Page Explorer', path: '/pages', icon: Compass },
      { name: 'Browser Inspector', path: '/browser', icon: Monitor },
      { name: 'DOM Explorer', path: '/dom', icon: FileCode2 },
      { name: 'CSS Inspector', path: '/css', icon: Sliders },
    ],
  },
  {
    title: 'DESIGN & COMPONENTS',
    items: [
      { name: 'Design System', path: '/design-system', icon: Palette },
      { name: 'Component Explorer', path: '/components', icon: Layers },
      { name: 'Asset Explorer', path: '/assets', icon: ImageIcon },
    ],
  },
  {
    title: 'BACKEND & DATA',
    items: [
      { name: 'Network Explorer', path: '/network', icon: Wifi },
      { name: 'API Explorer', path: '/api-explorer', icon: Terminal },
      { name: 'Backend Explorer', path: '/backend', icon: Server },
      { name: 'Database Explorer', path: '/database', icon: Database },
      { name: 'Tech Stack', path: '/tech-stack', icon: Cpu },
    ],
  },
  {
    title: 'AI BLUEPRINT',
    items: [
      { name: 'AI Analysis', path: '/ai-analysis', icon: BrainCircuit, isAI: true },
      { name: 'Blueprint Viewer', path: '/blueprint', icon: ScrollText, isAI: true },
      { name: 'Reconstruction', path: '/reconstruction', icon: Hammer, isAI: true },
    ],
  },
  {
    title: 'VERIFICATION',
    items: [
      { name: 'Visual Comparison', path: '/visual-compare', icon: Eye },
      { name: 'Functional Tests', path: '/testing', icon: CheckCircle2 },
    ],
  },
  {
    title: 'DELIVERY & SETTINGS',
    items: [
      { name: 'Export Center', path: '/export', icon: Download },
      { name: 'AI Providers', path: '/settings/ai', icon: Sparkles, isAI: true },
      { name: 'Project Settings', path: '/settings/project', icon: Settings2 },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { activeProject } = useAppStore();

  return (
    <aside className="w-64 min-w-[256px] h-screen bg-surface border-r border-border flex flex-col select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wider text-main flex items-center gap-1.5 font-mono">
              WebX-Ray <span className="text-[10px] px-1 py-0.5 rounded bg-ai/20 text-ai border border-ai/30 font-sans">AI</span>
            </div>
            <div className="text-[10px] text-secondary tracking-tight">Intelligence & Reconstruction</div>
          </div>
        </div>
      </div>

      {/* Active Project Card */}
      <div className="p-3 border-b border-border/60 bg-surface-elevated/40">
        <div className="text-[10px] uppercase font-mono tracking-wider text-secondary mb-1">Active Target</div>
        {activeProject ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
            <div className="truncate mr-2">
              <div className="text-xs font-medium text-main truncate">{activeProject.name}</div>
              <div className="text-[11px] text-primary truncate font-mono">{activeProject.target_url || 'Local Source Only'}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        ) : (
          <div className="text-xs text-secondary/80 p-2 rounded bg-surface border border-dashed border-border/80 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-warning" />
            <span>No Project Selected</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2 text-[10px] font-mono tracking-wider font-semibold text-secondary/60 uppercase mb-1.5">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? item.isAI
                            ? 'bg-ai/15 text-ai border border-ai/30 font-semibold'
                            : 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                          : 'text-secondary hover:text-main hover:bg-surface-elevated border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? item.isAI
                                  ? 'text-ai'
                                  : 'text-primary'
                                : 'text-secondary group-hover:text-main'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-mono font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        {!item.badge && isActive && (
                          <ChevronRight className="w-3 h-3 text-secondary/40" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-border bg-surface text-[11px] text-secondary flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-mono text-[10px]">Engine Online</span>
        </div>
        <div className="font-mono text-[10px] text-secondary/60">v1.0.0</div>
      </div>
    </aside>
  );
};
