import type { EventDef } from '../types';

/**
 * Catálogo de eventos (80+).
 * Placeholders: {person}, {card}, {code}, {client}
 * Efeitos "person*" e de card aplicam-se ao alvo sorteado no contexto.
 */
export const EVENTS: EventDef[] = [
  /* ============================ INCIDENTES ============================ */
  {
    id: 'checkout-down', title: 'Incidente em produção', icon: '🚨', category: 'incident', severity: 'critical', weight: 3, requires: ['minDay3'],
    description: 'Usuários da {client} estão enfrentando erro durante o checkout. O volume de reclamações cresce a cada minuto.',
    choices: [
      { id: 'swarm', label: 'Realocar 2 devs agora', tone: 'safe', description: 'Abre um incidente Expedite e o time desenvolve com foco total.', cost: 'Produtividade do dev -30% por 2 dias', benefit: 'Recuperação rápida', effects: [
        { type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 2, toStage: 'dev' },
        { type: 'capacity', scope: 'stage', stage: 'dev', mult: 0.7, days: 2, label: 'Time focado no incidente' },
        { type: 'clientSat', amount: -2 },
      ] },
      { id: 'queue', label: 'Continuar o plano', tone: 'risky', description: 'Registra o incidente no backlog e segue o planejamento.', risk: 'Satisfação do cliente e possível perda de receita', effects: [
        { type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 3 },
        { type: 'clientSat', amount: -6 },
        { type: 'revenueMod', mult: 0.7, days: 3, label: 'Checkout instável' },
      ] },
    ],
    lesson: 'expedite',
  },
  {
    id: 'server-down', title: 'Servidor fora do ar', icon: '🔥', category: 'incident', severity: 'critical', weight: 2, requires: ['minDay3'],
    description: 'O servidor principal parou de responder. Todos os clientes estão impactados.',
    choices: [
      { id: 'devops', label: 'Acionar plantão DevOps', tone: 'safe', description: 'Hora extra do time de operações para restaurar.', cost: 'R$ 6.000', benefit: 'Restauração no mesmo dia', effects: [{ type: 'money', amount: -6000 }, { type: 'clientSat', amount: -3 }, { type: 'teamStress', amount: 6 }] },
      { id: 'vendor', label: 'Chamar suporte do provedor', tone: 'neutral', description: 'O provedor de nuvem investiga.', cost: 'R$ 2.500', risk: 'Pode demorar', effects: [{ type: 'money', amount: -2500 }, { type: 'chance', p: 0.5, then: [{ type: 'clientSat', amount: -3 }], else: [{ type: 'clientSat', amount: -9 }, { type: 'revenueMod', mult: 0.6, days: 2, label: 'Instabilidade prolongada' }], thenText: 'O provedor resolveu rapidamente.', elseText: 'A indisponibilidade durou horas.' }] },
    ],
  },
  {
    id: 'critical-bug', title: 'Produção instável', icon: '🐞', category: 'incident', severity: 'critical', weight: 3, requires: ['cardDone'],
    description: 'Bug crítico detectado em uma funcionalidade entregue recentemente para {client}.',
    choices: [
      { id: 'hotfix', label: 'Hotfix agora', tone: 'safe', description: 'Card Expedite direto no desenvolvimento.', cost: 'R$ 8.000', risk: 'Baixo', effects: [{ type: 'money', amount: -8000 }, { type: 'spawnCard', cardType: 'bug', serviceClass: 'expedite', priority: 'critical', complexity: 2, toStage: 'dev' }, { type: 'techDebt', amount: 1 }] },
      { id: 'next', label: 'Corrigir no próximo ciclo', tone: 'risky', description: 'Entra no backlog como bug de alta prioridade.', cost: 'R$ 2.000', risk: 'Alto', effects: [{ type: 'money', amount: -2000 }, { type: 'spawnCard', cardType: 'bug', serviceClass: 'standard', priority: 'high', complexity: 3 }, { type: 'clientSat', amount: -7 }] },
      { id: 'rollback', label: 'Rollback', tone: 'neutral', description: 'Reverte a versão. Perda temporária de funcionalidades.', cost: 'Receita -25% por 3 dias', effects: [{ type: 'revenueMod', mult: 0.75, days: 3, label: 'Funcionalidades revertidas' }, { type: 'spawnCard', cardType: 'bug', serviceClass: 'standard', priority: 'high', complexity: 2 }, { type: 'clientSat', amount: -2 }] },
    ],
  },
  {
    id: 'security-attack', title: 'Ataque de segurança', icon: '🛡️', category: 'incident', severity: 'critical', weight: 1.5, requires: ['minDay7'],
    description: 'Detectamos tentativas de acesso não autorizado explorando uma API pública.',
    choices: [
      { id: 'block', label: 'Bloquear e investigar', tone: 'safe', description: 'Card de segurança Expedite + consultoria forense.', cost: 'R$ 12.000', effects: [{ type: 'money', amount: -12000 }, { type: 'spawnCard', cardType: 'security', serviceClass: 'expedite', priority: 'critical', complexity: 3, toStage: 'analysis' }] },
      { id: 'monitor', label: 'Apenas monitorar', tone: 'risky', description: 'Aumenta alertas e segue o plano.', risk: '40% de chance de vazamento', effects: [{ type: 'chance', p: 0.4, then: [{ type: 'clientSat', amount: -15 }, { type: 'money', amount: -25000 }, { type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 5 }], else: [{ type: 'clientSat', amount: -1 }], thenText: 'Houve vazamento de dados. Multa e crise de imagem.', elseText: 'O ataque foi contido pelo firewall.' }] },
    ],
  },
  {
    id: 'deploy-failed', title: 'Deploy falhou', icon: '💥', category: 'incident', severity: 'warning', weight: 2.5, requires: ['cardInDeploy'], cardStages: ['deploy'],
    description: 'O deploy de {code} "{card}" falhou no meio da janela de publicação.',
    choices: [
      { id: 'retry', label: 'Investigar e tentar novamente', tone: 'safe', description: 'Refaz parte do deploy.', cost: 'Retrabalho no deploy', effects: [{ type: 'rework', amount: 2 }] },
      { id: 'force', label: 'Forçar publicação', tone: 'aggressive', description: 'Aplica correções manuais em produção.', risk: '50% de gerar incidente', effects: [{ type: 'chance', p: 0.5, then: [{ type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 2 }, { type: 'techDebt', amount: 3 }], else: [{ type: 'techDebt', amount: 2 }], thenText: 'A publicação forçada derrubou um serviço.', elseText: 'Funcionou, mas gerou dívida técnica.' }] },
    ],
  },
  {
    id: 'regression', title: 'Regressão detectada', icon: '🔁', category: 'incident', severity: 'warning', weight: 2.5, requires: ['cardInTest'], cardStages: ['test'],
    description: 'Os testes de {code} revelaram que uma funcionalidade antiga parou de funcionar.',
    effects: [{ type: 'rework', amount: 3 }, { type: 'techDebt', amount: 1 }],
    lesson: 'rework',
  },
  {
    id: 'third-party-api', title: 'API de terceiro instável', icon: '🌐', category: 'incident', severity: 'warning', weight: 2, requires: ['cardInProgress'], cardTypes: ['integration', 'feature'],
    description: 'A API do parceiro usada por {code} está retornando erros intermitentes.',
    effects: [{ type: 'blockCard', days: 2, reason: 'API de terceiro instável' }],
    lesson: 'blocked',
  },
  {
    id: 'integration-down', title: 'Integração externa caiu', icon: '🔌', category: 'incident', severity: 'warning', weight: 1.8, requires: ['cardInProgress'],
    description: 'Uma integração crítica caiu. Cards dependentes de sistemas externos travaram.',
    effects: [{ type: 'blockMod', mult: 1.8, days: 3, label: 'Integrações instáveis' }, { type: 'blockCard', days: 2, reason: 'Integração externa fora do ar' }],
  },
  {
    id: 'db-slow', title: 'Banco de dados lento', icon: '🐢', category: 'incident', severity: 'warning', weight: 1.5,
    description: 'Consultas lentas estão derrubando a performance da aplicação.',
    choices: [
      { id: 'dba', label: 'Priorizar otimização', tone: 'safe', description: 'Card de infraestrutura Expedite.', effects: [{ type: 'spawnCard', cardType: 'infra', serviceClass: 'expedite', priority: 'high', complexity: 3, title: 'Otimização emergencial do banco' }] },
      { id: 'scale', label: 'Escalar servidor', tone: 'neutral', description: 'Resolve com dinheiro.', cost: 'R$ 7.000', effects: [{ type: 'money', amount: -7000 }, { type: 'techDebt', amount: 2 }] },
    ],
  },
  {
    id: 'memory-leak', title: 'Vazamento de memória', icon: '🧠', category: 'incident', severity: 'warning', weight: 1.2, requires: ['minDay3'],
    description: 'Serviços reiniciam várias vezes ao dia por vazamento de memória.',
    effects: [{ type: 'spawnCard', cardType: 'bug', serviceClass: 'standard', priority: 'high', complexity: 3, title: 'Corrigir vazamento de memória' }, { type: 'clientSat', amount: -2 }],
  },
  {
    id: 'data-corruption', title: 'Dados inconsistentes', icon: '🧬', category: 'incident', severity: 'critical', weight: 1, requires: ['minDay7'],
    description: 'Relatórios da {client} mostram valores inconsistentes após a última entrega.',
    choices: [
      { id: 'fix', label: 'Força-tarefa de correção', tone: 'safe', description: 'Incidente Expedite com DBA.', effects: [{ type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 3, toStage: 'analysis' }, { type: 'clientSat', amount: -3 }] },
      { id: 'script', label: 'Script manual de correção', tone: 'aggressive', description: 'Rápido, porém arriscado.', effects: [{ type: 'chance', p: 0.65, then: [{ type: 'clientSat', amount: -1 }, { type: 'techDebt', amount: 3 }], else: [{ type: 'clientSat', amount: -10 }, { type: 'spawnCard', cardType: 'incident', serviceClass: 'expedite', priority: 'critical', complexity: 5 }], thenText: 'O script corrigiu os dados.', elseText: 'O script piorou a situação.' }] },
    ],
  },
  {
    id: 'cert-expired', title: 'Certificado SSL expirado', icon: '🔐', category: 'incident', severity: 'warning', weight: 1,
    description: 'O certificado do domínio principal expirou. Navegadores exibem alerta de segurança.',
    choices: [
      { id: 'renew', label: 'Renovar imediatamente', tone: 'safe', description: 'DevOps interrompe o que está fazendo.', effects: [{ type: 'capacity', scope: 'stage', stage: 'deploy', mult: 0.5, days: 1, label: 'Renovação de certificado' }, { type: 'clientSat', amount: -1 }] },
      { id: 'later', label: 'Renovar amanhã', tone: 'risky', description: 'Deixa para o próximo dia.', effects: [{ type: 'clientSat', amount: -5 }, { type: 'revenueMod', mult: 0.8, days: 1, label: 'Alerta de segurança no site' }] },
    ],
  },
  {
    id: 'env-uat-down', title: 'Homologação indisponível', icon: '🧱', category: 'incident', severity: 'warning', weight: 2, requires: ['cardInUat'],
    description: 'O ambiente de homologação caiu. Nenhuma validação com cliente pode acontecer.',
    effects: [{ type: 'capacity', scope: 'stage', stage: 'uat', mult: 0.1, days: 2, label: 'Homologação fora do ar' }],
    lesson: 'bottleneck',
  },
  {
    id: 'ci-broken', title: 'Pipeline de CI quebrado', icon: '🛠️', category: 'incident', severity: 'warning', weight: 1.8,
    description: 'Uma atualização quebrou o pipeline. Builds e deploys estão falhando.',
    choices: [
      { id: 'fix', label: 'DevOps corrige hoje', tone: 'safe', description: 'Deploy parado por 1 dia.', effects: [{ type: 'capacity', scope: 'stage', stage: 'deploy', mult: 0.2, days: 1, label: 'CI quebrado' }] },
      { id: 'manual', label: 'Deploy manual', tone: 'risky', description: 'Continua publicando manualmente.', effects: [{ type: 'capacity', scope: 'stage', stage: 'deploy', mult: 0.7, days: 2, label: 'Deploy manual' }, { type: 'defectMod', mult: 1.3, days: 2, label: 'Processo manual' }] },
    ],
  },

  /* ============================ PESSOAS ============================ */
  {
    id: 'sick', title: 'Profissional afastado', icon: '🤒', category: 'people', severity: 'warning', weight: 3, requires: ['person'],
    description: '{person} ficará indisponível durante 3 dias por motivo de saúde.',
    effects: [{ type: 'personAbsent', days: 3, reason: 'Afastamento médico' }],
  },
  {
    id: 'family', title: 'Emergência familiar', icon: '🏠', category: 'people', severity: 'warning', weight: 1.5, requires: ['person'],
    description: '{person} precisa se ausentar por 2 dias para resolver uma emergência familiar.',
    effects: [{ type: 'personAbsent', days: 2, reason: 'Emergência familiar' }, { type: 'personStress', amount: 10 }],
  },
  {
    id: 'vacation-request', title: 'Pedido de férias', icon: '🏖️', category: 'people', severity: 'info', weight: 1.5, requires: ['person', 'minDay3'],
    description: '{person} pediu 3 dias de folga para descansar. Energia e humor estão baixos.',
    choices: [
      { id: 'approve', label: 'Aprovar', tone: 'safe', description: 'Pessoa volta renovada.', effects: [{ type: 'personAbsent', days: 3, reason: 'Folga' }, { type: 'personMorale', amount: 20 }, { type: 'personEnergy', amount: 60 }, { type: 'personStress', amount: -40 }] },
      { id: 'deny', label: 'Negar', tone: 'risky', description: 'Mantém capacidade agora.', risk: 'Moral e risco de burnout', effects: [{ type: 'personMorale', amount: -15 }, { type: 'personStress', amount: 15 }] },
    ],
  },
  {
    id: 'resignation', title: 'Pedido de demissão', icon: '📤', category: 'people', severity: 'critical', weight: 1, requires: ['person', 'minDay7'],
    description: '{person} recebeu uma proposta de outra empresa e pretende sair.',
    choices: [
      { id: 'counter', label: 'Contraproposta (+20% salário)', tone: 'neutral', description: 'Tenta reter o talento.', cost: 'Salário +20%', effects: [{ type: 'chance', p: 0.75, then: [{ type: 'personMorale', amount: 10 }, { type: 'money', amount: -2000 }], else: [{ type: 'personLeaves' }], thenText: 'A pessoa aceitou ficar.', elseText: 'Mesmo com a proposta, a pessoa decidiu sair.' }] },
      { id: 'let-go', label: 'Aceitar a saída', tone: 'risky', description: 'A pessoa sai hoje.', effects: [{ type: 'personLeaves' }, { type: 'teamMorale', amount: -4 }] },
    ],
  },
  {
    id: 'senior-joins', title: 'Sênior quer entrar no time', icon: '🌟', category: 'people', severity: 'positive', weight: 1, requires: ['minDay3'],
    description: 'Um desenvolvedor sênior indicado por um colega quer se juntar ao projeto.',
    choices: [
      { id: 'hire', label: 'Contratar', tone: 'safe', description: 'Mais capacidade, mais custo.', cost: 'R$ 5.000 de contratação', effects: [{ type: 'money', amount: -5000 }, { type: 'addPerson', seniority: 'senior' }] },
      { id: 'decline', label: 'Recusar', tone: 'neutral', description: 'Mantém o orçamento.', effects: [] },
    ],
  },
  {
    id: 'new-junior', title: 'Novo estagiário', icon: '🎓', category: 'people', severity: 'info', weight: 0.8,
    description: 'O RH aprovou um estagiário para o time. Ele precisará de mentoria nos primeiros dias.',
    choices: [
      { id: 'accept', label: 'Receber no time', tone: 'neutral', description: 'Capacidade baixa no início.', effects: [{ type: 'addPerson', seniority: 'junior' }] },
      { id: 'decline', label: 'Dispensar', tone: 'neutral', description: 'Sem mudanças.', effects: [] },
    ],
  },
  {
    id: 'conflict', title: 'Conflito no time', icon: '⚡', category: 'people', severity: 'warning', weight: 1.5, requires: ['person'],
    description: '{person} e um colega discordaram fortemente sobre a arquitetura. O clima pesou.',
    choices: [
      { id: 'mediate', label: 'Mediar conversa', tone: 'safe', description: 'Reunião de 1h com os envolvidos.', effects: [{ type: 'capacity', scope: 'all', mult: 0.95, days: 1, label: 'Mediação' }, { type: 'teamMorale', amount: 3 }] },
      { id: 'ignore', label: 'Deixar se resolverem', tone: 'risky', description: 'Pode escalar.', effects: [{ type: 'chance', p: 0.5, then: [{ type: 'teamMorale', amount: -8 }, { type: 'personStress', amount: 15 }], else: [], thenText: 'O conflito contaminou o time.', elseText: 'Eles se entenderam.' }] },
    ],
  },
  {
    id: 'burnout-warning', title: 'Sinais de burnout', icon: '🥵', category: 'people', severity: 'warning', weight: 1.2, requires: ['person', 'lowMorale'],
    description: '{person} está visivelmente esgotado(a). Rendimento e humor estão caindo.',
    choices: [
      { id: 'rest', label: 'Dar 2 dias de descanso', tone: 'safe', description: 'Perde capacidade agora, ganha depois.', effects: [{ type: 'personAbsent', days: 2, reason: 'Descanso' }, { type: 'personStress', amount: -50 }, { type: 'personEnergy', amount: 70 }, { type: 'personMorale', amount: 15 }] },
      { id: 'push', label: 'Pedir mais esforço', tone: 'aggressive', description: 'Mantém capacidade.', risk: 'Afastamento longo', effects: [{ type: 'chance', p: 0.45, then: [{ type: 'personAbsent', days: 5, reason: 'Burnout' }, { type: 'teamMorale', amount: -5 }], else: [{ type: 'personStress', amount: 10 }], thenText: 'A pessoa entrou em burnout.', elseText: 'Aguentou, mas por pouco.' }] },
    ],
  },
  {
    id: 'training-offer', title: 'Treinamento disponível', icon: '📚', category: 'people', severity: 'info', weight: 1.4, requires: ['person'],
    description: 'Surgiu uma vaga em um workshop intensivo. {person} pode participar amanhã.',
    choices: [
      { id: 'send', label: 'Enviar para o treinamento', tone: 'safe', description: 'Ausente 1 dia, +1 nível de habilidade.', cost: 'R$ 3.000', effects: [{ type: 'money', amount: -3000 }, { type: 'personAbsent', days: 1, reason: 'Treinamento' }, { type: 'personSkill', skill: 'auto', amount: 1 }, { type: 'personMorale', amount: 8 }] },
      { id: 'skip', label: 'Não agora', tone: 'neutral', description: 'Foco na entrega.', effects: [{ type: 'personMorale', amount: -3 }] },
    ],
  },
  {
    id: 'dba-unavailable', title: 'DBA indisponível', icon: '🗄️', category: 'people', severity: 'warning', weight: 1.2, requires: ['hasDBA'], personRoles: ['dba'],
    description: '{person} foi convocado(a) para uma migração em outro projeto por 2 dias.',
    effects: [{ type: 'personAbsent', days: 2, reason: 'Emprestado a outro projeto' }, { type: 'capacity', scope: 'tech', tech: 'data', mult: 0.7, days: 2, label: 'Sem DBA' }],
  },
  {
    id: 'qa-borrowed', title: 'QA emprestado', icon: '🔄', category: 'people', severity: 'warning', weight: 1.2, requires: ['hasQA'], personRoles: ['qa'],
    description: 'A diretoria pediu {person} para apoiar outro time durante 2 dias.',
    choices: [
      { id: 'lend', label: 'Emprestar', tone: 'neutral', description: 'Boa relação com a diretoria.', effects: [{ type: 'personAbsent', days: 2, reason: 'Apoio a outro time' }, { type: 'xp', amount: 150 }] },
      { id: 'refuse', label: 'Recusar', tone: 'risky', description: 'Mantém o QA.', effects: [{ type: 'money', amount: -3000 }, { type: 'teamMorale', amount: -1 }] },
    ],
  },
  {
    id: 'motivation-drop', title: 'Queda de motivação', icon: '😮‍💨', category: 'people', severity: 'warning', weight: 1.2, requires: ['person'],
    description: '{person} sente que está sempre apagando incêndios e não evolui.',
    effects: [{ type: 'personMorale', amount: -15 }],
  },
  {
    id: 'hackathon', title: 'Hackathon interno', icon: '💡', category: 'people', severity: 'info', weight: 0.8, requires: ['minDay3'],
    description: 'O time propõe um hackathon de um dia para testar novas ideias.',
    choices: [
      { id: 'yes', label: 'Apoiar o hackathon', tone: 'neutral', description: 'Capacidade -50% por 1 dia.', effects: [{ type: 'capacity', scope: 'all', mult: 0.5, days: 1, label: 'Hackathon' }, { type: 'teamMorale', amount: 10 }, { type: 'chance', p: 0.5, then: [{ type: 'spawnCard', cardType: 'feature', serviceClass: 'standard', priority: 'medium', valueMult: 1.8, title: 'Ideia do hackathon: automação inteligente' }], thenText: 'Surgiu uma ideia valiosa!' }] },
      { id: 'no', label: 'Adiar', tone: 'neutral', description: 'Sem impacto na capacidade.', effects: [{ type: 'teamMorale', amount: -4 }] },
    ],
  },
  {
    id: 'mentor-pairing', title: 'Mentoria espontânea', icon: '🤝', category: 'people', severity: 'positive', weight: 1, requires: ['person'],
    description: '{person} passou a tarde pareando com colegas mais juniores.',
    effects: [{ type: 'teamMorale', amount: 3 }, { type: 'personSkill', skill: 'auto', amount: 0.5 }],
  },
  {
    id: 'layoff-pressure', title: 'Corte de custos', icon: '✂️', category: 'people', severity: 'critical', weight: 0.6, requires: ['minDay7'],
    description: 'A diretoria exige redução imediata de custos com pessoal.',
    choices: [
      { id: 'cut', label: 'Desligar uma pessoa', tone: 'aggressive', description: 'Reduz folha salarial.', effects: [{ type: 'personLeaves' }, { type: 'teamMorale', amount: -10 }] },
      { id: 'freeze', label: 'Congelar bônus', tone: 'neutral', description: 'Evita demissões.', effects: [{ type: 'teamMorale', amount: -6 }, { type: 'money', amount: 8000 }] },
    ],
  },
  {
    id: 'onboarding-help', title: 'Ajuda no onboarding', icon: '🧭', category: 'people', severity: 'info', weight: 0.8, requires: ['person'],
    description: '{person} precisa dedicar meio dia para documentar o sistema para novos membros.',
    effects: [{ type: 'capacity', scope: 'person', mult: 0.5, days: 1, label: 'Documentando' }, { type: 'techDebt', amount: -1 }],
  },
  {
    id: 'overtime-complaints', title: 'Reclamação de horas extras', icon: '⏰', category: 'people', severity: 'warning', weight: 1, requires: ['lowMorale'],
    description: 'O time reclama das horas extras frequentes e do ritmo insustentável.',
    choices: [
      { id: 'listen', label: 'Reduzir ritmo', tone: 'safe', description: 'Promete ritmo sustentável.', effects: [{ type: 'teamMorale', amount: 6 }, { type: 'teamStress', amount: -10 }] },
      { id: 'bonus', label: 'Pagar bônus', tone: 'neutral', description: 'Compensa financeiramente.', cost: 'R$ 10.000', effects: [{ type: 'money', amount: -10000 }, { type: 'teamMorale', amount: 8 }] },
    ],
  },

  /* ============================ CLIENTES ============================ */
  {
    id: 'priority-change', title: 'Cliente alterou prioridade', icon: '🔀', category: 'client', severity: 'warning', weight: 2.5, requires: ['cardInBacklog'], cardStages: ['backlog', 'ready'],
    description: '{client} decidiu que "{card}" agora é urgente e precisa furar a fila.',
    choices: [
      { id: 'expedite', label: 'Tornar Expedite', tone: 'neutral', description: 'Atende o cliente, interrompe o fluxo.', effects: [{ type: 'expediteCard' }, { type: 'clientSat', amount: 3 }] },
      { id: 'negotiate', label: 'Negociar prazo', tone: 'safe', description: 'Mantém classe de serviço.', effects: [{ type: 'chance', p: 0.6, then: [{ type: 'clientSat', amount: 0 }], else: [{ type: 'clientSat', amount: -5 }], thenText: 'O cliente aceitou o prazo.', elseText: 'O cliente ficou insatisfeito.' }] },
    ],
    lesson: 'serviceClasses',
  },
  {
    id: 'vip-client', title: 'Cliente VIP', icon: '👑', category: 'client', severity: 'info', weight: 1.5,
    description: 'Um novo contrato VIP foi assinado. Chega uma demanda de alto valor com prazo fixo.',
    effects: [{ type: 'spawnCard', cardType: 'feature', serviceClass: 'fixed', priority: 'high', valueMult: 2.2 }],
  },
  {
    id: 'scope-change', title: 'Mudança de escopo', icon: '📐', category: 'client', severity: 'warning', weight: 2.5, requires: ['cardInProgress'],
    description: '{client} mudou os requisitos de "{card}" no meio do desenvolvimento.',
    choices: [
      { id: 'accept', label: 'Aceitar mudança', tone: 'neutral', description: 'Escopo +40%, valor +20%.', effects: [{ type: 'scope', mult: 1.4 }, { type: 'cardValue', mult: 1.2 }, { type: 'clientSat', amount: 2 }] },
      { id: 'refuse', label: 'Manter escopo original', tone: 'risky', description: 'Protege o fluxo.', effects: [{ type: 'clientSat', amount: -4 }] },
      { id: 'split', label: 'Fatiar em nova demanda', tone: 'safe', description: 'A mudança vira outro card.', effects: [{ type: 'spawnCard', cardType: 'improvement', serviceClass: 'standard', priority: 'medium', complexity: 3 }] },
    ],
  },
  {
    id: 'incomplete-req', title: 'Requisito incompleto', icon: '❓', category: 'client', severity: 'warning', weight: 2.5, requires: ['cardInProgress'], cardStages: ['analysis', 'dev'],
    description: 'Faltam regras de negócio para concluir "{card}". O cliente ainda não respondeu.',
    effects: [{ type: 'blockCard', days: 2, reason: 'Requisito incompleto' }],
    lesson: 'blocked',
  },
  {
    id: 'req-changed', title: 'Requisito mudou', icon: '✏️', category: 'client', severity: 'warning', weight: 2, requires: ['cardInTest'], cardStages: ['test', 'uat'],
    description: 'Durante a validação de "{card}", o cliente percebeu que precisa de outro comportamento.',
    effects: [{ type: 'rework', amount: 3 }, { type: 'clientSat', amount: -1 }],
    lesson: 'rework',
  },
  {
    id: 'audit', title: 'Auditoria surpresa', icon: '🔍', category: 'client', severity: 'warning', weight: 1.5,
    description: 'Uma auditoria de compliance exige evidências e ajustes de segurança.',
    choices: [
      { id: 'comply', label: 'Priorizar adequação', tone: 'safe', description: 'Card de segurança com data fixa.', effects: [{ type: 'spawnCard', cardType: 'security', serviceClass: 'fixed', priority: 'high', complexity: 5 }] },
      { id: 'fine', label: 'Aceitar o risco', tone: 'risky', description: '50% de multa.', effects: [{ type: 'chance', p: 0.5, then: [{ type: 'money', amount: -20000 }, { type: 'clientSat', amount: -5 }], else: [], thenText: 'A auditoria aplicou multa.', elseText: 'A auditoria não encontrou problemas graves.' }] },
    ],
  },
  {
    id: 'regulatory', title: 'Prazo regulatório', icon: '⚖️', category: 'client', severity: 'critical', weight: 1.4,
    description: 'Um órgão regulador publicou uma nova norma com prazo curto de adequação.',
    effects: [{ type: 'spawnCard', cardType: 'security', serviceClass: 'fixed', priority: 'critical', complexity: 5, valueMult: 1.5, title: 'Adequação à nova norma regulatória' }],
    lesson: 'serviceClasses',
  },
  {
    id: 'client-complaint', title: 'Reclamação formal', icon: '📢', category: 'client', severity: 'warning', weight: 1.5, requires: ['minDay7'],
    description: '{client} enviou uma reclamação formal sobre prazos de entrega.',
    choices: [
      { id: 'meeting', label: 'Reunião de alinhamento', tone: 'safe', description: 'PO e gestor alinham expectativas.', effects: [{ type: 'capacity', scope: 'stage', stage: 'uat', mult: 0.7, days: 1, label: 'Reunião com cliente' }, { type: 'clientSat', amount: 4 }] },
      { id: 'discount', label: 'Oferecer desconto', tone: 'neutral', description: 'Compensação financeira.', cost: 'R$ 6.000', effects: [{ type: 'money', amount: -6000 }, { type: 'clientSat', amount: 6 }] },
    ],
  },
  {
    id: 'client-praise', title: 'Elogio do cliente', icon: '💬', category: 'client', severity: 'positive', weight: 1.2, requires: ['cardDone'],
    description: '{client} elogiou publicamente as últimas entregas do time.',
    effects: [{ type: 'teamMorale', amount: 6 }, { type: 'clientSat', amount: 3 }],
  },
  {
    id: 'new-contract', title: 'Novo contrato', icon: '📝', category: 'client', severity: 'positive', weight: 1,
    description: 'Um novo cliente assinou contrato e trouxe 3 demandas.',
    effects: [{ type: 'spawnCard', cardType: 'feature', serviceClass: 'standard', priority: 'medium' }, { type: 'spawnCard', cardType: 'integration', serviceClass: 'standard', priority: 'medium' }, { type: 'spawnCard', cardType: 'ux', serviceClass: 'standard', priority: 'low' }, { type: 'money', amount: 15000 }],
  },
  {
    id: 'demo-request', title: 'Demonstração urgente', icon: '🎬', category: 'client', severity: 'info', weight: 1.2, requires: ['cardInUat'],
    description: '{client} pediu uma demonstração amanhã para a diretoria.',
    choices: [
      { id: 'prepare', label: 'Preparar demo', tone: 'neutral', description: 'Homologação para por 1 dia.', effects: [{ type: 'capacity', scope: 'stage', stage: 'uat', mult: 0.4, days: 1, label: 'Preparando demo' }, { type: 'clientSat', amount: 5 }] },
      { id: 'decline', label: 'Remarcar', tone: 'risky', description: 'Mantém o fluxo.', effects: [{ type: 'clientSat', amount: -3 }] },
    ],
  },
  {
    id: 'client-budget-cut', title: 'Cliente cortou orçamento', icon: '📉', category: 'client', severity: 'warning', weight: 1, requires: ['cardInBacklog'], cardStages: ['backlog', 'ready'],
    description: '{client} reduziu o orçamento. O valor de "{card}" caiu.',
    effects: [{ type: 'cardValue', mult: 0.6 }],
  },
  {
    id: 'client-bonus', title: 'Bônus por performance', icon: '💎', category: 'client', severity: 'positive', weight: 0.8, requires: ['minDay7'],
    description: 'O contrato prevê bônus quando a satisfação está alta.',
    effects: [{ type: 'chance', p: 0.7, then: [{ type: 'money', amount: 12000 }], else: [], thenText: 'O cliente pagou o bônus de performance.', elseText: 'A satisfação não atingiu o mínimo para o bônus.' }],
  },
  {
    id: 'churn-risk', title: 'Risco de cancelamento', icon: '🚪', category: 'client', severity: 'critical', weight: 1, requires: ['minDay7'],
    description: '{client} ameaça cancelar o contrato se os bugs não diminuírem.',
    choices: [
      { id: 'quality-week', label: 'Semana da qualidade', tone: 'safe', description: 'Foco em bugs por 3 dias.', effects: [{ type: 'defectMod', mult: 0.6, days: 3, label: 'Semana da qualidade' }, { type: 'capacity', scope: 'all', mult: 0.9, days: 3, label: 'Semana da qualidade' }, { type: 'clientSat', amount: 5 }] },
      { id: 'promise', label: 'Prometer melhorias', tone: 'risky', description: 'Compra tempo.', effects: [{ type: 'chance', p: 0.5, then: [{ type: 'clientSat', amount: 1 }], else: [{ type: 'clientSat', amount: -12 }, { type: 'revenueMod', mult: 0.8, days: 5, label: 'Cliente reduziu uso' }], thenText: 'O cliente deu mais uma chance.', elseText: 'O cliente reduziu o contrato.' }] },
    ],
  },

  /* ============================ TÉCNICOS ============================ */
  {
    id: 'tech-debt-bites', title: 'Dívida técnica cobra a conta', icon: '💸', category: 'tech', severity: 'warning', weight: 2, requires: ['highTechDebt', 'cardInDev'], cardStages: ['dev', 'analysis'],
    description: 'Um módulo legado impede a evolução de "{card}". Será preciso refatorar antes.',
    effects: [{ type: 'scope', mult: 1.35 }, { type: 'spawnCard', cardType: 'techdebt', serviceClass: 'intangible', priority: 'medium', complexity: 5 }],
  },
  {
    id: 'architecture-block', title: 'Arquitetura bloqueando', icon: '🏗️', category: 'tech', severity: 'warning', weight: 1.8, requires: ['cardInDev'], cardStages: ['dev'],
    description: 'A arquitetura atual não suporta "{card}". É preciso uma decisão técnica.',
    choices: [
      { id: 'spike', label: 'Fazer spike técnico', tone: 'safe', description: 'Bloqueia 1 dia, reduz risco.', effects: [{ type: 'blockCard', days: 1, reason: 'Spike de arquitetura' }] },
      { id: 'workaround', label: 'Contornar (gambiarra)', tone: 'aggressive', description: 'Segue sem parar.', effects: [{ type: 'techDebt', amount: 5 }] },
    ],
  },
  {
    id: 'merge-conflict', title: 'Conflito de merge', icon: '🧩', category: 'tech', severity: 'info', weight: 2, requires: ['cardInDev'], cardStages: ['dev', 'review'],
    description: 'Muitos cards alterando os mesmos arquivos geraram um conflito complexo em {code}.',
    effects: [{ type: 'rework', amount: 2 }],
    lesson: 'wip',
  },
  {
    id: 'library-vuln', title: 'Vulnerabilidade em biblioteca', icon: '🦠', category: 'tech', severity: 'warning', weight: 1.5,
    description: 'Uma biblioteca popular usada no projeto tem uma vulnerabilidade crítica (CVE).',
    choices: [
      { id: 'patch', label: 'Atualizar agora', tone: 'safe', description: 'Card Expedite de segurança.', effects: [{ type: 'spawnCard', cardType: 'security', serviceClass: 'expedite', priority: 'critical', complexity: 2 }] },
      { id: 'later', label: 'Agendar atualização', tone: 'risky', description: 'Entra no backlog.', effects: [{ type: 'spawnCard', cardType: 'security', serviceClass: 'standard', priority: 'high', complexity: 2 }, { type: 'chance', p: 0.3, then: [{ type: 'clientSat', amount: -8 }, { type: 'money', amount: -10000 }], thenText: 'A vulnerabilidade foi explorada antes da correção.' }] },
    ],
  },
  {
    id: 'flaky-tests', title: 'Testes instáveis', icon: '🎲', category: 'tech', severity: 'info', weight: 1.8, requires: ['cardInTest'],
    description: 'Testes automatizados estão falhando aleatoriamente e ninguém confia no resultado.',
    effects: [{ type: 'capacity', scope: 'stage', stage: 'test', mult: 0.75, days: 2, label: 'Testes instáveis' }],
  },
  {
    id: 'perf-issue', title: 'Problema de performance', icon: '🐌', category: 'tech', severity: 'warning', weight: 1.5, requires: ['cardInTest'], cardStages: ['test', 'uat'],
    description: 'Os testes de carga de "{card}" mostraram tempo de resposta inaceitável.',
    effects: [{ type: 'rework', amount: 3 }],
  },
  {
    id: 'legacy-surprise', title: 'Surpresa no legado', icon: '🦖', category: 'tech', severity: 'warning', weight: 1.5, requires: ['cardInDev'], cardStages: ['dev'],
    description: 'Código legado sem documentação escondia regras que afetam "{card}".',
    effects: [{ type: 'scope', mult: 1.3 }, { type: 'techDebt', amount: 1 }],
  },
  {
    id: 'infra-cost-spike', title: 'Custo de nuvem disparou', icon: '☁️', category: 'tech', severity: 'warning', weight: 1.2,
    description: 'A fatura de nuvem veio 40% acima do previsto por recursos esquecidos.',
    choices: [
      { id: 'pay', label: 'Pagar e revisar depois', tone: 'neutral', description: 'Custo imediato.', cost: 'R$ 9.000', effects: [{ type: 'money', amount: -9000 }] },
      { id: 'finops', label: 'Força-tarefa FinOps', tone: 'safe', description: 'DevOps otimiza os recursos.', effects: [{ type: 'money', amount: -3000 }, { type: 'capacity', scope: 'stage', stage: 'deploy', mult: 0.5, days: 1, label: 'FinOps' }] },
    ],
  },
  {
    id: 'api-deprecated', title: 'API descontinuada', icon: '⛔', category: 'tech', severity: 'warning', weight: 1, requires: ['minDay3'],
    description: 'Um fornecedor anunciou que a versão da API usada será desligada em breve.',
    effects: [{ type: 'spawnCard', cardType: 'integration', serviceClass: 'fixed', priority: 'high', complexity: 5, valueMult: 0.6, title: 'Migrar para nova versão da API do fornecedor' }],
  },
  {
    id: 'refactor-opportunity', title: 'Oportunidade de refatoração', icon: '🧹', category: 'tech', severity: 'info', weight: 1.2,
    description: 'O arquiteto sugere uma refatoração que facilitaria as próximas entregas.',
    choices: [
      { id: 'do', label: 'Adicionar ao backlog', tone: 'safe', description: 'Card intangível de dívida técnica.', effects: [{ type: 'spawnCard', cardType: 'techdebt', serviceClass: 'intangible', priority: 'medium', complexity: 3 }] },
      { id: 'skip', label: 'Ignorar', tone: 'risky', description: 'Dívida continua crescendo.', effects: [{ type: 'techDebt', amount: 2 }] },
    ],
  },
  {
    id: 'dependency-hell', title: 'Dependência quebrada', icon: '📦', category: 'tech', severity: 'warning', weight: 1.2, requires: ['cardInDev'], cardStages: ['dev', 'review'],
    description: 'Uma atualização automática de pacote quebrou o build de {code}.',
    effects: [{ type: 'blockCard', days: 1, reason: 'Build quebrado por dependência' }],
  },
  {
    id: 'data-migration', title: 'Migração de dados necessária', icon: '🚚', category: 'tech', severity: 'info', weight: 1, requires: ['hasDBA'],
    description: 'Para evoluir o produto será necessário migrar a estrutura de dados.',
    effects: [{ type: 'spawnCard', cardType: 'infra', serviceClass: 'standard', priority: 'medium', complexity: 5, title: 'Migração da estrutura de dados' }],
  },
  {
    id: 'monitoring-alert', title: 'Alerta preventivo', icon: '📟', category: 'tech', severity: 'info', weight: 1,
    description: 'O monitoramento detectou degradação antes de afetar clientes.',
    effects: [{ type: 'spawnCard', cardType: 'bug', serviceClass: 'standard', priority: 'medium', complexity: 2, title: 'Corrigir degradação detectada pelo monitoramento' }],
  },
  {
    id: 'env-config-drift', title: 'Configuração divergente', icon: '⚙️', category: 'tech', severity: 'info', weight: 1.2, requires: ['cardInUat'], cardStages: ['uat', 'deploy'],
    description: 'Homologação e produção estão com configurações diferentes para {code}.',
    effects: [{ type: 'blockCard', days: 1, reason: 'Configuração de ambiente divergente' }],
  },
  {
    id: 'knowledge-silo', title: 'Silo de conhecimento', icon: '🏝️', category: 'tech', severity: 'warning', weight: 1, requires: ['person'],
    description: 'Só {person} conhece um módulo crítico. Qualquer ausência vira um risco.',
    choices: [
      { id: 'share', label: 'Sessões de compartilhamento', tone: 'safe', description: 'Capacidade -10% hoje.', effects: [{ type: 'capacity', scope: 'all', mult: 0.9, days: 1, label: 'Compartilhamento de conhecimento' }, { type: 'techDebt', amount: -2 }, { type: 'teamMorale', amount: 2 }] },
      { id: 'ignore', label: 'Seguir assim', tone: 'risky', description: 'Risco futuro.', effects: [{ type: 'techDebt', amount: 2 }] },
    ],
  },

  /* ============================ PROCESSO ============================ */
  {
    id: 'unexpected-meeting', title: 'Reunião inesperada', icon: '📅', category: 'process', severity: 'info', weight: 2.5,
    description: 'A diretoria convocou uma reunião de alinhamento de 3 horas com todo o time.',
    choices: [
      { id: 'all', label: 'Todos participam', tone: 'neutral', description: 'Capacidade -30% hoje.', effects: [{ type: 'capacity', scope: 'all', mult: 0.7, days: 1, label: 'Reunião geral' }, { type: 'xp', amount: 80 }] },
      { id: 'rep', label: 'Enviar só o PO', tone: 'safe', description: 'Protege o time.', effects: [{ type: 'capacity', scope: 'stage', stage: 'uat', mult: 0.6, days: 1, label: 'PO em reunião' }, { type: 'clientSat', amount: -1 }] },
    ],
  },
  {
    id: 'training-day', title: 'Treinamento obrigatório', icon: '🎯', category: 'process', severity: 'info', weight: 1.2,
    description: 'O RH marcou treinamento obrigatório de compliance para todos.',
    effects: [{ type: 'capacity', scope: 'all', mult: 0.75, days: 1, label: 'Treinamento obrigatório' }, { type: 'xp', amount: 60 }],
  },
  {
    id: 'context-switch', title: 'Interrupções constantes', icon: '🔔', category: 'process', severity: 'info', weight: 1.5, requires: ['cardInProgress'],
    description: 'Mensagens e pedidos paralelos fragmentam o foco do time.',
    choices: [
      { id: 'focus', label: 'Criar horário de foco', tone: 'safe', description: 'Bloqueia interrupções.', effects: [{ type: 'capacity', scope: 'all', mult: 1.08, days: 3, label: 'Horário de foco' }, { type: 'clientSat', amount: -1 }] },
      { id: 'accept', label: 'Aceitar interrupções', tone: 'neutral', description: 'Clientes atendidos na hora.', effects: [{ type: 'capacity', scope: 'all', mult: 0.88, days: 2, label: 'Interrupções' }, { type: 'clientSat', amount: 1 }] },
    ],
    lesson: 'wip',
  },
  {
    id: 'retro-insight', title: 'Insight da retrospectiva', icon: '🔄', category: 'process', severity: 'positive', weight: 1.2, requires: ['minDay7'],
    description: 'Na retrospectiva o time identificou desperdícios no processo.',
    effects: [{ type: 'capacity', scope: 'all', mult: 1.07, days: 4, label: 'Melhoria contínua' }, { type: 'teamMorale', amount: 3 }],
  },
  {
    id: 'status-report', title: 'Pedido de status report', icon: '📊', category: 'process', severity: 'info', weight: 1.4,
    description: 'A gerência pede um relatório detalhado de status até o fim do dia.',
    choices: [
      { id: 'write', label: 'PO escreve o relatório', tone: 'neutral', description: 'PO fica ocupado.', effects: [{ type: 'capacity', scope: 'stage', stage: 'uat', mult: 0.6, days: 1, label: 'Relatório de status' }] },
      { id: 'board', label: 'Compartilhar o quadro Kanban', tone: 'safe', description: 'Transparência radical.', effects: [{ type: 'chance', p: 0.7, then: [{ type: 'xp', amount: 100 }], else: [{ type: 'clientSat', amount: -2 }], thenText: 'A gerência adorou a visibilidade do quadro.', elseText: 'A gerência queria um documento formal.' }] },
    ],
  },
  {
    id: 'estimation-pressure', title: 'Pressão por estimativas', icon: '🧮', category: 'process', severity: 'info', weight: 1.2,
    description: 'O comercial quer datas exatas para todas as demandas do backlog.',
    choices: [
      { id: 'estimate', label: 'Estimar tudo', tone: 'neutral', description: 'Time gasta horas estimando.', effects: [{ type: 'capacity', scope: 'stage', stage: 'analysis', mult: 0.5, days: 1, label: 'Estimativas' }, { type: 'clientSat', amount: 2 }] },
      { id: 'forecast', label: 'Usar previsão probabilística', tone: 'safe', description: 'Usa o histórico de throughput.', effects: [{ type: 'xp', amount: 120 }, { type: 'chance', p: 0.5, then: [{ type: 'clientSat', amount: 2 }], else: [{ type: 'clientSat', amount: -2 }], thenText: 'O comercial entendeu as faixas de confiança.', elseText: 'O comercial não gostou de faixas de probabilidade.' }] },
    ],
  },
  {
    id: 'push-from-boss', title: 'Diretoria quer mais features', icon: '📣', category: 'process', severity: 'warning', weight: 1.4, requires: ['cardInBacklog'],
    description: 'A diretoria exige que o time comece mais 3 features imediatamente, "para ninguém ficar parado".',
    choices: [
      { id: 'push', label: 'Iniciar agora', tone: 'aggressive', description: 'Empurra 3 cards para Análise ignorando o WIP.', effects: [{ type: 'wipTemporary', stage: 'analysis', delta: 3 }, { type: 'clientSat', amount: 1 }] },
      { id: 'explain', label: 'Explicar o sistema puxado', tone: 'safe', description: 'Mostra dados de fluxo.', effects: [{ type: 'chance', p: 0.65, then: [{ type: 'xp', amount: 150 }], else: [{ type: 'teamMorale', amount: -3 }, { type: 'clientSat', amount: -2 }], thenText: 'A diretoria entendeu: fluxo > utilização.', elseText: 'A diretoria ficou irritada.' }] },
    ],
    lesson: 'pull',
  },
  {
    id: 'process-audit', title: 'Revisão de processo', icon: '🗂️', category: 'process', severity: 'info', weight: 0.8,
    description: 'O PMO revisou o processo e sugeriu uma melhoria no fluxo.',
    effects: [{ type: 'blockMod', mult: 0.8, days: 5, label: 'Processo revisado' }],
  },
  {
    id: 'dependency-other-team', title: 'Dependência de outro time', icon: '🔗', category: 'process', severity: 'warning', weight: 1.6, requires: ['cardInProgress'],
    description: '"{card}" depende de uma entrega de outro time que atrasou.',
    effects: [{ type: 'blockCard', days: 3, reason: 'Aguardando entrega de outro time' }],
    lesson: 'blocked',
  },
  {
    id: 'change-freeze', title: 'Congelamento de mudanças', icon: '🧊', category: 'process', severity: 'warning', weight: 0.9, requires: ['minDay7'],
    description: 'A operação declarou freeze de mudanças em produção por 2 dias.',
    effects: [{ type: 'capacity', scope: 'stage', stage: 'deploy', mult: 0.05, days: 2, label: 'Change freeze' }],
    lesson: 'bottleneck',
  },

  /* ============================ NEGÓCIO ============================ */
  {
    id: 'investor', title: 'Rodada de investimento', icon: '💰', category: 'business', severity: 'positive', weight: 0.8, requires: ['minDay7'],
    description: 'Investidores ficaram impressionados com o ritmo de entregas.',
    effects: [{ type: 'money', amount: 30000 }, { type: 'teamMorale', amount: 5 }],
  },
  {
    id: 'competitor', title: 'Concorrente lançou feature', icon: '🥊', category: 'business', severity: 'warning', weight: 1.2,
    description: 'Um concorrente lançou uma funcionalidade parecida. Precisamos responder.',
    choices: [
      { id: 'match', label: 'Responder rápido', tone: 'aggressive', description: 'Nova feature Expedite.', effects: [{ type: 'spawnCard', cardType: 'feature', serviceClass: 'expedite', priority: 'high', complexity: 5, valueMult: 1.3 }] },
      { id: 'differentiate', label: 'Focar no diferencial', tone: 'safe', description: 'Mantém a estratégia.', effects: [{ type: 'revenueMod', mult: 0.9, days: 4, label: 'Pressão da concorrência' }] },
    ],
  },
  {
    id: 'marketing-campaign', title: 'Campanha de marketing', icon: '📺', category: 'business', severity: 'info', weight: 1,
    description: 'O marketing lançou uma campanha e o tráfego vai triplicar nos próximos dias.',
    effects: [{ type: 'revenueMod', mult: 1.3, days: 4, label: 'Campanha de marketing' }, { type: 'blockMod', mult: 1.2, days: 3, label: 'Alta carga' }],
  },
  {
    id: 'consulting', title: 'Consultoria disponível', icon: '🧑‍🏫', category: 'business', severity: 'info', weight: 1,
    description: 'Uma consultoria ágil oferece um diagnóstico do fluxo do time.',
    choices: [
      { id: 'hire', label: 'Contratar consultoria', tone: 'neutral', description: 'Melhora o fluxo por 5 dias.', cost: 'R$ 15.000', effects: [{ type: 'money', amount: -15000 }, { type: 'capacity', scope: 'all', mult: 1.1, days: 5, label: 'Consultoria ágil' }, { type: 'xp', amount: 200 }] },
      { id: 'no', label: 'Dispensar', tone: 'neutral', description: 'Economiza.', effects: [] },
    ],
  },
  {
    id: 'tax-surprise', title: 'Imposto inesperado', icon: '🧾', category: 'business', severity: 'warning', weight: 0.8,
    description: 'A contabilidade identificou um imposto retroativo.',
    effects: [{ type: 'money', amount: -9000 }],
  },
  {
    id: 'partnership', title: 'Parceria estratégica', icon: '🤝', category: 'business', severity: 'positive', weight: 0.8,
    description: 'Um parceiro quer integrar com nossa plataforma e divide os custos.',
    effects: [{ type: 'spawnCard', cardType: 'integration', serviceClass: 'standard', priority: 'high', valueMult: 1.6 }, { type: 'money', amount: 8000 }],
  },
  {
    id: 'demand-surge', title: 'Pico de demanda', icon: '📈', category: 'business', severity: 'warning', weight: 1.2,
    description: 'Clientes estão enviando muitos pedidos novos esta semana.',
    effects: [{ type: 'arrivalMod', mult: 1.8, days: 3, label: 'Pico de demanda' }],
    lesson: 'wip',
  },

  /* ============================ POSITIVOS ============================ */
  {
    id: 'productive-day', title: 'Dia inspirado', icon: '✨', category: 'positive', severity: 'positive', weight: 1.5,
    description: 'O time acordou inspirado. Energia e foco em alta.',
    effects: [{ type: 'capacity', scope: 'all', mult: 1.15, days: 1, label: 'Dia inspirado' }, { type: 'teamEnergy', amount: 8 }],
  },
  {
    id: 'tool-discovered', title: 'Nova ferramenta', icon: '🧰', category: 'positive', severity: 'positive', weight: 1,
    description: 'Um dev encontrou uma ferramenta que acelera os testes.',
    effects: [{ type: 'capacity', scope: 'stage', stage: 'test', mult: 1.2, days: 4, label: 'Nova ferramenta de testes' }],
  },
  {
    id: 'api-early', title: 'Parceiro adiantou entrega', icon: '🎁', category: 'positive', severity: 'positive', weight: 1,
    description: 'Um fornecedor liberou a API antes do prazo. Bloqueios externos diminuem.',
    effects: [{ type: 'blockMod', mult: 0.5, days: 3, label: 'Fornecedor adiantado' }],
  },
  {
    id: 'team-celebration', title: 'Celebração do time', icon: '🎉', category: 'positive', severity: 'positive', weight: 1, requires: ['cardDone'],
    description: 'O time celebrou as últimas entregas com um happy hour.',
    effects: [{ type: 'teamMorale', amount: 7 }, { type: 'teamStress', amount: -8 }, { type: 'money', amount: -1500 }],
  },
  {
    id: 'reuse-component', title: 'Componente reaproveitado', icon: '♻️', category: 'positive', severity: 'positive', weight: 1.2, requires: ['cardInDev'], cardStages: ['dev', 'analysis'],
    description: 'Um componente existente reduz bastante o esforço de "{card}".',
    effects: [{ type: 'scope', mult: 0.65 }],
  },
  {
    id: 'grant', title: 'Incentivo à inovação', icon: '🏛️', category: 'positive', severity: 'positive', weight: 0.6,
    description: 'A empresa recebeu um incentivo fiscal por investir em inovação.',
    effects: [{ type: 'money', amount: 18000 }],
  },
  {
    id: 'self-healing', title: 'Bug resolvido sozinho', icon: '🍀', category: 'positive', severity: 'positive', weight: 0.8, requires: ['cardInBacklog'], cardTypes: ['bug'],
    description: 'Uma atualização do fornecedor corrigiu o problema de "{card}". Menos trabalho!',
    effects: [{ type: 'scope', mult: 0.3 }],
  },
  {
    id: 'good-review', title: 'Review exemplar', icon: '🔬', category: 'positive', severity: 'positive', weight: 1, requires: ['cardInDev'],
    description: 'Um code review minucioso ensinou boas práticas a todo o time.',
    effects: [{ type: 'defectMod', mult: 0.75, days: 4, label: 'Aprendizado do review' }, { type: 'xp', amount: 80 }],
  },
  {
    id: 'energized', title: 'Fim de semana prolongado', icon: '🌴', category: 'positive', severity: 'positive', weight: 0.8,
    description: 'Um feriado deu ao time um descanso extra.',
    effects: [{ type: 'teamEnergy', amount: 25 }, { type: 'teamStress', amount: -15 }],
  },
];
