import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { soundEngine } from '../services/audioService';

interface HeroIntroProps {
  onEnter: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [showAccessButton, setShowAccessButton] = useState(false);

  useEffect(() => {
    // Show access button after 2.5 seconds of spider logo intro animation
    const timer = setTimeout(() => {
      setShowAccessButton(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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

    // Drifting Crimson Web Particles & Energy Lines
    let time = 0;
    const particles: { x: number; y: number; size: number; vx: number; vy: number; alpha: number }[] = [];
    for (let p = 0; p < 80; p++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.5,
        alpha: 0.2 + Math.random() * 0.6
      });
    }

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep Crimson Red Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#590007');
      skyGrad.addColorStop(0.45, '#AF0B16');
      skyGrad.addColorStop(0.85, '#68000A');
      skyGrad.addColorStop(1, '#1A0003');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial Center Glow Shockwave
      const centerGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        30,
        width / 2,
        height / 2,
        width * 0.55
      );
      centerGlow.addColorStop(0, 'rgba(255, 60, 70, 0.45)');
      centerGlow.addColorStop(0.5, 'rgba(175, 11, 22, 0.2)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Sci-Fi Hexagonal Web Mesh in Center Background
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(time * 0.05);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 80; r <= 420; r += 60) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          const gx = r * Math.cos(a);
          const gy = r * Math.sin(a);
          if (a === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // Render Drifting Ember Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height + 10;
        if (p.x < 0) p.x = width + 10;
        if (p.x > width) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 230, 230, ${p.alpha})`;
        ctx.fill();
      });

      // Connecting Web Lines between Nearby Particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i += 4) {
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
    <section id="hero-section" className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#590007]">
      {/* Background Canvas */}
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
          className="absolute z-50 w-32 h-32 rounded-full bg-white shadow-[0_0_120px_#FFFFFF]"
        />
      )}

      {/* Main Hero Card Container */}
      <div className="relative z-20 text-center max-w-4xl px-4 flex flex-col items-center">
        {/* Animated Spider Logo Container */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 flex items-center justify-center"
        >
          {/* Pulsing Spider-Sense Aura Ring */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-white/40 shadow-[0_0_80px_rgba(255,255,255,0.6)]"
          />

          {/* User Uploaded Spider Logo */}
          <motion.img
            src="/spider_logo_clean_white.png"
            alt="Spider Logo"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-44 sm:w-60 md:w-72 h-auto drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] select-none pointer-events-none relative z-10"
          />
        </motion.div>

        {/* Title & Subtitle Fade In */}
        {showAccessButton && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/40 bg-black/40 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-xs font-mono tracking-widest text-white uppercase font-bold">
                EXPERIÊNCIA CINEMATOGRÁFICA INTERATIVA
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] font-title"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              SPIDER-MAN
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-2 text-base sm:text-2xl font-mono tracking-[0.35em] text-white font-extrabold uppercase text-glow-gold"
            >
              THE EVOLUTION OF THE SUIT
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-4 max-w-xl text-sm sm:text-base text-gray-100 leading-relaxed font-sans font-medium"
            >
              Entre no universo do Homem-Aranha e descubra a evolução tecnológica, 
              origens e habilidades dos trajes em uma jornada cinematográfica.
            </motion.p>

            {/* Primary Access Button */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8"
            >
              <button
                onClick={handleEnterClick}
                className="group relative inline-flex items-center space-x-3 px-10 py-4 rounded-2xl bg-white text-black font-black text-lg sm:text-xl tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.9)] active:scale-95 border-2 border-white cursor-pointer overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-red-600/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 font-sans font-black">ENTRAR NO UNIVERSO</span>
                <svg
                  className="relative z-10 w-6 h-6 group-hover:translate-x-1.5 transition-transform text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* Scroll Indicator */}
      {showAccessButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2 cursor-pointer"
          onClick={() => {
            soundEngine.playClick();
            onEnter();
          }}
        >
          <span className="text-[10px] font-mono tracking-widest text-white/80 uppercase font-bold">
            ROLES PARA NAVEGAR
          </span>
          <div className="w-5 h-9 rounded-full border-2 border-white/60 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-1.5 h-2 rounded-full bg-white"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};
