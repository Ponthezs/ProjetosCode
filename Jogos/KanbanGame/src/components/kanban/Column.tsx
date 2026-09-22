import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { cardsIn } from '../../analytics/metrics';
import { STAGE_MAP, isWorkStage } from '../../data/board';
import type { StageStat } from '../../analytics/metrics';
import { useGame } from '../../store/gameStore';
import type { GameState, LimitedStage, StageId } from '../../types';
import { cx, dec, firstName } from '../../utils/format';
import { Avatar } from '../ui';
import { KanbanCard } from './KanbanCard';

const HEAT_COLOR = { green: '#34d399', yellow: '#fbbf24', red: '#f87171', idle: 'var(--faint)' } as const;

export function Column({ g, stage, stat, isBottleneck, dropState }: { g: GameState; stage: StageId; stat?: StageStat; isBottleneck: boolean; dropState: 'none' | 'ok' | 'bad' | 'person' }) {
  const def = STAGE_MAP[stage];
  const { dispatch } = useGame();
  const { setNodeRef, isOver } = useDroppable({ id: `col:${stage}`, data: { kind: 'column', stage } });
  const cards = cardsIn(g, stage);
  const limited = stage !== 'backlog' && stage !== 'done';
  const limit = limited ? g.wipLimits[stage as LimitedStage] : 0;
  const wip = limited ? cards.filter((c) => c.serviceClass !== 'expedite').length : cards.length;
  const exceeded = limited && wip > limit;
  const ratio = limited ? Math.min(1.5, wip / Math.max(1, limit)) : 0;
  const people = isWorkStage(stage) ? g.peopleOrder.map((id) => g.people[id]).filter((p) => p && p.stage === stage) : [];
  const [showAllDone, setShowAllDone] = useState(false);
  const visible = stage === 'done' && !showAllDone ? cards.slice(0, 10) : cards;
  const narrow = stage === 'backlog' || stage === 'done';

  return (
    <div
      ref={setNodeRef}
      data-tour={`col-${stage}`}
      className={cx(
        'relative flex h-full shrink-0 flex-col rounded-2xl border transition-colors duration-200',
        narrow ? 'w-[236px]' : 'w-[262px]',
        exceeded ? 'border-red-400/50 bg-red-500/[0.06]' : 'border-line bg-surface/70',
        isOver && dropState === 'ok' && 'border-emerald-400/60 bg-emerald-400/[0.07]',
        isOver && dropState === 'bad' && 'border-red-400/60 bg-red-400/[0.07]',
        isOver && dropState === 'person' && 'border-accent/60 bg-accent/[0.08]',
        exceeded && 'pulse-red',
      )}
    >
      {/* Cabeçalho da coluna */}
      <div className="shrink-0 px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: def.color, boxShadow: `0 0 10px ${def.color}` }} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg">{def.name}</h3>
          <span className="num rounded-md bg-surface-3 px-1.5 text-[11px] text-muted">{cards.length}</span>
          {stat && (
            <span className="ml-auto flex items-center gap-1" title={`Carga: ${dec(stat.loadDays)} dias de trabalho · fila: ${stat.queueBefore}`}>
              {isBottleneck && <span className="rounded bg-red-500/20 px-1 text-[9px] font-bold uppercase tracking-wider text-red-300">Gargalo</span>}
              <span className={cx('h-2 w-2 rounded-full', isBottleneck && 'animate-pulse')} style={{ background: HEAT_COLOR[stat.heat] }} />
            </span>
          )}
        </div>

        {limited && (
          <div className="mt-2" data-tour={`wip-${stage}`}>
            <div className="flex items-center justify-between">
              <span className={cx('num text-[12px] font-semibold', exceeded ? 'text-red-300' : 'text-fg')}>
                {wip} <span className="text-muted">/ {limit} WIP</span>
              </span>
              <div className="flex items-center gap-0.5" title="Ajustar limite de WIP">
                <button className="focus-ring rounded-md p-0.5 text-muted hover:bg-surface-3 hover:text-fg" onClick={() => dispatch({ type: 'setWip', stage: stage as LimitedStage, limit: limit - 1 })} aria-label="Diminuir WIP"><Minus size={12} /></button>
                <button className="focus-ring rounded-md p-0.5 text-muted hover:bg-surface-3 hover:text-fg" onClick={() => dispatch({ type: 'setWip', stage: stage as LimitedStage, limit: limit + 1 })} aria-label="Aumentar WIP"><Plus size={12} /></button>
              </div>
            </div>
            <div className="mt-1 flex h-[6px] gap-[2px]">
              {Array.from({ length: Math.max(limit, wip) }).map((_, i) => (
                <span key={i} className="flex-1 rounded-sm transition-colors" style={{ background: i < wip ? (i >= limit ? '#f87171' : ratio >= 1 ? '#fbbf24' : def.color) : 'var(--surface-3)' }} />
              ))}
            </div>
            <AnimatePresence>
              {exceeded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                  <AlertTriangle size={11} /> WIP excedido
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {stat && (
          <div className="mt-2 grid grid-cols-3 gap-1 text-center">
            <Mini label="Cap." value={`${dec(stat.capacity)}`} tip="Capacidade prevista do setor (pontos/dia)" />
            <Mini label="Prod." value={`${Math.round(stat.utilization * 100)}%`} tip="Produtividade: uso da capacidade no último dia" />
            <Mini label="Fila" value={String(stat.queueBefore)} tip="Cards prontos no estágio anterior aguardando espaço" warn={stat.queueBefore >= 2} />
          </div>
        )}

        {isWorkStage(stage) && (
          <div className={cx('mt-2 flex min-h-[28px] items-center gap-1 rounded-lg border border-dashed px-1.5 py-1', people.length ? 'border-line' : 'border-red-400/40 bg-red-500/5')} title="Arraste pessoas da equipe para cá">
            {people.length ? (
              people.map((p) => (
                <span key={p.id} className="flex items-center gap-1" title={`${p.name}${p.absentDays > 0 ? ` — ausente (${p.absentReason})` : ''}`}>
                  <Avatar name={p.name} hue={p.hue} size={20} absent={p.absentDays > 0} />
                  {people.length <= 2 && <span className={cx('text-[10px]', p.absentDays > 0 ? 'text-faint line-through' : 'text-muted')}>{firstName(p.name)}</span>}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-red-300/80">Ninguém alocado</span>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="scroll-thin min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-3">
        {visible.map((c) => (
          <KanbanCard key={c.id} card={c} g={g} />
        ))}
        {stage === 'done' && cards.length > 10 && (
          <button className="w-full rounded-lg py-1 text-[11px] text-muted hover:text-fg" onClick={() => setShowAllDone(!showAllDone)}>
            {showAllDone ? 'Mostrar menos' : `+${cards.length - 10} entregas`}
          </button>
        )}
        {cards.length === 0 && <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-line text-[11px] text-faint">{stage === 'ready' ? 'Arraste do Backlog' : 'Vazio'}</div>}
      </div>
    </div>
  );
}

function Mini({ label, value, tip, warn }: { label: string; value: string; tip: string; warn?: boolean }) {
  return (
    <div title={tip} className="rounded-md bg-surface-3/60 px-1 py-0.5">
      <div className="text-[8.5px] uppercase tracking-widest text-faint">{label}</div>
      <div className={cx('num text-[11px] font-semibold', warn ? 'text-warn' : 'text-fg/90')}>{value}</div>
    </div>
  );
}
