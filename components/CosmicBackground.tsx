"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Layer = 1 | 2 | 3;

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: "white" | "gold";
  vx: number;
  vy: number;
  layer: Layer;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  length: number;
  age: number;
  lifespan: number;
  color: "gold" | "magenta";
};

const COLORS = {
  white: "255, 255, 255",
  gold: "232, 201, 136",
  magenta: "214, 63, 126",
  hot: "255, 248, 220",
};

const MAX_SHOOTERS = 4;
const SHOOTER_BASE_PROBABILITY = 0.0035;

const twinkleSpeed = (periodSec: number) => (Math.PI * 2) / (periodSec * 1000);

type CosmicBackgroundProps = {
  /** Multiplier on per-star opacity. 0–2, default 1. */
  starDensity?: number;
  /** Multiplier on the html nebula gradient opacities. 0–2.5, default 1. */
  nebulaIntensity?: number;
  /** Multiplier on shooting-star spawn probability. 0–3, default 1. 0 disables them. */
  shootingFrequency?: number;
};

export function CosmicBackground({
  starDensity = 1,
  nebulaIntensity = 1,
  shootingFrequency = 1,
}: CosmicBackgroundProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  // Refs for live-tweakable knobs the loop reads each frame
  const densityRef = useRef(starDensity);
  densityRef.current = starDensity;
  const shootingFreqRef = useRef(shootingFrequency);
  shootingFreqRef.current = shootingFrequency;
  const isHomepageRef = useRef(pathname === "/");
  isHomepageRef.current = pathname === "/";

  // Re-write the html nebula gradient opacities when nebulaIntensity changes
  useEffect(() => {
    const m = nebulaIntensity;
    const root = document.documentElement;
    const original = root.style.backgroundImage;
    root.style.backgroundImage = [
      `radial-gradient(ellipse at 85% 15%, rgba(181, 30, 90, ${0.15 * m}) 0%, transparent 60%)`,
      `radial-gradient(ellipse at 15% 85%, rgba(167, 139, 250, ${0.12 * m}) 0%, transparent 60%)`,
      `radial-gradient(ellipse at 50% 50%, rgba(201, 169, 110, ${0.08 * m}) 0%, transparent 70%)`,
    ].join(", ");
    return () => {
      root.style.backgroundImage = original;
    };
  }, [nebulaIntensity]);

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

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
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
      const total = Math.max(40, Math.floor((width * height) / 9000));
      const layer1Count = Math.floor(total * 0.4);
      const layer2Count = Math.floor(total * 0.35);
      const layer3Count = total - layer1Count - layer2Count;

      stars = [];

      for (let i = 0; i < layer1Count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.6, 1.0),
          baseAlpha: rand(0.35, 0.85),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: twinkleSpeed(3),
          color: "white",
          vx: 0.01,
          vy: 0.04,
          layer: 1,
        });
      }
      for (let i = 0; i < layer2Count; i++) {
        const isGold = Math.random() < 0.5;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1.0, 1.6),
          baseAlpha: rand(0.35, 0.85),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: twinkleSpeed(5),
          color: isGold ? "gold" : "white",
          vx: 0.025,
          vy: 0.1,
          layer: 2,
        });
      }
      for (let i = 0; i < layer3Count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1.6, 2.4),
          baseAlpha: rand(0.35, 0.85),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: twinkleSpeed(7),
          color: "white",
          vx: 0.05,
          vy: 0.18,
          layer: 3,
        });
      }
    }

    function spawnShooter() {
      if (shooters.length >= MAX_SHOOTERS) return;

      // Origin in top-left quadrant (x ∈ [0, w*0.5], y ∈ [0, h*0.4])
      let x = Math.random() * (width * 0.5);
      let y = Math.random() * (height * 0.4);

      // Dead-zone re-roll on the homepage so shooters do not slice through
      // the centred Orbit (centre 400×400 box).
      if (isHomepageRef.current) {
        const inDead =
          x >= width / 2 - 200 &&
          x <= width / 2 + 200 &&
          y >= height / 2 - 200 &&
          y <= height / 2 + 200;
        if (inDead) {
          x = Math.random() * (width * 0.5);
          y = Math.random() * (height * 0.4);
        }
      }

      const angle = rand(25, 35) * (Math.PI / 180);
      const speed = rand(7, 11);
      const length = rand(90, 140);
      const lifespan = Math.floor(rand(45, 65));
      const color = Math.random() < 0.15 ? "magenta" : "gold";

      shooters.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        speed,
        length,
        age: 0,
        lifespan,
        color,
      });
    }

    function drawFrame(elapsedMs: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const density = densityRef.current;

      // Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x > width + 5) s.x = -5;
        else if (s.x < -5) s.x = width + 5;
        if (s.y > height + 5) s.y = -5;
        else if (s.y < -5) s.y = height + 5;

        const twinkle =
          0.55 + 0.45 * Math.sin(elapsedMs * s.twinkleSpeed + s.twinklePhase);
        const alpha = Math.min(1, s.baseAlpha * twinkle * density);
        const rgb = s.color === "gold" ? COLORS.gold : COLORS.white;

        if (s.layer >= 2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${0.15 * alpha})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fill();
      }

      // Shooting stars
      const spawnP = SHOOTER_BASE_PROBABILITY * shootingFreqRef.current;
      if (spawnP > 0 && Math.random() < spawnP) {
        spawnShooter();
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
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

        const tailX = s.x - s.vx * (s.length / s.speed);
        const tailY = s.y - s.vy * (s.length / s.speed);
        const rgb = s.color === "magenta" ? COLORS.magenta : COLORS.gold;

        // Wide soft halo trail underneath
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = `rgba(${rgb}, ${lifeAlpha * 0.15})`;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Main trail with gradient head → tail
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${rgb}, ${lifeAlpha})`);
        grad.addColorStop(0.4, `rgba(${rgb}, ${lifeAlpha * 0.5})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.stroke();

        // White-hot tip dot at the head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS.hot}, ${lifeAlpha})`;
        ctx.fill();
      }
    }

    function loop(now: number) {
      if (!running) return;
      drawFrame(now - startTime);
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
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();

    if (reduceMotion) {
      drawFrame(0);
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
