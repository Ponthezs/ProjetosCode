# 🧪 Guia de Testes - Sistema ERP Melhorado

## Testes Rápidos para Validar Implementações

### 1️⃣ Teste de Validação de Username

**Passos:**
1. Ir para página de Register
2. Tentar registrar com username "ab" (menos de 3 caracteres)
3. Verificar mensagem de erro

**Resultado esperado**: "Utilizador deve ter pelo menos 3 caracteres"

---

### 2️⃣ Teste de Validação de Senha

**Passos:**
1. Ir para Register
2. Tentar registrar com senha "senha123" (sem maiúscula)
3. Tentar com "SENHA" (sem número)
4. Tentar com "Sen1" (menos de 6 caracteres)

**Resultado esperado**: Mensagens de erro apropriadas para cada caso

---

### 3️⃣ Teste de Hash de Senhas

**Passos:**
1. Registar com username "teste" e password "Senha1"
2. Abrir DevTools → Application → LocalStorage
3. Procurar `gestorProPlus_users_v2`
4. Verificar se a senha não é "Senha1" mas um hash

**Resultado esperado**: Senha está hasheada (começa com números/letras aleatórias)

---

### 4️⃣ Teste de Toast Notifications

**Passos:**
1. Fazer login com credenciais incorretas
2. Observar toast vermelho no canto inferior

**Resultado esperado**: Toast com ícone ✕ em vermelho, desaparece após 3s

---

### 5️⃣ Teste de Busca de Produtos

**Passos:**
1. Na loja, procurar por "Caneta" no search input
2. Procurar por "PROD001"
3. Procurar por "inexistente"

**Resultado esperado**: 
- Busca por "Caneta" mostra produto
- Busca por "PROD001" mostra produto
- Busca por "inexistente" mostra "Nenhum produto encontrado"

---

### 6️⃣ Teste de Filtros de Categoria

**Passos:**
1. Na loja, clicar em "Escritório"
2. Clicar em "Informática"
3. Clicar em "Todos"

**Resultado esperado**: Produtos filtrados mudam (mesmo que ainda haja limitação de dados)

---

### 7️⃣ Teste de Paginação

**Passos:**
1. Adicionar 20+ produtos (ou observar com os 4 existentes)
2. Se houver múltiplas páginas, clicar nos números
3. Observar smooth scroll

**Resultado esperado**: Produtos mudam, página destaca a atual

---

### 8️⃣ Teste de Confirmação de Exclusão (Admin)

**Passos:**
1. Login como admin (adm/1234)
2. Ir para "Gerir Produtos"
3. Clicar no ícone de lixeira em qualquer produto
4. Clicar "Cancelar"
5. Repetir e clicar "Apagar"

**Resultado esperado**: 
- Primeira vez: Modal fecha sem deletar
- Segunda vez: Produto é deletado, toast de sucesso

---

### 9️⃣ Teste de Responsive Design

**Passos:**
1. Abrir DevTools (F12)
2. Ativar "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Testar em:
   - iPhone 12 (390x844)
   - iPad (768x1024)
   - Desktop (1920x1080)

**Resultado esperado**: Layout adapta-se, elementos legíveis, inputs sem zoom

---

### 🔟 Teste de Tratamento de Erros

**Passos:**
1. Abrir DevTools → Console
2. Executar: `throwError` (erro intencional)
3. Observar se há aviso no toast

**Resultado esperado**: Toast de erro aparece sem crash

---

## 🔐 Testes de Segurança

### ✅ Teste de XSS Básico

**Passos:**
1. Ir para Gerir Produtos
2. No campo de nome, inserir: `<img src=x onerror="alert('XSS')">`
3. Salvar produto

**Resultado esperado**: Alert NÃO dispara, tags são escapadas no display

---

### ✅ Teste de Sanitização

**Passos:**
1. Mesmo teste acima
2. No toast, verifica se o nome mostrado não tem tags

**Resultado esperado**: Tags aparecem como texto, não executam

---

## 📱 Testes Mobile-Specific

### Input de Quantidade em Mobile
1. Em mobile, clicar em input type="number"
2. Verificar se não faz zoom automático

**Resultado esperado**: Teclado numérico aparece, sem zoom

---

## 🎨 Testes de Dark Mode

**Passos:**
1. Clicar no ícone da lua (theme toggle)
2. Recarregar a página
3. Verificar se mantém o dark mode

**Resultado esperado**: Theme persiste em localStorage

---

## 📊 Teste de Performance

**Passos:**
1. Abrir DevTools → Lighthouse
2. Rodar auditoria
3. Observar pontuação

**Resultado esperado**: Performance > 75

---

## ✅ Checklist de Testes Completo

- [ ] Validação de username
- [ ] Validação de senha
- [ ] Hash de senhas funciona
- [ ] Toast notifications aparecem
- [ ] Busca de produtos funciona
- [ ] Filtros de categoria funcionam
- [ ] Paginação funciona
- [ ] Modal de confirmação funciona
- [ ] Design responsivo em mobile
- [ ] Dark mode funciona
- [ ] Nenhum XSS visível
- [ ] LocalStorage não expõe senhas em texto plano
- [ ] LocalStorage preserva dados após refresh
- [ ] Cart funciona
- [ ] Checkout simula pagamento
- [ ] Admin pode gerir produtos
- [ ] Permissões funcionam

---

## 🐛 Debugging Tips

**Se busca não funciona:**
- Verificar console para erros JavaScript
- Verificar se `currentSearchTerm` está sendo atualizado

**Se validação não funciona:**
- Verificar se validators.js está sendo carregado
- Verificar import no HTML

**Se toast não aparece:**
- Verificar se elemento #toast-container existe no HTML
- Verificar CSS do toast

**Se dark mode não funciona:**
- Verificar localStorage
- Verificar se dark-mode class está sendo adicionada ao html

---

## 📈 Próximos Testes (Quando Backend Implementado)

- [ ] Testes de API
- [ ] Testes de autenticação JWT
- [ ] Testes de autorização
- [ ] Testes de rate limiting
- [ ] Testes de SQL injection
- [ ] Testes de concorrência

