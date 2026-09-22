import { ArrowLeft, Trophy } from 'lucide-react';
import { AchievementGrid } from '../components/upgrades/UpgradesView';
import { Button, Segmented } from '../components/ui';
import { GAME_MODES, RANKS } from '../data/difficulties';
import { useGame } from '../store/gameStore';
import { useState } from 'react';
import { cx, dec, int, money } from '../utils/format';

export function RankingPage() {
  const { ranking, setScreen, profile } = useGame();
  const [tab, setTab] = useState<'ranking' | 'achievements'>('ranking');
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-8">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => setScreen('menu')}>Menu</Button>
        <div className="font-display text-lg font-bold"><span className="text-gradient">FLOW OPS</span> <span className="text-muted">/ Ranking</span></div>
        <div className="ml-auto"><Segmented value={tab} onChange={setTab} options={[{ value: 'ranking', label: 'Ranking' }, { value: 'achievements', label: `Conquistas (${profile.achievements.length}/30)` }]} /></div>
      </header>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
        {tab === 'achievements' ? (
          <AchievementGrid unlocked={new Set(profile.achievements)} />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {RANKS.map((r) => <span key={r.id} className="rounded-xl border px-3 py-1.5 text-xs font-bold tracking-wider" style={{ borderColor: `${r.color}66`, color: r.color }}>{r.icon} {r.name} {Number.isFinite(r.min) ? `≥ ${int(r.min)}` : ''}</span>)}
            </div>
            {ranking.length === 0 ? (
              <div className="glass flex flex-col items-center gap-2 rounded-3xl p-12 text-center">
                <Trophy size={40} className="text-faint" />
                <div className="font-display text-xl font-bold">Nenhuma partida concluída</div>
                <p className="text-sm text-muted">Complete uma partida para aparecer no ranking local.</p>
                <Button className="mt-2" variant="primary" onClick={() => setScreen('newgame', 'modes')}>Jogar agora</Button>
              </div>
            ) : (
              <div className="glass scroll-thin overflow-x-auto rounded-3xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                      {['#', 'Score', 'Rank', 'Cenário', 'Modo', 'Dificuldade', 'Lucro', 'Lead Time', 'Throughput', 'Seed', 'Data'].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r, i) => (
                      <tr key={r.id} className="border-b border-line/50 hover:bg-surface-2">
                        <td className="px-4 py-3 text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="num text-sm text-muted">{i + 1}</span>}</td>
                        <td className={cx('num px-4 font-bold', i === 0 && 'text-gradient')}>{int(r.score)}</td>
                        <td className="whitespace-nowrap px-4 text-xs font-semibold">{r.rankName}</td>
                        <td className="px-4">{r.scenario}</td>
                        <td className="px-4 text-muted">{GAME_MODES.find((m) => m.id === r.mode)?.name}</td>
                        <td className="px-4 text-muted">{r.difficulty}</td>
                        <td className="num px-4">{money(r.profit, true)}</td>
                        <td className="num px-4">{dec(r.leadTime)}d</td>
                        <td className="num px-4">{dec(r.throughput, 2)}</td>
                        <td className="num px-4 text-muted">{r.seedLabel}</td>
                        <td className="whitespace-nowrap px-4 text-muted">{new Date(r.date).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
