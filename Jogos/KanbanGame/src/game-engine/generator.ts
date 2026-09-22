import { CARD_TYPES, WORK_STAGES } from '../data/board';
import { CLIENTS } from '../data/clients';
import { DIFFICULTIES, GAME_MODES } from '../data/difficulties';
import { BASE_SALARY, FIRST_NAMES, LAST_NAMES, PERSONALITY_TRAITS, PROFESSIONALS, ROLES, ROLE_SKILL_PROFILE } from '../data/professionals';
import { INCIDENT_TITLES, TASK_TEMPLATES } from '../data/tasks';
import { SCENARIO_MAP, SCENARIOS } from '../scenarios';
import type {
  Card, CardType, ClientState, GameModeId, GameState, Person, Priority, ProfessionalTemplate, RoleId, ScenarioDef,
  Seniority, ServiceClass, SkillKey, StageId, WorkStage,
} from '../types';
import { Rng, hashSeed } from './rng';

export const SAVE_VERSION = 3;

const FIB = [1, 2, 3, 5, 8, 13, 21];
/** Escala global de esforço por ponto de complexidade */
export const EFFORT_SCALE = 0.75;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const snapFib = (v: number) => FIB.reduce((best, f) => (Math.abs(f - v) < Math.abs(best - v) ? f : best), 1);

const EMPTY_SKILLS: Record<SkillKey, number> = { analysis: 0, frontend: 0, backend: 0, testing: 0, devops: 0, ux: 0, architecture: 0, data: 0 };

export function scenarioOf(s: Pick<GameState, 'scenarioId'>): ScenarioDef {
  return SCENARIO_MAP[s.scenarioId] ?? SCENARIOS[0];
}

/* ------------------------------------------------------------------ */
/* Pessoas                                                              */
/* ------------------------------------------------------------------ */

export function personFromTemplate(t: ProfessionalTemplate, rng: Rng, id: string, day: number): Person {
  const jitter = (v: number, amt: number) => Math.round(clamp(v + rng.range(-amt, amt), 15, 99));
  const skills = { ...EMPTY_SKILLS };
  for (const [k, v] of Object.entries(t.skills)) skills[k as SkillKey] = v ?? 0;
  return {
    id, templateId: t.id, name: t.name, role: t.role, seniority: t.seniority, skills,
    speed: jitter(t.speed, 6), quality: jitter(t.quality, 5), experience: jitter(t.experience, 5),
    energy: Math.round(rng.range(82, 100)), morale: Math.round(rng.range(66, 86)), stress: Math.round(rng.range(8, 24)),
    salary: Math.round((t.salary * rng.range(0.94, 1.08)) / 100) * 100,
    stage: null, absentDays: 0, hue: Math.floor(rng.range(0, 360)), hiredDay: day, pointsDelivered: 0, daysOverloaded: 0,
    lastUtilization: 0, lastCapacity: 0, traits: [...(t.traits ?? [])], trainingsDone: 0,
  };
}

const SEN_BY_ROLL: Seniority[] = ['junior', 'pleno', 'pleno', 'senior', 'senior', 'especialista'];

