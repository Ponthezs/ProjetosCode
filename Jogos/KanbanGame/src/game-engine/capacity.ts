import { FOCUS_OPTIONS, STAGE_SKILL, TECH_SKILL } from '../data/board';
import { DIFFICULTIES } from '../data/difficulties';
import { ROLES, SENIORITY_META } from '../data/professionals';
import { UPGRADE_MAP } from '../data/upgrades';
import type { Card, GameState, Person, TechArea, UpgradeKey, WorkStage } from '../types';

export function getDifficulty(s: Pick<GameState, 'difficultyId'>) {
  return DIFFICULTIES.find((d) => d.id === s.difficultyId) ?? DIFFICULTIES[1];
}

/** Soma o efeito total de melhorias compradas para uma chave */
export function upgradeValue(s: Pick<GameState, 'upgrades'>, key: UpgradeKey): number {
  let v = 0;
  for (const [id, lvl] of Object.entries(s.upgrades)) {
    const def = UPGRADE_MAP[id];
    if (!def || !lvl) continue;
    for (const e of def.effects) if (e.key === key) v += e.perLevel * lvl;
  }
  return v;
}

const SPEC_CURVE = [0.35, 0.55, 0.78, 1.0, 1.2, 1.4];

/** Nível (0–5) da habilidade relevante do profissional para o estágio/card */
export function skillLevelFor(p: Person, stage: WorkStage, tech?: TechArea): number {
  let lvl: number;
  if (stage === 'dev') {
    const keys = TECH_SKILL[tech ?? bestTech(p)];
    lvl = keys.length === 1 ? p.skills[keys[0]] : keys.reduce((a, k) => a + p.skills[k], 0) / keys.length;
    // Full stack exige os dois lados; bônus se ambos forem fortes
    if (tech === 'security') lvl = Math.max(p.skills.backend, p.skills.devops, p.skills.architecture) * 0.9;
  } else if (stage === 'review') {
    lvl = Math.max(p.skills.architecture, Math.max(p.skills.backend, p.skills.frontend) * 0.9);
  } else {
    lvl = Math.max(...STAGE_SKILL[stage].map((k) => p.skills[k]));
  }
  if (p.traits.includes('generalista') && lvl < 3) lvl = Math.min(3, lvl + 1);
  return Math.max(0, Math.min(5, lvl));
}

function bestTech(p: Person): TechArea {
  const opts: [TechArea, number][] = [
    ['frontend', p.skills.frontend],
    ['backend', p.skills.backend],
    ['data', p.skills.data],
    ['ux', p.skills.ux],
    ['infra', p.skills.devops],
  ];
  opts.sort((a, b) => b[1] - a[1]);
  return opts[0][0];
}

export function specializationMult(p: Person, stage: WorkStage, tech?: TechArea): number {
  const lvl = skillLevelFor(p, stage, tech);
  const lo = Math.floor(lvl);
  const hi = Math.min(5, lo + 1);
  const base = SPEC_CURVE[lo] + (SPEC_CURVE[hi] - SPEC_CURVE[lo]) * (lvl - lo);
  const roleBonus = ROLES[p.role].specialtyStages.includes(stage) ? 1.08 : 1;
  return base * roleBonus;
}

export function baseCapacity(p: Person): number {
  return (2.2 + (p.speed / 100) * 3.6) * SENIORITY_META[p.seniority].mult;
}

const STAGE_UPGRADE: Partial<Record<WorkStage, UpgradeKey>> = {
  analysis: 'analysisCapacity',
  dev: 'devCapacity',
  review: 'reviewCapacity',
  test: 'testCapacity',
  uat: 'uatCapacity',
};

export interface CapacityBreakdown {
  base: number;
  specialization: number;
  energy: number;
  morale: number;
  difficulty: number;
  upgrades: number;
  techDebt: number;
  focus: number;
  modifiers: number;
  onboarding: number;
  expected: number;
  min: number;
  max: number;
}

