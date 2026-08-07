import React from 'react';
import { Search, Sparkles, Download, Cpu, RefreshCw } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOrganizeClick: () => void;
  onExportClick: () => void;
  isOrganizing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOrganizeClick,
  onExportClick,
  isOrganizing = false
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-obsidian-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar artista, música ou gênero..."
          className="w-full bg-obsidian-800 text-sm text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* AI Model Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-slate-700/60 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Modelo IA: <strong className="text-emerald-400">GPT-4o-mini</strong></span>
        </div>

        {/* Quick Export */}
        <button
          onClick={onExportClick}
          className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          title="Exportar Backup da Biblioteca"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup</span>
        </button>

        {/* Auto Organize CTA */}
        <button
          onClick={onOrganizeClick}
          disabled={isOrganizing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-semibold text-xs transition-all shadow-glow-emerald hover:opacity-95 flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isOrganizing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 fill-black" />
          )}
          <span>{isOrganizing ? 'Analisando...' : 'Organizar com IA'}</span>
        </button>
      </div>
    </header>
  );
};
