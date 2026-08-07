import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Sparkles, Radio } from 'lucide-react';
import { Track } from '../../types';

interface PlayerBarProps {
  currentTrack?: Track | null;
  activeModeTitle?: string | null;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ currentTrack, activeModeTitle }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(true);
  const [volume, setVolume] = useState(80);

  const track = currentTrack || {
    id: 'tr_1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
    genre: 'Synthpop',
    mood: 'Energético',
    decade: '2020s',
    duration_seconds: 200,
    popularity: 98,
    is_favorite: true,
    tempo_bpm: 171,
    voice_type: 'Masculina',
    language: 'Inglês',
    themes: ['Academia', 'Festa']
  };

  return (
    <div className="h-20 bg-obsidian-800 border-t border-slate-800/90 px-6 flex items-center justify-between select-none z-40 relative">
      {/* Left: Track Details */}
      <div className="flex items-center gap-3 w-1/4">
        <div className="relative group w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 shadow-md">
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-end justify-center pb-1.5 gap-0.5">
              <div className="w-1 bg-emerald-400 rounded-full animate-eq-1" />
              <div className="w-1 bg-emerald-400 rounded-full animate-eq-2" />
              <div className="w-1 bg-emerald-400 rounded-full animate-eq-3" />
              <div className="w-1 bg-emerald-400 rounded-full animate-eq-4" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
            {track.title}
          </h4>
          <p className="text-xs text-slate-400 truncate hover:underline cursor-pointer">
            {track.artist}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-medium">
              {track.genre}
            </span>
            <span className="text-[10px] text-slate-500">• {track.mood}</span>
          </div>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="ml-2 text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-emerald-400 text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Middle: Player Controls */}
      <div className="flex flex-col items-center gap-1.5 w-2/4">
        <div className="flex items-center gap-5">
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-glow-emerald hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            )}
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Playback progress bar */}
        <div className="w-full max-w-md flex items-center gap-2 text-[11px] text-slate-400">
          <span>1:15</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden relative group cursor-pointer">
            <div className="h-full bg-emerald-400 w-1/3 rounded-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
          <span>3:20</span>
        </div>
      </div>

      {/* Right: Active Mode Pill & Volume */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        {activeModeTitle && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>{activeModeTitle}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
