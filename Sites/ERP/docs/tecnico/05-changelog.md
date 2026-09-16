# Changelog

## v3.1 — Home institucional e cadastro de conta (atual)

**Adicionado**
- `index.html` deixou de ser apenas um redirecionamento e passou a ser a
  home institucional do sistema: cabeçalho com navegação, seção principal
  com animação de rede de partículas em canvas e mockup do dashboard,
  indicadores do produto, vitrine dos módulos, seção "como funciona" e
  nota de arquitetura, além de rodapé. Continua acessível mesmo com sessão
  ativa (os botões de ação apontam para o dashboard nesse caso).
- `cadastro.html` e `js/pages/cadastro.js`: tela de criação de conta
  (nome, e-mail, empresa, CNPJ opcional, telefone opcional e senha), que
  cria um usuário com perfil Administrador via `UserService`, grava os
  dados da empresa via `CompanyService` e autentica automaticamente ao
  final, reaproveitando `Auth.login`.
- `js/pages/home.js`: menu mobile, revelação de seções ao rolar a página,
  contadores animados da barra de indicadores e a animação de partículas
  do topo (respeita `prefers-reduced-motion`).
- Link cruzado entre `login.html` e `cadastro.html` ("Não tem conta?" /
  "Já tem uma conta?") e retorno para a home a partir da marca em ambas.

## v3.0 — Reconstrução como ERP completo

Reconstrução completa do projeto a partir do escopo definido para o Fluxen
ERP: sistema de gestão empresarial multi-módulo, substituindo o protótipo de
loja online da versão anterior.

**Adicionado**
- Autenticação com sessão (`js/core/auth.js`) e controle de acesso por
  perfil (Administrador, Gerente, Financeiro, Vendedor, Estoque, Usuário).
- Layout padrão com sidebar recolhível, submenus, busca global, sino de
  notificações, alternância de tema claro/escuro e menu de usuário
  (`js/core/layout.js`).
- Camada de armazenamento única e camada de serviços por entidade
  (`js/core/storage.js`, `js/services/*.js`), preparadas para substituição
  por API (ver `04-plano-migracao-api.md`).
- Componentes de UI reutilizáveis: `Toast`, `Modal` (genérico, confirmação e
  formulário orientado a configuração) e tabela com ordenação/paginação
  (`js/core/components.js`).
- Módulos completos: Dashboard, Clientes, Fornecedores, Produtos e
  Categorias, Estoque (com movimentações de entrada/saída/ajuste/
  inventário), Vendas, Compras, Financeiro (dashboard financeiro,
  categorias financeiras), Contas a pagar, Contas a receber, Fluxo de
  caixa, Relatórios (com impressão, exportação CSV e PDF real via jsPDF),
  Usuários e Configurações (empresa, sistema, segurança, aparência).
- Integrações automáticas entre módulos: venda confirmada dá baixa em
  estoque e gera conta a receber; compra confirmada dá entrada em estoque e
  gera conta a pagar; estoque baixo e contas vencendo geram notificação.
- Dados de demonstração realistas gerados na primeira execução (clientes,
  fornecedores, produtos, vendas, compras, movimentações de estoque,
  contas e usuários).
- Modelo de dados relacional (`db/schema.sql`) e documentação de negócio e
  técnica organizada em `docs/negocio` e `docs/tecnico`.
- Novo design visual: paleta neutra com azul-marinho corporativo como cor
  principal e dourado como destaque pontual, tipografia Manrope, sem
  gradientes ou tom "genérico de IA" do protótipo anterior.

**Removido / substituído**
- O protótipo de e-commerce da versão anterior (carrinho, checkout,
  cadastro público de conta, painel de produtos baseado em Tailwind via
  CDN) foi descontinuado — não fazia parte do escopo de um ERP interno de
  gestão empresarial. Os arquivos dessa versão anterior permanecem na raiz
  do projeto apenas para referência histórica (ver nota abaixo) e podem ser
  removidos manualmente.

## v2.0 — Protótipo de loja online (versão anterior, descontinuada)

Versão anterior do projeto: um front-end de e-commerce simples (catálogo,
carrinho, checkout simulado e painel de administração de produtos/
permissões), com dados em `localStorage` e autenticação simplificada. Os
arquivos dessa versão (`cart.html`, `checkout.html`, `register.html`,
`product-admin.html`, `permissions-admin.html`, `script.js`,
`validators.js`, e os documentos `CONCLUSAO.md`, `SUMARIO_EXECUTIVO.md`,
`GUIA_USO.md`, `GUIA_TESTES.md`, `MELHORIAS_E_CORRECOES.md`,
`CORRECOES_PRATICAS.md`, `IMPLEMENTACAO_RESUMO.md`, `INDICE.md` e
`QUICKSTART.md`) foram marcados com um aviso de descontinuação e podem ser
excluídos manualmente do repositório — este ambiente não tem permissão para
apagar arquivos diretamente no computador do usuário, apenas para
sobrescrevê-los.
