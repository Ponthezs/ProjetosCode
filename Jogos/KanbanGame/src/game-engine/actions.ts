import { produce } from 'immer';
import { STAGE_MAP, STAGE_ORDER, isWorkStage } from '../data/board';
import { ROLES, SENIORITY_META, SKILL_LABEL } from '../data/professionals';
import { UPGRADE_MAP, upgradeCost } from '../data/upgrades';
import { isStageComplete, wipCount } from '../analytics/metrics';
import type { GameAction, GameState, Person, StageId } from '../types';
import { processDay } from './engine';
import { resolveEvent } from './events';
import { log, moveCardTo, pushLesson, removePerson } from './helpers';
import { Rng } from './rng';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export interface MoveCheck {
  ok: boolean;
  reason?: string;
  warning?: string;
}

/** Regras de movimentação manual de cards (sistema puxado) */
export function canMoveCard(s: GameState, cardId: string, to: StageId): MoveCheck {
  const c = s.cards[cardId];
  if (!c) return { ok: false, reason: 'Card não encontrado.' };
  if (s.phase !== 'planning') return { ok: false, reason: 'A partida terminou.' };
  const from = c.stage;
  if (from === to) return { ok: true };
  if (from === 'done') return { ok: false, reason: 'Cards entregues não podem voltar.' };
  const fi = STAGE_ORDER.indexOf(from);
  const ti = STAGE_ORDER.indexOf(to);
  if (ti < fi) {
    if (to === 'backlog' && (from === 'ready' || from === 'analysis')) return { ok: true };
    if (to === 'ready' && from === 'analysis') return { ok: true };
    return { ok: false, reason: 'Só é possível devolver cards de Ready/Análise. Retrabalho acontece automaticamente quando bugs são encontrados.' };
  }
  if (ti - fi > 1) return { ok: false, reason: `Não é possível pular etapas. Próximo estágio: ${STAGE_MAP[STAGE_ORDER[fi + 1]].name}.` };
  if (to === 'done') return { ok: false, reason: 'Cards vão para Done automaticamente quando o deploy termina.' };
  if (isWorkStage(from)) {
    if (c.blocked) return { ok: false, reason: `Card bloqueado: ${c.blocked.reason}.` };
    if (!isStageComplete(c)) {
      const w = c.work[from];
      return { ok: false, reason: `Trabalho em ${STAGE_MAP[from].name} ainda não concluído (${Math.round((w.done / w.total) * 100)}%).` };
    }
  }
  if (to !== 'backlog' && (isWorkStage(to) || to === 'ready') && c.serviceClass !== 'expedite') {
    if (wipCount(s, to) >= s.wipLimits[to]) return { ok: true, warning: `WIP excedido em ${STAGE_MAP[to].name}! Excesso de trabalho simultâneo aumenta o lead time e os bugs.` };
  }
  return { ok: true };
}

export const trainingCost = (p: Person) => 2500 + p.trainingsDone * 1500;
export const hireCost = (p: Person) => Math.round(p.salary * 0.5);
export const severanceCost = (p: Person) => Math.round(p.salary * 1);
export const escalateCost = 2500;
export const PROMOTE_MIN_EXP: Record<Person['seniority'], number> = { junior: 35, pleno: 60, senior: 80, especialista: 101 };

export function canPromote(p: Person): boolean {
  return !!SENIORITY_META[p.seniority].next && p.experience >= PROMOTE_MIN_EXP[p.seniority];
}

export function upgradeAvailability(s: GameState, id: string): { ok: boolean; reason?: string; cost: number } {
  const def = UPGRADE_MAP[id];
  const lvl = s.upgrades[id] ?? 0;
  const cost = def ? upgradeCost(def, lvl) : 0;
  if (!def) return { ok: false, reason: 'Melhoria inválida', cost };
  if (lvl >= def.maxLevel) return { ok: false, reason: 'Nível máximo', cost };
  const missing = (def.requires ?? []).filter((r) => !(s.upgrades[r] > 0));
  if (missing.length) return { ok: false, reason: `Requer ${missing.map((m) => UPGRADE_MAP[m]?.name).join(', ')}`, cost };
  if (s.cash < cost) return { ok: false, reason: 'Caixa insuficiente', cost };
  return { ok: true, cost };
}