/** Candidato procedural para o mercado de talentos */
export function proceduralCandidate(rng: Rng, id: string, day: number, role?: RoleId, seniority?: Seniority): Person {
  const r = role ?? rng.pick(Object.keys(ROLES) as RoleId[]);
  const sen = seniority ?? rng.pick(SEN_BY_ROLL);
  const bump = { junior: -1, pleno: 0, senior: 1, especialista: 1 }[sen];
  const skills = { ...EMPTY_SKILLS };
  for (const [k, v] of Object.entries(ROLE_SKILL_PROFILE[r])) skills[k as SkillKey] = clamp(Math.round((v ?? 0) + bump + rng.range(-0.6, 0.6)), 0, 5);
  const base = { junior: 55, pleno: 70, senior: 82, especialista: 90 }[sen];
  const salaryMult = { junior: 0.6, pleno: 1, senior: 1.35, especialista: 1.8 }[sen];
  const traitKeys = Object.keys(PERSONALITY_TRAITS);
  const traits = rng.chance(0.55) ? [rng.pick(traitKeys)] : [];
  return {
    id, templateId: 'proc', name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`, role: r, seniority: sen, skills,
    speed: Math.round(clamp(base + rng.range(-10, 10), 35, 97)), quality: Math.round(clamp(base + rng.range(-10, 12), 35, 98)),
    experience: Math.round(clamp(base - 8 + rng.range(-10, 10), 10, 97)),
    energy: 100, morale: Math.round(rng.range(72, 90)), stress: Math.round(rng.range(5, 15)),
    salary: Math.round((BASE_SALARY[r] * salaryMult * rng.range(0.9, 1.15)) / 100) * 100,
    stage: null, absentDays: 0, hue: Math.floor(rng.range(0, 360)), hiredDay: day, pointsDelivered: 0, daysOverloaded: 0,
    lastUtilization: 0, lastCapacity: 0, traits, trainingsDone: 0,
  };
}

export function refreshTalentMarket(s: GameState, rng: Rng, size = 6): void {
  const used = new Set(s.usedTemplateIds);
  const pool = PROFESSIONALS.filter((p) => !used.has(p.id));
  const market: Person[] = [];
  rng.shuffle([...pool]).slice(0, Math.min(3, pool.length)).forEach((t) => {
    s.personSeq++;
    const p = personFromTemplate(t, rng, `cand-${s.personSeq}`, s.day);
    p.energy = 100;
    market.push(p);
  });
  while (market.length < size) {
    s.personSeq++;
    market.push(proceduralCandidate(rng, `cand-${s.personSeq}`, s.day));
  }
  s.talentMarket = market;
}

/* ------------------------------------------------------------------ */
/* Cards                                                                */
/* ------------------------------------------------------------------ */

export interface CardOptions {
  type?: CardType;
  serviceClass?: ServiceClass;
  priority?: Priority;
  complexity?: number;
  valueMult?: number;
  title?: string;
  clientId?: string;
  stage?: StageId;
}

function pickClient(s: GameState, rng: Rng): ClientState {
  const list = Object.values(s.clients);
  return rng.weighted(list, (c) => c.priorityWeight * (c.vip ? 1.6 : 1)) ?? list[0];
}

export function generateCard(s: GameState, rng: Rng, opts: CardOptions = {}): Card {
  const sc = scenarioOf(s);
  const diff = DIFFICULTIES.find((d) => d.id === s.difficultyId) ?? DIFFICULTIES[1];
  const types = Object.keys(sc.typeWeights) as CardType[];
  const type: CardType = opts.type ?? rng.weighted(types, (t) => sc.typeWeights[t] ?? 0) ?? 'feature';

  const client = opts.clientId ? s.clients[opts.clientId] : pickClient(s, rng);
  let title: string;
  let base: { complexity: number; value: number; risk: number; tags: string[]; tech: Card['tech'] };

  if (type === 'incident') {
    title = opts.title ?? rng.pick(INCIDENT_TITLES);
    base = { complexity: 3, value: 6000, risk: 0.4, tags: ['Produção', 'Urgente'], tech: rng.pick(['backend', 'fullstack', 'data', 'infra'] as const) };
  } else {
    const byType = TASK_TEMPLATES.map((t, i) => ({ t, i })).filter((x) => x.t.type === type);
    const fresh = byType.filter((x) => !s.usedTemplateIds.includes(`task-${x.i}`));
    const chosen = rng.pick(fresh.length ? fresh : byType);
    if (!fresh.length) s.usedTemplateIds = s.usedTemplateIds.filter((id) => !byType.some((x) => `task-${x.i}` === id));
    s.usedTemplateIds.push(`task-${chosen.i}`);
    title = opts.title ?? chosen.t.title;
    base = { complexity: chosen.t.complexity, value: chosen.t.value, risk: chosen.t.risk, tags: chosen.t.tags, tech: chosen.t.tech };
  }

  const complexity = opts.complexity ?? snapFib(base.complexity * client.complexityMult * rng.range(0.78, 1.3));
  let value = base.value * client.budgetMult * rng.range(0.8, 1.3) * (opts.valueMult ?? 1);
  if (type === 'techdebt') value = 0;
  if (type === 'bug' && value < 1000) value = 1500;
  value = Math.round(value / 500) * 500;

  let serviceClass: ServiceClass;
  if (opts.serviceClass) serviceClass = opts.serviceClass;
  else if (type === 'incident') serviceClass = 'expedite';
  else if (type === 'techdebt') serviceClass = rng.chance(0.8) ? 'intangible' : 'standard';
  else {
    const classes = Object.keys(sc.classWeights) as ServiceClass[];
    serviceClass = rng.weighted(classes, (c) => (c === 'intangible' && value > 0 ? 0.15 : sc.classWeights[c] ?? 0)) ?? 'standard';
  }

  const priority: Priority = opts.priority ??
    (serviceClass === 'expedite' ? 'critical' : value >= 25000 ? rng.pick(['high', 'high', 'critical'] as Priority[]) : value >= 10000 ? rng.pick(['medium', 'high'] as Priority[]) : rng.pick(['low', 'medium', 'medium'] as Priority[]));

  const typeDef = CARD_TYPES[type];
  const work = {} as Card['work'];
  for (const st of WORK_STAGES) {
    const eff = complexity * typeDef.effort[st] * EFFORT_SCALE * rng.range(0.85, 1.2);
    work[st] = { total: Math.max(0.5, Math.round(eff * 10) / 10), done: 0 };
  }

  const slaBase = serviceClass === 'expedite' ? 3 : client.slaDays;
  const slaDays = Math.max(3, Math.round(slaBase / Math.sqrt(diff.clientStrictness) * (complexity >= 8 ? 1.3 : 1)));

  s.cardSeq[typeDef.prefix] = (s.cardSeq[typeDef.prefix] ?? rng.int(10, 60)) + 1;
  const num = s.cardSeq[typeDef.prefix];
  const id = `${typeDef.prefix}-${num}`;
  const stage = opts.stage ?? 'backlog';

  const card: Card = {
    id, code: `#${id}`, title, type, serviceClass, priority, clientId: client.id, tech: base.tech,
    tags: base.tags.slice(0, 3), complexity, value, risk: clamp(base.risk + rng.range(-0.1, 0.1), 0.02, 0.9), work,
    stage, stageEnteredDay: s.day, createdDay: s.day, slaDays, dependsOn: [], blockedDaysTotal: 0, activeDays: 0,
    hiddenDefects: 0, bugsFound: 0, reworkCount: 0, assignees: [], contributors: [], slaBreached: false, paused: false,
    history: [{ day: s.day, stage }],
  };
  if (serviceClass === 'fixed') card.dueDay = s.day + Math.max(4, Math.round(slaDays * rng.range(0.9, 1.4)));
  if (stage !== 'backlog') card.readyDay = s.day;
  if (!['backlog', 'ready'].includes(stage)) card.startedDay = s.day;

  // Dependências: cards de maior risco podem depender de outro card em aberto
  if (!['incident', 'bug'].includes(type) && rng.chance(diff.dependencyChance * (type === 'integration' || type === 'feature' ? 1.4 : 0.7))) {
    const candidates = Object.values(s.cards).filter((c) => c.stage !== 'done' && c.id !== id && (c.type === 'integration' || c.type === 'infra' || c.tech === 'backend' || c.type === 'security'));
    if (candidates.length) card.dependsOn = [rng.pick(candidates).id];
  }

  s.cards[id] = card;
  return card;
}

