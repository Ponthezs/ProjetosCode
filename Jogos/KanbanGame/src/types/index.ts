/* ============================================================
 * FLOW OPS — Tipos centrais do domínio
 * Todo o estado do jogo é serializável (JSON) para permitir
 * persistência local e, futuramente, sincronização remota
 * (Supabase / PostgreSQL / Firebase) e multiplayer.
 * ============================================================ */

export type StageId =
  | 'backlog'
  | 'ready'
  | 'analysis'
  | 'dev'
  | 'review'
  | 'test'
  | 'uat'
  | 'deploy'
  | 'done';

export type WorkStage = 'analysis' | 'dev' | 'review' | 'test' | 'uat' | 'deploy';
export type LimitedStage = 'ready' | WorkStage;

export type CardType =
  | 'feature'
  | 'bug'
  | 'incident'
  | 'improvement'
  | 'techdebt'
  | 'integration'
  | 'security'
  | 'infra'
  | 'ux';

export type ServiceClass = 'standard' | 'fixed' | 'expedite' | 'intangible';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type SkillKey =
  | 'analysis'
  | 'frontend'
  | 'backend'
  | 'testing'
  | 'devops'
  | 'ux'
  | 'architecture'
  | 'data';

/** Área técnica exigida no desenvolvimento de um card */
export type TechArea = 'frontend' | 'backend' | 'fullstack' | 'data' | 'infra' | 'ux' | 'security';

export type RoleId =
  | 'analyst'
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'qa'
  | 'devops'
  | 'ux'
  | 'architect'
  | 'dba'
  | 'po';

export type Seniority = 'junior' | 'pleno' | 'senior' | 'especialista';

export type Segment =
  | 'startup'
  | 'bank'
  | 'hospital'
  | 'healthplan'
  | 'fintech'
  | 'retail'
  | 'industry'
  | 'government'
  | 'ecommerce'
  | 'saas';

export type FocusId = 'balanced' | 'flow' | 'quality' | 'speed' | 'firefight';

export type GameModeId = 'campaign' | 'sandbox' | 'challenge' | 'quick' | 'standard' | 'marathon' | 'chaos';

/* ---------------------------------------------------------- */
/* Configuração (arquivos em /data, /events, /scenarios)        */
/* ---------------------------------------------------------- */

export interface RoleDef {
  id: RoleId;
  name: string;
  short: string;
  primaryStage: WorkStage;
  /** Estágios onde o papel recebe bônus de especialização */
  specialtyStages: WorkStage[];
  color: string;
}

export interface ProfessionalTemplate {
  id: string;
  name: string;
  role: RoleId;
  seniority: Seniority;
  skills: Partial<Record<SkillKey, number>>;
  speed: number;
  quality: number;
  experience: number;
  salary: number;
  traits?: string[];
}

export interface TaskTemplate {
  title: string;
  type: CardType;
  tech: TechArea;
  tags: string[];
  complexity: number;
  value: number;
  risk: number;
}

export interface ClientDef {
  id: string;
  name: string;
  segment: Segment;
  /** Dias de atraso tolerados antes de penalidades fortes */
  tolerance: number;
  budgetMult: number;
  slaDays: number;
  priorityWeight: number;
  complexityMult: number;
  /** 0.5 (tranquilo) .. 2 (extremamente exigente) */
  strictness: number;
  description: string;
}

export interface DifficultyDef {
  id: string;
  name: string;
  description: string;
  eventRate: number;
  capacityMult: number;
  variance: number;
  dependencyChance: number;
  blockChance: number;
  clientStrictness: number;
  defectMult: number;
  arrivalMult: number;
  startingCashMult: number;
  scoreMult: number;
  color: string;
}

export interface ScenarioGoal {
  metric: 'profit' | 'revenue' | 'clientSat' | 'teamMorale' | 'leadTime' | 'throughput' | 'escapedBugs' | 'techDebt' | 'delivered' | 'incidents';
  target: number;
  label: string;
  /** 'gte' = maior ou igual, 'lte' = menor ou igual */
  cmp: 'gte' | 'lte';
}

