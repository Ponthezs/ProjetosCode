/* Simulação headless para balanceamento: npm run simulate */
import { applyAction } from '../src/game-engine/actions';
import { createGame } from '../src/game-engine/generator';
import { generateInsights } from '../src/game-engine/advisor';
import { cardsIn, leadTimeAvg, cycleTimeAvg, teamMorale } from '../src/analytics/metrics';
import { SCENARIOS } from '../src/scenarios';
import type { GameState } from '../src/types';

function play(scenarioId: string, difficultyId: string, seed: string, strategy: 'pull' | 'push'): GameState {
  let s = createGame({ mode: 'standard', scenarioId, difficultyId, seedLabel: seed });
  if (strategy === 'push') for (const st of ['ready', 'analysis', 'dev', 'review', 'test', 'uat', 'deploy'] as const) s = applyAction(s, { type: 'setWip', stage: st, limit: 12 });
  s = applyAction(s, { type: 'setAutoPull', value: true });
  let guard = 0;
  while (s.phase === 'planning' && guard++ < 100) {
    for (const ev of s.pendingEvents) s = applyAction(s, { type: 'resolveEvent', instanceId: ev.instanceId, choiceId: ev.choices?.[0]?.id });
    // Reabastece Ready
    const want = s.wipLimits.ready - cardsIn(s, 'ready').length;
    for (const c of cardsIn(s, 'backlog').slice(0, Math.max(0, want))) s = applyAction(s, { type: 'moveCard', cardId: c.id, to: 'ready' });
    // Novos contratados vão para o estágio primário automaticamente (hire) — pessoas sem estágio vão para dev
    for (const id of s.peopleOrder) if (!s.people[id].stage) s = applyAction(s, { type: 'assignPerson', personId: id, stage: 'dev' });
    if (strategy === 'pull') {
      for (const ins of generateInsights(s).slice(0, 3)) {
        if (ins.action && (ins.id.startsWith('bn-') || ins.id.startsWith('nobody-') || ins.id === 'incidents' || ins.id.startsWith('burnout'))) for (const a of ins.action.actions) s = applyAction(s, a);
      }
    }
    s = applyAction(s, { type: 'processDay' });
  }
  return s;
}

const scen = process.argv[2] ? [process.argv[2]] : SCENARIOS.map((x) => x.id);
for (const id of scen) {
  for (const strat of ['pull', 'push'] as const) {
    const rows: string[] = [];
    let sum = 0;
    for (const seed of ['#AA-1', '#BB-2', '#CC-3']) {
      const s = play(id, 'normal', seed, strat);
      const r = s.report!;
      sum += r.score;
      rows.push(`  ${seed} score=${r.score} rank=${r.rank.name} deliv=${s.delivered.length} rev=${Math.round(s.revenueTotal / 1000)}k cost=${Math.round(s.costsTotal / 1000)}k LT=${leadTimeAvg(s)?.toFixed(1)} CT=${cycleTimeAvg(s)?.toFixed(1)} wip=${r.metrics.avgWip.toFixed(1)} esc=${s.counters.bugsEscaped} rew=${s.counters.reworkTotal} sat=${Math.round(s.clientSatisfaction)} morale=${Math.round(teamMorale(s))} debt=${Math.round(s.techDebt)} backlog=${s.columns.backlog.length} bn=${r.mainBottleneck} stars=${r.stars} breaches=${s.counters.slaBreaches}`);
    }
    console.log(`${id} [${strat}] avg=${Math.round(sum / 3)}`);
    rows.forEach((r) => console.log(r));
  }
}
