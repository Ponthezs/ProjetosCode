import { useState } from 'react';
import { Library, BookMarked } from 'lucide-react';
import { mapLibrary, calibrationMaps } from '../data/mock';
import { GlassCard } from '../components/GlassCard';

export default function MapLibrary() {
  const [saved, setSaved] = useState<string[]>(['Torque Limiter', 'Boost Target']);

  function toggleSave(name: string) {
    setSaved(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Library className="text-electric-2" /> Map Library</h1>
        <p className="text-base-400 text-sm mt-1">Biblioteca de mapas de referência, organizada por marca, motor e ECU.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {mapLibrary.map((entry, i) => (
          <GlassCard key={i} title={`${entry.marca} · ${entry.motor}`} icon={<BookMarked size={15} className="text-electric-2" />}>
            <div className="text-xs text-base-400 font-mono-tech mb-3">{entry.ecu}</div>
            <div className="flex flex-wrap gap-2">
              {entry.categorias.map(cat => {
                const isSaved = saved.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleSave(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isSaved ? 'border-perf-green/60 text-perf-green bg-perf-green/10' : 'border-white/10 text-base-300 hover:bg-white/5'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard title="Mapas salvos como referência">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {calibrationMaps.filter(m => saved.includes(m.nome)).map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{m.nome}</div>
                <div className="text-xs text-base-400">{m.categoria} · {m.x.values.length}x{m.y.values.length}</div>
              </div>
              <span className="text-[10px] text-perf-green font-mono-tech">SALVO</span>
            </div>
          ))}
          {saved.length === 0 && <p className="text-base-400 text-sm">Nenhum mapa salvo ainda. Clique em uma categoria acima.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
