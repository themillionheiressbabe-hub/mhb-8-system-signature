import { getMoonData, getSunData } from "./ephemeris";

export { getMoonData, getSunData };
export type { MoonData, SunData } from "./ephemeris";

type Numerology = { number: number; meaning: string };
type SunSign = {
  sign: string;
  element: string;
  quality: string;
  theme: string;
};

const NUMEROLOGY_MEANING: Record<number, string> = {
  1: "New starts. What you initiate today carries weight.",
  2: "Partnership. What needs tending in your closest connections?",
  3: "Expression. Say the thing. Create the thing.",
  4: "Foundation. Build something that lasts today.",
  5: "Change. The shift is not coming. It is here.",
  6: "Responsibility. Who needs you and do you have enough to give?",
  7: "Truth. Go inward. Do not force what needs to reveal itself.",
  8: "Power. What you direct your energy toward today compounds.",
  9: "Completion. Something is finishing. Let it.",
  11: "Illumination. Heightened sensitivity. Trust what arrives.",
  22: "Scale. What you build today can last beyond you.",
};

function sumDigits(n: number): number {
  let sum = 0;
  let temp = Math.abs(n);
  while (temp > 0) {
    sum += temp % 10;
    temp = Math.floor(temp / 10);
  }
  return sum;
}

function reduce(n: number): number {
  if (n === 11 || n === 22) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

export function getDailyNumerology(date: Date): Numerology {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const total = sumDigits(day) + sumDigits(month) + sumDigits(year);
  const number = reduce(total);
  return {
    number,
    meaning: NUMEROLOGY_MEANING[number] ?? "",
  };
}

const SIGN_ATTRIBUTES: Record<string, Omit<SunSign, "sign">> = {
  Aries: {
    element: "fire",
    quality: "cardinal",
    theme: "initiation, courage, the self",
  },
  Taurus: {
    element: "earth",
    quality: "fixed",
    theme: "values, sensory grounding, what you build",
  },
  Gemini: {
    element: "air",
    quality: "mutable",
    theme: "communication, curiosity, duality",
  },
  Cancer: {
    element: "water",
    quality: "cardinal",
    theme: "home, emotion, protection",
  },
  Leo: {
    element: "fire",
    quality: "fixed",
    theme: "creativity, visibility, the heart",
  },
  Virgo: {
    element: "earth",
    quality: "mutable",
    theme: "precision, service, the body",
  },
  Libra: {
    element: "air",
    quality: "cardinal",
    theme: "balance, relationship, what is fair",
  },
  Scorpio: {
    element: "water",
    quality: "fixed",
    theme: "transformation, depth, what is hidden",
  },
  Sagittarius: {
    element: "fire",
    quality: "mutable",
    theme: "expansion, truth, the bigger picture",
  },
  Capricorn: {
    element: "earth",
    quality: "cardinal",
    theme: "structure, ambition, what endures",
  },
  Aquarius: {
    element: "air",
    quality: "fixed",
    theme: "innovation, community, the future",
  },
  Pisces: {
    element: "water",
    quality: "mutable",
    theme: "surrender, intuition, the unseen",
  },
};

export function getDailySunSign(date: Date): SunSign {
  const sun = getSunData(date);
  const attrs = SIGN_ATTRIBUTES[sun.sign] ?? {
    element: "",
    quality: "",
    theme: "",
  };
  return { sign: sun.sign, ...attrs };
}

export function buildThreeLensContext(
  card: string,
  numerology: Numerology,
  sunSign: SunSign,
): string {
  return `Today's card: ${card}. Today's numerology: ${numerology.number} (${numerology.meaning}). Today's sun sign: ${sunSign.sign} (${sunSign.theme}).`;
}
