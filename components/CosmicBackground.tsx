"use client";

import { useEffect, useRef, useState } from "react";

const SYNODIC_MONTH = 29.53059;
const KNOWN_NEW_MOON_JD = 2451550.26;
const UNIX_EPOCH_JD = 2440587.5;

function computeMoonFraction(): number {
  const days = Date.now() / 86_400_000 + UNIX_EPOCH_JD - KNOWN_NEW_MOON_JD;
  const cycle = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  return cycle / SYNODIC_MONTH;
}

const SHADOW_FILL = "rgba(10, 14, 26, 0.88)";

function MoonShape({ fraction }: { fraction: number }) {
  if (fraction < 0.03 || fraction >= 0.97) {
    return <circle cx={35} cy={35} r={32} fill="#E8D5A3" opacity={0.05} />;
  }

  if (fraction >= 0.48 && fraction <= 0.52) {
    return <circle cx={35} cy={35} r={32} fill="#E8D5A3" />;
  }

  const angle = fraction * 2 * Math.PI;
  const illumination = (1 - Math.cos(angle)) / 2;
  const delta = illumination * 64;
  const isWaxing = fraction < 0.5;
  const shadowCx = isWaxing ? 35 - delta : 35 + delta;

  return (
    <>
      <defs>
        <clipPath id="cosmic-moon-disc">
          <circle cx={35} cy={35} r={32} />
        </clipPath>
      </defs>
      <circle cx={35} cy={35} r={32} fill="#E8D5A3" />
      <circle
        cx={shadowCx}
        cy={35}
        r={32}
        fill={SHADOW_FILL}
        clipPath="url(#cosmic-moon-disc)"
      />
    </>
  );
}

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  age: number;
  lifespan: number;
};

const STAR_COUNT = 150;
const SHOOTER_RGB = "201, 169, 110";

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [moonFraction, setMoonFraction] = useState<number | null>(null);

  useEffect(() => {
    setMoonFraction(computeMoonFraction());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let stars: Star[] = [];
    let shooters: Shooter[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId: number | null = null;
    let running = true;
    let startTime = performance.now();
    let nextShooterAt = startTime + randMs(3000, 8000);

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }
    function randMs(min: number, max: number) {
      return Math.floor(rand(min, max));
    }

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      generateStars();
    }

    function generateStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.5, 2),
          baseAlpha: rand(0.3, 1.0),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: rand(0.001, 0.004),
        });
      }
    }

    function spawnShooter() {
      const x = Math.random() * (width * 0.4);
      const y = Math.random() * (height * 0.3);
      const angle = rand(25, 35) * (Math.PI / 180);
      const speed = rand(7, 11);
      shooters.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: rand(80, 130),
        age: 0,
        lifespan: Math.floor(rand(50, 70)),
      });
    }

    function drawFrame(now: number, elapsedMs: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const twinkle =
          0.55 + 0.45 * Math.sin(elapsedMs * s.twinkleSpeed + s.twinklePhase);
        const alpha = Math.min(1, s.baseAlpha * twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      if (now >= nextShooterAt) {
        spawnShooter();
        nextShooterAt = now + randMs(3000, 8000);
      }

      for (let i = shooters.length - 1; i >= 0; i -= 1) {
        const s = shooters[i];
        s.x += s.vx;
        s.y += s.vy;
        s.age += 1;

        if (s.age >= s.lifespan || s.x > width + 50 || s.y > height + 50) {
          shooters.splice(i, 1);
          continue;
        }

        const fadeIn = 6;
        let lifeAlpha: number;
        if (s.age < fadeIn) {
          lifeAlpha = s.age / fadeIn;
        } else {
          lifeAlpha = 1 - (s.age - fadeIn) / (s.lifespan - fadeIn);
        }
        lifeAlpha = Math.max(0, Math.min(1, lifeAlpha));

        const speed = Math.hypot(s.vx, s.vy);
        const tailX = s.x - (s.vx / speed) * s.length;
        const tailY = s.y - (s.vy / speed) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${SHOOTER_RGB}, ${lifeAlpha})`);
        grad.addColorStop(1, `rgba(${SHOOTER_RGB}, 0)`);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    function loop(now: number) {
      if (!running) return;
      drawFrame(now, now - startTime);
      rafId = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!reduceMotion && rafId === null) {
        running = true;
        startTime = performance.now();
        nextShooterAt = startTime + randMs(3000, 8000);
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();

    if (reduceMotion) {
      drawFrame(performance.now(), 0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      {moonFraction !== null ? (
        <svg
          className="cosmic-moon"
          width="70"
          height="70"
          viewBox="0 0 70 70"
          aria-hidden="true"
          focusable="false"
        >
          <MoonShape fraction={moonFraction} />
        </svg>
      ) : null}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  );
}
