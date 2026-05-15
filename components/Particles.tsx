"use client";

import { useEffect, useState } from "react";

interface ParticlesProps {
  count?: number;
}

type Dot = {
  left: number;
  top: number;
  delay: number;
  dur: number;
  size: number;
};

export function Particles({ count = 40 }: ParticlesProps) {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: -Math.random() * 22,
        dur: 18 + Math.random() * 16,
        size: 2 + Math.random() * 2.5,
      })),
    );
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
