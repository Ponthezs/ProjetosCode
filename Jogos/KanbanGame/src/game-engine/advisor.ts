/* FLOW AI — consultor baseado em regras que analisa o quadro com dados reais */
import { STAGE_MAP, WORK_STAGES } from '../data/board';
import {
  avg, blockedCards, cardsIn, detectBottleneck, openIncidents, percentile, slaAtRisk, throughputAvg, totalWip, wipCount, wipExceededStages,
} from '../analytics/metrics';
import type { GameAction, GameState, Insight, Person, WorkStage } from '../types';
import { burnoutRisk, expectedCapacity, upgradeValue } from './capacity';

const pct = (v: number) => `${Math.round(v * 100)}%`;
const f1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function bestHelperFor(s: GameState, stage: WorkStage, exclude: WorkStage | null): Person | null {
  const stats = detectBottleneck(s).stats;
  const candidates = s.peopleOrder
    .map((id) => s.people[id])
    .filter((p): p is Person => !!p && p.absentDays <= 0 && p.stage !== stage && p.stage !== exclude)
    .filter((p) => !p.stage || (stats[p.stage].loadDays < 1 && (stats[p.stage].people > 1 || stats[p.stage].active === 0)))
    .filter((p) => expectedCapacity(s, p, stage) >= 2);
  candidates.sort((a, b) => expectedCapacity(s, b, stage) - expectedCapacity(s, a, stage));
  return candidates[0] ?? null;
}

