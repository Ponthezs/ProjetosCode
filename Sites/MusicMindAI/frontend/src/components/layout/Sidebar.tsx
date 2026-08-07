import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  ListMusic, 
  CopyX, 
  Compass, 
  History, 
  Radio, 
  Settings, 
  Music2, 
  CheckCircle2, 
  LogIn 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userEmail: string;
  isConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, userEmail, isConnected }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-organizer', label: 'Organizador IA', icon: Sparkles, badge: 'IA' },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'duplicates', label: 'Duplicadas', icon: CopyX },
    { id: 'recommendations', label: 'Descobertas IA', icon: Compass },
    { id: 'modes', label: 'Modos de Ouvir', icon: Radio, badge: '12' },
    { id: 'backup-history', label: 'Backup & Logs', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-obsidian-800 border-r border-slate-800/80 flex flex-col justify-between h-screen p-4 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-glow-emerald">
            <Music2 className="w-6 h-6 text-black font-bold" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              MusicMind <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">AI</span>
            </h1>
            <p className="text-xs text-slate-400">YouTube Music Curator</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Status Card */}
      <div className="glass-panel rounded-xl p-3.5 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conta Google</span>
          {isConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
              Offline
            </span>
          )}
        </div>
        <div className="text-xs text-slate-200 font-medium truncate mb-2">
          {userEmail}
        </div>
        {!isConnected ? (
          <button 
            onClick={() => setCurrentTab('login')}
            className="w-full text-xs font-semibold py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" /> Conectar Conta
          </button>
        ) : (
          <div className="text-[10px] text-slate-400 text-center">
            Sessão protegida por OAuth2
          </div>
        )}
      </div>
    </aside>
  );
};
