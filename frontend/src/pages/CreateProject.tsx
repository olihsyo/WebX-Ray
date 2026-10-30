import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Globe,
  KeyRound,
  FileCode,
  Database,
  Layers,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';

const accessProfiles = [
  {
    id: 'public',
    title: '1. Public Website Analysis',
    desc: 'Authorized public-facing crawl, DOM extraction, design token analysis, and observable network tracking.',
    icon: Globe,
    badge: 'Standard',
  },
  {
    id: 'test_env',
    title: '2. Authenticated Test Environment',
    desc: 'Authorized staging or test accounts. Securely uses test credentials without saving plain text passwords.',
    icon: KeyRound,
    badge: 'Authorized',
  },
  {
    id: 'source_repo',
    title: '3. Owner-Provided Source Repository',
    desc: 'Inspect backend code, controllers, routes, middleware, and business logic from authorized local folder or zip.',
    icon: FileCode,
    badge: 'Source Code',
  },
  {
    id: 'api_docs',
    title: '4. Authorized API Documentation',
    desc: 'Incorporate OpenAPI / Swagger specs and documented REST/GraphQL contracts into blueprint.',
    icon: Layers,
    badge: 'API Specs',
  },
  {
    id: 'db_schema',
    title: '5. Owner-Provided Database Schema',
    desc: 'Analyze DDL, migrations, or ORM models (PostgreSQL, MySQL, SQLite, MongoDB) to build accurate ER diagrams.',
    icon: Database,
    badge: 'Database',
  },
  {
    id: 'full',
    title: '6. Full Authorized Project Analysis',
    desc: 'Unified multi-vector reconstruction: live URL crawl + backend code + database schema + AI synthesis.',
    icon: ShieldCheck,
    badge: 'Complete',
  },
];

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveProject, addNotification } = useAppStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [accessProfile, setAccessProfile] = useState('public');
  const [sourcePath, setSourcePath] = useState('');
  const [dbSchemaInput, setDbSchemaInput] = useState('');

  // Auth config for test environment
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loginUrl, setLoginUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (accessProfile !== 'source_repo' && accessProfile !== 'db_schema' && !targetUrl.trim()) {
      setError('Target URL is required for web crawling.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const authConfig: Record<string, any> = {};
      if (accessProfile === 'test_env' || accessProfile === 'full') {
        if (authUsername) authConfig.username = authUsername;
        if (authPassword) authConfig.password = authPassword;
        if (loginUrl) authConfig.login_url = loginUrl;
      }

      const created = await api.createProject({
        name,
        description,
        target_url: targetUrl.trim() || undefined,
        access_profile: accessProfile as any,
        auth_config: Object.keys(authConfig).length > 0 ? authConfig : undefined,
        source_path: sourcePath.trim() || undefined,
        db_schema_input: dbSchemaInput.trim() || undefined,
      });

      setActiveProject(created);
      addNotification('success', `Project "${created.name}" created successfully.`);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <FolderPlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-main font-mono">Create Analysis Project</h1>
          <p className="text-xs text-secondary">
            Configure an authorized target website, source repository, or database schema for deep blueprint reconstruction.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">1. Project Identity</h2>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme SaaS Platform Reconstruction"
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Target Website URL</label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-primary font-mono"
            />
            <p className="text-[11px] text-secondary/70 mt-1">
              Must be an authorized domain. Private IPs (127.0.0.1, 10.x, 192.168.x) are blocked unless explicitly configured in settings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">Description / Reconstruction Goals</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the scope and purpose of this technical reconstruction blueprint..."
              className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2 border border-border focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Access Profile Selection */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">2. Access Profile & Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accessProfiles.map((p) => {
              const Icon = p.icon;
              const isSelected = accessProfile === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setAccessProfile(p.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-surface-elevated/50 border-border hover:border-border/80 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-secondary'}`} />
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-main'}`}>
                        {p.title}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-surface border border-border text-secondary">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional Sections based on Profile */}
        {(accessProfile === 'test_env' || accessProfile === 'full') && (
          <div className="surface-card p-6 space-y-4 border border-warning/30 bg-warning/5">
            <div className="flex items-center space-x-2 text-warning">
              <KeyRound className="w-4 h-4" />
              <h2 className="text-sm font-semibold">Authorized Test Credentials (Optional)</h2>
            </div>
            <p className="text-[11px] text-secondary">
              Configure only dedicated sandbox/test accounts. Credentials are encrypted and never exported in public blueprints.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-secondary mb-1">Login URL</label>
                <input
                  type="url"
                  value={loginUrl}
                  onChange={(e) => setLoginUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  className="w-full bg-surface text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-secondary mb-1">Test Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="testuser@example.com"
                  className="w-full bg-surface text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-secondary mb-1">Test Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface text-main text-xs rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {(accessProfile === 'source_repo' || accessProfile === 'full') && (
          <div className="surface-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-main">Owner-Provided Source Code Directory</h2>
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Local Directory Path or Archive</label>
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="e.g. C:\projects\acme-backend or ./sources/repo.zip"
                className="w-full bg-surface-elevated text-main text-xs rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-primary font-mono"
              />
              <p className="text-[11px] text-secondary/70 mt-1">
                WebX-Ray AI performs static parsing of ASTs, routes, controllers, and models. Untrusted code is never executed.
              </p>
            </div>
          </div>
        )}

        {(accessProfile === 'db_schema' || accessProfile === 'full') && (
          <div className="surface-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-main">Owner-Provided Database Schema DDL</h2>
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">SQL DDL, Prisma Schema, or SQLAlchemy Models</label>
              <textarea
                rows={5}
                value={dbSchemaInput}
                onChange={(e) => setDbSchemaInput(e.target.value)}
                placeholder="CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP\n);"
                className="w-full bg-surface-elevated text-main text-xs rounded-lg p-3 border border-border focus:outline-none focus:border-primary font-mono"
              />
              <p className="text-[11px] text-secondary/70 mt-1">
                Schema definitions are parsed statically to construct complete entity relationship (ER) diagrams and data models.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-xs text-secondary hover:text-main font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <span>{loading ? 'Initializing Project...' : 'Initialize Project'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
