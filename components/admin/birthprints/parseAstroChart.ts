export type AstroPasteResult = {
  sun: string | null;
  moon: string | null;
  rising: string | null;
  mc: string | null;
  mercury: string | null;
  venus: string | null;
  mars: string | null;
  jupiter: string | null;
  saturn: string | null;
  chiron: string | null;
};

const ZODIAC = [
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

function normaliseSign(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const z of ZODIAC) {
    if (z.toLowerCase() === lower) return z;
  }
  return null;
}

function findSign(text: string, labels: string[]): string | null {
  for (const label of labels) {
    // Match "<label> [in|:|=] <sign>" with flexible whitespace and an
    // optional retrograde marker (Rx, R, ℞).
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `\\b${escaped}\\b\\s*(?:R(?:x)?|℞)?\\s*(?:in\\s+|:\\s*|=\\s*|\\s+)?([A-Za-z]+)`,
      "i",
    );
    const m = text.match(re);
    if (m) {
      const sign = normaliseSign(m[1]);
      if (sign) return sign;
    }
  }
  return null;
}

export function parseAstroPaste(text: string): AstroPasteResult {
  return {
    sun: findSign(text, ["Sun"]),
    moon: findSign(text, ["Moon"]),
    rising: findSign(text, ["Ascendant", "Rising", "AC", "Asc"]),
    mc: findSign(text, ["MC", "Midheaven"]),
    mercury: findSign(text, ["Mercury"]),
    venus: findSign(text, ["Venus"]),
    mars: findSign(text, ["Mars"]),
    jupiter: findSign(text, ["Jupiter"]),
    saturn: findSign(text, ["Saturn"]),
    chiron: findSign(text, ["Chiron"]),
  };
}

export const ZODIAC_SIGNS = ZODIAC;
