import { WORK_STAGES, isWorkStage } from '../data/board';
import { stageCapacity } from '../game-engine/capacity';
import type { Card, GameState, LimitedStage, StageId, WorkStage } from '../types';

export const avg = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function isStageComplete(c: Card): boolean {
  if (!isWorkStage(c.stage)) return true;
  const w = c.work[c.stage];
  return w.done >= w.total - 1e-6;
}

export function dependenciesMet(s: GameState, c: Card): boolean {
  return c.dependsOn.every((id) => {
    const d = s.cards[id];
    return !d || d.stage === 'done' || d.stage === 'deploy' || d.stage === 'uat';
  });
}

export function cardsIn(s: GameState, stage: StageId): Card[] {
  return (s.columns[stage] ?? []).map((id) => s.cards[id]).filter(Boolean);
}

/** WIP de um estágio — Expedite não conta para o limite */
export function wipCount(s: GameState, stage: LimitedStage): number {
  return cardsIn(s, stage).filter((c) => c.serviceClass !== 'expedite').length;
}

export function totalWip(s: GameState): number {
  return WORK_STAGES.reduce((a, st) => a + cardsIn(s, st).length, 0);
}

export function wipExceededStages(s: GameState): WorkStage[] {
  return WORK_STAGES.filter((st) => wipCount(s, st) > s.wipLimits[st]);
}

export function blockedCards(s: GameState): Card[] {
  return WORK_STAGES.flatMap((st) => cardsIn(s, st)).filter((c) => c.blocked || (c.stage === 'dev' && !dependenciesMet(s, c)));
}

export function openIncidents(s: GameState): Card[] {
  return Object.values(s.cards).filter((c) => c.type === 'incident' && c.stage !== 'done');
}

export function cardAge(s: GameState, c: Card): number {
  return (c.doneDay ?? s.day) - c.createdDay + (c.doneDay ? 1 : 0);
}

/**
 * SLA restante em dias. O relógio do SLA começa no ponto de comprometimento
 * (entrada em Ready). Incidentes e Expedite contam desde a criação.
 * Fixed Date usa a data absoluta.
 */
export function slaRemaining(s: GameState, c: Card): number | null {
  if (c.serviceClass === 'intangible' || c.stage === 'done') return null;
  if (c.serviceClass === 'fixed' && c.dueDay) return c.dueDay - s.day;
  const urgent = c.serviceClass === 'expedite' || c.type === 'incident';
  if (c.stage === 'backlog' && !urgent) return null;
  const start = urgent ? c.createdDay : c.readyDay ?? c.createdDay;
  return start + c.slaDays - s.day;
}

export function slaAtRisk(s: GameState): Card[] {
  return Object.values(s.cards).filter((c) => {
    if (c.stage === 'done' || c.stage === 'backlog') return false;
    const r = slaRemaining(s, c);
    return r !== null && r <= 2;
  });
}

export function leadTimeAvg(s: GameState, lastN?: number): number | null {
  const d = lastN ? s.delivered.slice(-lastN) : s.delivered;
  return avg(d.map((x) => x.leadTime));
}

export function cycleTimeAvg(s: GameState, lastN?: number): number | null {
  const d = lastN ? s.delivered.slice(-lastN) : s.delivered;
  return avg(d.map((x) => x.cycleTime));
}

export function throughputAvg(s: GameState, window = 5): number {
  const h = s.history.slice(-window);
  if (!h.length) return 0;
  return h.reduce((a, x) => a + x.throughput, 0) / h.length;
}

export function velocityAvg(s: GameState, window = 5): number {
  const h = s.history.slice(-window);
  if (!h.length) return 0;
  return h.reduce((a, x) => a + x.pointsDone, 0) / h.length;
}

export function flowEfficiency(s: GameState): number | null {
  if (!s.delivered.length) return null;
  const active = s.delivered.reduce((a, d) => a + d.activeDays, 0);
  const lead = s.delivered.reduce((a, d) => a + d.leadTime, 0);
  return lead ? Math.min(1, active / lead) : null;
}

