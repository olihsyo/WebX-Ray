import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  Save,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';

export const AIProviderSettings: React.FC = () => {
  const { addNotification } = useAppStore();

  const [settingsData, setSettingsData] = useState<any>({});
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [defaultProvider, setDefaultProvider] = useState('gemini');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.getSettings();
        setSettingsData(s);
        if (s.default_ai_provider) setDefaultProvider(s.default_ai_provider);
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateSettings({
        gemini_api_key: geminiKey.trim() || undefined,
        openai_api_key: openaiKey.trim() || undefined,
        anthropic_api_key: anthropicKey.trim() || undefined,
        default_ai_provider: defaultProvider,
      });
      setSettingsData(updated);
      setGeminiKey('');
      setOpenaiKey('');
      setAnthropicKey('');
      addNotification('success', 'AI provider settings updated securely.');
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="surface-card p-6 flex items-center justify-between border border-border">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Sparkles className="w-5 h-5 text-ai" />
            <h1 className="text-xl font-bold text-main font-mono">AI Model & Provider Configuration</h1>
          </div>
          <p className="text-xs text-secondary">
            Configure Google Gemini, OpenAI, Claude, or custom LLM endpoints. All keys remain encrypted on backend and are never exported.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Local-First & Offline Capable</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Default Provider Selector */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">1. Default AI Synthesis Engine</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'gemini', title: 'Google Gemini 2.5 Flash', desc: 'Native high-throughput multimodal intelligence engine.', active: settingsData.has_gemini_key },
              { id: 'openai', title: 'OpenAI GPT-4o-mini', desc: 'Industry-standard structured JSON function calling.', active: settingsData.has_openai_key },
              { id: 'local', title: 'Deterministic Local Heuristic', desc: '100% offline synthesis without external network calls.', active: true },
            ].map((p) => {
              const isSelected = defaultProvider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setDefaultProvider(p.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'bg-ai/15 border-ai shadow-sm text-ai' : 'bg-surface-elevated/40 border-border text-secondary hover:text-main'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono">{p.title}</span>
                    {p.active && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Keys Configuration */}
        <div className="surface-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-main">2. Configure API Credentials (Optional)</h2>
          <p className="text-xs text-secondary">
            Leave blank to continue using the deterministic local heuristic engine or environment variables.
          </p>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-secondary">Google Gemini API Key</label>
                <span className="text-[10px] text-primary">
                  {settingsData.has_gemini_key ? '● Configured in Environment' : '○ Not Configured'}
                </span>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy••••••••••••••••••••••••••••••"
                className="w-full bg-surface-elevated text-main rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-ai"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-secondary">OpenAI API Key</label>
                <span className="text-[10px] text-primary">
                  {settingsData.has_openai_key ? '● Configured in Environment' : '○ Not Configured'}
                </span>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-••••••••••••••••••••••••••••••"
                className="w-full bg-surface-elevated text-main rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-ai"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-secondary">Anthropic Claude API Key</label>
                <span className="text-[10px] text-primary">
                  {settingsData.has_anthropic_key ? '● Configured in Environment' : '○ Not Configured'}
                </span>
              </div>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-••••••••••••••••••••••••••••••"
                className="w-full bg-surface-elevated text-main rounded-lg px-3.5 py-2.5 border border-border focus:outline-none focus:border-ai"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-ai hover:bg-ai/90 text-background font-semibold text-xs rounded-lg transition-all shadow-md shadow-ai/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save AI Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
