import { STAGE_ORDER } from '../../data/board';
import { canMoveCard } from '../../game-engine/actions';
import { useMetrics } from '../../hooks/useMetrics';
import type { GameState, WorkStage } from '../../types';
import { Column } from './Column';

export type ActiveDrag = { kind: 'card'; cardId: string } | { kind: 'person'; personId: string } | null;

export function Board({ g, active }: { g: GameState; active: ActiveDrag }) {
  const m = useMetrics(g);
  return (
    <div className="scroll-thin h-full overflow-x-auto overflow-y-hidden" data-tour="board">
      <div className="flex h-full w-max gap-3 p-3 sm:p-4">
        {STAGE_ORDER.map((st) => {
          let dropState: 'none' | 'ok' | 'bad' | 'person' = 'none';
          if (active?.kind === 'card') dropState = canMoveCard(g, active.cardId, st).ok ? 'ok' : 'bad';
          if (active?.kind === 'person') dropState = ['backlog', 'ready', 'done'].includes(st) ? 'bad' : 'person';
          const stat = (m.stats as Record<string, (typeof m.stats)[WorkStage]>)[st];
          return <Column key={st} g={g} stage={st} stat={stat} isBottleneck={m.bottleneck === st} dropState={dropState} />;
        })}
      </div>
    </div>
  );
}
