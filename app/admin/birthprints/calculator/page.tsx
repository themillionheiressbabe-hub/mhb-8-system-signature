import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getAllPlanets,
  getSiderealChart,
  getSiderealAscendant,
  getHousesData,
  houseForLongitude,
} from "@/lib/astrology/ephemeris";
import { localToUTC } from "@/lib/timezone";
import { geocodeCity } from "@/lib/geocode";
import {
  CalculatorForm,
  type CalcInput,
  type CalcResult,
  type ChakraReading,
  type WheelDirection,
  type WheelEntry,
  type ClientPick,
  type SavePayload,
} from "@/components/admin/birthprints/CalculatorForm";

export const metadata: Metadata = {
  title: "Birthprint Calculator · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const FIRE_SIGNS = new Set(["Aries", "Leo", "Sagittarius"]);
const EARTH_SIGNS = new Set(["Taurus", "Virgo", "Capricorn"]);
const AIR_SIGNS = new Set(["Gemini", "Libra", "Aquarius"]);
const WATER_SIGNS = new Set(["Cancer", "Scorpio", "Pisces"]);

const SPIRITUAL_SIGNS = new Set(["Pisces", "Aquarius", "Sagittarius"]);

function elementOf(sign: string): "fire" | "earth" | "air" | "water" | null {
  if (FIRE_SIGNS.has(sign)) return "fire";
  if (EARTH_SIGNS.has(sign)) return "earth";
  if (AIR_SIGNS.has(sign)) return "air";
  if (WATER_SIGNS.has(sign)) return "water";
  return null;
}

const DIRECTION_MEANING: Record<WheelDirection, string> = {
  East: "Clarity and Vision",
  West: "Rest and Reflection",
  North: "Structure and Wisdom",
  South: "Connection and Heart",
};

const OPPOSITE_DIRECTION: Record<WheelDirection, WheelDirection> = {
  East: "West",
  West: "East",
  North: "South",
  South: "North",
};

function primaryDirectionFromLifePath(lp: number): WheelDirection {
  if (lp === 11) return "South";
  if (lp === 22) return "North";
  if (lp === 33) return "West";
  const table: WheelDirection[] = [
    "East", "South", "West", "North",
    "East", "South", "West", "North",
    "East",
  ];
  // Reduced LP values 1-9 map by position. Larger values get the same
  // mapping per the spec table (5,14,23 = East; 6,15,24 = South; etc.).
  const idx = ((lp - 1) % 9 + 9) % 9;
  return table[idx];
}

function secondaryDirectionFromSun(sunSign: string): WheelDirection {
  const el = elementOf(sunSign);
  if (el === "fire" || el === "air") return "East";
  if (el === "earth") return "North";
  if (el === "water") return "West";
  return "East";
}

function supportingDirectionFromBirthCard(
  cardName: string | null,
): WheelDirection {
  if (!cardName) return "East";
  const lower = cardName.toLowerCase();
  if (lower.includes("hearts")) return "South";
  if (lower.includes("diamonds")) return "East";
  if (lower.includes("clubs")) return "North";
  if (lower.includes("spades")) return "West";
  return "East";
}

function entry(
  role: WheelEntry["role"],
  direction: WheelDirection,
  estimated: boolean,
): WheelEntry {
  return {
    role,
    direction,
    meaning: DIRECTION_MEANING[direction],
    estimated,
  };
}

// Houses grouped by Medicine Wheel direction per the canon spec.
const HOUSE_DIRECTION: Record<number, WheelDirection> = {
  1: "East",
  5: "East",
  9: "East",
  2: "North",
  6: "North",
  10: "North",
  3: "South",
  7: "South",
  11: "South",
  4: "West",
  8: "West",
  12: "West",
};

// Planets included in the house-emphasis count. Outer planets (Uranus,
// Neptune, Pluto) are excluded because they linger in signs for years and
// don't speak to the individual chart's emphasis.
const WHEEL_PLANETS = new Set([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Chiron",
]);

function computeMedicineWheel(
  planets: ReturnType<typeof getAllPlanets>,
  cusps: number[] | null,
  lifePath: number,
  sunSign: string,
  birthCardName: string | null,
): WheelEntry[] {
  if (!cusps) {
    // Estimated fallback: birth time or place was not available, so we
    // cannot compute house emphasis. Primary derives from Life Path,
    // Secondary from Sun sign element. Supporting borrows the older
    // birth-card-suit heuristic. Lesson is opposite of Primary. All four
    // cells are flagged estimated.
    const primary = primaryDirectionFromLifePath(lifePath);
    const secondary = secondaryDirectionFromSun(sunSign);
    const supporting = supportingDirectionFromBirthCard(birthCardName);
    const lesson = OPPOSITE_DIRECTION[primary];
    return [
      entry("Primary", primary, true),
      entry("Secondary", secondary, true),
      entry("Supporting", supporting, true),
      entry("Lesson", lesson, true),
    ];
  }

  // House-emphasis count using inner planets + Chiron.
  const counts: Record<WheelDirection, number> = {
    East: 0,
    North: 0,
    South: 0,
    West: 0,
  };
  for (const p of planets) {
    if (!WHEEL_PLANETS.has(p.name)) continue;
    // getAllPlanets returns longitude 0 with sign "Unknown" when the
    // calc failed (commonly Chiron without the .se1 ephe files). Skip
    // those entries so we don't bias the count toward house 1.
    if (p.sign === "Unknown" || p.longitude === 0) continue;
    const house = houseForLongitude(p.longitude, cusps);
    const dir = HOUSE_DIRECTION[house];
    if (dir) counts[dir] += 1;
  }

  const ranked = (Object.entries(counts) as [WheelDirection, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  // Primary: highest count, breaking ties with the Sun-sign element rule.
  let primary: WheelDirection = ranked[0][0];
  const topCount = ranked[0][1];
  const tiedTop = ranked
    .filter(([, c]) => c === topCount)
    .map(([d]) => d);
  if (tiedTop.length > 1) {
    const tieDir = secondaryDirectionFromSun(sunSign);
    primary = tiedTop.includes(tieDir) ? tieDir : tiedTop[0];
  }

  // Secondary + Supporting from the rest, sorted by count desc.
  const rest = ranked.filter(([d]) => d !== primary);
  const secondary = rest[0]?.[0] ?? OPPOSITE_DIRECTION[primary];
  const supporting = rest[1]?.[0] ?? OPPOSITE_DIRECTION[primary];
  const lesson = OPPOSITE_DIRECTION[primary];

  return [
    entry("Primary", primary, false),
    entry("Secondary", secondary, false),
    entry("Supporting", supporting, false),
    entry("Lesson", lesson, false),
  ];
}

type ChakraPlanetSign = {
  sun: string | null;
  moon: string | null;
  mercury: string | null;
  mercuryRetro: boolean;
  venus: string | null;
  mars: string | null;
  jupiter: string | null;
  saturn: string | null;
  uranus: string | null;
  neptune: string | null;
};

function chakrasFromChart(p: ChakraPlanetSign): ChakraReading[] {
  function fmt(label: string, sign: string | null): string {
    return sign ? `${label} in ${sign}` : `${label}, sign unknown`;
  }

  // Root: Saturn earth OR Mars earth/fire
  const rootLocked =
    (p.saturn !== null && EARTH_SIGNS.has(p.saturn)) ||
    (p.mars !== null &&
      (EARTH_SIGNS.has(p.mars) || FIRE_SIGNS.has(p.mars)));
  const root: ChakraReading = {
    key: "root",
    name: "Root",
    state: rootLocked ? "Locked In" : "Checked Out",
    driver: fmt("Saturn", p.saturn) + ", " + fmt("Mars", p.mars),
  };

  // Sacral: Moon water or earth
  const sacralLocked =
    p.moon !== null && (WATER_SIGNS.has(p.moon) || EARTH_SIGNS.has(p.moon));
  const sacral: ChakraReading = {
    key: "sacral",
    name: "Sacral",
    state: sacralLocked ? "Locked In" : "Checked Out",
    driver: fmt("Moon", p.moon),
  };

  // Solar Plexus: Sun fire or earth
  const solarLocked =
    p.sun !== null && (FIRE_SIGNS.has(p.sun) || EARTH_SIGNS.has(p.sun));
  const solar: ChakraReading = {
    key: "solar",
    name: "Solar Plexus",
    state: solarLocked ? "Locked In" : "Checked Out",
    driver: fmt("Sun", p.sun),
  };

  // Heart: Venus in Taurus/Libra/Pisces/Cancer = Locked In;
  // Venus in Aries/Scorpio/Capricorn = Checked Out; otherwise Locked In.
  const heartLockSigns = new Set([
    "Taurus", "Libra", "Pisces", "Cancer",
  ]);
  const heartCheckSigns = new Set(["Aries", "Scorpio", "Capricorn"]);
  let heartState: ChakraReading["state"] = "Locked In";
  if (p.venus && heartCheckSigns.has(p.venus)) heartState = "Checked Out";
  else if (p.venus && heartLockSigns.has(p.venus)) heartState = "Locked In";
  const heart: ChakraReading = {
    key: "heart",
    name: "Heart",
    state: heartState,
    driver: fmt("Venus", p.venus),
  };

  // Throat: Mercury Gemini/Virgo/Aquarius = Locked In;
  // Mercury Scorpio/Pisces OR retrograde = Checked Out; else Locked In.
  const throatLockSigns = new Set(["Gemini", "Virgo", "Aquarius"]);
  const throatCheckSigns = new Set(["Scorpio", "Pisces"]);
  let throatState: ChakraReading["state"] = "Locked In";
  if (p.mercuryRetro) throatState = "Checked Out";
  else if (p.mercury && throatCheckSigns.has(p.mercury))
    throatState = "Checked Out";
  else if (p.mercury && throatLockSigns.has(p.mercury))
    throatState = "Locked In";
  const throat: ChakraReading = {
    key: "throat",
    name: "Throat",
    state: throatState,
    driver:
      fmt("Mercury", p.mercury) + (p.mercuryRetro ? " (retrograde)" : ""),
  };

  // Third Eye: Jupiter Sagittarius/Pisces/Aquarius = Locked In;
  // Jupiter Gemini/Virgo = Checked Out; else Locked In.
  const thirdEyeLockSigns = new Set(["Sagittarius", "Pisces", "Aquarius"]);
  const thirdEyeCheckSigns = new Set(["Gemini", "Virgo"]);
  let thirdEyeState: ChakraReading["state"] = "Locked In";
  if (p.jupiter && thirdEyeCheckSigns.has(p.jupiter))
    thirdEyeState = "Checked Out";
  else if (p.jupiter && thirdEyeLockSigns.has(p.jupiter))
    thirdEyeState = "Locked In";
  const thirdEye: ChakraReading = {
    key: "third_eye",
    name: "Third Eye",
    state: thirdEyeState,
    driver: fmt("Jupiter", p.jupiter),
  };

  // Crown: Neptune or Uranus in spiritual signs (Pisces, Aquarius,
  // Sagittarius) = Locked In; else Checked Out.
  const crownLocked =
    (p.neptune !== null && SPIRITUAL_SIGNS.has(p.neptune)) ||
    (p.uranus !== null && SPIRITUAL_SIGNS.has(p.uranus));
  const crown: ChakraReading = {
    key: "crown",
    name: "Crown",
    state: crownLocked ? "Locked In" : "Checked Out",
    driver: fmt("Neptune", p.neptune) + ", " + fmt("Uranus", p.uranus),
  };

  return [root, sacral, solar, heart, throat, thirdEye, crown];
}

function sumDigits(n: number): number {
  let s = 0;
  let t = Math.abs(n);
  while (t > 0) {
    s += t % 10;
    t = Math.floor(t / 10);
  }
  return s;
}

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

function lifePathFromDob(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return reduce(sumDigits(y) + sumDigits(m) + sumDigits(d));
}

function personalYearFromDob(iso: string): number {
  const [, m, d] = iso.split("-").map(Number);
  const yr = new Date().getFullYear();
  return reduce(sumDigits(m) + sumDigits(d) + sumDigits(yr));
}

const PYTHAGOREAN_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function expressionFromName(name: string): number | null {
  if (!name.trim()) return null;
  let total = 0;
  for (const ch of name.toLowerCase()) {
    const v = PYTHAGOREAN_VALUES[ch];
    if (typeof v === "number") total += v;
  }
  if (total === 0) return null;
  return reduce(total);
}

function soulUrgeFromName(name: string): number | null {
  if (!name.trim()) return null;
  let total = 0;
  for (const ch of name.toLowerCase()) {
    if (VOWELS.has(ch)) {
      const v = PYTHAGOREAN_VALUES[ch];
      if (typeof v === "number") total += v;
    }
  }
  if (total === 0) return null;
  return reduce(total);
}

const CHINESE_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const CHINESE_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth",
  "Earth", "Metal", "Metal", "Water", "Water",
];

function chineseZodiacFromDob(iso: string): { animal: string; element: string } {
  const y = Number(iso.split("-")[0]);
  return {
    animal: CHINESE_ANIMALS[(((y - 4) % 12) + 12) % 12],
    element: CHINESE_ELEMENTS[(((y - 4) % 10) + 10) % 10],
  };
}

type CalcOk = { ok: true; result: CalcResult };
type CalcErr = { ok: false; error: string };

async function calculateAction(
  input: CalcInput,
): Promise<CalcOk | CalcErr> {
  "use server";

  if (
    !input.full_name.trim() ||
    !input.date_of_birth ||
    !input.place_of_birth.trim()
  ) {
    return { ok: false, error: "Missing required fields." };
  }

  // Geocode the place of birth so we can convert local birth time to UTC
  // and compute houses. Failure is non-fatal; the rest of the calculation
  // falls back to noon UTC and skips Rising/MC.
  let geo: { lat: number; lng: number } | null = null;
  try {
    geo = await geocodeCity(input.place_of_birth.trim());
  } catch {
    geo = null;
  }

  const hasTime = !input.time_unknown && !!input.time_of_birth;
  let utcDate: Date;
  if (hasTime && geo) {
    utcDate = localToUTC(
      input.date_of_birth,
      input.time_of_birth,
      geo.lat,
      geo.lng,
    );
  } else if (hasTime) {
    // No geo: treat the local time as UTC. Best-effort fallback.
    utcDate = new Date(`${input.date_of_birth}T${input.time_of_birth}:00Z`);
  } else {
    utcDate = new Date(`${input.date_of_birth}T12:00:00Z`);
  }

  // Tropical chart placements via Swiss Ephemeris.
  const planets = getAllPlanets(utcDate);
  const byName = new Map(planets.map((p) => [p.name, p]));
  const sun = byName.get("Sun");
  const moon = byName.get("Moon");
  const mercury = byName.get("Mercury");
  const venus = byName.get("Venus");
  const mars = byName.get("Mars");
  const jupiter = byName.get("Jupiter");
  const saturn = byName.get("Saturn");
  const uranus = byName.get("Uranus");
  const neptune = byName.get("Neptune");
  const chiron = byName.get("Chiron");

  const tropicalSunSign = sun?.sign ?? "Aries";
  const moonSign = moon?.sign ?? null;
  const chironSign =
    chiron && chiron.sign && chiron.sign !== "Unknown" ? chiron.sign : null;
  const chironRetrograde = !!chiron?.isRetrograde;

  // Rising and MC require both a birth time and geolocation. We capture the
  // full house cusps too so we can resolve Chiron's house number below.
  let risingSign: string | null = null;
  let mcSign: string | null = null;
  let cusps: number[] | null = null;
  if (hasTime && geo) {
    const houses = getHousesData(utcDate, geo.lat, geo.lng);
    if (houses) {
      risingSign = houses.ascendantSign;
      mcSign = houses.mcSign;
      cusps = houses.cusps;
    }
  }

  let chironHouse: number | null = null;
  if (chiron && cusps && chiron.longitude > 0) {
    chironHouse = houseForLongitude(chiron.longitude, cusps);
  }

  // Sidereal chart via native swisseph sidereal mode (Lahiri ayanamsa).
  // The helper runs the full planet set; Moon and Rising are then gated
  // on the availability of birth time and birth location at the result
  // shaping step below.
  const siderealChart = getSiderealChart(utcDate);
  let siderealRising: string | null = null;
  if (hasTime && geo) {
    siderealRising = getSiderealAscendant(utcDate, geo.lat, geo.lng);
  }

  // Destiny cards lookup by month + day
  const [, monthStr, dayStr] = input.date_of_birth.split("-");
  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code, planetary_ruling_card_code")
    .eq("month", Number(monthStr))
    .eq("day", Number(dayStr))
    .maybeSingle<{
      card_code: string;
      planetary_ruling_card_code: string | null;
    }>();

  let birthCardName: string | null = null;
  let prcName: string | null = null;
  let birthCardCode: string | null = lookup?.card_code ?? null;
  const prcCode: string | null = lookup?.planetary_ruling_card_code ?? null;
  if (lookup) {
    const codes = [
      lookup.card_code,
      lookup.planetary_ruling_card_code,
    ].filter((v): v is string => !!v);
    if (codes.length > 0) {
      const { data: cards } = await supabaseAdmin
        .from("card_library")
        .select("card_code, card_name")
        .in("card_code", codes)
        .returns<Array<{ card_code: string; card_name: string }>>();
      const byCode = new Map<string, string>();
      for (const c of cards ?? [])
        byCode.set(c.card_code, c.card_name.replace(/\s*\(.*$/, ""));
      birthCardName = byCode.get(lookup.card_code) ?? null;
      prcName = lookup.planetary_ruling_card_code
        ? byCode.get(lookup.planetary_ruling_card_code) ?? null
        : null;
    }
  }

  // Defensive lookups for card_relationships + life_spreads. Both tables
  // may not exist in the deployed schema yet; we treat a missing table or
  // missing row as "no pre-fill" rather than an error.
  type RelationshipsRow = {
    karma_card_1: string | null;
    karma_card_2: string | null;
    karma_cousin_1: string | null;
    karma_cousin_2: string | null;
    past_life_1: string | null;
    past_life_2: string | null;
  };
  let relationships: RelationshipsRow | null = null;
  if (birthCardCode) {
    try {
      const { data } = await supabaseAdmin
        .from("card_relationships")
        .select(
          "karma_card_1, karma_card_2, karma_cousin_1, karma_cousin_2, past_life_1, past_life_2",
        )
        .eq("birth_card_code", birthCardCode)
        .maybeSingle<RelationshipsRow>();
      relationships = data ?? null;
    } catch {
      relationships = null;
    }
  }

  type LifeSpreadRow = {
    moon: string | null;
    mercury: string | null;
    venus: string | null;
    mars: string | null;
    jupiter: string | null;
    saturn: string | null;
    uranus: string | null;
    neptune: string | null;
    pluto: string | null;
    result: string | null;
    cosmic_lesson: string | null;
    long_range: string | null;
    displacement: string | null;
  };
  let lifeSpreadRow: LifeSpreadRow | null = null;
  if (birthCardCode) {
    try {
      const { data } = await supabaseAdmin
        .from("life_spreads")
        .select(
          "moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, long_range, displacement",
        )
        .eq("birth_card_code", birthCardCode)
        .maybeSingle<LifeSpreadRow>();
      lifeSpreadRow = data ?? null;
    } catch {
      lifeSpreadRow = null;
    }
    if (!lifeSpreadRow) {
      try {
        const { data } = await supabaseAdmin
          .from("life_spread_data")
          .select(
            "moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, result, cosmic_lesson, long_range, displacement",
          )
          .eq("birth_card_code", birthCardCode)
          .maybeSingle<LifeSpreadRow>();
        lifeSpreadRow = data ?? null;
      } catch {
        lifeSpreadRow = null;
      }
    }
  }

  const lifePath = lifePathFromDob(input.date_of_birth);
  const expression = expressionFromName(input.full_name);
  const soulUrge = soulUrgeFromName(input.full_name);
  const personalYear = personalYearFromDob(input.date_of_birth);
  const chinese = chineseZodiacFromDob(input.date_of_birth);

  const chakras = chakrasFromChart({
    sun: sun?.sign ?? null,
    moon: moon?.sign ?? null,
    mercury: mercury?.sign ?? null,
    mercuryRetro: !!mercury?.isRetrograde,
    venus: venus?.sign ?? null,
    mars: mars?.sign ?? null,
    jupiter: jupiter?.sign ?? null,
    saturn: saturn?.sign ?? null,
    uranus: uranus?.sign ?? null,
    neptune: neptune?.sign ?? null,
  });

  const medicineWheel: WheelEntry[] = computeMedicineWheel(
    planets,
    cusps,
    lifePath,
    tropicalSunSign,
    birthCardName,
  );

  const result: CalcResult = {
    tropical: {
      sunSign: tropicalSunSign,
      moonSign,
      risingSign,
      mcSign,
      mercurySign: mercury?.sign ?? null,
      venusSign: venus?.sign ?? null,
      marsSign: mars?.sign ?? null,
      jupiterSign: jupiter?.sign ?? null,
      saturnSign: saturn?.sign ?? null,
      chironSign,
      chironHouse,
      chironRetrograde,
    },
    sidereal: {
      sun: siderealChart.sun,
      moon: hasTime ? siderealChart.moon : null,
      rising: siderealRising,
      mercury: siderealChart.mercury,
      venus: siderealChart.venus,
      mars: siderealChart.mars,
      jupiter: siderealChart.jupiter,
      saturn: siderealChart.saturn,
      hasTime,
      hasGeo: !!geo,
      failed: siderealChart.failed,
    },
    destiny: {
      birthCardName,
      birthCardCode,
      prcName,
      prcCode,
      cardRelationships: {
        karmaCard1: relationships?.karma_card_1 ?? null,
        karmaCard2: relationships?.karma_card_2 ?? null,
        karmaCousin1: relationships?.karma_cousin_1 ?? null,
        karmaCousin2: relationships?.karma_cousin_2 ?? null,
        pastLife1: relationships?.past_life_1 ?? null,
        pastLife2: relationships?.past_life_2 ?? null,
      },
      lifeSpread: {
        moon: lifeSpreadRow?.moon ?? null,
        mercury: lifeSpreadRow?.mercury ?? null,
        venus: lifeSpreadRow?.venus ?? null,
        mars: lifeSpreadRow?.mars ?? null,
        jupiter: lifeSpreadRow?.jupiter ?? null,
        saturn: lifeSpreadRow?.saturn ?? null,
        uranus: lifeSpreadRow?.uranus ?? null,
        neptune: lifeSpreadRow?.neptune ?? null,
        pluto: lifeSpreadRow?.pluto ?? null,
        result: lifeSpreadRow?.result ?? null,
        cosmicLesson: lifeSpreadRow?.cosmic_lesson ?? null,
        longRange: lifeSpreadRow?.long_range ?? null,
        displacement: lifeSpreadRow?.displacement ?? null,
      },
    },
    nameFrequency: {
      lifePath,
      expression,
      soulUrge,
    },
    numerology: {
      lifePath,
      personalYear,
    },
    chineseZodiac: chinese,
    chakras,
    medicineWheel,
  };

  return { ok: true, result };
}

async function saveToClientAction(
  clientId: string,
  payload: SavePayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";

  const { data: existing } = await supabaseAdmin
    .from("birthprints")
    .select("id")
    .eq("client_id", clientId)
    .maybeSingle<{ id: string }>();

  // Persist the system calculation alongside the admin's edits and any
  // manually selected destiny cards. The full payload lands in JSONB so
  // every override is recoverable later.
  const body = payload as unknown as object;

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from("birthprints")
      .update({
        data: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabaseAdmin.from("birthprints").insert({
      client_id: clientId,
      data: body,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/birthprints");
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true };
}

type CalculatorPageProps = {
  searchParams: Promise<{ client?: string }>;
};

export default async function AdminBirthprintCalculatorPage({
  searchParams,
}: CalculatorPageProps) {
  const { client: clientParam } = await searchParams;

  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("id, full_name, created_at")
    .order("created_at", { ascending: true })
    .returns<Array<{ id: string; full_name: string; created_at: string }>>();

  const clientPicks: ClientPick[] = (clients ?? []).map((c, i) => ({
    id: c.id,
    mhbNumber: `MHB-${String(i + 1).padStart(4, "0")}`,
    fullName: c.full_name,
  }));

  let prefill: import("@/components/admin/birthprints/CalculatorForm").CalcInput | null = null;
  let prefillName: string | null = null;
  if (clientParam) {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select(
        "id, full_name, date_of_birth, time_of_birth, place_of_birth",
      )
      .eq("id", clientParam)
      .maybeSingle<{
        id: string;
        full_name: string;
        date_of_birth: string;
        time_of_birth: string | null;
        place_of_birth: string | null;
      }>();
    if (client) {
      prefillName = client.full_name;
      prefill = {
        full_name: client.full_name,
        chosen_name: "",
        date_of_birth: client.date_of_birth,
        time_of_birth: client.time_of_birth
          ? client.time_of_birth.slice(0, 5)
          : "",
        time_unknown: !client.time_of_birth,
        place_of_birth: client.place_of_birth ?? "",
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/birthprints/calculator" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className={EYEBROW}>Birthprint Calculator</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              Calculate a birthprint.
            </h1>
          </div>
          <CalculatorForm
            clients={clientPicks}
            initial={prefill}
            prefillClientName={prefillName}
            calculate={calculateAction}
            saveToClient={saveToClientAction}
          />
        </div>
      </main>
    </div>
  );
}
