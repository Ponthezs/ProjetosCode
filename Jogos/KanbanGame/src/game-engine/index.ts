/* ============================================================
 * GameEngine — fachada pública do motor de simulação.
 * A interface React só conversa com o motor através destas
 * funções (e de applyAction), o que permite rodar a simulação
 * em um servidor, em testes ou em modo multiplayer no futuro.
 * ============================================================ */
import { cycleTimeAvg, detectBottleneck as detect, leadTimeAvg } from '../analytics/metrics';
import type { Card, GameState, Person, WorkStage } from '../types';
import { applyAction, applyActions, canMoveCard } from './actions';
import { generateInsights } from './advisor';
import { capacityBreakdown } from './capacity';
import { deliver, processDay as processDayMut } from './engine';
import { rollEvents } from './events';
import { createGame, generateCard } from './generator';
import { buildReport } from './report';
import { Rng } from './rng';

export const GameEngine = {
  createGame,
  applyAction,
  applyActions,
  canMoveCard,
  /** Capacidade prevista de uma pessoa em um estágio (com faixa min–max) */
  calculateCapacity: (s: GameState, p: Person, stage: WorkStage, card?: Card) => capacityBreakdown(s, p, stage, card),
  /** Avança um dia (imutável) */
  processDay: (s: GameState) => applyAction(s, { type: 'processDay' }),
  /** Processa a entrega de um card concluído (usa estado mutável) */
  processCard: deliver,
  generateEvent: (s: GameState) => rollEvents(s, new Rng(s)),
  generateIncident: (s: GameState) => generateCard(s, new Rng(s), { type: 'incident', serviceClass: 'expedite', priority: 'critical' }),
  calculateRevenue: (s: GameState) => ({ revenue: s.revenueTotal, costs: s.costsTotal, profit: s.revenueTotal - s.costsTotal, roi: s.costsTotal ? (s.revenueTotal - s.costsTotal) / s.costsTotal : 0 }),
  calculateCycleTime: (s: GameState) => cycleTimeAvg(s),
  calculateLeadTime: (s: GameState) => leadTimeAvg(s),
  detectBottleneck: (s: GameState) => detect(s),
  updateTeamMorale: (s: GameState) => s.peopleOrder.reduce((a, id) => a + (s.people[id]?.morale ?? 0), 0) / Math.max(1, s.peopleOrder.length),
  insights: generateInsights,
  buildReport,
  processDayMutable: processDayMut,
};

export { applyAction, canMoveCard, createGame, generateInsights };
