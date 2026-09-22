import { leadTimeAvg, teamMorale, throughputAvg, cycleTimeAvg, openIncidents } from '../analytics/metrics';
import type { AchievementDef } from '../types';

const ended = (s: { phase: string }) => s.phase === 'ended';

/** 30 conquistas */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-delivery', name: 'PRIMEIRA ENTREGA', description: 'Conclua sua primeira demanda.', icon: '📦', tier: 'bronze', check: (s) => s.delivered.length >= 1 },
  { id: 'flow-master', name: 'FLOW MASTER', description: 'Complete 10 dias seguidos sem ultrapassar o WIP.', icon: '🌊', tier: 'gold', check: (s) => s.counters.consecutiveWipOk >= 10 },
  { id: 'zero-bugs', name: 'ZERO BUGS', description: '5 entregas seguidas sem bugs escapados.', icon: '🐛', tier: 'silver', check: (s) => s.counters.maxCleanStreak >= 5 },
  { id: 'speed-delivery', name: 'SPEED DELIVERY', description: 'Lead Time médio abaixo de 4 dias (mín. 5 entregas).', icon: '⚡', tier: 'gold', check: (s) => s.delivered.length >= 5 && (leadTimeAvg(s) ?? 99) < 4 },
  { id: 'fire-fighter', name: 'FIRE FIGHTER', description: 'Resolva 5 incidentes.', icon: '🧯', tier: 'silver', check: (s) => s.counters.incidentsResolved >= 5 },
  { id: 'happy-team', name: 'HAPPY TEAM', description: 'Mantenha a moral da equipe acima de 90% por 3 dias.', icon: '❤️', tier: 'gold', check: (s) => s.counters.daysHappyTeam >= 3 },
  { id: 'ten-deliveries', name: 'LINHA DE PRODUÇÃO', description: 'Entregue 10 demandas.', icon: '🏭', tier: 'bronze', check: (s) => s.delivered.length >= 10 },
  { id: 'fifty-deliveries', name: 'MÁQUINA DE ENTREGAS', description: 'Entregue 30 demandas em uma partida.', icon: '🚂', tier: 'gold', check: (s) => s.delivered.length >= 30 },
  { id: 'hundred-k', name: 'SEIS DÍGITOS', description: 'Gere R$ 100 mil em receita.', icon: '💵', tier: 'bronze', check: (s) => s.revenueTotal >= 100000 },
  { id: 'half-million', name: 'MEIO MILHÃO', description: 'Gere R$ 500 mil em receita.', icon: '💰', tier: 'gold', check: (s) => s.revenueTotal >= 500000 },
  { id: 'profitable', name: 'NO AZUL', description: 'Termine uma partida com lucro.', icon: '📈', tier: 'bronze', check: (s) => ended(s) && s.revenueTotal - s.costsTotal > 0 },
  { id: 'client-love', name: 'CLIENTE ENCANTADO', description: 'Satisfação do cliente acima de 90%.', icon: '😍', tier: 'silver', check: (s) => s.clientSatisfaction >= 90 },
  { id: 'debt-slayer', name: 'CAÇADOR DE DÍVIDAS', description: 'Entregue 5 cards de dívida técnica.', icon: '🗡️', tier: 'silver', check: (s) => s.counters.techDebtPaid >= 5 },
  { id: 'clean-code', name: 'CÓDIGO LIMPO', description: 'Termine com dívida técnica abaixo de 10%.', icon: '✨', tier: 'gold', check: (s) => ended(s) && s.techDebt < 10 },
  { id: 'expedite-hero', name: 'HERÓI DO EXPEDITE', description: 'Entregue 5 cards Expedite.', icon: '🚀', tier: 'silver', check: (s) => s.counters.expediteDelivered >= 5 },
  { id: 'on-time', name: 'PONTUAL', description: 'Entregue 3 cards Fixed Date dentro do prazo.', icon: '📅', tier: 'silver', check: (s) => s.counters.fixedOnTime >= 3 },
  { id: 'bug-hunter', name: 'CAÇADOR DE BUGS', description: 'Encontre 15 bugs antes da produção.', icon: '🔎', tier: 'silver', check: (s) => s.counters.bugsFound >= 15 },
  { id: 'no-breach', name: 'SLA DE OURO', description: 'Termine sem nenhuma violação de SLA (mín. 10 entregas).', icon: '🏅', tier: 'platinum', check: (s) => ended(s) && s.counters.slaBreaches === 0 && s.delivered.length >= 10 },
  { id: 'recruiter', name: 'RECRUTADOR', description: 'Contrate 3 profissionais.', icon: '🤝', tier: 'bronze', check: (s) => s.counters.hires >= 3 },
  { id: 'teacher', name: 'EDUCADOR', description: 'Realize 5 treinamentos.', icon: '🎓', tier: 'silver', check: (s) => s.counters.trainings >= 5 },
  { id: 'investor', name: 'INVESTIDOR', description: 'Compre 5 melhorias de empresa.', icon: '🏗️', tier: 'silver', check: (s) => s.counters.upgradesBought >= 5 },
  { id: 'listener', name: 'BOM OUVINTE', description: 'Aceite 5 sugestões do FLOW AI.', icon: '🤖', tier: 'bronze', check: (s) => s.counters.adviceAccepted >= 5 },
  { id: 'unblocker', name: 'DESBLOQUEADOR', description: 'Escale 5 bloqueios.', icon: '🔓', tier: 'bronze', check: (s) => s.counters.blocksEscalated >= 5 },
  { id: 'big-day', name: 'DIA HISTÓRICO', description: 'Entregue 4 cards no mesmo dia.', icon: '🎆', tier: 'silver', check: (s) => s.counters.maxDeliveriesInDay >= 4 },
  { id: 'no-overtime', name: 'RITMO SUSTENTÁVEL', description: 'Termine uma partida de 15+ dias sem hora extra.', icon: '🧘', tier: 'silver', check: (s) => ended(s) && s.totalDays >= 15 && s.counters.overtimeDays === 0 },
  { id: 'high-throughput', name: 'VAZÃO ALTA', description: 'Throughput médio de 2 cards/dia em 5 dias.', icon: '🌪️', tier: 'gold', check: (s) => s.history.length >= 5 && throughputAvg(s, 5) >= 2 },
  { id: 'short-cycle', name: 'CICLO CURTO', description: 'Cycle Time médio abaixo de 3 dias (mín. 8 entregas).', icon: '⏱️', tier: 'gold', check: (s) => s.delivered.length >= 8 && (cycleTimeAvg(s) ?? 99) < 3 },
  { id: 'survivor', name: 'SOBREVIVENTE', description: 'Termine o Chaos Mode.', icon: '🌋', tier: 'platinum', check: (s) => ended(s) && s.mode === 'chaos' },
  { id: 'calm-ops', name: 'OPERAÇÃO TRANQUILA', description: '10 dias sem incidentes abertos.', icon: '🕊️', tier: 'silver', check: (s) => s.counters.daysNoIncident >= 10 && openIncidents(s).length === 0 },
  { id: 'people-first', name: 'PESSOAS PRIMEIRO', description: 'Termine com moral da equipe acima de 80%.', icon: '🫶', tier: 'gold', check: (s) => ended(s) && teamMorale(s) >= 80 },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<string, AchievementDef>;

export const TIER_COLOR: Record<AchievementDef['tier'], string> = {
  bronze: '#d97706',
  silver: '#cbd5e1',
  gold: '#fbbf24',
  platinum: '#67e8f9',
};
