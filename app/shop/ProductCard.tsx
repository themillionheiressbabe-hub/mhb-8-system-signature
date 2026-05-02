"use client";

import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  description: string | null;
  priceLabel: string;
  href: string;
  accentColour: string;
  accentRgb: string;
  categoryLabel: string;
  requiresBirthTime?: boolean;
}

export default function ProductCard({
  name,
  description,
  priceLabel,
  href,
  accentColour,
  accentRgb,
  categoryLabel,
  requiresBirthTime,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{
        borderLeft: `4px solid ${accentColour}`,
        boxShadow: hovered
          ? `0 0 24px rgba(${accentRgb},0.35), inset 0 0 24px rgba(${accentRgb},0.05)`
          : "none",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      className="block bg-[#0D1220] border border-gold/15 rounded-2xl p-6 no-underline flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="text-xs uppercase tracking-widest mb-2"
        style={{ color: accentColour }}
      >
        {categoryLabel} &middot; {priceLabel}
      </p>
      <h3 className="font-serif italic text-white text-xl leading-tight mb-3">
        {name}
      </h3>
      {description ? (
        <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
      ) : null}
      {requiresBirthTime ? (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="bg-gold w-2 h-2 rounded-full inline-block"
            aria-hidden="true"
          />
          <span className="text-gold text-xs">Birth time needed</span>
        </div>
      ) : null}
      <p
        className="font-sans font-bold text-lg mt-auto pt-2"
        style={{ color: accentColour }}
      >
        {priceLabel}
      </p>
    </Link>
  );
}
