import { motion } from 'framer-motion';
import { BarChart3, Building2, Kanban, Rocket, ScrollText, Trophy, Users } from 'lucide-react';
import { useGame, type GameView } from '../../store/gameStore';
import { cx } from '../../utils/format';

export const NAV: { id: GameView; label: string; icon: React.ReactNode }[] = [
  { id: 'board', label: 'Kanban', icon: <Kanban size={19} /> },
  { id: 'team', label: 'Equipe', icon: <Users size={19} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={19} /> },
  { id: 'office', label: 'Office', icon: <Building2 size={19} /> },
  { id: 'upgrades', label: 'Melhorias', icon: <Rocket size={19} /> },
  { id: 'achievements', label: 'Conquistas', icon: <Trophy size={19} /> },
  { id: 'log', label: 'Registro', icon: <ScrollText size={19} /> },
];

export function SideNav() {
  const { view, setView } = useGame();
  return (
    <>
      <nav className="relative z-20 hidden w-[68px] shrink-0 flex-col items-center gap-1 border-r border-line bg-bg-2/40 py-3 md:flex" data-tour="sidenav">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} className={cx('focus-ring group relative flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors', view === n.id ? 'text-fg' : 'text-muted hover:text-fg')} data-tour={`nav-${n.id}`}>
            {view === n.id && <motion.span layoutId="navsel" className="absolute inset-0 rounded-xl border border-accent/30 bg-accent/12" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className={cx('relative', view === n.id && 'text-accent')}>{n.icon}</span>
            <span className="relative">{n.label}</span>
          </button>
        ))}
      </nav>
      <nav className="glass-strong fixed inset-x-0 bottom-[64px] z-30 flex justify-around border-x-0 px-1 py-1 md:hidden">
        {NAV.slice(0, 5).map((n) => (
          <button key={n.id} onClick={() => setView(n.id)} className={cx('flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px]', view === n.id ? 'text-accent' : 'text-muted')}>
            {n.icon}
            {n.label}
          </button>
        ))}
      </nav>
    </>
  );
}
