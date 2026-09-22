import { useState } from 'react';
import { FileBarChart, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { projects, clients } from '../data/mock';
import { GlassCard } from '../components/GlassCard';

export default function Reports() {
  const { vehicles } = useApp();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '');
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const project = projects.find(p => p.vehicleId === vehicleId);
  const client = clients.find(c => c.id === vehicle?.clienteId);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><FileBarChart className="text-electric-2" /> Relatório do Remap</h1>
          <p className="text-base-400 text-sm mt-1">Gere um relatório profissional do projeto de calibração.</p>
        </div>
        <div className="flex gap-2">
          <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="bg-base-800/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo}</option>)}
          </select>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-4 py-2 rounded-xl shadow-glow-blue">
            <Printer size={15} /> Exportar PDF
          </button>
        </div>
      </div>

      {vehicle && project && (
        <GlassCard className="max-w-3xl mx-auto" title={`Relatório — ${project.nome}`}>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <Row label="Cliente" value={client?.nome ?? '—'} />
            <Row label="Veículo" value={`${vehicle.marca} ${vehicle.modelo} ${vehicle.versao}`} />
            <Row label="Motor" value={`${vehicle.motor} (${vehicle.codigoMotor})`} />
            <Row label="ECU" value={`${vehicle.ecu.fabricante} ${vehicle.ecu.modelo}`} />
            <Row label="Stage" value={project.stage} />
            <Row label="Data" value={project.dataInicio} />
            <Row label="Responsável" value={project.responsavel} />
            <Row label="Status" value={project.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/8">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="text-xs text-base-400 mb-2">Potência</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base-400 line-through text-sm">{vehicle.potenciaOriginal} cv</span>
                <span className="font-display text-xl font-bold text-perf-green">{project.potenciaEstimada} cv</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <div className="text-xs text-base-400 mb-2">Torque</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base-400 line-through text-sm">{vehicle.torqueOriginal} Nm</span>
                <span className="font-display text-xl font-bold text-perf-green">{project.torqueEstimado} Nm</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/8 text-xs text-base-400">
            Este relatório foi gerado automaticamente pela plataforma RemapTech e reflete valores estimados de calibração.
            Arquivo original preservado e versionado conforme política de backup do sistema.
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-base-400">{label}</div>
      <div className="text-base-100 font-medium">{value}</div>
    </div>
  );
}
