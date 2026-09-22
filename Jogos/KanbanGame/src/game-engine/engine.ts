/* ============================================================
 * FLOW OPS — Game Engine
 * Simulação diária independente da interface. Todas as funções
 * operam sobre um GameState mutável (draft do immer).
 * ============================================================ */
import { ACHIEVEMENTS } from '../data/achievements';
import { BLOCK_REASONS as BLOCK_REASONS_LOCAL, CARD_TYPES, FOCUS_OPTIONS, STAGE_MAP, WORK_STAGES, isWorkStage, nextStage } from '../data/board';
import {
  cardsIn, dependenciesMet, detectBottleneck, isStageComplete, leadTimeAvg, cycleTimeAvg, openIncidents, slaRemaining,
  teamMorale, totalWip, wipCount, wipExceededStages,
} from '../analytics/metrics';
import type { Card, DayResult, DaySnapshot, GameState, Person, StageId, WorkStage } from '../types';
import { burnoutRisk, capacityBreakdown, getDifficulty, isAvailable, upgradeValue, varianceFor } from './capacity';
import { resolveEvent, rollEvents } from './events';
import { generateCard, placeCard, refreshTalentMarket, scenarioOf } from './generator';
import { log, moveCardTo, pushLesson } from './helpers';
import { buildReport } from './report';
import { Rng } from './rng';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------------ */
/* Priorização dentro de um estágio                                     */
/* ------------------------------------------------------------------ */

export function workOrder(s: GameState, stage: StageId): Card[] {
  const cards = cardsIn(s, stage);
  const rank = (c: Card) => {
    if (c.serviceClass === 'expedite') return 0;
    if (c.serviceClass === 'fixed' && c.dueDay && c.dueDay - s.day <= 3) return 1;
    return 2;
  };
  return cards.map((c, i) => ({ c, i })).sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i).map((x) => x.c);
}

function canWork(s: GameState, c: Card, stage: WorkStage): boolean {
  if (c.blocked || c.paused) return false;
  if (stage === 'dev' && !dependenciesMet(s, c)) return false;
  const w = c.work[stage];
  return w.done < w.total - 1e-6;
}

/* ------------------------------------------------------------------ */
/* Capacidade realizada e trabalho                                      */
/* ------------------------------------------------------------------ */

/** Penalidade de fluxo por excesso de WIP no estágio (troca de contexto) */
export function wipPenalty(s: GameState, stage: WorkStage): number {
  const over = wipCount(s, stage) - s.wipLimits[stage];
  let p = over > 0 ? Math.max(0.55, 1 - 0.09 * over) : 1;
  const people = s.peopleOrder.filter((id) => s.people[id]?.stage === stage && s.people[id].absentDays <= 0).length;
  const active = cardsIn(s, stage).filter((c) => !isStageComplete(c)).length;
  // Multitarefa: muitos cards abertos por pessoa = troca de contexto
  const ratio = people > 0 ? active / people : 0;
  if (ratio > 1.5) p *= 1 / (1 + 0.16 * (ratio - 1.5));
  const sysLimit = WORK_STAGES.reduce((a, st) => a + s.wipLimits[st], 0);
  if (totalWip(s) > sysLimit) p *= 0.94;
  return p;
}

interface WorkLedger {
  used: Record<WorkStage, number>;
  available: Record<WorkStage, number>;
  progress: Record<string, number>;
  completedStage: { card: Card; stage: WorkStage }[];
  pointsDone: number;
}

