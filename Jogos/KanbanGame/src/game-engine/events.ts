import { WORK_STAGES, isWorkStage } from '../data/board';
import { DIFFICULTIES } from '../data/difficulties';
import { ROLES, SKILL_LABEL } from '../data/professionals';
import { EVENTS } from '../events/catalog';
import { cardsIn, openIncidents, teamMorale, wipCount } from '../analytics/metrics';
import type { Card, Effect, EventDef, EventRequirement, GameState, PendingEvent, SkillKey } from '../types';
import { MODE_OF, generateCard, placeCard, proceduralCandidate, scenarioOf } from './generator';
import { Rng } from './rng';
import { moveCardTo, log, pushLesson, removePerson } from './helpers';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface EventContext {
  personId?: string;
  cardId?: string;
  clientId?: string;
}

function inProgressCards(s: GameState): Card[] {
  return WORK_STAGES.flatMap((st) => cardsIn(s, st));
}

function requirementOk(s: GameState, r: EventRequirement): boolean {
  const people = s.peopleOrder.map((id) => s.people[id]).filter(Boolean);
  switch (r) {
    case 'person': return people.some((p) => p.absentDays <= 0);
    case 'cardInProgress': return inProgressCards(s).length > 0;
    case 'cardInDev': return cardsIn(s, 'dev').length > 0;
    case 'cardInTest': return cardsIn(s, 'test').length > 0;
    case 'cardInUat': return cardsIn(s, 'uat').length > 0;
    case 'cardInDeploy': return cardsIn(s, 'deploy').length > 0;
    case 'cardInBacklog': return cardsIn(s, 'backlog').length + cardsIn(s, 'ready').length > 0;
    case 'cardDone': return s.delivered.length > 0;
    case 'hasQA': return people.some((p) => p.role === 'qa' && p.absentDays <= 0);
    case 'hasDevOps': return people.some((p) => p.role === 'devops');
    case 'hasDBA': return people.some((p) => p.role === 'dba' && p.absentDays <= 0);
    case 'hasArchitect': return people.some((p) => p.role === 'architect');
    case 'highTechDebt': return s.techDebt >= 40;
    case 'lowMorale': return teamMorale(s) < 60 || people.some((p) => p.stress > 60);
    case 'highMorale': return teamMorale(s) > 75;
    case 'incidentOpen': return openIncidents(s).length > 0;
    case 'minDay3': return s.day >= 3;
    case 'minDay7': return s.day >= 7;
    case 'integrationCard': return inProgressCards(s).some((c) => c.type === 'integration');
  }
}

function buildContext(s: GameState, rng: Rng, def: EventDef): EventContext | null {
  const ctx: EventContext = {};
  const needsPerson = def.requires?.includes('person') || def.personRoles || /\{person\}/.test(def.description) ||
    [...(def.effects ?? []), ...(def.choices?.flatMap((c) => c.effects) ?? [])].some((e) => e.type.startsWith('person'));
  if (needsPerson) {
    let people = s.peopleOrder.map((id) => s.people[id]).filter((p) => p && p.absentDays <= 0);
    if (def.personRoles) people = people.filter((p) => def.personRoles!.includes(p.role));
    if (def.id === 'burnout-warning' || def.id === 'vacation-request') people.sort((a, b) => b.stress - a.stress || a.energy - b.energy);
    if (!people.length) return null;
    ctx.personId = def.id === 'burnout-warning' || def.id === 'vacation-request' ? people[0].id : rng.pick(people).id;
  }
  const needsCard = /\{card\}|\{code\}/.test(def.description) || def.cardStages || def.cardTypes ||
    [...(def.effects ?? []), ...(def.choices?.flatMap((c) => c.effects) ?? [])].some((e) => ['blockCard', 'rework', 'scope', 'expediteCard', 'cardValue'].includes(e.type));
  if (needsCard) {
    let pool: Card[];
    if (def.cardStages) pool = def.cardStages.flatMap((st) => cardsIn(s, st));
    else pool = inProgressCards(s);
    pool = pool.filter((c) => !c.blocked && c.type !== 'incident');
    if (def.cardTypes) {
      const typed = pool.filter((c) => def.cardTypes!.includes(c.type));
      if (typed.length) pool = typed;
      else if (def.id === 'self-healing') return null;
    }
    if (def.id === 'priority-change') pool = pool.filter((c) => c.serviceClass !== 'expedite');
    if (!pool.length) return null;
    const card = rng.pick(pool);
    ctx.cardId = card.id;
    ctx.clientId = card.clientId;
  }
  if (!ctx.clientId) ctx.clientId = rng.pick(Object.keys(s.clients));
  return ctx;
}

