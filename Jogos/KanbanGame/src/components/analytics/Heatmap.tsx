import { seqColor, useChartTheme } from '../../analytics/chartTheme';
import { STAGE_MAP, WORK_STAGES } from '../../data/board';
import { useMetrics } from '../../hooks/useMetrics';
import type { GameState } from '../../types';
import { dec } from '../../utils/format';

export function BottleneckHeatmap({ g }: { g: GameState }) {
  const t = useChartTheme();
  const m = useMetrics(g);
  const h = g.history;
  const max = Math.max(3, ...h.flatMap((x) => WORK_STAGES.map((s) => Math.min(x.stageLoad[s] + x.queue[s] * 0.6, 12))));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {WORK_STAGES.map((s) => {
          const st = m.stats[s];
          const icon = st.heat === 'red' ? '🔴' : st.heat === 'yellow' ? '🟡' : st.heat === 'green' ? '🟢' : '⚪';
          return (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{STAGE_MAP[s].name}</span>
              <span>{icon}</span>
            </div>
          );
        })}
      </div>
      {m.bottleneck && <p className="mb-3 text-sm">Gargalo detectado em <b className="text-bad">{STAGE_MAP[m.bottleneck].name.toUpperCase()}</b> — {dec(m.stats[m.bottleneck].loadDays)} dias de trabalho acumulado.</p>}
      <div className="scroll-thin overflow-x-auto">
        <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `110px repeat(${h.length}, minmax(18px, 1fr))` }}>
          {WORK_STAGES.map((s) => (
            <div key={s} className="contents">
              <div className="flex items-center pr-2 text-[11px] text-muted">{STAGE_MAP[s].name}</div>
              {h.map((x) => {
                const v = Math.min(x.stageLoad[s] + x.queue[s] * 0.6, 12);
                const isBn = x.bottleneck === s;
                return (
                  <div
                    key={x.day}
                    title={`Dia ${x.day} · ${STAGE_MAP[s].name}: carga ${dec(x.stageLoad[s])}d, fila ${x.queue[s]}, utilização ${Math.round(x.utilization[s] * 100)}%${isBn ? ' · GARGALO' : ''}`}
                    className="relative h-6 min-w-[18px] rounded-[4px]"
                    style={{ background: seqColor(v / max, t.dark), boxShadow: isBn ? `inset 0 0 0 2px ${t.dark ? '#fff' : '#0e1526'}` : undefined }}
                  />
                );
              })}
            </div>
          ))}
          <div />
          {h.map((x) => <div key={x.day} className="num pt-1 text-center text-[9px] text-faint">{x.day % 5 === 0 || x.day === 1 ? x.day : ''}</div>)}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        <span>Baixa carga</span>
        <div className="flex h-2 w-40 overflow-hidden rounded-full">{Array.from({ length: 10 }).map((_, i) => <span key={i} className="flex-1" style={{ background: seqColor((i + 1) / 10, t.dark) }} />)}</div>
        <span>Alta carga</span>
        <span className="ml-3 inline-block h-3 w-3 rounded-[3px]" style={{ boxShadow: `inset 0 0 0 2px ${t.dark ? '#fff' : '#0e1526'}` }} /> gargalo do dia
      </div>
    </div>
  );
}
