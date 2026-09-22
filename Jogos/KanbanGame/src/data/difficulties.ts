import type { DifficultyDef, GameModeDef } from '../types';

export const DIFFICULTIES: DifficultyDef[] = [
  { id: 'easy', name: 'Fácil', description: 'Poucos eventos, capacidade generosa e clientes pacientes. Ideal para aprender.', eventRate: 0.45, capacityMult: 1.2, variance: 0.12, dependencyChance: 0.05, blockChance: 0.02, clientStrictness: 0.7, defectMult: 0.7, arrivalMult: 0.85, startingCashMult: 1.4, scoreMult: 0.7, color: '#34d399' },
  { id: 'normal', name: 'Normal', description: 'Experiência equilibrada entre planejamento e imprevistos.', eventRate: 0.7, capacityMult: 1, variance: 0.2, dependencyChance: 0.12, blockChance: 0.035, clientStrictness: 1, defectMult: 1, arrivalMult: 1, startingCashMult: 1, scoreMult: 1, color: '#60a5fa' },
  { id: 'hard', name: 'Difícil', description: 'Mais eventos, dependências e clientes exigentes.', eventRate: 0.95, capacityMult: 0.92, variance: 0.28, dependencyChance: 0.2, blockChance: 0.05, clientStrictness: 1.25, defectMult: 1.2, arrivalMult: 1.1, startingCashMult: 0.85, scoreMult: 1.3, color: '#fbbf24' },
  { id: 'expert', name: 'Expert', description: 'Pressão constante. Cada decisão importa.', eventRate: 1.2, capacityMult: 0.85, variance: 0.35, dependencyChance: 0.28, blockChance: 0.065, clientStrictness: 1.5, defectMult: 1.4, arrivalMult: 1.2, startingCashMult: 0.7, scoreMult: 1.6, color: '#f97316' },
  { id: 'realistic', name: 'Simulação Realista', description: 'Alta variabilidade, requisitos imprevisíveis e o caos do mundo real.', eventRate: 1.45, capacityMult: 0.8, variance: 0.45, dependencyChance: 0.35, blockChance: 0.08, clientStrictness: 1.7, defectMult: 1.55, arrivalMult: 1.25, startingCashMult: 0.6, scoreMult: 2, color: '#ef4444' },
];

export const GAME_MODES: GameModeDef[] = [
  { id: 'campaign', name: 'Campanha', description: 'Cenários progressivos. Complete um para desbloquear o próximo.', days: null, eventMult: 1, varianceMult: 1, icon: 'Map' },
  { id: 'quick', name: 'Quick Game', description: 'Partida rápida de 15 dias.', days: 15, eventMult: 1, varianceMult: 1, icon: 'Zap' },
  { id: 'standard', name: 'Standard', description: 'Partida completa de 30 dias.', days: 30, eventMult: 1, varianceMult: 1, icon: 'Target' },
  { id: 'marathon', name: 'Marathon', description: '60 dias. Teste de sustentabilidade do time.', days: 60, eventMult: 1, varianceMult: 1, icon: 'Infinity' },
  { id: 'challenge', name: 'Desafio', description: 'Cenário difícil com metas agressivas e dificuldade mínima Expert.', days: 25, eventMult: 1.25, varianceMult: 1.2, icon: 'Swords' },
  { id: 'chaos', name: 'Chaos Mode', description: 'Eventos extremos em sequência. Sobreviva.', days: 20, eventMult: 2.6, varianceMult: 1.5, icon: 'Flame' },
  { id: 'sandbox', name: 'Sandbox', description: 'Configuração livre de cenário, dificuldade, duração e seed.', days: null, eventMult: 1, varianceMult: 1, icon: 'Dices' },
];

export const RANKS = [
  { id: 'master', name: 'FLOW MASTER', icon: '🥇', color: '#fbbf24', min: 950000 },
  { id: 'expert', name: 'AGILE EXPERT', icon: '🥈', color: '#cbd5e1', min: 700000 },
  { id: 'pro', name: 'DELIVERY PRO', icon: '🥉', color: '#f59e0b', min: 450000 },
  { id: 'lead', name: 'TEAM LEAD', icon: '🎖️', color: '#60a5fa', min: 250000 },
  { id: 'rookie', name: 'ROOKIE MANAGER', icon: '🔰', color: '#94a3b8', min: -Infinity },
];
