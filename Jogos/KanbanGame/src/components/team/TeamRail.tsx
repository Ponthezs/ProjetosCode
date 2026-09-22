import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripVertical, UserPlus } from 'lucide-react';
import { STAGE_MAP, WORK_STAGES } from '../../data/board';
import { ROLES } from '../../data/professionals';
import { burnoutRisk, expectedCapacity, moodEmoji } from '../../game-engine/capacity';
import { useGame } from '../../store/gameStore';
import type { GameState, Person, WorkStage } from '../../types';
import { cx, dec } from '../../utils/format';
import { Avatar, Button } from '../ui';

export function TeamRail({ g }: { g: GameState }) {
  const { setTalentOpen } = useGame();
  const bench = useDroppable({ id: 'bench', data: { kind: 'bench' } });
  const people = g.peopleOrder.map((id) => g.people[id]).filter(Boolean);
  return (
    <div className="flex h-full flex-col" data-tour="team-rail">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] text-muted">Arraste para uma coluna para alocar</span>
        <Button size="sm" variant="soft" icon={<UserPlus size={13} />} onClick={() => setTalentOpen(true)}>Contratar</Button>
      </div>
      <div ref={bench.setNodeRef} className={cx('scroll-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto rounded-xl pr-1 transition-colors', bench.isOver && 'bg-accent/10')}>
        {people.map((p) => <PersonRow key={p.id} p={p} g={g} />)}
      </div>
    </div>
  );
}

export function PersonRow({ p, g, overlay }: { p: Person; g: GameState; overlay?: boolean }) {
  const { dispatch, animating } = useGame();
  const drag = useDraggable({ id: `person:${p.id}`, data: { kind: 'person', personId: p.id }, disabled: overlay || animating });
  const absent = p.absentDays > 0;
  const cap = p.stage ? expectedCapacity(g, p, p.stage) : 0;
  const risk = burnoutRisk(p);
  return (
    <div
      ref={drag.setNodeRef}
      className={cx('group flex items-center gap-2 rounded-xl border border-line bg-solid-2/70 p-2 transition-all', drag.isDragging && 'opacity-30', overlay && 'scale-105 shadow-2xl ring-1 ring-accent/50', absent && 'opacity-60')}
    >
      <button {...drag.listeners} {...drag.attributes} className="cursor-grab touch-none text-faint hover:text-muted active:cursor-grabbing" aria-label={`Arrastar ${p.name}`}><GripVertical size={14} /></button>
      <Avatar name={p.name} hue={p.hue} size={30} absent={absent} ring={ROLES[p.role].color} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-semibold">{p.name}</span>
          <span className="text-sm leading-none" title={`Moral ${Math.round(p.morale)}%`}>{moodEmoji(p)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted">
          <span style={{ color: ROLES[p.role].color }}>{ROLES[p.role].short}</span>
          <span>·</span>
          {absent ? <span className="text-warn">{p.absentReason} ({p.absentDays}d)</span> : <span className="num" title="Capacidade prevista no estágio atual">{p.stage ? `${dec(cap)} pts/d` : 'sem alocação'}</span>}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3" title={`Energia ${Math.round(p.energy)}%`}>
            <div className="h-full rounded-full" style={{ width: `${p.energy}%`, background: p.energy < 35 ? 'var(--bad)' : p.energy < 60 ? 'var(--warn)' : 'var(--good)' }} />
          </div>
          {risk >= 55 && <span className={cx('num text-[9px] font-bold', risk >= 75 ? 'text-bad' : 'text-warn')} title="Risco de burnout">🔥{risk}%</span>}
        </div>
      </div>
      <select
        value={p.stage ?? ''}
        onChange={(e) => dispatch({ type: 'assignPerson', personId: p.id, stage: (e.target.value || null) as WorkStage | null })}
        className="focus-ring h-7 max-w-[92px] rounded-lg border border-line bg-solid px-1 text-[11px] text-fg"
        title="Estágio"
      >
        <option value="">—</option>
        {WORK_STAGES.map((st) => <option key={st} value={st}>{STAGE_MAP[st].short} · {dec(expectedCapacity(g, p, st))}</option>)}
      </select>
    </div>
  );
}
