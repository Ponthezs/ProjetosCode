import React, { useEffect, useState } from 'react';
import { Settings, Cpu, Save, CheckCircle2, Moon, Globe, Clock, RefreshCw } from 'lucide-react';
import { fetchSettings, updateSettings } from '../services/api';
import { UserSettings } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(res => {
        setSettings(res);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400 text-xs">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" /> Configurações do Sistema
          </h2>
          <p className="text-xs text-slate-400">
            Ajuste preferências de IA, tema, idioma e automações diárias.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {/* AI Settings Section */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" /> Parâmetros de Inteligência Artificial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Modelo de IA Principal</label>
            <select
              value={settings.ai_model}
              onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
              className="w-full bg-obsidian-800 text-sm text-slate-200 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="gpt-4o-mini">OpenAI GPT-4o-mini (Rápido e Preciso)</option>
              <option value="gpt-4o">OpenAI GPT-4o (Máximo Raciocínio Musical)</option>
              <option value="local-heuristic">Regra Heurística Offline (Sem API Key)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Criatividade / Temperatura ({settings.temperature})</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3"
            />
          </div>
        </div>
      </div>

      {/* Appearance & Preferences */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Moon className="w-4 h-4 text-violet-400" /> Aparência e Idioma
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Tema da Interface</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              className="w-full bg-obsidian-800 text-sm text-slate-200 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="dark">Dark Luxury Obsidian (Spotify Desktop)</option>
              <option value="neon">Neon Cyberpunk Emerald</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Idioma do Sistema</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-obsidian-800 text-sm text-slate-200 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Automations */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Sincronização Diária Automática
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-800 border border-slate-800">
          <div>
            <div className="text-xs font-semibold text-white">Sincronização Diária no Background</div>
            <div className="text-[11px] text-slate-400">Atualiza playlists semanais, adiciona lançamentos e limpa links indisponíveis.</div>
          </div>
          <input
            type="checkbox"
            checked={settings.auto_sync}
            onChange={(e) => setSettings({ ...settings, auto_sync: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-glow-emerald transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
      </button>
    </div>
  );
};
