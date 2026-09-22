import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { DeliveryCelebration } from '../components/effects/DeliveryCelebration';
import { DailyBriefing } from '../components/events/DailyBriefing';
import { EventQueue } from '../components/events/EventModal';
import { LessonModal } from '../components/events/LessonModal';
import { Board, type ActiveDrag } from '../components/kanban/Board';
import { CardDetail } from '../components/kanban/CardDetail';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { ActionBar } from '../components/layout/ActionBar';
import { FlowStrip } from '../components/layout/FlowStrip';
import { Feed, RightPanel } from '../components/layout/RightPanel';
import { SideNav } from '../components/layout/SideNav';
import { TopBar } from '../components/layout/TopBar';
import { OfficeView } from '../components/office/OfficeView';
import { TalentMarket } from '../components/team/TalentMarket';
import { PersonRow } from '../components/team/TeamRail';
import { TeamView } from '../components/team/TeamView';
import { Tutorial } from '../components/tutorial/Tutorial';
import { AchievementsView, UpgradesView } from '../components/upgrades/UpgradesView';
import { STAGE_MAP } from '../data/board';
import { play } from '../services/sound';
import { useGame } from '../store/gameStore';
import type { StageId, WorkStage } from '../types';

export function GameScreen() {
  const { game: g, view, rightPanel, tryMove, dispatch, toast, animating } = useGame();
  const [active, setActive] = useState<ActiveDrag>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );
  if (!g) return null;

  const onStart = (e: DragStartEvent) => {
    const d = e.active.data.current as { kind: string; cardId?: string; personId?: string } | undefined;
    if (d?.kind === 'card' && d.cardId) setActive({ kind: 'card', cardId: d.cardId });
    if (d?.kind === 'person' && d.personId) setActive({ kind: 'person', personId: d.personId });
    play('click');
  };

  const onEnd = (e: DragEndEvent) => {
    const a = active;
    setActive(null);
    if (!a || !e.over) return;
    const over = e.over.data.current as { kind: string; stage?: StageId; cardId?: string } | undefined;
    if (!over) return;
    if (a.kind === 'card') {
      let to: StageId | undefined;
      let index: number | undefined;
      if (over.kind === 'column') to = over.stage;
      if (over.kind === 'slot' && over.cardId && over.cardId !== a.cardId) {
        to = over.stage;
        index = g.columns[over.stage!].indexOf(over.cardId);
      }
      if (!to) return;
      const card = g.cards[a.cardId];
      if (to === card.stage) {
        if (index !== undefined) dispatch({ type: 'reorderCard', cardId: a.cardId, index });
        return;
      }
      tryMove(a.cardId, to, index);
    } else {
      const person = g.people[a.personId];
      let stage: StageId | null | undefined;
      if (over.kind === 'column') stage = over.stage;
      if (over.kind === 'slot') stage = over.stage;
      if (over.kind === 'bench') stage = null;
      if (stage === undefined) return;
      if (stage !== null && ['backlog', 'ready', 'done'].includes(stage)) {
        toast({ tone: 'warn', title: 'Estágio inválido', body: 'Pessoas trabalham apenas nos estágios de Análise a Deploy.', icon: '⚠️' });
        return;
      }
      if (person.stage === stage) return;
      dispatch({ type: 'assignPerson', personId: a.personId, stage: stage as WorkStage | null });
      play('drop');
      toast({ tone: 'info', title: `${person.name.split(' ')[0]} → ${stage ? STAGE_MAP[stage].name : 'sem alocação'}`, icon: '👤' });
    }
  };

  const overlayCard = active?.kind === 'card' ? g.cards[active.cardId] : null;
  const overlayPerson = active?.kind === 'person' ? g.people[active.personId] : null;

  return (
    <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setActive(null)}>
      <div className="flex h-full flex-col">
        <TopBar g={g} />
        <FlowStrip g={g} />
        <div className="relative flex min-h-0 flex-1">
          <SideNav />
          <main className="relative min-w-0 flex-1 pb-[52px] md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div key={view} className="h-full" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {view === 'board' && <Board g={g} active={active} />}
                {view === 'team' && <TeamView g={g} />}
                {view === 'analytics' && <AnalyticsView g={g} />}
                {view === 'office' && <OfficeView g={g} />}
                {view === 'upgrades' && <UpgradesView g={g} />}
                {view === 'achievements' && <AchievementsView g={g} />}
                {view === 'log' && <div className="h-full p-4 sm:p-6"><h2 className="mb-3 font-display text-3xl font-bold">Registro</h2><div className="glass h-[calc(100%-56px)] rounded-2xl p-3"><Feed g={g} full /></div></div>}
              </motion.div>
            </AnimatePresence>
            {animating && <motion.div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.1, repeat: Infinity }} />}
          </main>
          <AnimatePresence>
            {rightPanel && (
              <motion.div className="hidden lg:block" initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
                <RightPanel g={g} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ActionBar g={g} />
      </div>

      <DragOverlay dropAnimation={{ duration: 180 }}>
        {overlayCard && <div className="w-[240px]"><KanbanCard card={overlayCard} g={g} overlay /></div>}
        {overlayPerson && <div className="w-[300px]"><PersonRow p={overlayPerson} g={g} overlay /></div>}
      </DragOverlay>

      <CardDetail />
      <TalentMarket />
      <DeliveryCelebration />
      <EventQueue />
      <LessonModal g={g} />
      <DailyBriefing g={g} />
      <Tutorial g={g} />
    </DndContext>
  );
}
