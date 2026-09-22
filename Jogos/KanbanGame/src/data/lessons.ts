/** Momentos de aprendizado — disparados por situações reais da partida */
export interface LessonDef {
  id: string;
  concept: string;
  title: string;
  icon: string;
  body: string;
  takeaway: string;
  /** Tipo de visualização ilustrativa com dados da partida */
  visual: 'wip' | 'leadcycle' | 'throughput' | 'pull' | 'classes' | 'bottleneck' | 'blocked' | 'rework' | 'littles' | 'efficiency' | 'debt' | 'burnout' | 'deps' | 'expedite';
}

export const LESSONS: Record<string, LessonDef> = {
  wip: { id: 'wip', concept: 'WIP — Work in Progress', title: 'Limite de WIP ultrapassado', icon: '🚦', visual: 'wip',
    body: 'WIP é a quantidade de trabalho iniciado e ainda não terminado. Quando um estágio passa do limite, as pessoas dividem a atenção entre mais tarefas: o contexto se perde, os bugs aumentam e cada card demora mais para sair.',
    takeaway: 'Limite o WIP para terminar mais rápido. Pare de começar, comece a terminar.' },
  leadTime: { id: 'leadTime', concept: 'Lead Time × Cycle Time', title: 'Sua primeira entrega!', icon: '⏱️', visual: 'leadcycle',
    body: 'Lead Time é o tempo desde o comprometimento (entrada em Ready) até a entrega. Cycle Time é o tempo desde o início do trabalho (Análise) até a entrega. A diferença entre os dois é tempo de espera na fila.',
    takeaway: 'Clientes sentem o Lead Time. Filas longas em Ready aumentam o Lead Time sem que ninguém esteja trabalhando.' },
  throughput: { id: 'throughput', concept: 'Throughput', title: 'Medindo a vazão', icon: '📦', visual: 'throughput',
    body: 'Throughput é a quantidade de itens entregues por período. Ele é a melhor base para previsões: em vez de estimar cada card, use o histórico de entregas por dia.',
    takeaway: 'Throughput estável e previsível vale mais do que picos de produtividade.' },
  pull: { id: 'pull', concept: 'Sistema Puxado', title: 'Alguém ficou sem trabalho', icon: '🧲', visual: 'pull',
    body: 'Em um sistema puxado, um estágio só puxa trabalho novo quando tem capacidade. Ficar ocioso por um momento não é desperdício: iniciar mais trabalho sem capacidade a jusante só cria filas.',
    takeaway: 'FLUXO > UTILIZAÇÃO INDIVIDUAL. Quem está livre deve ajudar a terminar, não começar algo novo.' },
  serviceClasses: { id: 'serviceClasses', concept: 'Classes de Serviço', title: 'Nem todo trabalho é igual', icon: '🎚️', visual: 'classes',
    body: 'Classes de serviço definem como cada tipo de demanda é tratado: Expedite fura a fila, Fixed Date tem prazo imutável, Standard segue o fluxo e Intangible reduz riscos futuros.',
    takeaway: 'Use Expedite com moderação: cada expedite interrompe todo o resto.' },
  expedite: { id: 'expedite', concept: 'Expedite', title: 'Chegou um Expedite!', icon: '⚡', visual: 'expedite',
    body: 'Cards Expedite são trabalhados antes de todos os outros e não contam para o limite de WIP. Em compensação, reduzem a capacidade dos demais cards do estágio e perdem valor muito rápido.',
    takeaway: 'Resolva expedites rápido e volte ao fluxo normal.' },
  bottleneck: { id: 'bottleneck', concept: 'Gargalo', title: 'Gargalo detectado', icon: '🍾', visual: 'bottleneck',
    body: 'O gargalo é o estágio com menor capacidade em relação à demanda. O sistema inteiro só entrega na velocidade do gargalo — melhorar qualquer outro estágio não aumenta as entregas.',
    takeaway: 'Identifique o gargalo, proteja-o e desloque pessoas para ajudá-lo.' },
  blocked: { id: 'blocked', concept: 'Bloqueios', title: 'Um card foi bloqueado', icon: '🔒', visual: 'blocked',
    body: 'Cards bloqueados continuam ocupando WIP, mas não avançam. O tempo bloqueado entra inteiro no Lead Time. Bloqueios externos (APIs, clientes, fornecedores) são os mais comuns.',
    takeaway: 'Torne bloqueios visíveis e escale cedo. Tempo bloqueado é tempo de espera puro.' },
  rework: { id: 'rework', concept: 'Retrabalho', title: 'Bug encontrado — retrabalho', icon: '🔁', visual: 'rework',
    body: 'Defeitos encontrados em Review, Testes ou Homologação fazem o card voltar ao desenvolvimento. Encontrar cedo é barato; um bug que escapa para produção volta como demanda nova, com cliente insatisfeito.',
    takeaway: 'Qualidade não atrasa o fluxo — retrabalho sim.' },
  littlesLaw: { id: 'littlesLaw', concept: 'Lei de Little', title: 'A matemática do fluxo', icon: '🧮', visual: 'littles',
    body: 'Lead Time médio = WIP médio ÷ Throughput médio. Se você aumenta o WIP sem aumentar a vazão, o Lead Time sobe na mesma proporção.',
    takeaway: 'A forma mais barata de reduzir o Lead Time é reduzir o WIP.' },
  flowEfficiency: { id: 'flowEfficiency', concept: 'Eficiência do Fluxo', title: 'Quanto tempo é trabalho de verdade?', icon: '🌊', visual: 'efficiency',
    body: 'Eficiência do fluxo = tempo ativo ÷ Lead Time. Em muitas empresas os cards passam mais de 70% do tempo esperando: em filas, bloqueados ou aguardando outro estágio.',
    takeaway: 'Reduzir espera costuma render mais do que trabalhar mais rápido.' },
  techDebt: { id: 'techDebt', concept: 'Dívida Técnica', title: 'A dívida técnica está alta', icon: '💸', visual: 'debt',
    body: 'Atalhos e gambiarras cobram juros: a dívida técnica reduz a produtividade em desenvolvimento e aumenta a chance de bugs. Cards de refatoração (Intangible) pagam essa dívida.',
    takeaway: 'Reserve capacidade contínua para pagar dívida técnica.' },
  burnout: { id: 'burnout', concept: 'Ritmo Sustentável', title: 'Burnout no time', icon: '🥵', visual: 'burnout',
    body: 'Trabalhar sempre no limite, com horas extras e muito WIP, esgota as pessoas. Energia baixa reduz a capacidade real e aumenta defeitos.',
    takeaway: 'Um time descansado entrega mais do que um time sobrecarregado.' },
  dependencies: { id: 'dependencies', concept: 'Dependências', title: 'Card com dependência aberta', icon: '🔗', visual: 'deps',
    body: 'Um card que depende de outro não pode concluir o desenvolvimento antes da dependência chegar à Homologação. Puxar cards dependentes cedo demais só ocupa WIP.',
    takeaway: 'Sequencie o trabalho: termine as dependências primeiro.' },
};
