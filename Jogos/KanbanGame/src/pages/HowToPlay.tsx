import { ArrowLeft, Play } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { CARD_TYPES, SERVICE_CLASSES, STAGES } from '../data/board';
import { LESSONS } from '../data/lessons';
import { useGame } from '../store/gameStore';
import type { ServiceClass } from '../types';

const LOOP = [
  { n: '1', t: 'Planeje', d: 'Puxe demandas do Backlog para Ready, ajuste limites de WIP, aloque pessoas nos estágios e defina o foco do dia.' },
  { n: '2', t: 'Execute', d: 'Clique em ▶ Iniciar dia. Cada pessoa gera pontos de trabalho conforme habilidade, energia, moral e sorte.' },
  { n: '3', t: 'Reaja', d: 'Eventos, bloqueios, bugs e incidentes exigem decisões. Cada escolha tem custo e consequência.' },
  { n: '4', t: 'Aprenda', d: 'Use o Flow AI, o heatmap de gargalos e os gráficos para entender o fluxo e melhorar a cada dia.' },
];

export function HowToPlay() {
  const { setScreen } = useGame();
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-8">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => setScreen('menu')}>Menu</Button>
        <div className="font-display text-lg font-bold"><span className="text-gradient">FLOW OPS</span> <span className="text-muted">/ Como jogar</span></div>
        <Button className="ml-auto" variant="primary" size="sm" icon={<Play size={14} />} onClick={() => setScreen('newgame', 'campaign')}>Jogar</Button>
      </header>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px] space-y-8 p-4 sm:p-8">
          <section>
            <h2 className="font-display text-3xl font-bold">Fluxo &gt; utilização individual</h2>
            <p className="mt-2 max-w-3xl text-muted">Você gerencia uma equipe de software. O objetivo não é manter todos ocupados, e sim fazer o trabalho atravessar o quadro rapidamente, com qualidade, gerando receita e mantendo clientes e equipe satisfeitos.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LOOP.map((l) => (
                <div key={l.n} className="glass rounded-2xl p-4">
                  <div className="num text-3xl font-bold text-accent">{l.n}</div>
                  <div className="mt-1 font-semibold">{l.t}</div>
                  <p className="mt-1 text-sm text-muted">{l.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Estágios</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {STAGES.map((s) => (
                <div key={s.id} className="glass flex items-start gap-3 rounded-xl p-3">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <div><div className="text-sm font-semibold">{s.name}</div><div className="text-xs text-muted">{s.description}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Tipos de card</h3>
              <div className="space-y-1.5">
                {Object.values(CARD_TYPES).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 text-sm"><Badge color={t.color}>{t.emoji} {t.label}</Badge><span className="text-muted">{t.description}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Classes de serviço</h3>
              <div className="space-y-2">
                {(Object.keys(SERVICE_CLASSES) as ServiceClass[]).map((c) => (
                  <div key={c} className="glass rounded-xl p-3">
                    <div className="text-sm font-semibold" style={{ color: SERVICE_CLASSES[c].color }}>{SERVICE_CLASSES[c].icon} {SERVICE_CLASSES[c].label}</div>
                    <div className="text-xs text-muted">{SERVICE_CLASSES[c].description}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Conceitos</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.values(LESSONS).map((l) => (
                <div key={l.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 font-semibold"><span className="text-xl">{l.icon}</span>{l.concept}</div>
                  <p className="mt-1.5 text-sm text-muted">{l.body}</p>
                  <p className="mt-2 text-sm text-good">→ {l.takeaway}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-2xl p-5 text-sm text-muted">
            <b className="text-fg">Dicas rápidas:</b> arraste cards entre colunas (só avançam quando o estágio termina) · arraste pessoas para as colunas para alocá-las · clique num card para ver detalhes, dependências e escalar bloqueios · WIP excedido deixa a coluna vermelha · o jogo salva automaticamente.
          </section>
        </div>
      </div>
    </div>
  );
}
