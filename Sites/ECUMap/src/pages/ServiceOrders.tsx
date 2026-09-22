import { ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { clients } from '../data/mock';
import clsx from 'clsx';

const statusColor: Record<string, string> = {
  'Aberta': 'text-electric-2 border-electric-2/50',
  'Em andamento': 'text-amber border-amber/50',
  'Aguardando peça': 'text-alert-red border-alert-red/50',
  'Concluída': 'text-perf-green border-perf-green/50',
  'Cancelada': 'text-base-400 border-base-500',
};

export default function ServiceOrders() {
  const { vehicles, serviceOrders } = useApp();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><ClipboardList className="text-electric-2" /> Ordens de Serviço</h1>
        <p className="text-base-400 text-sm mt-1">{serviceOrders.length} ordens registradas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceOrders.map(os => {
          const v = vehicles.find(v => v.id === os.vehicleId);
          const c = clients.find(c => c.id === os.clienteId);
          return (
            <div key={os.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-tech text-sm text-electric-2">{os.numero}</span>
                <span className={clsx('stage-badge', statusColor[os.status])}>{os.status.toUpperCase()}</span>
              </div>
              <div className="text-sm font-medium">{c?.nome}</div>
              <div className="text-xs text-base-400 mb-3">{v ? `${v.marca} ${v.modelo} · ${v.placa}` : '—'}</div>
              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3">
                <span className="text-base-200">{os.servico}</span>
                <span className="font-display font-bold">R$ {os.valor.toLocaleString('pt-BR')}</span>
              </div>
              <div className="text-[11px] text-base-400 mt-2 font-mono-tech">{os.data}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
