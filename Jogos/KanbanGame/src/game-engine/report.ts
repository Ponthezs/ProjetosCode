import { STAGE_MAP, WORK_STAGES } from '../data/board';
import { RANKS } from '../data/difficulties';
import { avg, cycleTimeAvg, flowEfficiency, leadTimeAvg, teamMorale } from '../analytics/metrics';
import type { FinalReport, GameState, ScenarioGoal, WorkStage } from '../types';
import { getDifficulty } from './capacity';
import { scenarioOf } from './generator';

const fmtMoney = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
const f1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function goalValue(s: GameState, g: ScenarioGoal): number {
  switch (g.metric) {
    case 'profit': return s.revenueTotal - s.costsTotal;
    case 'revenue': return s.revenueTotal;
    case 'clientSat': return s.clientSatisfaction;
    case 'teamMorale': return teamMorale(s);
    case 'leadTime': return leadTimeAvg(s) ?? 99;
    case 'throughput': return s.history.length ? s.delivered.length / s.history.length : 0;
    case 'escapedBugs': return s.counters.bugsEscaped;
    case 'techDebt': return s.techDebt;
    case 'delivered': return s.delivered.length;
    case 'incidents': return Object.values(s.cards).filter((c) => c.type === 'incident').length;
  }
}

export function formatGoal(g: ScenarioGoal, v: number): string {
  if (g.metric === 'profit' || g.metric === 'revenue') return fmtMoney(v);
  if (g.metric === 'clientSat' || g.metric === 'teamMorale' || g.metric === 'techDebt') return `${Math.round(v)}%`;
  if (g.metric === 'leadTime') return `${f1(v)} dias`;
  if (g.metric === 'throughput') return `${f1(v)}/dia`;
  return `${Math.round(v)}`;
}

export function evaluateGoals(s: GameState) {
  return scenarioOf(s).goals.map((g) => {
    const v = goalValue(s, g);
    return { label: g.label, achieved: g.cmp === 'gte' ? v >= g.target : v <= g.target, value: formatGoal(g, v) };
  });
}

