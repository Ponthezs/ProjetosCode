import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Gamepad2, Play, X, Star, Calendar, ExternalLink, GitMerge, ChevronRight } from 'lucide-react';
import { MOVIES_DATA, GAMES_DATA, MOVIE_TIMELINE_ERAS } from '../data/mediaArchiveData';
import { soundEngine } from '../services/audioService';

type MainCategory = 'movies' | 'games' | 'chronology';

export const MoviesAndGamesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('movies');
  const [movieEraFilter, setMovieEraFilter] = useState<string>('all');
  const [gameEraFilter, setGameEraFilter] = useState<string>('all');
  const [selectedTrailer, setSelectedTrailer] = useState<{ title: string; videoId: string; url: string } | null>(null);

  // Filtered Movies
  const filteredMovies = MOVIES_DATA.filter((movie) => {
    if (movieEraFilter === 'all') return true;
    return movie.era === movieEraFilter;
  });

  // Filtered Games
  const filteredGames = GAMES_DATA.filter((game) => {
    if (gameEraFilter === 'all') return true;
    return game.era === gameEraFilter;
  });

  const handleOpenTrailer = (title: string, videoId?: string, url?: string) => {
    soundEngine.playClick();
    if (videoId) {
      setSelectedTrailer({ title, videoId, url: url || `https://www.youtube.com/watch?v=${videoId}` });
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <section id="media-section" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(229,9,20,0.3)]"
        >
          <Film className="w-4 h-4" />
          <span>ARQUIVO MULTIMÍDIA • FILMES & JOGOS</span>
        </motion.div>

        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white text-glow-red font-title">
          FILMES, JOGOS & MULTIVERSO
        </h2>

        <p className="text-sm sm:text-base text-gray-300 max-w-3xl mx-auto font-sans leading-relaxed">
          Explore a trajetória completa do Homem-Aranha nos cinemas e videogames desde 1977 até 2027.
          Assista aos trailers oficiais, descubra inovações de gameplay e veja a trilha cronológica das eras.
        </p>
      </div>

      {/* Main Switcher Tabs (Filmes, Jogos, Trilha Cronológica) */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-10 overflow-x-auto py-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveCategory('movies');
          }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            activeCategory === 'movies'
              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_25px_rgba(229,9,20,0.8)] scale-105'
              : 'bg-black/60 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>🎬 FILMES (1977 - 2027)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveCategory('games');
          }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            activeCategory === 'games'
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.8)] scale-105'
              : 'bg-black/60 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>🎮 JOGOS (1982 - 2023+)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveCategory('chronology');
          }}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            activeCategory === 'chronology'
              ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_25px_rgba(255,215,0,0.8)] scale-105 font-black'
              : 'bg-black/60 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>🕸️ TRILHA CRONOLÓGICA DAS ERAS</span>
        </button>
      </div>

      {/* CATEGORY 1: MOVIES SHOWCASE */}
      {activeCategory === 'movies' && (
        <div className="space-y-8">
          {/* Era Filter Sub-Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2 py-2">
            {[
              { id: 'all', label: 'TODOS OS FILMES (11)' },
              { id: 'tobey', label: 'TOBEY MAGUIRE (2002-2007)' },
              { id: 'andrew', label: 'ANDREW GARFIELD (2012-2014)' },
              { id: 'tom', label: 'TOM HOLLAND / MCU (2017-2026)' },
              { id: 'spiderverse', label: 'ARANHAVERSO (2018-2027)' },
              { id: 'classic77', label: 'CLÁSSICO (1977)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundEngine.playClick();
                  setMovieEraFilter(f.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                  movieEraFilter === f.id
                    ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Movies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl glass-panel-glow border border-white/10 p-6 flex flex-col justify-between hover:border-red-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)]"
              >
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-red-600/30 text-red-400 font-mono text-[10px] font-bold border border-red-500/40">
                      {movie.posterBadge}
                    </span>
                    <span className="text-xs font-mono text-gray-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-red-400 inline mr-1" />
                      {movie.year}
                    </span>
                  </div>

                  {/* Title & Era */}
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white group-hover:text-red-400 transition-colors font-title">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase mt-1">
                      {movie.eraName}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {movie.summary}
                  </p>

                  {/* Villains Tag */}
                  {movie.villains.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">
                        VILÕES PRINCIPAIS:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {movie.villains.map((v, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-black/60 text-[10px] text-red-300 border border-red-500/30">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase block font-bold">
                      DESTAQUES & REVOLUÇÕES:
                    </span>
                    <ul className="space-y-1">
                      {movie.highlights.map((h, idx) => (
                        <li key={idx} className="text-[11px] text-gray-300 flex items-start space-x-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Trailer Button */}
                <div className="pt-6 mt-4 border-t border-white/10">
                  <button
                    onClick={() => handleOpenTrailer(movie.title, movie.youtubeTrailerId, movie.youtubeUrl)}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(229,9,20,0.6)]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>▶ ASSISTIR TRAILER NO YOUTUBE</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY 2: GAMES SHOWCASE */}
      {activeCategory === 'games' && (
        <div className="space-y-8">
          {/* Game Era Filters */}
          <div className="flex items-center justify-center flex-wrap gap-2 py-2">
            {[
              { id: 'all', label: 'TODOS OS JOGOS (11)' },
              { id: '80s', label: 'PRIMEIRO JOGO (1982 ATARI)' },
              { id: '90s', label: 'ERA 16-BITS (1990-1996)' },
              { id: 'neversoft', label: 'NEVERSOFT (2000-2001)' },
              { id: 'movie_era', label: 'JOGOS DE FILMES (2002-2007)' },
              { id: 'multiverse', label: 'MULTIVERSO & SHADOWS (2008-2011)' },
              { id: 'insomniac', label: 'INSOMNIAC GAMES (2018-2023+)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundEngine.playClick();
                  setGameEraFilter(f.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer border ${
                  gameEraFilter === f.id
                    ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Games Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl glass-panel-cyan border border-white/10 p-6 flex flex-col justify-between hover:border-cyan-400/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
              >
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-cyan-600/30 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/40">
                      {game.platform}
                    </span>
                    {game.isEssential && (
                      <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono text-[9px] font-bold border border-yellow-400/40 flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 inline mr-1" />
                        CLÁSSICO ESSENCIAL
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white group-hover:text-cyan-400 transition-colors font-title">
                      {game.title}
                    </h3>
                    <p className="text-[11px] font-mono text-gray-400 tracking-wider uppercase mt-1">
                      {game.eraName} {game.developer ? `• ${game.developer}` : ''}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {game.summary}
                  </p>

                  {/* Key Innovations */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">
                      INOVAÇÕES DE GAMEPLAY:
                    </span>
                    <ul className="space-y-1">
                      {game.keyInnovations.map((inn, idx) => (
                        <li key={idx} className="text-[11px] text-gray-300 flex items-start space-x-1.5">
                          <span className="text-cyan-400 font-bold">⚡</span>
                          <span>{inn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Game Trailer Button */}
                {game.youtubeTrailerId && (
                  <div className="pt-6 mt-4 border-t border-white/10">
                    <button
                      onClick={() => handleOpenTrailer(game.title, game.youtubeTrailerId, game.youtubeUrl)}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>VER GAMEPLAY / TRAILER</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY 3: CHRONOLOGICAL MOVIE TIMELINE */}
      {activeCategory === 'chronology' && (
        <div className="space-y-12 py-4">
          {/* Multiverse Banner */}
          <div className="p-6 rounded-2xl glass-panel-glow border border-yellow-500/40 text-center space-y-3 shadow-[0_0_40px_rgba(255,215,0,0.2)]">
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-mono text-xs font-bold border border-yellow-400/40 uppercase">
              🌌 CONEXÃO DO MULTIVERSO CINEMATOGRÁFICO
            </span>
            <h3 className="text-3xl sm:text-5xl font-black uppercase text-white font-title text-glow-gold">
              TRILHA CRONOLÓGICA DOS FILMES (2002 - 2027)
            </h3>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Os filmes pertencem a universos diferentes, mas se conectam de forma épica em <strong className="text-yellow-400">Homem-Aranha: Sem Volta Para Casa (2021)</strong> e na saga do <strong className="text-pink-400">Aranhaverso</strong>!
            </p>
          </div>

          {/* Timeline Eras Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOVIE_TIMELINE_ERAS.map((era) => (
              <motion.div
                key={era.eraId}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6 relative overflow-hidden"
                style={{ borderColor: `${era.color}40` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-black/60 border" style={{ color: era.color, borderColor: `${era.color}60` }}>
                      {era.badge}
                    </span>
                    <h4 className="text-xl font-extrabold uppercase text-white mt-2 font-title">
                      {era.eraName}
                    </h4>
                  </div>
                  <span className="text-sm font-mono font-bold text-gray-400">{era.years}</span>
                </div>

                {/* Sequence Flow */}
                <div className="space-y-3">
                  {era.movies.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold text-black" style={{ backgroundColor: era.color }}>
                          {m.year.slice(2)}
                        </div>
                        {idx < era.movies.length - 1 && (
                          <div className="w-0.5 h-6 bg-white/20 my-1" />
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex-1 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold" style={{ color: era.color }}>
                            {m.year}
                          </span>
                          <span className="text-sm font-bold text-white block">
                            {m.title}
                          </span>
                          {m.note && (
                            <span className="text-[10px] text-gray-400 font-mono italic block">
                              • {m.note}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* MCU Chronological Full Order Box */}
          <div className="p-6 rounded-2xl bg-black/80 border border-red-500/40 space-y-4">
            <h4 className="text-xl font-black uppercase text-red-400 font-title tracking-wider">
              🕷️ CRONOLOGIA COMPLETA DE TOM HOLLAND NO MCU (COM PARTICIPAÇÕES EM VINGADORES):
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                '2016 — Capitão América: Guerra Civil',
                '⬇️',
                '2017 — Homem-Aranha: De Volta ao Lar',
                '⬇️',
                '2018 — Vingadores: Guerra Infinita',
                '⬇️',
                '2019 — Vingadores: Ultimato',
                '⬇️',
                '2019 — Homem-Aranha: Longe de Casa',
                '⬇️',
                '2021 — Homem-Aranha: Sem Volta Para Casa',
                '⬇️',
                '2026 — 🕷️ Homem-Aranha: Um Novo Dia (Brand New Day)'
              ].map((item, i) => (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-lg border ${
                    item === '⬇️'
                      ? 'bg-transparent border-transparent text-red-500 font-extrabold text-sm'
                      : 'bg-red-950/40 border-red-500/40 text-gray-200'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* YOUTUBE VIDEO TRAILER MODAL */}
      <AnimatePresence>
        {selectedTrailer && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl rounded-2xl glass-panel-glow border border-red-500/50 p-4 sm:p-6 overflow-hidden shadow-[0_0_80px_rgba(229,9,20,0.5)] space-y-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2 text-red-500">
                  <Play className="w-5 h-5 fill-red-500" />
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white font-title truncate max-w-md sm:max-w-xl">
                    {selectedTrailer.title} — TRAILER OFICIAL
                  </h3>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedTrailer(null);
                  }}
                  className="p-2 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-red-600 transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* YouTube Video Player iFrame */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedTrailer.videoId}?autoplay=1`}
                  title={selectedTrailer.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Modal Footer Link */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-gray-400">YOUTUBE EMBED PLAYER</span>
                <a
                  href={selectedTrailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  <span>ABRIR DIRETAMENTE NO YOUTUBE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
