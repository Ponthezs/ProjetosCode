import { motion } from 'framer-motion';
import { Award, GraduationCap, Palmtree, UserMinus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { STAGE_MAP, WORK_STAGES } from '../../data/board';
import { PERSONALITY_TRAITS, ROLES, SENIORITY_META, SKILL_LABEL } from '../../data/professionals';
import { canPromote, PROMOTE_MIN_EXP, severanceCost, trainingCost } from '../../game-engine/actions';
import { burnoutRisk, capacityBreakdown, moodEmoji } from '../../game-engine/capacity';
import { useGame } from '../../store/gameStore';
import type { GameState, Person, SkillKey, WorkStage } from '../../types';
import { cx, dec, money } from '../../utils/format';
import { Avatar, Badge, Button, Modal, Stars } from '../ui';

export function TeamView({ g }: { g: GameState }) {
  const { setTalentOpen } = useGame();
  const people = g.peopleOrder.map((id) => g.people[id]).filter(Boolean);
  const payroll = people.reduce((a, p) => a + p.salary, 0);
  return (
    <div className="scroll-thin h-full overflow-y-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Recursos humanos</div>
          <h2 className="font-display text-3xl font-bold">Equipe</h2>
        </div>
        <div className="flex gap-2">
          <Badge>{people.length} pessoas</Badge>
          <Badge>Folha {money(payroll)}/mês</Badge>
        </div>
        <Button className="ml-auto" variant="primary" icon={<UserPlus size={15} />} onClick={() => setTalentOpen(true)}>Mercado de talentos</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {people.map((p, i) => <PersonCard key={p.id} p={p} g={g} index={i} />)}
      </div>
    </div>
  );
}

function PersonCard({ p, g, index }: { p: Person; g: GameState; index: number }) {
  const { dispatch } = useGame();
  const [trainOpen, setTrainOpen] = useState(false);
  const [fireOpen, setFireOpen] = useState(false);
  const role = ROLES[p.role];
  const absent = p.absentDays > 0;
  const stage = p.stage;
  const cb = stage ? capacityBreakdown(g, p, stage) : null;
  const risk = burnoutRisk(p);
  const skills = (Object.keys(p.skills) as SkillKey[]).filter((k) => p.skills[k] > 0).sort((a, b) => p.skills[b] - p.skills[a]);
  const tCost = trainingCost(p);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl" style={{ background: `${role.color}22` }} />
      <div className="relative flex items-start gap-3">
        <Avatar name={p.name} hue={p.hue} size={46} ring={role.color} absent={absent} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{p.name}</span>
            <span className="text-lg leading-none">{moodEmoji(p)}</span>
          </div>
          <div className="text-xs" style={{ color: role.color }}>{role.name}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge>{SENIORITY_META[p.seniority].label}</Badge>
            {p.traits.map((t) => <Badge key={t} color="#a78bfa"><span title={PERSONALITY_TRAITS[t]?.description}>{PERSONALITY_TRAITS[t]?.label ?? t}</span></Badge>)}
            {absent && <Badge color="#fbbf24">{p.absentReason} · {p.absentDays}d</Badge>}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-sm font-semibold">{money(p.salary)}</div>
          <div className="text-[10px] text-muted">/mês</div>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {skills.slice(0, 6).map((k) => (
          <div key={k} className="flex items-center justify-between text-xs">
            <span className="text-muted">{SKILL_LABEL[k]}</span>
            <Stars value={p.skills[k]} />
          </div>
        ))}
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
        <Attr label="Velocidade" v={p.speed} />
        <Attr label="Qualidade" v={p.quality} />
        <Attr label="Experiência" v={p.experience} />
      </div>
      <div className="relative mt-2 space-y-1.5">
        <Bar label="Energia" v={p.energy} color={p.energy < 35 ? 'var(--bad)' : p.energy < 60 ? 'var(--warn)' : 'var(--good)'} />
        <Bar label="Moral" v={p.morale} color="var(--accent)" />
        <Bar label="Estresse" v={p.stress} color={p.stress > 65 ? 'var(--bad)' : '#94a3b8'} />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted">Burnout Risk</span>
          <span className={cx('num font-semibold', risk >= 75 ? 'text-bad' : risk >= 55 ? 'text-warn' : 'text-good')}>{risk >= 55 ? '⬆ ' : ''}{risk}%</span>
        </div>
      </div>

      <div className="relative mt-3 rounded-xl border border-line bg-surface p-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">Alocação</span>
          <select value={stage ?? ''} onChange={(e) => dispatch({ type: 'assignPerson', personId: p.id, stage: (e.target.value || null) as WorkStage | null })} className="focus-ring h-7 flex-1 rounded-lg border border-line bg-solid px-2 text-xs">
            <option value="">Sem alocação</option>
            {WORK_STAGES.map((st) => <option key={st} value={st}>{STAGE_MAP[st].name}{role.specialtyStages.includes(st) ? ' ★' : ''}</option>)}
          </select>
        </div>
        {cb && (
          <div className="mt-2 text-[11px] text-muted">
            Capacidade prevista: <b className="num text-fg">{dec(cb.expected)} pts</b> · resultado real: <b className="num text-fg">{dec(cb.min)}–{dec(cb.max)}</b>
            <div className="mt-1 flex flex-wrap gap-1">
              <Factor l="Especialização" v={cb.specialization} />
              <Factor l="Energia" v={cb.energy} />
              <Factor l="Moral" v={cb.morale} />
              {cb.techDebt < 1 && <Factor l="Dívida" v={cb.techDebt} />}
              {cb.focus !== 1 && <Factor l="Foco/HE" v={cb.focus} />}
              {cb.modifiers !== 1 && <Factor l="Eventos" v={cb.modifiers} />}
              {cb.upgrades !== 1 && <Factor l="Melhorias" v={cb.upgrades} />}
              {cb.onboarding < 1 && <Factor l="Onboarding" v={cb.onboarding} />}
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap gap-1.5">
        <Button size="sm" icon={<GraduationCap size={13} />} disabled={absent || g.cash < tCost} onClick={() => setTrainOpen(true)}>Treinar</Button>
        <Button size="sm" icon={<Award size={13} />} disabled={!canPromote(p)} title={canPromote(p) ? 'Promover (+20% salário, +moral, +qualidade)' : `Requer experiência ${PROMOTE_MIN_EXP[p.seniority]}`} onClick={() => dispatch({ type: 'promote', personId: p.id })}>Promover</Button>
        <Button size="sm" icon={<Palmtree size={13} />} disabled={absent} onClick={() => dispatch({ type: 'vacation', personId: p.id, days: 2 })}>Folga 2d</Button>
        <Button size="sm" variant="ghost" className="ml-auto text-bad" icon={<UserMinus size={13} />} disabled={g.peopleOrder.length <= 1} onClick={() => setFireOpen(true)}>Demitir</Button>
      </div>

      <Modal open={trainOpen} onClose={() => setTrainOpen(false)} width={440}>
        <div className="p-6">
          <h3 className="font-display text-xl font-bold">Treinar {p.name.split(' ')[0]}</h3>
          <p className="mt-1 text-sm text-muted">Custo {money(tCost)} · 1 dia ausente · +1 nível na habilidade · +experiência.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(Object.keys(SKILL_LABEL) as SkillKey[]).map((k) => (
              <button key={k} disabled={p.skills[k] >= 5} onClick={() => { dispatch({ type: 'train', personId: p.id, skill: k }); setTrainOpen(false); }} className="focus-ring flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-sm hover:bg-surface-2 disabled:opacity-40">
                <span>{SKILL_LABEL[k]}</span>
                <Stars value={p.skills[k]} size={10} />
              </button>
            ))}
          </div>
        </div>
      </Modal>
      <Modal open={fireOpen} onClose={() => setFireOpen(false)} width={420}>
        <div className="p-6">
          <h3 className="font-display text-xl font-bold">Desligar {p.name}?</h3>
          <p className="mt-2 text-sm text-muted">Rescisão de <b className="text-fg">{money(severanceCost(p))}</b>. A moral de todo o time cai 5 pontos.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFireOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { dispatch({ type: 'fire', personId: p.id }); setFireOpen(false); }}>Desligar</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

function Attr({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-lg bg-surface-3/60 py-1">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className="num text-sm font-semibold">{Math.round(v)}</div>
    </div>
  );
}

function Bar({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div className="grid grid-cols-[62px_1fr_34px] items-center gap-2 text-[11px]">
      <span className="text-muted">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} /></div>
      <span className="num text-right text-muted">{Math.round(v)}%</span>
    </div>
  );
}

function Factor({ l, v }: { l: string; v: number }) {
  const pctv = Math.round((v - 1) * 100);
  return <span className={cx('num rounded px-1.5 py-[1px] text-[10px]', pctv > 0 ? 'bg-emerald-500/10 text-good' : pctv < 0 ? 'bg-red-500/10 text-bad' : 'bg-surface-3 text-muted')}>{l} {pctv > 0 ? '+' : ''}{pctv}%</span>;
}
