import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Check, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInsights } from '../../hooks/useMetrics';
import { useGame } from '../../store/gameStore';
import type { GameState, Insight } from '../../types';
import { cx } from '../../utils/format';
import { Button } from '../ui';

const TONE: Record<Insight['severity'], { c: string; label: string }> = {
  critical: { c: '#f87171', label: 'Crítico' },
  warning: { c: '#fbbf24', label: 'Atenção' },
  info: { c: '#60a5fa', label: 'Info' },
  positive: { c: '#34d399', label: 'OK' },
};

export function FlowAI({ g, limit }: { g: GameState; limit?: number }) {
  const insights = useInsights(g);
  const { dispatch, toast } = useGame();
  const [ignored, setIgnored] = useState<string[]>([]);
  useEffect(() => setIgnored([]), [g.day]);
  const list = insights.filter((i) => !ignored.includes(i.id)).slice(0, limit ?? 20);

  const accept = (i: Insight) => {
    if (!i.action) return;
    i.action.actions.forEach((a) => dispatch(a));
    dispatch({ type: 'adviceAccepted' });
    setIgnored((x) => [...x, i.id]);
    toast({ tone: 'good', title: 'Sugestão aplicada', body: i.action.label, icon: '🤖' });
  };

  return (
    <div className="space-y-2" data-tour="flow-ai">
      <div className="flex items-center gap-2 rounded-xl border border-accent/25 bg-gradient-to-r from-accent/15 to-cyan-400/5 p-2.5">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
          <Bot size={17} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-good" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wider">FLOW AI</div>
          <div className="text-[10.5px] text-muted">Analisando {g.history.length} dia(s) de dados reais</div>
        </div>
        <Sparkles size={14} className="ml-auto text-accent" />
      </div>
      <AnimatePresence initial={false}>
        {list.map((i) => (
          <motion.div key={i.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="relative overflow-hidden rounded-xl border border-line bg-solid-2/70 p-3">
            <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: TONE[i.severity].c }} />
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded px-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: TONE[i.severity].c, background: `color-mix(in oklab, ${TONE[i.severity].c} 15%, transparent)` }}>{TONE[i.severity].label}</span>
              <span className="text-[12.5px] font-semibold leading-snug">{i.title}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-fg/85">{i.message}</p>
            {i.cause && <p className="mt-1 text-[11.5px] leading-relaxed text-muted"><b className="text-muted">Possível causa:</b> {i.cause}</p>}
            {i.suggestion && <p className="mt-1 text-[11.5px] leading-relaxed text-muted"><b className="text-muted">Sugestão:</b> {i.suggestion}</p>}
            {(i.action || i.severity !== 'positive') && (
              <div className={cx('mt-2 flex items-center gap-1.5')}>
                {i.action && <Button size="sm" variant="soft" icon={<Check size={12} />} onClick={() => accept(i)}>{i.action.label}</Button>}
                <Button size="sm" variant="ghost" icon={<X size={12} />} onClick={() => setIgnored((x) => [...x, i.id])}>Ignorar</Button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {list.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted">Sem novas observações hoje.</p>}
    </div>
  );
}
