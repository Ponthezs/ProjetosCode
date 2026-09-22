import { useDraggable, useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { Bug, CircleDollarSign, Hourglass, Link2, Lock, PauseCircle, RotateCcw } from 'lucide-react';
import { memo } from 'react';
import { dependenciesMet, isStageComplete, slaRemaining } from '../../analytics/metrics';
import { CARD_TYPES, PRIORITY_META, SERVICE_CLASSES, STAGE_MAP, WORK_STAGES, isWorkStage } from '../../data/board';
import { useGame } from '../../store/gameStore';
import type { Card, FloatFx, GameState } from '../../types';
import { cx, money } from '../../utils/format';
import { Avatar } from '../ui';

const FX_STYLE: Record<FloatFx['kind'], string> = {
  progress: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
  blocked: 'text-red-300 bg-red-500/20 border-red-400/40',
  bug: 'text-rose-200 bg-rose-600/30 border-rose-400/50',
  done: 'text-emerald-200 bg-emerald-500/30 border-emerald-300/50',
  money: 'text-amber-200 bg-amber-500/20 border-amber-300/40',
  unblocked: 'text-sky-200 bg-sky-500/20 border-sky-300/40',
  rework: 'text-orange-200 bg-orange-500/20 border-orange-300/40',
  sla: 'text-red-200 bg-red-600/30 border-red-400/50',
  moved: 'text-sky-200 bg-sky-500/20 border-sky-300/40',
};

interface Props {
  card: Card;
  g: GameState;
  overlay?: boolean;
  compact?: boolean;
}

function CardInner({ card, g, overlay, compact }: Props) {
  const { selectCard, fx, fxKey, hoverCardId, setHoverCard, animating } = useGame();
  const drag = useDraggable({ id: `card:${card.id}`, data: { kind: 'card', cardId: card.id }, disabled: overlay || animating || card.stage === 'done' });
  const drop = useDroppable({ id: `slot:${card.id}`, data: { kind: 'slot', cardId: card.id, stage: card.stage }, disabled: overlay });
  const setRef = (el: HTMLElement | null) => {
    drag.setNodeRef(el);
    drop.setNodeRef(el);
  };

  const type = CARD_TYPES[card.type];
  const cls = SERVICE_CLASSES[card.serviceClass];
  const myFx = fx.filter((f) => f.cardId === card.id);
  const sla = slaRemaining(g, card);
  const stage = card.stage;
  const w = isWorkStage(stage) ? card.work[stage] : null;
  const pct = w ? w.done / w.total : 0;
  const complete = isWorkStage(card.stage) && isStageComplete(card);
  const depsOpen = card.dependsOn.filter((d) => g.cards[d] && g.cards[d].stage !== 'done');
  const waitingDeps = stage === 'dev' && !dependenciesMet(g, card);
  const hovered = hoverCardId ? g.cards[hoverCardId] : null;
  const related = hovered && hovered.id !== card.id && (hovered.dependsOn.includes(card.id) || card.dependsOn.includes(hovered.id));
  const isOver = drop.isOver && !drag.isDragging;
  const expedite = card.serviceClass === 'expedite';
  const incident = card.type === 'incident';
  const done = stage === 'done';

  if (compact || done) {
    return (
      <motion.div
        layout={!overlay}
        layoutId={overlay ? undefined : card.id}
        ref={setRef}
        {...drag.listeners}
        {...drag.attributes}
        onClick={() => selectCard(card.id)}
        data-card-id={card.id}
        className={cx('group relative cursor-pointer overflow-hidden rounded-xl border border-line bg-solid-2/80 px-2.5 py-2 transition-colors hover:border-line-strong', done && 'border-emerald-400/15')}
      >
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: type.color }} />
        <div className="flex items-center gap-2 pl-1">
          <span className="num text-[10px] text-muted">{card.code}</span>
          {done && card.deliveredValue !== undefined && <span className="num ml-auto text-[10px] text-good">+{money(card.deliveredValue, true)}</span>}
          {!done && <span className="num ml-auto text-[10px] text-faint">{money(card.value, true)}</span>}
        </div>
        <div className="truncate pl-1 text-xs text-fg/90">{card.title}</div>
        <FxLayer fx={myFx} k={fxKey} />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout={!overlay && !drag.isDragging}
      layoutId={overlay ? undefined : card.id}
      ref={setRef}
      {...drag.listeners}
      {...drag.attributes}
      data-card-id={card.id}
      onClick={() => selectCard(card.id)}
      onMouseEnter={() => (card.dependsOn.length || Object.values(g.cards).some((c) => c.dependsOn.includes(card.id))) && setHoverCard(card.id)}
      onMouseLeave={() => hoverCardId === card.id && setHoverCard(null)}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={cx(
        'group relative cursor-grab touch-none select-none overflow-hidden rounded-2xl border bg-solid-2 p-2.5 pl-3.5 transition-[border-color,box-shadow,opacity] active:cursor-grabbing',
        'shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_20px_-14px_rgba(0,0,0,0.8)]',
        drag.isDragging ? 'opacity-30' : 'hover:border-line-strong hover:-translate-y-[1px]',
        overlay && 'rotate-[1.5deg] scale-[1.04] shadow-2xl ring-1 ring-accent/50',
        expedite && !card.blocked && 'pulse-amber',
        incident && 'pulse-red',
        card.blocked && 'border-red-400/40',
        complete && isWorkStage(stage) && !card.blocked && 'border-emerald-400/35',
        !card.blocked && !complete && 'border-line',
        related && 'ring-2 ring-sky-400/70',
        isOver && 'ring-2 ring-accent/60',
        card.paused && 'opacity-60',
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[4px]" style={{ background: `linear-gradient(180deg, ${type.color}, color-mix(in oklab, ${type.color} 40%, transparent))` }} />
      {card.blocked && <div className="hatch-bad pointer-events-none absolute inset-0" />}

      {/* Cabeçalho */}
      <div className="relative flex items-center gap-1.5">
        <span className="num text-[10px] font-semibold tracking-wide text-muted">{card.code}</span>
        <span className="rounded px-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: type.color, background: `color-mix(in oklab, ${type.color} 14%, transparent)` }}>{type.label}</span>
        <span className="ml-auto flex items-center gap-1">
          {card.serviceClass !== 'standard' && (
            <span title={cls.description} className="rounded px-1 text-[9px] font-bold tracking-wider" style={{ color: cls.color, background: `color-mix(in oklab, ${cls.color} 16%, transparent)` }}>
              {cls.icon} {cls.short}
            </span>
          )}
          <span title={`Prioridade ${PRIORITY_META[card.priority].label}`} className="h-2 w-2 rounded-full" style={{ background: PRIORITY_META[card.priority].color }} />
        </span>
      </div>

      {/* Título */}
      <div className="relative mt-1 line-clamp-2 text-[12.5px] font-medium leading-snug text-fg">{card.title}</div>

      {/* Métricas */}
      <div className="relative mt-1.5 flex items-center gap-2 text-[10.5px] text-muted">
        {card.value > 0 && <span className="num flex items-center gap-0.5" title="Valor financeiro"><CircleDollarSign size={11} />{money(card.value, true)}</span>}
        <span className="num" title="Complexidade (story points)">◆ {card.complexity}</span>
        {sla !== null && (
          <span title={card.serviceClass === 'fixed' ? `Data fixa: dia ${card.dueDay}` : 'Dias restantes de SLA'} className={cx('num ml-auto flex items-center gap-0.5 rounded px-1', sla < 0 ? 'bg-red-500/20 text-red-300' : sla <= 2 ? 'bg-amber-500/15 text-amber-300' : 'text-muted')}>
            <Hourglass size={10} />{sla < 0 ? `${sla}d` : `${sla}d`}
          </span>
        )}
      </div>

      {/* Progresso do estágio */}
      {w && (
        <div className="relative mt-2">
          <div className="mb-0.5 flex items-center justify-between text-[10px]">
            <span className="text-faint">{complete ? '✓ pronto p/ puxar' : STAGE_MAP[stage].name}</span>
            <span className={cx('num', complete ? 'text-good' : 'text-muted')}>{Math.round(pct * 100)}%</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-surface-3">
            <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ background: complete ? 'var(--good)' : STAGE_MAP[stage].color }} />
          </div>
          <div className="mt-1 flex gap-[3px]">
            {WORK_STAGES.map((st) => {
              const x = card.work[st];
              const f = x.done / x.total;
              return <span key={st} title={STAGE_MAP[st].name} className="h-[3px] flex-1 rounded-full" style={{ background: f >= 0.999 ? STAGE_MAP[st].color : f > 0 ? `color-mix(in oklab, ${STAGE_MAP[st].color} 45%, transparent)` : 'var(--surface-3)' }} />;
            })}
          </div>
        </div>
      )}

      {/* Rodapé */}
      {(card.assignees.length > 0 || depsOpen.length > 0 || card.bugsFound > 0 || card.reworkCount > 0 || card.paused) && (
        <div className="relative mt-2 flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {card.assignees.slice(0, 3).map((pid) => {
              const p = g.people[pid];
              return p ? <Avatar key={pid} name={p.name} hue={p.hue} size={18} /> : null;
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted">
            {depsOpen.length > 0 && <span className={cx('flex items-center gap-0.5', waitingDeps && 'text-sky-300')} title={`Depende de ${depsOpen.map((d) => g.cards[d]?.code).join(', ')}`}><Link2 size={11} />{g.cards[depsOpen[0]]?.code.replace('#', '')}</span>}
            {card.bugsFound > 0 && <span className="flex items-center gap-0.5 text-rose-300" title="Bugs encontrados"><Bug size={11} />{card.bugsFound}</span>}
            {card.reworkCount > 0 && <span className="flex items-center gap-0.5 text-orange-300" title="Retrabalhos"><RotateCcw size={10} />{card.reworkCount}</span>}
            {card.paused && <PauseCircle size={12} className="text-muted" />}
          </div>
        </div>
      )}

      {/* Bloqueio */}
      {(card.blocked || waitingDeps) && (
        <div className={cx('relative mt-2 flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10.5px] font-medium', card.blocked ? 'border-red-400/40 bg-red-500/15 text-red-200' : 'border-sky-400/30 bg-sky-500/10 text-sky-200')}>
          <Lock size={11} />
          <span className="truncate">{card.blocked ? card.blocked.reason : `Aguardando ${g.cards[depsOpen[0]]?.code ?? 'dependência'}`}</span>
          {card.blocked && <span className="num ml-auto shrink-0">{card.blocked.daysLeft}d</span>}
        </div>
      )}

      <FxLayer fx={myFx} k={fxKey} />
    </motion.div>
  );
}

function FxLayer({ fx, k }: { fx: FloatFx[]; k: number }) {
  return (
    <AnimatePresence>
      {fx.length > 0 && (
        <div key={k} className="pointer-events-none absolute inset-0 z-10 flex flex-col items-end justify-start gap-1 p-1.5">
          {fx.map((f, i) => (
            <motion.span
              key={`${k}-${i}`}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: [12, 0, -6, -22], scale: [0.8, 1.08, 1, 1] }}
              transition={{ duration: 1.6, delay: i * 0.18, times: [0, 0.2, 0.7, 1] }}
              className={cx('num rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur-sm', FX_STYLE[f.kind])}
            >
              {f.text}
            </motion.span>
          ))}
          {fx.some((f) => f.kind === 'bug' || f.kind === 'blocked') && <motion.div className="absolute inset-0 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1 }} style={{ background: 'radial-gradient(circle, rgba(248,113,113,0.35), transparent 70%)' }} />}
          {fx.some((f) => f.kind === 'done') && <motion.div className="absolute inset-0 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 1.2 }} style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.45), transparent 70%)' }} />}
        </div>
      )}
    </AnimatePresence>
  );
}

export const KanbanCard = memo(CardInner);
