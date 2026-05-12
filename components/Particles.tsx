"use client";

import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 40 }: ParticlesProps) {
  const dots = useMemo(() => {
    return Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: -Math.random() * 22,
      dur: 18 + Math.random() * 16,
      size: 2 + Math.random() * 2.5,
    }));
  }, [count]);

  return (
    <div className="particles" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
