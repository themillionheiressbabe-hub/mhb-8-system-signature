"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type CardOption = {
  code: string;
  name: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades" | "joker";
};

const VALUE_NAMES: Record<string, string> = {
  A: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
};

const SUIT_INFO: Record<
  CardOption["suit"],
  { letter: string; symbol: string; word: string; colour: string }
> = {
  hearts: { letter: "H", symbol: "♥", word: "Hearts", colour: "#C44A6E" },
  diamonds: { letter: "D", symbol: "♦", word: "Diamonds", colour: "#C9A96E" },
  clubs: { letter: "C", symbol: "♣", word: "Clubs", colour: "#2D9B6E" },
  spades: { letter: "S", symbol: "♠", word: "Spades", colour: "#A78BFA" },
  joker: { letter: "J", symbol: "★", word: "Joker", colour: "#F59E0B" },
};

const SUITS: CardOption["suit"][] = [
  "hearts",
  "diamonds",
  "clubs",
  "spades",
];

const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const ALL_CARDS: CardOption[] = (() => {
  const out: CardOption[] = [];
  for (const suit of SUITS) {
    for (const v of VALUES) {
      const code = `${v}${SUIT_INFO[suit].letter}`;
      const name = `${VALUE_NAMES[v]} of ${SUIT_INFO[suit].word}`;
      out.push({ code, name, suit });
    }
  }
  out.push({ code: "JOK", name: "Joker", suit: "joker" });
  return out;
})();

const CARD_BY_CODE = new Map<string, CardOption>(
  ALL_CARDS.map((c) => [c.code, c]),
);

export function cardOptionForCode(code: string | null | undefined): CardOption | null {
  if (!code) return null;
  return CARD_BY_CODE.get(code) ?? null;
}

export function suitSymbolForCard(card: CardOption | null): string {
  if (!card) return "";
  return SUIT_INFO[card.suit].symbol;
}

export function suitColourForCard(card: CardOption | null): string {
  if (!card) return "#C9A96E";
  return SUIT_INFO[card.suit].colour;
}

export function CardSelect({
  value,
  onChange,
  placeholder = "Select a card",
}: {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_CARDS;
    return ALL_CARDS.filter((c) => {
      const hay = `${c.name} ${c.code} ${SUIT_INFO[c.suit].word}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const selected = cardOptionForCode(value);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg px-3 py-2 text-left hover:border-gold/60 focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)] outline-none transition-shadow"
        style={{ minHeight: "40px" }}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden="true"
              style={{
                color: suitColourForCard(selected),
                fontSize: "16px",
              }}
            >
              {suitSymbolForCard(selected)}
            </span>
            <span
              className="text-cream truncate"
              style={{ fontSize: "14px" }}
            >
              {selected.name}
            </span>
          </span>
        ) : (
          <span
            className="text-cream/45 truncate"
            style={{ fontSize: "14px" }}
          >
            {placeholder}
          </span>
        )}
        <span
          aria-hidden="true"
          className="text-gold/60"
          style={{ fontSize: "10px" }}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#0D1220] border border-[rgba(201,169,110,0.3)] rounded-lg"
          style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.55)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-transparent border-b border-gold/15 px-3 py-2 text-cream outline-none"
            style={{ fontSize: "13px" }}
          />
          <ul
            className="max-h-60 overflow-y-auto py-1"
            role="listbox"
          >
            {value ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-cream/60 hover:bg-gold/10 transition-colors"
                  style={{ fontSize: "12px" }}
                >
                  Clear selection
                </button>
              </li>
            ) : null}
            {matches.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-gold/10 transition-colors"
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: SUIT_INFO[c.suit].colour,
                      fontSize: "14px",
                      width: "14px",
                    }}
                  >
                    {SUIT_INFO[c.suit].symbol}
                  </span>
                  <span
                    className="text-cream truncate"
                    style={{ fontSize: "13px" }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="text-cream/40 ml-auto"
                    style={{
                      fontFamily:
                        "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                      fontSize: "11px",
                    }}
                  >
                    {c.code}
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li
                className="px-3 py-2 text-cream/40 italic"
                style={{ fontSize: "13px" }}
              >
                No matches.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
