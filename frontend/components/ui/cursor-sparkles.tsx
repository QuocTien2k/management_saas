'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

type Sparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  color: string;
};

const COLORS = [
  '#60A5FA', // blue-400
  '#38BDF8', // sky-400
  '#A78BFA', // violet-400
  '#C4B5FD', // violet-300
  '#FFFFFF',
];

const MAX_PARTICLES = 30;
const INTERVAL = 32; // ~30 FPS

export const CursorSparkles = () => {
  const [particles, setParticles] = React.useState<Sparkle[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const idRef = React.useRef(0);
  const lastSpawn = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const createParticle = React.useCallback((x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 35;

    const particle: Sparkle = {
      id: idRef.current++,
      x,
      y,
      size: 3 + Math.random() * 4,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setParticles((prev) => {
      const next = [...prev, particle];
      return next.slice(-MAX_PARTICLES);
    });

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particle.id));
    }, 850);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const handleMove = (e: MouseEvent) => {
      const now = performance.now();

      if (now - lastSpawn.current < INTERVAL) return;

      lastSpawn.current = now;

      const count = Math.random() > 0.6 ? 2 : 1;

      for (let i = 0; i < count; i++) {
        createParticle(
          e.clientX + (Math.random() - 0.5) * 10,
          e.clientY + (Math.random() - 0.5) * 10
        );
      }
    };

    window.addEventListener('mousemove', handleMove, { capture: true, passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMove, { capture: true } as any);
    };
  }, [createParticle, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-1 overflow-hidden">
      <style>{`
        @keyframes sparkle-float {
          0% {
            opacity: 1;
            transform: translate(var(--sx), var(--sy)) scale(0.6);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--sx) + var(--dx)), calc(var(--sy) + var(--dy))) scale(1.8);
          }
        }
        .sparkle-dot {
          animation: sparkle-float 0.85s cubic-bezier(0, 0, 0.2, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkle-dot absolute rounded-full"
          style={
            {
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 10px ${p.color}, 0 0 4px ${p.color}`,
              '--sx': `${p.x}px`,
              '--sy': `${p.y}px`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>,
    document.body
  );
};
