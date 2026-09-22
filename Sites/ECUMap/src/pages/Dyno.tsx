import { useState } from 'react';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dynoRuns } from '../data/mock';
import { GlassCard } from '../components/GlassCard';
import { SimulationBanner } from '../components/SimulationBanner';

const tooltipStyle = { background: 'rgba(10,13,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 };

export default function Dyno() {
  const [active, setActive] = useState<string[]>(dynoRuns.map(r => r.label));

  function toggle(label: string) {
    setActive(a => a.includes(label) ? a.filter(x => x !== label) : [...a, label]);
  }

  const merged = dynoRuns[0].data.map((_, i) => {
    const row: Record<string, number> = { rpm: dynoRuns[0].data[i].rpm };
    dynoRuns.forEach(run => {
      row[`${run.label} (cv)`] = run.data[i].power;
      row[`${run.label} (Nm)`] = run.data[i].torque;
    });
    return row;
  });

  return (
    <div className="animate-fade-up space-y-6">
      <SimulationBanner />
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Activity className="text-electric-2" /> Dyno</h1>
        <p className="text-base-400 text-sm mt-1">Simulação de resultados de dinamômetro — compare Stock, Stage 1, Stage 2 e Custom.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {dynoRuns.map(r => (
          <button
            key={r.label}
            onClick={() => toggle(r.label)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors"
            style={{
              borderColor: active.includes(r.label) ? r.color : 'rgba(255,255,255,0.1)',
              color: active.includes(r.label) ? r.color : '#8892a0',
              background: active.includes(r.label) ? `${r.color}1a` : 'transparent',
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: r.color }} /> {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <GlassCard title="Potência (cv) x RPM">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="rpm" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {dynoRuns.filter(r => active.includes(r.label)).map(r => (
                <Line key={r.label} type="monotone" dataKey={`${r.label} (cv)`} stroke={r.color} strokeWidth={2.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Torque (Nm) x RPM">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="rpm" stroke="#5a6577" fontSize={11} />
              <YAxis stroke="#5a6577" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {dynoRuns.filter(r => active.includes(r.label)).map(r => (
                <Line key={r.label} type="monotone" dataKey={`${r.label} (Nm)`} stroke={r.color} strokeWidth={2.5} strokeDasharray="4 2" dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
