import { motion } from 'framer-motion';
import { BookOpen, Map, Play, RotateCcw, Settings, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CARD_TYPES } from '../data/board';
import { SCENARIO_MAP } from '../scenarios';
import { useGame } from '../store/gameStore';
import { cx } from '../utils/format';

const TAGLINE = ['Gerencie pessoas.', 'Controle o fluxo.', 'Tome decisões.', 'Entregue valor.'];

export function MainMenu() {
  const { setScreen, hasSave, game, continueGame, profile } = useGame();
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <Orbs />
      <div className="relative z-10 mx-auto grid h-full max-w-[1400px] grid-cols-1 items-center gap-10 overflow-y-auto px-6 py-10 lg:grid-cols-[1.05fr_1fr] lg:px-12">
        <div className="flex flex-col">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" /> Agile Management Simulator
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display text-[64px] font-bold leading-[0.9] tracking-tight sm:text-[104px]"
          >
            <span className="text-gradient">FLOW</span>
            <br />
            <span className="text-fg">OPS</span>
          </motion.h1>
          <div className="mt-6 space-y-1">
            {TAGLINE.map((t, i) => (
              <motion.p key={t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.18 }} className={cx('text-lg sm:text-xl', i === 3 ? 'font-semibold text-fg' : 'text-muted')}>
                {t}
              </motion.p>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-10 flex w-full max-w-[420px] flex-col gap-2.5">
            <MenuButton primary icon={<Play size={18} fill="currentColor" />} label="Novo jogo" hint="Escolha modo, cenário e dificuldade" onClick={() => setScreen('newgame', 'modes')} />
            <MenuButton
              icon={<RotateCcw size={18} />}
              label="Continuar"
              hint={hasSave && game ? `${SCENARIO_MAP[game.scenarioId]?.name} · Dia ${game.day}/${game.totalDays} · ${game.seedLabel}` : 'Nenhuma partida salva'}
              disabled={!hasSave}
              onClick={continueGame}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <MenuButton small icon={<Map size={16} />} label="Cenários" onClick={() => setScreen('newgame', 'campaign')} />
              <MenuButton small icon={<Trophy size={16} />} label="Ranking" onClick={() => setScreen('ranking')} />
              <MenuButton small icon={<BookOpen size={16} />} label="Como jogar" onClick={() => setScreen('howto')} />
              <MenuButton small icon={<Settings size={16} />} label="Configurações" onClick={() => setScreen('settings')} />
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-8 text-xs text-faint">
            {profile.gamesPlayed} partida(s) jogada(s) · {profile.achievements.length}/30 conquistas · v0.1
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.9 }} className="hidden lg:block">
          <FlowPreview />
        </motion.div>
      </div>
    </div>
  );
}

function MenuButton({ label, hint, icon, onClick, primary, disabled, small }: { label: string; hint?: string; icon: React.ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'focus-ring group relative flex items-center gap-3 overflow-hidden rounded-2xl border text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
        small ? 'px-4 py-3' : 'px-5 py-4',
        primary ? 'border-white/10 bg-gradient-to-r from-[#6d72ff] to-[#4f53e0] text-white shadow-[0_18px_50px_-18px_rgba(99,102,241,0.9)] hover:brightness-110' : 'glass hover:border-line-strong hover:bg-surface-2',
      )}
    >
      {primary && <span className="shimmer absolute inset-0 opacity-30" />}
      <span className={cx('relative flex items-center justify-center rounded-xl', small ? 'h-8 w-8' : 'h-10 w-10', primary ? 'bg-white/15' : 'bg-surface-2 text-accent')}>{icon}</span>
      <span className="relative min-w-0">
        <span className={cx('block font-semibold uppercase tracking-[0.12em]', small ? 'text-xs' : 'text-sm')}>{label}</span>
        {hint && <span className={cx('block truncate text-xs', primary ? 'text-white/70' : 'text-muted')}>{hint}</span>}
      </span>
    </button>
  );
}

function Orbs() {
  return (
    <>
      <div className="float-slow pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="float-slow pointer-events-none absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-[120px]" style={{ animationDelay: '-3s' }} />
    </>
  );
}

/* Prévia animada de um fluxo Kanban — cards atravessando as colunas */
const PREVIEW_COLS = ['Ready', 'Análise', 'Dev', 'Testes', 'Deploy', 'Done'];
const PREVIEW_TYPES = ['feature', 'bug', 'integration', 'ux', 'improvement', 'security', 'techdebt'] as const;

function FlowPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1400);
    return () => clearInterval(t);
  }, []);
  const cards = Array.from({ length: 9 }).map((_, i) => {
    const pos = (tick + i * 2) % 14;
    const col = Math.min(5, Math.floor(pos / 2.3));
    const type = PREVIEW_TYPES[i % PREVIEW_TYPES.length];
    return { i, col, type, row: i % 3 };
  });
  return (
    <div className="glass relative rounded-3xl p-5 [transform:perspective(1400px)_rotateY(-12deg)_rotateX(6deg)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="num text-[11px] text-muted">DIA {String((tick % 30) + 1).padStart(2, '0')} / 30</div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {PREVIEW_COLS.map((c, ci) => (
          <div key={c} className="min-h-[300px] rounded-xl border border-line bg-surface/60 p-1.5">
            <div className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-widest text-muted">{c}</div>
            <div className="flex flex-col gap-1.5">
              {cards
                .filter((x) => x.col === ci)
                .map((x) => (
                  <motion.div
                    layoutId={`pv-${x.i}`}
                    key={x.i}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className={cx('rounded-lg border border-line bg-solid-2 p-1.5', ci === 5 && 'border-emerald-400/30')}
                  >
                    <div className="mb-1 h-1 w-6 rounded-full" style={{ background: CARD_TYPES[x.type].color }} />
                    <div className="h-1.5 w-full rounded-full bg-surface-3" />
                    <div className="mt-1 h-1.5 w-2/3 rounded-full bg-surface-3" />
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ['Lead Time', `${(6 + Math.sin(tick / 2) * 1.2).toFixed(1)}d`],
          ['Throughput', `${(1.8 + Math.cos(tick / 3) * 0.4).toFixed(1)}/dia`],
          ['WIP', `${9 + (tick % 3)}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-surface px-3 py-2">
            <div className="text-[9px] uppercase tracking-widest text-muted">{k}</div>
            <div className="num text-sm font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
