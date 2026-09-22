import { useState } from 'react';
import { Gauge, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { projects, dynoRuns } from '../data/mock';
import { GlassCard } from '../components/GlassCard';

const tooltipStyle = { background: 'rgba(10,13,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 };

export default function Performance() {
  const { vehicles } = useApp();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '');
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const project = projects.find(p => p.vehicleId === vehicleId);

  const chartData = dynoRuns[0].data.map((d, i) => ({
    rpm: d.rpm,
    'Original (cv)': Math.round((vehicle?.potenciaOriginal ?? 100) * (0.5 + i * 0.08)),
    'Estimado (cv)': Math.round((project?.potenciaEstimada ?? 120) * (0.5 + i * 0.08)),
    'Original (Nm)': Math.round((vehicle?.torqueOriginal ?? 150) * (0.6 + i * 0.06)),
    'Estimado (Nm)': Math.round((project?.torqueEstimado ?? 180) * (0.6 + i * 0.06)),
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Gauge className="text-electric-2" /> Performance</h1>
          <p className="text-base-400 text-sm mt-1">Comparativo de potência e torque original x estimado.</p>
        </div>
        <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="bg-base-800/70 border border-white/10 rounded-xl px-3 py-2 text-sm">
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} {v.versao}</option>)}
        </select>
      </div>

      {vehicle && project && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard><div className="text-xs text-base-400">Potência original</div><div className="font-display text-2xl font-bold">{vehicle.potenciaOriginal} cv</div></GlassCard>
          <GlassCard><div className="text-xs text-base-400">Potência estimada</div><div className="font-display text-2xl font-bold text-perf-green flex items-center gap-1"><Zap size={16} />{project.potenciaEstimada} cv</div></GlassCard>
          <GlassCard><div className="text-xs text-base-400">Torque original</div><div className="font-display text-2xl font-bold">{vehicle.torqueOriginal} Nm</div></GlassCard>
          <GlassCard><div className="text-xs text-base-400">Torque estimado</div><div className="font-display text-2xl font-bold text-perf-green">{project.torqueEstimado} Nm</div></GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard title="Potência x RPM">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="rpm" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Original (cv)" stroke="#5a6577" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Estimado (cv)" stroke="#00ffa3" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Torque x RPM">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="rpm" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Original (Nm)" stroke="#5a6577" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Estimado (Nm)" stroke="#2f8fff" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
