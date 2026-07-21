# 🎧 HelpDesk Pro - Sistema de Atendimento e Chamados

Um sistema completo, moderno e elegante de gerenciamento de chamados de atendimento ao cliente e suporte técnico, desenvolvido em **Python (Flask)** com interface **Dark Glassmorphism**, gráficos interativos e controle de acesso multinível.

---

## ✨ Funcionalidades Principais

- **🔐 Autenticação & Permissões**: Cadastro de usuários, login seguro com criptografia de senha (`Werkzeug`) e diferenciação de papéis (Cliente vs Administrador/Atendente).
- **📊 Dashboard Interativo**: Indicadores KPI em tempo real (Total, Abertos, Em Andamento, Aguardando e Fechados) e 3 gráficos visuais (**Chart.js**) por Status, Prioridade e Categoria.
- **💬 Atendimento Estilo Chat**: Histórico de mensagens estruturado como timeline com avatares dinâmicos (**Gravatar**), identificação de equipe de suporte e ordenação cronológica.
- **📎 Gestão de Anexos**: Upload de imagens, PDFs e arquivos de suporte (com limite de 16MB) e rotas de download seguro.
- **🏷️ Categorização e Filtros**: Organização por Suporte Técnico, Financeiro, Vendas, Dúvidas e filtros dinâmicos por palavra-chave ou protocolo (#TK-XXXXXX).
- **🛡️ Painel de Gestão Admin**: Visualização de todos os usuários cadastrados com permissão para promover/remover administradores.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-Login, Werkzeug
- **Banco de Dados**: SQLite
- **Frontend**: HTML5, CSS3 (Vanilla CSS com Variáveis HSL e Dark Glassmorphism), JavaScript (ES6)
- **Bibliotecas Visuais**: Chart.js (Gráficos), FontAwesome 6 (Ícones), Google Fonts (Inter e Outfit)

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- **Python 3.8** ou superior (verifique executando `python --version` ou `py --version` no terminal).
- **Pip** (gerenciador de pacotes do Python).

---

## 🚀 Passo a Passo para Configuração e Execução

### 1. Clonar ou Acessar a Pasta do Projeto

Abra o seu terminal no diretório do projeto:

```bash
cd "c:\Users\Felipe\OneDrive\Documentos\Github\ProjetosCode\Sites\Sistema de Atendimento"
```

### 2. (Opcional) Criar e Ativar Ambiente Virtual

Recomenda-se o uso de um ambiente virtual (venv):

**No Windows (PowerShell / CMD):**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar Dependências

Instale todos os pacotes necessários especificados no `requirements.txt`:

```bash
pip install -r requirements.txt
```

*(Ou utilize `py -m pip install -r requirements.txt` no Windows)*

### 4. Inicializar o Banco de Dados com Dados de Teste

Execute o script `seed.py` para reconstruir o banco de dados e inserir contas e chamados de exemplo:

```bash
python seed.py
```

### 5. Iniciar a Aplicação

Inicie o servidor de desenvolvimento do Flask:

```bash
python run.py
```

O servidor estará rodando em `http://127.0.0.1:5000`. Abra o seu navegador e acesse a URL!

---

## 🔑 Contas de Teste Pré-cadastradas

Após executar o `python seed.py`, você pode utilizar as seguintes credenciais:

| Nível de Acesso | E-mail | Senha | Descrição |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@sistema.com` | `admin123` | Acesso total a todos os chamados, alteração de status/prioridade e gestão de usuários. |
| **Cliente 1** | `maria@cliente.com` | `user123` | Abertura e acompanhamento de chamados próprios. |
| **Cliente 2** | `carlos@cliente.com` | `user123` | Abertura e acompanhamento de chamados próprios. |

---

## 📁 Estrutura do Projeto

```text
Sistema de Atendimento/
│
├── app/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css            # CSS completo (Dark Glassmorphic UI)
│   │   ├── js/
│   │   │   └── dashboard.js        # Configuração do Chart.js
│   │   └── uploads/                # Diretório de armazenamento de anexos
│   │
│   ├── templates/
│   │   ├── base.html               # Layout principal com Navbar e Sidebar
│   │   ├── login.html              # Tela de Login
│   │   ├── register.html           # Tela de Cadastro de Usuário
│   │   ├── dashboard.html          # Dashboard de métricas e gráficos
│   │   ├── my_tickets.html         # Lista de chamados e filtros
│   │   ├── create_ticket.html       # Formulário de abertura de chamado
│   │   ├── view_ticket.html        # Chat e detalhes do chamado
│   │   └── admin_users.html        # Gestão administrativa de usuários
│   │
│   ├── __init__.py                 # Fábrica da aplicação Flask
│   ├── auth.py                     # Rotas de autenticação (login, logout, register)
│   ├── models.py                   # Modelos do SQLAlchemy (User, Ticket, Message, Attachment)
│   └── routes.py                   # Rotas principais da aplicação
│
├── instance/
│   └── helpdesk.db                 # Arquivo de Banco de Dados SQLite
│
├── config.py                       # Configurações globais (Upload, Secret Key, DB URI)
├── requirements.txt                # Lista de dependências Python
├── run.py                          # Ponto de entrada da aplicação
└── seed.py                         # Script para popular o banco de dados
```

---

## 💡 Recursos e Boas Práticas Implementadas

- **Segurança**: Criptografia de senhas usando hashing SHA-256 via Werkzeug.
- **Clean Code**: Separação modular usando Flask Blueprints (`main_bp` e `auth_bp`).
- **Resiliência**: Validações de upload de arquivos com `secure_filename` e criação automática de pastas.
