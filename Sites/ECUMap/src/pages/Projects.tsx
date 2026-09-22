import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projects } from '../data/mock';
import { StatusBadge, StageBadge } from '../components/StatusBadge';
import type { ProjectStatus } from '../types';

const columns: ProjectStatus[] = ['Novo', 'Arquivo recebido', 'Em análise', 'Mapeamento', 'Validação', 'Pronto', 'Finalizado'];

export default function Projects() {
  const { vehicles } = useApp();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Projetos de Remap</h1>
        <p className="text-base-400 text-sm mt-1">Acompanhe o pipeline de calibração de todos os veículos.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {columns.map(status => {
          const items = projects.filter(p => p.status === status);
          return (
            <div key={status} className="glass rounded-2xl p-3 w-64 shrink-0 flex flex-col gap-2 max-h-[70vh]">
              <div className="flex items-center justify-between px-1 mb-1">
                <StatusBadge status={status} />
                <span className="text-xs text-base-400">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {items.map(p => {
                  const v = vehicles.find(v => v.id === p.vehicleId);
                  return (
                    <div
                      key={p.id}
                      onClick={() => v && navigate(`/app/garage/${v.id}`)}
                      className="glass glass-hover rounded-xl p-3 cursor-pointer"
                    >
                      <div className="text-sm font-medium leading-tight mb-1">{p.nome}</div>
                      <div className="text-[11px] text-base-400 mb-2">{v?.marca} {v?.modelo} · {p.responsavel}</div>
                      <div className="flex items-center justify-between">
                        <StageBadge stage={p.stage} />
                        <span className="text-[10px] text-base-400 font-mono-tech">{p.dataInicio}</span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="text-[11px] text-base-500 text-center py-4">Vazio</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
