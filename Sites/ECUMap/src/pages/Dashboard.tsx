import { Car, FolderKanban, Clock3, CheckCircle2, HardDrive, Wrench } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { GlassCard } from '../components/GlassCard';
import { SimulationBanner } from '../components/SimulationBanner';
import { StatusBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { projects, ecuFiles, historyEntries } from '../data/mock';
import { useNavigate } from 'react-router-dom';

const remapsPerMonth = [
  { mes: 'Fev', qtd: 5 }, { mes: 'Mar', qtd: 7 }, { mes: 'Abr', qtd: 6 },
  { mes: 'Mai', qtd: 9 }, { mes: 'Jun', qtd: 11 }, { mes: 'Jul', qtd: 8 },
];

const brandData = [
  { name: 'Volkswagen', qtd: 3 }, { name: 'Fiat', qtd: 1 }, { name: 'Chevrolet', qtd: 1 }, { name: 'BMW', qtd: 1 },
];

const fuelData = [
  { name: 'Flex', value: 3 }, { name: 'Gasolina', value: 2 }, { name: 'Diesel', value: 1 },
];
const FUEL_COLORS = ['#2f8fff', '#00ffa3', '#ffb020'];

const stageData = [
  { name: 'Stage 1', value: 2 }, { name: 'Stage 2', value: 2 }, { name: 'Stage 3', value: 1 }, { name: 'Stock', value: 1 },
];
const STAGE_COLORS = ['#00d4ff', '#ffb020', '#ff3b5c', '#5a6577'];

const tooltipStyle = {
  background: 'rgba(10,13,18,0.95)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, fontSize: 12, color: '#e6e9ee',
};

export default function Dashboard() {
  const { vehicles } = useApp();
  const navigate = useNavigate();
  const emAndamento = projects.filter(p => !['Finalizado', 'Pronto'].includes(p.status)).length;
  const finalizados = projects.filter(p => p.status === 'Finalizado').length;

  return (
    <div className="animate-fade-up space-y-6">
      <SimulationBanner />
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-base-400 text-sm mt-1">Visão geral da operação de calibração e remap.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Veículos" value={vehicles.length} icon={Car} accent="blue" />
        <StatCard label="Remaps realizados" value={projects.length} icon={FolderKanban} accent="green" />
        <StatCard label="Em desenvolvimento" value={emAndamento} icon={Clock3} accent="amber" />
        <StatCard label="Concluídos" value={finalizados} icon={CheckCircle2} accent="green" />
        <StatCard label="Arquivos ECU" value={ecuFiles.length} icon={HardDrive} accent="blue" />
        <StatCard label="OS abertas" value={2} icon={Wrench} accent="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard title="Remaps por mês" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={remapsPerMonth}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2f8fff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2f8fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mes" stroke="#5a6577" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#5a6577" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="qtd" stroke="#2f8fff" fill="url(#gradBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Stage mais utilizado">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={stageData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {stageData.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8892a0' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <GlassCard title="Marcas mais atendidas">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={brandData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#5a6577" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#8892a0" fontSize={12} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="qtd" fill="#00d4ff" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Tipos de combustível">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={fuelData} dataKey="value" nameKey="name" outerRadius={70}>
                {fuelData.map((_, i) => <Cell key={i} fill={FUEL_COLORS[i % FUEL_COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8892a0' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Atividades recentes">
          <ul className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {historyEntries.slice(0, 5).map(h => (
              <li key={h.id} className="text-xs flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0">
                <span className="text-base-200"><b className="text-electric-2">{h.usuario}</b> alterou <b>{h.mapa}</b></span>
                <span className="text-base-400 font-mono-tech">{h.valorAnterior} → {h.valorNovo} · {h.data} {h.hora}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard title="Últimos veículos trabalhados">
          <ul className="divide-y divide-white/5">
            {vehicles.slice(0, 5).map(v => (
              <li
                key={v.id}
                onClick={() => navigate(`/app/garage/${v.id}`)}
                className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{v.marca} {v.modelo} {v.versao}</div>
                  <div className="text-xs text-base-400">{v.motor} · {v.ano}</div>
                </div>
                <StatusBadge status={projects.find(p => p.vehicleId === v.id)?.status ?? 'Novo'} />
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="Últimos mapas modificados">
          <ul className="divide-y divide-white/5">
            {ecuFiles.filter(f => f.tipo === 'modificado').slice(0, 5).map(f => (
              <li key={f.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-mono-tech">{f.nome}</div>
                  <div className="text-xs text-base-400">v{f.versao} · {f.tamanhoKb} KB · {f.data}</div>
                </div>
                <span className={f.status === 'VALID' ? 'text-perf-green text-xs font-mono-tech' : 'text-alert-red text-xs font-mono-tech'}>{f.status}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