export interface ScenarioDef {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  description: string;
  objective: string;
  icon: string;
  accent: string;
  segments: Segment[];
  team: RoleId[];
  startingCash: number;
  initialBacklog: number;
  arrivalRate: number;
  initialTechDebt: number;
  initialClientSat: number;
  typeWeights: Partial<Record<CardType, number>>;
  classWeights: Partial<Record<ServiceClass, number>>;
  eventCategoryWeights?: Partial<Record<EventCategory, number>>;
  wipLimits: Record<LimitedStage, number>;
  autoPull: boolean;
  infraCostPerDay: number;
  incidentSeverityMult: number;
  techDebtDrift: number;
  /** Dias com multiplicador de chegada (ex.: Black Friday) */
  surges?: { fromDay: number; toDay: number; arrivalMult: number; label: string }[];
  goals: ScenarioGoal[];
  recommendedDays: number;
  tips: string[];
  /** Cards já iniciados espalhados pelo quadro no dia 1 */
  prestartedCards?: number;
  /** Equipe começa alocada de forma ruim (ex.: todos em desenvolvimento) */
  chaoticStart?: boolean;
  /** Nível de dificuldade mínimo sugerido */
  unlockAfter?: string;
}

export interface GameModeDef {
  id: GameModeId;
  name: string;
  description: string;
  days: number | null;
  eventMult: number;
  varianceMult: number;
  icon: string;
}

export interface UpgradeEffect {
  key: UpgradeKey;
  /** valor aplicado por nível */
  perLevel: number;
}

export type UpgradeKey =
  | 'deployEffort'
  | 'testCapacity'
  | 'reviewCapacity'
  | 'analysisCapacity'
  | 'devCapacity'
  | 'defectChance'
  | 'detection'
  | 'blockChance'
  | 'incidentImpact'
  | 'escapedDetection'
  | 'morale'
  | 'techDebtDecay'
  | 'onboarding'
  | 'uatCapacity'
  | 'blockDuration'
  | 'advisor'
  | 'variance'
  | 'energyRecovery'
  | 'infraCost'
  | 'revenue';

export interface UpgradeDef {
  id: string;
  name: string;
  branch: 'quality' | 'delivery' | 'ops' | 'people' | 'intelligence';
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  requires?: string[];
  effects: UpgradeEffect[];
  levelText: string[];
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  /** Avaliado ao final de cada dia e no fim da partida */
  check: (s: GameState) => boolean;
}

/* ---------------------------------------------------------- */
/* Eventos                                                      */
/* ---------------------------------------------------------- */

export type EventCategory = 'incident' | 'people' | 'client' | 'tech' | 'process' | 'business' | 'positive';
export type EventSeverity = 'info' | 'warning' | 'critical' | 'positive';

export type EventRequirement =
  | 'person'
  | 'cardInProgress'
  | 'cardInDev'
  | 'cardInTest'
  | 'cardInUat'
  | 'cardInDeploy'
  | 'cardInBacklog'
  | 'cardDone'
  | 'hasQA'
  | 'hasDevOps'
  | 'hasDBA'
  | 'hasArchitect'
  | 'highTechDebt'
  | 'lowMorale'
  | 'highMorale'
  | 'incidentOpen'
  | 'minDay3'
  | 'minDay7'
  | 'integrationCard';

