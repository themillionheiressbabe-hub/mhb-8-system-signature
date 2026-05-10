"use client";
import { useEffect, useRef } from "react";

type MoonPhase =
  | "Full Moon"
  | "Waxing Gibbous"
  | "First Quarter"
  | "Waxing Crescent"
  | "New Moon"
  | "Waning Crescent"
  | "Third Quarter"
  | "Waning Gibbous";

interface RealisticMoonProps {
  phase: string;
  size?: number;
}

const phaseCoords: Record<MoonPhase, { sx: number; sy: number; sw: number }> = {
  "Full Moon": { sx: 0, sy: 350, sw: 280 },
  "Waxing Gibbous": { sx: 90, sy: 90, sw: 250 },
  "First Quarter": { sx: 370, sy: 0, sw: 240 },
  "Waxing Crescent": { sx: 660, sy: 80, sw: 220 },
  "New Moon": { sx: 780, sy: 370, sw: 240 },
  "Waning Crescent": { sx: 680, sy: 660, sw: 220 },
  "Third Quarter": { sx: 370, sy: 770, sw: 240 },
  "Waning Gibbous": { sx: 60, sy: 660, sw: 250 },
};

function normalisePhaseName(raw: string): MoonPhase {
  const map: Record<string, MoonPhase> = {
    full: "Full Moon",
    "full moon": "Full Moon",
    "waxing gibbous": "Waxing Gibbous",
    "first quarter": "First Quarter",
    "waxing crescent": "Waxing Crescent",
    new: "New Moon",
    "new moon": "New Moon",
    "waning crescent": "Waning Crescent",
    "third quarter": "Third Quarter",
    "last quarter": "Third Quarter",
    "waning gibbous": "Waning Gibbous",
    disseminating: "Waning Gibbous",
  };
  return map[raw.toLowerCase()] ?? "Full Moon";
}

export default function RealisticMoon({
  phase,
  size = 140,
}: RealisticMoonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const normalisedPhase = normalisePhaseName(phase);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.src = "/images/moon_phases.jpg";
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const { sx, sy, sw } = phaseCoords[normalisedPhase];
      ctx.drawImage(img, sx, sy, sw, sw, 0, 0, size, size);

      ctx.restore();
    };
  }, [phase, size, normalisedPhase]);

  return (
    <div
      style={{
        position: "fixed",
        top: "8%",
        right: "6%",
        zIndex: 10,
        pointerEvents: "none",
        filter: "drop-shadow(0 0 20px rgba(255,248,220,0.6))",
        width: size,
        height: size,
      }}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
}
