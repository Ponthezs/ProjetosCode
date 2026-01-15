# 📋 CRUD de Clientes - Sistema Completo

Um sistema completo de gestão de clientes com interface moderna, funcionalidades avançadas e suporte a dark mode.

## ✨ Novas Funcionalidades Implementadas

### 🌙 Dark Mode
- **Tema Escuro/Claro**: Clique no botão de tema no header para alternar entre modo claro e escuro
- **Persistência**: Sua preferência de tema é salva automaticamente
- **Transições Suaves**: Animações elegantes ao mudar de tema

### 🔍 Buscas Avançadas e Ordenação
- **Busca em Tempo Real**: Filtra por nome, email ou celular enquanto digita
- **Ordenação de Colunas**: Clique no cabeçalho das colunas para ordenar (A→Z ou Z→A)
- **Indicadores Visuais**: Mostra qual coluna está ordenada

### 📊 Estatísticas e Dashboard
- **Total de Clientes**: Contagem em tempo real
- **Última Atualização**: Mostra quando os dados foram modificados pela última vez
- **Cards Visuais**: Exibição clara das informações principais

### 💾 Importação e Exportação de Dados
- **Exportar para CSV**: Exporte todos os clientes em formato CSV
- **Exportar para JSON**: Faça backup completo dos dados
- **Importar Dados**: Carregue dados de arquivos CSV ou JSON
- **Backup Automático**: Todos os dados são salvos no localStorage

### ✅ Validações Aprimoradas
- **Validação de Email**: Impede emails duplicados
- **Formatação Automática de Telefone**: Formata enquanto você digita (XX) XXXXX-XXXX
- **Validação de Telefone**: Aceita apenas números válidos com 11 dígitos
- **Segurança**: Escape de HTML para prevenir XSS

### 🎨 Design e UX Melhorados
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e celular
- **Animações Suaves**: Transições elegantes em modais, notificações e hover
- **Feedback Visual**: Notificações de sucesso, erro e aviso
- **Cores Profissionais**: Paleta de cores moderna e consistente
- **Contraste Adequado**: Texto sempre visível em qualquer tema

### 📱 Mobile First
- **Tabelas Responsivas**: Em celulares se transformam em cards
- **Botão Flutuante**: Fácil acesso ao cadastro em dispositivos pequenos
- **Modal Otimizado**: Adapta-se perfeitamente à tela do celular
- **Touch Friendly**: Botões grandes e espaçamento adequado

### 🔒 Segurança
- **Confirmação de Deleção**: Previne exclusões acidentais
- **Escape de HTML**: Protege contra ataques XSS
- **Validação de Entrada**: Verifica todos os dados antes de salvar

## 📋 Como Usar

### Cadastrar Cliente
1. Clique em "Cadastrar Clientes"
2. Preencha os campos: Nome, Email, Celular, Cidade
3. O celular será formatado automaticamente
4. Clique em "Salvar"

### Editar Cliente
1. Clique no botão ✏️ na linha do cliente
2. Modifique os dados desejados
3. Clique em "Salvar"

### Deletar Cliente
1. Clique no botão 🗑️ na linha do cliente
2. Confirme a ação

### Buscar Clientes
1. Digite na caixa de busca
2. A tabela se atualiza em tempo real
3. Limpe a busca clicando em "Limpar busca"

### Ordenar Tabela
1. Clique no cabeçalho da coluna que deseja ordenar
2. Clique novamente para inverter a ordem

### Exportar Dados
1. Clique em "Exportar CSV" para baixar um arquivo CSV
2. Ou exporte como JSON para backup completo

### Importar Dados
1. Clique em "Importar"
2. Selecione um arquivo CSV ou JSON
3. Confirme a importação (substituirá os dados atuais)

### Mudar Tema
1. Clique no ícone de tema (🌙 ou ☀️) no topo direito
2. O tema muda instantaneamente e é salvo

## 🔧 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Grid, Flexbox, Variáveis CSS, Dark Mode
- **JavaScript Vanilla**: Sem dependências
- **LocalStorage**: Persistência de dados

## 📦 Estrutura de Arquivos

```
Crud/
├── index.html          # Estrutura HTML
├── index.js            # Lógica JavaScript
├── css/
│   ├── main.css        # Estilos principais
│   ├── button.css      # Estilos de botões
│   ├── modal.css       # Estilos de modal
│   └── records.css     # Estilos de tabela
└── favicon_io/         # Ícones do site
```

## 🎯 Funcionalidades Futuras Possíveis

- [ ] Backend com banco de dados
- [ ] Autenticação de usuários
- [ ] Múltiplos usuários
- [ ] Histórico de alterações
- [ ] Agendamentos por cliente
- [ ] Envio de emails
- [ ] Relatórios em PDF

## 📝 Licença

Projeto livre para uso pessoal e educacional.

---

Desenvolvido com ❤️ por Felipe Pontes
