import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, Plus, Check } from 'lucide-react';
import { fetchRecommendations } from '../services/api';
import { Recommendation } from '../types';

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRecommendations()
      .then(res => {
        setRecommendations(res);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleAdd = (id: string) => {
    setAddedIds(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Buscando recomendações personalizadas com IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" /> Recomendações da IA Curadora
          </h2>
          <p className="text-xs text-slate-400">
            Sugestões inéditas calculadas via Embeddings com base nos seus artistas e gêneros favoritos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(rec => {
          const isAdded = addedIds[rec.id];
          return (
            <div key={rec.id} className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {rec.match_score}% Match
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{rec.genre}</span>
                </div>

                <div className="flex gap-3 mb-3">
                  <img
                    src={rec.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80'}
                    alt={rec.title}
                    className="w-14 h-14 rounded-xl object-cover shadow"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{rec.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{rec.artist}</p>
                    <p className="text-[10px] text-slate-500">{rec.album}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic bg-obsidian-900/80 p-2.5 rounded-xl border border-slate-800 mb-4">
                  "{rec.reason}"
                </p>
              </div>

              <button
                onClick={() => handleAdd(rec.id)}
                disabled={isAdded}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isAdded
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Adicionada às Descobertas</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar à Minha Biblioteca</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
