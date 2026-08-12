import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComicPop } from '../types/suit';
import { soundEngine } from '../services/audioService';

const COMIC_TEXTS = ['THWIP!', 'ZAP!', 'THWIP!', 'SFWIP!', 'BOOM!', 'BAM!', 'SWOOSH!'];
const COMIC_COLORS = ['#E50914', '#00F0FF', '#FFD700', '#FFFFFF', '#A855F7'];

export const ComicFXOverlay: React.FC = () => {
  const [pops, setPops] = useState<ComicPop[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Play web thwip sound on click
      soundEngine.playThwip();

      // Spawn comic text popup randomly 40% of clicks or on buttons
      const randomText = COMIC_TEXTS[Math.floor(Math.random() * COMIC_TEXTS.length)];
      const randomColor = COMIC_COLORS[Math.floor(Math.random() * COMIC_COLORS.length)];
      const newPop: ComicPop = {
        id: Math.random().toString(36).substring(2, 9),
        text: randomText,
        x: e.clientX,
        y: e.clientY,
        color: randomColor,
      };

      setPops((prev) => [...prev.slice(-4), newPop]); // keep max 5 active

      setTimeout(() => {
        setPops((prev) => prev.filter((p) => p.id !== newPop.id));
      }, 700);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {pops.map((pop) => (
          <motion.div
            key={pop.id}
            initial={{ opacity: 0, scale: 0.3, rotate: Math.random() * 20 - 10, x: pop.x - 40, y: pop.y - 40 }}
            animate={{ opacity: 1, scale: 1.2, rotate: Math.random() * 10 - 5, y: pop.y - 70 }}
            exit={{ opacity: 0, scale: 1.5, y: pop.y - 100 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="absolute font-black tracking-widest uppercase select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
            style={{
              color: pop.color,
              fontSize: '24px',
              fontStyle: 'italic',
              textShadow: `-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 15px ${pop.color}`,
              WebkitTextStroke: '1px black',
            }}
          >
            <div className="relative">
              <span className="z-10 relative">{pop.text}</span>
              {/* Comic Action Starburst */}
              <div 
                className="absolute inset-0 -m-3 border-2 border-black rounded-lg rotate-12 bg-black/40 -z-10"
                style={{ clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 85% 65%, 95% 100%, 50% 80%, 15% 100%, 20% 60%, 0% 30%, 25% 15%)' }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
