import { FileBarChart, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { logSamples } from '../data/mock';
import { GlassCard } from '../components/GlassCard';

const tooltipStyle = { background: 'rgba(10,13,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 };

export default function Logs() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><FileBarChart className="text-electric-2" /> Logs</h1>
          <p className="text-base-400 text-sm mt-1">Parâmetros do veículo em tempo real ou importados de arquivo.</p>
        </div>
        <button className="flex items-center gap-2 border border-white/15 text-sm px-4 py-2 rounded-xl hover:bg-white/5">
          <Upload size={15} /> Importar log
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <GlassCard title="RPM / Throttle">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={logSamples}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="t" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="rpm" stroke="#2f8fff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="throttle" stroke="#00ffa3" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="AFR / Lambda">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={logSamples}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="t" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="afr" stroke="#ffb020" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lambda" stroke="#ff3b5c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Boost / Ignition">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={logSamples}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="t" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="boost" stroke="#00d4ff" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ignition" stroke="#2f8fff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Torque / Temperatura / Pressão de combustível">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={logSamples}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="t" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="torque" stroke="#00ffa3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="coolant" stroke="#ff3b5c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fuelPressure" stroke="#ffb020" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
