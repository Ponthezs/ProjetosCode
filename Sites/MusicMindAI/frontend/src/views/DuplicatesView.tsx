import React, { useEffect, useState } from 'react';
import { CopyX, CheckCircle2, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { fetchDuplicates, resolveDuplicates } from '../services/api';
import { DuplicateGroup } from '../types';

export const DuplicatesView: React.FC = () => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      const data = await fetchDuplicates();
      setDuplicates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeepTrack = async (group: DuplicateGroup, keepTrackId: string) => {
    setResolvingId(group.id);
    const removeIds = [group.primary_track.id, ...group.duplicates.map(d => d.id)].filter(id => id !== keepTrackId);
    
    try {
      await resolveDuplicates(group.id, keepTrackId, removeIds);
      setDuplicates(prev => prev.filter(g => g.id !== group.id));
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Buscando músicas duplicadas na sua biblioteca...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <CopyX className="w-5 h-5 text-emerald-400" /> Detector de Músicas Duplicadas
          </h2>
          <p className="text-xs text-slate-400">
            Compare lado a lado as versões idênticas ou remasterizadas e escolha qual manter.
          </p>
        </div>
      </div>

      {duplicates.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Nenhuma música duplicada encontrada!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sua biblioteca está limpa e sem faixas repetidas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicates.map(group => (
            <div key={group.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{group.reason}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {(group.similarity_score * 100).toFixed(0)}% Similaridade
                </span>
              </div>

              {/* Side by side candidates comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Candidate 1 (Primary) */}
                <div className="bg-obsidian-800 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={group.primary_track.cover_url || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80'}
                      alt={group.primary_track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{group.primary_track.title}</h4>
                      <p className="text-[11px] text-slate-400">{group.primary_track.artist}</p>
                      <div className="text-[10px] text-slate-500">Álbum: {group.primary_track.album || 'Single'} • {group.primary_track.duration_seconds}s</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleKeepTrack(group, group.primary_track.id)}
                    disabled={resolvingId === group.id}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-glow-emerald"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Manter Esta Versão</span>
                  </button>
                </div>

                {/* Candidate 2 (Duplicates) */}
                {group.duplicates.map(dupTrack => (
                  <div key={dupTrack.id} className="bg-obsidian-800 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={dupTrack.cover_url || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80'}
                        alt={dupTrack.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{dupTrack.title}</h4>
                        <p className="text-[11px] text-slate-400">{dupTrack.artist}</p>
                        <div className="text-[10px] text-slate-500">Álbum: {dupTrack.album || 'Single'} • {dupTrack.duration_seconds}s</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleKeepTrack(group, dupTrack.id)}
                      disabled={resolvingId === group.id}
                      className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-black text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Manter Esta Versão</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
