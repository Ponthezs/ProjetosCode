import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { AlertTriangle, BarChart3, CheckCircle2, Home, Lightbulb, RotateCcw, Star, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useChartTheme } from '../analytics/chartTheme';
import { AchievementGrid } from '../components/upgrades/UpgradesView';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { Button, Modal } from '../components/ui';
import { STAGE_MAP } from '../data/board';
import { DIFFICULTIES } from '../data/difficulties';
import { SCENARIO_MAP } from '../scenarios';
import { useGame } from '../store/gameStore';
import type { StageId } from '../types';
import { cx, dec, int, money } from '../utils/format';

export function EndScreen() {
  const { game: g, setScreen, newGame } = useGame();
  const t = useChartTheme();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const score = useMotionValue(0);
  const scoreText = useTransform(score, (v) => int(v));
  useEffect(() => {
    if (!g?.report) return;
    const c = animate(score, g.report.score, { duration: 2.2, ease: [0.2, 0.8, 0.2, 1] });
    return () => c.stop();
  }, [g, score]);
  if (!g || !g.report) {
    return <div className="flex h-full items-center justify-center"><Button onClick={() => setScreen('menu')}>Menu</Button></div>;
  }
  const r = g.report;
  const sc = SCENARIO_MAP[g.scenarioId];
  const diff = DIFFICULTIES.find((d) => d.id === g.difficultyId);
  const maxPts = Math.max(...r.breakdown.map((b) => Math.abs(b.points)), 1);
  const cfdStages: StageId[] = ['analysis', 'dev', 'review', 'test', 'uat', 'deploy', 'done'];
  const cfd = g.history.map((h) => ({ day: `D${h.day}`, ...Object.fromEntries(cfdStages.map((s) => [s, h.cfd[s]])) }));

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-[1300px] p-4 sm:p-8">
        {/* HERO */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[100px]" style={{ background: `${r.rank.color}55` }} />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">Fim da partida · {sc?.name} · {diff?.name} · {g.seedLabel}</div>
              <div className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">Score final</div>
              <motion.div className="num font-display text-6xl font-bold sm:text-8xl"><span className="text-gradient"><motion.span>{scoreText}</motion.span></span></motion.div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 12 }} className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-lg font-bold tracking-wider" style={{ borderColor: r.rank.color, color: r.rank.color, background: `color-mix(in oklab, ${r.rank.color} 12%, transparent)` }}>
                  {r.rank.icon} {r.rank.name}
                </motion.span>
                {g.mode === 'campaign' && (
                  <span className="flex gap-1">{[0, 1, 2].map((i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 + i * 0.2 }}><Star size={26} className={i < r.stars ? 'text-amber-400' : 'text-faint/40'} fill={i < r.stars ? 'currentColor' : 'none'} /></motion.span>)}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button variant="primary" size="lg" icon={<RotateCcw size={16} />} onClick={() => newGame({ mode: g.mode, scenarioId: g.scenarioId, difficultyId: g.difficultyId, days: g.totalDays, seedLabel: g.seedLabel })}>Jogar novamente (mesma seed)</Button>
              <Button size="lg" icon={<Trophy size={16} />} onClick={() => setScreen('newgame', g.mode === 'campaign' ? 'campaign' : 'modes')}>Nova partida</Button>
              <Button size="lg" variant="ghost" icon={<Home size={16} />} onClick={() => setScreen('menu')}>Menu principal</Button>
            </div>
          </div>
        </motion.section>

        {/* Métricas */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Receita', money(r.metrics.revenue, true)],
            ['Lucro', money(r.metrics.profit, true)],
            ['ROI', `${Math.round(r.metrics.roi * 100)}%`],
            ['Entregas', String(r.metrics.delivered)],
            ['Lead Time', `${dec(r.metrics.leadTime)} d`],
            ['Cycle Time', `${dec(r.metrics.cycleTime)} d`],
            ['Throughput', `${dec(r.metrics.throughput, 2)}/dia`],
            ['WIP médio', dec(r.metrics.avgWip)],
            ['Bugs em produção', String(r.metrics.escapedBugs)],
            ['Retrabalho', String(r.metrics.rework)],
            ['Cliente', `${Math.round(r.metrics.clientSat)}%`],
            ['Equipe', `${Math.round(r.metrics.teamMorale)}%`],
            ['Dívida técnica', `${Math.round(r.metrics.techDebt)}%`],
            ['Eficiência do fluxo', `${Math.round(r.metrics.flowEfficiency * 100)}%`],
            ['SLAs violados', String(r.metrics.slaBreaches)],
            ['Dias bloqueados', String(r.metrics.blockedDays)],
            ['Valor entregue', `${int(r.metrics.valuePoints)} pts`],
            ['Conquistas', String(g.achievements.length)],
          ].map(([k, v], i) => (
            <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.03 }} className="glass rounded-2xl px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{k}</div>
              <div className="num text-lg font-semibold">{v}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
          {/* Relatório de gestão */}
          <section className="glass rounded-3xl p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">📋 Relatório de gestão</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ReportItem label="Seu maior gargalo foi" value={r.mainBottleneck ? STAGE_MAP[r.mainBottleneck].name.toUpperCase() : 'Nenhum'} highlight />
              <ReportItem label="WIP médio" value={dec(r.metrics.avgWip)} />
              <ReportItem label="Cycle Time médio" value={`${dec(r.metrics.cycleTime)} dias`} />
              <ReportItem label="Lead Time" value={`${dec(r.metrics.leadTime)} dias`} />
              <ReportItem label="Throughput" value={`${dec(r.metrics.throughput)} cards/dia`} />
              <ReportItem label="Quantidade de retrabalho" value={String(r.metrics.rework)} />
            </div>
            <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} className="text-warn" />Principal problema detectado: <span className="text-warn">{r.mainProblem.title}</span></div>
              <p className="mt-2 text-sm leading-relaxed text-fg/85">{r.mainProblem.explanation}</p>
            </div>
            {cfd.length > 1 && (
              <div className="mt-5">
                <div className="mb-1 text-xs text-muted">Cumulative Flow Diagram da partida</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={cfd} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke={t.grid} vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: t.axis, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: t.surface, border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
                    {[...cfdStages].reverse().map((s) => <Area key={s} dataKey={s} name={STAGE_MAP[s].name} stackId="1" stroke={t.surface} strokeWidth={1} fill={t.series[cfdStages.indexOf(s) + 1]} fillOpacity={0.9} />)}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <Button className="mt-4" size="sm" icon={<BarChart3 size={14} />} onClick={() => setShowAnalytics(true)}>Abrir analytics completo</Button>
          </section>

          {/* Breakdown */}
          <section className="glass rounded-3xl p-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Composição do score</h3>
            <div className="mt-4 space-y-2.5">
              {r.breakdown.map((b, i) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs"><span className="text-muted">{b.label} <span className="text-faint">· {b.value}</span></span><span className={cx('num font-semibold', b.points < 0 && 'text-bad')}>{int(b.points)}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(Math.abs(b.points) / maxPts) * 100}%` }} transition={{ delay: 0.5 + i * 0.06, duration: 0.8 }} style={{ background: b.points < 0 ? 'var(--bad)' : 'linear-gradient(90deg, #7c83ff, #22d3ee)' }} />
                  </div>
                </div>
              ))}
            </div>
            {r.goals.length > 0 && (
              <>
                <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Metas do cenário</h3>
                <ul className="mt-2 space-y-1.5">
                  {r.goals.map((goal) => (
                    <li key={goal.label} className="flex items-center gap-2 text-sm">
                      {goal.achieved ? <CheckCircle2 size={15} className="text-good" /> : <AlertTriangle size={15} className="text-bad" />}
                      <span className={goal.achieved ? '' : 'text-muted'}>{goal.label}</span>
                      <span className="num ml-auto text-xs text-muted">{goal.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        {/* Retrospectiva */}
        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <RetroCol title="O que funcionou" icon={<CheckCircle2 size={16} />} color="var(--good)" items={r.worked.map((x) => `✅ ${x}`)} />
          <RetroCol title="O que poderia melhorar" icon={<AlertTriangle size={16} />} color="var(--warn)" items={r.improve.length ? r.improve.map((x) => `⚠ ${x}`) : ['Nada crítico — excelente gestão!']} />
          <RetroCol title="Recomendações" icon={<Lightbulb size={16} />} color="var(--accent)" items={r.recommendations} />
        </section>

        {g.achievements.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Conquistas desta partida</h3>
            <AchievementGrid unlocked={new Set(g.achievements)} thisGame={new Set(g.achievements)} />
          </section>
        )}
      </div>
      <Modal open={showAnalytics} onClose={() => setShowAnalytics(false)} width={1300}>
        <div className="h-[85vh]"><AnalyticsView g={g} /></div>
      </Modal>
    </div>
  );
}

function ReportItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={cx('mt-0.5 font-semibold', highlight ? 'text-bad' : '')}>{value}</div>
    </div>
  );
}

function RetroCol({ title, icon, color, items }: { title: string; icon: React.ReactNode; color: string; items: string[] }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color }}>{icon}{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }} className="text-sm leading-relaxed text-fg/90">{it}</motion.li>)}
      </ul>
    </div>
  );
}
