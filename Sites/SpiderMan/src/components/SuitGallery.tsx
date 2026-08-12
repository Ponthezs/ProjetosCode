import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, Sparkles, Eye } from 'lucide-react';
import { SUITS_DATA } from '../data/suitsData';
import type { Suit, SuitCategory } from '../types/suit';
import { SuitCanvasVisual } from './SuitCanvasVisual';
import { soundEngine } from '../services/audioService';

interface SuitGalleryProps {
  onInspectSuit: (suit: Suit) => void;
}

export const SuitGallery: React.FC<SuitGalleryProps> = ({ onInspectSuit }) => {
  const [activeCategory, setActiveCategory] = useState<SuitCategory>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredSuits = SUITS_DATA.filter((suit) => {
    if (activeCategory === 'ALL') return true;
    return suit.categories.includes(activeCategory);
  });

  const currentSuit = filteredSuits[currentIndex] || filteredSuits[0];

  const handleNext = () => {
    soundEngine.playSuitSpin();
    setCurrentIndex((prev) => (prev + 1) % filteredSuits.length);
  };

  const handlePrev = () => {
    soundEngine.playSuitSpin();
    setCurrentIndex((prev) => (prev - 1 + filteredSuits.length) % filteredSuits.length);
  };

  const categories: { id: SuitCategory; label: string }[] = [
    { id: 'ALL', label: 'TODOS' },
    { id: 'CLASSICS', label: 'CLÁSSICOS' },
    { id: 'TECHNOLOGY', label: 'TECNOLOGIA' },
    { id: 'SYMBIOTE', label: 'SIMBIONTES' },
    { id: 'MULTIVERSE', label: 'MULTIVERSO' },
    { id: 'MILES', label: 'MILES MORALES' },
    { id: 'PETER', label: 'PETER PARKER' },
    { id: 'LIVE-ACTION', label: 'LIVE ACTION' },
    { id: 'ANIMATION', label: 'ANIMAÇÃO' }
  ];

  return (
    <section id="suits-section" className="relative w-full min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Background Section Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center space-y-3 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono tracking-widest uppercase"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>GALERIA DE UNIFORMES</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase italic tracking-wider text-white text-glow-red"
          style={{ fontFamily: 'impact, sans-serif' }}
        >
          THE SUITS
        </motion.h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto font-sans">
          Cada traje conta uma história. Escolha e explore a engenharia, características e origens dos trajes do Homem-Aranha.
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-widest uppercase whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(229,9,20,0.6)] font-bold'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Suit Showcase Stage */}
      {currentSuit && (
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-panel-glow p-6 sm:p-10 rounded-3xl border border-red-500/30">
          {/* Left Column: Specs & Lore */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSuit.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Number & Badge */}
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-extrabold font-mono text-red-500 tracking-tighter">
                    Nº {currentSuit.number}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs uppercase font-semibold">
                    {currentSuit.badgeText}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {currentSuit.period}
                  </span>
                </div>

                {/* Suit Title */}
                <div>
                  <h3 className="text-3xl sm:text-5xl font-extrabold uppercase italic tracking-wide text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                    {currentSuit.name}
                  </h3>
                  <p className="text-sm font-mono text-red-400 tracking-wider mt-1">
                    {currentSuit.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
                  {currentSuit.description}
                </p>

                {/* Characteristics & Abilities Pill Badges */}
                <div className="space-y-3">
                  <span className="block text-xs font-mono tracking-widest text-gray-400 uppercase">
                    CARACTERÍSTICAS & TECNOLOGIA
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentSuit.characteristics.concat(currentSuit.technology.slice(0, 2)).map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-200 font-sans flex items-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Radar Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase">DEFESA</span>
                    <span className="text-xl font-bold text-red-400">{currentSuit.stats.defense}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase">VELOCIDADE</span>
                    <span className="text-xl font-bold text-cyan-400">{currentSuit.stats.speed}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase">TECNOLOGIA</span>
                    <span className="text-xl font-bold text-yellow-400">{currentSuit.stats.tech}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase">AGILIDADE</span>
                    <span className="text-xl font-bold text-purple-400">{currentSuit.stats.agility}%</span>
                  </div>
                </div>

                {/* CTA 360 Inspection Button */}
                <div className="pt-4 flex items-center space-x-4">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onInspectSuit(currentSuit);
                    }}
                    className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-sm tracking-wider uppercase border border-red-400/40 hover:shadow-[0_0_25px_rgba(229,9,20,0.8)] transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>INSPECCIONAR EM 360°</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Interactive Visual Canvas Stage */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[400px] order-1 lg:order-2">
            {/* Prev / Next Stage Nav Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-red-600 hover:border-red-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 border border-white/20 text-white hover:bg-red-600 hover:border-red-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Suit Canvas Render */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSuit.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.2, rotate: 5 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full h-full flex items-center justify-center"
              >
                <SuitCanvasVisual suit={currentSuit} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Grid Thumbnail Bar */}
      <div className="mt-8 flex items-center justify-center space-x-3 overflow-x-auto py-3">
        {filteredSuits.map((suit, index) => {
          const isSelected = index === currentIndex;
          return (
            <button
              key={suit.id}
              onClick={() => {
                soundEngine.playSuitSpin();
                setCurrentIndex(index);
              }}
              className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-red-600/30 border-red-500 text-white shadow-[0_0_15px_rgba(229,9,20,0.5)] scale-105'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="block text-[10px] font-mono text-red-400">Nº {suit.number}</span>
              <span className="block text-xs font-bold uppercase truncate max-w-[120px]">{suit.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