export function fillText(s: GameState, text: string, ctx: EventContext): string {
  const p = ctx.personId ? s.people[ctx.personId] : undefined;
  const c = ctx.cardId ? s.cards[ctx.cardId] : undefined;
  const cl = ctx.clientId ? s.clients[ctx.clientId] : undefined;
  return text
    .replaceAll('{person}', p ? `${p.name} (${ROLES[p.role].short})` : 'Um profissional')
    .replaceAll('{card}', c?.title ?? 'uma demanda')
    .replaceAll('{code}', c?.code ?? 'um card')
    .replaceAll('{client}', cl?.name ?? 'Um cliente');
}

/** Sorteia os eventos do dia. Eventos sem escolha são aplicados imediatamente. */
export function rollEvents(s: GameState, rng: Rng): void {
  if (s.day <= 1) return;
  const diff = DIFFICULTIES.find((d) => d.id === s.difficultyId) ?? DIFFICULTIES[1];
  const mode = MODE_OF(s.mode);
  const sc = scenarioOf(s);
  const lambda = diff.eventRate * mode.eventMult * 0.7 * (s.tutorial && s.day < 4 ? 0.3 : 1);
  const n = Math.min(s.mode === 'chaos' ? 4 : 3, rng.poisson(lambda));
  const recent = new Set(s.recentEventIds.filter((r) => s.day - r.day < 7).map((r) => r.id));
  for (let i = 0; i < n; i++) {
    const eligible = EVENTS.filter((e) => !recent.has(e.id) && (e.requires ?? []).every((r) => requirementOk(s, r)));
    const def = rng.weighted(eligible, (e) => e.weight * (sc.eventCategoryWeights?.[e.category] ?? 1) * (s.mode === 'chaos' && e.severity === 'critical' ? 2.2 : 1));
    if (!def) break;
    const ctx = buildContext(s, rng, def);
    recent.add(def.id);
    if (!ctx) continue;
    s.recentEventIds.push({ id: def.id, day: s.day });
    s.eventSeq++;
    const ev: PendingEvent = {
      instanceId: `ev-${s.eventSeq}`, defId: def.id, day: s.day, title: def.title, description: fillText(s, def.description, ctx),
      icon: def.icon, severity: def.severity, category: def.category, context: ctx, choices: def.choices, lesson: def.lesson,
    };
    if (!def.choices?.length) {
      const outcome: string[] = [];
      applyEffects(s, rng, def.effects ?? [], ctx, outcome);
      ev.autoApplied = true;
      ev.outcome = outcome;
      log(s, def.icon, `${def.title}: ${ev.description}`, def.severity === 'positive' ? 'good' : def.severity === 'critical' ? 'bad' : 'warn');
    }
    if (def.lesson) pushLesson(s, def.lesson);
    s.pendingEvents.push(ev);
  }
  s.recentEventIds = s.recentEventIds.filter((r) => s.day - r.day < 10);
}

export function resolveEvent(s: GameState, rng: Rng, instanceId: string, choiceId?: string): void {
  const ev = s.pendingEvents.find((e) => e.instanceId === instanceId);
  if (!ev) return;
  if (!ev.autoApplied && ev.choices?.length) {
    const choice = ev.choices.find((c) => c.id === choiceId) ?? ev.choices[0];
    const outcome: string[] = [];
    applyEffects(s, rng, choice.effects, ev.context, outcome);
    log(s, ev.icon, `${ev.title} → ${choice.label}${outcome.length ? ` (${outcome.join(' ')})` : ''}`, choice.tone === 'safe' ? 'neutral' : 'warn');
    s.counters.eventsHandled++;
  }
  s.pendingEvents = s.pendingEvents.filter((e) => e.instanceId !== instanceId);
}

