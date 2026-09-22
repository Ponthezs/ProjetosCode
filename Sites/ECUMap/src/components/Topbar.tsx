import { Search, Bell, FlaskConical, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export function Topbar() {
  const { simulationMode, setSimulationMode, currentUser } = useApp();
  const navigate = useNavigate();

  return (
    <header className="h-16 sticky top-0 z-20 flex items-center gap-4 border-b border-white/8 bg-base-900/70 backdrop-blur-xl px-6">
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
        <input
          placeholder="Buscar veículo, chassi, placa, arquivo..."
          className="w-full bg-base-800/70 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-sm text-base-100 placeholder:text-base-400 focus:outline-none focus:border-electric-2/60 focus:ring-1 focus:ring-electric-2/40 transition-colors"
        />
      </div>

      <button
        onClick={() => setSimulationMode(!simulationMode)}
        className={clsx(
          'flex items-center gap-1.5 text-xs font-mono-tech px-3 py-1.5 rounded-full border transition-colors',
          simulationMode
            ? 'border-amber text-amber bg-amber/10 animate-pulse-ring'
            : 'border-white/10 text-base-400 hover:text-base-100 hover:border-white/25',
        )}
        title="Ativar/desativar Simulation Mode"
      >
        <FlaskConical size={13} />
        SIMULATION MODE {simulationMode ? 'ON' : 'OFF'}
      </button>

      <button
        onClick={() => navigate('/app/garage')}
        className="hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-gradient-to-r from-electric to-electric-2 text-base-950 shadow-glow-blue hover:brightness-110 transition-all"
      >
        <Plus size={14} /> NEW PROJECT
      </button>

      <button className="relative text-base-300 hover:text-base-100 transition-colors">
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-alert-red" />
      </button>

      <div className="flex items-center gap-2 pl-3 border-l border-white/10">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-base-950"
          style={{ background: currentUser.avatarColor }}
        >
          {currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div className="hidden lg:block leading-tight">
          <div className="text-xs font-medium text-base-100">{currentUser.nome}</div>
          <div className="text-[10px] text-base-400">{currentUser.role}</div>
        </div>
      </div>
    </header>
  );
}
