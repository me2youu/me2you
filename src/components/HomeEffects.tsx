'use client';

import { useEffect, useState, useRef } from 'react';

export default function HomeEffects() {
  const [cursorTrail, setCursorTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  const [isMobile, setIsMobile] = useState(true);
  const trailId = useRef(0);

  useEffect(() => {
    // Check if mobile
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (mobile) return; // No effects on mobile

    // Generate particles (desktop only)
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    // Cursor trail (desktop only, throttled)
    let lastTime = 0;
    const throttleMs = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;

      trailId.current++;
      setCursorTrail(prev => [...prev.slice(-5), { x: e.clientX, y: e.clientY, id: trailId.current }]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Don't render anything on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Cursor Trail */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {cursorTrail.map((point, i) => (
          <div
            key={point.id}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink"
            style={{
              left: point.x - 6,
              top: point.y - 6,
              opacity: (i + 1) / cursorTrail.length * 0.4,
              transform: `scale(${(i + 1) / cursorTrail.length})`,
            }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/20 animate-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
