# RemapTech — ECU Calibration Platform

Plataforma web profissional para gerenciamento, análise e desenvolvimento de projetos de remap automotivo (chip tuning / calibração de ECU).

> Nome provisório — pode ser alterado futuramente.

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **UI:** TailwindCSS v4 (tema dark "Automotive Performance / Motorsport / ECU Tuning")
- **Ícones:** Lucide Icons
- **Gráficos 2D:** Recharts
- **Gráficos 3D (superfície de calibração):** Plotly.js (via `react-plotly.js`, carregado sob demanda)
- **Estado/dados:** Context API + `localStorage` (dados fictícios de demonstração — pronto para trocar por uma API Node.js + PostgreSQL no futuro)

## Como rodar

```bash
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (gera /dist)
npm run preview   # servir o build de produção localmente
```

## Estrutura do projeto

```
src/
  components/   componentes reutilizáveis (Sidebar, Topbar, StatCard, badges...)
  context/      estado global (usuário, simulation mode, veículos, clientes)
  data/         dados fictícios (mock) para demonstração de todos os módulos
  hooks/        hooks utilitários (persistência local)
  layouts/      layout principal do app (sidebar + topbar)
  pages/        cada tela do sistema (uma por módulo do menu)
  types/        tipos TypeScript compartilhados
```

## Módulos implementados (interface + navegação funcional, dados fictícios)

- **Login** — seleção de perfil (Administrador, Calibrador, Técnico, Atendimento)
- **Home** — landing interna com hero "REMAPTECH — ECU Calibration Platform"
- **Dashboard** — indicadores gerais + gráficos (remaps/mês, marcas, combustíveis, stage mais usado)
- **Garagem** — cards dos veículos cadastrados
- **Cadastro de veículo** — formulário completo (veículo + ECU + foto)
- **Projeto do veículo** — visão geral, arquivos ECU e histórico por veículo
- **Clientes** — cadastro e veículos vinculados
- **Projetos** — kanban por status (Novo → Finalizado)
- **ECU Files** — upload, versionamento, checksum e status
- **Map Editor** — árvore de mapas, editor de tabela, visualização 2D, 3D (superfície) e hexadecimal
- **File Compare** — comparação original x modificado, com visualização hexadecimal de diferenças
- **Map Library** — biblioteca de mapas por marca/motor/ECU
- **ECU Database** — busca de ECUs por marca/modelo/motor/ano
- **Performance** — potência/torque original x estimado
- **Dyno** — simulação de dinamômetro (Stock, Stage 1, Stage 2, Custom)
- **Logs** — parâmetros do veículo (RPM, AFR, boost, ignição, etc.)
- **Relatórios** — relatório profissional do projeto de remap
- **Ordens de Serviço**
- **Configurações** — usuários, perfis de acesso, backup/segurança, Simulation Mode

## Importante

Este é um sistema de **interface e arquitetura**. Funções de leitura, interpretação ou gravação real de arquivos de ECU devem ser implementadas posteriormente por módulos específicos, com protocolos autorizados, validação, checksum, versionamento e confirmação do usuário — nunca sobrescrevendo o arquivo original. Nenhuma função de burlar proteções de ECU, imobilizador, antifurto ou controle de emissões deve ser implementada.

## Próximos passos sugeridos

1. Backend Node.js + API REST + PostgreSQL para persistência real (hoje os dados ficam em `localStorage`, apenas para demonstração).
2. Autenticação real com permissões por perfil.
3. Upload real de arquivos `.bin`/`.hex` com parser de mapas e checksum real.
4. Exportação de relatórios em PDF.
5. Testes de detecção de mapas ligados a um motor de análise real de ECU.