export function generateInsights(s: GameState): Insight[] {
  const out: Insight[] = [];
  if (s.phase !== 'planning') return out;
  const { stage: bn, stats } = detectBottleneck(s);

  // 1. Tendência de cycle time
  const recent = s.delivered.filter((d) => s.day - d.day <= 4);
  const before = s.delivered.filter((d) => s.day - d.day > 4 && s.day - d.day <= 8);
  const ra = avg(recent.map((d) => d.cycleTime));
  const ba = avg(before.map((d) => d.cycleTime));
  if (ra && ba && recent.length >= 2 && before.length >= 2 && ra > ba * 1.2) {
    const worst = [...WORK_STAGES].sort((a, b) => wipCount(s, b) / s.wipLimits[b] - wipCount(s, a) / s.wipLimits[a])[0];
    out.push({
      id: 'ct-trend', severity: 'warning', title: 'Cycle Time subindo',
      message: `Detectei aumento de ${pct(ra / ba - 1)} no Cycle Time durante os últimos 4 dias.`,
      cause: `WIP elevado em ${STAGE_MAP[worst].name} (${wipCount(s, worst)}/${s.wipLimits[worst]}).`,
      suggestion: bn ? `Reduza a entrada de novos cards e ajude o setor de ${STAGE_MAP[bn].name}.` : 'Reduza a entrada de novos cards e finalize o trabalho em andamento.',
      action: { label: 'Focar em terminar', actions: [{ type: 'setFocus', focus: 'flow' }] },
    });
  }

  // 2. Estágio com trabalho e ninguém alocado
  for (const st of WORK_STAGES) {
    const x = stats[st];
    if (x.count > 0 && x.active > 0 && x.people === 0) {
      const helper = bestHelperFor(s, st, null);
      out.push({
        id: `nobody-${st}`, severity: 'critical', title: `Ninguém em ${STAGE_MAP[st].name}`,
        message: `${x.active} card(s) aguardam trabalho em ${STAGE_MAP[st].name}, mas não há ninguém alocado.`,
        cause: 'Sem capacidade no estágio, todo o fluxo a jusante para.',
        suggestion: helper ? `Mova ${helper.name} para ${STAGE_MAP[st].name}.` : 'Contrate ou realoque alguém.',
        action: helper ? { label: `Mover ${helper.name.split(' ')[0]}`, actions: [{ type: 'assignPerson', personId: helper.id, stage: st }] } : undefined,
      });
    }
  }

  // 3. Gargalo
  if (bn) {
    const helper = bestHelperFor(s, bn, bn);
    const x = stats[bn];
    out.push({
      id: `bn-${bn}`, severity: 'warning', title: `Gargalo detectado em ${STAGE_MAP[bn].name.toUpperCase()}`,
      message: `${STAGE_MAP[bn].name} tem ~${f1(Math.min(x.loadDays, 20))} dias de trabalho acumulado${x.queueBefore ? ` e ${x.queueBefore} card(s) esperando para entrar` : ''}.`,
      cause: x.people === 0 ? 'Nenhuma pessoa alocada.' : `Capacidade de ${f1(x.capacity)} pts/dia para ${f1(x.remaining)} pts restantes.`,
      suggestion: helper ? `Desloque ${helper.name} (${f1(expectedCapacity(s, helper, bn))} pts/dia previstos) para ajudar o gargalo.` : 'Pare de puxar trabalho novo até o gargalo aliviar.',
      action: helper ? { label: `Realocar ${helper.name.split(' ')[0]}`, actions: [{ type: 'assignPerson', personId: helper.id, stage: bn }] } : { label: 'Focar em terminar', actions: [{ type: 'setFocus', focus: 'flow' }] },
    });
  }

  // 4. WIP excedido
  const exceeded = wipExceededStages(s);
  if (exceeded.length) {
    out.push({
      id: 'wip-exceeded', severity: 'warning', title: 'WIP excedido',
      message: `Limite de WIP ultrapassado em ${exceeded.map((st) => STAGE_MAP[st].name).join(', ')}.`,
      cause: 'Mais trabalho simultâneo = mais troca de contexto, mais bugs e lead time maior.',
      suggestion: 'Não puxe novos cards para esses estágios até que algo seja concluído.',
      action: s.settings.focus !== 'flow' ? { label: 'Focar em terminar', actions: [{ type: 'setFocus', focus: 'flow' }] } : undefined,
    });
  }

  // 5. Ready vazio — replenishment
  const readyN = cardsIn(s, 'ready').length;
  if (readyN === 0 && cardsIn(s, 'backlog').length && stats.analysis.count < s.wipLimits.analysis) {
    const top = cardsIn(s, 'backlog')
      .slice()
      .sort((a, b) => (b.serviceClass === 'expedite' ? 1 : 0) - (a.serviceClass === 'expedite' ? 1 : 0) || b.value / b.complexity - a.value / a.complexity)
      .slice(0, Math.min(2, s.wipLimits.ready));
    out.push({
      id: 'ready-empty', severity: 'info', title: 'Fila Ready vazia',
      message: 'Não há demandas comprometidas prontas para serem puxadas. A Análise vai ficar ociosa.',
      suggestion: `Priorize ${top.map((c) => c.code).join(' e ')} (maior valor por esforço).`,
      action: { label: 'Priorizar', actions: top.map((c): GameAction => ({ type: 'moveCard', cardId: c.id, to: 'ready' })) },
    });
  }

  // 6. Incidentes abertos
  const inc = openIncidents(s);
  if (inc.length) {
    out.push({
      id: 'incidents', severity: 'critical', title: `${inc.length} incidente(s) aberto(s)`,
      message: 'Cada dia com incidente aberto reduz a satisfação do cliente e a receita.',
      suggestion: 'Coloque o foco do time em apagar incêndios até resolver.',
      action: s.settings.focus !== 'firefight' ? { label: 'Apagar incêndios', actions: [{ type: 'setFocus', focus: 'firefight' }] } : undefined,
    });
  }

  // 7. SLA em risco
  const risk = slaAtRisk(s).filter((c) => c.stage !== 'done');
  if (risk.length) {
    const c = risk[0];
    out.push({
      id: 'sla-risk', severity: 'warning', title: `${risk.length} SLA(s) em risco`,
      message: `${c.code} "${c.title}" está perto de estourar o prazo.`,
      suggestion: 'Coloque-o no topo da coluna para ser trabalhado primeiro.',
      action: { label: 'Priorizar card', actions: [{ type: 'reorderCard', cardId: c.id, index: 0 }] },
    });
  }

  // 8. Burnout
  const tired = s.peopleOrder.map((id) => s.people[id]).filter((p): p is Person => !!p && p.absentDays <= 0 && burnoutRisk(p) >= 68);
  if (tired.length) {
    const p = tired.sort((a, b) => burnoutRisk(b) - burnoutRisk(a))[0];
    out.push({
      id: `burnout-${p.id}`, severity: 'warning', title: 'Risco de burnout',
      message: `${p.name} está com risco de burnout de ${burnoutRisk(p)}%.`,
      cause: 'Trabalho constante acima da capacidade, estresse e pouca recuperação.',
      suggestion: 'Uma folga curta agora evita um afastamento longo depois.',
      action: { label: 'Dar 2 dias de folga', actions: [{ type: 'vacation', personId: p.id, days: 2 }] },
    });
  }

  // 9. Lei de Little: iniciando mais do que termina
  const last5 = s.history.slice(-5);
  const started = last5.reduce((a, h) => a + h.started, 0);
  const finished = last5.reduce((a, h) => a + h.throughput, 0);
  if (last5.length >= 4 && started >= finished + 4) {
    out.push({
      id: 'littles', severity: 'warning', title: 'Começando mais do que terminando',
      message: `Nos últimos ${last5.length} dias o time iniciou ${started} cards e terminou ${finished}.`,
      cause: 'Pela Lei de Little, se o WIP cresce e o throughput não, o lead time aumenta.',
      suggestion: 'Reduza o limite de WIP da Análise para controlar a entrada.',
      action: { label: `WIP Análise → ${Math.max(1, s.wipLimits.analysis - 1)}`, actions: [{ type: 'setWip', stage: 'analysis', limit: Math.max(1, s.wipLimits.analysis - 1) }] },
    });
  }

  // 10. Bloqueios
  const blocked = blockedCards(s).filter((c) => c.blocked);
  if (blocked.length >= 2) {
    const worst = blocked.sort((a, b) => (b.blocked?.daysLeft ?? 0) - (a.blocked?.daysLeft ?? 0))[0];
    out.push({
      id: 'blocked', severity: 'info', title: `${blocked.length} cards bloqueados`,
      message: `${worst.code} está bloqueado: ${worst.blocked?.reason} (${worst.blocked?.daysLeft} dia(s) restantes).`,
      suggestion: 'Escalar o bloqueio custa R$ 2.500 e reduz 1 dia de espera.',
      action: { label: 'Escalar bloqueio', actions: [{ type: 'escalateBlock', cardId: worst.id }] },
    });
  }

  // 11. Dívida técnica
  if (s.techDebt >= 50) {
    const debt = cardsIn(s, 'backlog').find((c) => c.type === 'techdebt');
    out.push({
      id: 'debt', severity: 'warning', title: `Dívida técnica em ${Math.round(s.techDebt)}%`,
      message: 'A dívida técnica está reduzindo a produtividade de Dev/Review e aumentando defeitos.',
      suggestion: debt ? `Priorize ${debt.code} "${debt.title}".` : 'Invista em Análise Estática ou Guilda de Refatoração.',
      action: debt ? { label: 'Priorizar refatoração', actions: [{ type: 'moveCard', cardId: debt.id, to: 'ready' }] } : undefined,
    });
  }

  // 12. Pessoas ociosas sem gargalo — educacional
  const idle = s.peopleOrder.map((id) => s.people[id]).filter((p): p is Person => !!p && p.absentDays <= 0 && !!p.stage && p.lastUtilization < 0.25 && s.day > 2);
  if (idle.length && !bn) {
    out.push({
      id: 'idle-ok', severity: 'info', title: 'Folga no sistema',
      message: `${idle.map((p) => p.name.split(' ')[0]).join(', ')} tiveram pouco trabalho ontem.`,
      cause: 'Folga não é desperdício: capacidade livre absorve variações e expedites.',
      suggestion: 'Em vez de iniciar mais trabalho, use a folga para ajudar estágios a jusante ou treinar.',
    });
  }

  // 13. Caixa
  if (s.cash < 30000) {
    out.push({
      id: 'cash', severity: s.cash < 0 ? 'critical' : 'warning', title: 'Caixa baixo',
      message: `O caixa está em R$ ${Math.round(s.cash).toLocaleString('pt-BR')}.`,
      suggestion: 'Priorize entregas de alto valor e evite horas extras e contratações agora.',
      action: s.settings.overtime ? { label: 'Desligar hora extra', actions: [{ type: 'setOvertime', value: false }] } : undefined,
    });
  }

  // 14. Previsão probabilística (melhoria de IA ou após 5 dias)
  if (s.history.length >= 5) {
    const tp = throughputAvg(s, 7);
    const remainingDays = s.totalDays - s.day + 1;
    const cts = s.delivered.map((d) => d.cycleTime);
    const p85 = percentile(cts, 85);
    const advanced = upgradeValue(s, 'advisor') > 0;
    out.push({
      id: 'forecast', severity: 'positive', title: advanced ? 'Previsão (Monte Carlo simplificado)' : 'Previsão de entrega',
      message: `Mantido o throughput de ${f1(tp)} cards/dia, o time deve entregar ~${Math.round(tp * remainingDays)} cards nos ${remainingDays} dias restantes.`,
      cause: p85 ? `85% dos cards foram concluídos em até ${p85} dias de cycle time.` : undefined,
      suggestion: advanced ? `WIP atual: ${totalWip(s)}. Lead time previsto pela Lei de Little: ${tp > 0 ? f1(totalWip(s) / tp) : '—'} dias.` : undefined,
    });
  }

  if (!out.length || out.every((i) => i.severity === 'positive' || i.severity === 'info')) {
    out.unshift({ id: 'healthy', severity: 'positive', title: 'Fluxo saudável', message: 'WIP sob controle, sem gargalos críticos. Continue puxando trabalho apenas quando houver capacidade.' });
  }
  const order = { critical: 0, warning: 1, info: 2, positive: 3 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
