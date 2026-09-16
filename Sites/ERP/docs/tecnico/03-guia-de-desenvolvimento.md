# Guia de desenvolvimento

## Executando o projeto localmente

O sistema não precisa de build nem de instalação de dependências para
rodar — é HTML/CSS/JS estático. Como os módulos usam `fetch`/scripts
relativos, é recomendável servir os arquivos por HTTP em vez de abrir
diretamente com `file://` (alguns navegadores restringem `localStorage` e
requisições em arquivos locais). A forma mais simples:

```bash
cd ERP
python3 -m http.server 8000
# ou: npx http-server -p 8000
```

Depois acesse `http://localhost:8000/login.html`.

## Convenções obrigatórias ao criar ou alterar uma página

1. **Ordem fixa de scripts.** Toda página em `pages/*.html` carrega, nesta
   ordem: `utils.js`, `storage.js`, `auth.js`, `components.js`,
   `notifications.js`, todos os serviços em `js/services/`, `seed-data.js`,
   `layout.js` e por fim o controlador específico da página
   (`js/pages/<pagina>.js`). Bibliotecas externas (Chart.js, jsPDF) entram
   *antes* desse bloco. Não altere essa ordem — cada arquivo depende de
   globais definidos pelos anteriores.
2. **Guarda de página.** Todo controlador de página começa com:
   ```js
   (function () {
     SeedData.ensureSeeded();
     if (!Layout.init({ moduleKey: 'CHAVE' })) return;
     // lógica da página
   })();
   ```
   `moduleKey` deve corresponder a uma chave de `ROLE_MODULES` em
   `js/core/auth.js`.
3. **Nunca acessar `localStorage` diretamente fora de `js/core/storage.js`.**
   Toda leitura/escrita passa por `StorageService` ou por um método de
   serviço (`js/services/*.js`). Isso é o que torna a migração para uma API
   real (ver `04-plano-migracao-api.md`) uma troca de uma camada, não uma
   reescrita do sistema.
4. **Regra de negócio vive no serviço, não na página.** Cálculo de total,
   geração de código sequencial, atualização de estoque, criação automática
   de conta a pagar/receber — tudo isso já está implementado em
   `js/services/*.js`. Um controlador de página nunca deve duplicar essa
   lógica; ele chama o serviço e trata o resultado (sucesso ou erro).
5. **Reaproveitar os componentes de `js/core/components.js`.** Antes de
   escrever HTML de tabela, modal ou mensagem de confirmação à mão, verifique
   se `createDataTable`, `Modal.form`/`Modal.confirm` ou `Toast.show` já
   resolvem o caso — é assim que as 14 telas do sistema mantêm a mesma cara e
   o mesmo comportamento.
6. **Design tokens.** Cores, espaçamento, raio de borda e sombra vêm de
   `css/variables.css`. Não use valores de cor "soltos" (hex direto) em CSS
   ou inline — use as variáveis (`var(--brand-600)`, etc.), inclusive para
   suportar o tema escuro automaticamente.

## Adicionando uma nova entidade/módulo

1. Defina a forma dos dados (campos, tipos) e documente em
   `docs/tecnico/02-modelo-de-dados.md`.
2. Adicione a chave da coleção em `COLLECTIONS` (`js/core/storage.js`).
3. Crie `js/services/<entidade>Service.js` com `getAll`, `getById`,
   `create`, `update`, `remove` no mínimo, e qualquer regra de negócio
   específica (seguindo o padrão dos serviços existentes).
4. Se o módulo precisa de uma nova página protegida, crie
   `pages/<modulo>.html` (copiando o esqueleto de outra página existente) e
   `js/pages/<modulo>.js`, adicione a chave de permissão em `ROLE_MODULES`
   (`js/core/auth.js`) e o item de menu em `MENU` (`js/core/layout.js`).
5. Se fizer sentido ter dados de demonstração, adicione um gerador em
   `js/core/seed-data.js`.
6. Atualize `db/schema.sql` e a documentação de negócio relevante.

## Testes manuais mínimos antes de publicar uma alteração

- `node --check js/pages/<arquivo>.js` (ou qualquer `.js` alterado) para
  garantir que não há erro de sintaxe.
- Login com cada perfil de demonstração e confirmação de que o menu lateral
  mostra exatamente os módulos esperados para aquele perfil.
- Fluxo completo de uma operação central: criar uma venda com status "Pago"
  e confirmar que (a) o estoque do produto caiu, (b) uma conta a receber foi
  criada, (c) o Dashboard e o Financeiro refletem o novo valor.
- Testar a mesma alteração nos temas claro e escuro e em uma largura de tela
  estreita (celular).

## Estilo de código

- Comentários em português, curtos, explicando *por que* uma decisão de
  negócio foi tomada — não o que o código já deixa óbvio.
- Sem dependência de bibliotecas de UI (jQuery, Bootstrap, Tailwind) —
  apenas JavaScript e CSS puro, mais os ícones (Font Awesome) e o Chart.js/
  jsPDF quando estritamente necessário para gráficos e exportação de PDF.
- Sem emojis e sem tom de marketing em nenhum texto de interface, mensagem
  de log ou documentação — o sistema deve se comunicar como um produto
  profissional.