function reducer(s: GameState, a: GameAction): void {
  const rng = new Rng(s);
  switch (a.type) {
    case 'moveCard': {
      const chk = canMoveCard(s, a.cardId, a.to);
      if (!chk.ok) return;
      const c = s.cards[a.cardId];
      if (a.to === 'ready' && !c.readyDay) c.readyDay = s.day;
      moveCardTo(s, c, a.to, false, a.index);
      if (chk.warning && isWorkStage(a.to)) pushLesson(s, 'wip');
      if (isWorkStage(a.to) && c.dependsOn.some((d) => s.cards[d] && s.cards[d].stage !== 'done')) pushLesson(s, 'dependencies');
      break;
    }
    case 'reorderCard': {
      const c = s.cards[a.cardId];
      if (!c) return;
      moveCardTo(s, c, c.stage, false, a.index);
      break;
    }
    case 'setWip':
      s.wipLimits[a.stage] = clamp(Math.round(a.limit), 1, 30);
      s.counters.wipChanges++;
      break;
    case 'assignPerson': {
      const p = s.people[a.personId];
      if (p) p.stage = a.stage;
      break;
    }
    case 'setFocus': s.settings.focus = a.focus; break;
    case 'setOvertime': s.settings.overtime = a.value; break;
    case 'setAutoPull': s.settings.autoPull = a.value; break;
    case 'togglePause': {
      const c = s.cards[a.cardId];
      if (c) c.paused = !c.paused;
      break;
    }
    case 'setServiceClass': {
      const c = s.cards[a.cardId];
      if (!c || c.stage === 'done') return;
      if (a.serviceClass === 'expedite') {
        const active = Object.values(s.cards).filter((x) => x.serviceClass === 'expedite' && x.stage !== 'done' && x.stage !== 'backlog').length;
        if (active >= 2) return;
        c.priority = 'critical';
        pushLesson(s, 'serviceClasses');
      }
      if (a.serviceClass === 'fixed' && !c.dueDay) c.dueDay = s.day + c.slaDays;
      c.serviceClass = a.serviceClass;
      break;
    }
    case 'escalateBlock': {
      const c = s.cards[a.cardId];
      if (!c?.blocked || s.cash < escalateCost) return;
      s.cash -= escalateCost;
      s.costsTotal += escalateCost;
      c.blocked.daysLeft -= 1;
      s.counters.blocksEscalated++;
      if (c.blocked.daysLeft <= 0) {
        log(s, '🔓', `${c.code} desbloqueado após escalonamento.`, 'good');
        c.blocked = undefined;
      } else log(s, '📞', `Bloqueio de ${c.code} escalado. Restam ${c.blocked.daysLeft} dia(s).`, 'neutral');
      break;
    }
    case 'hire': {
      const cand = s.talentMarket.find((p) => p.id === a.candidateId);
      if (!cand) return;
      const cost = hireCost(cand);
      if (s.cash < cost) return;
      s.cash -= cost;
      s.costsTotal += cost;
      s.personSeq++;
      const p: Person = { ...cand, id: `p-${s.personSeq}`, hiredDay: s.day, stage: ROLES[cand.role].primaryStage };
      s.people[p.id] = p;
      s.peopleOrder.push(p.id);
      s.talentMarket = s.talentMarket.filter((x) => x.id !== cand.id);
      if (cand.templateId !== 'proc') s.usedTemplateIds.push(cand.templateId);
      s.counters.hires++;
      log(s, '🤝', `${p.name} contratado(a) como ${ROLES[p.role].name}. Custo de contratação R$ ${cost.toLocaleString('pt-BR')}.`, 'neutral');
      break;
    }
    case 'fire': {
      const p = s.people[a.personId];
      if (!p || s.peopleOrder.length <= 1) return;
      const cost = severanceCost(p);
      s.cash -= cost;
      s.costsTotal += cost;
      removePerson(s, p.id);
      s.peopleOrder.forEach((id) => { const o = s.people[id]; if (o) o.morale = clamp(o.morale - 5, 0, 100); });
      s.counters.fires++;
      log(s, '📤', `${p.name} foi desligado(a). Rescisão de R$ ${cost.toLocaleString('pt-BR')}. A moral do time caiu.`, 'warn');
      break;
    }
    case 'train': {
      const p = s.people[a.personId];
      if (!p || p.absentDays > 0) return;
      const cost = trainingCost(p);
      if (s.cash < cost || p.skills[a.skill] >= 5) return;
      s.cash -= cost;
      s.costsTotal += cost;
      p.skills[a.skill] = Math.min(5, p.skills[a.skill] + 1);
      p.experience = clamp(p.experience + 5, 0, 100);
      p.morale = clamp(p.morale + 6, 0, 100);
      p.absentDays = 1;
      p.absentReason = 'Treinamento';
      p.trainingsDone++;
      s.counters.trainings++;
      log(s, '🎓', `${p.name} fará treinamento de ${SKILL_LABEL[a.skill]} amanhã (+1 nível).`, 'good');
      break;
    }
    case 'promote': {
      const p = s.people[a.personId];
      if (!p || !canPromote(p)) return;
      const next = SENIORITY_META[p.seniority].next!;
      p.seniority = next;
      p.salary = Math.round((p.salary * 1.2) / 100) * 100;
      p.morale = clamp(p.morale + 15, 0, 100);
      p.quality = clamp(p.quality + 3, 0, 99);
      log(s, '⭐', `${p.name} foi promovido(a) a ${SENIORITY_META[next].label}.`, 'good');
      break;
    }
    case 'vacation': {
      const p = s.people[a.personId];
      if (!p || p.absentDays > 0) return;
      p.absentDays = a.days;
      p.absentReason = 'Férias';
      p.energy = clamp(p.energy + 40, 0, 100);
      p.stress = clamp(p.stress - 45, 0, 100);
      p.morale = clamp(p.morale + 10, 0, 100);
      log(s, '🏖️', `${p.name} saiu de férias por ${a.days} dia(s).`, 'neutral');
      break;
    }
    case 'buyUpgrade': {
      const chk = upgradeAvailability(s, a.upgradeId);
      if (!chk.ok) return;
      s.cash -= chk.cost;
      s.costsTotal += chk.cost;
      s.upgrades[a.upgradeId] = (s.upgrades[a.upgradeId] ?? 0) + 1;
      s.counters.upgradesBought++;
      log(s, '🏗️', `Melhoria adquirida: ${UPGRADE_MAP[a.upgradeId].name} nível ${s.upgrades[a.upgradeId]}.`, 'good');
      break;
    }
    case 'resolveEvent': resolveEvent(s, rng, a.instanceId, a.choiceId); break;
    case 'dismissLesson':
      s.pendingLessons = s.pendingLessons.filter((l) => l !== a.lessonId);
      if (!s.lessons.includes(a.lessonId)) s.lessons.push(a.lessonId);
      break;
    case 'adviceAccepted': s.counters.adviceAccepted++; break;
    case 'clearNewAchievements': s.newAchievements = []; break;
    case 'endTutorial': s.tutorial = false; break;
    case 'processDay':
      if (s.phase !== 'planning') return;
      processDay(s);
      break;
  }
}

/** Ponto único de entrada de comandos — base para replays e multiplayer */
export function applyAction(state: GameState, action: GameAction): GameState {
  return produce(state, (draft) => {
    reducer(draft as GameState, action);
  });
}

export function applyActions(state: GameState, actions: GameAction[]): GameState {
  return actions.reduce(applyAction, state);
}