export interface StageStat {
  stage: WorkStage;
  count: number;
  limit: number;
  wip: number;
  active: number;
  finished: number;
  blocked: number;
  remaining: number;
  capacity: number;
  loadDays: number;
  utilization: number;
  heat: 'green' | 'yellow' | 'red' | 'idle';
  exceeded: boolean;
  queueBefore: number;
  people: number;
}

/** Estatísticas de cada estágio — base do heatmap de gargalos */
export function stageStats(s: GameState): Record<WorkStage, StageStat> {
  const out = {} as Record<WorkStage, StageStat>;
  const last = s.history[s.history.length - 1];
  WORK_STAGES.forEach((st, i) => {
    const cards = cardsIn(s, st);
    const finished = cards.filter(isStageComplete).length;
    const blocked = cards.filter((c) => c.blocked).length;
    const remaining = cards.reduce((a, c) => a + Math.max(0, c.work[st].total - c.work[st].done), 0);
    const capacity = stageCapacity(s, st);
    const prev = i === 0 ? 'ready' : WORK_STAGES[i - 1];
    const queueBefore = i === 0 ? cardsIn(s, 'ready').length : cardsIn(s, prev).filter(isStageComplete).length;
    const loadDays = capacity > 0 ? remaining / capacity : remaining > 0 ? 99 : 0;
    const people = s.peopleOrder.filter((id) => s.people[id]?.stage === st && s.people[id].absentDays <= 0).length;
    const pressure = loadDays + queueBefore * 0.6;
    const heat: StageStat['heat'] = remaining === 0 && queueBefore === 0 ? 'idle' : pressure >= 4 ? 'red' : pressure >= 2 ? 'yellow' : 'green';
    const wip = cards.filter((c) => c.serviceClass !== 'expedite').length;
    out[st] = {
      stage: st, count: cards.length, limit: s.wipLimits[st], wip, active: cards.length - finished, finished, blocked, remaining,
      capacity, loadDays, utilization: last?.utilization[st] ?? 0, heat, exceeded: wip > s.wipLimits[st], queueBefore, people,
    };
  });
  return out;
}

/**
 * Detecção de gargalo: estágio com maior pressão (dias de trabalho acumulado
 * + fila de cards terminados aguardando para entrar).
 */
export function detectBottleneck(s: GameState): { stage: WorkStage | null; score: number; stats: Record<WorkStage, StageStat> } {
  const stats = stageStats(s);
  let best: WorkStage | null = null;
  let score = 0;
  for (const st of WORK_STAGES) {
    const x = stats[st];
    const sc = Math.min(x.loadDays, 12) + x.queueBefore * 0.8 + (x.people === 0 && x.count > 0 ? 3 : 0);
    if (sc > score) {
      score = sc;
      best = st;
    }
  }
  return { stage: score >= 2.5 ? best : null, score, stats };
}

export function teamMorale(s: GameState): number {
  const ps = s.peopleOrder.map((id) => s.people[id]).filter(Boolean);
  return ps.length ? ps.reduce((a, p) => a + p.morale, 0) / ps.length : 0;
}

export function dailyPayroll(s: GameState): number {
  return s.peopleOrder.reduce((a, id) => a + (s.people[id]?.salary ?? 0), 0) / 22;
}

export function cycleTimeHistogram(s: GameState): { bucket: string; count: number; days: number }[] {
  const map = new Map<number, number>();
  for (const d of s.delivered) map.set(d.cycleTime, (map.get(d.cycleTime) ?? 0) + 1);
  const max = Math.max(0, ...map.keys());
  const out: { bucket: string; count: number; days: number }[] = [];
  for (let i = 1; i <= Math.max(max, 5); i++) out.push({ bucket: `${i}d`, count: map.get(i) ?? 0, days: i });
  return out;
}

/** Percentil do cycle time (usado para previsões do Flow AI) */
export function percentile(xs: number[], p: number): number | null {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}
