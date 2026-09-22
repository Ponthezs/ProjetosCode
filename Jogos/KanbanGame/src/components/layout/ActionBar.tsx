import { motion } from 'framer-motion';
import { Loader2, Play, Zap } from 'lucide-react';
import { FOCUS_OPTIONS } from '../../data/board';
import { dailyPayroll } from '../../analytics/metrics';
import { useGame } from '../../store/gameStore';
import type { GameState } from '../../types';
import { cx, money } from '../../utils/format';
import { Switch } from '../ui';

export function ActionBar({ g }: { g: GameState }) {
  const { dispatch, startDay, animating } = useGame();
  const pendingChoices = g.pendingEvents.filter((e) => !e.autoApplied && e.choices?.length).length;
  return (
    <footer className="glass-strong relative z-30 flex items-center gap-3 border-x-0 border-b-0 px-3 py-2.5 sm:px-4" data-tour="actionbar">
      <div className="scroll-thin flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-line bg-surface p-0.5" data-tour="focus">
          <span className="hidden px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:inline">Foco do dia</span>
          {FOCUS_OPTIONS.map((f) => (
            <button
              key={f.id}
              title={f.description}
              onClick={() => dispatch({ type: 'setFocus', focus: f.id })}
              className={cx('focus-ring relative rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors', g.settings.focus === f.id ? 'text-fg' : 'text-muted hover:text-fg')}
            >
              {g.settings.focus === f.id && <motion.span layoutId="focussel" className="absolute inset-0 rounded-[10px] border border-line-strong bg-surface-3" />}
              <span className="relative whitespace-nowrap">{f.icon} <span className="hidden sm:inline">{f.label}</span></span>
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-4 rounded-xl border border-line bg-surface px-3 py-1.5">
          <span title={`+25% capacidade, custo extra de ${money(dailyPayroll(g) * 0.5)}/dia, mais estresse e bugs.`}>
            <Switch checked={g.settings.overtime} onChange={(v) => dispatch({ type: 'setOvertime', value: v })} label={<span className="whitespace-nowrap text-xs">Hora extra</span>} />
          </span>
          <span title="Cards concluídos são puxados automaticamente para o próximo estágio quando há espaço no WIP.">
            <Switch checked={g.settings.autoPull} onChange={(v) => dispatch({ type: 'setAutoPull', value: v })} label={<span className="whitespace-nowrap text-xs">Auto-pull</span>} />
          </span>
        </div>
      </div>
      <motion.button
        data-tour="start-day"
        whileHover={{ scale: animating ? 1 : 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={startDay}
        disabled={animating}
        className={cx(
          'focus-ring relative flex h-12 shrink-0 items-center gap-2.5 overflow-hidden rounded-2xl border border-white/15 px-5 font-semibold uppercase tracking-[0.12em] text-white sm:px-7',
          'bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.9)] disabled:opacity-80',
        )}
      >
        {!animating && <span className="shimmer absolute inset-0 opacity-40" />}
        {animating ? <Loader2 size={18} className="animate-spin" /> : pendingChoices ? <Zap size={18} /> : <Play size={18} fill="currentColor" />}
        <span className="relative text-sm">{animating ? 'Simulando…' : pendingChoices ? `${pendingChoices} decisão` : 'Iniciar dia'}</span>
        <span className="num relative hidden rounded-md bg-black/20 px-1.5 py-0.5 text-[11px] sm:inline">D{g.day}</span>
      </motion.button>
    </footer>
  );
}
