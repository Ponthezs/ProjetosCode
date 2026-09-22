import type { UpgradeDef } from '../types';

/** 20 melhorias de empresa (Skill Tree) */
export const UPGRADES: UpgradeDef[] = [
  // ---- QUALIDADE
  { id: 'test-automation', name: 'Automação de Testes', branch: 'quality', icon: 'FlaskConical', maxLevel: 3, baseCost: 18000,
    description: 'Suítes automatizadas aceleram os testes e pegam mais defeitos.',
    effects: [{ key: 'testCapacity', perLevel: 0.15 }, { key: 'detection', perLevel: 0.05 }],
    levelText: ['Testes +15% / detecção +5%', 'Testes +30% / detecção +10%', 'Testes +45% / detecção +15%'] },
  { id: 'pair-programming', name: 'Pair Programming', branch: 'quality', icon: 'Users', maxLevel: 2, baseCost: 12000,
    description: 'Duas cabeças pensam melhor: menos defeitos gerados no desenvolvimento.',
    effects: [{ key: 'defectChance', perLevel: 0.12 }],
    levelText: ['Defeitos -12%', 'Defeitos -24%'] },
  { id: 'code-review', name: 'Code Review Estruturado', branch: 'quality', icon: 'GitPullRequest', maxLevel: 3, baseCost: 10000,
    description: 'Checklists e revisores designados tornam o review mais rápido e eficaz.',
    effects: [{ key: 'reviewCapacity', perLevel: 0.15 }, { key: 'detection', perLevel: 0.04 }],
    levelText: ['Review +15%', 'Review +30%', 'Review +45%'] },
  { id: 'bdd', name: 'BDD / Critérios de Aceite', branch: 'quality', icon: 'ListChecks', maxLevel: 2, baseCost: 11000,
    description: 'Especificação por exemplos reduz ambiguidade e defeitos.',
    effects: [{ key: 'analysisCapacity', perLevel: 0.08 }, { key: 'defectChance', perLevel: 0.08 }],
    levelText: ['Análise +8% / defeitos -8%', 'Análise +16% / defeitos -16%'] },
  { id: 'static-analysis', name: 'Análise Estática', branch: 'quality', icon: 'Search', maxLevel: 2, baseCost: 9000, requires: ['code-review'],
    description: 'Linters e scanners detectam problemas antes do review.',
    effects: [{ key: 'defectChance', perLevel: 0.1 }, { key: 'techDebtDecay', perLevel: 0.1 }],
    levelText: ['Defeitos -10%', 'Defeitos -20%'] },
  { id: 'refactoring-guild', name: 'Guilda de Refatoração', branch: 'quality', icon: 'Hammer', maxLevel: 3, baseCost: 14000, requires: ['static-analysis'],
    description: 'Tempo dedicado para pagar dívida técnica continuamente.',
    effects: [{ key: 'techDebtDecay', perLevel: 0.25 }],
    levelText: ['Dívida -0,25/dia', 'Dívida -0,5/dia', 'Dívida -0,75/dia'] },

  // ---- ENTREGA
  { id: 'ci-cd', name: 'CI/CD', branch: 'delivery', icon: 'GitBranch', maxLevel: 3, baseCost: 16000,
    description: 'Pipelines automatizados reduzem o esforço de deploy.',
    effects: [{ key: 'deployEffort', perLevel: 0.175 }],
    levelText: ['Deploy -17,5% tempo', 'Deploy -35% tempo', 'Deploy -52,5% tempo'] },
  { id: 'devops-culture', name: 'Cultura DevOps', branch: 'delivery', icon: 'Infinity', maxLevel: 2, baseCost: 15000, requires: ['ci-cd'],
    description: 'Times donos do ciclo completo: menos esperas e bloqueios de ambiente.',
    effects: [{ key: 'deployEffort', perLevel: 0.1 }, { key: 'blockChance', perLevel: 0.1 }],
    levelText: ['Deploy -10% / bloqueios -10%', 'Deploy -20% / bloqueios -20%'] },
  { id: 'feature-flags', name: 'Feature Flags', branch: 'delivery', icon: 'Flag', maxLevel: 2, baseCost: 12000, requires: ['ci-cd'],
    description: 'Libere funcionalidades gradualmente e reduza o impacto de falhas.',
    effects: [{ key: 'uatCapacity', perLevel: 0.15 }, { key: 'incidentImpact', perLevel: 0.1 }],
    levelText: ['Homologação +15%', 'Homologação +30%'] },
  { id: 'api-contracts', name: 'Contratos de API', branch: 'delivery', icon: 'Network', maxLevel: 2, baseCost: 11000,
    description: 'Contratos e mocks reduzem bloqueios de integração.',
    effects: [{ key: 'blockChance', perLevel: 0.12 }, { key: 'blockDuration', perLevel: 0.5 }],
    levelText: ['Bloqueios -12%', 'Bloqueios -24%'] },
  { id: 'documentation', name: 'Documentação Viva', branch: 'delivery', icon: 'BookOpen', maxLevel: 2, baseCost: 8000,
    description: 'Conhecimento acessível acelera análises e onboarding.',
    effects: [{ key: 'analysisCapacity', perLevel: 0.1 }, { key: 'onboarding', perLevel: 0.2 }],
    levelText: ['Análise +10%', 'Análise +20%'] },

  // ---- OPERAÇÕES
  { id: 'monitoring', name: 'Monitoramento', branch: 'ops', icon: 'Activity', maxLevel: 2, baseCost: 13000,
    description: 'Alertas detectam problemas antes do cliente.',
    effects: [{ key: 'escapedDetection', perLevel: 0.15 }, { key: 'incidentImpact', perLevel: 0.1 }],
    levelText: ['Detecção proativa +15%', 'Detecção proativa +30%'] },
  { id: 'observability', name: 'Observabilidade', branch: 'ops', icon: 'Eye', maxLevel: 2, baseCost: 17000, requires: ['monitoring'],
    description: 'Logs, métricas e traces reduzem o tempo de diagnóstico.',
    effects: [{ key: 'incidentImpact', perLevel: 0.15 }, { key: 'escapedDetection', perLevel: 0.1 }],
    levelText: ['Impacto de incidentes -15%', 'Impacto de incidentes -30%'] },
  { id: 'staging-env', name: 'Ambientes Estáveis', branch: 'ops', icon: 'Server', maxLevel: 2, baseCost: 12000,
    description: 'Homologação confiável e menos bloqueios de ambiente.',
    effects: [{ key: 'uatCapacity', perLevel: 0.1 }, { key: 'blockChance', perLevel: 0.1 }],
    levelText: ['Homologação +10%', 'Homologação +20%'] },
  { id: 'cloud-optimization', name: 'FinOps', branch: 'ops', icon: 'Cloud', maxLevel: 2, baseCost: 9000,
    description: 'Otimização de custos de nuvem.',
    effects: [{ key: 'infraCost', perLevel: 0.15 }],
    levelText: ['Infra -15%', 'Infra -30%'] },

  // ---- PESSOAS
  { id: 'wellbeing', name: 'Programa de Bem-estar', branch: 'people', icon: 'HeartHandshake', maxLevel: 2, baseCost: 10000,
    description: 'Cuidar do time mantém moral e energia.',
    effects: [{ key: 'morale', perLevel: 0.5 }, { key: 'energyRecovery', perLevel: 3 }],
    levelText: ['Moral +0,5/dia', 'Moral +1/dia'] },
  { id: 'mentoring', name: 'Mentoria', branch: 'people', icon: 'GraduationCap', maxLevel: 2, baseCost: 11000,
    description: 'Juniores evoluem mais rápido e a produtividade fica mais previsível.',
    effects: [{ key: 'onboarding', perLevel: 0.3 }, { key: 'variance', perLevel: 0.15 }],
    levelText: ['Variação -15%', 'Variação -30%'] },
  { id: 'flexible-hours', name: 'Horário Flexível', branch: 'people', icon: 'Clock', maxLevel: 1, baseCost: 6000,
    description: 'Autonomia aumenta a moral e a recuperação de energia.',
    effects: [{ key: 'morale', perLevel: 0.4 }, { key: 'energyRecovery', perLevel: 2 }],
    levelText: ['Moral +0,4/dia'] },

  // ---- INTELIGÊNCIA
  { id: 'ai-assistant', name: 'Assistente de IA', branch: 'intelligence', icon: 'Sparkles', maxLevel: 3, baseCost: 20000,
    description: 'Copilotos de código aceleram o desenvolvimento.',
    effects: [{ key: 'devCapacity', perLevel: 0.08 }, { key: 'advisor', perLevel: 1 }],
    levelText: ['Dev +8%', 'Dev +16%', 'Dev +24%'] },
  { id: 'data-analytics', name: 'Product Analytics', branch: 'intelligence', icon: 'ChartNoAxesCombined', maxLevel: 2, baseCost: 14000,
    description: 'Dados de uso ajudam a entregar o que gera mais valor.',
    effects: [{ key: 'revenue', perLevel: 0.07 }, { key: 'advisor', perLevel: 1 }],
    levelText: ['Receita +7%', 'Receita +14%'] },
];

export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u])) as Record<string, UpgradeDef>;

export const BRANCH_META: Record<UpgradeDef['branch'], { label: string; color: string }> = {
  quality: { label: 'Qualidade', color: '#34d399' },
  delivery: { label: 'Entrega', color: '#60a5fa' },
  ops: { label: 'Operações', color: '#fb923c' },
  people: { label: 'Pessoas', color: '#f472b6' },
  intelligence: { label: 'Inteligência', color: '#a78bfa' },
};

export function upgradeCost(def: UpgradeDef, currentLevel: number): number {
  return Math.round(def.baseCost * Math.pow(1.6, currentLevel));
}
