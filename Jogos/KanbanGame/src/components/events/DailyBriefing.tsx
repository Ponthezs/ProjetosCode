import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Lock, Workflow } from 'lucide-react';
import { STAGE_MAP, FOCUS_OPTIONS } from '../../data/board';
import { useMetrics } from '../../hooks/useMetrics';
import { useGame } from '../../store/gameStore';
import type { GameState } from '../../types';
import { cx, money } from '../../utils/format';
import { Button, Modal } from '../ui';

export function DailyBriefing({ g }: { g: GameState }) {
  const { briefingOpen, setBriefing, dispatch, animating } = useGame();
  const m = useMetrics(g);
  const blockingEvents = g.pendingEvents.some((e) => !(e.autoApplied && (e.severity === 'info' || e.severity === 'positive')));
  const open = briefingOpen && !animating && !blockingEvents && g.pendingLessons.length === 0 && !g.tutorial;
  const last = g.lastResult;
  const active = m.wip;
  const surge = g.modifiers.find((x) => x.id.startsWith('surge-') && !x.id.startsWith('surge-b'));

  return (
    <Modal open={open} onClose={() => setBriefing(false)} width={600}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent"><Workflow size={22} /></span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Daily stand-up</div>
            <h2 className="font-display text-2xl font-bold">DAILY — DIA {g.day}</h2>
          </div>
          <span className="num ml-auto rounded-lg border border-line bg-surface px-2 py-1 text-xs text-muted">{g.totalDays - g.day} dias restantes</span>
        </div>

        {surge && <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200">🛒 {surge.label} em andamento — demanda e receita em alta!</div>}

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Box icon={<CheckCircle2 size={15} />} label="Ontem" value={last ? `${last.deliveries.length} concluído(s)` : '—'} tone="good" />
          <Box icon={<Clock size={15} />} label="Hoje" value={`${active} ativos`} />
          <Box icon={<Lock size={15} />} label="Bloqueios" value={String(m.blocked)} tone={m.blocked ? 'warn' : undefined} />
          <Box icon={<AlertTriangle size={15} />} label="Riscos" value={m.slaRisk ? `${m.slaRisk} SLA próximo(s)` : 'Nenhum'} tone={m.slaRisk ? 'bad' : undefined} />
        </div>

        {last && (
          <div className="mt-4 space-y-1 text-sm text-muted">
            {last.headline.length > 0 && <p>📋 Resumo de ontem: {last.headline.join(' · ')}.</p>}
            <p>💰 Receita do dia: <b className="text-fg">{money(last.revenue)}</b> · custos: <b className="text-fg">{money(last.costs)}</b></p>
            {m.bottleneck && <p>🍾 Gargalo atual: <b className="text-bad">{STAGE_MAP[m.bottleneck].name}</b></p>}
            {m.incidents > 0 && <p>🚨 <b className="text-bad">{m.incidents} incidente(s)</b> aberto(s) em produção.</p>}
          </div>
        )}

        <div className="mt-6 text-sm font-semibold">Qual será a prioridade do time hoje?</div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FOCUS_OPTIONS.map((f, i) => (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => { dispatch({ type: 'setFocus', focus: f.id }); setBriefing(false); }}
              className={cx('focus-ring rounded-xl border p-3 text-left transition-colors hover:bg-surface-2', g.settings.focus === f.id ? 'border-accent/50 bg-accent/10' : 'border-line bg-surface', i === 0 && 'sm:col-span-2')}
            >
              <div className="text-sm font-semibold">{f.icon} {f.label}</div>
              <div className="mt-0.5 text-xs text-muted">{f.description}</div>
            </motion.button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => setBriefing(false)}>Planejar o dia →</Button>
        </div>
      </div>
    </Modal>
  );
}

function Box({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className={cx('flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]', tone === 'good' ? 'text-good' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-muted')}>{icon}{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
