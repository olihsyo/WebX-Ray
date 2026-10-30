import React, { useEffect, useState } from 'react';
import {
  Database,
  Layers,
  Key,
  Play,
  Download,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { DatabaseSchema } from '../types';

export const DatabaseExplorer: React.FC = () => {
  const { activeProject, addNotification } = useAppStore();

  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [ddlInput, setDdlInput] = useState('');
  const [dialect, setDialect] = useState('postgresql');
  const [parsing, setParsing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchSchemas = async () => {
      try {
        const data = await api.getDatabaseSchemas(activeProject.id);
        setSchemas(data);
        if (data.length > 0 && !ddlInput) {
          // prefill with sample if empty
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchemas();
  }, [activeProject]);

  if (!activeProject) {
    return <div className="surface-card p-8 text-center text-secondary text-xs">Please select an active project.</div>;
  }

  const handleParseDDL = async () => {
    if (!ddlInput.trim()) {
      addNotification('warning', 'Please provide SQL DDL statements.');
      return;
    }
    try {
      setParsing(true);
      const res = await api.request<DatabaseSchema>(`/database-analysis/parse?project_id=${activeProject.id}`, {
        method: 'POST',
        body: JSON.stringify({ ddl_text: ddlInput, dialect }),
      });
      setSchemas([res, ...schemas]);
      addNotification('success', 'Parsed database schema & generated ER diagram.');
    } catch (err: any) {
      addNotification('error', err.message || 'Error parsing DDL.');
    } finally {
      setParsing(false);
    }
  };

  const activeSchema = schemas.length > 0 ? schemas[0] : null;
  const tables = activeSchema?.tables_json || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Database className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-main font-mono">Database Schema & ER Intelligence</h1>
          </div>
          <p className="text-xs text-secondary">
            Static DDL parsing, relational modeling, entity relationships, and Mermaid ER diagrams.
          </p>
        </div>

        {activeSchema && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeSchema.er_diagram_mermaid || '');
              setCopied(true);
              addNotification('info', 'Copied Mermaid ER diagram to clipboard.');
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-surface-elevated hover:bg-border text-main text-xs font-semibold rounded-lg border border-border transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Mermaid ER Code</span>
          </button>
        )}
      </div>

      {/* DDL Input Drawer */}
      <div className="surface-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-main">Parse Owner-Provided SQL DDL or Schema</span>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="bg-surface-elevated text-main text-xs rounded px-2.5 py-1 border border-border focus:outline-none font-mono"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>

        <textarea
          rows={4}
          value={ddlInput}
          onChange={(e) => setDdlInput(e.target.value)}
          placeholder="CREATE TABLE users ( id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL, created_at TIMESTAMP );&#10;CREATE TABLE orders ( id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), amount NUMERIC );"
          className="w-full bg-surface-elevated text-main text-xs rounded-lg p-3 border border-border focus:outline-none focus:border-primary font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={handleParseDDL}
            disabled={parsing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-background" />
            <span>{parsing ? 'Parsing Schema...' : 'Parse DDL & Generate Diagram'}</span>
          </button>
        </div>
      </div>

      {/* Split View: Table Definitions & Mermaid Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tables List */}
        <div className="lg:col-span-7 surface-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-main">Parsed Relational Tables ({tables.length})</h2>
            <span className="text-xs font-mono text-secondary capitalize">{activeSchema?.dialect || 'PostgreSQL'}</span>
          </div>

          {tables.length === 0 ? (
            <div className="p-10 text-center text-secondary text-xs">
              No schema parsed yet. Provide SQL DDL above or upload schema files.
            </div>
          ) : (
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {tables.map((t: any) => (
                <div key={t.table_name} className="p-4 rounded-lg bg-surface-elevated border border-border space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-mono text-xs font-bold text-primary">{t.table_name}</span>
                    <span className="text-[10px] font-mono text-secondary">{t.columns?.length || 0} columns</span>
                  </div>

                  <div className="divide-y divide-border/40 font-mono text-xs">
                    {t.columns?.map((col: any) => (
                      <div key={col.name} className="py-1.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span className={col.is_primary ? 'text-primary font-bold' : 'text-main'}>
                            {col.name}
                          </span>
                          {col.is_primary && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary font-bold">
                              PK
                            </span>
                          )}
                        </div>
                        <span className="text-secondary">{col.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Mermaid ER Diagram Code */}
        <div className="lg:col-span-5 surface-card p-5 space-y-3 sticky top-6">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <Code className="w-4 h-4 text-ai" />
            <h3 className="text-sm font-semibold text-main">Generated Mermaid ER Diagram</h3>
          </div>

          <pre className="p-4 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-ai overflow-x-auto max-h-[60vh] leading-relaxed">
            {activeSchema?.er_diagram_mermaid || 'erDiagram\n    // Parse SQL DDL to generate visual ER model'}
          </pre>
        </div>
      </div>
    </div>
  );
};
