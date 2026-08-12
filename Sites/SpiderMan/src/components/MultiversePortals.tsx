import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, ArrowUpRight } from 'lucide-react';
import { MULTIVERSE_PORTALS } from '../data/suitsData';
import type { MultiversePortal } from '../types/suit';
import { soundEngine } from '../services/audioService';

interface MultiversePortalsProps {
  onSelectSuit: (suitId: string) => void;
}

export const MultiversePortals: React.FC<MultiversePortalsProps> = ({ onSelectSuit }) => {
  const [selectedPortal, setSelectedPortal] = useState<MultiversePortal | null>(null);

  const handlePortalHover = () => {
    soundEngine.playPortalHum();
  };

  return (
    <section id="multiverse-section" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-widest uppercase"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>PORTAIS MULTIVERSAIS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase italic tracking-wider text-white text-glow-cyan"
          style={{ fontFamily: 'impact, sans-serif' }}
        >
          ONE HERO. INFINITE WORLDS.
        </motion.h2>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto font-sans">
          Passe o cursor sobre os portais para distorcer a realidade e explorar as diferentes encarnações do Homem-Aranha no Multiverso.
        </p>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MULTIVERSE_PORTALS.map((portal) => (
          <motion.div
            key={portal.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onMouseEnter={handlePortalHover}
            onClick={() => {
              soundEngine.playClick();
              setSelectedPortal(portal);
            }}
            className="group relative p-6 rounded-3xl glass-panel border border-white/10 hover:border-cyan-400/60 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[360px]"
          >
            {/* Background Portal Rotating Ring Shader Effect */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-portal blur-md"
              style={{
                background: `conic-gradient(from 0deg, ${portal.primaryColor}, ${portal.portalParticleColor}, transparent, ${portal.accentColor})`
              }}
            />

            {/* Top Bar Info */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs font-bold">
                {portal.earthCode}
              </span>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            {/* Center Hero Info */}
            <div className="relative z-10 my-6 space-y-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">
                {portal.alterEgo}
              </span>
              <h3 className="text-3xl font-extrabold uppercase italic tracking-wide text-white group-hover:text-cyan-300 transition-colors">
                {portal.heroName}
              </h3>
              <p className="text-xs text-gray-300 italic font-mono">
                "{portal.quote}"
              </p>
            </div>

            {/* Traits Badges Footer */}
            <div className="relative z-10 flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
              {portal.traits.map((trait, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-black/40 text-[10px] font-mono text-gray-300 border border-white/5"
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Universe Modal Overlay */}
      <AnimatePresence>
        {selectedPortal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl glass-panel-glow border border-cyan-400/50 p-6 md:p-8 space-y-6 shadow-[0_0_80px_rgba(0,240,255,0.3)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs">
                    UNIVERSO {selectedPortal.earthCode}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold uppercase italic text-white">
                    {selectedPortal.heroName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPortal(null)}
                  className="p-2 rounded-full bg-white/5 text-gray-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                  {selectedPortal.description}
                </p>

                <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block">
                    ARMA / TECNOLOGIA ASSINATURA
                  </span>
                  <p className="text-sm font-bold text-white">
                    {selectedPortal.signatureWeapon}
                  </p>
                </div>
              </div>

              {/* Action Button to inspect linked suit */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectSuit(selectedPortal.suitId);
                    setSelectedPortal(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs font-mono tracking-widest uppercase hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] transition-all cursor-pointer"
                >
                  VER TRAJE DESTE UNIVERSO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
