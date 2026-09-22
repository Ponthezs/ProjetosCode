import { useMemo } from 'react';
import {
  blockedCards, cycleTimeAvg, detectBottleneck, leadTimeAvg, openIncidents, slaAtRisk, teamMorale, throughputAvg, totalWip, velocityAvg,
} from '../analytics/metrics';
import { generateInsights } from '../game-engine/advisor';
import { WORK_STAGES } from '../data/board';
import type { GameState } from '../types';

export function useMetrics(g: GameState) {
  return useMemo(() => {
    const bn = detectBottleneck(g);
    const prev = g.history[g.history.length - 2];
    const last = g.history[g.history.length - 1];
    return {
      lead: leadTimeAvg(g),
      cycle: cycleTimeAvg(g),
      leadPrev: prev?.leadTimeAvg ?? null,
      cyclePrev: prev?.cycleTimeAvg ?? null,
      throughput: throughputAvg(g, 5),
      velocity: velocityAvg(g, 5),
      wip: totalWip(g),
      wipLimit: WORK_STAGES.reduce((a, s) => a + g.wipLimits[s], 0),
      blocked: blockedCards(g).length,
      slaRisk: slaAtRisk(g).length,
      incidents: openIncidents(g).length,
      morale: teamMorale(g),
      profit: g.revenueTotal - g.costsTotal,
      bottleneck: bn.stage,
      stats: bn.stats,
      last,
    };
  }, [g]);
}

export function useInsights(g: GameState) {
  return useMemo(() => generateInsights(g), [g]);
}
