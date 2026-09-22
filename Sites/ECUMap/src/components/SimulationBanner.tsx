import { FlaskConical } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SimulationBanner() {
  const { simulationMode } = useApp();
  if (!simulationMode) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber/40 bg-amber/10 px-4 py-2.5 text-amber text-xs font-mono-tech mb-5 animate-fade-up">
      <FlaskConical size={14} />
      SIMULATION MODE — nenhum arquivo real será modificado. Todas as alterações aqui são apenas para fins de teste e treinamento.
    </div>
  );
}
