import type { CardType, FocusId, Priority, ServiceClass, SkillKey, StageId, TechArea, WorkStage } from '../types';

export interface StageDef {
  id: StageId;
  name: string;
  short: string;
  description: string;
  color: string;
  isWork: boolean;
}

export const STAGES: StageDef[] = [
  { id: 'backlog', name: 'Backlog', short: 'BKL', description: 'Demandas solicitadas, ainda não comprometidas.', color: '#64748b', isWork: false },
  { id: 'ready', name: 'Ready', short: 'RDY', description: 'Ponto de comprometimento: demandas priorizadas e prontas para serem puxadas.', color: '#94a3b8', isWork: false },
  { id: 'analysis', name: 'Análise', short: 'ANL', description: 'Refinamento de requisitos, critérios de aceite e desenho da solução.', color: '#a78bfa', isWork: true },
  { id: 'dev', name: 'Desenvolvimento', short: 'DEV', description: 'Construção da solução. Exige a especialidade técnica do card.', color: '#60a5fa', isWork: true },
  { id: 'review', name: 'Code Review', short: 'REV', description: 'Revisão de código por pares. Detecta parte dos defeitos.', color: '#22d3ee', isWork: true },
  { id: 'test', name: 'Testes', short: 'QA', description: 'Validação de qualidade. Principal barreira contra bugs em produção.', color: '#34d399', isWork: true },
  { id: 'uat', name: 'Homologação', short: 'UAT', description: 'Validação com o cliente em ambiente de homologação.', color: '#fbbf24', isWork: true },
  { id: 'deploy', name: 'Deploy', short: 'DPL', description: 'Publicação em produção.', color: '#fb923c', isWork: true },
  { id: 'done', name: 'Done', short: 'DONE', description: 'Valor entregue ao cliente.', color: '#10b981', isWork: false },
];

export const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id);
export const WORK_STAGES: WorkStage[] = ['analysis', 'dev', 'review', 'test', 'uat', 'deploy'];
export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<StageId, StageDef>;

export function nextStage(s: StageId): StageId | null {
  const i = STAGE_ORDER.indexOf(s);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}
export function prevStage(s: StageId): StageId | null {
  const i = STAGE_ORDER.indexOf(s);
  return i > 0 ? STAGE_ORDER[i - 1] : null;
}
export function isWorkStage(s: StageId): s is WorkStage {
  return (WORK_STAGES as string[]).includes(s);
}

/** Habilidade exigida em cada estágio (dev depende da área técnica do card) */
export const STAGE_SKILL: Record<Exclude<WorkStage, 'dev'>, SkillKey[]> = {
  analysis: ['analysis'],
  review: ['architecture', 'backend', 'frontend'],
  test: ['testing'],
  uat: ['analysis', 'testing'],
  deploy: ['devops'],
};

export const TECH_SKILL: Record<TechArea, SkillKey[]> = {
  frontend: ['frontend'],
  backend: ['backend'],
  fullstack: ['frontend', 'backend'],
  data: ['data', 'backend'],
  infra: ['devops'],
  ux: ['ux', 'frontend'],
  security: ['backend', 'devops', 'architecture'],
};

export const TECH_LABEL: Record<TechArea, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full Stack',
  data: 'Dados',
  infra: 'Infra',
  ux: 'UX/UI',
  security: 'Segurança',
};

export interface CardTypeDef {
  id: CardType;
  label: string;
  prefix: string;
  color: string;
  emoji: string;
  /** Distribuição do esforço (multiplicador da complexidade) por estágio */
  effort: Record<WorkStage, number>;
  /** Parcela do valor que se torna receita recorrente diária */
  recurring: number;
  description: string;
}

export const CARD_TYPES: Record<CardType, CardTypeDef> = {
  feature: { id: 'feature', label: 'Feature', prefix: 'FEAT', color: '#3b82f6', emoji: '🟦', recurring: 0.012, description: 'Nova funcionalidade que gera receita.', effort: { analysis: 0.7, dev: 1.5, review: 0.35, test: 0.8, uat: 0.45, deploy: 0.25 } },
  bug: { id: 'bug', label: 'Bug', prefix: 'BUG', color: '#ef4444', emoji: '🟥', recurring: 0, description: 'Defeito encontrado em produção.', effort: { analysis: 0.35, dev: 0.9, review: 0.25, test: 0.6, uat: 0.2, deploy: 0.2 } },
  incident: { id: 'incident', label: 'Incidente', prefix: 'INC', color: '#f97316', emoji: '🟧', recurring: 0, description: 'Falha ativa em produção afetando clientes.', effort: { analysis: 0.3, dev: 0.8, review: 0.15, test: 0.35, uat: 0.1, deploy: 0.2 } },
  improvement: { id: 'improvement', label: 'Melhoria', prefix: 'IMP', color: '#eab308', emoji: '🟨', recurring: 0.008, description: 'Evolução de funcionalidade existente.', effort: { analysis: 0.5, dev: 1.1, review: 0.3, test: 0.6, uat: 0.35, deploy: 0.2 } },
  techdebt: { id: 'techdebt', label: 'Tech Debt', prefix: 'DEBT', color: '#a855f7', emoji: '🟪', recurring: 0, description: 'Refatoração que reduz a dívida técnica.', effort: { analysis: 0.35, dev: 1.3, review: 0.45, test: 0.6, uat: 0.1, deploy: 0.2 } },
  integration: { id: 'integration', label: 'Integração', prefix: 'INT', color: '#22c55e', emoji: '🟩', recurring: 0.01, description: 'Integração com sistemas externos. Alto risco de bloqueio.', effort: { analysis: 0.8, dev: 1.3, review: 0.3, test: 0.9, uat: 0.5, deploy: 0.3 } },
  security: { id: 'security', label: 'Segurança', prefix: 'SEC', color: '#94a3b8', emoji: '⬛', recurring: 0.004, description: 'Hardening, compliance e correções de segurança.', effort: { analysis: 0.6, dev: 1.2, review: 0.5, test: 0.8, uat: 0.3, deploy: 0.25 } },
  infra: { id: 'infra', label: 'Infraestrutura', prefix: 'INFRA', color: '#b45309', emoji: '🟫', recurring: 0.003, description: 'Plataforma, pipelines e ambientes.', effort: { analysis: 0.4, dev: 1.2, review: 0.3, test: 0.5, uat: 0.15, deploy: 0.45 } },
  ux: { id: 'ux', label: 'UX/UI', prefix: 'UX', color: '#ec4899', emoji: '🩷', recurring: 0.009, description: 'Experiência e interface do usuário.', effort: { analysis: 0.8, dev: 1.1, review: 0.25, test: 0.5, uat: 0.55, deploy: 0.15 } },
};