/** Interpreta a DSL de efeitos */
export function applyEffects(s: GameState, rng: Rng, effects: Effect[], ctx: EventContext, outcome: string[]): void {
  const person = ctx.personId ? s.people[ctx.personId] : undefined;
  const card = ctx.cardId ? s.cards[ctx.cardId] : undefined;
  const client = ctx.clientId ? s.clients[ctx.clientId] : undefined;
  const everyone = () => s.peopleOrder.map((id) => s.people[id]).filter(Boolean);

  for (const e of effects) {
    switch (e.type) {
      case 'money':
        s.cash += e.amount;
        if (e.amount < 0) s.costsTotal += -e.amount;
        else s.revenueTotal += e.amount;
        break;
      case 'clientSat':
      case 'clientSatTarget':
        s.clientSatisfaction = clamp(s.clientSatisfaction + e.amount, 0, 100);
        if (client) client.satisfaction = clamp(client.satisfaction + e.amount * 1.3, 0, 100);
        break;
      case 'teamMorale': everyone().forEach((p) => (p.morale = clamp(p.morale + e.amount, 0, 100))); break;
      case 'teamEnergy': everyone().forEach((p) => (p.energy = clamp(p.energy + e.amount, 0, 100))); break;
      case 'teamStress': everyone().forEach((p) => (p.stress = clamp(p.stress + e.amount, 0, 100))); break;
      case 'personMorale': if (person) person.morale = clamp(person.morale + e.amount, 0, 100); break;
      case 'personEnergy': if (person) person.energy = clamp(person.energy + e.amount, 0, 100); break;
      case 'personStress': if (person) person.stress = clamp(person.stress + e.amount, 0, 100); break;
      case 'personAbsent':
        if (person) {
          person.absentDays = Math.max(person.absentDays, e.days);
          person.absentReason = e.reason;
        }
        break;
      case 'personSkill':
        if (person) {
          let key: SkillKey;
          if (e.skill === 'auto') {
            const entries = Object.entries(person.skills) as [SkillKey, number][];
            entries.sort((a, b) => b[1] - a[1]);
            key = (entries.find(([, v]) => v < 5) ?? entries[0])[0];
          } else key = e.skill;
          person.skills[key] = clamp(Math.round((person.skills[key] + e.amount) * 2) / 2, 0, 5);
          person.experience = clamp(person.experience + 4, 0, 100);
          outcome.push(`${person.name} evoluiu em ${SKILL_LABEL[key]}.`);
        }
        break;
      case 'personLeaves': {
        const target = person ?? (s.peopleOrder.length ? s.people[rng.pick(s.peopleOrder)] : undefined);
        if (target && s.peopleOrder.length > 2) {
          removePerson(s, target.id);
          outcome.push(`${target.name} deixou a empresa.`);
        }
        break;
      }
      case 'techDebt': s.techDebt = clamp(s.techDebt + e.amount, 0, 100); break;
      case 'capacity':
        s.modifiers.push({ id: `m-${s.eventSeq}-${s.modifiers.length}`, label: e.label, kind: 'capacity', scope: e.scope, stage: e.stage, tech: e.tech, personId: e.scope === 'person' ? ctx.personId : undefined, mult: e.mult, daysLeft: e.days });
        break;
      case 'defectMod': s.modifiers.push({ id: `m-${s.eventSeq}-${s.modifiers.length}`, label: e.label, kind: 'defect', scope: 'all', mult: e.mult, daysLeft: e.days }); break;
      case 'blockMod': s.modifiers.push({ id: `m-${s.eventSeq}-${s.modifiers.length}`, label: e.label, kind: 'block', scope: 'all', mult: e.mult, daysLeft: e.days }); break;
      case 'revenueMod': s.modifiers.push({ id: `m-${s.eventSeq}-${s.modifiers.length}`, label: e.label, kind: 'revenue', scope: 'all', mult: e.mult, daysLeft: e.days }); break;
      case 'arrivalMod': s.modifiers.push({ id: `m-${s.eventSeq}-${s.modifiers.length}`, label: e.label, kind: 'arrival', scope: 'all', mult: e.mult, daysLeft: e.days }); break;
      case 'spawnCard': {
        const stage = e.toStage ?? 'backlog';
        const c = generateCard(s, rng, { type: e.cardType, serviceClass: e.serviceClass, priority: e.priority, complexity: e.complexity, valueMult: e.valueMult, title: e.title, clientId: ctx.clientId, stage });
        if (isWorkStage(stage)) {
          c.readyDay = s.day;
          c.startedDay = s.day;
          const idx = WORK_STAGES.indexOf(stage);
          WORK_STAGES.forEach((w, j) => { if (j < idx) c.work[w].done = c.work[w].total; });
        }
        placeCard(s, c, stage, e.serviceClass === 'expedite');
        outcome.push(`${c.code} criado em ${stage === 'backlog' ? 'Backlog' : stage.toUpperCase()}.`);
        if (e.serviceClass === 'expedite') pushLesson(s, 'expedite');
        break;
      }
      case 'blockCard':
        if (card && isWorkStage(card.stage) && !card.blocked) {
          card.blocked = { reason: e.reason, daysLeft: e.days, since: s.day, kind: 'external' };
          pushLesson(s, 'blocked');
        }
        break;
      case 'rework':
        if (card && isWorkStage(card.stage)) {
          if (['review', 'test', 'uat'].includes(card.stage)) {
            card.work.dev.total += e.amount;
            card.work.review.done = Math.min(card.work.review.done, card.work.review.total * 0.4);
            card.work.test.done = Math.min(card.work.test.done, card.work.test.total * 0.3);
            card.work.uat.done = 0;
            moveCardTo(s, card, 'dev', true);
          } else {
            card.work[card.stage].total += e.amount;
          }
          card.reworkCount++;
          s.counters.reworkTotal++;
          outcome.push(`${card.code} voltou para retrabalho.`);
          pushLesson(s, 'rework');
        }
        break;
      case 'scope':
        if (card) {
          for (const st of WORK_STAGES) {
            const w = card.work[st];
            if (w.done < w.total) w.total = Math.max(w.done + 0.2, w.done + (w.total - w.done) * e.mult);
          }
          card.complexity = Math.max(1, Math.round(card.complexity * e.mult));
        }
        break;
      case 'expediteCard':
        if (card) {
          card.serviceClass = 'expedite';
          card.priority = 'critical';
          card.slaDays = Math.min(card.slaDays, 4);
          const col = s.columns[card.stage];
          s.columns[card.stage] = [card.id, ...col.filter((id) => id !== card.id)];
        }
        break;
      case 'cardValue': if (card) card.value = Math.round((card.value * e.mult) / 500) * 500; break;
      case 'addPerson': {
        s.personSeq++;
        const p = proceduralCandidate(rng, `p-${s.personSeq}`, s.day, e.role, e.seniority);
        s.people[p.id] = p;
        s.peopleOrder.push(p.id);
        s.counters.hires++;
        outcome.push(`${p.name} (${ROLES[p.role].short}) entrou no time — aloque-o em um estágio.`);
        break;
      }
      case 'xp': s.xp += e.amount; break;
      case 'chance': {
        if (rng.chance(e.p)) {
          if (e.thenText) outcome.push(e.thenText);
          applyEffects(s, rng, e.then, ctx, outcome);
        } else {
          if (e.elseText) outcome.push(e.elseText);
          if (e.else) applyEffects(s, rng, e.else, ctx, outcome);
        }
        break;
      }
      case 'wipTemporary': {
        let moved = 0;
        const src = [...s.columns.ready, ...s.columns.backlog];
        for (const id of src) {
          if (moved >= e.delta) break;
          const c = s.cards[id];
          if (!c) continue;
          if (!c.readyDay) c.readyDay = s.day;
          moveCardTo(s, c, e.stage);
          moved++;
        }
        if (moved) {
          outcome.push(`${moved} cards empurrados para ${e.stage.toUpperCase()}.`);
          if (wipCount(s, e.stage) > s.wipLimits[e.stage]) pushLesson(s, 'wip');
        }
        break;
      }
    }
  }
}
