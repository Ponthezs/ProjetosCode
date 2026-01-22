# 🚀 Guia de Uso - Sistema ERP Melhorado

## 📌 Credenciais Padrão

**Admin:**
- Username: `adm`
- Senha: `1234` (hasheada com SHA256)

**Nota**: Mude a senha após primeiro login em produção!

---

## 🎯 Recursos Novos

### 1. Busca de Produtos
- **Localização**: Barra de pesquisa na página inicial da loja
- **Como usar**: Digite o nome ou código do produto
- **Funcionalidade**: Filtra em tempo real enquanto digita

### 2. Filtros de Categoria
- **Localização**: Abaixo da barra de busca na loja
- **Categorias disponíveis**: Escritório, Informática, Papelaria, Outros
- **Como usar**: Clique no botão da categoria desejada

### 3. Paginação
- **Localização**: Abaixo dos produtos
- **Produtos por página**: 12
- **Como usar**: Clique no número da página

### 4. Segurança Melhorada
- **Senhas**: Agora são hasheadas com SHA256 antes do armazenamento
- **Validação**: Username (3+ chars), Senha (6+ chars, 1 maiúscula, 1 número)
- **Sanitização**: Inputs são escapados para evitar XSS

### 5. Confirmação de Ações Críticas
- **Apagar produto**: Modal de confirmação
- **Evita**: Acidentes de um clique

### 6. Notificações Melhoradas
- **Tipo Success**: Verde com ✓
- **Tipo Error**: Vermelho com ✕
- **Tipo Info**: Azul com ℹ
- **Tipo Warning**: Laranja com ⚠
- **Auto-hide**: Desaparece após 3 segundos

### 7. Responsivo em Mobile
- **Testar em**: Qualquer smartphone ou tablet
- **Funcionalidades**: Todas trabalham em mobile
- **Inputs**: Sem zoom automático

### 8. Dark Mode
- **Ativar**: Clique no ícone de lua na navbar
- **Persiste**: É salvo no localStorage

---

## 👨‍💼 Funções do Admin

### Gerir Produtos
1. **Ir para**: "Gerir Produtos" (navbar)
2. **Adicionar**: Preencha o formulário e clique "Adicionar Produto"
   - Código (deixar vazio para gerar automaticamente)
   - Nome (obrigatório)
   - Preço em R$ (obrigatório)
   - Stock (obrigatório)
   - URL da imagem (opcional)

3. **Editar**: Clique no ícone de lápis na tabela
   - Código fica bloqueado
   - Clique "Atualizar Produto"
   - Clique "Cancelar Edição" para desistir

4. **Apagar**: Clique no ícone de lixeira
   - Confirme na modal
   - Produto é removido de todos os carrinhos

### Gerir Permissões
1. **Ir para**: "Permissões" (navbar)
2. **Ver usuários**: Lista todos os utilizadores
3. **Alterar privilégios**: Clique "Tornar Admin" ou "Revogar Admin"
   - Admin padrão 'adm' não pode ser rebaixado
   - Ação é imediata

---

## 🛒 Fluxo de Compra

### 1. Registar Conta
1. Ir para "Criar uma conta"
2. Preencher username (3+ caracteres, alfanuméricos)
3. Preencher senha (6+ caracteres, com maiúscula e número)
4. Confirmar senha
5. Clicar "Registar"
6. Será redirecionado para login

### 2. Login
1. Ir para "Faça login na sua conta"
2. Username e senha
3. Clicar "Entrar"

### 3. Comprar
1. Na loja:
   - Procurar produto (busca ou categoria)
   - Escolher quantidade
   - Clicar "Adicionar" (ícone de carrinho)
2. Toast confirma adição

### 4. Carrinho
1. Clicar no ícone de carrinho (navbar)
   - Mostra todos os itens
   - Pode alterar quantidade
   - Pode remover itens

### 5. Checkout
1. Clicar "Finalizar Compra"
2. Resumo do pedido aparece
3. Escolher método de pagamento:
   - Boleto
   - PIX
   - Cartão de Crédito
4. Clicar no botão de pagamento
5. Toast confirma "Pagamento simulado com sucesso"
6. Redirecionado para loja em 4 segundos

---

## 🔒 Segurança

### ✅ Implementado
- Validação de inputs robusta
- Sanitização de strings (XSS básico)
- Senhas hasheadas (SHA256)
- Tratamento de erros global
- Confirmação para ações destrutivas

### ⚠️ Ainda não implementado (crítico para produção)
- Backend/API
- Banco de dados
- Autenticação JWT
- HTTPS/SSL
- CORS headers
- Rate limiting
- Logging de auditoria

**⚠️ NÃO use em produção sem implementar backend seguro!**

---

## 🐞 Resolução de Problemas

### "Nenhum produto disponível"
- Verificar se stock > 0
- Produtos com stock 0 não aparecem na loja

### "Senha inválida"
- Mínimo 6 caracteres
- Precisa de 1 letra maiúscula
- Precisa de 1 número
- Exemplo: "Senha1"

### "Dados não persistem após fechar o navegador"
- Normal! O sistema usa localStorage
- Para persistência, implementar backend com BD

### "Dark mode não funcionou"
- Recarregar a página
- Verificar se browser suporta localStorage

### "Busca/Paginação não funciona"
- Verificar console (F12) para erros
- Recarregar página
- Limpar localStorage: `localStorage.clear()`

---

## 📱 Testes em Mobile

1. Abrir site em smartphone
2. Testar:
   - Navbar funciona
   - Produtos visíveis
   - Busca funciona
   - Inputs não fazem zoom
   - Botões clicáveis

---

## 🎯 Proximos Passos Recomendados

1. **Implementar Backend** (Node.js + Express)
2. **Banco de Dados** (PostgreSQL ou MongoDB)
3. **Autenticação Segura** (JWT + bcrypt)
4. **Integração de Pagamento** (Stripe/PayPal)
5. **Email** (Confirmação de pedidos)
6. **Testes Automatizados** (Jest, Cypress)
7. **Deploy** (Vercel, Heroku, AWS)

---

## 📞 Support / Bugs

Se encontrar bugs ou problemas:

1. Verificar console (F12 → Console)
2. Limpar localStorage: `localStorage.clear()`
3. Recarregar página (Ctrl+F5)
4. Se persistir, criar issue no GitHub

---

## 📊 Estrutura de Dados

### LocalStorage Keys
```javascript
gestorProPlus_products_v2       // Produtos { id: {name, price, stock, imageUrl} }
gestorProPlus_users_v2          // Utilizadores { username, password (hasheada), isAdmin }
gestorProPlus_cart_v2_USERNAME  // Carrinho por utilizador { productId: quantity }
gestorProPlus_loggedInUser_v2   // Utilizador logado { username, isAdmin }
gestorProPlus_theme_v2          // Tema atual 'light' ou 'dark'
```

---

## ✨ Sugestões de Melhorias Futuras

- [ ] Email de confirmação de pedido
- [ ] Histórico de compras
- [ ] Avaliações de produtos
- [ ] Cupons de desconto
- [ ] Relatórios de vendas
- [ ] Multi-idioma
- [ ] Sistema de notificações
- [ ] Chat de suporte
- [ ] Wishlist/Favoritos
- [ ] Integração com redes sociais

---

**Versão**: 2.0 (Com 10 Melhorias Implementadas)
**Data**: Janeiro 2026
**Próxima atualização**: Implementação do Backend

