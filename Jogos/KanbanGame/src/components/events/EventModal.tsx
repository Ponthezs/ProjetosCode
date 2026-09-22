import { motion } from 'framer-motion';
import { AlertOctagon, ArrowRight, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { ROLES } from '../../data/professionals';
import { useGame } from '../../store/gameStore';
import type { EventChoiceDef, PendingEvent } from '../../types';
import { cx } from '../../utils/format';
import { Avatar, Badge, Button, Modal } from '../ui';

const SEV = {
  critical: { color: '#f87171', label: 'CRÍTICO', bg: 'from-red-500/25' },
  warning: { color: '#fbbf24', label: 'ALERTA', bg: 'from-amber-500/20' },
  info: { color: '#60a5fa', label: 'EVENTO', bg: 'from-sky-500/15' },
  positive: { color: '#34d399', label: 'BOA NOTÍCIA', bg: 'from-emerald-500/20' },
} as const;

const TONE: Record<NonNullable<EventChoiceDef['tone']>, string> = {
  safe: '#34d399',
  neutral: '#60a5fa',
  risky: '#fbbf24',
  aggressive: '#f87171',
};

/** Mostra os eventos pendentes um a um. Eventos informativos viram notificações. */
export function EventQueue() {
  const { game: g, animating, dispatch, toast } = useGame();
  const pending = g?.pendingEvents ?? [];

  // eventos leves (info/positivos, já aplicados) viram toast
  useEffect(() => {
    if (!g || animating) return;
    const light = pending.filter((e) => e.autoApplied && (e.severity === 'info' || e.severity === 'positive'));
    light.forEach((e, i) => {
      setTimeout(() => toast({ tone: e.severity === 'positive' ? 'good' : 'info', title: `${e.icon} ${e.title}`, body: [e.description, ...(e.outcome ?? [])].join(' ') }), i * 500);
      dispatch({ type: 'resolveEvent', instanceId: e.instanceId });
    });
  }, [pending, animating, g, dispatch, toast]);

  const ev = !animating ? pending.find((e) => !(e.autoApplied && (e.severity === 'info' || e.severity === 'positive'))) : undefined;
  if (!g || !ev) return null;
  return <EventCard ev={ev} key={ev.instanceId} count={pending.length} />;
}

function EventCard({ ev, count }: { ev: PendingEvent; count: number }) {
  const { game: g, dispatch } = useGame();
  if (!g) return null;
  const sev = SEV[ev.severity];
  const person = ev.context.personId ? g.people[ev.context.personId] : undefined;
  const card = ev.context.cardId ? g.cards[ev.context.cardId] : undefined;
  const client = ev.context.clientId ? g.clients[ev.context.clientId] : undefined;
  const resolve = (choiceId?: string) => dispatch({ type: 'resolveEvent', instanceId: ev.instanceId, choiceId });

  return (
    <Modal open closable={false} width={640} tone={ev.severity === 'critical' ? 'critical' : undefined}>
      <div className={cx('relative overflow-hidden rounded-t-3xl bg-gradient-to-b to-transparent p-6 pb-4', sev.bg)}>
        {ev.severity === 'critical' && <motion.div className="pointer-events-none absolute inset-0" animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ background: 'radial-gradient(circle at 20% 0%, rgba(248,113,113,0.5), transparent 60%)' }} />}
        <div className="relative flex items-center gap-2">
          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-[0.2em]" style={{ color: sev.color, background: `color-mix(in oklab, ${sev.color} 18%, transparent)` }}>{sev.label}</span>
          <span className="num text-[11px] text-muted">DIA {ev.day}</span>
          {count > 1 && <span className="num ml-auto text-[11px] text-muted">{count} eventos</span>}
        </div>
        <div className="relative mt-4 flex items-start gap-4">
          <motion.span initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-2 text-3xl">
            {ev.icon}
          </motion.span>
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight">{ev.title}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fg/85">“{ev.description}”</p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {person && <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-0.5 pr-2.5 text-xs"><Avatar name={person.name} hue={person.hue} size={20} />{person.name} · {ROLES[person.role].short}</span>}
          {card && <Badge>{card.code} · {card.title.slice(0, 32)}</Badge>}
          {client && <Badge color={client.vip ? '#fbbf24' : undefined}>{client.name}</Badge>}
        </div>
      </div>

      <div className="p-6 pt-2">
        {ev.autoApplied || !ev.choices?.length ? (
          <>
            {ev.outcome && ev.outcome.length > 0 && (
              <ul className="mb-4 space-y-1">
                {ev.outcome.map((o, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted"><ArrowRight size={13} />{o}</li>)}
              </ul>
            )}
            <div className="flex justify-end"><Button variant="primary" onClick={() => resolve()}>Entendido</Button></div>
          </>
        ) : (
          <>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Qual é a sua decisão?</div>
            <div className="grid gap-2.5">
              {ev.choices.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => resolve(c.id)}
                  className="focus-ring group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong hover:bg-surface-2"
                >
                  <span className="absolute inset-y-0 left-0 w-1" style={{ background: TONE[c.tone ?? 'neutral'] }} />
                  <div className="flex items-center gap-2">
                    <span className="num flex h-6 w-6 items-center justify-center rounded-md bg-surface-3 text-[11px] font-bold">{String.fromCharCode(65 + i)}</span>
                    <span className="font-semibold uppercase tracking-wide">{c.label}</span>
                    <ArrowRight size={15} className="ml-auto text-muted transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1.5 pl-8 text-sm text-muted">{c.description}</p>
                  {(c.cost || c.risk || c.benefit) && (
                    <div className="mt-2 flex flex-wrap gap-2 pl-8 text-[11.5px]">
                      {c.cost && <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-300"><TrendingDown size={12} />Custo: {c.cost}</span>}
                      {c.risk && <span className="flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-red-300"><AlertOctagon size={12} />Risco: {c.risk}</span>}
                      {c.benefit && <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-300"><TrendingUp size={12} />Benefício: {c.benefit}</span>}
                      {!c.risk && c.tone === 'safe' && <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-300"><ShieldCheck size={12} />Seguro</span>}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