/** Capacidade prevista (sem aleatoriedade) de uma pessoa em um estágio */
export function capacityBreakdown(s: GameState, p: Person, stage: WorkStage, card?: Card): CapacityBreakdown {
  const diff = getDifficulty(s);
  const base = baseCapacity(p);
  const specialization = specializationMult(p, stage, card?.tech);
  const energy = 0.55 + 0.45 * (p.energy / 100);
  const morale = 0.8 + 0.3 * (p.morale / 100);
  const up = STAGE_UPGRADE[stage];
  // CI/CD reduz o esforço de deploy — modelado como aumento equivalente de vazão
  const upgrades = stage === 'deploy' ? 1 / (1 - Math.min(0.7, upgradeValue(s, 'deployEffort'))) : 1 + (up ? upgradeValue(s, up) : 0);
  const techDebt = stage === 'dev' || stage === 'review' ? 1 - (s.techDebt / 100) * 0.35 : 1;
  const focusDef = FOCUS_OPTIONS.find((f) => f.id === s.settings.focus) ?? FOCUS_OPTIONS[0];
  let focus = focusDef.capacity;
  if (focusDef.id === 'flow') focus *= ['test', 'uat', 'deploy', 'review'].includes(stage) ? 1 + focusDef.downstreamBoost : stage === 'analysis' ? 0.75 : 1;
  if (focusDef.id === 'firefight' && card) focus *= card.type === 'bug' || card.type === 'incident' ? 1.4 : 0.85;
  if (s.settings.overtime) focus *= 1.25;
  if (p.traits.includes('perfeccionista')) focus *= 0.92;
  if (p.traits.includes('apressado')) focus *= 1.1;
  if (p.traits.includes('bombeiro') && card && (card.type === 'bug' || card.type === 'incident')) focus *= 1.35;

  let modifiers = 1;
  for (const m of s.modifiers) {
    if (m.kind !== 'capacity') continue;
    if (m.scope === 'all') modifiers *= m.mult;
    else if (m.scope === 'stage' && m.stage === stage) modifiers *= m.mult;
    else if (m.scope === 'person' && m.personId === p.id) modifiers *= m.mult;
    else if (m.scope === 'tech' && card && m.tech === card.tech && stage === 'dev') modifiers *= m.mult;
  }

  const daysSinceHire = s.day - p.hiredDay;
  const onboarding = p.hiredDay > 1 && daysSinceHire < 4 ? Math.min(1, 0.55 + daysSinceHire * 0.12 + upgradeValue(s, 'onboarding')) : 1;

  const expected = base * specialization * energy * morale * diff.capacityMult * upgrades * techDebt * focus * modifiers * onboarding;
  const v = varianceFor(s, p);
  return {
    base, specialization, energy, morale, difficulty: diff.capacityMult, upgrades, techDebt, focus, modifiers, onboarding, expected,
    min: expected * Math.max(0.3, 1 - v * 1.6), max: expected * (1 + v * 1.6),
  };
}

export function varianceFor(s: GameState, p: Person): number {
  const diff = getDifficulty(s);
  const modeVar = s.mode === 'chaos' ? 1.5 : s.mode === 'challenge' ? 1.2 : 1;
  const exp = 1.15 - p.experience / 150;
  return diff.variance * modeVar * exp * (1 - upgradeValue(s, 'variance'));
}

export function expectedCapacity(s: GameState, p: Person, stage: WorkStage, card?: Card): number {
  return capacityBreakdown(s, p, stage, card).expected;
}

export function isAvailable(p: Person): boolean {
  return p.absentDays <= 0;
}

/** Capacidade prevista total de um estágio (soma das pessoas alocadas) */
export function stageCapacity(s: GameState, stage: WorkStage): number {
  let total = 0;
  for (const id of s.peopleOrder) {
    const p = s.people[id];
    if (!p || p.stage !== stage || !isAvailable(p)) continue;
    total += expectedCapacity(s, p, stage);
  }
  return total;
}

export function burnoutRisk(p: Person): number {
  return Math.round(Math.max(0, Math.min(100, p.stress * 0.65 + (100 - p.energy) * 0.35 + (p.morale < 40 ? 10 : 0))));
}

export function moodEmoji(p: Person): string {
  if (p.absentDays > 0) return '🏠';
  if (p.morale >= 80) return '😄';
  if (p.morale >= 62) return '🙂';
  if (p.morale >= 45) return '😐';
  if (p.morale >= 30) return '😟';
  return '😫';
}
