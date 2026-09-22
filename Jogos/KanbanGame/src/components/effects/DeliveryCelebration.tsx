import { AnimatePresence, motion } from 'framer-motion';
import { CARD_TYPES } from '../../data/board';
import { useGame } from '../../store/gameStore';
import { money } from '../../utils/format';

/** Recompensa visual das entregas do dia */
export function DeliveryCelebration() {
  const { celebrations, animating } = useGame();
  const items = animating ? celebrations.slice(0, 3) : [];
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[60] flex w-[360px] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {items.map((d, i) => {
          const t = CARD_TYPES[d.type];
          return (
            <motion.div
              key={d.cardId}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ delay: 0.5 + i * 0.25, type: 'spring', stiffness: 260, damping: 20 }}
              className="glass-strong relative overflow-hidden rounded-2xl border-emerald-400/40 p-4 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.6)]"
            >
              <motion.div className="absolute inset-0" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 1.2, delay: 0.5 + i * 0.25 }} style={{ background: 'radial-gradient(circle at 20% 50%, rgba(52,211,153,0.5), transparent 70%)' }} />
              <div className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-good">✅ {t.label} entregue</div>
              <div className="relative mt-1 truncate text-sm font-semibold">{d.title}</div>
              <div className="relative mt-2 flex gap-3 text-xs">
                {d.value > 0 && <span className="num font-bold text-amber-300">+{money(d.value)}</span>}
                <span className={d.clientSatDelta >= 0 ? 'text-good' : 'text-bad'}>Cliente {d.clientSatDelta >= 0 ? '+' : ''}{d.clientSatDelta}</span>
                <span className="text-accent">XP +{d.xp}</span>
                <span className="num ml-auto text-muted">LT {d.leadTime}d</span>
              </div>
              {d.value > 0 && (
                <motion.span className="num absolute right-4 top-3 text-lg font-bold text-amber-300" initial={{ opacity: 0, y: 10 }} animate={{ opacity: [0, 1, 0], y: [10, -10, -40] }} transition={{ duration: 1.6, delay: 0.8 + i * 0.25 }}>
                  +{money(d.value, true)}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {animating && celebrations.length > 3 && <div className="glass rounded-xl px-3 py-1.5 text-center text-xs text-muted">+{celebrations.length - 3} entregas</div>}
    </div>
  );
}
