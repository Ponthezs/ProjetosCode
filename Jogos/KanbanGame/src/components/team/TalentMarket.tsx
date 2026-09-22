import { UserPlus } from 'lucide-react';
import { PERSONALITY_TRAITS, ROLES, SENIORITY_META, SKILL_LABEL } from '../../data/professionals';
import { hireCost } from '../../game-engine/actions';
import { useGame } from '../../store/gameStore';
import type { SkillKey } from '../../types';
import { money } from '../../utils/format';
import { Avatar, Badge, Button, Modal, Stars } from '../ui';

export function TalentMarket() {
  const { game: g, talentOpen, setTalentOpen, dispatch, toast } = useGame();
  if (!g) return null;
  return (
    <Modal open={talentOpen} onClose={() => setTalentOpen(false)} width={900}>
      <div className="p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">RH</div>
        <h2 className="font-display text-2xl font-bold">Mercado de talentos</h2>
        <p className="mt-1 text-sm text-muted">Novos profissionais levam alguns dias de onboarding até a produtividade total. O mercado é renovado a cada 5 dias. Caixa: <b className="text-fg">{money(g.cash)}</b></p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {g.talentMarket.map((p) => {
            const role = ROLES[p.role];
            const cost = hireCost(p);
            const skills = (Object.keys(p.skills) as SkillKey[]).filter((k) => p.skills[k] > 0).sort((a, b) => p.skills[b] - p.skills[a]).slice(0, 4);
            return (
              <div key={p.id} className="glass flex flex-col rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} hue={p.hue} size={40} ring={role.color} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs" style={{ color: role.color }}>{SENIORITY_META[p.seniority].label} · {role.short}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {skills.map((k) => <div key={k} className="flex items-center justify-between text-xs"><span className="text-muted">{SKILL_LABEL[k]}</span><Stars value={p.skills[k]} /></div>)}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  {[['Veloc.', p.speed], ['Qualid.', p.quality], ['Exp.', p.experience]].map(([l, v]) => (
                    <div key={l as string} className="rounded-lg bg-surface-3/60 py-1"><div className="uppercase tracking-widest text-muted">{l}</div><div className="num text-sm font-semibold">{v}</div></div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">{p.traits.map((t) => <Badge key={t} color="#a78bfa">{PERSONALITY_TRAITS[t]?.label}</Badge>)}</div>
                <div className="mt-auto pt-3">
                  <div className="mb-2 flex justify-between text-xs"><span className="text-muted">Salário</span><span className="num font-semibold">{money(p.salary)}/mês</span></div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<UserPlus size={13} />}
                    disabled={g.cash < cost}
                    onClick={() => { dispatch({ type: 'hire', candidateId: p.id }); toast({ tone: 'good', title: 'Contratação realizada', body: `${p.name} entrou no time em ${role.short}.`, icon: '🤝' }); }}
                  >
                    Contratar · {money(cost)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
