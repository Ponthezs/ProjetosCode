import { useNavigate } from 'react-router-dom';
import { Plus, Gauge, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StageBadge } from '../components/StatusBadge';
import { SimulationBanner } from '../components/SimulationBanner';

export default function Garage() {
  const { vehicles } = useApp();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-up space-y-6">
      <SimulationBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Minha Garagem</h1>
          <p className="text-base-400 text-sm mt-1">{vehicles.length} veículos cadastrados</p>
        </div>
        <button
          onClick={() => navigate('/app/vehicles/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-electric to-electric-2 text-base-950 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-glow-blue hover:brightness-110 transition-all"
        >
          <Plus size={16} /> Novo Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map(v => (
          <div
            key={v.id}
            onClick={() => navigate(`/app/garage/${v.id}`)}
            className="glass glass-hover rounded-2xl overflow-hidden cursor-pointer group"
          >
            <div className="h-40 relative overflow-hidden">
              <img src={v.foto} alt={v.modelo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-transparent to-transparent" />
              <div className="absolute top-3 right-3"><StageBadge stage={v.stageAtual} /></div>
              <div className="absolute bottom-3 left-4">
                <div className="font-display font-bold text-base-100 text-lg leading-tight">{v.marca} {v.modelo}</div>
                <div className="text-xs text-base-300">{v.versao}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-base-400 mb-3 font-mono-tech">
                <span>{v.motor}</span>
                <span>{v.ano}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-electric-2" />
                  <div>
                    <div className="text-sm font-semibold">{v.potenciaOriginal} cv</div>
                    <div className="text-[10px] text-base-400">Potência</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge size={15} className="text-perf-green" />
                  <div>
                    <div className="text-sm font-semibold">{v.torqueOriginal} Nm</div>
                    <div className="text-[10px] text-base-400">Torque</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
