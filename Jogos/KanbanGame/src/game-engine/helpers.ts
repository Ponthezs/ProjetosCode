import type { Card, GameState, LogEntry, StageId } from '../types';

/** Move um card para outro estágio, registrando histórico e marcos de tempo */
export function moveCardTo(s: GameState, card: Card, to: StageId, top = false, index?: number): void {
  const from = card.stage;
  s.columns[from] = s.columns[from].filter((id) => id !== card.id);
  const col = s.columns[to];
  if (top) col.unshift(card.id);
  else if (index !== undefined && index >= 0 && index <= col.length) col.splice(index, 0, card.id);
  else col.push(card.id);
  if (from === to) return;
  card.stage = to;
  card.stageEnteredDay = s.day;
  card.assignees = [];
  card.history.push({ day: s.day, stage: to });
  if (to === 'ready' && !card.readyDay) card.readyDay = s.day;
  if (!['backlog', 'ready', 'done'].includes(to) && !card.startedDay) {
    card.startedDay = s.day;
    if (!card.readyDay) card.readyDay = s.day;
    s.counters.cardsStarted++;
  }
  if (to === 'backlog') {
    card.readyDay = undefined;
  }
}

export function log(s: GameState, icon: string, text: string, tone: LogEntry['tone'] = 'neutral'): void {
  s.log.push({ day: s.day, icon, text, tone });
  if (s.log.length > 250) s.log.splice(0, s.log.length - 250);
}

export function pushLesson(s: GameState, id: string): void {
  if (s.lessons.includes(id) || s.pendingLessons.includes(id)) return;
  s.pendingLessons.push(id);
}

export function removePerson(s: GameState, personId: string): void {
  delete s.people[personId];
  s.peopleOrder = s.peopleOrder.filter((id) => id !== personId);
  for (const c of Object.values(s.cards)) c.assignees = c.assignees.filter((a) => a !== personId);
}
