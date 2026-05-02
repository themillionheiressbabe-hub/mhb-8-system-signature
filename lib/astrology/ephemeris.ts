import * as sweph from "sweph";

sweph.set_ephe_path("");

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

  let phase: string;
  let emoji: string;

  if (angle < 22.5 || angle >= 337.5) {
    phase = "New Moon";
    emoji = "🌑";
  } else if (angle < 67.5) {
    phase = "Waxing Crescent";
    emoji = "🌒";
  } else if (angle < 112.5) {
    phase = "First Quarter";
    emoji = "🌓";
  } else if (angle < 157.5) {
    phase = "Waxing Gibbous";
    emoji = "🌔";
  } else if (angle < 202.5) {
    phase = "Full Moon";
    emoji = "🌕";
  } else if (angle < 247.5) {
    phase = "Waning Gibbous";
    emoji = "🌖";
  } else if (angle < 292.5) {
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