function doWork(s: GameState, rng: Rng, res: DayResult, afterStage?: (stage: WorkStage, done: { card: Card; stage: WorkStage }[]) => void): WorkLedger {
  const ledger: WorkLedger = {
    used: { analysis: 0, dev: 0, review: 0, test: 0, uat: 0, deploy: 0 },
    available: { analysis: 0, dev: 0, review: 0, test: 0, uat: 0, deploy: 0 },
    progress: {}, completedStage: [], pointsDone: 0,
  };
  const penalties = Object.fromEntries(WORK_STAGES.map((st) => [st, wipPenalty(s, st)])) as Record<WorkStage, number>;

  for (const stage of WORK_STAGES) {
    const order = workOrder(s, stage);
    const hasExpedite = order.some((c) => c.serviceClass === 'expedite' && canWork(s, c, stage));
    const people = s.peopleOrder
      .map((id) => s.people[id])
      .filter((p): p is Person => !!p && p.stage === stage && isAvailable(p))
      .sort((a, b) => capacityBreakdown(s, b, stage).expected - capacityBreakdown(s, a, stage).expected);
    const workers: Record<string, number> = {};
    for (const p of people) {
      const luck = clamp(1 + rng.gauss() * varianceFor(s, p), 0.35, 1.8);
      let budget = 1;
      let switches = 0;
      let dayPoints = 0;
      ledger.available[stage] += capacityBreakdown(s, p, stage).expected;
      for (const c of order) {
        if (budget <= 0.04) break;
        if (!canWork(s, c, stage)) continue;
        const maxSwarm = c.serviceClass === 'expedite' || c.complexity >= 8 ? 3 : 2;
        if ((workers[c.id] ?? 0) >= maxSwarm) continue;
        if (switches > 0) budget -= 0.1; // custo de troca de contexto
        if (budget <= 0.04) break;
        let rate = capacityBreakdown(s, p, stage, c).expected * luck * penalties[stage];
        if (hasExpedite && c.serviceClass !== 'expedite') rate *= 0.85;
        if (rate <= 0.01) continue;
        const w = c.work[stage];
        const rem = w.total - w.done;
        const t = Math.min(budget, rem / rate);
        const gained = t * rate;
        w.done = Math.min(w.total, w.done + gained);
        budget -= t;
        switches++;
        dayPoints += gained;
        workers[c.id] = (workers[c.id] ?? 0) + 1;
        ledger.progress[c.id] = (ledger.progress[c.id] ?? 0) + gained;
        if (!c.assignees.includes(p.id)) c.assignees.push(p.id);
        if (!c.contributors.includes(p.id)) c.contributors.push(p.id);
        if (w.done >= w.total - 1e-6) {
          w.done = w.total;
          ledger.completedStage.push({ card: c, stage });
        }
      }
      const util = clamp(1 - budget, 0, 1);
      p.lastUtilization = util;
      p.lastCapacity = r1(dayPoints);
      p.pointsDelivered += dayPoints;
      ledger.used[stage] += dayPoints;
      ledger.pointsDone += dayPoints;
    }
    afterStage?.(stage, ledger.completedStage.filter((x) => x.stage === stage));
  }
  for (const [id, pts] of Object.entries(ledger.progress)) {
    const c = s.cards[id];
    if (!c) continue;
    c.lastProgress = r1(pts);
    c.activeDays++;
    if (pts >= 0.1) res.fx.push({ cardId: id, kind: 'progress', text: `+${r1(pts)}` });
  }
  return ledger;
}

/* ------------------------------------------------------------------ */
/* Qualidade: geração e detecção de defeitos                            */
/* ------------------------------------------------------------------ */

function modMult(s: GameState, kind: 'defect' | 'block' | 'revenue' | 'arrival'): number {
  return s.modifiers.filter((m) => m.kind === kind).reduce((a, m) => a * m.mult, 1);
}

function defectChance(s: GameState, c: Card): number {
  const diff = getDifficulty(s);
  const focus = FOCUS_OPTIONS.find((f) => f.id === s.settings.focus) ?? FOCUS_OPTIONS[0];
  const devs = c.contributors.map((id) => s.people[id]).filter((p): p is Person => !!p);
  const q = devs.length ? devs.reduce((a, p) => a + p.quality, 0) / devs.length : 70;
  const energy = devs.length ? devs.reduce((a, p) => a + p.energy, 0) / devs.length : 80;
  let traitMult = 1;
  if (devs.some((p) => p.traits.includes('perfeccionista'))) traitMult *= 0.75;
  if (devs.some((p) => p.traits.includes('apressado'))) traitMult *= 1.25;
  const over = Math.max(0, wipCount(s, 'dev') - s.wipLimits.dev);
  const devPeople = s.peopleOrder.filter((id) => s.people[id]?.stage === 'dev' && s.people[id].absentDays <= 0).length;
  const devRatio = devPeople ? cardsIn(s, 'dev').length / devPeople : 1;
  let p = (0.1 + c.complexity * 0.017 + c.risk * 0.16) * diff.defectMult * focus.defect;
  p *= 1.55 - q / 100;
  p *= 1 + (s.techDebt / 100) * 0.6;
  p *= 1 + over * 0.1 + Math.max(0, devRatio - 1.5) * 0.15;
  p *= energy < 40 ? 1.25 : 1;
  p *= s.settings.overtime ? 1.15 : 1;
  p *= Math.max(0.2, 1 - upgradeValue(s, 'defectChance'));
  p *= traitMult * modMult(s, 'defect');
  if (c.serviceClass === 'expedite') p *= 1.2;
  return clamp(p, 0.01, 0.85);
}

