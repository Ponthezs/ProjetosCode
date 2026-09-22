import { motion } from 'framer-motion';
import { ArrowLeft, Check, Dices, GraduationCap, Lock, Play, Star, Target, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Icon, Segmented, Switch } from '../components/ui';
import { SEGMENT_META } from '../data/clients';
import { DIFFICULTIES, GAME_MODES } from '../data/difficulties';
import { ROLES } from '../data/professionals';
import { randomSeedLabel } from '../game-engine/rng';
import { SCENARIOS } from '../scenarios';
import { useGame } from '../store/gameStore';
import type { GameModeId } from '../types';
import { cx, money } from '../utils/format';

export function NewGame() {
  const { setScreen, newGameTab, newGame, profile } = useGame();
  const [tab, setTab] = useState<'campaign' | 'modes'>(newGameTab);
  const [mode, setMode] = useState<GameModeId>('standard');
  const unlocked = (i: number) => i === 0 || (profile.completedScenarios[SCENARIOS[i - 1].id] ?? 0) >= 1;
  const firstLocked = SCENARIOS.findIndex((_, i) => !unlocked(i));
  const [scenarioId, setScenarioId] = useState(SCENARIOS[Math.max(0, (firstLocked === -1 ? SCENARIOS.length : firstLocked) - 1)].id);
  const [difficulty, setDifficulty] = useState('normal');
  const [seed, setSeed] = useState(randomSeedLabel());
  const [days, setDays] = useState(30);
  const [tutorial, setTutorial] = useState(!profile.tutorialDone && profile.gamesPlayed === 0);

  const effMode: GameModeId = tab === 'campaign' ? 'campaign' : mode;
  const sc = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const modeDef = GAME_MODES.find((m) => m.id === effMode)!;
  const totalDays = effMode === 'sandbox' ? days : modeDef.days ?? sc.recommendedDays;
  const diffList = effMode === 'challenge' ? DIFFICULTIES.filter((d) => ['expert', 'realistic'].includes(d.id)) : DIFFICULTIES;
  const effDiff = diffList.some((d) => d.id === difficulty) ? difficulty : diffList[0].id;
  const scIndex = SCENARIOS.findIndex((s) => s.id === sc.id);
  const locked = tab === 'campaign' && !unlocked(scIndex);

  const teamCount = useMemo(() => {
    const m: Record<string, number> = {};
    sc.team.forEach((r) => (m[r] = (m[r] ?? 0) + 1));
    return Object.entries(m);
  }, [sc]);

  const start = () => {
    if (locked) return;
    newGame({ mode: effMode, scenarioId: sc.id, difficultyId: effDiff, days: totalDays, seedLabel: seed.trim() || randomSeedLabel(), tutorial });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-8">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => setScreen('menu')}>Menu</Button>
        <div className="font-display text-lg font-bold tracking-wide"><span className="text-gradient">FLOW OPS</span> <span className="text-muted">/ Nova partida</span></div>
        <div className="ml-auto">
          <Segmented value={tab} onChange={setTab} options={[{ value: 'campaign', label: 'Campanha' }, { value: 'modes', label: 'Modos de jogo' }]} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto scroll-thin lg:grid-cols-[1fr_420px] lg:overflow-hidden">
        <div className="min-h-0 overflow-y-auto scroll-thin p-4 sm:p-8">
          {tab === 'modes' && (
            <>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Modo</h2>
              <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {GAME_MODES.filter((m) => m.id !== 'campaign').map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)} className={cx('focus-ring glass group rounded-2xl p-4 text-left transition-all hover:border-line-strong', mode === m.id && 'border-accent/60 bg-accent/10 shadow-[var(--glow)]')}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl', mode === m.id ? 'bg-accent text-white' : 'bg-surface-2 text-accent')}><Icon name={m.icon} size={18} /></span>
                      {m.days && <span className="num text-xs text-muted">{m.days} dias</span>}
                    </div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted">{m.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{tab === 'campaign' ? 'Campanha — cenários progressivos' : 'Cenário'}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SCENARIOS.map((s, i) => {
              const lock = tab === 'campaign' && !unlocked(i);
              const stars = profile.completedScenarios[s.id] ?? 0;
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setScenarioId(s.id)}
                  className={cx('focus-ring glass relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:border-line-strong', scenarioId === s.id && 'border-accent/60 shadow-[var(--glow)]', lock && 'opacity-55')}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ background: `${s.accent}33` }} />
                  <div className="relative mb-3 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.accent}22`, color: s.accent }}>
                      {lock ? <Lock size={18} /> : <Icon name={s.icon} size={20} />}
                    </span>
                    <span className="num text-[11px] text-faint">CENÁRIO {s.order}</span>
                  </div>
                  <div className="relative font-semibold">{s.name}</div>
                  <div className="relative text-xs text-muted">{s.subtitle}</div>
                  {tab === 'campaign' && (
                    <div className="relative mt-3 flex gap-0.5">
                      {[0, 1, 2].map((k) => <Star key={k} size={13} className={k < stars ? 'text-amber-400' : 'text-faint/40'} fill={k < stars ? 'currentColor' : 'none'} />)}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <aside className="glass-strong flex min-h-0 flex-col border-l border-line lg:rounded-none">
          <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${sc.accent}22`, color: sc.accent }}><Icon name={sc.icon} size={24} /></span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{modeDef.name}</div>
                <div className="font-display text-2xl font-bold">{sc.name}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{sc.description}</p>
            <div className="mt-4 rounded-xl border border-accent/25 bg-accent/10 p-3 text-sm"><Target size={14} className="mb-0.5 mr-1.5 inline text-accent" />{sc.objective}</div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Info label="Dias" value={String(totalDays)} />
              <Info label="Caixa" value={money(sc.startingCash, true)} />
              <Info label="Dívida" value={`${sc.initialTechDebt}%`} />
            </div>

            <h3 className="mb-2 mt-5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"><Users size={13} /> Equipe inicial ({sc.team.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {teamCount.map(([r, n]) => <Badge key={r} color={ROLES[r as keyof typeof ROLES].color}>{n}× {ROLES[r as keyof typeof ROLES].short}</Badge>)}
            </div>
            <h3 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Clientes</h3>
            <div className="flex flex-wrap gap-1.5">
              {sc.segments.map((sg) => <Badge key={sg} color={SEGMENT_META[sg].color}>{SEGMENT_META[sg].label}</Badge>)}
            </div>
            <h3 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Metas (estrelas)</h3>
            <ul className="space-y-1.5">
              {sc.goals.map((g) => <li key={g.label} className="flex items-center gap-2 text-sm"><Check size={14} className="text-good" />{g.label}</li>)}
            </ul>

            <h3 className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Dificuldade</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {diffList.map((d) => (
                <button key={d.id} onClick={() => setDifficulty(d.id)} className={cx('focus-ring flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors', effDiff === d.id ? 'border-line-strong bg-surface-3' : 'border-line hover:bg-surface-2')}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color, boxShadow: effDiff === d.id ? `0 0 10px ${d.color}` : undefined }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{d.name}</span>
                    {effDiff === d.id && <span className="block text-xs text-muted">{d.description}</span>}
                  </span>
                  <span className="num text-[11px] text-faint">×{d.scoreMult}</span>
                </button>
              ))}
            </div>

            {effMode === 'sandbox' && (
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"><span>Duração</span><span className="num text-fg">{days} dias</span></div>
                <input type="range" min={10} max={90} step={5} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
              </div>
            )}

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Game Seed</h3>
            <div className="flex gap-2">
              <input value={seed} onChange={(e) => setSeed(e.target.value.toUpperCase())} className="num focus-ring h-9 flex-1 rounded-xl border border-line bg-surface px-3 text-sm outline-none" />
              <Button size="md" icon={<Dices size={15} />} onClick={() => setSeed(randomSeedLabel())}>Sortear</Button>
            </div>
            <p className="mt-1 text-[11px] text-faint">A mesma seed gera a mesma partida (demandas, equipe e eventos).</p>

            <div className="mt-5 rounded-xl border border-line bg-surface p-3">
              <Switch checked={tutorial} onChange={setTutorial} label={<span className="flex items-center gap-1.5"><GraduationCap size={15} /> Tutorial interativo</span>} />
            </div>
          </div>
          <div className="border-t border-line p-4">
            <Button variant="primary" size="lg" className="w-full" disabled={locked} icon={locked ? <Lock size={16} /> : <Play size={16} fill="currentColor" />} onClick={start}>
              {locked ? 'Complete o cenário anterior' : 'Iniciar partida'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-2 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="num text-sm font-semibold">{value}</div>
    </div>
  );
}
