# FLOW OPS — Agile Management Simulator

> Gerencie pessoas. Controle o fluxo. Tome decisões. Entregue valor.

Simulador de gestão ágil e Kanban em que você comanda uma equipe de desenvolvimento de software. O objetivo é ensinar, jogando, que **fluxo vale mais que utilização individual**: WIP, gargalos, Lead Time, Cycle Time, Throughput, classes de serviço, bloqueios, qualidade e gestão de pessoas.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção em /dist
npm run simulate   # simulação headless de todos os cenários (balanceamento)
```

> O que é e como interpretar o `npm run simulate`: veja [scripts/README.md](scripts/README.md).

Requer Node 20+.

## Stack

React 18 · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Lucide · dnd-kit · Zustand · Immer · Vite

## O que já está jogável

- Menu cinematográfico, nova partida (campanha e modos), continuar, ranking, como jogar, configurações
- Kanban com 9 colunas, drag-and-drop de **cards** e de **pessoas**, limites de WIP editáveis, indicadores de capacidade, produtividade, fila e gargalo por coluna
- Cards completos: tipo, classe de serviço, prioridade, valor, complexidade, risco, SLA/data fixa, dependências, bloqueios, bugs, retrabalho, responsáveis, histórico
- Equipe com habilidades (★), velocidade, qualidade, experiência, energia, moral, estresse, burnout, traços de personalidade; treinar, promover, dar folga, demitir, contratar (mercado de talentos)
- Capacidade diária não determinística (faixa prevista × resultado real) influenciada por especialização, energia, moral, dívida técnica, foco, hora extra, eventos, melhorias e onboarding
- Motor diário: trabalho, defeitos ocultos, detecção em Review/Testes/Homologação (retrabalho), bugs que escapam para produção, bloqueios, dependências, pull automático, SLAs, incidentes, finanças, moral, dívida técnica, chegada de demandas
- 86 eventos com escolhas e consequências (inclusive probabilísticas)
- Daily stand-up, foco do dia, Flow AI (consultor com sugestões aplicáveis), momentos de aprendizado com dados reais da partida, tutorial interativo
- Analytics: CFD, distribuição de Cycle Time, tendência de Lead Time, Throughput, WIP, financeiro, satisfação, qualidade, heatmap de gargalos e visão em tabela
- Office View 2.5D, skill tree (20 melhorias), 30 conquistas, relatório final com score, rank, retrospectiva e recomendações
- Seeds reproduzíveis (`#FX-83742`), salvamento automático (LocalStorage), dark/light mode, sons sintetizados, responsivo

## Arquitetura

```
src/
  types/          Tipos do domínio (estado 100% serializável)
  data/           Configuração: board, profissionais (30), tarefas (100), clientes (15),
                  dificuldades (5) e modos, melhorias (20), conquistas (30), lições, tutorial
  events/         Catálogo de eventos (86) em DSL declarativa de efeitos
  scenarios/      8 cenários de campanha
  game-engine/    Motor independente da UI
    engine.ts     processDay() — simulação diária
    capacity.ts   calculateCapacity / especialização / variância
    events.ts     sorteio e aplicação de efeitos
    generator.ts  geração procedural com seed (cards, equipe, clientes, mercado)
    actions.ts    reducer de comandos (applyAction) — base para multiplayer/replay
    advisor.ts    FLOW AI
    report.ts     score, relatório de gestão e retrospectiva
    rng.ts        PRNG determinístico
    index.ts      fachada GameEngine
  analytics/      Métricas (lead/cycle/throughput/gargalo) e tema dos gráficos
  services/       Persistência (StorageAdapter) e som
  store/          Estado da aplicação (Zustand)
  hooks/          Métricas derivadas memorizadas
  components/     UI por domínio (kanban, team, analytics, events, office, ...)
  pages/          Telas
scripts/          simulate.ts (balanceamento), diag.ts (diagnóstico de fluxo)
```

### Princípios

- **Motor separado da interface.** A UI só chama `applyAction(state, action)` e lê o estado. O mesmo motor roda no Node (`npm run simulate`).
- **Command pattern.** Toda interação é um `GameAction` serializável. `ActionEnvelope` já prevê o papel do jogador (gestor, analista, dev, QA, PO) para o modo multiplayer.
- **Determinismo.** O estado do RNG vive no `GameState`; seed + ações reproduzem a partida.
- **Nada fixo no front-end.** Conteúdo em `data/`, `events/` e `scenarios/`. Para adicionar um evento, basta um novo objeto no catálogo usando a DSL de efeitos.
- **Persistência plugável.** Implemente `StorageAdapter` (ex.: Supabase/Firebase/PostgreSQL via API) e chame `setStorageAdapter()`.

## Próximos passos sugeridos

- Multiplayer (sincronizar `ActionEnvelope` via Supabase Realtime/WebSocket)
- Linhas visuais de dependência entre cards
- Editor de cenários no modo Sandbox
- Mais animações na Office View
