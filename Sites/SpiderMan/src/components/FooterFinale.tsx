import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { soundEngine } from '../services/audioService';

interface FooterFinaleProps {
  onRestart: () => void;
}

export const FooterFinale: React.FC<FooterFinaleProps> = ({ onRestart }) => {
  return (
    <footer className="relative w-full py-28 px-4 sm:px-6 lg:px-8 border-t border-red-500/20 bg-gradient-to-b from-[#07080C] via-[#0D050B] to-[#040407] overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        {/* Animated Story Ending Quotes */}
        <div className="space-y-4 font-mono tracking-widest uppercase">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold text-white text-glow-red"
          >
            ONE HERO.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-4xl font-extrabold text-cyan-400 text-glow-cyan"
          >
            COUNTLESS SUITS.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-2xl sm:text-4xl font-extrabold text-yellow-400 text-glow-gold"
          >
            INFINITE WORLDS.
          </motion.div>
        </div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="space-y-4 pt-6"
        >
          <h3
            className="text-5xl sm:text-7xl font-extrabold uppercase italic tracking-wider text-white"
            style={{ fontFamily: 'impact, sans-serif' }}
          >
            THE STORY CONTINUES...
          </h3>

          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            "Qualquer um pode usar a máscara. Você pode usar a máscara. Se você não sabia disso antes, espero que saiba agora."
          </p>

          <div className="pt-6">
            <button
              onClick={() => {
                soundEngine.playThwip();
                onRestart();
              }}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold text-xs font-mono tracking-widest uppercase hover:shadow-[0_0_35px_rgba(229,9,20,0.8)] transition-all cursor-pointer border border-red-400/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>REINICIAR EXPERIÊNCIA</span>
            </button>
          </div>
        </motion.div>

        {/* Copyright & Disclaimer */}
        <div className="pt-16 border-t border-white/10 text-xs text-gray-500 font-mono space-y-2">
          <p>
            SPIDER-MAN: THE EVOLUTION OF THE SUIT — EXPERIÊNCIA CINEMATOGRÁFICA INTERATIVA
          </p>
          <p className="text-[10px] text-gray-600">
            Spider-Man, Marvel Comics e todos os trajes e personagens relacionados são marcas registradas da Marvel Entertainment, LLC / Sony Pictures.
          </p>
        </div>
      </div>
    </footer>
  );
};
