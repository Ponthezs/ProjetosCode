import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal, Panel, Segmented, Switch } from '../components/ui';
import { GameRepository } from '../services/storage';
import { play } from '../services/sound';
import { useGame } from '../store/gameStore';

export function SettingsPage() {
  const { settings, updateSettings, setScreen, abandonGame } = useGame();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-8">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => setScreen('menu')}>Menu</Button>
        <div className="font-display text-lg font-bold"><span className="text-gradient">FLOW OPS</span> <span className="text-muted">/ Configurações</span></div>
      </header>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] space-y-4 p-4 sm:p-8">
          <Panel title="Aparência">
            <Row label="Tema"><Segmented value={settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} /></Row>
            <Row label="Velocidade das animações"><Segmented value={settings.animationSpeed} onChange={(v) => updateSettings({ animationSpeed: v })} options={[{ value: 'slow', label: 'Lenta' }, { value: 'normal', label: 'Normal' }, { value: 'fast', label: 'Rápida' }]} /></Row>
            <Row label="Reduzir efeitos visuais"><Switch checked={settings.reducedEffects} onChange={(v) => updateSettings({ reducedEffects: v })} /></Row>
          </Panel>
          <Panel title="Áudio">
            <Row label="Efeitos sonoros"><Switch checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} /></Row>
            <Row label="Volume">
              <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} onMouseUp={() => play('done')} className="w-40 accent-[var(--accent)]" />
            </Row>
          </Panel>
          <Panel title="Dados">
            <Row label="Apagar progresso local (ranking, conquistas e partida salva)">
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setConfirm(true)}>Apagar</Button>
            </Row>
            <p className="mt-2 text-xs text-faint">Os dados são salvos no navegador (LocalStorage). A camada de persistência está preparada para Supabase, PostgreSQL ou Firebase.</p>
          </Panel>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} width={420}>
        <div className="p-6">
          <h3 className="font-display text-xl font-bold">Apagar todos os dados?</h3>
          <p className="mt-2 text-sm text-muted">Essa ação não pode ser desfeita.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button variant="danger" onClick={async () => {
              await GameRepository.clearGame();
              await GameRepository.saveProfile({ achievements: [], completedScenarios: {}, gamesPlayed: 0, tutorialDone: false });
              try { localStorage.removeItem('flowops:ranking'); } catch { /* */ }
              abandonGame();
              useGame.setState({ ranking: [], profile: { achievements: [], completedScenarios: {}, gamesPlayed: 0, tutorialDone: false } });
              setConfirm(false);
            }}>Apagar tudo</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-line/60 py-3 last:border-0"><span className="text-sm">{label}</span>{children}</div>;
}
