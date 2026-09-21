# Arquitetura

## Visão geral

O Fluxen ERP é uma aplicação multi-página (MPA) estática: HTML, CSS e
JavaScript puro, sem build step, sem framework e sem dependência de Node.js
para rodar (Node só é usado neste repositório para lint/testes durante o
desenvolvimento). Cada módulo é uma página HTML própria em `pages/`, que
compartilha CSS e JavaScript com as demais.

```
ERP/
├── public/                   # Páginas de entrada, não autenticadas
│   ├── index.html             # Home institucional (apresentação do sistema)
│   ├── login.html             # Autenticação
│   └── cadastro.html          # Criação de conta (usuário Administrador + empresa)
├── css/
│   ├── variables.css         # Tokens de design (cores, espaçamento, tipografia)
│   ├── base.css              # Reset + layout estrutural (sidebar, header)
│   ├── components.css        # Componentes reutilizáveis (botões, cards, tabelas, modais...)
│   ├── responsive.css        # Regras de responsividade
│   └── print.css             # Estilos usados na impressão de relatórios
├── js/
│   ├── core/
│   │   ├── utils.js           # Formatação, máscaras, validação, helpers puros
│   │   ├── storage.js         # Única camada de acesso a dados (hoje localStorage)
│   │   ├── auth.js            # Sessão, login/logout, permissões por perfil
│   │   ├── components.js      # Toast, Modal (genérico/confirmação/formulário), DataTable
│   │   ├── notifications.js   # Notificações automáticas e manuais
│   │   ├── layout.js          # Monta sidebar/header, tema, busca global
│   │   └── seed-data.js       # Dados de demonstração (primeira execução)
│   ├── services/               # Uma camada de serviço por entidade de negócio
│   │   ├── customerService.js, supplierService.js, categoryService.js
│   │   ├── productService.js, stockService.js
│   │   ├── salesService.js, purchaseService.js
│   │   ├── financialService.js
│   │   ├── userService.js, companyService.js
│   └── pages/                  # Um controlador por página (lógica específica da tela)
│       ├── home.js, login.js, cadastro.js (páginas de public/)
│       ├── dashboard.js, clientes.js, fornecedores.js, produtos.js,
│       │   estoque.js, vendas.js, compras.js, financeiro.js, contas-pagar.js,
│       │   contas-receber.js, fluxo-caixa.js, relatorios.js, usuarios.js,
│       │   configuracoes.js (páginas de pages/)
├── pages/                       # Uma página HTML por módulo (ver acima)
├── assets/
│   ├── logo/                     # Logo e favicon do Fluxen ERP
│   ├── images/                   # Reservado para banners/ilustrações (vazio por ora)
│   └── icons/                    # Reservado para ícones próprios em SVG (vazio por ora)
├── db/schema.sql                 # Modelo relacional para a futura API/banco de dados
└── docs/                          # Esta documentação (negócio + técnica)
```

## Por que multi-página e não SPA

Sem um framework, uma SPA exigiria um roteador client-side escrito à mão
para pouco ganho: cada módulo do ERP já é, naturalmente, uma tela
independente. Páginas HTML separadas são mais simples de entender, permitem
que o navegador cuide de navegação/histórico/atualização de página
nativamente, e não penalizam a experiência, já que todo o CSS e a maior
parte do JavaScript são compartilhados e ficam em cache do navegador entre
as páginas.

## Camadas do front-end

O código é organizado em três camadas com responsabilidades bem separadas,
sempre na mesma direção de dependência (página → serviço → storage/utils —
nunca o contrário):

1. **`js/core/storage.js`** — a única parte do sistema que sabe que os dados
   estão em `localStorage`. Expõe operações genéricas de CRUD
   (`getAll`, `getById`, `insert`, `update`, `remove`, `query`) por
   "coleção" (equivalente a uma tabela). Nenhum outro arquivo chama
   `localStorage` diretamente — é essa regra que permite trocar o
   armazenamento por uma API sem tocar nas telas (ver
   `docs/tecnico/04-plano-migracao-api.md`).
2. **`js/services/*.js`** — uma camada de serviço por entidade de negócio
   (clientes, produtos, vendas, financeiro...), responsável pelas regras de
   negócio descritas em `docs/negocio/02-regras-de-negocio.md`: geração de
   código sequencial, validação, cálculo de totais, e as integrações entre
   módulos (ex.: `SalesService` chama `StockService` e `FinancialService`
   ao confirmar uma venda). As telas nunca implementam regra de negócio
   diretamente — sempre chamam um método de serviço.
3. **`js/pages/*.js`** — um controlador por página, responsável apenas por
   ler o estado da tela (filtros, formulários), chamar os serviços
   apropriados e renderizar o resultado usando os componentes de UI de
   `js/core/components.js`.

Complementando essas camadas, `js/core/auth.js` cuida de sessão e permissões,
`js/core/layout.js` monta a sidebar/header comuns a toda página autenticada,
e `js/core/seed-data.js` popula dados de demonstração apenas na primeira
execução (quando o `localStorage` está vazio).

## Componentes de UI reutilizáveis

Para evitar duplicação entre os 14 módulos, três componentes genéricos (em
`js/core/components.js`) concentram toda a lógica de interface repetitiva:

- **`Toast`** — mensagens de confirmação/erro no canto da tela.
- **`Modal`** — janelas modais genéricas (`Modal.open`), de confirmação
  (`Modal.confirm`) e de formulário orientado a configuração
  (`Modal.form`, que recebe uma lista de campos e gera o formulário, a
  validação e as máscaras automaticamente).
- **`createDataTable`** — tabela genérica com ordenação por coluna,
  paginação e ações por linha, usada em todas as telas de listagem.

## Convenção de páginas

Toda página autenticada segue o mesmo esqueleto: dois contêineres vazios
(`#sidebar-root`, `#header-root`) que `Layout.init({ moduleKey })` preenche
em tempo de execução, e uma tag `<main id="pageContent">` com o conteúdo
específico daquele módulo. `Layout.init` também aplica a verificação de
sessão e permissão (`Auth.guardPage`) antes de montar qualquer coisa —
nenhuma página desenha sua tela sem essa verificação passar primeiro.

## Tema claro/escuro

Os tokens de cor vivem em `css/variables.css` como variáveis CSS, com um
conjunto de sobrescritas para `:root[data-theme="dark"]`. A preferência do
usuário é lida e aplicada antes mesmo do restante da página carregar (um
pequeno script inline no `<head>` de cada página) para evitar o "flash" de
tema errado, e persistida via `js/services/companyService.js`
(`getSettings`/`updateSettings`).