export type Effect =
  | { type: 'money'; amount: number }
  | { type: 'clientSat'; amount: number }
  | { type: 'teamMorale'; amount: number }
  | { type: 'teamEnergy'; amount: number }
  | { type: 'teamStress'; amount: number }
  | { type: 'personMorale'; amount: number }
  | { type: 'personEnergy'; amount: number }
  | { type: 'personStress'; amount: number }
  | { type: 'personAbsent'; days: number; reason: string }
  | { type: 'personSkill'; skill: SkillKey | 'auto'; amount: number }
  | { type: 'personLeaves' }
  | { type: 'techDebt'; amount: number }
  | { type: 'capacity'; scope: 'all' | 'stage' | 'person' | 'tech'; stage?: WorkStage; tech?: TechArea; mult: number; days: number; label: string }
  | { type: 'defectMod'; mult: number; days: number; label: string }
  | { type: 'blockMod'; mult: number; days: number; label: string }
  | { type: 'revenueMod'; mult: number; days: number; label: string }
  | { type: 'arrivalMod'; mult: number; days: number; label: string }
  | { type: 'spawnCard'; cardType: CardType; serviceClass: ServiceClass; priority?: Priority; title?: string; complexity?: number; valueMult?: number; toStage?: StageId }
  | { type: 'blockCard'; days: number; reason: string }
  | { type: 'rework'; amount: number }
  | { type: 'scope'; mult: number }
  | { type: 'expediteCard' }
  | { type: 'cardValue'; mult: number }
  | { type: 'addPerson'; role?: RoleId; seniority?: Seniority }
  | { type: 'xp'; amount: number }
  | { type: 'chance'; p: number; then: Effect[]; else?: Effect[]; thenText?: string; elseText?: string }
  | { type: 'clientSatTarget'; amount: number }
  | { type: 'wipTemporary'; stage: WorkStage; delta: number };

export interface EventChoiceDef {
  id: string;
  label: string;
  description: string;
  cost?: string;
  risk?: string;
  benefit?: string;
  tone?: 'safe' | 'risky' | 'neutral' | 'aggressive';
  effects: Effect[];
}

export interface EventDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: EventCategory;
  severity: EventSeverity;
  weight: number;
  requires?: EventRequirement[];
  /** Para selecionar pessoa com papel específico */
  personRoles?: RoleId[];
  /** Estágio do card alvo */
  cardStages?: StageId[];
  cardTypes?: CardType[];
  effects?: Effect[];
  choices?: EventChoiceDef[];
  lesson?: string;
}

export interface PendingEvent {
  instanceId: string;
  defId: string;
  day: number;
  title: string;
  description: string;
  icon: string;
  severity: EventSeverity;
  category: EventCategory;
  context: { personId?: string; cardId?: string; clientId?: string };
  choices?: EventChoiceDef[];
  /** Resultado textual já aplicado (eventos sem escolha) */
  autoApplied?: boolean;
  outcome?: string[];
  lesson?: string;
}

/* ---------------------------------------------------------- */
/* Estado da partida                                            */
/* ---------------------------------------------------------- */

export interface StageWork {
  total: number;
  done: number;
}

export interface CardBlock {
  reason: string;
  daysLeft: number;
  since: number;
  kind: 'external' | 'internal' | 'environment' | 'dependency';
}

export interface Card {
  id: string;
  code: string;
  title: string;
  type: CardType;
  serviceClass: ServiceClass;
  priority: Priority;
  clientId: string;
  tech: TechArea;
  tags: string[];
  complexity: number;
  value: number;
  risk: number;
  work: Record<WorkStage, StageWork>;
  stage: StageId;
  stageEnteredDay: number;
  createdDay: number;
  readyDay?: number;
  startedDay?: number;
  doneDay?: number;
  slaDays: number;
  dueDay?: number;
  dependsOn: string[];
  blocked?: CardBlock;
  blockedDaysTotal: number;
  activeDays: number;
  hiddenDefects: number;
  bugsFound: number;
  reworkCount: number;
  assignees: string[];
  contributors: string[];
  slaBreached: boolean;
  paused: boolean;
  parentId?: string;
  deliveredValue?: number;
  history: { day: number; stage: StageId }[];
  /** Progresso obtido no último dia (para animação) */
  lastProgress?: number;
}

export interface Person {
  id: string;
  templateId: string;
  name: string;
  role: RoleId;
  seniority: Seniority;
  skills: Record<SkillKey, number>;
  speed: number;
  quality: number;
  experience: number;
  energy: number;
  morale: number;
  stress: number;
  salary: number;
  stage: WorkStage | null;
  absentDays: number;
  absentReason?: string;
  hue: number;
  hiredDay: number;
  pointsDelivered: number;
  daysOverloaded: number;
  lastUtilization: number;
  lastCapacity: number;
  traits: string[];
  trainingsDone: number;
}

