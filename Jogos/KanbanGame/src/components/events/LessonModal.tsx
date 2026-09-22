import { motion } from 'framer-motion';
import { GraduationCap, Lightbulb } from 'lucide-react';
import { avg, cycleTimeAvg, detectBottleneck, flowEfficiency, leadTimeAvg, throughputAvg, totalWip } from '../../analytics/metrics';
import { SERVICE_CLASSES, STAGE_MAP, WORK_STAGES } from '../../data/board';
import { LESSONS } from '../../data/lessons';
import { useGame } from '../../store/gameStore';
import type { GameState, ServiceClass } from '../../types';
import { dec } from '../../utils/format';
import { Button, Modal } from '../ui';

export function LessonModal({ g }: { g: GameState }) {
  const { dispatch, animating } = useGame();
  const blockingEvents = g.pendingEvents.some((e) => !(e.autoApplied && (e.severity === 'info' || e.severity === 'positive')));
  const id = g.pendingLessons[0];
  const lesson = id ? LESSONS[id] : undefined;
  const open = !!lesson && !animating && !blockingEvents && !g.tutorial;
  if (!lesson) return null;
  return (
    <Modal open={open} closable={false} width={600}>
      <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-accent/20 via-transparent to-cyan-400/10 p-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"><GraduationCap size={14} /> Momento de aprendizado · {lesson.concept}</div>
        <div className="mt-3 flex items-center gap-3">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="text-4xl">{lesson.icon}</motion.span>
          <h2 className="font-display text-2xl font-bold">{lesson.title}</h2>
        </div>
      </div>
      <div className="space-y-4 p-6 pt-2">
        <p className="text-[15px] leading-relaxed text-fg/85">{lesson.body}</p>
        <LessonVisual g={g} kind={lesson.visual} />
        <div className="flex items-start gap-2 rounded-xl border border-good/30 bg-good/10 p-3 text-sm"><Lightbulb size={16} className="mt-0.5 shrink-0 text-good" /><span><b>Lição:</b> {lesson.takeaway}</span></div>
        <div className="flex justify-end gap-2">
          {g.pendingLessons.length > 1 && <Button variant="ghost" onClick={() => g.pendingLessons.forEach((l) => dispatch({ type: 'dismissLesson', lessonId: l }))}>Pular todas ({g.pendingLessons.length})</Button>}
          <Button variant="primary" onClick={() => dispatch({ type: 'dismissLesson', lessonId: lesson.id })}>Entendi</Button>
        </div>
      </div>
    </Modal>
  );
}

