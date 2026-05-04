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

interface Props {
  planets: Planet[];
  numerologyMeaning: string;
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

const SIGN_MODALITY = [
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable",
];

const ELEMENT_HEADLINE: Record<string, string> = {
  fire: "The sky is running hot today. Action, will, and initiation are the themes.",
  earth: "The sky is grounded today. What is practical, tangible, and real is what matters.",
  air: "The sky is mental today. Communication, ideas, and connection are in the air.",
  water: "The sky is deep today. Emotional undercurrents are running strong.",
};

const MODALITY_HEADLINE: Record<string, string> = {
  cardinal: "The energy today is initiating. Something wants to begin.",
  fixed: "The energy today is holding steady. Persistence is the move.",
  mutable: "The energy today is shifting. Stay flexible.",
};

function countByGroup(
  planets: Planet[],
  groups: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of planets) {
    const idx = SIGNS.indexOf(p.sign);
    if (idx === -1) continue;
    const key = groups[idx];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function getBaseHeadline(planets: Planet[]): string {
  const elements = countByGroup(planets, SIGN_ELEMENT);
  const modalities = countByGroup(planets, SIGN_MODALITY);
  const eEntries = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  const mEntries = Object.entries(modalities).sort((a, b) => b[1] - a[1]);
  if (eEntries[0] && eEntries[0][1] >= 5) {
    return ELEMENT_HEADLINE[eEntries[0][0]];
  }
  if (mEntries[0] && mEntries[0][1] >= 5) {
    return MODALITY_HEADLINE[mEntries[0][0]];
  }
  return "The sky is active today. Multiple energies are running simultaneously.";
}

function appendNumerologyHook(meaning: string): string {
  if (meaning.includes("New starts") || meaning.includes("initiation")) {
    return "Today wants a beginning.";
  }
  if (
    meaning.includes("reflection") ||
    meaning.includes("Truth") ||
    meaning.includes("inner")
  ) {
    return "The invitation is inward, not outward.";
  }
  if (meaning.includes("Foundation") || meaning.includes("Build")) {
    return "What you put down today holds weight.";
  }
  if (meaning.includes("Change") || meaning.includes("shift")) {
    return "Expect movement.";
  }
  if (meaning.includes("completion") || meaning.includes("Completion")) {
    return "Something is finishing.";
  }
  if (meaning.includes("Partnership") || meaning.includes("tending")) {
    return "Connection is the work today.";
  }
  if (meaning.includes("Expression") || meaning.includes("voice")) {
    return "Say the thing.";
  }
  if (meaning.includes("Responsibility")) {
    return "Show up for what matters.";
  }
  if (meaning.includes("Power") || meaning.includes("compounds")) {
    return "What you direct your energy toward today compounds.";
  }
  return "";
}

function getHeadline(planets: Planet[], numerologyMeaning: string): string {
  const base = getBaseHeadline(planets);
  const add = appendNumerologyHook(numerologyMeaning);
  return add ? `${base} ${add}` : base;
}

function getRetroAlertPlanet(planets: Planet[]): string | null {
  for (const name of ["Mercury", "Venus", "Mars"]) {
    const p = planets.find((x) => x.name === name);
    if (p?.isRetrograde) return name;
  }
  return null;
}

type TooltipState = {
  planet: string;
  sign: string;
  colour: string;
  x: number;
  y: number;
};

export default function TransitInsights({ planets, numerologyMeaning }: Props) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const headline = getHeadline(planets, numerologyMeaning);
  const retroAlert = getRetroAlertPlanet(planets);

  function showTooltip(
    e: React.MouseEvent<HTMLDivElement>,
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
    <div ref={containerRef} className="relative flex flex-col gap-4">
      {/* Insight box */}
      <div className="bg-navy-card border border-gold/30 rounded-xl p-5">
        <p className="text-gold uppercase text-xs tracking-widest">
          TODAY&rsquo;S SKY
        </p>
        <p className="serif-it text-white text-lg leading-relaxed mt-2">
          {headline}
        </p>
      </div>

      {/* Retrograde alert pill */}
      {retroAlert ? (
        <div className="flex">
          <span className="inline-flex items-center bg-bg/40 border border-gold/40 text-magenta text-sm rounded-full px-4 py-1.5">
            ⟲ {retroAlert} Retrograde
          </span>
        </div>
      ) : null}

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full border border-gold/40 text-gold rounded-xl py-3 text-sm hover:border-gold hover:text-gold-bright transition-colors"
      >
        {expanded ? "Hide full planet data ↑" : "See full planet data ↓"}
      </button>

      {/* Planet table */}
      {expanded ? (
        <div className="flex flex-col">
          {planets.map((p, i) => (
            <div
              key={p.name}
              onMouseEnter={(e) => showTooltip(e, p.name, p.sign, p.colour)}
              onMouseLeave={hideTooltip}
              className={`flex items-center gap-3 py-3 cursor-default ${i === 0 ? "" : "border-t border-gold/10"}`}
            >
              <span
                className="text-lg w-6 text-center"
                style={{ color: p.colour }}
              >
                {p.symbol}
              </span>
              <span className="text-white text-sm font-medium flex-1">
                {p.name}
              </span>
              <span className="text-gold italic text-sm">{p.sign}</span>
              <span className="text-white/50 text-xs w-14 text-right">
                {`${p.degree}°${String(p.minutes).padStart(2, "0")}′`}
              </span>
              <span className="w-4 text-right">
                {p.isRetrograde ? (
                  <span className="text-magenta text-xs">℞</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ) : null}

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