export interface ClientState extends ClientDef {
  satisfaction: number;
  delivered: number;
  breaches: number;
  vip: boolean;
}

export interface Modifier {
  id: string;
  label: string;
  kind: 'capacity' | 'defect' | 'block' | 'revenue' | 'arrival';
  scope: 'all' | 'stage' | 'person' | 'tech';
  stage?: WorkStage;
  tech?: TechArea;
  personId?: string;
  mult: number;
  daysLeft: number;
}

export interface EscapedDefect {
  cardId: string;
  surfacesOnDay: number;
  severity: 'minor' | 'major' | 'critical';
}

export interface DaySnapshot {
  day: number;
  cfd: Record<StageId, number>;
  wip: number;
  wipLimitTotal: number;
  throughput: number;
  arrivals: number;
  started: number;
  leadTimeAvg: number | null;
  cycleTimeAvg: number | null;
  revenueDay: number;
  costsDay: number;
  revenueTotal: number;
  costsTotal: number;
  cash: number;
  clientSat: number;
  teamMorale: number;
  techDebt: number;
  bugsFound: number;
  escapedBugs: number;
  rework: number;
  blocked: number;
  incidentsOpen: number;
  utilization: Record<WorkStage, number>;
  stageLoad: Record<WorkStage, number>;
  queue: Record<WorkStage, number>;
  bottleneck: WorkStage | null;
  wipExceeded: WorkStage[];
  valueDelivered: number;
  pointsDone: number;
}

export interface DeliveredRecord {
  cardId: string;
  code: string;
  type: CardType;
  serviceClass: ServiceClass;
  day: number;
  leadTime: number;
  cycleTime: number;
  value: number;
  blockedDays: number;
  activeDays: number;
  hadEscapedDefect: boolean;
}

export type FloatKind = 'progress' | 'blocked' | 'bug' | 'done' | 'money' | 'unblocked' | 'rework' | 'sla' | 'moved';

export interface FloatFx {
  cardId?: string;
  kind: FloatKind;
  text: string;
}

export interface DayResult {
  day: number;
  fx: FloatFx[];
  deliveries: { cardId: string; code: string; title: string; type: CardType; value: number; clientSatDelta: number; xp: number; leadTime: number }[];
  revenue: number;
  costs: number;
  bugsFound: number;
  blockedNew: number;
  escaped: number;
  movedCards: number;
  headline: string[];
}

export interface LogEntry {
  day: number;
  icon: string;
  text: string;
  tone: 'good' | 'bad' | 'neutral' | 'warn';
}

export interface GameCounters {
  incidentsResolved: number;
  bugsFound: number;
  bugsEscaped: number;
  reworkTotal: number;
  slaBreaches: number;
  daysWipRespected: number;
  consecutiveWipOk: number;
  cleanDeliveriesStreak: number;
  maxCleanStreak: number;
  hires: number;
  fires: number;
  trainings: number;
  eventsHandled: number;
  expediteDelivered: number;
  fixedOnTime: number;
  fixedLate: number;
  overtimeDays: number;
  blocksEscalated: number;
  adviceAccepted: number;
  techDebtPaid: number;
  daysHappyTeam: number;
  maxDeliveriesInDay: number;
  burnouts: number;
  upgradesBought: number;
  daysNoIncident: number;
  cardsStarted: number;
  idleDays: number;
  wipChanges: number;
}

export interface Insight {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'positive';
  title: string;
  message: string;
  cause?: string;
  suggestion?: string;
  action?: { label: string; actions: GameAction[] };
}

export interface GameSettings {
  autoPull: boolean;
  overtime: boolean;
  focus: FocusId;
}

