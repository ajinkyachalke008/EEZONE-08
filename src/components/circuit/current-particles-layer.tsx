'use client';

import React, { useEffect, useState } from 'react';

export interface WireSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  current: number; // in Amperes (can be positive or negative)
}

interface CurrentParticlesLayerProps {
  wires: WireSegment[];
  enabled: boolean;
}

export function CurrentParticlesLayer({ wires, enabled }: CurrentParticlesLayerProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let animationFrameId: number;

    const animate = () => {
      setPhase((prev) => (prev + 1) % 1000);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [enabled]);

  if (!enabled || wires.length === 0) return null;

  return (
    <g className="current-particles-layer pointer-events-none select-none">
      {wires.map((wire) => {
        const dx = wire.x2 - wire.x1;
        const dy = wire.y2 - wire.y1;
        const length = Math.hypot(dx, dy);
        if (length < 5) return null;

        // Current magnitude drives velocity and particle count
        const currentMag = Math.abs(wire.current);
        if (currentMag < 0.0001) return null; // No current flow

        const speed = Math.min(6, Math.max(0.8, currentMag * 10)); // Speed factor
        const isForward = wire.current >= 0;
        const particleSpacing = 28; // px between particles
        const numParticles = Math.max(1, Math.floor(length / particleSpacing));

        const particles = Array.from({ length: numParticles }).map((_, idx) => {
          // Calculate offset along wire
          const baseOffset = (idx * particleSpacing) / length;
          const motionOffset = ((phase * speed) / 100) % 1;
          const t = isForward
            ? (baseOffset + motionOffset) % 1
            : (baseOffset - motionOffset + 1) % 1;

          const px = wire.x1 + dx * t;
          const py = wire.y1 + dy * t;

          return { px, py, key: `${wire.id}_${idx}` };
        });

        return (
          <g key={wire.id}>
            {/* Subtle current path halo */}
            <line
              x1={wire.x1}
              y1={wire.y1}
              x2={wire.x2}
              y2={wire.y2}
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="4,4"
            />

            {/* Glowing moving electron particles */}
            {particles.map((p) => (
              <circle
                key={p.key}
                cx={p.px}
                cy={p.py}
                r="2.5"
                fill="#FEF08A"
                stroke="#F59E0B"
                strokeWidth="1"
                className="filter drop-shadow-[0_0_6px_#FBBF24]"
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}
