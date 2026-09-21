# Fluxen ERP

Sistema de gestão empresarial (ERP) em HTML, CSS e JavaScript puro, sem
frameworks e sem dependência de servidor para funcionar: todos os dados são
mantidos no navegador (localStorage) através de uma camada de acesso a
dados isolada, preparada para ser substituída por uma API e um banco de
dados relacional no futuro sem reescrever as telas.

## Início rápido

1. Sirva os arquivos por HTTP (recomendado, em vez de abrir diretamente com
   `file://`):
   ```bash
   python3 -m http.server 8000
   # ou: npx http-server -p 8000
   ```
2. Acesse `http://localhost:8000/index.html` — a home institucional, com
   apresentação do sistema e os botões **Entrar** e **Criar conta**.
3. Crie uma conta em `cadastro.html` (vira Administrador na hora) ou entre
   com as credenciais de demonstração abaixo (dados fictícios são gerados
   automaticamente na primeira execução).

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@erp.com` | `admin123` |
| Gerente | `marina.souza@fluxenerp.com.br` | `Gerente123` |
| Financeiro | `rafael.lima@fluxenerp.com.br` | `Financ123` |
| Vendedor | `juliana.costa@fluxenerp.com.br` | `Vendas123` |
| Estoque | `bruno.carvalho@fluxenerp.com.br` | `Estoque123` |

## Módulos

Dashboard · Clientes · Fornecedores · Produtos e Categorias · Estoque ·
Vendas · Compras · Financeiro · Contas a pagar · Contas a receber · Fluxo
de caixa · Relatórios · Usuários · Configurações.

Descrição de cada módulo, regras de negócio e perfis de acesso estão em
[`docs/negocio`](docs/negocio/01-visao-geral.md).

## Estrutura do projeto

```
ERP/
├── index.html       # Home institucional (apresentação do sistema)
├── login.html, cadastro.html
├── assets/
│   ├── logo/        # Logo e favicon do Fluxen ERP
│   ├── images/      # Reservado para banners/ilustrações (vazio por ora)
│   └── icons/       # Reservado para ícones próprios em SVG (vazio por ora)
├── css/            # Design system (tokens, layout, componentes, responsividade, impressão)
├── js/core/        # Storage, autenticação, layout, componentes de UI, notificações
├── js/services/    # Regras de negócio por entidade (uma camada, isolada do armazenamento)
├── js/pages/        # Controlador de cada página
├── pages/           # Uma página HTML por módulo
├── db/schema.sql    # Modelo relacional para a futura API/banco de dados
└── docs/
    ├── negocio/     # Visão geral, regras de negócio, perfis de acesso, manual do usuário
    └── tecnico/     # Arquitetura, modelo de dados, guia de desenvolvimento, plano de migração para API, changelog
```

Documentação técnica completa (arquitetura, modelo de dados, convenções de
código e o roteiro de migração para uma API/banco de dados real) está em
[`docs/tecnico`](docs/tecnico/01-arquitetura.md).

## Stack

HTML5, CSS3 (variáveis nativas, sem pré-processador), JavaScript ES6+ sem
frameworks, Font Awesome (ícones), Chart.js (gráficos) e jsPDF (exportação
de relatórios em PDF), todos via CDN.

## Histórico

Este projeto substituiu um protótipo de loja online anterior. Os arquivos
descontinuados dessa versão foram removidos da raiz do projeto — veja
[`docs/tecnico/05-changelog.md`](docs/tecnico/05-changelog.md) para a lista
completa e o histórico da migração.
