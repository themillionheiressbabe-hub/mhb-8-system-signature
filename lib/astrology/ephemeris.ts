import * as path from "node:path";
import * as sweph from "sweph";

// Point sweph at the Swiss Ephemeris .se1 files bundled with the sweph-wasm package,
// so asteroid bodies like Chiron (which need seas_18.se1) resolve correctly.
sweph.set_ephe_path(
  path.join(process.cwd(), "node_modules", "sweph-wasm", "dist", "ephe"),
);

const SEFLG_MOSEPH = sweph.constants.SEFLG_MOSEPH;
const SEFLG_SPEED = sweph.constants.SEFLG_SPEED;

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

function longitudeToSign(lon: number): {
  sign: string;
  degree: number;
  minutes: number;
} {
  const normalised = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(normalised / 30);
  const degInSign = normalised % 30;
  return {
    sign: SIGNS[signIndex],
    degree: Math.floor(degInSign),
    minutes: Math.floor((degInSign % 1) * 60),
  };
}

function dateToJD(date: Date): number {
  return sweph.julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600,
    sweph.constants.SE_GREG_CAL,
  );
}

export type MoonData = {
  sign: string;
  degree: number;
  minutes: number;
  phase: string;
  emoji: string;
  illumination: number;
  isRetrograde: boolean;
};

export type SunData = {
  sign: string;
  degree: number;
  minutes: number;
};

export function getMoonData(date: Date): MoonData {
  const jd = dateToJD(date);
  const flags = SEFLG_MOSEPH | SEFLG_SPEED;

  const moonResult = sweph.calc_ut(jd, sweph.constants.SE_MOON, flags);
  const sunResult = sweph.calc_ut(jd, sweph.constants.SE_SUN, flags);

  const moonLon = moonResult.data[0];
  const sunLon = sunResult.data[0];
  const moonSpeed = moonResult.data[3];

  const moonPos = longitudeToSign(moonLon);

  let angle = moonLon - sunLon;
  if (angle < 0) angle += 360;

  const illumination = Math.round(
    ((1 - Math.cos((angle * Math.PI) / 180)) / 2) * 100,
  );
  const waxing = angle < 180;

  let phase: string;
  let emoji: string;

  if (illumination <= 1) {
    phase = "New Moon";
    emoji = "🌑";
  } else if (illumination < 50 && waxing) {
    phase = "Waxing Crescent";
    emoji = "🌒";
  } else if (illumination === 50 && waxing) {
    phase = "First Quarter";
    emoji = "🌓";
  } else if (illumination > 50 && illumination < 99 && waxing) {
    phase = "Waxing Gibbous";
    emoji = "🌔";
  } else if (illumination >= 99) {
    phase = "Full Moon";
    emoji = "🌕";
  } else if (illumination > 50 && !waxing) {
    phase = "Waning Gibbous";
    emoji = "🌖";
  } else if (illumination === 50 && !waxing) {
    phase = "Last Quarter";
    emoji = "🌗";
  } else {
    phase = "Waning Crescent";
    emoji = "🌘";
  }

  return {
    sign: moonPos.sign,
    degree: moonPos.degree,
    minutes: moonPos.minutes,
    phase,
    emoji,
    illumination,
    isRetrograde: moonSpeed < 0,
  };
}

export function getSunData(date: Date): SunData {
  const jd = dateToJD(date);
  const flags = SEFLG_MOSEPH | SEFLG_SPEED;
  const sunResult = sweph.calc_ut(jd, sweph.constants.SE_SUN, flags);
  return longitudeToSign(sunResult.data[0]);
}

export function getAllPlanets(date: Date): Array<{
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minutes: number;
  isRetrograde: boolean;
  colour: string;
  longitude: number;
}> {
  const jd = dateToJD(date);
  const flags = SEFLG_MOSEPH | SEFLG_SPEED;

  const planetList = [
    { id: sweph.constants.SE_SUN, name: "Sun", symbol: "☀" },
    { id: sweph.constants.SE_MOON, name: "Moon", symbol: "☽" },
    { id: sweph.constants.SE_MERCURY, name: "Mercury", symbol: "☿" },
    { id: sweph.constants.SE_VENUS, name: "Venus", symbol: "♀" },
    { id: sweph.constants.SE_MARS, name: "Mars", symbol: "♂" },
    { id: sweph.constants.SE_JUPITER, name: "Jupiter", symbol: "♃" },
    { id: sweph.constants.SE_SATURN, name: "Saturn", symbol: "♄" },
    { id: sweph.constants.SE_URANUS, name: "Uranus", symbol: "♅" },
    { id: sweph.constants.SE_NEPTUNE, name: "Neptune", symbol: "♆" },
    { id: sweph.constants.SE_PLUTO, name: "Pluto", symbol: "♇" },
    { id: sweph.constants.SE_CHIRON, name: "Chiron", symbol: "⚷" },
  ];

  const planetColours: Record<string, string> = {
    Sun: "#C9A96E",
    Moon: "#E8D5A3",
    Mercury: "#A78BFA",
    Venus: "#C44A6E",
    Mars: "#B51E5A",
    Jupiter: "#2D9B6E",
    Saturn: "#6B7280",
    Uranus: "#5BC0EB",
    Neptune: "#818CF8",
    Pluto: "#8B5CF6",
    Chiron: "#F59E0B",
  };

  const signs = [
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

  // sweph.calc_ut returns { flag, error, data } where flag < 0 indicates failure.
  // It rarely throws — most errors come back via the result. Treat both paths as failure.
  type CalcResult = { flag: number; error?: string; data: number[] };

  function safeCalc(
    id: number,
    planetName: string,
    planetFlags: number,
  ): CalcResult | null {
    try {
      const r = sweph.calc_ut(jd, id, planetFlags) as CalcResult;
      if (r.flag < 0) {
        console.error(
          `getAllPlanets: ${planetName} calc failed: ${r.error ?? "unknown error"}`,
        );
        return null;
      }
      return r;
    } catch (err) {
      console.error(`getAllPlanets: ${planetName} threw`, err);
      return null;
    }
  }

  return planetList.map((p) => {
    let result = safeCalc(p.id, p.name, flags);

    // Chiron lives in the Swiss Ephemeris asteroid files (seas_18.se1 etc.) and
    // is absent from the Moshier ephemeris. If the first call returned 0°00',
    // retry once with default flags in case a different ephemeris path is set.
    // Without the .se1 files installed the retry will also fail and we mark it Unknown.
    if (
      p.name === "Chiron" &&
      (!result || (result.data[0] ?? 0) === 0)
    ) {
      result = safeCalc(p.id, p.name, SEFLG_SPEED);
    }

    if (!result) {
      return {
        name: p.name,
        symbol: p.symbol,
        sign: "Unknown",
        degree: 0,
        minutes: 0,
        isRetrograde: false,
        colour: planetColours[p.name] || "#C9A96E",
        longitude: 0,
      };
    }

    const longitude = ((result.data[0] % 360) + 360) % 360;
    const speed = result.data[3];
    const signIndex = Math.floor(longitude / 30);
    const degInSign = longitude % 30;
    return {
      name: p.name,
      symbol: p.symbol,
      sign: signs[signIndex],
      degree: Math.floor(degInSign),
      minutes: Math.floor((degInSign % 1) * 60),
      isRetrograde: speed < 0,
      colour: planetColours[p.name] || "#C9A96E",
      longitude,
    };
  });
}
