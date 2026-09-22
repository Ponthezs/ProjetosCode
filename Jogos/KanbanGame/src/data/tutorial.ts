import type { GameState } from '../types';

export interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  body: string;
  /** Instrução de ação: o passo só avança quando check() for verdadeiro */
  action?: string;
  check?: (s: GameState, base: GameState) => boolean;
  view?: 'board' | 'analytics' | 'team';
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

/** Tutorial interativo — acontece jogando */
export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', placement: 'center', title: 'Bem-vindo ao FLOW OPS', body: 'Você é o gestor de uma equipe de software. Seu trabalho não é manter todos ocupados — é fazer o trabalho FLUIR do pedido até a entrega. Vamos aprender jogando.' },
  { id: 'kpis', target: 'topbar', placement: 'bottom', title: 'Indicadores da empresa', body: 'Receita, caixa, valor entregue, satisfação do cliente e da equipe, dívida técnica e incidentes. Todas as suas decisões mexem nesses números.' },
  { id: 'flow', target: 'flowstrip', placement: 'bottom', title: 'Métricas de fluxo', body: 'Throughput (entregas por dia), Lead Time (do comprometimento à entrega), Cycle Time (do início à entrega), WIP e bloqueios. Elas são calculadas com dados reais da partida.' },
  { id: 'board', target: 'board', placement: 'top', title: 'O quadro Kanban', body: 'Cada coluna é um estágio do fluxo. Os cards avançam quando o trabalho do estágio termina. Backlog são pedidos; Ready é o ponto de comprometimento.' },
  {
    id: 'pull', target: 'col-backlog', placement: 'right', title: 'Sistema puxado', body: 'Você decide o que entra no fluxo. Escolha uma demanda valiosa do Backlog.',
    action: 'Arraste um card do BACKLOG para READY.',
    check: (s, b) => s.columns.ready.some((id) => !b.columns.ready.includes(id)) || s.columns.analysis.length > b.columns.analysis.length,
  },
  { id: 'wip', target: 'wip-dev', placement: 'bottom', title: 'Limites de WIP', body: 'Cada estágio tem um limite de trabalho simultâneo. Passar do limite causa troca de contexto: tarefas demoram mais, surgem mais bugs e o lead time sobe. Ajuste com − e +.' },
  {
    id: 'team', target: 'team-rail', placement: 'left', title: 'Sua equipe', body: 'Cada profissional tem especialidades. Trabalhando na própria especialidade, rende muito mais (QA em Testes +50%). Fora dela, rende menos.',
    action: 'Arraste uma pessoa para outra coluna (ou mude o estágio no seletor).',
    check: (s, b) => s.peopleOrder.some((id) => s.people[id]?.stage !== b.people[id]?.stage),
  },
  { id: 'focus', target: 'focus', placement: 'top', title: 'Foco do dia', body: 'Defina a prioridade do time: terminar o que começou, qualidade, velocidade ou apagar incêndios. Hora extra aumenta a capacidade, mas custa caro e cansa.' },
  {
    id: 'start', target: 'start-day', placement: 'top', title: 'Execute o dia', body: 'Quando o planejamento estiver pronto, execute a simulação. Acompanhe o progresso nos cards: +pontos, BLOCKED, BUG FOUND e DONE.',
    action: 'Clique em ▶ INICIAR DIA.',
    check: (s, b) => s.day > b.day,
  },
  { id: 'ai', target: 'team-rail', placement: 'left', title: 'FLOW AI', body: 'Na aba Flow AI do painel lateral, o consultor analisa o quadro e sugere ações — aceite ou ignore. Ele detecta gargalos, WIP excessivo e riscos de SLA.' },
  { id: 'end', placement: 'center', title: 'Agora é com você!', body: 'Lembre-se: FLUXO > UTILIZAÇÃO INDIVIDUAL. Às vezes deixar alguém sem iniciar uma nova tarefa é a decisão certa. Momentos de aprendizado aparecerão durante a partida.' },
];
