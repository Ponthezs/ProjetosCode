import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, MousePointerClick } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TUTORIAL_STEPS } from '../../data/tutorial';
import { useGame } from '../../store/gameStore';
import type { GameState } from '../../types';
import { Button } from '../ui';

export function Tutorial({ g }: { g: GameState }) {
  const { tutorialStep, setTutorialStep, dispatch, setView, animating, setRightPanel } = useGame();
  const step = TUTORIAL_STEPS[tutorialStep];
  const baseRef = useRef<GameState>(g);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    baseRef.current = g;
    if (step?.target === 'team-rail') setRightPanel(true);
    if (step?.view) setView(step.view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialStep]);

  useLayoutEffect(() => {
    if (!step?.target) return setRect(null);
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const t = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    return () => {
      clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [step, g]);

  const done = !!step?.check?.(g, baseRef.current);
  useEffect(() => {
    if (done && !animating) {
      const t = setTimeout(() => next(), 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, animating]);

  const next = () => {
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) finish();
    else setTutorialStep(tutorialStep + 1);
  };
  const finish = () => {
    dispatch({ type: 'endTutorial' });
    setTutorialStep(0);
  };

  if (!g.tutorial || !step || animating) return null;

  const pad = 8;
  const hole = rect ? { x: rect.left - pad, y: rect.top - pad, w: rect.width + pad * 2, h: rect.height + pad * 2 } : null;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const boxW = Math.min(380, vw - 24);
  let pos: { left: number; top: number };
  if (!hole || step.placement === 'center') pos = { left: vw / 2 - boxW / 2, top: vh / 2 - 130 };
  else if (step.placement === 'bottom') pos = { left: hole.x + hole.w / 2 - boxW / 2, top: Math.min(hole.y + hole.h + 12, vh - 260) };
  else if (hole.h > vh * 0.45) pos = { left: hole.x + hole.w - boxW - 24, top: hole.y + hole.h - 280 };
  else if (step.placement === 'top') pos = { left: hole.x + hole.w / 2 - boxW / 2, top: Math.max(12, hole.y - 250) };
  else if (step.placement === 'left') pos = { left: hole.x - boxW - 14, top: hole.y + 20 };
  else pos = { left: hole.x + hole.w + 14, top: hole.y + 20 };
  pos.left = Math.max(12, Math.min(vw - boxW - 12, pos.left));
  pos.top = Math.max(12, Math.min(vh - 240, pos.top));
  const interactive = !!step.check;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]">
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: interactive ? 'none' : 'auto' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {hole && <motion.rect initial={false} x={hole.x} y={hole.y} width={hole.w} height={hole.h} animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }} rx="16" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(3,5,10,0.62)" mask="url(#tour-mask)" />
        {hole && <motion.rect initial={false} x={hole.x} y={hole.y} width={hole.w} height={hole.h} animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }} rx="16" fill="none" stroke="var(--accent)" strokeWidth="2" className="drop-shadow-[0_0_12px_rgba(124,131,255,0.8)]" />}
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="glass-strong pointer-events-auto absolute rounded-2xl border-accent/40 p-5 shadow-[var(--glow)]"
          style={{ left: pos.left, top: pos.top, width: boxW }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent"><GraduationCap size={13} /> Tutorial · {tutorialStep + 1}/{TUTORIAL_STEPS.length}</div>
          <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-fg/85">{step.body}</p>
          {step.action && (
            <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${done ? 'border-good/40 bg-good/10 text-good' : 'border-accent/40 bg-accent/10 text-fg'}`}>
              <MousePointerClick size={15} /> {done ? 'Feito! ✓' : step.action}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button className="text-xs text-muted hover:text-fg" onClick={finish}>Pular tutorial</button>
            {!step.check && <Button size="sm" variant="primary" onClick={next}>{tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Começar' : 'Próximo →'}</Button>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
