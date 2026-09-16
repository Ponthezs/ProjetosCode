# Plano de migração para API e banco de dados

O sistema foi desenhado desde o início para que o `localStorage` seja
substituível por uma API REST sem reescrever telas ou regras de negócio.
Este documento descreve o caminho recomendado para essa evolução.

## Por que a migração é viável sem reescrever o front-end

Toda persistência de dados passa por uma única camada,
`js/core/storage.js` (`StorageService`), e toda regra de negócio vive em
`js/services/*.js`, que chamam `StorageService` mas nunca `localStorage`
diretamente. As páginas (`js/pages/*.js`) só conhecem os serviços, nunca a
camada de armazenamento. Isso significa que, para migrar, basta:

1. Implementar a API REST (ou GraphQL) com os mesmos recursos descritos em
   `db/schema.sql` e `docs/tecnico/02-modelo-de-dados.md`.
2. Reescrever **apenas** `js/core/storage.js`, trocando as implementações de
   `getAll`, `getById`, `insert`, `update`, `remove` e `query` para chamadas
   `fetch` à API (assíncronas), mantendo a mesma assinatura de retorno
   (ou migrando para `Promise`/`async` de forma consistente em toda a
   camada).
3. Ajustar `js/services/*.js` para `async/await` nas chamadas ao
   `StorageService`, propagando `await` para os controladores de página
   (`js/pages/*.js`) que os chamam.
4. Mover a autenticação de `js/core/auth.js` para um fluxo real (ex.: JWT ou
   sessão de servidor), mantendo a mesma API pública (`login`, `logout`,
   `currentUser`, `canAccess`, `guardPage`) para não impactar `layout.js` e
   as páginas.

Nenhuma tela, nenhum componente de UI (`Toast`, `Modal`, `DataTable`) e
nenhuma regra de negócio (cálculo de total, baixa de estoque, geração de
conta a pagar/receber) precisa mudar de comportamento nesse processo — elas
continuam chamando os mesmos métodos de serviço, só que agora respaldados
por um banco de dados real.

## Roteiro sugerido

### Fase 1 — Backend e banco de dados
- Provisionar um banco relacional (PostgreSQL recomendado) e aplicar
  `db/schema.sql`.
- Implementar endpoints REST por entidade (`/clientes`, `/produtos`,
  `/vendas`, ...), replicando a lista de operações de cada serviço atual
  (ver assinatura de métodos em `js/services/*.js`).
- Implementar autenticação real (usuário/senha com hash forte no servidor —
  nunca no cliente — mais emissão de token de sessão) e reforçar no backend
  as mesmas regras de permissão por perfil hoje aplicadas apenas no
  front-end (`ROLE_MODULES`), já que validação apenas no cliente nunca deve
  ser considerada segurança suficiente.
- Implementar no backend as mesmas validações e regras de integridade hoje
  aplicadas nos serviços do front-end (documento válido, saldo de estoque
  não negativo, categoria em uso não pode ser excluída, etc.) — o front-end
  não deve ser a única linha de defesa dessas regras.

### Fase 2 — Adaptação do front-end
- Reescrever `StorageService` para consumir a API.
- Introduzir tratamento de estado de carregamento (skeletons já existem em
  CSS — `.skeleton` em `components.css`) e de erro de rede nas páginas.
- Introduzir cache leve/otimista quando fizer sentido (ex.: manter a lista
  de categorias em memória durante a sessão, atualizando com a API a cada
  entrada de tela).

### Fase 3 — Descontinuar dados locais
- Migrar os dados que a empresa já tiver acumulado em `localStorage`
  (exportando via os próprios relatórios em CSV, ou por um script único de
  migração) para o banco de dados.
- Remover `js/core/seed-data.js` do fluxo de produção (mantê-lo apenas para
  ambiente de desenvolvimento/demonstração, alimentando um banco de testes
  em vez do navegador).

### Fase 4 — Evoluções que passam a ser possíveis com backend real
- Acesso simultâneo por múltiplos usuários aos mesmos dados (hoje cada
  navegador tem sua própria cópia isolada dos dados).
- Auditoria de alterações (quem alterou o quê e quando) no nível do banco de
  dados.
- Integrações externas: emissão fiscal, meios de pagamento reais,
  notificações por e-mail/WhatsApp para "conta vencendo hoje", exportação
  agendada de relatórios.
- Backup e recuperação de dados independentes do navegador do usuário.

## Riscos e cuidados

- **Não confiar apenas nas validações client-side.** As validações em
  `js/services/*.js` continuam úteis para uma boa experiência de uso, mas
  toda regra crítica (preço não negativo, estoque não fica negativo, senha
  com hash) precisa ser reforçada no servidor no momento da migração.
- **Concorrência.** Hoje cada navegador é a única fonte de verdade para si
  mesmo; com múltiplos usuários simultâneos, é preciso decidir uma
  estratégia de concorrência (ex.: otimista com verificação de versão) para
  operações sensíveis como confirmação de venda/compra e baixa de estoque.
- **Chave de idempotência em integrações automáticas.** A criação automática
  de conta a pagar/receber ao confirmar compra/venda hoje usa um campo de
  origem (`sourcePurchaseId`/`sourceSaleId`) para não duplicar o lançamento
  se a ação for repetida — essa mesma proteção deve existir no backend.
