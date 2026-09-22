import { Settings as SettingsIcon, Shield, HardDriveDownload, FlaskConical } from 'lucide-react';
import { appUsers } from '../data/mock';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

const rolePermissions: Record<string, string[]> = {
  'Administrador': ['Acesso total', 'Gerenciar usuários', 'Excluir arquivos', 'Configurações do sistema'],
  'Calibrador': ['Map Editor', 'File Compare', 'Versionamento', 'Relatórios'],
  'Técnico': ['Cadastro de veículos', 'Upload de arquivos', 'Ordens de serviço'],
  'Atendimento': ['Clientes', 'Ordens de serviço', 'Consulta de status'],
};

export default function SettingsPage() {
  const { currentUser, setCurrentUser, simulationMode, setSimulationMode } = useApp();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><SettingsIcon className="text-electric-2" /> Configurações</h1>
        <p className="text-base-400 text-sm mt-1">Usuários, permissões, backup e simulação.</p>
      </div>

      <GlassCard title="Usuário atual">
        <div className="flex flex-wrap gap-3">
          {appUsers.map(u => (
            <button
              key={u.id}
              onClick={() => setCurrentUser(u)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${currentUser.id === u.id ? 'border-electric-2/60 bg-electric-2/10 text-electric-2' : 'border-white/10 hover:bg-white/5'}`}
            >
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-base-950" style={{ background: u.avatarColor }}>
                {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
              {u.nome} · {u.role}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Usuários e perfis de acesso" icon={<Shield size={15} className="text-electric-2" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(rolePermissions).map(([role, perms]) => (
            <div key={role} className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="text-sm font-semibold mb-2">{role}</div>
              <ul className="space-y-1">
                {perms.map(p => <li key={p} className="text-xs text-base-300 flex items-center gap-1.5">· {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard title="Backup e segurança" icon={<HardDriveDownload size={15} className="text-electric-2" />}>
          <ul className="space-y-2 text-sm text-base-300">
            <li>✓ Arquivos originais nunca são sobrescritos</li>
            <li>✓ Toda alteração gera uma nova versão</li>
            <li>✓ Checksum validado antes e depois da gravação</li>
            <li>✓ Rollback disponível para qualquer versão anterior</li>
            <li>✓ Controle de acesso por perfil de usuário</li>
          </ul>
        </GlassCard>
        <GlassCard title="Simulation Mode" icon={<FlaskConical size={15} className="text-amber" />}>
          <p className="text-sm text-base-300 mb-4">
            No modo de simulação, é possível testar alterações de calibração sem modificar arquivos reais — ideal para treinamento.
          </p>
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${simulationMode ? 'bg-amber/15 text-amber border border-amber/50' : 'bg-white/5 text-base-300 border border-white/10'}`}
          >
            {simulationMode ? 'Desativar Simulation Mode' : 'Ativar Simulation Mode'}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
