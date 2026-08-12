import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Pause } from 'lucide-react';
import { soundEngine } from '../services/audioService';

export const CitySwingScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Perspective Metallic Skyscraper Pillars
    const numBuildings = 40;
    const buildings: {
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      accentColor: string;
    }[] = [];

    const fov = 400;
    const vanishingX = width / 2;
    const vanishingY = height * 0.45;

    for (let i = 0; i < numBuildings; i++) {
      buildings.push({
        x: (Math.random() - 0.5) * 1800,
        y: Math.random() * 150,
        z: 300 + Math.random() * 2600,
        width: 100 + Math.random() * 140,
        height: 400 + Math.random() * 700,
        accentColor: Math.random() > 0.6 ? 'rgba(229, 9, 20, 0.4)' : 'rgba(0, 240, 255, 0.4)'
      });
    }

    // Speed particles
    const streaks: { x: number; y: number; z: number; speed: number }[] = [];
    for (let s = 0; s < 100; s++) {
      streaks.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 2000,
        speed: 20 + Math.random() * 30
      });
    }

    let swingPhase = 0;

    const render = () => {
      if (isPlaying) {
        swingPhase += 0.035 * speed;
      }
      ctx.clearRect(0, 0, width, height);

      // Deep Midnight Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#030407');
      skyGrad.addColorStop(0.6, '#080C16');
      skyGrad.addColorStop(1, '#1A0612');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Camera Tilt & Swing Motion
      const camYOffset = Math.sin(swingPhase * 2) * 35;
      const camTilt = Math.cos(swingPhase) * 0.06;

      ctx.save();
      ctx.translate(vanishingX, vanishingY + camYOffset);
      ctx.rotate(camTilt);

      // Render Skyscrapers
      buildings.sort((a, b) => b.z - a.z);

      buildings.forEach((b) => {
        if (isPlaying) {
          b.z -= 22 * speed;
          if (b.z < 60) {
            b.z = 2600;
            b.x = (Math.random() - 0.5) * 1800;
          }
        }

        const scale = fov / b.z;
        const projX = b.x * scale;
        const projY = b.y * scale;
        const projW = b.width * scale;
        const projH = b.height * scale;

        // Building Silhouette & Edge Glow
        ctx.fillStyle = '#060810';
        ctx.fillRect(projX - projW / 2, projY, projW, projH);

        ctx.strokeStyle = b.accentColor;
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.strokeRect(projX - projW / 2, projY, projW, projH);
      });

      // Render Speed Lines
      streaks.forEach((st) => {
        if (isPlaying) {
          st.z -= st.speed * speed;
          if (st.z < 10) {
            st.z = 2000;
          }
        }
        const scale = fov / st.z;
        const sx = st.x * scale;
        const sy = st.y * scale;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = Math.max(0.5, 2 * scale);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + 30 * scale);
        ctx.stroke();
      });

      // Web Line Shooting Frame Effect
      const webPulse = Math.sin(swingPhase * 4);
      if (webPulse > 0.75) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(-width * 0.4, height * 0.4);
        ctx.lineTo(120, -180);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, speed]);

  return (
    <section id="swing-section" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-500/40 text-red-400 text-xs font-mono tracking-widest uppercase"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>SIMULADOR 3D INTERATIVO</span>
        </motion.div>

        <h2 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-wider text-white text-glow-red font-sans">
          SWING THROUGH THE CITY
        </h2>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Sinta a aceleração e velocidade de balançar entre os prédios de Nova York em alta velocidade.
        </p>
      </div>

      {/* 3D Action Stage */}
      <div className="relative w-full h-[450px] sm:h-[550px] rounded-3xl glass-panel-glow border border-red-500/40 overflow-hidden flex items-center justify-center shadow-[0_0_60px_rgba(229,9,20,0.3)]">
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Speedometer Overlay */}
        <div className="absolute top-6 left-6 z-20 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block">
            VELOCIDADE DE NAVEGAÇÃO
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-extrabold font-mono text-white">
              {(speed * 88).toFixed(0)} <span className="text-xs text-red-500">MPH</span>
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer shadow-[0_0_15px_#E50914]"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono text-gray-300 hidden sm:inline uppercase">
              {isPlaying ? 'BALANÇANDO EM TEMPO REAL' : 'PAUSADO'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-400 hidden md:inline">BOOST:</span>
            {[1, 1.8, 2.5].map((sLevel) => (
              <button
                key={sLevel}
                onClick={() => {
                  soundEngine.playClick();
                  setSpeed(sLevel);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  speed === sLevel
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_#00F0FF]'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {sLevel === 1 ? 'NORMAL' : sLevel === 1.8 ? 'TURBO' : 'NITRO'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