export function placeCard(s: GameState, card: Card, stage: StageId, top = false): void {
  const col = s.columns[stage];
  if (top) col.unshift(card.id);
  else col.push(card.id);
}

/* ------------------------------------------------------------------ */
/* Nova partida                                                         */
/* ------------------------------------------------------------------ */

export interface NewGameConfig {
  mode: GameModeId;
  scenarioId: string;
  difficultyId: string;
  days?: number;
  seedLabel: string;
  tutorial?: boolean;
}

function emptyColumns(): Record<StageId, string[]> {
  return { backlog: [], ready: [], analysis: [], dev: [], review: [], test: [], uat: [], deploy: [], done: [] };
}

export function createGame(cfg: NewGameConfig): GameState {
  const sc = SCENARIO_MAP[cfg.scenarioId] ?? SCENARIOS[0];
  const diff = DIFFICULTIES.find((d) => d.id === cfg.difficultyId) ?? DIFFICULTIES[1];
  const mode = GAME_MODES.find((m) => m.id === cfg.mode) ?? GAME_MODES[0];
  const totalDays = cfg.days ?? mode.days ?? sc.recommendedDays;
  const seed = hashSeed(cfg.seedLabel);

  const s: GameState = {
    version: SAVE_VERSION, id: `g-${Date.now().toString(36)}`, seed, seedLabel: cfg.seedLabel, rng: seed,
    mode: cfg.mode, scenarioId: sc.id, difficultyId: diff.id, totalDays, day: 1, phase: 'planning', startedAt: Date.now(),
    cards: {}, columns: emptyColumns(), people: {}, peopleOrder: [], clients: {}, wipLimits: { ...sc.wipLimits },
    cash: Math.round(sc.startingCash * diff.startingCashMult), revenueTotal: 0, costsTotal: 0, valuePoints: 0, dailyRecurring: 0,
    clientSatisfaction: sc.initialClientSat, techDebt: sc.initialTechDebt, xp: 0, modifiers: [], upgrades: {}, pendingEvents: [],
    recentEventIds: [], escapes: [], log: [], history: [], delivered: [],
    settings: { autoPull: sc.autoPull, overtime: false, focus: 'balanced' },
    counters: {
      incidentsResolved: 0, bugsFound: 0, bugsEscaped: 0, reworkTotal: 0, slaBreaches: 0, daysWipRespected: 0, consecutiveWipOk: 0,
      cleanDeliveriesStreak: 0, maxCleanStreak: 0, hires: 0, fires: 0, trainings: 0, eventsHandled: 0, expediteDelivered: 0,
      fixedOnTime: 0, fixedLate: 0, overtimeDays: 0, blocksEscalated: 0, adviceAccepted: 0, techDebtPaid: 0, daysHappyTeam: 0,
      maxDeliveriesInDay: 0, burnouts: 0, upgradesBought: 0, daysNoIncident: 0, cardsStarted: 0, idleDays: 0, wipChanges: 0,
    },
    achievements: [], newAchievements: [], cardSeq: {}, personSeq: 0, eventSeq: 0, talentMarket: [], usedTemplateIds: [],
    lessons: [], pendingLessons: [], tutorial: !!cfg.tutorial,
  };
  const rng = new Rng(s);

  // Clientes do cenário
  const segClients = rng.shuffle(CLIENTS.filter((c) => sc.segments.includes(c.segment)));
  const others = rng.shuffle(CLIENTS.filter((c) => !sc.segments.includes(c.segment)));
  const chosen = [...segClients.slice(0, 3), ...others.slice(0, Math.max(0, 3 - segClients.length))].slice(0, 4);
  if (segClients.length > 3 && rng.chance(0.5)) chosen.push(segClients[3]);
  const vipIdx = rng.int(0, chosen.length - 1);
  chosen.forEach((c, i) => {
    s.clients[c.id] = {
      ...c, strictness: c.strictness * diff.clientStrictness, satisfaction: Math.round(clamp(sc.initialClientSat + rng.range(-6, 6), 30, 95)),
      delivered: 0, breaches: 0, vip: i === vipIdx,
    };
  });

  // Equipe
  const used = new Set<string>();
  for (const role of sc.team) {
    const options = PROFESSIONALS.filter((p) => p.role === role && !used.has(p.id));
    s.personSeq++;
    let person: Person;
    if (options.length) {
      const t = rng.pick(options);
      used.add(t.id);
      person = personFromTemplate(t, rng, `p-${s.personSeq}`, 1);
    } else {
      person = proceduralCandidate(rng, `p-${s.personSeq}`, 1, role);
    }
    person.hiredDay = 0;
    person.stage = ROLES[role].primaryStage;
    if (role === 'po') person.stage = 'uat';
    s.people[person.id] = person;
    s.peopleOrder.push(person.id);
  }
  s.usedTemplateIds = [...used];
  if (!sc.chaoticStart) autoStaff(s);
  if (sc.chaoticStart) {
    s.peopleOrder.forEach((id, i) => {
      const p = s.people[id];
      if (p.role !== 'po' && i % 4 !== 0) p.stage = 'dev';
    });
  }
  s.dailyRecurring = Math.round((s.peopleOrder.reduce((a, id) => a + s.people[id].salary, 0) / 22) * 0.55);

  refreshTalentMarket(s, rng);

  // Backlog inicial
  for (let i = 0; i < sc.initialBacklog; i++) {
    const c = generateCard(s, rng);
    placeCard(s, c, 'backlog');
  }
  // Alguns cards já comprometidos em Ready
  const readyN = Math.min(s.wipLimits.ready, 3);
  const toReady = s.columns.backlog.splice(0, readyN);
  for (const id of toReady) {
    const c = s.cards[id];
    c.stage = 'ready';
    c.readyDay = 1;
    c.history.push({ day: 1, stage: 'ready' });
    s.columns.ready.push(id);
  }

  // Cenário "processo ruim": cards já iniciados por todo o quadro
  if (sc.prestartedCards) {
    const stages: WorkStage[] = ['analysis', 'dev', 'dev', 'dev', 'review', 'test', 'uat'];
    for (let i = 0; i < sc.prestartedCards; i++) {
      const st = rng.pick(stages);
      const c = generateCard(s, rng, { stage: st });
      c.createdDay = -rng.int(3, 12);
      c.readyDay = c.createdDay + 1;
      c.startedDay = c.createdDay + rng.int(1, 2);
      const idx = WORK_STAGES.indexOf(st);
      WORK_STAGES.forEach((w, j) => {
        if (j < idx) c.work[w].done = c.work[w].total;
        if (j === idx) c.work[w].done = Math.round(c.work[w].total * rng.range(0, 0.7) * 10) / 10;
      });
      if (rng.chance(0.3)) c.hiddenDefects = 1;
      placeCard(s, c, st);
    }
  }

  s.log.push({ day: 1, icon: '🚀', text: `Partida iniciada: ${sc.name} — ${sc.subtitle}. Seed ${cfg.seedLabel}.`, tone: 'neutral' });
  if (cfg.tutorial) s.pendingLessons = [];
  return s;
}

/** Garante ao menos uma pessoa por estágio de trabalho, puxando de estágios com sobra */
export function autoStaff(s: GameState): void {
  const stages: WorkStage[] = ['analysis', 'dev', 'review', 'test', 'uat', 'deploy'];
  for (const st of stages) {
    const count = (x: WorkStage) => s.peopleOrder.filter((id) => s.people[id].stage === x).length;
    if (count(st) > 0) continue;
    const donors = s.peopleOrder
      .map((id) => s.people[id])
      .filter((p) => p.stage && count(p.stage) > 1)
      .sort((a, b) => skillFor(b, st) - skillFor(a, st));
    if (donors[0]) donors[0].stage = st;
  }
}

function skillFor(p: Person, st: WorkStage): number {
  const k = p.skills;
  switch (st) {
    case 'analysis': return k.analysis * 1.1 + k.ux * 0.3;
    case 'dev': return Math.max(k.frontend, k.backend, k.data);
    case 'review': return Math.max(k.architecture, (k.frontend + k.backend) / 2);
    case 'test': return k.testing;
    case 'uat': return Math.max(k.analysis, k.testing);
    case 'deploy': return k.devops;
  }
}

export const MODE_OF = (id: GameModeId) => GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
