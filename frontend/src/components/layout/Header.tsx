import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Play,
  ScrollText,
  Download,
  Laptop,
  Tablet,
  Smartphone,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../api/client';
import { Project } from '../../types';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeProject,
    setActiveProject,
    selectedViewport,
    setSelectedViewport,
    addNotification,
  } = useAppStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const list = await api.getProjects();
      setProjects(list);
      if (!activeProject && list.length > 0) {
        setActiveProject(list[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = projects.find((p) => p.id === e.target.value);
    if (selected) {
      setActiveProject(selected);
      addNotification('info', `Switched active project to ${selected.name}`);
    }
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between z-10">
      {/* Project Selector & Target URL */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FolderKanban className="w-4 h-4 text-primary" />
          <select
            value={activeProject?.id || ''}
            onChange={handleProjectSelect}
            className="bg-surface-elevated text-main text-xs rounded-lg px-3 py-1.5 border border-border focus:outline-none focus:border-primary font-medium cursor-pointer"
          >
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <div className="flex items-center space-x-2 text-xs">
            {activeProject.target_url && (
              <a
                href={activeProject.target_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-secondary hover:text-primary transition-colors font-mono"
              >
                <span className="max-w-[240px] truncate">{activeProject.target_url}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-mono capitalize">
              {activeProject.access_profile.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Center: Viewport Switcher */}
      <div className="flex items-center bg-surface-elevated p-1 rounded-lg border border-border">
        <button
          onClick={() => setSelectedViewport('desktop')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            selectedViewport === 'desktop'
              ? 'bg-primary text-background font-semibold shadow-sm'
              : 'text-secondary hover:text-main'
          }`}
          title="Desktop (1920x1080)"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Desktop</span>
        </button>
        <button
          onClick={() => setSelectedViewport('tablet')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            selectedViewport === 'tablet'
              ? 'bg-primary text-background font-semibold shadow-sm'
              : 'text-secondary hover:text-main'
          }`}
          title="Tablet (768x1024)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablet</span>
        </button>
        <button
          onClick={() => setSelectedViewport('mobile')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            selectedViewport === 'mobile'
              ? 'bg-primary text-background font-semibold shadow-sm'
              : 'text-secondary hover:text-main'
          }`}
          title="Mobile (375x812)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-border/60 text-main text-xs rounded-lg border border-border transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>New Project</span>
        </button>

        <button
          onClick={() => navigate('/scans/config')}
          disabled={!activeProject}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-background text-xs rounded-lg font-semibold transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5 fill-background" />
          <span>Run Scan</span>
        </button>

        <button
          onClick={() => navigate('/blueprint')}
          disabled={!activeProject}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-ai/20 hover:bg-ai/30 text-ai text-xs rounded-lg border border-ai/40 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>Blueprint</span>
        </button>

        <button
          onClick={() => navigate('/export')}
          disabled={!activeProject}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-border/60 text-secondary hover:text-main text-xs rounded-lg border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
