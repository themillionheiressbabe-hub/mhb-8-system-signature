"use client";

import Link from "next/link";
import { useState } from "react";

interface SignatureCardProps {
  name: string;
  description: string | null;
  priceLabel: string;
  href: string;
  accentColour: string;
  accentRgb: string;
  requiresBirthTime?: boolean;
}

export default function SignatureCard({
  name,
  description,
  priceLabel,
  href,
  accentColour,
  accentRgb,
  requiresBirthTime,
}: SignatureCardProps) {
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
      className="block bg-[#0D1220] border border-gold/15 rounded-2xl p-8 no-underline grid grid-cols-[1fr_auto] gap-7 items-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: accentColour }}
        >
          The Signature &middot; Flagship
        </p>
        <h3 className="font-serif italic text-white text-[1.6rem] leading-tight mb-2.5">
          {name}
        </h3>
        {description ? (
          <p className="text-white/60 text-sm leading-[1.65] mb-4 line-clamp-4">
            {description}
          </p>
        ) : null}
        {requiresBirthTime ? (
          <div className="flex items-center gap-2 mt-1">
            <span
              className="bg-gold w-2 h-2 rounded-full inline-block"
              aria-hidden="true"
            />
            <span className="text-gold text-xs">Birth time needed</span>
          </div>
        ) : null}
      </div>
      <div className="text-right">
        <p
          className="text-[32px] font-bold leading-none whitespace-nowrap"
          style={{ color: accentColour }}
        >
          {priceLabel}
        </p>
        <p className="text-xs uppercase tracking-widest text-white/50 mt-2">
          Flagship
        </p>
      </div>
    </Link>
  );
}
