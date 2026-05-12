"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TAB_COLOURS: Record<string, { hex: string; rgb: string }> = {
  all: { hex: "#B51E5A", rgb: "181,30,90" },
  "engine-1": { hex: "#C9A96E", rgb: "201,169,110" },
  "engine-2": { hex: "#B51E5A", rgb: "181,30,90" },
  "engine-3": { hex: "#2D9B6E", rgb: "45,155,110" },
  "engine-4": { hex: "#A78BFA", rgb: "167,139,250" },
  "engine-5": { hex: "#C9A96E", rgb: "201,169,110" },
  "engine-6": { hex: "#B51E5A", rgb: "181,30,90" },
  "engine-7": { hex: "#A78BFA", rgb: "167,139,250" },
};

interface Tab {
  label: string;
  slug: string;
  href: string;
}

interface FilterTabsProps {
  tabs: Tab[];
  selectedSlug: string;
}

export default function FilterTabs({ tabs, selectedSlug }: FilterTabsProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex gap-3 flex-wrap">
      {tabs.map((tab) => {
        const colour = TAB_COLOURS[tab.slug] || TAB_COLOURS.all;
        const isActive = selectedSlug === tab.slug;
        const isHovered = hovered === tab.slug;

        let style: React.CSSProperties = {
          borderRadius: "999px",
          padding: "8px 20px",
          fontSize: "14px",
          fontFamily: "Outfit, sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          border: "1px solid",
          transition: "all 0.2s ease",
          outline: "none",
          backgroundColor: "transparent",
        };

        if (isActive) {
          style = {
            ...style,
            backgroundColor: colour.hex,
            borderColor: colour.hex,
            color: "white",
            boxShadow: `0 0 20px rgba(${colour.rgb},0.55)`,
          };
        } else if (isHovered) {
          style = {
            ...style,
            backgroundColor: `rgba(${colour.rgb},0.1)`,
            borderColor: colour.hex,
            color: "white",
            boxShadow: `0 0 16px rgba(${colour.rgb},0.35)`,
          };
        } else {
          style = {
            ...style,
            borderColor: "rgba(201,169,110,0.3)",
            color: "rgba(240,236,228,0.7)",
          };
        }

        return (
          <button
            key={tab.slug}
            type="button"
            style={style}
            onMouseEnter={() => setHovered(tab.slug)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push(tab.href)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