function LessonVisual({ g, kind }: { g: GameState; kind: string }) {
  const box = 'rounded-2xl border border-line bg-surface p-4';
  if (kind === 'leadcycle') {
    const d = g.delivered[g.delivered.length - 1];
    if (!d) return null;
    const wait = d.leadTime - d.cycleTime;
    return (
      <div className={box}>
        <div className="mb-2 text-xs text-muted">Seu card <b className="text-fg">{d.code}</b>:</div>
        <div className="flex h-9 overflow-hidden rounded-lg text-[11px] font-semibold">
          {wait > 0 && <div className="flex items-center justify-center bg-slate-500/40" style={{ flex: wait }}>fila {wait}d</div>}
          <div className="flex items-center justify-center bg-accent/60 text-white" style={{ flex: d.cycleTime }}>cycle {d.cycleTime}d</div>
        </div>
        <div className="mt-2 text-xs text-muted">Lead Time = <b className="text-fg">{d.leadTime} dias</b> · Cycle Time = <b className="text-fg">{d.cycleTime} dias</b> · bloqueado {d.blockedDays}d</div>
      </div>
    );
  }
  if (kind === 'littles') {
    const wip = avg(g.history.map((h) => h.wip)) ?? totalWip(g);
    const tp = throughputAvg(g, g.history.length);
    return (
      <div className={`${box} text-center`}>
        <div className="font-display text-lg">Lead Time ≈ <span className="text-accent">WIP</span> ÷ <span className="text-good">Throughput</span></div>
        <div className="num mt-2 text-sm text-muted">{dec(wip)} ÷ {dec(tp, 2)} ≈ <b className="text-fg">{tp > 0 ? dec(wip / tp) : '∞'} dias</b> {leadTimeAvg(g) !== null && <>· medido: <b className="text-fg">{dec(leadTimeAvg(g))} dias</b></>}</div>
      </div>
    );
  }
  if (kind === 'throughput') {
    const h = g.history.slice(-7);
    const max = Math.max(1, ...h.map((x) => x.throughput));
    return (
      <div className={box}>
        <div className="flex h-20 items-end gap-2">
          {h.map((x) => (
            <div key={x.day} className="flex flex-1 flex-col items-center gap-1">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(x.throughput / max) * 60 + 2}px` }} className="w-full rounded-t-md bg-accent/70" />
              <span className="num text-[10px] text-muted">D{x.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted">Média: <b className="text-fg">{dec(throughputAvg(g, 7))} cards/dia</b></div>
      </div>
    );
  }
  if (kind === 'bottleneck') {
    const { stats, stage } = detectBottleneck(g);
    const max = Math.max(1, ...WORK_STAGES.map((s) => Math.min(stats[s].loadDays, 12)));
    return (
      <div className={box}>
        {WORK_STAGES.map((s) => (
          <div key={s} className="mb-1 grid grid-cols-[110px_1fr_50px] items-center gap-2 text-xs">
            <span className={s === stage ? 'font-bold text-bad' : 'text-muted'}>{STAGE_MAP[s].name}</span>
            <div className="h-2 rounded-full bg-surface-3"><div className="h-2 rounded-full" style={{ width: `${(Math.min(stats[s].loadDays, 12) / max) * 100}%`, background: s === stage ? 'var(--bad)' : STAGE_MAP[s].color }} /></div>
            <span className="num text-right text-muted">{dec(stats[s].loadDays)}d</span>
          </div>
        ))}
        <div className="mt-1 text-[11px] text-faint">Dias de trabalho acumulado por estágio (carga ÷ capacidade)</div>
      </div>
    );
  }
  if (kind === 'efficiency') {
    const fe = flowEfficiency(g) ?? 0;
    return (
      <div className={box}>
        <div className="flex h-8 overflow-hidden rounded-lg text-[11px] font-semibold">
          <div className="flex items-center justify-center bg-good/60 text-white" style={{ flex: fe }}>{Math.round(fe * 100)}% ativo</div>
          <div className="flex items-center justify-center bg-slate-500/40" style={{ flex: 1 - fe }}>{Math.round((1 - fe) * 100)}% espera</div>
        </div>
        <div className="mt-2 text-xs text-muted">Cycle time médio {dec(cycleTimeAvg(g))}d · lead time médio {dec(leadTimeAvg(g))}d</div>
      </div>
    );
  }
  if (kind === 'classes') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(SERVICE_CLASSES) as ServiceClass[]).map((c) => (
          <div key={c} className="rounded-xl border border-line bg-surface p-3">
            <div className="text-sm font-semibold" style={{ color: SERVICE_CLASSES[c].color }}>{SERVICE_CLASSES[c].icon} {SERVICE_CLASSES[c].label}</div>
            <div className="mt-1 text-[11px] text-muted">{SERVICE_CLASSES[c].rules[0]}</div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === 'wip') {
    return (
      <div className={`${box} grid grid-cols-2 gap-4 text-center text-xs`}>
        <div>
          <div className="mb-2 font-semibold text-good">WIP baixo</div>
          <div className="flex justify-center gap-1">{[0, 1].map((i) => <div key={i} className="h-10 w-7 rounded-md bg-good/50" />)}</div>
          <div className="mt-2 text-muted">foco → termina rápido</div>
        </div>
        <div>
          <div className="mb-2 font-semibold text-bad">WIP alto</div>
          <div className="flex justify-center gap-1">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-3.5 rounded-md bg-bad/50" />)}</div>
          <div className="mt-2 text-muted">troca de contexto → bugs e atraso</div>
        </div>
      </div>
    );
  }
  return null;
}
