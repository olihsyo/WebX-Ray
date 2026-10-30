import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2,
  Trash2,
  Save,
  ShieldCheck,
  AlertTriangle,
  Globe,
  FileCode
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';

export const ProjectSettings: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, setActiveProject, addNotification } = useAppStore();

  const [name, setName] = useState(activeProject?.name || '');
  const [description, setDescription] = useState(activeProject?.description || '');
  const [targetUrl, setTargetUrl] = useState(activeProject?.target_url || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateProject(activeProject.id, {
        name,
        description,
        target_url: targetUrl.trim() || undefined,
      });
      setActiveProject(updated);
      addNotification('success', 'Project settings updated successfully.');
    } catch (err: any) {
      addNotification('error', err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete project "${activeProject.name}"? All scans, pages, and blueprints will be removed.`)) {
      return;
    }
    try {
      setDeleting(true);
      await api.deleteProject(activeProject.id);
      setActiveProject(null);
      addNotification('warning', `Project "${activeProject.name}" deleted.`);
      navigate('/');
    } catch (err: any) {
      addNotification('error', err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="surface-card p-6 border border-border">
        <div className="flex items-center space-x-3 mb-1">
          <Settings2 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-main font-mono">Project Configuration & Scope</h1>
        </div>
        <p className="text-xs text-secondary">
          Manage target parameters, access profiles, and persistent analysis records for {activeProject.name}.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* General Settings */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">Identity & Target Endpoint</h2>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Target Website URL</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2 border border-border focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Delete Project */}
        <div className="surface-card p-6 space-y-3 border border-error/30 bg-error/5">
          <div className="flex items-center space-x-2 text-error">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-semibold">Danger Zone</h2>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Deleting this project permanently removes all crawl jobs, snapshots, design tokens, blueprints, and exported bundles from disk.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-4 py-2 bg-error hover:bg-red-600 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-error/20 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting Project...' : 'Delete Project Permanently'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
