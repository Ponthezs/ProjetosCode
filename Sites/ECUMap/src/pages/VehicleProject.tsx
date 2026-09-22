import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Cpu, Calendar, User, FileStack, History as HistoryIcon, SlidersHorizontal, GitCompareArrows } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { projects, ecuFiles, historyEntries } from '../data/mock';
import { StageBadge, StatusBadge } from '../components/StatusBadge';
import { GlassCard } from '../components/GlassCard';

export default function VehicleProject() {
  const { id } = useParams();
  const { vehicles } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'files' | 'history'>('overview');

  const vehicle = vehicles.find(v => v.id === id);
  const project = projects.find(p => p.vehicleId === id);
  const files = ecuFiles.filter(f => f.vehicleId === id);
  const history = historyEntries.filter(h => h.vehicleId === id);

  if (!vehicle) {
    return (
      <div className="text-center py-20 text-base-400">
        Veículo não encontrado. <Link to="/app/garage" className="text-electric-2 underline">Voltar à garagem</Link>
      </div>
    );
  }

  const gainPower = project ? project.potenciaEstimada - vehicle.potenciaOriginal : 0;
  const gainTorque = project ? project.torqueEstimado - vehicle.torqueOriginal : 0;

  return (
    <div className="animate-fade-up space-y-6">
      <button onClick={() => navigate('/app/garage')} className="flex items-center gap-1.5 text-sm text-base-400 hover:text-base-100 transition-colors">
        <ArrowLeft size={15} /> Voltar
      </button>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="h-52 relative">
          <img src={vehicle.foto} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1"><StageBadge stage={vehicle.stageAtual} />{project && <StatusBadge status={project.status} />}</div>
              <h1 className="font-display font-bold text-2xl md:text-3xl">{vehicle.marca} {vehicle.modelo} {vehicle.versao}</h1>
              <p className="text-base-300 text-sm font-mono-tech">{vehicle.motor} · {vehicle.codigoMotor} · {vehicle.ano}</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => navigate('/app/map-editor')} className="flex items-center gap-1.5 bg-gradient-to-r from-electric to-electric-2 text-base-950 text-xs font-semibold px-3 py-2 rounded-xl shadow-glow-blue">
                <SlidersHorizontal size={14} /> Map Editor
              </button>
              <button onClick={() => navigate('/app/file-compare')} className="flex items-center gap-1.5 border border-white/15 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-white/5">
                <GitCompareArrows size={14} /> File Compare
              </button>
            </div>
          </div>
        </div>
      </div>

      {project && (
        <GlassCard title={project.nome}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Metric label="Potência original" value={`${vehicle.potenciaOriginal} cv`} />
            <Metric label="Potência estimada" value={`${project.potenciaEstimada} cv`} accent="green" delta={`+${gainPower} cv`} />
            <Metric label="Torque original" value={`${vehicle.torqueOriginal} Nm`} />
            <Metric label="Torque estimado" value={`${project.torqueEstimado} Nm`} accent="green" delta={`+${gainTorque} Nm`} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/5 text-sm">
            <Info icon={Cpu} label="ECU" value={`${vehicle.ecu.fabricante} ${vehicle.ecu.modelo}`} />
            <Info icon={Calendar} label="Data do projeto" value={project.dataInicio} />
            <Info icon={User} label="Responsável" value={project.responsavel} />
            <Info icon={FileStack} label="Combustível" value={vehicle.combustivel} />
          </div>
        </GlassCard>
      )}

      <div className="flex gap-1 border-b border-white/8">
        {([
          { key: 'overview', label: 'Visão geral', icon: Cpu },
          { key: 'files', label: 'Arquivos ECU', icon: FileStack },
          { key: 'history', label: 'Histórico', icon: HistoryIcon },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${tab === t.key ? 'border-electric-2 text-electric-2' : 'border-transparent text-base-400 hover:text-base-100'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <GlassCard title="Dados do veículo">
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Dt label="Placa" value={vehicle.placa} /><Dt label="Chassi" value={vehicle.chassi} />
              <Dt label="Transmissão" value={vehicle.transmissao} /><Dt label="Tração" value={vehicle.tracao} />
              <Dt label="Quilometragem" value={`${vehicle.km.toLocaleString('pt-BR')} km`} /><Dt label="Combustível" value={vehicle.combustivel} />
            </dl>
          </GlassCard>
          <GlassCard title="Informações da ECU">
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Dt label="Hardware" value={vehicle.ecu.hardware} /><Dt label="Software" value={vehicle.ecu.software} />
              <Dt label="Versão" value={vehicle.ecu.versao} /><Dt label="Nº de peça" value={vehicle.ecu.numeroPeca} />
              <Dt label="Protocolo" value={vehicle.ecu.protocolo} /><Dt label="Método de leitura" value={vehicle.ecu.metodoLeitura} />
            </dl>
          </GlassCard>
        </div>
      )}

      {tab === 'files' && (
        <GlassCard title="Arquivos ECU do projeto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-base-400 border-b border-white/8">
                <th className="pb-2 font-medium">Nome</th><th className="font-medium">Versão</th><th className="font-medium">Tamanho</th>
                <th className="font-medium">Data</th><th className="font-medium">Checksum</th><th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="py-2.5 font-mono-tech">{f.nome}</td><td>v{f.versao}</td><td>{f.tamanhoKb} KB</td>
                  <td>{f.data}</td><td className="font-mono-tech text-base-400">{f.checksum}</td>
                  <td className={f.status === 'VALID' ? 'text-perf-green' : f.status === 'CORRECTED' ? 'text-amber' : 'text-alert-red'}>{f.status}</td>
                </tr>
              ))}
              {files.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-base-400">Nenhum arquivo para este veículo ainda.</td></tr>}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === 'history' && (
        <GlassCard title="Histórico de alterações">
          <ul className="space-y-3">
            {history.map(h => (
              <li key={h.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{h.mapa}</div>
                  <div className="text-xs text-base-400">{h.usuario} · {h.arquivo} · {h.data} {h.hora}</div>
                </div>
                <div className="font-mono-tech text-xs"><span className="text-base-400">{h.valorAnterior}</span> → <span className="text-perf-green">{h.valorNovo}</span></div>
              </li>
            ))}
            {history.length === 0 && <p className="text-center py-6 text-base-400">Sem histórico registrado.</p>}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

function Metric({ label, value, accent, delta }: { label: string; value: string; accent?: 'green'; delta?: string }) {
  return (
    <div>
      <div className="text-xs text-base-400">{label}</div>
      <div className={`font-display text-xl font-bold ${accent === 'green' ? 'text-perf-green' : 'text-base-100'}`}>{value}</div>
      {delta && <div className="text-[11px] text-perf-green font-mono-tech">{delta}</div>}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-electric-2 shrink-0" />
      <div>
        <div className="text-[11px] text-base-400">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

function Dt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-base-400">{label}</dt>
      <dd className="text-base-100">{value}</dd>
    </div>
  );
}
