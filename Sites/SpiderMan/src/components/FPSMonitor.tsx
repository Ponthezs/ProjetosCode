import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Gauge, ChevronDown, ChevronUp } from 'lucide-react';
import { soundEngine } from '../services/audioService';

export type FramerateMode = '60' | '24' | '12';

interface FPSMonitorProps {
  currentMode: FramerateMode;
  onModeChange: (mode: FramerateMode) => void;
}

export const FPSMonitor: React.FC<FPSMonitorProps> = ({ currentMode, onModeChange }) => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState<number[]>(new Array(20).fill(60));

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;

    const measureFPS = (now: number) => {
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;

      if (delta >= 500) { // update twice a second
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        const ms = (delta / frameCountRef.current).toFixed(1);

        setFps(currentFps);
        setFrameTime(parseFloat(ms));
        setHistory((prev) => [...prev.slice(1), currentFps]);

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(measureFPS);
    };

    animId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animId);
  }, []);

  const getFPSColor = () => {
    if (fps >= 55) return 'text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.4)]';
    if (fps >= 30) return 'text-yellow-400 border-yellow-500/40 shadow-[0_0_15px_rgba(255,215,0,0.4)]';
    return 'text-red-500 border-red-500/40 shadow-[0_0_15px_rgba(229,9,20,0.4)]';
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Performance Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-3 p-4 rounded-2xl glass-panel-glow border border-cyan-500/40 w-72 space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.2)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Gauge className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">
                  DIAGNÓSTICO DE PERFORMANCE
                </span>
              </div>
            </div>

            {/* FPS & Frame Time Big Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">FRAMERATE</span>
                <span className="text-2xl font-extrabold font-mono text-cyan-400 text-glow-cyan">
                  {fps} <span className="text-xs text-gray-400">FPS</span>
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">FRAME TIME</span>
                <span className="text-2xl font-extrabold font-mono text-white">
                  {frameTime} <span className="text-xs text-gray-400">MS</span>
                </span>
              </div>
            </div>

            {/* Live FPS Stability Graph */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">
                ESTABILIDADE DA CÂMERA
              </span>
              <div className="h-10 w-full bg-black/60 rounded-xl p-1 flex items-end justify-between border border-white/5 space-x-0.5">
                {history.map((val, idx) => {
                  const hPct = Math.min(100, Math.max(15, (val / 70) * 100));
                  return (
                    <div
                      key={idx}
                      className="w-full bg-gradient-to-t from-red-600 via-cyan-400 to-cyan-300 rounded-t transition-all duration-300"
                      style={{ height: `${hPct}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Spider-Verse Framerate Mode Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest block">
                MODO DE ANIMAÇÃO SPIDER-VERSE
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onModeChange('60');
                  }}
                  className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                    currentMode === '60'
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#00F0FF]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ 60 FPS
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onModeChange('24');
                  }}
                  className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                    currentMode === '24'
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300 shadow-[0_0_12px_#FFD700]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  🎬 24 FPS
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onModeChange('12');
                  }}
                  className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                    currentMode === '12'
                      ? 'bg-red-600/40 border-red-500 text-red-400 shadow-[0_0_12px_#E50914]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  🎸 12 FPS
                </button>
              </div>
              <p className="text-[9px] text-gray-400 italic">
                {currentMode === '12'
                  ? 'Estilo Hobie Brown (Spider-Punk): Animação recortada a 12 quadros.'
                  : currentMode === '24'
                  ? 'Estilo Cinema Tradicional (24 quadros por segundo).'
                  : 'Modo Ultra Suave de 60+ FPS em tempo real.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD Pill Toggle Button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          setIsExpanded(!isExpanded);
        }}
        className={`flex items-center space-x-2 px-3.5 py-2 rounded-full border bg-black/80 backdrop-blur-md transition-all cursor-pointer ${getFPSColor()}`}
      >
        <Activity className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-mono font-extrabold tracking-wider">
          {fps} FPS
        </span>
        <span className="text-[10px] font-mono opacity-60">
          [{currentMode} FPS MODE]
        </span>
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
