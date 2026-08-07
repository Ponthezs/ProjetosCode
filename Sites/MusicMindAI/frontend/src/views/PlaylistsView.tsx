import React, { useEffect, useState } from 'react';
import { ListMusic, Image as ImageIcon, Sparkles, Music, ChevronRight, Layers, Check } from 'lucide-react';
import { fetchPlaylists, generateCover } from '../services/api';
import { Playlist } from '../types';

export const PlaylistsView: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await fetchPlaylists();
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCover = async (playlistId: string) => {
    setGeneratingCoverId(playlistId);
    try {
      const res = await generateCover(playlistId, 'neon');
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, cover_url: res.cover_url } : p));
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(prev => prev ? { ...prev, cover_url: res.cover_url } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCoverId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-slate-400 gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Carregando playlists da sua biblioteca...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-emerald-400" /> Suas Playlists Organizadas
          </h2>
          <p className="text-xs text-slate-400">
            Total de {playlists.length} playlists gerenciadas por Inteligência Artificial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylist(pl)}
              className={`glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer transition-all ${
                selectedPlaylist?.id === pl.id ? 'border-emerald-500 bg-obsidian-800' : 'border-slate-800'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 relative group shadow-md">
                  <img
                    src={pl.cover_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                    alt={pl.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateCover(pl.id);
                    }}
                    disabled={generatingCoverId === pl.id}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-semibold text-emerald-400 gap-1"
                    title="Gerar Nova Capa Neon"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{generatingCoverId === pl.id ? 'Gerando...' : 'Capa IA'}</span>
                  </button>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm truncate">{pl.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{pl.description || 'Curadoria automática MusicMind AI.'}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-slate-500 font-medium">{pl.song_count} faixas</span>
                    {pl.is_organized ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                        Organizada
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                        Aguardando IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Playlist Track Details Panel */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 h-fit sticky top-20">
          {selectedPlaylist ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <img
                  src={selectedPlaylist.cover_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                  alt={selectedPlaylist.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg"
                />
                <div>
                  <h3 className="font-bold font-display text-white text-base">{selectedPlaylist.title}</h3>
                  <p className="text-xs text-slate-400">{selectedPlaylist.song_count} faixas selecionadas</p>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {selectedPlaylist.tracks.map((t, idx) => (
                  <div key={t.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-obsidian-800/80 hover:bg-slate-800 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500 w-4 text-center font-mono">{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="text-slate-200 font-medium truncate">{t.title}</div>
                        <div className="text-slate-400 text-[11px] truncate">{t.artist}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {t.genre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Selecione uma playlist para visualizar as músicas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