/** Relatório de gestão + retrospectiva educacional */
export function buildReport(s: GameState, bankrupt = false): FinalReport {
  const diff = getDifficulty(s);
  const days = Math.max(1, s.history.length);
  const profit = s.revenueTotal - s.costsTotal;
  const lead = leadTimeAvg(s) ?? 0;
  const cycle = cycleTimeAvg(s) ?? 0;
  const throughput = s.delivered.length / days;
  const avgWip = avg(s.history.map((h) => h.wip)) ?? 0;
  const flowEff = flowEfficiency(s) ?? 0;
  const morale = teamMorale(s);
  const blockedDays = Object.values(s.cards).reduce((a, c) => a + c.blockedDaysTotal, 0);
  const avgLimit = avg(s.history.map((h) => h.wipLimitTotal)) ?? 1;

  const bottleneckCounts: Partial<Record<WorkStage, number>> = {};
  for (const h of s.history) if (h.bottleneck) bottleneckCounts[h.bottleneck] = (bottleneckCounts[h.bottleneck] ?? 0) + 1;
  const mainBottleneck = (Object.entries(bottleneckCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as WorkStage | undefined) ?? null;
  const wipExceededDays = s.history.filter((h) => h.wipExceeded.length > 0).length;

  // ---------------- Score
  const norm = 30 / Math.max(10, s.totalDays);
  const parts = [
    { label: 'Receita', value: fmtMoney(s.revenueTotal), points: s.revenueTotal * 0.45 * norm },
    { label: 'Lucro', value: fmtMoney(profit), points: Math.max(-150000, profit) * 0.7 * norm },
    { label: 'Entregas', value: `${s.delivered.length}`, points: s.delivered.length * 3500 * norm },
    { label: 'Lead Time', value: `${f1(lead)} d`, points: s.delivered.length ? Math.max(0, 16 - lead) * 7000 : 0 },
    { label: 'Throughput', value: `${f1(throughput)}/dia`, points: throughput * 35000 },
    { label: 'Qualidade', value: `${s.counters.bugsEscaped} bugs em produção`, points: Math.max(-40000, 60000 - s.counters.bugsEscaped * 7000 - s.counters.reworkTotal * 800) },
    { label: 'Satisfação do cliente', value: `${Math.round(s.clientSatisfaction)}%`, points: s.clientSatisfaction * 1400 },
    { label: 'Satisfação da equipe', value: `${Math.round(morale)}%`, points: morale * 900 },
    { label: 'Dívida técnica', value: `${Math.round(s.techDebt)}%`, points: (100 - s.techDebt) * 550 },
    { label: 'Eficiência do fluxo', value: `${Math.round(flowEff * 100)}%`, points: flowEff * 70000 },
  ];
  const raw = parts.reduce((a, p) => a + p.points, 0);
  const score = Math.max(0, Math.round(raw * diff.scoreMult * (bankrupt ? 0.5 : 1)));
  const rank = RANKS.find((r) => score >= r.min) ?? RANKS[RANKS.length - 1];

  // ---------------- Diagnóstico principal
  type Problem = { key: string; weight: number; title: string; explanation: string };
  const problems: Problem[] = [];
  const wipRatio = avgWip / Math.max(1, avgLimit);
  if (wipExceededDays / days > 0.3 || wipRatio > 0.95) problems.push({ key: 'wip', weight: wipExceededDays / days + wipRatio, title: 'WIP elevado', explanation: `Em ${wipExceededDays} de ${days} dias algum estágio ultrapassou o limite de WIP (WIP médio ${f1(avgWip)}). O aumento do WIP fez mais tarefas permanecerem abertas simultaneamente, dividindo a atenção do time e aumentando o tempo médio de conclusão (Lei de Little: Lead Time = WIP ÷ Throughput).` });
  if (mainBottleneck && (bottleneckCounts[mainBottleneck] ?? 0) / days > 0.35) problems.push({ key: 'bottleneck', weight: (bottleneckCounts[mainBottleneck] ?? 0) / days + 0.3, title: `Gargalo em ${STAGE_MAP[mainBottleneck].name.toUpperCase()}`, explanation: `${STAGE_MAP[mainBottleneck].name} foi o gargalo em ${bottleneckCounts[mainBottleneck]} dias. Todo o sistema anda na velocidade do gargalo: trabalho acumulado antes dele só aumenta o Lead Time. Realocar pessoas para ajudar o gargalo ou reduzir a entrada teria aumentado a vazão.` });
  if (s.counters.bugsEscaped >= 5 || s.counters.reworkTotal >= 10) problems.push({ key: 'quality', weight: s.counters.bugsEscaped / 5 + s.counters.reworkTotal / 15, title: 'Qualidade baixa', explanation: `${s.counters.bugsEscaped} bugs chegaram à produção e houve ${s.counters.reworkTotal} retrabalhos. Cada defeito volta para o fluxo como trabalho não planejado, consome capacidade e reduz a satisfação do cliente. Investir em testes e code review diminui o custo total.` });
  if (blockedDays / Math.max(1, s.delivered.length) > 1.5) problems.push({ key: 'blocks', weight: blockedDays / Math.max(1, s.delivered.length) / 2, title: 'Muitos bloqueios', explanation: `Os cards passaram ${blockedDays} dias bloqueados no total. Tempo bloqueado é tempo de espera puro: aumenta o Lead Time sem gerar valor. Escalar bloqueios e evitar puxar cards com dependências abertas reduz esse desperdício.` });
  if (morale < 55 || s.counters.burnouts > 0) problems.push({ key: 'people', weight: (60 - morale) / 20 + s.counters.burnouts * 0.5, title: 'Equipe sobrecarregada', explanation: `A moral terminou em ${Math.round(morale)}% com ${s.counters.burnouts} caso(s) de burnout. Ritmo insustentável reduz a capacidade real e aumenta defeitos — manter todos 100% ocupados não maximiza o fluxo.` });
  if (s.techDebt > 55) problems.push({ key: 'debt', weight: s.techDebt / 60, title: 'Dívida técnica alta', explanation: `A dívida técnica terminou em ${Math.round(s.techDebt)}%. Ela reduz a produtividade em desenvolvimento e review e aumenta a probabilidade de bugs. Cards intangíveis de refatoração pagam essa dívida.` });
  if (s.counters.slaBreaches >= 4) problems.push({ key: 'sla', weight: s.counters.slaBreaches / 6, title: 'SLAs violados', explanation: `${s.counters.slaBreaches} demandas ultrapassaram o SLA. Priorizar pela classe de serviço e manter o fluxo curto protege os compromissos com o cliente.` });
  problems.sort((a, b) => b.weight - a.weight);
  const main = problems[0] ?? { key: 'none', weight: 0, title: 'Fluxo saudável', explanation: 'Nenhum problema estrutural grave foi detectado. O time manteve WIP controlado, entregas constantes e qualidade adequada. Continue buscando reduzir o tempo de espera entre estágios.' };

  // ---------------- Retrospectiva
  const worked: string[] = [];
  const improve: string[] = [];
  const recs: string[] = [];
  const specialistShare = specialistUtilization(s);
  if (specialistShare > 0.7) worked.push('Boa utilização de especialistas nos seus estágios');
  if (wipExceededDays / days < 0.2) worked.push('WIP controlado na maior parte da partida');
  else {
    improve.push('Muitas tarefas foram iniciadas ao mesmo tempo');
    recs.push('Reduza os limites de WIP e pare de puxar quando não houver capacidade downstream.');
  }
  const wipAnalysisOver = s.history.filter((h) => h.wipExceeded.includes('analysis')).length;
  if (wipAnalysisOver === 0 && days > 3) worked.push('WIP controlado em Análise');
  if (s.counters.bugsEscaped <= 2) worked.push('Poucos bugs em produção');
  else {
    improve.push(`${s.counters.bugsEscaped} bugs escaparam para produção`);
    recs.push('Proteja o estágio de Testes: um QA dedicado e automação de testes reduzem bugs escapados.');
  }
  if (mainBottleneck) {
    improve.push(`${STAGE_MAP[mainBottleneck].name} se tornou gargalo`);
    recs.push(`Ajude o gargalo: desloque pessoas para ${STAGE_MAP[mainBottleneck].name} quando a fila crescer.`);
  }
  if (s.techDebt > 40) {
    improve.push('Dívida técnica aumentou');
    recs.push('Reserve capacidade contínua para cards de dívida técnica (classe Intangible).');
  } else worked.push('Dívida técnica sob controle');
  if (s.clientSatisfaction >= 75) worked.push('Clientes satisfeitos com as entregas');
  else improve.push('Satisfação do cliente abaixo do ideal');
  if (morale >= 70) worked.push('Equipe motivada e com ritmo sustentável');
  if (s.counters.incidentsResolved >= 2) worked.push(`${s.counters.incidentsResolved} incidentes resolvidos`);
  if (blockedDays > s.delivered.length * 1.5) {
    improve.push('Bloqueios ficaram muito tempo sem tratamento');
    recs.push('Escale bloqueios cedo e gerencie dependências antes de puxar o card.');
  }
  if (lead > 0 && cycle > 0 && lead - cycle > 3) recs.push('O tempo em Ready está alto: comprometa-se com menos demandas por vez.');
  if (flowEff < 0.4 && s.delivered.length) recs.push('A eficiência do fluxo está baixa — os cards passam mais tempo esperando do que sendo trabalhados.');
  recs.push('Evite iniciar trabalho quando não existe capacidade downstream. Fluxo > utilização individual.');
  if (!worked.length) worked.push('O time concluiu a partida — use os dados para evoluir o processo');

  const goals = evaluateGoals(s);
  const stars = goals.filter((g) => g.achieved).length;

  return {
    score, rank: { id: rank.id, name: rank.name, icon: rank.icon, color: rank.color }, breakdown: parts.map((p) => ({ ...p, points: Math.round(p.points * diff.scoreMult) })),
    metrics: {
      revenue: s.revenueTotal, costs: s.costsTotal, profit, roi: s.costsTotal ? profit / s.costsTotal : 0, delivered: s.delivered.length,
      valuePoints: s.valuePoints, leadTime: lead, cycleTime: cycle, throughput, avgWip, rework: s.counters.reworkTotal, bugsFound: s.counters.bugsFound,
      escapedBugs: s.counters.bugsEscaped, clientSat: s.clientSatisfaction, teamMorale: morale, techDebt: s.techDebt, flowEfficiency: flowEff,
      slaBreaches: s.counters.slaBreaches, blockedDays,
    },
    mainBottleneck, bottleneckCounts, mainProblem: { title: bankrupt ? 'Falência do projeto' : main.title, explanation: bankrupt ? `O caixa chegou a ${fmtMoney(s.cash)}. ${main.explanation}` : main.explanation },
    worked: worked.slice(0, 5), improve: improve.slice(0, 5), recommendations: [...new Set(recs)].slice(0, 5), goals, stars,
  };
}

function specialistUtilization(s: GameState): number {
  const ps = s.peopleOrder.map((id) => s.people[id]).filter(Boolean);
  if (!ps.length) return 0;
  const good = ps.filter((p) => p.stage && WORK_STAGES.includes(p.stage) && ['analysis', 'dev', 'review', 'test', 'uat', 'deploy'].includes(p.stage) && isSpecialist(p.role, p.stage)).length;
  return good / ps.length;
}

function isSpecialist(role: string, stage: WorkStage): boolean {
  const map: Record<string, WorkStage[]> = {
    analyst: ['analysis', 'uat'], frontend: ['dev', 'review'], backend: ['dev', 'review'], fullstack: ['dev', 'review'], qa: ['test', 'uat'],
    devops: ['deploy'], ux: ['analysis', 'uat'], architect: ['review', 'analysis', 'dev'], dba: ['dev', 'deploy'], po: ['uat', 'analysis'],
  };
  return map[role]?.includes(stage) ?? false;
}
