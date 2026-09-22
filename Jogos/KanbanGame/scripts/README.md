# 🧪 Simulador de balanceamento — `npm run simulate`

Ferramenta de linha de comando que **joga partidas completas do FLOW OPS sozinha**, sem abrir o navegador, e imprime os resultados de cada uma.

```powershell
npm run simulate            # todos os 8 cenários
npx tsx scripts/simulate.ts saas      # apenas um cenário
npx tsx scripts/diag.ts legacy        # diagnóstico dia a dia de uma partida
```

---

## Para que serve?

O FLOW OPS é um jogo educativo. A mensagem central dele é:

> **Fluxo > utilização individual.** Respeitar limites de WIP e ajudar o gargalo entrega mais do que "manter todo mundo ocupado".

Para que o jogo **ensine isso de verdade**, as regras da simulação precisam fazer essa estratégia vencer, e não só dizer que ela vence. O simulador existe para **provar com números** que o motor do jogo está equilibrado.

Use-o para:

| Situação | O que o simulador responde |
|---|---|
| Alterou uma regra do motor (`src/game-engine`) | O jogo continua ensinando a lição certa? |
| Criou ou editou um cenário (`src/scenarios`) | Ele está fácil demais? Impossível? |
| Mudou valores de cards, pessoas ou eventos (`src/data`, `src/events`) | Os scores e rankings ainda fazem sentido? |
| Ajustou a pontuação (`report.ts`) ou os ranks | Quantos pontos um jogador bom/ruim faz? |
| Quer detectar regressões | Os mesmos números de antes continuam saindo? (as partidas são determinísticas) |

Ele roda o **mesmo motor** que a interface usa (`applyAction` / `processDay`), então o resultado reflete exatamente o que o jogador experimenta.

---

## Como funciona

Para cada cenário, o script joga **3 partidas de 30 dias** (seeds `#AA-1`, `#BB-2`, `#CC-3`) com **duas estratégias** controladas por um "bot":

### 🟢 `pull` — o gestor que entende Kanban
- Mantém os limites de WIP do cenário.
- Reabastece a coluna **Ready** só até o limite.
- Aplica as sugestões do **Flow AI**: realoca pessoas para o gargalo, cobre estágios vazios, trata incidentes e burnout.

### 🔴 `push` — o gestor que quer todos ocupados
- Sobe **todos os limites de WIP para 12**.
- Empurra o máximo de trabalho para o quadro.
- Não reorganiza a equipe.

Em ambas, os eventos são resolvidos sempre com a primeira opção, e o auto-pull fica ligado.

Como o jogo usa um gerador aleatório com **seed**, a mesma seed + as mesmas ações produzem **sempre o mesmo resultado**. Isso torna a comparação justa e repetível.

---

## Como ler a saída

```
hospital [pull] avg=1101455
  #AA-1 score=937386 rank=AGILE EXPERT deliv=35 rev=487k cost=166k LT=8.1 CT=7.2 wip=11.1 esc=1 rew=8 sat=52 morale=85 debt=33 backlog=7 bn=uat stars=2 breaches=12
```

| Campo | Significado |
|---|---|
| `avg` | Score médio das 3 partidas daquela estratégia |
| `score` / `rank` | Pontuação final e classificação (Rookie → Flow Master) |
| `deliv` | Demandas entregues (Done) |
| `rev` / `cost` | Receita e custos acumulados |
| `LT` | Lead Time médio (dias, de Ready até Done) |
| `CT` | Cycle Time médio (dias, de Análise até Done) |
| `wip` | WIP médio (cards em andamento por dia) |
| `esc` | Bugs que escaparam para produção |
| `rew` | Retrabalhos (bugs encontrados antes da produção) |
| `sat` / `morale` | Satisfação do cliente / moral da equipe (%) |
| `debt` | Dívida técnica final (%) |
| `backlog` | Cards esperando no backlog ao final |
| `bn` | Estágio que mais vezes foi o gargalo |
| `stars` | Metas do cenário cumpridas (0–3) |
| `breaches` | SLAs violados |

### O que procurar

- ✅ **`pull` com `avg` maior que `push`** → o jogo recompensa o fluxo. É o resultado esperado.
- ✅ **`push` com `wip` bem mais alto e `LT` igual ou maior** → a Lei de Little está funcionando (mais WIP = mais espera).
- ⚠️ **`push` vencendo** → o cenário não pune o excesso de WIP o suficiente (hoje acontece levemente na *Empresa SaaS*).
- ⚠️ **`deliv=0` ou `LT=undefined`** → algum estágio ficou sem ninguém ou o fluxo travou (esperado no `push` da *Transformação Ágil*, que é justamente a lição daquele cenário).
- ⚠️ **`stars=3` em todas as seeds** → cenário fácil demais; **`stars=0`** em todas → difícil demais.

---

## `diag.ts` — diagnóstico de uma partida

```powershell
npx tsx scripts/diag.ts fintech
```

Mostra **dia a dia** quantos cards há em cada estágio, a utilização de cada setor, o throughput, o gargalo e a satisfação, e no final quanto tempo, em média, os cards ficaram em cada coluna. Útil para entender **por que** um cenário está lento ou travando.

---

## Dicas

- Quer testar outra dificuldade? Em `scripts/simulate.ts`, troque `'normal'` por `'easy'`, `'hard'`, `'expert'` ou `'realistic'`.
- Quer mais amostras? Adicione seeds à lista `['#AA-1', '#BB-2', '#CC-3']`.
- Quer testar outra estratégia? Crie uma nova função de bot: toda ação do jogo é um `GameAction` passado para `applyAction(estado, ação)`.
