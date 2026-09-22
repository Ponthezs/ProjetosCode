import type { CardType, TaskTemplate, TechArea } from '../types';

const t = (title: string, type: CardType, tech: TechArea, tags: string[], complexity: number, value: number, risk: number): TaskTemplate => ({
  title, type, tech, tags, complexity, value, risk,
});

/** 100 demandas de demonstração. Valores base — o gerador aplica variações por cliente, dificuldade e seed. */
export const TASK_TEMPLATES: TaskTemplate[] = [
  // ---------------- FEATURES (30)
  t('Integração com gateway de pagamentos', 'feature', 'backend', ['Backend', 'API', 'Financeiro'], 8, 22000, 0.45),
  t('Checkout em uma página', 'feature', 'fullstack', ['Frontend', 'Checkout'], 8, 26000, 0.35),
  t('Login social (Google e Apple)', 'feature', 'fullstack', ['Auth', 'Frontend'], 5, 12000, 0.3),
  t('Painel de indicadores do cliente', 'feature', 'frontend', ['Dashboard', 'Frontend'], 5, 14000, 0.2),
  t('Exportação de relatórios em PDF', 'feature', 'backend', ['Relatórios', 'Backend'], 3, 7000, 0.15),
  t('Notificações push no app', 'feature', 'fullstack', ['Mobile', 'Push'], 5, 11000, 0.3),
  t('Carrinho persistente multi-dispositivo', 'feature', 'backend', ['Checkout', 'Backend'], 5, 13000, 0.25),
  t('Programa de fidelidade com pontos', 'feature', 'fullstack', ['Fidelidade', 'Financeiro'], 13, 38000, 0.5),
  t('Agendamento online de consultas', 'feature', 'fullstack', ['Agenda', 'Saúde'], 8, 24000, 0.35),
  t('Prontuário eletrônico — resumo clínico', 'feature', 'backend', ['Saúde', 'Backend', 'LGPD'], 13, 42000, 0.55),
  t('Pix com QR Code dinâmico', 'feature', 'backend', ['Pix', 'Financeiro', 'API'], 8, 30000, 0.45),
  t('Onboarding digital com selfie', 'feature', 'fullstack', ['KYC', 'Mobile'], 8, 27000, 0.5),
  t('Busca com autocomplete inteligente', 'feature', 'fullstack', ['Busca', 'Frontend'], 5, 15000, 0.3),
  t('Recomendação de produtos', 'feature', 'data', ['Dados', 'ML'], 8, 25000, 0.5),
  t('Emissão de segunda via de boleto', 'feature', 'backend', ['Financeiro', 'Backend'], 2, 5000, 0.1),
  t('Multi-idioma (i18n) no portal', 'feature', 'frontend', ['Frontend', 'i18n'], 5, 9000, 0.2),
  t('Chat de atendimento em tempo real', 'feature', 'fullstack', ['WebSocket', 'Atendimento'], 8, 21000, 0.4),
  t('Gestão de assinaturas recorrentes', 'feature', 'backend', ['Billing', 'SaaS'], 8, 32000, 0.4),
  t('Cupom de desconto progressivo', 'feature', 'backend', ['Promoções', 'Checkout'], 3, 9000, 0.2),
  t('Autorização prévia de procedimentos', 'feature', 'backend', ['Saúde', 'Regras'], 8, 28000, 0.45),
  t('Rastreamento de pedidos em tempo real', 'feature', 'fullstack', ['Logística', 'Mapa'], 5, 16000, 0.3),
  t('Módulo de cotação para indústria', 'feature', 'backend', ['B2B', 'Backend'], 8, 23000, 0.35),
  t('Painel de telemedicina', 'feature', 'fullstack', ['Saúde', 'Vídeo'], 13, 45000, 0.55),
  t('Open Finance — compartilhamento de dados', 'feature', 'backend', ['Open Finance', 'API', 'Regulatório'], 13, 48000, 0.6),
  t('Wishlist compartilhável', 'feature', 'frontend', ['Frontend', 'Social'], 2, 4500, 0.1),
  t('Cálculo automático de frete', 'feature', 'backend', ['Logística', 'API'], 3, 8500, 0.25),
  t('Portal do servidor público', 'feature', 'fullstack', ['Governo', 'Portal'], 8, 26000, 0.35),
  t('Simulador de crédito', 'feature', 'fullstack', ['Crédito', 'Financeiro'], 5, 18000, 0.3),
  t('Assinatura eletrônica de contratos', 'feature', 'backend', ['Jurídico', 'API'], 5, 17000, 0.35),
  t('Modo offline no app de campo', 'feature', 'fullstack', ['Mobile', 'Sync'], 13, 34000, 0.55),

  // ---------------- BUGS (12)
  t('Erro 500 ao salvar endereço', 'bug', 'backend', ['Backend', 'Cadastro'], 2, 3000, 0.2),
  t('Botão de pagamento duplicando pedidos', 'bug', 'fullstack', ['Checkout', 'Crítico'], 3, 9000, 0.35),
  t('Layout quebrado no Safari', 'bug', 'frontend', ['Frontend', 'Browser'], 1, 1500, 0.1),
  t('Cálculo de juros com arredondamento incorreto', 'bug', 'backend', ['Financeiro', 'Cálculo'], 3, 8000, 0.3),
  t('Timeout na listagem de pacientes', 'bug', 'data', ['Performance', 'Saúde'], 5, 7000, 0.4),
  t('E-mail de confirmação não enviado', 'bug', 'backend', ['Notificação'], 2, 2500, 0.2),
  t('Filtro de datas ignora fuso horário', 'bug', 'backend', ['Datas', 'Relatórios'], 2, 3000, 0.25),
  t('Upload de imagens falha acima de 5MB', 'bug', 'fullstack', ['Upload'], 2, 2000, 0.2),
  t('Sessão expira durante o checkout', 'bug', 'fullstack', ['Auth', 'Checkout'], 3, 6000, 0.3),
  t('Relatório financeiro com totais divergentes', 'bug', 'data', ['Financeiro', 'Dados'], 5, 8500, 0.4),
  t('Acessibilidade: leitor de tela não lê formulário', 'bug', 'frontend', ['A11y', 'Frontend'], 2, 2500, 0.1),
  t('Estoque negativo após cancelamento', 'bug', 'backend', ['Estoque', 'Backend'], 3, 6500, 0.3),

  // ---------------- MELHORIAS (12)
  t('Melhorar performance da página inicial', 'improvement', 'frontend', ['Performance', 'Frontend'], 3, 6000, 0.2),
  t('Paginação infinita no catálogo', 'improvement', 'frontend', ['Frontend', 'Catálogo'], 2, 4000, 0.1),
  t('Cache de consultas frequentes', 'improvement', 'backend', ['Performance', 'Cache'], 3, 7500, 0.25),
  t('Novos filtros no relatório gerencial', 'improvement', 'fullstack', ['Relatórios'], 3, 5500, 0.15),
  t('Validação de CPF em tempo real', 'improvement', 'frontend', ['Formulário'], 1, 2000, 0.05),
  t('Otimizar consultas do dashboard', 'improvement', 'data', ['Dados', 'Performance'], 5, 9000, 0.3),
  t('Histórico de alterações do pedido', 'improvement', 'backend', ['Auditoria'], 3, 5000, 0.15),
  t('Compressão de imagens automática', 'improvement', 'backend', ['Mídia', 'Performance'], 2, 3500, 0.15),
  t('Atalhos de teclado no backoffice', 'improvement', 'frontend', ['Backoffice'], 2, 2500, 0.05),
  t('Reenvio automático de notificações', 'improvement', 'backend', ['Notificação', 'Resiliência'], 3, 4500, 0.2),
  t('Melhorar mensagens de erro', 'improvement', 'frontend', ['UX', 'Frontend'], 1, 1800, 0.05),
  t('Pré-carregamento de dados do perfil', 'improvement', 'fullstack', ['Performance'], 2, 3200, 0.15),

  // ---------------- TECH DEBT (10)
  t('Refatorar módulo de pagamentos legado', 'techdebt', 'backend', ['Legado', 'Refactor'], 13, 0, 0.5),
  t('Remover dependências obsoletas', 'techdebt', 'fullstack', ['Dependências'], 3, 0, 0.2),
  t('Cobertura de testes no core de pedidos', 'techdebt', 'backend', ['Testes', 'Core'], 5, 0, 0.15),
  t('Migrar jQuery para React', 'techdebt', 'frontend', ['Frontend', 'Legado'], 8, 0, 0.35),
  t('Separar monólito: serviço de clientes', 'techdebt', 'backend', ['Arquitetura', 'Microsserviços'], 13, 0, 0.55),
  t('Padronizar tratamento de erros', 'techdebt', 'backend', ['Qualidade'], 3, 0, 0.15),
  t('Normalizar tabelas de cadastro', 'techdebt', 'data', ['Banco de dados'], 5, 0, 0.35),
  t('Eliminar código morto do backoffice', 'techdebt', 'fullstack', ['Limpeza'], 2, 0, 0.1),
  t('Atualizar framework para versão LTS', 'techdebt', 'fullstack', ['Upgrade'], 8, 0, 0.45),
  t('Documentar contratos de API internos', 'techdebt', 'backend', ['Documentação', 'API'], 2, 0, 0.05),

  // ---------------- INTEGRAÇÕES (10)
  t('Integração com ERP SAP', 'integration', 'backend', ['ERP', 'API'], 13, 36000, 0.65),
  t('Integração TISS com operadoras', 'integration', 'backend', ['TISS', 'Saúde', 'API'], 8, 29000, 0.6),
  t('Webhook de conciliação bancária', 'integration', 'backend', ['Banco', 'Financeiro'], 5, 16000, 0.5),
  t('Integração com marketplace', 'integration', 'backend', ['Marketplace', 'API'], 8, 27000, 0.55),
  t('Sincronização com CRM', 'integration', 'backend', ['CRM', 'API'], 5, 14000, 0.45),
  t('Integração com transportadoras', 'integration', 'backend', ['Logística', 'API'], 5, 15000, 0.5),
  t('Conexão com bureau de crédito', 'integration', 'backend', ['Crédito', 'API'], 5, 19000, 0.5),
  t('Integração com laboratório de exames', 'integration', 'backend', ['Saúde', 'HL7'], 8, 24000, 0.6),
  t('Integração eSocial', 'integration', 'backend', ['Governo', 'Regulatório'], 8, 22000, 0.6),
  t('API pública para parceiros', 'integration', 'backend', ['API', 'Parceiros'], 8, 25000, 0.4),

  // ---------------- SEGURANÇA (8)
  t('Autenticação multifator (MFA)', 'security', 'security', ['Segurança', 'Auth'], 5, 12000, 0.3),
  t('Criptografia de dados sensíveis (LGPD)', 'security', 'security', ['LGPD', 'Criptografia'], 8, 15000, 0.4),
  t('Correção de vulnerabilidade XSS', 'security', 'security', ['OWASP', 'Frontend'], 2, 6000, 0.2),
  t('Rate limiting nas APIs públicas', 'security', 'security', ['API', 'Proteção'], 3, 7000, 0.2),
  t('Auditoria de acessos administrativos', 'security', 'security', ['Auditoria', 'Compliance'], 5, 9000, 0.25),
  t('Rotação automática de segredos', 'security', 'security', ['Secrets', 'DevOps'], 3, 5000, 0.3),
  t('Pentest: correção de achados críticos', 'security', 'security', ['Pentest'], 8, 14000, 0.45),
  t('Consentimento e anonimização LGPD', 'security', 'security', ['LGPD', 'Dados'], 5, 11000, 0.3),

  // ---------------- INFRAESTRUTURA (9)
  t('Pipeline de CI/CD para o app mobile', 'infra', 'infra', ['CI/CD', 'Mobile'], 5, 6000, 0.3),
  t('Auto scaling do cluster Kubernetes', 'infra', 'infra', ['Kubernetes', 'Escala'], 8, 11000, 0.45),
  t('Backup automatizado do banco', 'infra', 'infra', ['Backup', 'Banco'], 3, 5000, 0.2),
  t('CDN para arquivos estáticos', 'infra', 'infra', ['CDN', 'Performance'], 2, 4500, 0.15),
  t('Observabilidade com tracing distribuído', 'infra', 'infra', ['Observabilidade'], 5, 7000, 0.3),
  t('Ambiente de homologação efêmero', 'infra', 'infra', ['Ambientes'], 8, 8000, 0.4),
  t('Migração do banco para nova versão', 'infra', 'data', ['Banco', 'Migração'], 8, 9000, 0.55),
  t('Alertas de disponibilidade (SLO)', 'infra', 'infra', ['Monitoramento', 'SLO'], 3, 5500, 0.15),
  t('Infra como código (Terraform)', 'infra', 'infra', ['IaC'], 5, 6500, 0.3),

  // ---------------- UX/UI (9)
  t('Redesign do fluxo de cadastro', 'ux', 'ux', ['UX', 'Conversão'], 5, 14000, 0.25),
  t('Design system: componentes base', 'ux', 'ux', ['Design System'], 8, 12000, 0.3),
  t('Modo escuro no app', 'ux', 'ux', ['UI', 'Mobile'], 3, 6000, 0.15),
  t('Nova home personalizada', 'ux', 'ux', ['UX', 'Personalização'], 5, 15000, 0.3),
  t('Microinterações no checkout', 'ux', 'ux', ['UI', 'Checkout'], 2, 5000, 0.1),
  t('Pesquisa de usabilidade — agendamento', 'ux', 'ux', ['Pesquisa', 'Saúde'], 3, 7000, 0.2),
  t('Acessibilidade WCAG AA no portal', 'ux', 'ux', ['A11y', 'Governo'], 8, 13000, 0.3),
  t('Onboarding guiado para novos usuários', 'ux', 'ux', ['Onboarding'], 3, 8500, 0.2),
  t('Redesign do extrato financeiro', 'ux', 'ux', ['Financeiro', 'UI'], 5, 11000, 0.25),
];

/** Títulos para incidentes gerados dinamicamente */
export const INCIDENT_TITLES = [
  'Erro no checkout para parte dos usuários',
  'Lentidão extrema na API principal',
  'Falha no processamento de pagamentos',
  'Serviço de login indisponível',
  'Fila de mensagens travada',
  'Relatórios retornando dados de outro cliente',
  'Timeout no serviço de agendamento',
  'Aplicativo fechando ao abrir',
  'Integração com parceiro retornando erro 503',
  'Consumo de CPU a 100% no banco',
];

export const ESCAPED_BUG_PREFIX = ['Regressão em', 'Erro em produção:', 'Defeito reportado em', 'Falha intermitente em'];
