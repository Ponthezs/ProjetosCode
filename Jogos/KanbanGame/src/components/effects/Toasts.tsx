import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../../store/gameStore';
import { cx } from '../../utils/format';

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[90] flex w-[340px] max-w-[calc(100vw-24px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            className={cx(
              'pointer-events-auto glass-strong flex items-start gap-3 rounded-2xl px-4 py-3 text-left',
              t.tone === 'bad' && 'border-bad/40',
              t.tone === 'warn' && 'border-warn/40',
              t.tone === 'good' && 'border-good/40',
            )}
          >
            <span className="text-lg leading-6">{t.icon ?? 'ℹ️'}</span>
            <span className="min-w-0">
              <span className={cx('block text-sm font-semibold', t.tone === 'bad' ? 'text-bad' : t.tone === 'warn' ? 'text-warn' : t.tone === 'good' ? 'text-good' : 'text-fg')}>{t.title}</span>
              {t.body && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
