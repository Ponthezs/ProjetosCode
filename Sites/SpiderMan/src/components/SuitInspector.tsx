import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Eye, Crosshair } from 'lucide-react';
import type { Suit, SuitHotspot } from '../types/suit';
import { SuitCanvasVisual } from './SuitCanvasVisual';
import { soundEngine } from '../services/audioService';

interface SuitInspectorProps {
  suit: Suit | null;
  onClose: () => void;
}

export const SuitInspector: React.FC<SuitInspectorProps> = ({ suit, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [showBackView, setShowBackView] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<SuitHotspot | null>(null);
  const [fpsCap, setFpsCap] = useState(60);

  if (!suit) return null;

  const handleHotspotClick = (hotspotId: string) => {
    soundEngine.playClick();
    const found = suit.hotspots.find((h) => h.id === hotspotId);
    setActiveHotspot(found || null);
  };

  const handleRotate = (deg: number) => {
    soundEngine.playSuitSpin();
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl rounded-2xl glass-panel-glow border border-red-500/40 p-6 md:p-8 overflow-hidden shadow-[0_0_80px_rgba(229,9,20,0.3)]"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded bg-red-600/30 text-red-400 font-mono text-xs border border-red-500/50">
                Nº {suit.number}
              </span>
              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold uppercase italic tracking-wider text-white text-glow-red">
                  {suit.name}
                </h2>
                <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
                  {suit.version} • {suit.period}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2.5 rounded-full bg-white/5 border border-white/20 text-gray-300 hover:text-white hover:bg-red-600/40 hover:border-red-500 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls & Info Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Lore Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
                    UNIVERSO & ORIGEM
                  </span>
                  <span className="text-xs font-bold text-red-500">{suit.universe}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">{suit.origin}</p>
              </div>

              {/* 360 Rotation & View Controls */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <span className="block text-xs font-mono tracking-widest text-gray-400 uppercase mb-2">
                  CONTROLES DA CÂMERA 360°
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRotate(-45)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-red-600/30 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 mb-1 -scale-x-100 text-red-400" />
                    <span>GIRAR ESQ.</span>
                  </button>

                  <button
                    onClick={() => handleRotate(45)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-red-600/30 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 mb-1 text-red-400" />
                    <span>GIRAR DIR.</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setShowBackView(!showBackView);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                      showBackView
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-red-600/30'
                    }`}
                  >
                    <Eye className="w-4 h-4 mb-1" />
                    <span>{showBackView ? 'COSTAS' : 'FRENTE'}</span>
                  </button>
                </div>
              </div>

              {/* Tech Stats Overview */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="block text-xs font-mono tracking-widest text-gray-400 uppercase">
                  ESTATÍSTICAS DO TRAJE
                </span>
                {Object.entries(suit.stats).map(([statKey, value]) => (
                  <div key={statKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono uppercase text-gray-300">
                      <span>{statKey}</span>
                      <span className="text-red-400 font-bold">{value}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-red-600 to-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Suit Visualizer Canvas */}
            <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[480px] rounded-2xl bg-black/60 border border-red-500/20 p-4">
              <SuitCanvasVisual
                suit={suit}
                isInspecting={true}
                rotationAngle={rotation}
                showBackView={showBackView}
                activeHotspotId={activeHotspot?.id || null}
                onHotspotClick={handleHotspotClick}
                fpsCap={fpsCap}
              />

              {/* Turntable 360° & Framerate Control Bar */}
              <div className="w-full mt-4 p-3 rounded-xl bg-black/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md z-30">
                {/* 360 Degree Slider */}
                <div className="flex items-center space-x-3 w-full sm:w-auto flex-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider whitespace-nowrap">
                    TURNTABLE 360°: {rotation}°
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                {/* Framerate Controls */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase mr-1">FPS:</span>
                  {[60, 30, 12].map((fMode) => (
                    <button
                      key={fMode}
                      onClick={() => {
                        soundEngine.playClick();
                        setFpsCap(fMode);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        fpsCap === fMode
                          ? 'bg-red-600 text-white shadow-[0_0_10px_#E50914]'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {fMode === 12 ? '12 FPS (HQ)' : `${fMode} FPS`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Hotspot HUD Popup */}
              <AnimatePresence>
                {activeHotspot && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#080B14]/90 border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.3)] backdrop-blur-md z-40 flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">
                          [{activeHotspot.label}]
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white uppercase italic">{activeHotspot.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{activeHotspot.description}</p>
                    </div>
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="p-1 rounded text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
