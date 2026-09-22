import { motion } from 'framer-motion';
import { AlertTriangle, Flame, Heart, LogOut, Moon, PanelRight, Smile, Sun, TrendingUp, Volume2, VolumeX, Wallet, Gem } from 'lucide-react';
import { useState } from 'react';
import { useMetrics } from '../../hooks/useMetrics';
import { SCENARIO_MAP } from '../../scenarios';
import { useGame } from '../../store/gameStore';
import type { GameState } from '../../types';
import { cx, int, money } from '../../utils/format';
import { Button, IconButton, Modal } from '../ui';

export function TopBar({ g }: { g: GameState }) {
  const m = useMetrics(g);
  const { settings, updateSettings, rightPanel, setRightPanel, setScreen } = useGame();
  const [exitOpen, setExitOpen] = useState(false);
  const sc = SCENARIO_MAP[g.scenarioId];
  const progress = g.day / g.totalDays;
  const kpis = [
    { key: 'rev', icon: <TrendingUp size={13} />, label: 'Receita', value: money(g.revenueTotal, true), tip: `Receita acumulada. Custos: ${money(g.costsTotal)}. Lucro: ${money(m.profit)}.`, tone: undefined },
    { key: 'cash', icon: <Wallet size={13} />, label: 'Caixa', value: money(g.cash, true), tip: 'Dinheiro disponível para contratações, treinamentos e melhorias.', tone: g.cash < 0 ? 'bad' : g.cash < 30000 ? 'warn' : undefined },
    { key: 'val', icon: <Gem size={13} />, label: 'Valor entregue', value: `${int(g.valuePoints)} pts`, tip: 'Pontos de valor entregues (complexidade + receita gerada).', tone: undefined },
    { key: 'cli', icon: <Smile size={13} />, label: 'Cliente', value: `${Math.round(g.clientSatisfaction)}%`, tip: 'Satisfação do cliente: sobe com entregas no prazo, cai com SLA violado, bugs e incidentes.', tone: g.clientSatisfaction < 45 ? 'bad' : g.clientSatisfaction < 65 ? 'warn' : 'good' },
    { key: 'team', icon: <Heart size={13} />, label: 'Equipe', value: `${Math.round(m.morale)}%`, tip: 'Moral média da equipe.', tone: m.morale < 45 ? 'bad' : m.morale < 62 ? 'warn' : 'good' },
    { key: 'debt', icon: <AlertTriangle size={13} />, label: 'Dívida técnica', value: `${Math.round(g.techDebt)}%`, tip: 'Reduz produtividade em Dev/Review e aumenta bugs.', tone: g.techDebt > 55 ? 'bad' : g.techDebt > 35 ? 'warn' : undefined },
    { key: 'inc', icon: <Flame size={13} />, label: 'Incidentes', value: String(m.incidents), tip: 'Incidentes abertos em produção.', tone: m.incidents > 0 ? 'bad' : undefined },
  ] as const;

  return (
    <header className="glass-strong relative z-30 flex items-center gap-3 border-x-0 border-t-0 px-3 py-2 sm:px-4" data-tour="topbar">
      <div className="flex shrink-0 items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" stroke="var(--border-strong)" strokeWidth="3" />
            <motion.circle cx="20" cy="20" r="17" fill="none" stroke="url(#dayg)" strokeWidth="3" strokeLinecap="round" strokeDasharray={2 * Math.PI * 17} animate={{ strokeDashoffset: 2 * Math.PI * 17 * (1 - progress) }} />
            <defs><linearGradient id="dayg"><stop offset="0" stopColor="#7c83ff" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
          </svg>
          <span className="num text-[11px] font-bold">{g.day}</span>
        </div>
        <div className="hidden leading-tight sm:block">
          <div className="font-display text-[15px] font-bold tracking-wide"><span className="text-gradient">FLOW OPS</span></div>
          <div className="num text-[11px] text-muted">Dia <span className="text-fg">{g.day}</span> / {g.totalDays} · {sc?.name}</div>
        </div>
      </div>

      <div className="mx-2 hidden h-8 w-px bg-line md:block" />

      <div className="scroll-thin flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {kpis.map((k) => (
            <div key={k.key} title={k.tip} className="flex min-w-[92px] cursor-help flex-col rounded-xl px-2.5 py-1 hover:bg-surface-2">
              <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{k.icon}{k.label}</span>
              <motion.span key={String(k.value)} initial={{ opacity: 0.4, y: -3 }} animate={{ opacity: 1, y: 0 }} className={cx('num whitespace-nowrap text-[15px] font-semibold', k.tone === 'bad' ? 'text-bad' : k.tone === 'warn' ? 'text-warn' : k.tone === 'good' ? 'text-good' : 'text-fg')}>
                {k.value}
              </motion.span>
            </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton title={settings.sound ? 'Desligar sons' : 'Ligar sons'} onClick={() => updateSettings({ sound: !settings.sound })}>{settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}</IconButton>
        <IconButton title="Alternar tema" onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>{settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</IconButton>
        <IconButton title="Painel lateral" active={rightPanel} onClick={() => setRightPanel(!rightPanel)} className="hidden sm:inline-flex"><PanelRight size={16} /></IconButton>
        <IconButton title="Salvar e sair" onClick={() => setExitOpen(true)}><LogOut size={16} /></IconButton>
      </div>

      <Modal open={exitOpen} onClose={() => setExitOpen(false)} width={420}>
        <div className="p-6">
          <h3 className="font-display text-xl font-bold">Voltar ao menu?</h3>
          <p className="mt-2 text-sm text-muted">A partida é salva automaticamente. Você pode continuar depois pelo botão “Continuar”.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setExitOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => { setExitOpen(false); setScreen('menu'); }}>Salvar e sair</Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