export interface ServiceClassDef {
  id: ServiceClass;
  label: string;
  short: string;
  color: string;
  icon: string;
  description: string;
  rules: string[];
}

export const SERVICE_CLASSES: Record<ServiceClass, ServiceClassDef> = {
  expedite: {
    id: 'expedite', label: 'Expedite', short: 'EXP', color: '#f59e0b', icon: '⚡',
    description: 'Prioridade máxima. Fura a fila e ignora limites de WIP, mas interrompe o trabalho dos demais.',
    rules: ['Sempre trabalhado primeiro', 'Não conta para o limite de WIP', 'Reduz em 15% a capacidade dos outros cards no mesmo estágio', 'Valor cai rapidamente a cada dia'],
  },
  fixed: {
    id: 'fixed', label: 'Fixed Date', short: 'FIX', color: '#f472b6', icon: '📅',
    description: 'Possui data de entrega fixa (regulatória ou contratual). Atraso gera multa e perda grande de valor.',
    rules: ['Prioridade aumenta conforme a data se aproxima', 'Atraso: multa contratual + 60% de perda de valor'],
  },
  standard: {
    id: 'standard', label: 'Standard', short: 'STD', color: '#60a5fa', icon: '●',
    description: 'Fluxo normal. Tratado por ordem de prioridade (FIFO dentro da coluna).',
    rules: ['Valor diminui gradualmente após o SLA'],
  },
  intangible: {
    id: 'intangible', label: 'Intangible', short: 'INT', color: '#a78bfa', icon: '◇',
    description: 'Sem valor financeiro imediato, mas reduz riscos futuros (dívida técnica, segurança).',
    rules: ['Menor prioridade', 'Reduz dívida técnica ao ser entregue', 'Sem SLA'],
  },
};

export const PRIORITY_META: Record<Priority, { label: string; color: string; weight: number }> = {
  low: { label: 'Baixa', color: '#64748b', weight: 1 },
  medium: { label: 'Média', color: '#60a5fa', weight: 2 },
  high: { label: 'Alta', color: '#f59e0b', weight: 3 },
  critical: { label: 'Crítica', color: '#ef4444', weight: 4 },
};

export interface FocusDef {
  id: FocusId;
  label: string;
  icon: string;
  description: string;
  capacity: number;
  defect: number;
  detection: number;
  downstreamBoost: number;
  morale: number;
}

export const FOCUS_OPTIONS: FocusDef[] = [
  { id: 'balanced', label: 'Equilibrado', icon: '⚖️', description: 'Ritmo sustentável, sem ajustes.', capacity: 1, defect: 1, detection: 0, downstreamBoost: 0, morale: 0 },
  { id: 'flow', label: 'Terminar antes de começar', icon: '🌊', description: 'Pare de começar, comece a terminar. +20% nos estágios finais, -25% em Análise.', capacity: 1, defect: 1, detection: 0, downstreamBoost: 0.2, morale: 0 },
  { id: 'quality', label: 'Qualidade', icon: '🛡️', description: '-10% velocidade, -35% defeitos, +15% detecção em testes.', capacity: 0.9, defect: 0.65, detection: 0.15, downstreamBoost: 0, morale: 0.5 },
  { id: 'speed', label: 'Velocidade', icon: '🚀', description: '+15% velocidade, +40% defeitos, mais estresse.', capacity: 1.15, defect: 1.4, detection: -0.05, downstreamBoost: 0, morale: -1 },
  { id: 'firefight', label: 'Apagar incêndios', icon: '🧯', description: 'Bugs e incidentes recebem +40% de capacidade; demais -15%.', capacity: 1, defect: 1, detection: 0, downstreamBoost: 0, morale: -0.5 },
];

export const BLOCK_REASONS: Record<'external' | 'internal' | 'environment', string[]> = {
  external: [
    'Aguardando API externa',
    'Aguardando resposta do cliente',
    'Fornecedor não liberou credenciais',
    'Aguardando aprovação do jurídico',
    'Documentação da API de terceiro incompleta',
    'Aguardando massa de dados do cliente',
  ],
  internal: [
    'Dúvida de regra de negócio sem resposta',
    'Aguardando decisão de arquitetura',
    'Conflito de merge complexo',
    'Especialista indisponível para pareamento',
    'Requisito ambíguo',
    'Aguardando revisão do DBA',
  ],
  environment: [
    'Ambiente de testes instável',
    'Pipeline de CI quebrado',
    'Homologação fora do ar',
    'Banco de dados de teste corrompido',
    'Permissão de acesso pendente',
  ],
};
