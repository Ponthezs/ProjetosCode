import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { ACHIEVEMENTS, TIER_COLOR } from '../../data/achievements';
import { BRANCH_META, UPGRADES } from '../../data/upgrades';
import { upgradeAvailability } from '../../game-engine/actions';
import { useGame } from '../../store/gameStore';
import type { GameState, UpgradeDef } from '../../types';
import { cx, money } from '../../utils/format';
import { Button, Icon } from '../ui';

export function UpgradesView({ g }: { g: GameState }) {
  const { dispatch, toast } = useGame();
  const branches = Object.keys(BRANCH_META) as UpgradeDef['branch'][];
  return (
    <div className="scroll-thin h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Skill tree da empresa</div>
          <h2 className="font-display text-3xl font-bold">Melhorias</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">Investimentos permanentes na capacidade da organização. Efeitos valem a partir do próximo dia.</p>
        </div>
        <div className="ml-auto rounded-xl border border-line bg-surface px-4 py-2"><div className="text-[10px] uppercase tracking-widest text-muted">Caixa</div><div className="num text-lg font-semibold">{money(g.cash)}</div></div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {branches.map((b) => (
          <div key={b} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="h-2 w-2 rounded-full" style={{ background: BRANCH_META[b].color, boxShadow: `0 0 10px ${BRANCH_META[b].color}` }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRANCH_META[b].color }}>{BRANCH_META[b].label}</span>
            </div>
            {UPGRADES.filter((u) => u.branch === b).map((u, i) => {
              const lvl = g.upgrades[u.id] ?? 0;
              const av = upgradeAvailability(g, u.id);
              const maxed = lvl >= u.maxLevel;
              const locked = !maxed && av.reason?.startsWith('Requer');
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cx('glass relative overflow-hidden rounded-2xl p-4', lvl > 0 && 'border-line-strong', locked && 'opacity-60')}>
                  {lvl > 0 && <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 0% 0%, ${BRANCH_META[b].color}, transparent 60%)` }} />}
                  <div className="relative flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${BRANCH_META[b].color} 18%, transparent)`, color: BRANCH_META[b].color }}>{locked ? <Lock size={17} /> : <Icon name={u.icon} size={19} />}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight">{u.name}</div>
                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: u.maxLevel }).map((_, k) => <span key={k} className="h-1.5 w-5 rounded-full" style={{ background: k < lvl ? BRANCH_META[b].color : 'var(--surface-3)' }} />)}
                      </div>
                    </div>
                  </div>
                  <p className="relative mt-2 text-xs leading-relaxed text-muted">{u.description}</p>
                  <div className="relative mt-2 text-[11px] font-medium text-fg/85">{maxed ? u.levelText[u.maxLevel - 1] : `Nível ${lvl + 1}: ${u.levelText[lvl]}`}</div>
                  <div className="relative mt-3">
                    {maxed ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-good"><Check size={14} />Nível máximo</div>
                    ) : (
                      <Button size="sm" variant={av.ok ? 'primary' : 'outline'} className="w-full" disabled={!av.ok} onClick={() => { dispatch({ type: 'buyUpgrade', upgradeId: u.id }); toast({ tone: 'good', title: `${u.name} nível ${lvl + 1}`, body: u.levelText[lvl], icon: '🏗️' }); }}>
                        {av.ok ? `Investir ${money(av.cost)}` : `${av.reason} · ${money(av.cost)}`}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AchievementsView({ g }: { g: GameState }) {
  const profile = useGame((s) => s.profile);
  const unlocked = new Set([...profile.achievements, ...g.achievements]);
  return (
    <div className="scroll-thin h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Conquistas</div>
        <h2 className="font-display text-3xl font-bold">{unlocked.size} / {ACHIEVEMENTS.length}</h2>
      </div>
      <AchievementGrid unlocked={unlocked} thisGame={new Set(g.achievements)} />
    </div>
  );
}

export function AchievementGrid({ unlocked, thisGame }: { unlocked: Set<string>; thisGame?: Set<string> }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {ACHIEVEMENTS.map((a) => {
        const on = unlocked.has(a.id);
        return (
          <div key={a.id} className={cx('glass relative overflow-hidden rounded-2xl p-4', !on && 'opacity-45 grayscale')}>
            {on && <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" style={{ background: `${TIER_COLOR[a.tier]}44` }} />}
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border text-2xl" style={{ borderColor: on ? TIER_COLOR[a.tier] : 'var(--border)' }}>{on ? a.icon : '🔒'}</span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold tracking-wide">🏆 {a.name}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TIER_COLOR[a.tier] }}>{a.tier}{thisGame?.has(a.id) ? ' · nesta partida' : ''}</div>
              </div>
            </div>
            <p className="relative mt-2 text-xs text-muted">{a.description}</p>
          </div>
        );
      })}
    </div>
  );
}