function detectionChance(s: GameState, c: Card, stage: WorkStage): number {
  const focus = FOCUS_OPTIONS.find((f) => f.id === s.settings.focus) ?? FOCUS_OPTIONS[0];
  const people = c.assignees.map((id) => s.people[id]).filter((p): p is Person => !!p);
  const det = upgradeValue(s, 'detection');
  if (stage === 'review') {
    const skill = people.length ? Math.max(...people.map((p) => Math.max(p.skills.architecture, (p.skills.backend + p.skills.frontend) / 2))) : 2;
    return clamp(0.18 + skill * 0.05 + det * 0.6 + focus.detection * 0.5, 0.05, 0.75);
  }
  if (stage === 'test') {
    const skill = people.length ? Math.max(...people.map((p) => p.skills.testing)) : 2;
    const q = people.length ? Math.max(...people.map((p) => p.quality)) : 70;
    return clamp(0.3 + skill * 0.07 + (q - 70) / 400 + det + focus.detection, 0.1, 0.95);
  }
  if (stage === 'uat') return clamp(0.2 + focus.detection * 0.5, 0.05, 0.5);
  return 0;
}

function handleStageCompletions(s: GameState, rng: Rng, completed: { card: Card; stage: WorkStage }[], res: DayResult): void {
  for (const { card, stage } of completed) {
    if (stage === 'dev') {
      const p = defectChance(s, card);
      let n = 0;
      if (rng.chance(p)) {
        n++;
        if (rng.chance(p * 0.5)) n++;
      }
      card.hiddenDefects += n;
    }
    if ((stage === 'review' || stage === 'test' || stage === 'uat') && card.hiddenDefects > 0) {
      const pd = detectionChance(s, card, stage);
      let found = 0;
      for (let i = 0; i < card.hiddenDefects; i++) if (rng.chance(pd)) found++;
      if (found > 0) {
        card.hiddenDefects -= found;
        card.bugsFound += found;
        s.counters.bugsFound += found;
        s.counters.reworkTotal++;
        card.reworkCount++;
        const rework = r1(found * Math.max(1, card.complexity * 0.35));
        card.work.dev.total = r1(card.work.dev.total + rework);
        card.work.review.done = Math.min(card.work.review.done, r1(card.work.review.total * 0.4));
        if (stage !== 'review') card.work.test.done = Math.min(card.work.test.done, r1(card.work.test.total * 0.3));
        card.work.uat.done = 0;
        moveCardTo(s, card, 'dev', true);
        res.bugsFound += found;
        res.fx.push({ cardId: card.id, kind: 'bug', text: found > 1 ? `${found} BUGS FOUND` : 'BUG FOUND' });
        pushLesson(s, 'rework');
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Bloqueios                                                            */
/* ------------------------------------------------------------------ */

function tickBlocks(s: GameState, res: DayResult): void {
  for (const st of WORK_STAGES) {
    for (const c of cardsIn(s, st)) {
      if (c.blocked) {
        c.blockedDaysTotal++;
        c.blocked.daysLeft--;
      } else if (st === 'dev' && !dependenciesMet(s, c) && c.work.dev.done < c.work.dev.total) {
        c.blockedDaysTotal++;
      }
    }
  }
  void res;
}

function releaseBlocks(s: GameState, res: DayResult): void {
  for (const st of WORK_STAGES) {
    for (const c of cardsIn(s, st)) {
      if (c.blocked && c.blocked.daysLeft <= 0) {
        c.blocked = undefined;
        res.fx.push({ cardId: c.id, kind: 'unblocked', text: 'DESBLOQUEADO' });
      }
    }
  }
}

function rollNewBlocks(s: GameState, rng: Rng, res: DayResult): void {
  const diff = getDifficulty(s);
  const upg = Math.max(0.2, 1 - upgradeValue(s, 'blockChance'));
  const mods = modMult(s, 'block');
  for (const st of WORK_STAGES) {
    const communicative = s.peopleOrder.some((id) => s.people[id]?.stage === st && s.people[id].traits.includes('comunicativo'));
    for (const c of cardsIn(s, st)) {
      if (c.blocked || isStageComplete(c) || c.paused) continue;
      const typeMult = c.type === 'integration' ? 2.2 : c.type === 'security' ? 1.2 : c.type === 'incident' ? 0.5 : 1;
      const p = diff.blockChance * (0.6 + c.risk) * typeMult * upg * mods;
      if (!rng.chance(p)) continue;
      const kind = c.type === 'integration' || rng.chance(0.3) ? 'external' : st === 'uat' || st === 'deploy' || st === 'test' ? 'environment' : 'internal';
      const reasons = BLOCK_REASONS_LOCAL[kind];
      let days = rng.int(1, 3) - Math.floor(upgradeValue(s, 'blockDuration'));
      if (communicative) days--;
      days = Math.max(1, days);
      c.blocked = { reason: rng.pick(reasons), daysLeft: days, since: s.day, kind };
      res.blockedNew++;
      res.fx.push({ cardId: c.id, kind: 'blocked', text: 'BLOCKED' });
      pushLesson(s, 'blocked');
    }
  }
}

/* ------------------------------------------------------------------ */
/* Fluxo: pull automático e entregas                                    */
/* ------------------------------------------------------------------ */

function autoFlow(s: GameState, res: DayResult): void {
  const reversed = [...WORK_STAGES].reverse();
  for (const st of reversed) {
    const next = nextStage(st) as StageId;
    for (const c of workOrder(s, st)) {
      if (!isStageComplete(c) || c.blocked || c.paused) continue;
      if (next === 'done') {
        deliver(s, c, res);
        continue;
      }
      if (!s.settings.autoPull) continue;
      const room = c.serviceClass === 'expedite' || wipCount(s, next as WorkStage) < s.wipLimits[next as WorkStage];
      if (room) {
        moveCardTo(s, c, next);
        res.movedCards++;
      }
    }
  }
  if (s.settings.autoPull) {
    for (const c of workOrder(s, 'ready')) {
      if (c.paused) continue;
      const room = c.serviceClass === 'expedite' || wipCount(s, 'analysis') < s.wipLimits.analysis;
      if (!room) continue;
      moveCardTo(s, c, 'analysis');
      res.movedCards++;
    }
  }
}

export function deliver(s: GameState, c: Card, res: DayResult): void {
  const client = s.clients[c.clientId];
  const leadTime = s.day - (c.readyDay ?? c.createdDay) + 1;
  const cycleTime = s.day - (c.startedDay ?? s.day) + 1;
  let factor = 1;
  if (c.serviceClass === 'expedite') factor = clamp(1 - 0.12 * Math.max(0, leadTime - 2), 0.35, 1);
  else if (c.serviceClass === 'fixed') {
    if (c.dueDay !== undefined && s.day <= c.dueDay) s.counters.fixedOnTime++;
    else {
      factor = 0.4;
      s.counters.fixedLate++;
    }
  } else if (c.serviceClass === 'standard') {
    const late = leadTime - c.slaDays;
    if (late > 0) factor = clamp(1 - (late * 0.06 * 3) / Math.max(1, client?.tolerance ?? 3), 0.45, 1);
  }
  const intangible = c.serviceClass === 'intangible';
  const revenue = intangible ? 0 : Math.round(c.value * factor * (1 + upgradeValue(s, 'revenue')));
  s.cash += revenue;
  s.revenueTotal += revenue;
  s.dailyRecurring += revenue * CARD_TYPES[c.type].recurring;
  res.revenue += revenue;

  if (c.type === 'techdebt') {
    s.techDebt = clamp(s.techDebt - c.complexity * 1.3, 0, 100);
    s.counters.techDebtPaid++;
  } else if (intangible) s.techDebt = clamp(s.techDebt - c.complexity * 0.7, 0, 100);
  if (c.type === 'security' || c.type === 'infra') s.techDebt = clamp(s.techDebt - 0.8, 0, 100);
  if (c.type === 'incident') s.counters.incidentsResolved++;
  if (c.serviceClass === 'expedite') s.counters.expediteDelivered++;

  const onTime = factor >= 0.99;
  const strict = client?.strictness ?? 1;
  let satDelta = onTime ? clamp(1.2 + c.value / 20000 + (c.type === 'bug' || c.type === 'incident' ? 1.5 : 0), 1, 4.5) : -1.2 * strict;
  if (intangible) satDelta = 0.3;
  s.clientSatisfaction = clamp(s.clientSatisfaction + satDelta * 0.6, 0, 100);
  if (client) {
    client.satisfaction = clamp(client.satisfaction + satDelta, 0, 100);
    client.delivered++;
  }

  const xp = Math.round(c.value / 100 + c.complexity * 20);
  s.xp += xp;
  s.valuePoints += Math.round(c.complexity * 80 + revenue / 40);

  const hadDefect = c.hiddenDefects > 0;
  if (hadDefect) {
    const monitor = upgradeValue(s, 'escapedDetection');
    const rng = new Rng(s);
    for (let i = 0; i < c.hiddenDefects; i++) {
      const roll = rng.next();
      let severity: 'minor' | 'major' | 'critical' = roll < 0.22 ? 'critical' : roll < 0.6 ? 'major' : 'minor';
      if (severity !== 'minor' && rng.chance(monitor)) severity = 'minor';
      s.escapes.push({ cardId: c.id, surfacesOnDay: s.day + rng.int(1, 4), severity });
    }
    s.counters.cleanDeliveriesStreak = 0;
  } else {
    s.counters.cleanDeliveriesStreak++;
    s.counters.maxCleanStreak = Math.max(s.counters.maxCleanStreak, s.counters.cleanDeliveriesStreak);
  }

  for (const pid of c.contributors) {
    const p = s.people[pid];
    if (p) p.morale = clamp(p.morale + 1.2, 0, 100);
  }

  c.doneDay = s.day;
  c.deliveredValue = revenue;
  moveCardTo(s, c, 'done', true);
  s.delivered.push({
    cardId: c.id, code: c.code, type: c.type, serviceClass: c.serviceClass, day: s.day, leadTime, cycleTime, value: revenue,
    blockedDays: c.blockedDaysTotal, activeDays: Math.min(c.activeDays, leadTime), hadEscapedDefect: hadDefect,
  });
  res.deliveries.push({ cardId: c.id, code: c.code, title: c.title, type: c.type, value: revenue, clientSatDelta: r1(satDelta), xp, leadTime });
  res.fx.push({ cardId: c.id, kind: 'done', text: 'DONE' });
  log(s, '✅', `${c.code} entregue — ${c.title} (+R$ ${revenue.toLocaleString('pt-BR')}, lead time ${leadTime}d)`, 'good');
  if (s.delivered.length === 1) {
    pushLesson(s, 'leadTime');
  }
  if (s.delivered.length === 5) pushLesson(s, 'flowEfficiency');
}

/* ------------------------------------------------------------------ */
/* Bugs escapados para produção                                         */
/* ------------------------------------------------------------------ */

function surfaceEscapes(s: GameState, rng: Rng, res: DayResult): void {
  const sc = scenarioOf(s);
  const due = s.escapes.filter((e) => e.surfacesOnDay <= s.day);
  s.escapes = s.escapes.filter((e) => e.surfacesOnDay > s.day);
  for (const e of due) {
    const src = s.cards[e.cardId];
    const client = src ? s.clients[src.clientId] : undefined;
    const strict = client?.strictness ?? 1;
    s.counters.bugsEscaped++;
    res.escaped++;
    const title = `${rng.pick(['Regressão em', 'Erro em produção:', 'Defeito reportado em', 'Falha intermitente em'])} ${src?.title.toLowerCase() ?? 'funcionalidade'}`;
    if (e.severity === 'critical') {
      const c = generateCard(s, rng, { type: 'incident', serviceClass: 'expedite', priority: 'critical', clientId: src?.clientId, title: `Incidente: ${src?.title ?? 'falha em produção'}`, complexity: 3 });
      c.parentId = src?.id;
      placeCard(s, c, 'backlog', true);
      const hit = 5 * strict * sc.incidentSeverityMult * (1 - upgradeValue(s, 'incidentImpact'));
      s.clientSatisfaction = clamp(s.clientSatisfaction - hit, 0, 100);
      if (client) client.satisfaction = clamp(client.satisfaction - hit * 1.4, 0, 100);
      log(s, '🚨', `Bug escapou e virou INCIDENTE: ${c.code} (${client?.name ?? ''})`, 'bad');
      pushLesson(s, 'expedite');
    } else {
      const major = e.severity === 'major';
      const c = generateCard(s, rng, { type: 'bug', serviceClass: 'standard', priority: major ? 'high' : 'medium', clientId: src?.clientId, title, complexity: major ? 3 : 2 });
      c.parentId = src?.id;
      placeCard(s, c, 'backlog', major);
      const hit = (major ? 2.5 : 1) * strict;
      s.clientSatisfaction = clamp(s.clientSatisfaction - hit, 0, 100);
      if (client) client.satisfaction = clamp(client.satisfaction - hit * 1.3, 0, 100);
      log(s, '🐞', `Bug em produção reportado: ${c.code} — ${c.title}`, 'bad');
    }
    s.techDebt = clamp(s.techDebt + 0.8, 0, 100);
  }
}

/* ------------------------------------------------------------------ */
/* Chegada de novas demandas                                            */
/* ------------------------------------------------------------------ */

function arrivals(s: GameState, rng: Rng): number {
  const sc = scenarioOf(s);
  const diff = getDifficulty(s);
  let lambda = sc.arrivalRate * diff.arrivalMult * modMult(s, 'arrival');
  const surge = sc.surges?.find((x) => s.day + 1 >= x.fromDay && s.day + 1 <= x.toDay);
  if (surge) lambda *= surge.arrivalMult;
  if (s.columns.backlog.length > 35) lambda *= 0.3;
  const n = rng.poisson(lambda);
  for (let i = 0; i < n; i++) {
    const c = generateCard(s, rng);
    c.createdDay = s.day + 1;
    c.stageEnteredDay = s.day + 1;
    c.history = [{ day: s.day + 1, stage: 'backlog' }];
    if (c.dueDay) c.dueDay += 1;
    placeCard(s, c, 'backlog', c.serviceClass === 'expedite');
  }
  return n;
}

/* ------------------------------------------------------------------ */
/* SLA, incidentes, finanças e pessoas                                  */
/* ------------------------------------------------------------------ */

function checkSla(s: GameState, res: DayResult): void {
  for (const c of Object.values(s.cards)) {
    if (c.stage === 'done' || c.slaBreached) continue;
    const rem = slaRemaining(s, c);
    if (rem === null || rem >= 0) continue;
    c.slaBreached = true;
    s.counters.slaBreaches++;
    const client = s.clients[c.clientId];
    const strict = client?.strictness ?? 1;
    s.clientSatisfaction = clamp(s.clientSatisfaction - 1.1 * strict, 0, 100);
    if (client) {
      client.satisfaction = clamp(client.satisfaction - 3 * strict, 0, 100);
      client.breaches++;
    }
    if (c.serviceClass === 'fixed') {
      const fine = Math.round((c.value * 0.12) / 100) * 100;
      s.cash -= fine;
      s.costsTotal += fine;
      res.costs += fine;
      log(s, '⏰', `Prazo fixo perdido: ${c.code}. Multa contratual de R$ ${fine.toLocaleString('pt-BR')}.`, 'bad');
    } else {
      log(s, '⏰', `SLA violado: ${c.code} — ${c.title}`, 'bad');
    }
    res.fx.push({ cardId: c.id, kind: 'sla', text: 'SLA!' });
  }
}

function updatePeople(s: GameState, rng: Rng): void {
  const focus = FOCUS_OPTIONS.find((f) => f.id === s.settings.focus) ?? FOCUS_OPTIONS[0];
  const exceeded = new Set(wipExceededStages(s));
  const incidents = openIncidents(s).length;
  const moraleBonus = upgradeValue(s, 'morale');
  const recovery = upgradeValue(s, 'energyRecovery');
  for (const id of [...s.peopleOrder]) {
    const p = s.people[id];
    if (!p) continue;
    if (p.absentDays > 0) {
      p.energy = clamp(p.energy + 15, 0, 100);
      p.stress = clamp(p.stress - 8, 0, 100);
      p.absentDays--;
      if (p.absentDays <= 0) {
        log(s, '👋', `${p.name} está de volta ao time.`, 'neutral');
        p.absentReason = undefined;
      }
      p.lastUtilization = 0;
      continue;
    }
    const util = p.stage ? p.lastUtilization : 0;
    if (!p.stage) p.lastUtilization = 0;
    let dEnergy = 8 - 10 * util + recovery;
    if (s.settings.overtime) dEnergy -= p.traits.includes('noturno') ? 5 : 9;
    p.energy = clamp(p.energy + dEnergy, 5, 100);
    let dStress = util > 0.9 ? 1.5 : util < 0.4 ? -3 : -1;
    if (s.settings.overtime) dStress += 5;
    if (p.stage && exceeded.has(p.stage)) dStress += 3;
    dStress += incidents * 1.2;
    if (p.traits.includes('resiliente')) dStress *= dStress > 0 ? 0.6 : 1;
    p.stress = clamp(p.stress + dStress, 0, 100);
    const mentorBoost = s.peopleOrder.some((o) => o !== id && s.people[o]?.stage === p.stage && s.people[o]?.traits.includes('mentor')) ? 3 : 0;
    const target = 78 - p.stress * 0.35 + (p.energy - 60) * 0.12 + mentorBoost + moraleBonus * 6 + focus.morale * 3;
    p.morale = clamp(p.morale + (target - p.morale) * 0.15 + moraleBonus, 0, 100);
    if (util > 0.95) p.daysOverloaded++;
    // Experiência cresce com o trabalho
    if (util > 0.3) p.experience = clamp(p.experience + 0.25, 0, 100);
    const risk = burnoutRisk(p);
    if (risk > 75 && rng.chance((risk - 72) / 120)) {
      p.absentDays = rng.int(2, 4);
      p.absentReason = 'Burnout';
      p.stress = 40;
      s.counters.burnouts++;
      log(s, '🥵', `${p.name} entrou em burnout e ficará ${p.absentDays} dias afastado(a).`, 'bad');
      s.peopleOrder.forEach((o) => { if (s.people[o]) s.people[o].morale = clamp(s.people[o].morale - 3, 0, 100); });
      pushLesson(s, 'burnout');
    }
  }
}

function finances(s: GameState, res: DayResult): void {
  const sc = scenarioOf(s);
  const payroll = s.peopleOrder.reduce((a, id) => a + (s.people[id]?.salary ?? 0), 0) / 22;
  const overtime = s.settings.overtime ? payroll * 0.5 : 0;
  const infra = sc.infraCostPerDay * (1 - Math.min(0.5, upgradeValue(s, 'infraCost')));
  const incidents = openIncidents(s);
  const incidentCost = incidents.length * 900 * sc.incidentSeverityMult * (1 - upgradeValue(s, 'incidentImpact'));
  const revMult = modMult(s, 'revenue') * (1 - Math.min(0.5, incidents.length * 0.07));
  const recurring = s.dailyRecurring * revMult;
  const costs = payroll + overtime + infra + incidentCost;
  s.cash += recurring - costs;
  s.revenueTotal += recurring;
  s.costsTotal += costs;
  res.revenue += recurring;
  res.costs += costs;
  for (const inc of incidents) {
    const client = s.clients[inc.clientId];
    const hit = 1.1 * (client?.strictness ?? 1) * sc.incidentSeverityMult * (1 - upgradeValue(s, 'incidentImpact'));
    s.clientSatisfaction = clamp(s.clientSatisfaction - hit, 0, 100);
    if (client) client.satisfaction = clamp(client.satisfaction - hit * 1.3, 0, 100);
  }
}

/* ------------------------------------------------------------------ */
/* Snapshot e métricas do dia                                           */
/* ------------------------------------------------------------------ */

function snapshot(s: GameState, ledger: WorkLedger, res: DayResult, arrived: number, startedBefore: number): DaySnapshot {
  const cfd = {} as Record<StageId, number>;
  for (const st of Object.keys(s.columns) as StageId[]) cfd[st] = s.columns[st].length;
  const { stage: bottleneck, stats } = detectBottleneck(s);
  const utilization = {} as Record<WorkStage, number>;
  const stageLoad = {} as Record<WorkStage, number>;
  const queue = {} as Record<WorkStage, number>;
  for (const st of WORK_STAGES) {
    utilization[st] = ledger.available[st] > 0 ? clamp(ledger.used[st] / ledger.available[st], 0, 1) : 0;
    stageLoad[st] = r1(Math.min(stats[st].loadDays, 20));
    queue[st] = stats[st].queueBefore;
  }
  return {
    day: s.day, cfd, wip: totalWip(s), wipLimitTotal: WORK_STAGES.reduce((a, st) => a + s.wipLimits[st], 0), throughput: res.deliveries.length,
    arrivals: arrived, started: s.counters.cardsStarted - startedBefore, leadTimeAvg: leadTimeAvg(s), cycleTimeAvg: cycleTimeAvg(s),
    revenueDay: Math.round(res.revenue), costsDay: Math.round(res.costs), revenueTotal: Math.round(s.revenueTotal), costsTotal: Math.round(s.costsTotal),
    cash: Math.round(s.cash), clientSat: r1(s.clientSatisfaction), teamMorale: r1(teamMorale(s)), techDebt: r1(s.techDebt),
    bugsFound: res.bugsFound, escapedBugs: res.escaped, rework: s.counters.reworkTotal,
    blocked: WORK_STAGES.reduce((a, st) => a + cardsIn(s, st).filter((c) => c.blocked).length, 0), incidentsOpen: openIncidents(s).length,
    utilization, stageLoad, queue, bottleneck, wipExceeded: wipExceededStages(s), valueDelivered: s.valuePoints, pointsDone: r1(ledger.pointsDone),
  };
}

function checkAchievements(s: GameState): void {
  for (const a of ACHIEVEMENTS) {
    if (s.achievements.includes(a.id)) continue;
    try {
      if (a.check(s)) {
        s.achievements.push(a.id);
        s.newAchievements.push(a.id);
        log(s, '🏆', `Conquista desbloqueada: ${a.name}`, 'good');
      }
    } catch {
      /* conquistas nunca devem quebrar a simulação */
    }
  }
}

/* ------------------------------------------------------------------ */
/* PROCESSAMENTO DO DIA                                                 */
/* ------------------------------------------------------------------ */

export function processDay(s: GameState): DayResult {
  const rng = new Rng(s);
  const res: DayResult = { day: s.day, fx: [], deliveries: [], revenue: 0, costs: 0, bugsFound: 0, blockedNew: 0, escaped: 0, movedCards: 0, headline: [] };
  const startedBefore = s.counters.cardsStarted;
  // eventos informativos do dia já foram vistos; escolhas não respondidas usam a primeira opção
  for (const ev of [...s.pendingEvents]) resolveEvent(s, rng, ev.instanceId, ev.choices?.[0]?.id);
  s.pendingEvents = [];
  for (const c of Object.values(s.cards)) c.lastProgress = undefined;

  const sc = scenarioOf(s);
  const surge = sc.surges?.find((x) => x.fromDay === s.day);
  if (surge) {
    s.modifiers.push({ id: `surge-${s.day}`, label: surge.label, kind: 'revenue', scope: 'all', mult: 1.6, daysLeft: surge.toDay - surge.fromDay + 1 });
    s.modifiers.push({ id: `surge-b-${s.day}`, label: surge.label, kind: 'block', scope: 'all', mult: 1.3, daysLeft: surge.toDay - surge.fromDay + 1 });
    log(s, '🛒', `${surge.label} começou! Demanda e receita recorrente em alta.`, 'warn');
  }

  if (wipExceededStages(s).length) pushLesson(s, 'wip');

  // 1. Bloqueios em andamento consomem o dia
  tickBlocks(s, res);
  // 2. Trabalho do time
  // 3. Qualidade (defeitos gerados/encontrados) e fluxo contínuo dentro do dia:
  //    um card que termina um estágio pode ser puxado e trabalhado pelo estágio seguinte no mesmo dia.
  const ledger = doWork(s, rng, res, (stage, completed) => {
    handleStageCompletions(s, rng, completed, res);
    if (!s.settings.autoPull || stage === 'deploy') return;
    const next = nextStage(stage) as WorkStage;
    for (const { card } of completed) {
      if (card.stage !== stage || card.blocked || card.paused) continue;
      const room = card.serviceClass === 'expedite' || wipCount(s, next) < s.wipLimits[next];
      if (room) {
        moveCardTo(s, card, next);
        res.movedCards++;
      }
    }
  });
  // 4. Bloqueios vencidos são liberados, novos podem surgir
  releaseBlocks(s, res);
  rollNewBlocks(s, rng, res);
  // 5. Fluxo puxado e entregas
  autoFlow(s, res);
  // 6. Bugs escapados aparecem em produção
  surfaceEscapes(s, rng, res);
  // 7. SLA
  checkSla(s, res);
  // 8. Finanças
  finances(s, res);
  // 9. Pessoas
  updatePeople(s, rng);
  if (s.settings.overtime) s.counters.overtimeDays++;
  // 10. Dívida técnica
  const focus = s.settings.focus;
  const sysLimit = WORK_STAGES.reduce((a, st) => a + s.wipLimits[st], 0);
  const overload = Math.max(0, totalWip(s) - sysLimit) / Math.max(1, sysLimit);
  s.techDebt = clamp(s.techDebt + sc.techDebtDrift + overload * 1.5 + (focus === 'speed' ? 0.4 : 0) + (s.settings.overtime ? 0.2 : 0) - upgradeValue(s, 'techDebtDecay'), 0, 100);
  // 11. Satisfação do cliente sem entregas recentes
  const recentDeliveries = s.delivered.filter((d) => s.day - d.day < 3).length;
  if (recentDeliveries === 0 && s.day > 3) s.clientSatisfaction = clamp(s.clientSatisfaction - 0.5, 0, 100);
  // 12. Chegadas
  const arrived = arrivals(s, rng);

  // 13. Snapshot
  const snap = snapshot(s, ledger, res, arrived, startedBefore);
  s.history.push(snap);
  if (snap.bottleneck) pushLesson(s, 'bottleneck');
  if (s.day === 3) pushLesson(s, 'throughput');
  if (s.history.length >= 6 && s.delivered.length >= 3) pushLesson(s, 'littlesLaw');
  const idle = s.peopleOrder.filter((id) => s.people[id]?.absentDays <= 0 && (s.people[id]?.lastUtilization ?? 0) < 0.25).length;
  if (idle > 0 && s.day >= 2) pushLesson(s, 'pull');
  if (s.techDebt > 55) pushLesson(s, 'techDebt');

  // 14. Contadores
  if (snap.wipExceeded.length === 0) {
    s.counters.daysWipRespected++;
    s.counters.consecutiveWipOk++;
  } else s.counters.consecutiveWipOk = 0;
  if (snap.teamMorale >= 90) s.counters.daysHappyTeam++;
  if (snap.incidentsOpen === 0) s.counters.daysNoIncident++;
  else s.counters.daysNoIncident = 0;
  s.counters.idleDays += idle;
  s.counters.maxDeliveriesInDay = Math.max(s.counters.maxDeliveriesInDay, res.deliveries.length);

  // 15. Modificadores expiram
  s.modifiers = s.modifiers.map((m) => ({ ...m, daysLeft: m.daysLeft - 1 })).filter((m) => m.daysLeft > 0);

  // Manchetes
  if (res.deliveries.length) res.headline.push(`${res.deliveries.length} entrega(s)`);
  if (res.bugsFound) res.headline.push(`${res.bugsFound} bug(s) encontrados`);
  if (res.blockedNew) res.headline.push(`${res.blockedNew} novo(s) bloqueio(s)`);
  if (res.escaped) res.headline.push(`${res.escaped} bug(s) em produção`);
  if (arrived) res.headline.push(`${arrived} nova(s) demanda(s)`);

  checkAchievements(s);
  s.lastResult = res;

  // 16. Avança o dia
  const bankrupt = s.cash < -Math.abs(sc.startingCash) * 0.6;
  if (bankrupt) log(s, '💀', 'O caixa ficou insustentável. A diretoria encerrou o projeto.', 'bad');
  if (s.day >= s.totalDays || bankrupt) {
    s.phase = 'ended';
    checkAchievements(s);
    s.report = buildReport(s, bankrupt);
    return res;
  }
  s.day++;
  if (s.day % 5 === 0) refreshTalentMarket(s, rng);
  rollEvents(s, rng);
  return res;
}

export { isWorkStage, STAGE_MAP };
