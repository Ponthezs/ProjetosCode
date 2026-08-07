import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Music, Image as ImageIcon, Edit3, ShieldAlert } from 'lucide-react';
import { fetchAIReorganizePreview, confirmAIReorganization, fetchPlaylists, suggestRename, renamePlaylist, generateCover } from '../services/api';
import { PreviewMoveOperation, Playlist, RenameSuggestion } from '../types';

export const AIOrganizerView: React.FC = () => {
  const [previews, setPreviews] = useState<PreviewMoveOperation[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Renaming & Cover States
  const [disorganizedPlaylists, setDisorganizedPlaylists] = useState<Playlist[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, RenameSuggestion>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);

  useEffect(() => {
    loadDisorganized();
  }, []);

  const loadDisorganized = async () => {
    try {
      const pls = await fetchPlaylists();
      const bad = pls.filter(p => !p.is_organized || ['playlist 1', 'legal', 'nova playlist', 'teste', 'músicas'].includes(p.title.toLowerCase().trim()));
      setDisorganizedPlaylists(bad);

      // Fetch AI renaming suggestions for bad playlists
      for (const p of bad) {
        const sug = await suggestRename(p.id);
        setSuggestions(prev => ({ ...prev, [p.id]: sug }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePreview = async () => {
    setLoadingPreview(true);
    setSuccessMessage(null);
    try {
      const res = await fetchAIReorganizePreview();
      setPreviews(res);
      setShowConfirmModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApplyReorganization = async () => {
    setConfirming(true);
    try {
      const res = await confirmAIReorganization();
      setSuccessMessage(res.message);
      setShowConfirmModal(false);
      loadDisorganized();
    } catch (e) {
      console.error(e);
    } finally {
      setConfirming(false);
    }
  };

  const handleAcceptRename = async (playlistId: string, suggestedTitle: string, suggestedDesc: string) => {
    setRenamingId(playlistId);
    try {
      await renamePlaylist(playlistId, suggestedTitle, suggestedDesc);
      await generateCover(playlistId, 'neon');
      loadDisorganized();
    } catch (e) {
      console.error(e);
    } finally {
      setRenamingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-obsidian-800 to-obsidian-800 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Curadoria Inteligente
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">
            Organizador Automático do YouTube Music
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            A IA irá analisar o ritmo, humor, bpm, décadas e temas de todas as suas músicas para criar playlists temáticas perfeitas (Academia, Viagem, Relaxar, Trabalho, etc.).
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePreview}
              disabled={loadingPreview}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs shadow-glow-emerald hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            >
              {loadingPreview ? (
                <span>Analisando músicas com IA...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Gerar Prévia de Reorganização</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Renaming & Cover Suggestions Section */}
      {disorganizedPlaylists.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" /> Sugestões da IA para Nomes e Capas Ruins
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              {disorganizedPlaylists.length} playlists precisam de atenção
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disorganizedPlaylists.map(pl => {
              const sug = suggestions[pl.id];
              return (
                <div key={pl.id} className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-mono">Nome Atual: <strong className="text-slate-300">{pl.title}</strong></span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">Nome Genérico</span>
                    </div>

                    {sug ? (
                      <div className="bg-obsidian-900/80 p-3 rounded-xl border border-slate-800 mb-3 space-y-1">
                        <div className="text-xs text-slate-400">Sugestão de Nome IA:</div>
                        <div className="text-sm font-bold text-emerald-400">{sug.suggested_name}</div>
                        <div className="text-[11px] text-slate-300 italic">{sug.suggested_description}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-2">Gerando sugestão de nome...</div>
                    )}
                  </div>

                  {sug && (
                    <button
                      onClick={() => handleAcceptRename(pl.id, sug.suggested_name, sug.suggested_description)}
                      disabled={renamingId === pl.id}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{renamingId === pl.id ? 'Renomeando...' : 'Aplicar Novo Nome & Capa Neon'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-panel rounded-3xl p-6 border border-emerald-500/40 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" /> Confirmar Reorganização por IA
                </h3>
                <p className="text-xs text-slate-400">
                  Verifique a prévia exata das mudanças antes de aplicar à sua conta.
                </p>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {previews.map((prev, idx) => (
                <div key={idx} className="bg-obsidian-800/90 rounded-2xl p-4 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Music className="w-4 h-4 text-emerald-400" /> {prev.playlist_title}
                    </h4>
                    <span className="text-xs text-emerald-400 font-medium">{prev.summary}</span>
                  </div>

                  {/* Added Tracks Badge Sample */}
                  <div className="space-y-1 mt-2">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Exemplos de Músicas a Adicionar:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {prev.added_tracks.slice(0, 5).map(tr => (
                        <span key={tr.id} className="text-[11px] px-2 py-0.5 rounded bg-slate-700/80 text-slate-200">
                          + {tr.title} ({tr.artist})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                🔒 Nenhuma música existente será excluída da biblioteca.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyReorganization}
                  disabled={confirming}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-glow-emerald transition-all flex items-center gap-1.5"
                >
                  {confirming ? (
                    <span>Aplicando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar e Reorganizar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