export interface GameState {
  version: number;
  id: string;
  seed: number;
  seedLabel: string;
  rng: number;
  mode: GameModeId;
  scenarioId: string;
  difficultyId: string;
  totalDays: number;
  day: number;
  phase: 'planning' | 'ended';
  startedAt: number;
  cards: Record<string, Card>;
  columns: Record<StageId, string[]>;
  people: Record<string, Person>;
  peopleOrder: string[];
  clients: Record<string, ClientState>;
  wipLimits: Record<LimitedStage, number>;
  cash: number;
  revenueTotal: number;
  costsTotal: number;
  valuePoints: number;
  dailyRecurring: number;
  clientSatisfaction: number;
  techDebt: number;
  xp: number;
  modifiers: Modifier[];
  upgrades: Record<string, number>;
  pendingEvents: PendingEvent[];
  recentEventIds: { id: string; day: number }[];
  escapes: EscapedDefect[];
  log: LogEntry[];
  history: DaySnapshot[];
  delivered: DeliveredRecord[];
  lastResult?: DayResult;
  settings: GameSettings;
  counters: GameCounters;
  achievements: string[];
  newAchievements: string[];
  cardSeq: Record<string, number>;
  personSeq: number;
  eventSeq: number;
  talentMarket: Person[];
  usedTemplateIds: string[];
  lessons: string[];
  pendingLessons: string[];
  tutorial: boolean;
  report?: FinalReport;
}

/* ---------------------------------------------------------- */
/* Ações (command pattern — base para multiplayer)              */
/* ---------------------------------------------------------- */

export type PlayerRole = 'manager' | 'analyst' | 'dev' | 'qa' | 'po';

export type GameAction =
  | { type: 'moveCard'; cardId: string; to: StageId; index?: number }
  | { type: 'reorderCard'; cardId: string; index: number }
  | { type: 'setWip'; stage: LimitedStage; limit: number }
  | { type: 'assignPerson'; personId: string; stage: WorkStage | null }
  | { type: 'setFocus'; focus: FocusId }
  | { type: 'setOvertime'; value: boolean }
  | { type: 'setAutoPull'; value: boolean }
  | { type: 'togglePause'; cardId: string }
  | { type: 'setServiceClass'; cardId: string; serviceClass: ServiceClass }
  | { type: 'escalateBlock'; cardId: string }
  | { type: 'hire'; candidateId: string }
  | { type: 'fire'; personId: string }
  | { type: 'train'; personId: string; skill: SkillKey }
  | { type: 'promote'; personId: string }
  | { type: 'vacation'; personId: string; days: number }
  | { type: 'buyUpgrade'; upgradeId: string }
  | { type: 'resolveEvent'; instanceId: string; choiceId?: string }
  | { type: 'dismissLesson'; lessonId: string }
  | { type: 'adviceAccepted' }
  | { type: 'clearNewAchievements' }
  | { type: 'endTutorial' }
  | { type: 'processDay' };

export interface ActionEnvelope {
  action: GameAction;
  actor: PlayerRole;
  at: number;
}

/* ---------------------------------------------------------- */
/* Relatório final                                              */
/* ---------------------------------------------------------- */

export interface FinalReport {
  score: number;
  rank: { id: string; name: string; icon: string; color: string };
  breakdown: { label: string; value: string; points: number }[];
  metrics: {
    revenue: number;
    costs: number;
    profit: number;
    roi: number;
    delivered: number;
    valuePoints: number;
    leadTime: number;
    cycleTime: number;
    throughput: number;
    avgWip: number;
    rework: number;
    bugsFound: number;
    escapedBugs: number;
    clientSat: number;
    teamMorale: number;
    techDebt: number;
    flowEfficiency: number;
    slaBreaches: number;
    blockedDays: number;
  };
  mainBottleneck: WorkStage | null;
  bottleneckCounts: Partial<Record<WorkStage, number>>;
  mainProblem: { title: string; explanation: string };
  worked: string[];
  improve: string[];
  recommendations: string[];
  goals: { label: string; achieved: boolean; value: string }[];
  stars: number;
}

export interface RankingEntry {
  id: string;
  score: number;
  rankName: string;
  scenario: string;
  difficulty: string;
  mode: GameModeId;
  days: number;
  seedLabel: string;
  date: number;
  profit: number;
  leadTime: number;
  throughput: number;
}

export interface Profile {
  achievements: string[];
  completedScenarios: Record<string, number>;
  gamesPlayed: number;
  tutorialDone: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  sound: boolean;
  volume: number;
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedEffects: boolean;
}
