import { ArrowLeft, ArrowRight, Bug, Building2, Clock, Link2, Lock, Pause, Phone, Play, Shield } from 'lucide-react';
import { dependenciesMet, isStageComplete, slaRemaining } from '../../analytics/metrics';
import { CARD_TYPES, PRIORITY_META, SERVICE_CLASSES, STAGE_MAP, STAGE_ORDER, TECH_LABEL, WORK_STAGES, isWorkStage, nextStage } from '../../data/board';
import { SEGMENT_META } from '../../data/clients';
import { canMoveCard, escalateCost } from '../../game-engine/actions';
import { stageCapacity } from '../../game-engine/capacity';
import { useGame } from '../../store/gameStore';
import type { ServiceClass } from '../../types';
import { cx, dec, money } from '../../utils/format';
import { Avatar, Badge, Button, Modal, Progress } from '../ui';

export function CardDetail() {
  const { game: g, selectedCardId, selectCard, dispatch, tryMove } = useGame();
  const card = g && selectedCardId ? g.cards[selectedCardId] : null;
  if (!g || !card) return <Modal open={false}>{null}</Modal>;
  const type = CARD_TYPES[card.type];
  const client = g.clients[card.clientId];
  const sla = slaRemaining(g, card);
  const next = nextStage(card.stage);
  const nextChk = next ? canMoveCard(g, card.id, next) : { ok: false };
  const stage = card.stage;
  const cap = isWorkStage(stage) ? stageCapacity(g, stage) : 0;
  const rem = isWorkStage(stage) ? Math.max(0, card.work[stage].total - card.work[stage].done) : 0;
  const deps = card.dependsOn.map((d) => g.cards[d]).filter(Boolean);
  const dependents = Object.values(g.cards).filter((c) => c.dependsOn.includes(card.id));
  const age = card.doneDay ? card.doneDay - (card.readyDay ?? card.createdDay) + 1 : card.readyDay ? g.day - card.readyDay : null;

  return (
    <Modal open onClose={() => selectCard(null)} width={680}>
      <div className="relative overflow-hidden rounded-t-3xl p-6 pb-4" style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${type.color} 22%, transparent), transparent 70%)` }}>
        <div className="flex flex-wrap items-center gap-2 pr-10">
          <span className="num text-sm font-semibold text-muted">{card.code}</span>
          <Badge color={type.color}>{type.emoji} {type.label}</Badge>
          <Badge color={SERVICE_CLASSES[card.serviceClass].color}>{SERVICE_CLASSES[card.serviceClass].icon} {SERVICE_CLASSES[card.serviceClass].label}</Badge>
          <Badge color={PRIORITY_META[card.priority].color}>Prioridade {PRIORITY_META[card.priority].label}</Badge>
          <Badge>{STAGE_MAP[stage].name}</Badge>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight">{card.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1.5"><Building2 size={14} />{client?.name} · {client ? SEGMENT_META[client.segment].label : ''}{client?.vip && <Badge color="#fbbf24">VIP</Badge>}</span>
          <span>{TECH_LABEL[card.tech]}</span>
          <span className="flex gap-1">{card.tags.map((t) => <Badge key={t}>{t}</Badge>)}</span>
        </div>
      </div>

      <div className="space-y-5 p-6 pt-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Valor" value={card.serviceClass === 'intangible' ? 'Intangível' : money(card.value)} />
          <Stat label="Complexidade" value={`${card.complexity} pts`} />
          <Stat label="Risco" value={`${Math.round(card.risk * 100)}%`} tone={card.risk > 0.5 ? 'warn' : undefined} />
          <Stat label={card.serviceClass === 'fixed' ? 'Data fixa' : 'SLA'} value={sla === null ? (card.stage === 'backlog' ? `${card.slaDays}d (não iniciado)` : '—') : `${sla}d restantes`} tone={sla !== null && sla < 0 ? 'bad' : sla !== null && sla <= 2 ? 'warn' : undefined} />
          <Stat label="Lead time" value={age === null ? '—' : `${age}d`} />
          <Stat label="Dias bloqueado" value={String(card.blockedDaysTotal)} tone={card.blockedDaysTotal > 2 ? 'warn' : undefined} />
          <Stat label="Bugs encontrados" value={String(card.bugsFound)} />
          <Stat label="Retrabalhos" value={String(card.reworkCount)} />
        </div>

        {card.blocked && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-3">
            <Lock size={18} className="text-red-300" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-red-200">🔒 BLOQUEADO — {card.blocked.reason}</div>
              <div className="text-xs text-red-200/70">Bloqueado desde o dia {card.blocked.since} · faltam {card.blocked.daysLeft} dia(s)</div>
            </div>
            <Button size="sm" variant="danger" icon={<Phone size={13} />} disabled={g.cash < escalateCost} onClick={() => dispatch({ type: 'escalateBlock', cardId: card.id })}>Escalar ({money(escalateCost)})</Button>
          </div>
        )}
        {stage === 'dev' && !dependenciesMet(g, card) && (
          <div className="flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3 text-sm text-sky-200"><Link2 size={16} />Desenvolvimento só pode ser concluído depois que as dependências chegarem à Homologação.</div>
        )}

        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Esforço por estágio</h4>
          <div className="space-y-1.5">
            {WORK_STAGES.map((st) => {
              const w = card.work[st];
              return (
                <div key={st} className={cx('grid grid-cols-[110px_1fr_70px] items-center gap-3 text-xs', st === stage && 'font-semibold')}>
                  <span className={st === stage ? 'text-fg' : 'text-muted'}>{STAGE_MAP[st].name}</span>
                  <Progress value={w.done / w.total} color={STAGE_MAP[st].color} height={6} />
                  <span className="num text-right text-muted">{dec(w.done)} / {dec(w.total)}</span>
                </div>
              );
            })}
          </div>
          {isWorkStage(stage) && !isStageComplete(card) && (
            <p className="mt-2 text-xs text-muted">
              Restam <b className="text-fg">{dec(rem)} pts</b> em {STAGE_MAP[stage].name}. Capacidade prevista do setor: <b className="text-fg">{dec(cap)} pts/dia</b>
              {cap > 0 ? <> → estimativa de <b className="text-fg">{Math.max(1, Math.ceil(rem / cap))} dia(s)</b> (se não houver disputa com outros cards).</> : <span className="text-bad"> — ninguém alocado!</span>}
            </p>
          )}
        </div>

        {(deps.length > 0 || dependents.length > 0) && (
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Dependências</h4>
            <div className="flex flex-wrap gap-2">
              {deps.map((d) => (
                <button key={d.id} onClick={() => selectCard(d.id)} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs hover:bg-surface-2">
                  <Link2 size={12} className="text-sky-300" />Bloqueado por <b>{d.code}</b> <span className="text-muted">({STAGE_MAP[d.stage].name})</span>
                </button>
              ))}
              {dependents.map((d) => (
                <button key={d.id} onClick={() => selectCard(d.id)} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs hover:bg-surface-2">
                  <Link2 size={12} className="text-amber-300" />Bloqueia <b>{d.code}</b>
                </button>
              ))}
            </div>
          </div>
        )}

        {card.contributors.length > 0 && (
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Responsáveis</h4>
            <div className="flex flex-wrap gap-2">
              {card.contributors.map((pid) => {
                const p = g.people[pid];
                return p ? <span key={pid} className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-0.5 pr-2.5 text-xs"><Avatar name={p.name} hue={p.hue} size={20} />{p.name}</span> : null;
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Histórico</h4>
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            {card.history.map((h, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ArrowRight size={10} className="text-faint" />}
                <span className="rounded-md border border-line bg-surface px-1.5 py-0.5"><span className="num text-faint">D{h.day}</span> {STAGE_MAP[h.stage].short}</span>
              </span>
            ))}
          </div>
        </div>

        {stage !== 'done' && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <select
              value={card.serviceClass}
              onChange={(e) => dispatch({ type: 'setServiceClass', cardId: card.id, serviceClass: e.target.value as ServiceClass })}
              className="focus-ring h-9 rounded-xl border border-line bg-solid px-2 text-sm"
              title="Classe de serviço"
            >
              {(Object.keys(SERVICE_CLASSES) as ServiceClass[]).map((c) => <option key={c} value={c}>{SERVICE_CLASSES[c].icon} {SERVICE_CLASSES[c].label}</option>)}
            </select>
            <Button size="md" icon={card.paused ? <Play size={14} /> : <Pause size={14} />} onClick={() => dispatch({ type: 'togglePause', cardId: card.id })}>{card.paused ? 'Retomar' : 'Pausar'}</Button>
            {(stage === 'ready' || stage === 'analysis') && <Button size="md" variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => tryMove(card.id, 'backlog')}>Voltar ao backlog</Button>}
            {next && next !== 'done' && (
              <Button size="md" variant="primary" className="ml-auto" disabled={!nextChk.ok} icon={<ArrowRight size={14} />} onClick={() => { const r = tryMove(card.id, next); if (r.ok) selectCard(null); }}>
                Mover para {STAGE_MAP[next].name}
              </Button>
            )}
          </div>
        )}
        {stage === 'done' && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm">
            <Shield size={16} className="text-good" />Entregue no dia {card.doneDay} · receita gerada <b>{money(card.deliveredValue ?? 0)}</b>
            {card.hiddenDefects > 0 && <span className="ml-auto flex items-center gap-1 text-rose-300"><Bug size={14} />defeito oculto</span>}
          </div>
        )}
        <p className="flex items-center gap-1.5 text-[11px] text-faint"><Clock size={11} />Criado no dia {card.createdDay}{card.readyDay ? ` · comprometido no dia ${card.readyDay}` : ''}{card.startedDay ? ` · iniciado no dia ${card.startedDay}` : ''} · fluxo: {STAGE_ORDER.indexOf(stage)}/{STAGE_ORDER.length - 1}</p>
      </div>
    </Modal>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'bad' }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={cx('num truncate text-sm font-semibold', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : 'text-fg')}>{value}</div>
    </div>
  );
}
