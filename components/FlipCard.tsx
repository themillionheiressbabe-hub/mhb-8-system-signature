"use client";

import { useState } from "react";
import CardArt from "./CardArt";

interface FlipCardProps {
  value: string;
  suit: string;
  cardName: string;
  coreTheme: string;
  dailyEnergyHeading: string;
  dailyEnergyBody: string;
  dailyEnergyCta: string;
  todayCardCode: string;
  hideBackLink?: boolean;
}

export default function FlipCard({
  value,
  suit,
  cardName,
  coreTheme,
  dailyEnergyHeading,
  dailyEnergyBody,
  dailyEnergyCta,
  hideBackLink = false,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const firstThreeSentences = dailyEnergyBody
    .split(/(?<=[.!?])\s+/)
    .slice(0, 3)
    .join(" ");

  const sentences = dailyEnergyBody
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: "1000px",
        cursor: "pointer",
        width: "100%",
        minHeight: "320px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "320px",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="bg-[#0D1220] border border-gold/20 rounded-2xl p-6 flex flex-col"
        >
          <p className="text-gold/60 text-xs uppercase tracking-widest mb-4">
            TODAY&rsquo;S COLLECTIVE CARD
          </p>
          <div className="flex items-center gap-6 flex-1">
            <CardArt value={value} suit={suit} size="sm" />
            <div className="flex-1">
              <p className="font-serif italic text-white text-xl leading-tight mb-1">
                {cardName}
              </p>
              {coreTheme ? (
                <p className="text-gold italic text-sm mb-3">{coreTheme}</p>
              ) : null}
              <p className="text-white/70 text-sm leading-relaxed">
                {firstThreeSentences}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gold/10 flex items-center justify-between">
            <p className="text-white/40 text-xs">
              Click to reveal the full energy read
            </p>
            <span className="text-gold/60 text-xs">↻</span>
          </div>
        </div>

        {/* BACK */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="bg-[#0D1220] border border-gold/20 rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-gold/60 text-xs uppercase tracking-widest">
              FULL ENERGY READ
            </p>
            <span className="text-white/40 text-xs">Click to flip back</span>
          </div>
          {dailyEnergyHeading ? (
            <p className="font-serif italic text-white text-lg leading-tight mb-2">
              {dailyEnergyHeading}
            </p>
          ) : null}
          <div className="flex-1 overflow-hidden">
            {sentences.map((sentence, i) => (
              <p
                key={i}
                className="text-white/80 text-sm leading-relaxed mb-2"
              >
                {sentence}
              </p>
            ))}
          </div>
          {dailyEnergyCta ? (
            <div className="mt-4 pt-4 border-t border-gold/10">
              <p className="text-gold/70 text-xs uppercase tracking-widest">
                {dailyEnergyCta}
              </p>
            </div>
          ) : null}
          {hideBackLink ? null : (
            <a
              href="/tools/daily-frequency"
              onClick={(e) => e.stopPropagation()}
              className="mt-4 block text-center text-xs text-gold/60 hover:text-gold transition-colors"
            >
              See today&rsquo;s full read &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
