"use client";

import { useRef, useState } from "react";
import { PLANET_IN_SIGN_MEANINGS } from "@/lib/astrology/planet-meanings";

interface Planet {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
  colour: string;
  longitude: number;
}

interface TransitWheelProps {
  planets: Planet[];
  moonEmoji: string;
  moonSign: string;
}

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const SIGN_GLYPHS = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];

const SIGN_ELEMENT = [
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water",
];

const ELEMENT_BG: Record<string, string> = {
  fire: "rgba(181, 30, 90, 0.10)",
  earth: "rgba(201, 169, 110, 0.10)",
  air: "rgba(167, 139, 250, 0.10)",
  water: "rgba(45, 155, 110, 0.10)",
};

const ASPECT_PLANETS = new Set([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
]);

type AspectDef = {
  name: string;
  angle: number;
  orb: number;
  color: string;
  opacity: number;
  dasharray?: string;
};

const ASPECT_DEFS: AspectDef[] = [
  { name: "Conjunction", angle: 0, orb: 8, color: "#C9A96E", opacity: 0.4 },
  { name: "Opposition", angle: 180, orb: 8, color: "#B51E5A", opacity: 0.5 },
  { name: "Trine", angle: 120, orb: 6, color: "#2D9B6E", opacity: 0.4 },
  {
    name: "Square",
    angle: 90,
    orb: 6,
    color: "#B51E5A",
    opacity: 0.35,
    dasharray: "4 4",
  },
  {
    name: "Sextile",
    angle: 60,
    orb: 4,
    color: "#C9A96E",
    opacity: 0.3,
    dasharray: "2 4",
  },
];

const STAR_POSITIONS = [
  { x: 90, y: 95 },
  { x: 410, y: 115 },
  { x: 75, y: 380 },
  { x: 420, y: 375 },
  { x: 255, y: 45 },
  { x: 50, y: 240 },
];

const CX = 250;
const CY = 250;

function pointAt(longitude: number, r: number) {
  const svgAngle = 180 - longitude;
  const rad = (svgAngle * Math.PI) / 180;
  // Round to integers. SVG is 500x500 so sub-pixel precision is invisible,
  // and integer values stringify identically on server and client (avoids
  // a hydration mismatch where Math.cos/sin emit different trailing digits
  // in the SSR HTML vs the client-rendered DOM).
  return {
    x: Math.round(CX + r * Math.cos(rad)),
    y: Math.round(CY + r * Math.sin(rad)),
  };
}

