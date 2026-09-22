/* Diagnóstico de fluxo de uma partida: npx tsx scripts/diag.ts <cenario> */
import { applyAction } from '../src/game-engine/actions';
import { createGame } from '../src/game-engine/generator';
import { generateInsights } from '../src/game-engine/advisor';
import { cardsIn } from '../src/analytics/metrics';
import { WORK_STAGES } from '../src/data/board';

const scen = process.argv[2] ?? 'saas';
let s = createGame({ mode: 'standard', scenarioId: scen, difficultyId: 'normal', seedLabel: '#AA-1' });
console.log('team', s.peopleOrder.map((id) => `${s.people[id].name}:${s.people[id].role}->${s.people[id].stage}`).join(' | '));
while (s.phase === 'planning') {
  for (const ev of s.pendingEvents) s = applyAction(s, { type: 'resolveEvent', instanceId: ev.instanceId, choiceId: ev.choices?.[0]?.id });
  const want = s.wipLimits.ready - cardsIn(s, 'ready').length;
  for (const c of cardsIn(s, 'backlog').slice(0, Math.max(0, want))) s = applyAction(s, { type: 'moveCard', cardId: c.id, to: 'ready' });
  for (const ins of generateInsights(s).slice(0, 3)) if (ins.action && (ins.id.startsWith('bn-') || ins.id.startsWith('nobody-'))) for (const a of ins.action.actions) s = applyAction(s, a);
  s = applyAction(s, { type: 'processDay' });
  const h = s.history[s.history.length - 1];
  console.log(`d${h.day} cols=${WORK_STAGES.map((st) => `${st.slice(0, 3)}:${h.cfd[st]}`).join(' ')} util=${WORK_STAGES.map((st) => Math.round(h.utilization[st] * 100)).join('/')} tp=${h.throughput} bn=${h.bottleneck} sat=${h.clientSat} pts=${h.pointsDone}`);
}
const time: Record<string, number[]> = {};
for (const d of s.delivered) {
  const c = s.cards[d.cardId];
  for (let i = 0; i < c.history.length - 1; i++) {
    const st = c.history[i].stage;
    (time[st] ??= []).push(c.history[i + 1].day - c.history[i].day);
  }
}
console.log(Object.fromEntries(Object.entries(time).map(([k, v]) => [k, (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)])));
console.log('avg complexity', (s.delivered.reduce((a, d) => a + s.cards[d.cardId].complexity, 0) / Math.max(1, s.delivered.length)).toFixed(1));
console.log('team end', s.peopleOrder.map((id) => `${s.people[id].name.split(' ')[0]}->${s.people[id].stage} e${Math.round(s.people[id].energy)}`).join(' | '));
