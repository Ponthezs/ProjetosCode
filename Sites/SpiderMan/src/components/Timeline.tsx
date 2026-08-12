import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { TIMELINE_DATA, SUITS_DATA } from '../data/suitsData';
import { soundEngine } from '../services/audioService';

interface TimelineProps {
  onSelectSuit: (suitId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onSelectSuit }) => {
  const [activeId, setActiveId] = useState(TIMELINE_DATA[0].id);

  const activeItem = TIMELINE_DATA.find((t) => t.id === activeId) || TIMELINE_DATA[0];
  const linkedSuit = SUITS_DATA.find((s) => s.id === activeItem.suitId);

  return (
    <section id="timeline-section" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono tracking-widest uppercase"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>LINHA DO TEMPO DA FRANQUIA</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase italic tracking-wider text-white text-glow-red"
          style={{ fontFamily: 'impact, sans-serif' }}
        >
          THE EVOLUTION
        </motion.h2>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto font-sans">
          Navegue pelas seis décadas de evolução técnica e estética do Homem-Aranha nos quadrinhos, cinema e games.
        </p>
      </div>

      {/* Horizontal Interactive Timeline Axis */}
      <div className="relative mb-12">
        {/* Connecting Cable Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-cyan-400 to-yellow-400 -translate-y-1/2 opacity-30" />

        <div className="relative z-10 flex items-center justify-between overflow-x-auto py-6 px-4 space-x-4 scrollbar-none">
          {TIMELINE_DATA.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveId(item.id);
                }}
                className={`relative flex-shrink-0 flex flex-col items-center group cursor-pointer transition-all ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Year Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider mb-3 transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-[0_0_15px_#E50914]'
                      : 'bg-white/5 text-gray-400 border border-white/10 group-hover:text-white'
                  }`}
                >
                  {item.year}
                </span>

                {/* Node Circle */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? 'border-red-500 bg-red-600 shadow-[0_0_20px_#E50914]'
                      : 'border-gray-600 bg-gray-900 group-hover:border-gray-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-600'}`} />
                </div>

                {/* Short Title */}
                <span
                  className={`mt-2 text-[10px] font-mono uppercase tracking-wider max-w-[100px] text-center truncate ${
                    isActive ? 'text-cyan-400 font-bold' : 'text-gray-500'
                  }`}
                >
                  {item.era}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Timeline Card Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="glass-panel-glow p-6 sm:p-10 rounded-3xl border border-red-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Details Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-md bg-red-600/30 border border-red-500/50 text-red-400 font-mono text-sm font-bold">
                {activeItem.year}
              </span>
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                {activeItem.era}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold uppercase italic tracking-wide text-white">
              {activeItem.title}
            </h3>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
              {activeItem.description}
            </p>

            {/* Key Historical Milestones */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-mono tracking-widest text-gray-400 uppercase">
                MARCOS HISTÓRICOS DA ERA
              </span>
              <div className="space-y-2">
                {activeItem.keyEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{evt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Suit Action */}
            {linkedSuit && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectSuit(linkedSuit.id);
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs font-mono tracking-widest uppercase hover:bg-red-600 hover:border-red-500 transition-all cursor-pointer"
                >
                  <span>VER TRAJE DESTA ERA ({linkedSuit.name})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Highlight Box */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-center space-y-4">
            <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">
              TRAJE DESTAQUE DA ERA
            </span>
            {linkedSuit ? (
              <div className="space-y-3">
                <div className="text-2xl font-extrabold uppercase italic text-glow-red text-white">
                  {linkedSuit.name}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {linkedSuit.tagline}
                </p>
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-xs font-mono text-red-400">
                  {linkedSuit.version}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