function shortestArc(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function classifyAspect(distance: number) {
  for (const a of ASPECT_DEFS) {
    if (Math.abs(distance - a.angle) <= a.orb) return a;
  }
  return null;
}

type DrawnAspect = {
  long1: number;
  long2: number;
  def: AspectDef;
};

function findAspects(planets: Planet[]): DrawnAspect[] {
  const aspectables = planets.filter((p) => ASPECT_PLANETS.has(p.name));
  const out: DrawnAspect[] = [];
  for (let i = 0; i < aspectables.length; i++) {
    for (let j = i + 1; j < aspectables.length; j++) {
      const a = aspectables[i];
      const b = aspectables[j];
      const dist = shortestArc(a.longitude, b.longitude);
      const def = classifyAspect(dist);
      if (def) out.push({ long1: a.longitude, long2: b.longitude, def });
    }
  }
  return out;
}

type TooltipState = {
  planet: string;
  sign: string;
  colour: string;
  x: number;
  y: number;
};

export default function TransitWheel({
  planets,
  moonEmoji,
  moonSign,
}: TransitWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const aspects = findAspects(planets);
  const signCentres = SIGNS.map((_, i) => i * 30 + 15);
  const placed = planets.map((p) => ({
    ...p,
    pos175: pointAt(p.longitude, 175),
  }));

  function showTooltip(
    e: React.MouseEvent<SVGGElement>,
    planet: string,
    sign: string,
    colour: string,
  ) {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      planet,
      sign,
      colour,
      x: targetRect.left + targetRect.width / 2 - containerRect.left,
      y: targetRect.top - containerRect.top,
    });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  const tooltipMeaning =
    tooltip && PLANET_IN_SIGN_MEANINGS[tooltip.planet]?.[tooltip.sign];

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox="0 0 500 500"
        width="100%"
        role="img"
        aria-label="Live transit wheel"
      >
      {STAR_POSITIONS.map((s, i) => (
        <circle
          key={`star-${i}`}
          cx={s.x}
          cy={s.y}
          r={1.5}
          fill="#C9A96E"
          className={`wheel-star-${i}`}
        />
      ))}

      <circle
        cx={CX}
        cy={CY}
        r={238}
        fill="none"
        stroke="#C9A96E"
        strokeWidth={0.5}
        strokeDasharray="3 6"
        opacity={0.5}
        className="wheel-outer-rotation"
      />

      <circle
        cx={CX}
        cy={CY}
        r={230}
        fill="none"
        stroke="#C9A96E"
        strokeWidth={1}
      />
      <circle
        cx={CX}
        cy={CY}
        r={200}
        fill="none"
        stroke="#C9A96E"
        strokeWidth={0.5}
      />

      {SIGNS.map((_, i) => {
        const longitude = i * 30;
        const inner = pointAt(longitude, 200);
        const outer = pointAt(longitude, 230);
        return (
          <line
            key={`seg-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#C9A96E"
            strokeWidth={0.5}
            opacity={0.6}
          />
        );
      })}

      {SIGNS.map((sign, i) => {
        const longitude = signCentres[i];
        const pos = pointAt(longitude, 215);
        return (
          <g key={`sign-${sign}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={9}
              fill={ELEMENT_BG[SIGN_ELEMENT[i]]}
            />
            <text
              x={pos.x}
              y={pos.y}
              fontSize={11}
              fill="#C9A96E"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {aspects.map((a, i) => {
        const p1 = pointAt(a.long1, 140);
        const p2 = pointAt(a.long2, 140);
        return (
          <line
            key={`aspect-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={a.def.color}
            strokeWidth={1}
            opacity={a.def.opacity}
            strokeDasharray={a.def.dasharray}
          />
        );
      })}

      <circle
        cx={CX}
        cy={CY}
        r={60}
        fill="#0A0E1A"
        stroke="#C9A96E"
        strokeWidth={1}
      />
      <text
        x={CX}
        y={CY - 4}
        fontSize={24}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {moonEmoji}
      </text>
      <text
        x={CX}
        y={CY + 22}
        fontSize={11}
        fill="#C9A96E"
        fontStyle="italic"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {moonSign}
      </text>

      {placed.map((p) => (
        <g
          key={`planet-${p.name}`}
          className="wheel-planet-group"
          onMouseEnter={(e) => showTooltip(e, p.name, p.sign, p.colour)}
          onMouseLeave={hideTooltip}
        >
          <title>
            {`${p.name} in ${p.sign} ${p.degree}°${String(p.minutes).padStart(2, "0")}'${p.isRetrograde ? " ℞" : ""}`}
          </title>
          <circle
            cx={p.pos175.x}
            cy={p.pos175.y}
            r={12}
            fill={p.colour}
            fillOpacity={0.15}
            stroke={p.colour}
            strokeWidth={1}
            className="wheel-planet-circle"
          />
          <text
            x={p.pos175.x}
            y={p.pos175.y}
            fontSize={12}
            fill={p.colour}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {p.symbol}
          </text>
          {p.isRetrograde ? (
            <text
              x={p.pos175.x + 10}
              y={p.pos175.y - 9}
              fontSize={9}
              fill="#B51E5A"
              textAnchor="middle"
              dominantBaseline="central"
            >
              ℞
            </text>
          ) : null}
        </g>
      ))}
      </svg>

      {tooltip && tooltipMeaning ? (
        <div
          className="absolute pointer-events-none bg-[#0D1220] border border-gold/40 rounded-xl p-4 max-w-xs z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: tooltip.colour }}
          >
            {tooltip.planet}
          </p>
          <p className="text-gold italic text-xs">{tooltip.sign}</p>
          <p className="text-white/80 text-sm leading-relaxed mt-2">
            {tooltipMeaning}
          </p>
        </div>
      ) : null}
    </div>
  );
}
