import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders } from 'lucide-react';
import { SUITS_DATA } from '../data/suitsData';
import { SuitCanvasVisual } from './SuitCanvasVisual';
import { soundEngine } from '../services/audioService';

export const SuitCompare: React.FC = () => {
  const [suit1Id, setSuit1Id] = useState(SUITS_DATA[0].id);
  const [suit2Id, setSuit2Id] = useState(SUITS_DATA[2].id);

  const suit1 = SUITS_DATA.find((s) => s.id === suit1Id) || SUITS_DATA[0];
  const suit2 = SUITS_DATA.find((s) => s.id === suit2Id) || SUITS_DATA[1];

  return (
    <section id="compare-section" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 text-xs font-mono tracking-widest uppercase"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>FERRAMENTA DE COMPARAÇÃO</span>
        </motion.div>

        <h2 className="text-4xl sm:text-6xl font-extrabold uppercase italic tracking-wider text-white text-glow-gold">
          COMPARE THE SUITS
        </h2>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Selecione dois uniformes e compare o design, estatísticas de combate e inovações tecnológicas lado a lado.
        </p>
      </div>

      {/* Suit Selector Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Suit 1 Dropdown */}
        <div className="p-4 rounded-2xl bg-white/5 border border-red-500/30 space-y-2">
          <label className="text-xs font-mono text-red-400 tracking-widest uppercase block">
            UNIFORME A (ESQUERDA)
          </label>
          <select
            value={suit1Id}
            onChange={(e) => {
              soundEngine.playClick();
              setSuit1Id(e.target.value);
            }}
            className="w-full px-4 py-3 rounded-xl bg-black/80 text-white font-extrabold border border-white/20 focus:border-red-500 outline-none cursor-pointer uppercase text-sm"
          >
            {SUITS_DATA.map((s) => (
              <option key={s.id} value={s.id}>
                Nº {s.number} - {s.name} ({s.year})
              </option>
            ))}
          </select>
        </div>

        {/* Suit 2 Dropdown */}
        <div className="p-4 rounded-2xl bg-white/5 border border-cyan-500/30 space-y-2">
          <label className="text-xs font-mono text-cyan-400 tracking-widest uppercase block">
            UNIFORME B (DIREITA)
          </label>
          <select
            value={suit2Id}
            onChange={(e) => {
              soundEngine.playClick();
              setSuit2Id(e.target.value);
            }}
            className="w-full px-4 py-3 rounded-xl bg-black/80 text-white font-extrabold border border-white/20 focus:border-cyan-400 outline-none cursor-pointer uppercase text-sm"
          >
            {SUITS_DATA.map((s) => (
              <option key={s.id} value={s.id}>
                Nº {s.number} - {s.name} ({s.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dual Visual Canvas Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Suit 1 Visual Card */}
        <div className="p-6 rounded-3xl glass-panel-glow border border-red-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded bg-red-600/30 text-red-400 font-mono text-xs font-bold">
              Nº {suit1.number}
            </span>
            <span className="text-xs font-mono text-gray-400">{suit1.period}</span>
          </div>
          <h3 className="text-2xl font-extrabold uppercase italic text-white">{suit1.name}</h3>
          <div className="h-[300px] flex items-center justify-center bg-black/40 rounded-2xl">
            <SuitCanvasVisual suit={suit1} />
          </div>
        </div>

        {/* Suit 2 Visual Card */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded bg-cyan-600/30 text-cyan-300 font-mono text-xs font-bold">
              Nº {suit2.number}
            </span>
            <span className="text-xs font-mono text-gray-400">{suit2.period}</span>
          </div>
          <h3 className="text-2xl font-extrabold uppercase italic text-white">{suit2.name}</h3>
          <div className="h-[300px] flex items-center justify-center bg-black/40 rounded-2xl">
            <SuitCanvasVisual suit={suit2} />
          </div>
        </div>
      </div>

      {/* Side-by-Side Stats Comparison Radar */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
        <h3 className="text-xl font-bold uppercase text-white font-mono tracking-wider">
          COMPARAÇÃO DIRETA DE ATRIBUTOS
        </h3>

        <div className="space-y-4">
          {Object.keys(suit1.stats).map((key) => {
            const statKey = key as keyof typeof suit1.stats;
            const val1 = suit1.stats[statKey];
            const val2 = suit2.stats[statKey];
            return (
              <div key={statKey} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono uppercase text-gray-300">
                  <span className="text-red-400 font-bold">{val1}% ({suit1.name})</span>
                  <span className="text-gray-400">{statKey}</span>
                  <span className="text-cyan-400 font-bold">{val2}% ({suit2.name})</span>
                </div>
                <div className="grid grid-cols-2 gap-2 h-3 bg-gray-900 rounded-full overflow-hidden p-0.5">
                  {/* Left Bar */}
                  <div className="flex justify-end bg-gray-800 rounded-l-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-l-full transition-all duration-500"
                      style={{ width: `${val1}%` }}
                    />
                  </div>
                  {/* Right Bar */}
                  <div className="flex justify-start bg-gray-800 rounded-r-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-r-full transition-all duration-500"
                      style={{ width: `${val2}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
