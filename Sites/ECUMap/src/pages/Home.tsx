import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Cpu, Activity, Gauge, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SimulationBanner } from '../components/SimulationBanner';

export default function Home() {
  const navigate = useNavigate();
  const { vehicles } = useApp();

  return (
    <div className="animate-fade-up">
      <SimulationBanner />

      <div className="relative rounded-3xl overflow-hidden glass p-10 md:p-16 mb-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-electric/15 blur-[110px]" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-perf-green/10 blur-[110px]" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative">
          <span className="stage-badge text-electric-2 border-electric-2/50 mb-4 inline-block">ECU CALIBRATION PLATFORM</span>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight text-glow-blue">
            REMAP<span className="text-electric-2">TECH</span>
          </h1>
          <p className="font-display text-xl md:text-2xl text-base-200 mt-4 tracking-wide">
            Analyze. Calibrate. Compare. Optimize.
          </p>
          <p className="text-base-400 max-w-xl mt-4 text-sm leading-relaxed">
            Plataforma profissional para gerenciamento, análise e desenvolvimento de projetos de remap automotivo —
            do cadastro do veículo ao relatório final de calibração.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => navigate('/app/vehicles/new')}
              className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-5 py-3 rounded-xl shadow-glow-blue hover:brightness-110 transition-all"
            >
              <Plus size={16} /> NEW PROJECT
            </button>
            <button
              onClick={() => navigate('/app/ecu-files')}
              className="flex items-center gap-2 border border-white/15 text-base-100 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <FolderOpen size={16} /> OPEN ECU FILE
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Cpu, label: 'Veículos ativos', value: vehicles.length, accent: 'text-electric-2' },
          { icon: SlidersHorizontal, label: 'Módulo', value: 'Map Editor', accent: 'text-perf-green', to: '/app/map-editor' },
          { icon: Activity, label: 'Módulo', value: 'Dyno', accent: 'text-amber', to: '/app/dyno' },
          { icon: Gauge, label: 'Módulo', value: 'Performance', accent: 'text-alert-red', to: '/app/performance' },
        ].map((c, i) => (
          <button
            key={i}
            onClick={() => c.to && navigate(c.to)}
            className="glass glass-hover rounded-2xl p-5 text-left"
          >
            <c.icon className={c.accent} size={20} />
            <div className="text-xs text-base-400 mt-3">{c.label}</div>
            <div className="font-display font-bold text-lg">{c.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
