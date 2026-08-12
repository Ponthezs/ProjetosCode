import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('interactive')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Spider Target Reticle */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/70"
        animate={{
          x: pos.x,
          y: pos.y,
          scale: isClicked ? 0.7 : isHovered ? 1.6 : 1,
          width: isHovered ? '48px' : '32px',
          height: isHovered ? '48px' : '32px',
          borderColor: isHovered ? '#00F0FF' : '#E50914',
          boxShadow: isHovered 
            ? '0 0 15px rgba(0, 240, 255, 0.6)' 
            : '0 0 12px rgba(229, 9, 20, 0.5)'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.2 }}
      >
        {/* Reticle Corner Crosshairs */}
        <div className="absolute -top-1 left-1/2 h-2 w-[1px] -translate-x-1/2 bg-red-500" />
        <div className="absolute -bottom-1 left-1/2 h-2 w-[1px] -translate-x-1/2 bg-red-500" />
        <div className="absolute top-1/2 -left-1 h-[1px] w-2 -translate-y-1/2 bg-red-500" />
        <div className="absolute top-1/2 -right-1 h-[1px] w-2 -translate-y-1/2 bg-red-500" />
      </motion.div>

      {/* Inner Dot */}
      <motion.div
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
        animate={{
          x: pos.x,
          y: pos.y,
          scale: isClicked ? 2 : 1,
          backgroundColor: isHovered ? '#00F0FF' : '#E50914'
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 500 }}
      />
    </div>
  );
};
