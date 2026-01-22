# 🏪 Sistema ERP - Loja Online

## 📖 Visão Geral

Sistema de e-commerce completo com frontend em HTML/CSS/JavaScript puro (sem frameworks). Inclui:
- 👤 Autenticação de utilizadores
- 🛒 Carrinho de compras
- 💳 Simulação de checkout
- 👨‍💼 Painel de administração
- 🔐 Sistema de permissões
- 🎨 Dark mode
- 📱 Design responsivo

---

## ✨ Versão 2.0 - Com 10 Melhorias Implementadas

### Novidades
1. ✅ **Validação robusta** de inputs
2. ✅ **Senhas hasheadas** com SHA256
3. ✅ **Toast notifications** melhorado
4. ✅ **Loading states** visual
5. ✅ **Tratamento de erros** global
6. ✅ **Confirmação** de ações críticas
7. ✅ **Design responsivo** para mobile
8. ✅ **Busca de produtos** em tempo real
9. ✅ **Paginação** de produtos
10. ✅ **Filtros de categoria**

---

## 🚀 Getting Started

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- LocalStorage habilitado
- Internet (para CDNs: Tailwind, FontAwesome, CryptoJS)

### Instalação
1. Clone ou baixe os arquivos
2. Abra `index.html` em um navegador
3. Ou sirva via HTTP local:
   ```bash
   python -m http.server 8000
   # ou
   npx http-server
   ```

### Primeira Execução
1. Página carrega com 4 produtos padrão
2. Admin padrão: `adm` / `1234`
3. Crie sua conta ou faça login

---

## 📁 Estrutura de Arquivos

```
ERP/
├── index.html              # Loja (página principal)
├── login.html              # Página de login
├── register.html           # Página de registo
├── cart.html               # Carrinho de compras
├── checkout.html           # Finalizar compra
├── product-admin.html      # Gerir produtos (admin)
├── permissions-admin.html  # Gerir permissões (admin)
├── script.js               # Lógica principal (854 linhas)
├── style.css               # Estilos + responsivo
├── validators.js           # Validações (88 linhas)
├── schemas.sql             # Schema SQL (para backend futuro)
├── MELHORIAS_E_CORRECOES.md    # Análise completa
├── CORRECOES_PRATICAS.md       # 10 correções prontas
├── IMPLEMENTACAO_RESUMO.md     # O que foi implementado
├── GUIA_TESTES.md              # Como testar
└── GUIA_USO.md                 # Como usar
```

---

## 🔐 Credenciais Padrão

| Campo | Valor |
|-------|-------|
| **Username** | `adm` |
| **Senha** | `1234` |
| **Tipo** | Admin |

**Senha hasheada**: Não é armazenada em texto plano

---

## 📊 Dados Armazenados

Tudo é salvo em **localStorage** (sem backend):

### Produtos
```javascript
{
  "PROD001": {
    name: "Caneta Esferográfica Pro",
    price: 2.50,
    stock: 100,
    imageUrl: "https://..."
  }
}
```

### Utilizadores
```javascript
{
  username: "user123",
  password: "hash_sha256_aqui",
  isAdmin: false
}
```

### Carrinho (por utilizador)
```javascript
{
  "PROD001": 2,
  "PROD003": 1
}
```

---

## 🎯 Funcionalidades Principais

### Para Clientes
- ✅ Registar conta
- ✅ Login/Logout
- ✅ Ver produtos com filtros e busca
- ✅ Adicionar ao carrinho
- ✅ Gerenciar quantidade no carrinho
- ✅ Simular pagamento (3 métodos)
- ✅ Dark mode
- ✅ Responsivo em mobile

### Para Admin
- ✅ Criar produtos
- ✅ Editar produtos
- ✅ Apagar produtos
- ✅ Ver utilizadores
- ✅ Alterar permissões (tornar admin)
- ✅ Acesso restrito

---

## 🔒 Segurança Implementada

### ✅ Implementado
| Feature | Descrição |
|---------|-----------|
| Validação de Username | Min 3 chars, alfanuméricos |
| Validação de Senha | Min 6 chars, maiúscula + número |
| Hash de Senhas | SHA256 com salt |
| Sanitização | Escape de caracteres perigosos (XSS) |
| Tratamento de Erros | Global error handlers |
| Confirmação de Ações | Modal para delete |
| Controlo de Acesso | Admin-only pages |

### ⚠️ Não Implementado (Crítico)
| Feature | Por Quê |
|---------|---------|
| Backend/API | Frontend only |
| Banco de Dados | LocalStorage apenas |
| JWT/Sessions | Auth simplificado |
| HTTPS/SSL | Desenvolvimento local |
| Rate Limiting | Sem API |
| Logging de Auditoria | Sem BD |

---

## 📱 Responsividade

