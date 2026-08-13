import React, { useEffect, useRef } from 'react';
import type { Suit } from '../types/suit';

interface SuitCanvasVisualProps {
  suit: Suit;
  isInspecting?: boolean;
  rotationAngle?: number;
  showBackView?: boolean;
  activeHotspotId?: string | null;
  onHotspotClick?: (hotspotId: string) => void;
  fpsCap?: number;
}

export const SuitCanvasVisual: React.FC<SuitCanvasVisualProps> = ({
  suit,
  isInspecting = false,
  rotationAngle = 0,
  showBackView = false,
  activeHotspotId = null,
  onHotspotClick,
  fpsCap = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load cropped suit image if provided
  useEffect(() => {
    if (suit.imageUrl) {
      const img = new Image();
      img.src = suit.imageUrl;
      img.onload = () => {
        imgRef.current = img;
      };
    } else {
      imgRef.current = null;
    }
  }, [suit.imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    let time = 0;
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      const interval = 1000 / fpsCap;
      const delta = now - lastFrameTime;

      if (delta >= interval) {
        lastFrameTime = now - (delta % interval);
        time += 0.03;
        ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Radial Glow Aura Background
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        width * 0.45
      );
      radialGlow.addColorStop(0, suit.glowColor || 'rgba(229,9,20,0.6)');
      radialGlow.addColorStop(0.5, 'rgba(10, 14, 23, 0.4)');
      radialGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Sci-Fi Hexagonal Web Grid Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.1);
      ctx.strokeStyle = suit.primaryColor || '#E50914';
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1;
      for (let r = 80; r <= 220; r += 45) {
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

      // 3. Render Suit Image (or Vector Fallback)
      ctx.save();
      const floatY = Math.sin(time) * 6;
      ctx.translate(centerX, centerY + floatY);

      const rad = (rotationAngle * Math.PI) / 180;
      const scaleX = Math.cos(rad);

      ctx.scale(scaleX * (isInspecting ? 1.15 : 1), isInspecting ? 1.15 : 1);

      if (imgRef.current && imgRef.current.complete) {
        const img = imgRef.current;
        const targetH = height * 0.72;
        const aspect = img.width / img.height;
        const targetW = targetH * aspect;

        ctx.shadowColor = suit.glowColor || 'rgba(229,9,20,0.8)';
        ctx.shadowBlur = 25;

        // Draw cropped suit render cleanly inside frame
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.shadowBlur = 0;
      } else {
        // High-Tech Holographic Spider Blueprint (No red mannequin body)
        ctx.save();
        ctx.shadowColor = suit.glowColor || 'rgba(0,240,255,0.8)';
        ctx.shadowBlur = 20;

        // Glowing Spider Symbol Outline
        ctx.strokeStyle = suit.primaryColor || '#00F0FF';
        ctx.lineWidth = 3;

        // Spider Head & Thorax
        ctx.beginPath();
        ctx.arc(0, -20, 14, 0, Math.PI * 2);
        ctx.arc(0, 15, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Spider Legs
        const drawLeg = (sx: number, sy: number, ex1: number, ey1: number, ex2: number, ey2: number) => {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex1, ey1);
          ctx.lineTo(ex2, ey2);
          ctx.stroke();
        };

        // Top legs
        drawLeg(10, -25, 45, -60, 65, -90);
        drawLeg(-10, -25, -45, -60, -65, -90);
        drawLeg(12, -15, 55, -40, 75, -55);
        drawLeg(-12, -15, -55, -40, -75, -55);

        // Bottom legs
        drawLeg(14, 10, 60, 30, 70, 70);
        drawLeg(-14, 10, -60, 30, -70, 70);
        drawLeg(12, 25, 45, 60, 55, 100);
        drawLeg(-12, 25, -45, 60, -55, 100);

        // Animated Laser Scanline
        const scanY = Math.sin(time * 2) * 110;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-100, scanY);
        ctx.lineTo(100, scanY);
        ctx.stroke();

        // Hologram HUD Text
        ctx.shadowBlur = 0;
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('HOLOGRAPHIC // SUIT BLUEPRINT', 0, 140);
        ctx.restore();
      }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [suit, isInspecting, rotationAngle, showBackView, fpsCap]);

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[500px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full max-w-md max-h-[550px]" />

      {/* Render Hotspot Markers if Inspecting */}
      {isInspecting &&
        suit.hotspots.map((hotspot) => {
          const isActive = activeHotspotId === hotspot.id;
          return (
            <button
              key={hotspot.id}
              onClick={() => onHotspotClick && onHotspotClick(hotspot.id)}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group z-30 cursor-pointer flex items-center justify-center`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                  isActive
                    ? 'border-yellow-400 bg-yellow-400/30 scale-125 shadow-[0_0_20px_#FFD700]'
                    : 'border-red-500 bg-red-600/40 hover:scale-110 hover:border-white shadow-[0_0_12px_rgba(229,9,20,0.8)]'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              {/* Tooltip Label */}
              <span className="absolute top-10 whitespace-nowrap px-2 py-0.5 rounded bg-black/90 text-[10px] font-mono tracking-widest text-white border border-red-500/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                [{hotspot.label}]
              </span>
            </button>
          );
        })}
    </div>
  );
};
