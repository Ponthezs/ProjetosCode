import { Activity, Clock, Gauge, Layers, Lock, Package, Timer } from 'lucide-react';
import { STAGE_MAP, WORK_STAGES } from '../../data/board';
import { useMetrics } from '../../hooks/useMetrics';
import type { GameState } from '../../types';
import { cx, dec } from '../../utils/format';

const HEAT: Record<string, string> = { green: '#34d399', yellow: '#fbbf24', red: '#f87171', idle: 'var(--faint)' };

export function FlowStrip({ g }: { g: GameState }) {
  const m = useMetrics(g);
  const trend = (cur: number | null, prev: number | null) => (cur === null || prev === null || Math.abs(cur - prev) < 0.05 ? null : cur > prev ? '▲' : '▼');
  const items = [
    { icon: <Gauge size={13} />, label: 'Velocidade', value: `${dec(m.velocity)} pts/d`, tip: 'Pontos de esforço concluídos por dia (média dos últimos 5 dias).' },
    { icon: <Package size={13} />, label: 'Throughput', value: `${dec(m.throughput)}/dia`, tip: 'Cards entregues por dia (média dos últimos 5 dias).' },
    { icon: <Clock size={13} />, label: 'Lead Time', value: m.lead === null ? '—' : `${dec(m.lead)}d`, trend: trend(m.lead, m.leadPrev), bad: true, tip: 'Tempo médio do comprometimento (Ready) até Done.' },
    { icon: <Timer size={13} />, label: 'Cycle Time', value: m.cycle === null ? '—' : `${dec(m.cycle)}d`, trend: trend(m.cycle, m.cyclePrev), bad: true, tip: 'Tempo médio do início (Análise) até Done.' },
    { icon: <Lock size={13} />, label: 'Bloqueados', value: String(m.blocked), warn: m.blocked > 0, tip: 'Cards bloqueados ou aguardando dependências.' },
    { icon: <Layers size={13} />, label: 'WIP', value: `${m.wip}/${m.wipLimit}`, warn: m.wip > m.wipLimit, tip: 'Trabalho em andamento nos estágios / soma dos limites.' },
    { icon: <Activity size={13} />, label: 'SLA em risco', value: String(m.slaRisk), warn: m.slaRisk > 0, tip: 'Cards comprometidos a ≤ 2 dias de estourar o SLA.' },
  ];
  return (
    <div className="relative z-20 flex items-center gap-2 border-b border-line bg-bg-2/60 px-3 py-1.5 backdrop-blur-md sm:px-4" data-tour="flowstrip">
      <div className="scroll-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {items.map((it) => (
          <div key={it.label} title={it.tip} className="flex shrink-0 cursor-help items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1">
            <span className="text-muted">{it.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{it.label}</span>
            <span className={cx('num text-[13px] font-semibold', it.warn ? 'text-warn' : 'text-fg')}>{it.value}</span>
            {it.trend && <span className={cx('text-[10px]', it.trend === '▲' ? 'text-bad' : 'text-good')}>{it.trend}</span>}
          </div>
        ))}
      </div>
      <div className="hidden shrink-0 items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 xl:flex" title="Heatmap de gargalos: pressão acumulada por estágio">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Fluxo</span>
        {WORK_STAGES.map((st) => {
          const s = m.stats[st];
          return (
            <span key={st} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: s.heat === 'idle' ? 'transparent' : `color-mix(in oklab, ${HEAT[s.heat]} 16%, transparent)` }} title={`${STAGE_MAP[st].name}: ${dec(s.loadDays)} dias de carga, ${s.queueBefore} na fila`}>
              <span className={cx('h-1.5 w-1.5 rounded-full', m.bottleneck === st && 'animate-pulse')} style={{ background: HEAT[s.heat] }} />
              <span className="text-muted">{STAGE_MAP[st].short}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