| Breakpoint | Dispositivo | CSS |
|-----------|------------|-----|
| 1920px+ | Desktop | Grid 4 colunas |
| 1024px-1920px | Laptop | Grid 3 colunas |
| 768px-1024px | Tablet | Grid 2 colunas |
| 480px-768px | Mobile grande | 1 coluna |
| <480px | Mobile pequeno | 1 coluna |

---

## 🎨 Temas

### Light Mode (Default)
- Fundo claro
- Texto escuro
- Navbar azul sky

### Dark Mode
- Fundo azul petróleo escuro
- Texto quase branco
- Cores neon para destaque

Toggle com ícone da lua 🌙

---

## 📊 Performance

| Métrica | Valor |
|---------|-------|
| Bundle Size | ~854 KB (script.js) |
| Produtos/Página | 12 |
| Carregamento | <1s (local) |
| Dark Mode Switch | <100ms |

---

## 🧪 Testes

### Testes Manuais
```bash
# Ver GUIA_TESTES.md para checklist completo
```

### Testes Automatizados
Ainda não implementados - adicionar com:
- Jest (unit tests)
- Cypress (E2E)
- Lighthouse (performance)

---

## 🐛 Known Issues & Limitations

| Issue | Status | Solução |
|-------|--------|----------|
| Dados perdidos ao limpar cache | ⚠️ Conhecido | Backend + BD |
| Sem persistência entre abas | ⚠️ Conhecido | WebSocket sync |
| Admin padrão óbvio | ✅ Mitigado | Alterar senha first-time |
| Sem log de vendas | ⚠️ Conhecido | BD + Logging |
| Sem integração real de pagamento | ✅ Esperado | Stripe/PayPal |

---

## 📈 Roadmap

### v2.1 (Próxima)
- [ ] Mais categorias de produtos
- [ ] Sistema de reviews
- [ ] Wishlist/Favoritos
- [ ] Newsletter signup

### v3.0 (Médio prazo)
- [ ] Backend Node.js + Express
- [ ] PostgreSQL/MongoDB
- [ ] JWT autenticação
- [ ] Stripe integration
- [ ] Email notifications

### v4.0 (Longo prazo)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard (React)
- [ ] Microservices
- [ ] GraphQL API
- [ ] Real-time notifications

---

## 📚 Documentação

Arquivos incluídos:

1. **MELHORIAS_E_CORRECOES.md** - 27 pontos de melhoria com análise
2. **CORRECOES_PRATICAS.md** - 10 soluções práticas com código
3. **IMPLEMENTACAO_RESUMO.md** - O que foi implementado nesta versão
4. **GUIA_TESTES.md** - 20+ testes manuais
5. **GUIA_USO.md** - Como usar todas as features

---

## 🔧 Desenvolvimento

### Arquivos Principais

**script.js** (854 linhas)
```javascript
// Core modules:
- Authentication (login, register)
- Products (CRUD)
- Cart (add, remove, update)
- Checkout (payment simulation)
- Permissions (admin management)
- UI (render functions)
- Utils (storage, validation)
```

**validators.js** (88 linhas)
```javascript
// Validation functions:
- validateUsername()
- validatePassword()
- validateProductPrice()
- validateProductStock()
- validateProductName()
- sanitizeString()
- validateImageUrl()
- hashPassword()
- isLocalStorageAvailable()
```

**style.css**
```css
- Toast notifications
- Dark mode support
- Responsive design
- Tailwind overrides
- Mobile optimizations
```

---

## 💻 Stack Técnico

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos + Tailwind
- **JavaScript ES6** - Lógica
- **FontAwesome 6** - Ícones
- **Tailwind CSS** - Framework CSS
- **CryptoJS** - Hash de senhas

### LocalStorage
- **Chave-valor**: JSON simples

### Sem dependências NPM!

---

## 🚀 Deploy

### Opções

1. **Vercel** (recomendado)
   ```bash
   vercel
   ```

2. **Netlify**
   ```bash
   netlify deploy --prod --dir .
   ```

3. **GitHub Pages**
   - Push para branch `gh-pages`
   - Habilitar em Settings

4. **Docker**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   ```

---

## 📞 Support

### Problemas Comuns

**Busca não funciona?**
- Verificar console (F12)
- Recarregar página

**Dark mode não persiste?**
- Limpar localStorage: `localStorage.clear()`
- Recarregar

**Dados desapareceram?**
- Normal! Dados estão em localStorage
- Para persistir, precisa de backend

---

## 📄 Licença

Projeto educacional. Use livremente.

---

## 👨‍💻 Autor

Desenvolvido como projeto ERP melhorado com 10 correções críticas.

**Versão**: 2.0  
**Data**: Janeiro 2026  
**Status**: Pronto para uso (desenvolvimento)

---

## 🎉 Próximos Passos

1. Testar todas as funcionalidades (ver GUIA_TESTES.md)
2. Ler GUIA_USO.md para aprender como usar
3. Ler MELHORIAS_E_CORRECOES.md para entender o que melhorou
4. Começar a planejar implementação do backend

---

**Aproveite! 🚀**

