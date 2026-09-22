import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Car, Users, FolderKanban, HardDrive, SlidersHorizontal,
  GitCompareArrows, Library, Database, Gauge, Activity, FileBarChart,
  ClipboardList, Settings, Cpu, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const nav = [
  { to: '/app', label: 'Home', icon: Cpu, end: true },
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/garage', label: 'Garagem', icon: Car },
  { to: '/app/clients', label: 'Clientes', icon: Users },
  { to: '/app/projects', label: 'Projetos', icon: FolderKanban },
  { to: '/app/ecu-files', label: 'ECU Files', icon: HardDrive },
  { to: '/app/map-editor', label: 'Map Editor', icon: SlidersHorizontal },
  { to: '/app/file-compare', label: 'File Compare', icon: GitCompareArrows },
  { to: '/app/map-library', label: 'Map Library', icon: Library },
  { to: '/app/ecu-database', label: 'ECU Database', icon: Database },
  { to: '/app/performance', label: 'Performance', icon: Gauge },
  { to: '/app/dyno', label: 'Dyno', icon: Activity },
  { to: '/app/logs', label: 'Logs', icon: FileBarChart },
  { to: '/app/reports', label: 'Relatórios', icon: FileBarChart },
  { to: '/app/service-orders', label: 'Ordens de Serviço', icon: ClipboardList },
  { to: '/app/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'h-screen sticky top-0 shrink-0 border-r border-white/8 bg-base-900/80 backdrop-blur-xl flex flex-col transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[248px]',
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/8">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-electric to-electric-2 flex items-center justify-center shadow-glow-blue shrink-0">
          <Cpu className="h-4.5 w-4.5 text-base-950" size={18} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-base-100 tracking-wide text-sm">REMAP<span className="text-electric-2">TECH</span></span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 relative overflow-hidden',
              isActive
                ? 'bg-electric/12 text-electric-2 shadow-[inset_0_0_0_1px_rgba(47,143,255,0.35)]'
                : 'text-base-300 hover:text-base-100 hover:bg-white/5',
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-electric-2 shadow-glow-blue" />}
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate font-medium">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(v => !v)}
        className="m-2 flex items-center justify-center gap-2 rounded-xl py-2 text-base-400 hover:text-base-100 hover:bg-white/5 transition-colors text-xs"
      >
        {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Recolher</>}
      </button>
    </aside>
  );
}
