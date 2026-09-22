import { useMemo, useState, type ReactNode } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis,
} from 'recharts';
import { avg, cycleTimeHistogram, flowEfficiency, percentile } from '../../analytics/metrics';
import { STATUS, useChartTheme } from '../../analytics/chartTheme';
import { STAGE_MAP } from '../../data/board';
import { useMetrics } from '../../hooks/useMetrics';
import type { GameState, StageId } from '../../types';
import { dec, money } from '../../utils/format';
import { Segmented } from '../ui';
import { BottleneckHeatmap } from './Heatmap';

const CFD_STAGES: StageId[] = ['ready', 'analysis', 'dev', 'review', 'test', 'uat', 'deploy', 'done'];

export function AnalyticsView({ g }: { g: GameState }) {
  const t = useChartTheme();
  const m = useMetrics(g);
  const [tableView, setTableView] = useState<'charts' | 'table'>('charts');
  const h = g.history;

  const cfd = useMemo(() => h.map((x) => ({ day: `D${x.day}`, ...Object.fromEntries(CFD_STAGES.map((s) => [s, x.cfd[s]])) })), [h]);
  const hist = useMemo(() => cycleTimeHistogram(g), [g]);
  const leadPts = useMemo(() => g.delivered.map((d) => ({ day: d.day, lead: d.leadTime, code: d.code })), [g.delivered]);
  const leadLine = useMemo(() => h.map((x) => ({ day: x.day, avg: x.leadTimeAvg !== null ? Number(x.leadTimeAvg.toFixed(2)) : null, cycle: x.cycleTimeAvg !== null ? Number(x.cycleTimeAvg.toFixed(2)) : null })), [h]);
  const tp = useMemo(() => h.map((x) => ({ day: `D${x.day}`, throughput: x.throughput, arrivals: x.arrivals })), [h]);
  const wip = useMemo(() => h.map((x) => ({ day: `D${x.day}`, wip: x.wip, limite: x.wipLimitTotal, bloqueados: x.blocked })), [h]);
  const fin = useMemo(() => h.map((x) => ({ day: `D${x.day}`, receita: x.revenueTotal, custos: x.costsTotal, lucro: x.revenueTotal - x.costsTotal })), [h]);
  const sat = useMemo(() => h.map((x) => ({ day: `D${x.day}`, cliente: x.clientSat, equipe: x.teamMorale, divida: x.techDebt })), [h]);
  const qual = useMemo(() => h.map((x) => ({ day: `D${x.day}`, encontrados: x.bugsFound, producao: x.escapedBugs, retrabalho: x.rework })), [h]);
  const tpAvg = avg(h.map((x) => x.throughput)) ?? 0;
  const p85 = percentile(g.delivered.map((d) => d.cycleTime), 85);
  const fe = flowEfficiency(g);

  const axis = { stroke: t.grid, tick: { fill: t.axis, fontSize: 11 }, tickLine: false, axisLine: false } as const;
  const grid = <CartesianGrid stroke={t.grid} vertical={false} />;
  const tip = <Tooltip content={<GlassTooltip />} cursor={{ stroke: t.axis, strokeDasharray: '3 3', fill: 'transparent' }} />;
  const legend = <Legend iconType="circle" iconSize={8} itemSorter={null} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />;

  if (h.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="text-4xl">📊</div>
        <div className="font-display text-xl font-bold">Sem dados ainda</div>
        <p className="max-w-md text-sm text-muted">Os gráficos são calculados com os dados reais da partida. Inicie o primeiro dia para começar a coletar métricas de fluxo.</p>
      </div>
    );
  }

  return (
    <div className="scroll-thin h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">📊 Analytics</div>
          <h2 className="font-display text-3xl font-bold">Métricas de fluxo</h2>
        </div>
        <div className="ml-auto"><Segmented size="sm" value={tableView} onChange={setTableView} options={[{ value: 'charts', label: 'Gráficos' }, { value: 'table', label: 'Tabela' }]} /></div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Tile label="Lead Time médio" value={m.lead === null ? '—' : `${dec(m.lead)} d`} />
        <Tile label="Cycle Time médio" value={m.cycle === null ? '—' : `${dec(m.cycle)} d`} />
        <Tile label="CT 85º percentil" value={p85 === null ? '—' : `≤ ${p85} d`} />
        <Tile label="Throughput" value={`${dec(tpAvg, 2)}/dia`} />
        <Tile label="Entregas" value={String(g.delivered.length)} />
        <Tile label="Eficiência do fluxo" value={fe === null ? '—' : `${Math.round(fe * 100)}%`} />
        <Tile label="Lucro" value={money(m.profit, true)} tone={m.profit < 0 ? 'bad' : 'good'} />
        <Tile label="ROI" value={g.costsTotal ? `${Math.round((m.profit / g.costsTotal) * 100)}%` : '—'} />
      </div>

      {tableView === 'table' ? (
        <DataTable g={g} />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Cumulative Flow Diagram" subtitle="Cards por estágio ao fim de cada dia. Faixas que engordam = acúmulo (gargalo)." wide>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cfd} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                {tip}
                {[...CFD_STAGES].reverse().map((s) => {
                  const i = CFD_STAGES.indexOf(s);
                  return <Area key={s} type="monotone" dataKey={s} name={STAGE_MAP[s].name} stackId="1" stroke={t.surface} strokeWidth={1.5} fill={t.series[i]} fillOpacity={0.9} isAnimationActive animationDuration={700} />;
                })}
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
              {CFD_STAGES.map((s, i) => <span key={s} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: t.series[i] }} />{STAGE_MAP[s].name}</span>)}
            </div>
          </ChartCard>

          <ChartCard title="Cycle Time — distribuição" subtitle={p85 ? `85% dos cards terminam em até ${p85} dias` : 'Quantos cards levaram N dias'}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hist} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap={3}>
                {grid}
                <XAxis dataKey="bucket" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                {tip}
                <Bar dataKey="count" name="Cards" fill={t.series[0]} radius={[4, 4, 0, 0]} />
                {p85 && <ReferenceLine x={`${p85}d`} stroke={t.series[1]} strokeDasharray="4 3" label={{ value: 'P85', fill: t.axis, fontSize: 11, position: 'top' }} />}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Lead Time — tendência" subtitle="Cada ponto é uma entrega; linhas mostram as médias acumuladas">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={leadLine} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                {grid}
                <XAxis dataKey="day" type="number" domain={['dataMin', 'dataMax']} {...axis} tickFormatter={(v) => `D${v}`} allowDecimals={false} />
                <YAxis {...axis} />
                {tip}
                {legend}
                <Scatter data={leadPts} dataKey="lead" name="Entrega" fill={t.series[6]} shape="circle" />
                <Line type="monotone" dataKey="avg" name="Lead médio" stroke={t.series[0]} strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="cycle" name="Cycle médio" stroke={t.series[2]} strokeWidth={2} dot={false} connectNulls strokeDasharray="5 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Throughput" subtitle={`Entregas por dia · média ${dec(tpAvg, 2)}`}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={tp} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                {tip}
                {legend}
                <Bar dataKey="throughput" name="Entregues" fill={t.series[2]} radius={[4, 4, 0, 0]} />
                <Line type="stepAfter" dataKey="arrivals" name="Chegadas" stroke={t.series[1]} strokeWidth={2} dot={false} />
                <ReferenceLine y={tpAvg} stroke={t.axis} strokeDasharray="4 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="WIP" subtitle="Trabalho simultâneo vs. soma dos limites">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={wip} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="wipg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.series[6]} stopOpacity={0.5} /><stop offset="1" stopColor={t.series[6]} stopOpacity={0.02} /></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                {tip}
                {legend}
                <Area type="monotone" dataKey="wip" name="WIP" stroke={t.series[6]} strokeWidth={2} fill="url(#wipg)" />
                <Line type="stepAfter" dataKey="limite" name="Limite total" stroke={t.axis} strokeDasharray="5 4" strokeWidth={1.5} dot={false} />
                <Bar dataKey="bloqueados" name="Bloqueados" fill={STATUS.critical} radius={[3, 3, 0, 0]} barSize={8} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Financeiro" subtitle="Receita, custos e lucro acumulados">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={fin} margin={{ top: 8, right: 8, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.series[2]} stopOpacity={0.35} /><stop offset="1" stopColor={t.series[2]} stopOpacity={0} /></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip content={<GlassTooltip money />} cursor={{ stroke: t.axis, strokeDasharray: '3 3' }} />
                {legend}
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke={t.series[2]} strokeWidth={2} fill="url(#profitg)" />
                <Line type="monotone" dataKey="receita" name="Receita" stroke={t.series[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="custos" name="Custos" stroke={t.series[1]} strokeWidth={2} dot={false} />
                <ReferenceLine y={0} stroke={t.axis} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Satisfação" subtitle="Cliente, equipe e dívida técnica (%)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={sat} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} domain={[0, 100]} />
                {tip}
                {legend}
                <Line type="monotone" dataKey="cliente" name="Cliente" stroke={t.series[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="equipe" name="Equipe" stroke={t.series[4]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="divida" name="Dívida técnica" stroke={t.series[3]} strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Qualidade" subtitle={`${g.counters.bugsFound} bugs encontrados antes da produção · ${g.counters.bugsEscaped} em produção · ${g.counters.reworkTotal} retrabalhos`}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={qual} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                {grid}
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} allowDecimals={false} />
                {tip}
                {legend}
                <Bar dataKey="encontrados" name="Bugs encontrados" stackId="b" fill={t.series[0]} />
                <Bar dataKey="producao" name="Bugs em produção" stackId="b" fill={t.series[7]} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="retrabalho" name="Retrabalho (acum.)" stroke={t.series[3]} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Heatmap de gargalos" subtitle="Dias de trabalho acumulado por estágio ao longo da partida" wide>
            <BottleneckHeatmap g={g} />
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, wide }: { title: string; subtitle?: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`glass rounded-2xl p-4 ${wide ? 'xl:col-span-2' : ''}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={`num mt-0.5 text-xl font-semibold ${tone === 'bad' ? 'text-bad' : 'text-fg'}`}>{value}</div>
    </div>
  );
}

interface TipProps {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string; payload?: Record<string, unknown> }[];
  label?: string | number;
  money?: boolean;
}

function GlassTooltip({ active, payload, label, money: isMoney }: TipProps) {
  if (!active || !payload?.length) return null;
  const code = payload[0]?.payload?.code as string | undefined;
  return (
    <div className="glass-strong min-w-[150px] rounded-xl px-3 py-2 text-xs">
      <div className="mb-1 font-semibold text-muted">{typeof label === 'number' ? `Dia ${label}` : label}{code ? ` · ${code}` : ''}</div>
      {payload.filter((p) => p.value !== null && p.value !== undefined).map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="num ml-auto font-semibold text-fg">{isMoney && typeof p.value === 'number' ? money(p.value) : typeof p.value === 'number' ? dec(p.value, p.value % 1 ? 1 : 0) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DataTable({ g }: { g: GameState }) {
  return (
    <div className="glass scroll-thin overflow-x-auto rounded-2xl">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            {['Dia', 'WIP', 'Throughput', 'Chegadas', 'Lead médio', 'Cycle médio', 'Receita dia', 'Custos dia', 'Caixa', 'Cliente', 'Equipe', 'Dívida', 'Bugs', 'Bloqueados', 'Gargalo'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {g.history.map((h) => (
            <tr key={h.day} className="num border-b border-line/50 hover:bg-surface-2">
              <td className="px-3 py-1.5">{h.day}</td>
              <td className="px-3">{h.wip}</td>
              <td className="px-3">{h.throughput}</td>
              <td className="px-3">{h.arrivals}</td>
              <td className="px-3">{dec(h.leadTimeAvg)}</td>
              <td className="px-3">{dec(h.cycleTimeAvg)}</td>
              <td className="px-3">{money(h.revenueDay)}</td>
              <td className="px-3">{money(h.costsDay)}</td>
              <td className="px-3">{money(h.cash)}</td>
              <td className="px-3">{Math.round(h.clientSat)}%</td>
              <td className="px-3">{Math.round(h.teamMorale)}%</td>
              <td className="px-3">{Math.round(h.techDebt)}%</td>
              <td className="px-3">{h.bugsFound}</td>
              <td className="px-3">{h.blocked}</td>
              <td className="px-3 font-sans">{h.bottleneck ? STAGE_MAP[h.bottleneck].name : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
