import { motion } from 'framer-motion';
import { cardsIn, isStageComplete, openIncidents } from '../../analytics/metrics';
import { STAGE_MAP, WORK_STAGES } from '../../data/board';
import { ROLES } from '../../data/professionals';
import { burnoutRisk } from '../../game-engine/capacity';
import { useMetrics } from '../../hooks/useMetrics';
import { useGame } from '../../store/gameStore';
import type { GameState, Person, WorkStage } from '../../types';
import { cx, firstName } from '../../utils/format';
import { Avatar } from '../ui';

const ZONE_LABEL: Record<WorkStage, string> = { analysis: 'ANÁLISE', dev: 'DESENVOLVIMENTO', review: 'CODE REVIEW', test: 'QA', uat: 'HOMOLOGAÇÃO', deploy: 'DEVOPS' };

/** 🏢 OFFICE VIEW — representação 2.5D da empresa */
export function OfficeView({ g }: { g: GameState }) {
  const m = useMetrics(g);
  const incidents = openIncidents(g).length;
  const bench = g.peopleOrder.map((id) => g.people[id]).filter((p) => p && !p.stage);
  return (
    <div className="scroll-thin relative h-full overflow-auto p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">🏢 Office view</div>
          <h2 className="font-display text-3xl font-bold">O escritório</h2>
        </div>
        {incidents > 0 && (
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="ml-auto rounded-xl border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-300">🚨 {incidents} incidente(s) em produção</motion.div>
        )}
      </div>
      <div className="relative rounded-3xl border border-line p-4 sm:p-8" style={{ background: 'radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%), var(--bg-2)' }}>
        <div className="grid-bg pointer-events-none absolute inset-0 rounded-3xl opacity-40" />
        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {WORK_STAGES.map((st, i) => {
            const people = g.peopleOrder.map((id) => g.people[id]).filter((p) => p && p.stage === st);
            const stat = m.stats[st];
            const hasIncident = cardsIn(g, st).some((c) => c.type === 'incident');
            return (
              <motion.div
                key={st}
                initial={{ opacity: 0, y: 20, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cx('relative overflow-hidden rounded-3xl border bg-surface p-4 [transform-style:preserve-3d]', hasIncident ? 'pulse-red border-red-400/50' : m.bottleneck === st ? 'border-amber-400/50' : 'border-line')}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40" style={{ background: `linear-gradient(180deg, ${STAGE_MAP[st].color}33, transparent)` }} />
                <div className="relative flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: STAGE_MAP[st].color, boxShadow: `0 0 10px ${STAGE_MAP[st].color}` }} />
                  <span className="text-[11px] font-bold tracking-[0.2em]">{ZONE_LABEL[st]}</span>
                  {m.bottleneck === st && <span className="rounded bg-amber-500/20 px-1.5 text-[9px] font-bold text-amber-300">GARGALO</span>}
                  <span className="num ml-auto text-[11px] text-muted">{stat.count} cards · {Math.round(stat.utilization * 100)}% uso</span>
                </div>
                {/* Pilha de trabalho */}
                <div className="relative mt-2 flex h-5 items-end gap-[3px]">
                  {cardsIn(g, st).slice(0, 18).map((c) => (
                    <span key={c.id} title={`${c.code} ${c.title}`} className={cx('w-3 rounded-sm', c.blocked ? 'bg-red-400' : isStageComplete(c) ? 'bg-emerald-400' : 'bg-fg/40')} style={{ height: 8 + Math.min(12, c.complexity) }} />
                  ))}
                </div>
                <div className="relative mt-3 grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3">
                  {people.map((p) => <Desk key={p.id} p={p} g={g} stage={st} />)}
                  {Array.from({ length: Math.max(0, 3 - people.length) }).map((_, k) => <Desk key={`e${k}`} g={g} stage={st} />)}
                </div>
              </motion.div>
            );
          })}
        </div>
        {bench.length > 0 && (
          <div className="relative mt-5 rounded-2xl border border-dashed border-line p-3">
            <div className="mb-2 text-[11px] font-bold tracking-[0.2em] text-muted">☕ COPA — sem alocação</div>
            <div className="flex flex-wrap gap-3">{bench.map((p) => <span key={p.id} className="flex items-center gap-2 text-xs"><Avatar name={p.name} hue={p.hue} size={26} />{firstName(p.name)}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Desk({ p, g, stage }: { p?: Person; g: GameState; stage: WorkStage }) {
  const animating = useGame((s) => s.animating);
  const color = STAGE_MAP[stage].color;
  const absent = p && p.absentDays > 0;
  const working = p && !absent && (p.lastUtilization > 0.3 || animating);
  const idle = p && !absent && !working;
  const tired = p && burnoutRisk(p) >= 70;
  const blocked = p && cardsIn(g, stage).some((c) => c.blocked && c.assignees.includes(p.id));
  const bubble = !p ? null : absent ? '🏠' : blocked ? '⛔' : tired ? '🥵' : working ? '⌨️' : idle ? '☕' : null;
  return (
    <div className="relative flex flex-col items-center">
      {/* Pessoa */}
      <div className="relative z-10 h-9">
        {p && !absent && (
          <motion.div animate={working ? { y: [0, -2, 0] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            <Avatar name={p.name} hue={p.hue} size={30} ring={ROLES[p.role].color} />
          </motion.div>
        )}
        {bubble && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-5 -top-3 rounded-full border border-line bg-solid px-1 text-xs shadow">{bubble}</motion.span>
        )}
      </div>
      {/* Mesa isométrica */}
      <svg viewBox="0 0 100 60" className="-mt-2 w-full max-w-[120px]">
        <polygon points="50,8 92,28 50,48 8,28" fill="var(--solid-2)" stroke="var(--border-strong)" strokeWidth="1" />
        <polygon points="8,28 50,48 50,56 8,36" fill="color-mix(in oklab, var(--solid-2) 70%, black)" />
        <polygon points="92,28 50,48 50,56 92,36" fill="color-mix(in oklab, var(--solid-2) 82%, black)" />
        {/* monitor */}
        <polygon points="40,10 62,20 62,34 40,24" fill={p && !absent ? `color-mix(in oklab, ${color} ${working ? 55 : 20}%, #0b0e17)` : '#1f2433'} stroke="var(--border-strong)" strokeWidth="0.8" />
        {working && <polygon points="42,13 60,21.5 60,23 42,14.5" fill="rgba(255,255,255,0.5)" />}
        <rect x="49" y="30" width="3" height="6" fill="var(--border-strong)" />
      </svg>
      <div className={cx('mt-0.5 max-w-full truncate text-[10px]', p ? 'text-muted' : 'text-faint')}>{p ? firstName(p.name) : 'mesa livre'}</div>
    </div>
  );
}
