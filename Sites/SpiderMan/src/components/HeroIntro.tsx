import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { soundEngine } from '../services/audioService';

interface HeroIntroProps {
  onEnter: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Volumetric Sky Searchlights
    let searchAngle1 = 0;
    let searchAngle2 = Math.PI;

    // Drifting Web Particles
    const particles: { x: number; y: number; size: number; vx: number; vy: number; alpha: number }[] = [];
    for (let p = 0; p < 70; p++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.4,
        alpha: 0.2 + Math.random() * 0.5
      });
    }

    // High quality skyscraper silhouettes (front layer & back layer)
    const backBuildings = [
      { x: 0.02, w: 0.08, h: 0.5 },
      { x: 0.11, w: 0.07, h: 0.65 },
      { x: 0.20, w: 0.12, h: 0.45 },
      { x: 0.34, w: 0.09, h: 0.72 },
      { x: 0.45, w: 0.10, h: 0.55 },
      { x: 0.57, w: 0.08, h: 0.68 },
      { x: 0.67, w: 0.11, h: 0.50 },
      { x: 0.80, w: 0.09, h: 0.75 },
      { x: 0.90, w: 0.08, h: 0.42 }
    ];

    const frontBuildings = [
      { x: 0.05, w: 0.10, h: 0.35 },
      { x: 0.17, w: 0.09, h: 0.42 },
      { x: 0.28, w: 0.13, h: 0.38 },
      { x: 0.43, w: 0.11, h: 0.48 },
      { x: 0.56, w: 0.10, h: 0.36 },
      { x: 0.68, w: 0.12, h: 0.44 },
      { x: 0.82, w: 0.11, h: 0.39 }
    ];

    const render = () => {
      searchAngle1 += 0.008;
      searchAngle2 -= 0.006;
      ctx.clearRect(0, 0, width, height);

      // Deep Midnight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030408');
      skyGrad.addColorStop(0.5, '#070914');
      skyGrad.addColorStop(1, '#15060D');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Volumetric Spotlight Searchbeams in Sky
      const drawSpotlight = (angle: number, color: string) => {
        ctx.save();
        ctx.translate(width / 2, height * 0.9);
        ctx.rotate(Math.sin(angle) * 0.35);

        const beamGrad = ctx.createLinearGradient(0, 0, 0, -height);
        beamGrad.addColorStop(0, color);
        beamGrad.addColorStop(0.7, 'rgba(229, 9, 20, 0.04)');
        beamGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-180, -height * 1.2);
        ctx.lineTo(180, -height * 1.2);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      drawSpotlight(searchAngle1, 'rgba(229, 9, 20, 0.18)');
      drawSpotlight(searchAngle2, 'rgba(0, 240, 255, 0.14)');

      // Atmospheric Center Fog Glow
      const centerGlow = ctx.createRadialGradient(width / 2, height * 0.7, 50, width / 2, height * 0.7, width * 0.5);
      centerGlow.addColorStop(0, 'rgba(229, 9, 20, 0.18)');
      centerGlow.addColorStop(0.6, 'rgba(0, 240, 255, 0.06)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Render Back Building Silhouettes
      ctx.fillStyle = '#060810';
      backBuildings.forEach((b) => {
        const bx = b.x * width;
        const bw = b.w * width;
        const bh = b.h * height;
        const by = height - bh;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeRect(bx, by, bw, bh);
      });

      // Render Front Building Silhouettes
      ctx.fillStyle = '#090C16';
      frontBuildings.forEach((b) => {
        const bx = b.x * width;
        const bw = b.w * width;
        const bh = b.h * height;
        const by = height - bh;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'rgba(229, 9, 20, 0.12)';
        ctx.strokeRect(bx, by, bw, bh);
      });

      // Render Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height + 10;
        if (p.x < 0) p.x = width + 10;
        if (p.x > width) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Subtle Web Connector Lines
      ctx.strokeStyle = 'rgba(229, 9, 20, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i += 5) {
        if (i + 1 < particles.length) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[i + 1].x, particles[i + 1].y);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleEnterClick = () => {
    soundEngine.playThwip();
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  return (
    <section id="hero-section" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* City Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Halftone & Scanlines Overlay */}
      <div className="absolute inset-0 z-10 comic-halftone pointer-events-none opacity-30" />
      <div className="absolute inset-0 z-10 scanlines pointer-events-none" />

      {/* Cinematic Web Zoom Flash */}
      {isEntering && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 25, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeIn' }}
          className="absolute z-50 w-32 h-32 rounded-full bg-red-600 shadow-[0_0_120px_#E50914]"
        />
      )}

      {/* Main Hero Card */}
      <div className="relative z-20 text-center max-w-4xl px-4 flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-red-500/40 bg-red-950/40 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(229,9,20,0.3)]"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-red-400 uppercase">
            EXPERIÊNCIA CINEMATOGRÁFICA INTERATIVA
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight uppercase text-white drop-shadow-[0_10px_35px_rgba(229,9,20,0.7)]"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: '0.02em'
          }}
        >
          SPIDER-MAN
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-2 text-lg sm:text-2xl font-mono tracking-[0.35em] text-gray-300 font-bold uppercase text-glow-red"
        >
          THE EVOLUTION OF THE SUIT
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-5 max-w-xl text-sm sm:text-base text-gray-300 leading-relaxed font-sans"
        >
          Entre no universo do Homem-Aranha e descubra a evolução tecnológica, 
          origens e habilidades dos trajes em uma jornada cinematográfica.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-10"
        >
          <button
            onClick={handleEnterClick}
            className="group relative inline-flex items-center space-x-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white font-black text-lg tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(229,9,20,0.8)] active:scale-95 border border-red-400/50 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">ENTRAR NO UNIVERSO</span>
            <svg
              className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2 cursor-pointer"
        onClick={() => {
          soundEngine.playClick();
          onEnter();
        }}
      >
        <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          ROLES PARA NAVEGAR
        </span>
        <div className="w-5 h-9 rounded-full border-2 border-red-500/50 flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-1.5 h-2 rounded-full bg-red-500"
          />
        </div>
      </motion.div>
    </section>
  );
};
