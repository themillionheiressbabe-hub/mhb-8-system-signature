"use client";
import { useEffect, useRef } from "react";

interface RealisticMoonProps {
  phase: string;
  illumination: number;
  size?: number;
}

export default function RealisticMoon({
  phase,
  illumination,
  size = 140,
}: RealisticMoonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Map phase name to sprite position in moon_phases.jpg
    // Reference image has 8 phases arranged in a circle (clockwise from top):
    // Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon,
    // Waning Gibbous, Third Quarter, Waning Crescent, New Moon
    const phaseMap: Record<string, { col: number; row: number }> = {
      "New Moon": { col: 1, row: 1 },
      "Waxing Crescent": { col: 2, row: 0 },
      "First Quarter": { col: 3, row: 0 },
      "Waxing Gibbous": { col: 0, row: 0 },
      "Full Moon": { col: 0, row: 1 },
      "Waning Gibbous": { col: 0, row: 2 },
      "Third Quarter": { col: 1, row: 2 },
      "Last Quarter": { col: 1, row: 2 },
      "Waning Crescent": { col: 2, row: 2 },
      Disseminating: { col: 0, row: 2 },
    };
    void phaseMap;

    // Use the Canvas approach with the image as a texture: load the image,
    // clip to a circle, apply phase shadow overlay.
    const img = new Image();
    img.src = "/images/moon_phases.jpg";
    img.onload = () => {
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 6;

      ctx.clearRect(0, 0, size, size);

      // Outer glow
      ctx.save();
      ctx.shadowColor = "rgba(232,213,163,0.5)";
      ctx.shadowBlur = 24;

      // Clip to circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // The reference image shows the 8 phases. Use the Full Moon portion as
      // the base texture (full moon is at bottom-left area, approximately at
      // 12% from left, 62% from top). Adjust if the crop is off.
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      const moonX = imgW * 0.12;
      const moonY = imgH * 0.62;
      const moonSize = imgW * 0.18;

      ctx.drawImage(img, moonX, moonY, moonSize, moonSize, 0, 0, size, size);

      ctx.restore();

      // Phase shadow overlay
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const isWaxing = phase.includes("Waxing") || phase === "New Moon";
      const illum = illumination / 100;
      const shadowRx = r * Math.abs(1 - 2 * illum);

      ctx.fillStyle = "rgba(6,9,20,0.92)";

      if (illumination <= 2) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (illumination >= 98) {
        // Full moon, no shadow
      } else if (isWaxing) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          shadowRx,
          r,
          0,
          Math.PI / 2,
          (3 * Math.PI) / 2,
          illum < 0.5,
        );
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          shadowRx,
          r,
          0,
          -Math.PI / 2,
          Math.PI / 2,
          illum > 0.5,
        );
        ctx.closePath();
        ctx.fill();
      }

      // Dark side, faint visibility
      ctx.fillStyle = "rgba(20,30,60,0.4)";
      if (isWaxing && illumination > 2 && illumination < 98) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
        ctx.closePath();
        ctx.fill();
      } else if (!isWaxing && illumination > 2 && illumination < 98) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Rim highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const rim = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r);
      rim.addColorStop(0, "rgba(255,255,255,0)");
      rim.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
  }, [phase, illumination, size]);

  return (
    <div
      style={{
        position: "fixed",
        top: "8%",
        right: "6%",
        zIndex: 10,
        pointerEvents: "none",
        filter: "drop-shadow(0 0 20px rgba(232,213,163,0.4))",
        width: size,
        height: size,
      }}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
}
