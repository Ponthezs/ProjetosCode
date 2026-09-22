import { Bot, ScrollText, Users } from 'lucide-react';
import { useState } from 'react';
import type { GameState } from '../../types';
import { cx } from '../../utils/format';
import { FlowAI } from '../advisor/FlowAI';
import { TeamRail } from '../team/TeamRail';
import { Segmented } from '../ui';

export function RightPanel({ g }: { g: GameState }) {
  const [tab, setTab] = useState<'team' | 'ai' | 'feed'>('team');
  return (
    <aside className="relative z-10 flex h-full w-[340px] shrink-0 flex-col border-l border-line bg-bg-2/50 backdrop-blur-md">
      <div className="p-3 pb-2">
        <Segmented
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'team', label: <span className="flex items-center gap-1"><Users size={13} />Equipe</span> },
            { value: 'ai', label: <span className="flex items-center gap-1"><Bot size={13} />Flow AI</span> },
            { value: 'feed', label: <span className="flex items-center gap-1"><ScrollText size={13} />Feed</span> },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 px-3 pb-3">
        {tab === 'team' && <TeamRail g={g} />}
        {tab === 'ai' && <div className="scroll-thin h-full overflow-y-auto pr-1"><FlowAI g={g} /></div>}
        {tab === 'feed' && <Feed g={g} />}
      </div>
    </aside>
  );
}

export function Feed({ g, full }: { g: GameState; full?: boolean }) {
  const items = [...g.log].reverse().slice(0, full ? 250 : 80);
  return (
    <div className="scroll-thin h-full space-y-1 overflow-y-auto pr-1">
      {items.map((l, i) => (
        <div key={i} className="flex gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
          <span className="num mt-0.5 w-8 shrink-0 text-[10px] text-faint">D{l.day}</span>
          <span className="text-sm leading-5">{l.icon}</span>
          <span className={cx('text-[12px] leading-5', l.tone === 'bad' ? 'text-red-300' : l.tone === 'good' ? 'text-emerald-300' : l.tone === 'warn' ? 'text-amber-200' : 'text-fg/85')}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}
