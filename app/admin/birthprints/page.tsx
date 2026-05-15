import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  BirthprintsBoard,
  type BirthprintEntry,
} from "@/components/admin/birthprints/BirthprintsBoard";

async function deleteBirthprintAction(clientId: string) {
  "use server";
  await supabaseAdmin.from("birthprints").delete().eq("client_id", clientId);
  revalidatePath("/admin/birthprints");
}

export const metadata: Metadata = {
  title: "Birthprints · BABE HQ",
};

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  place_of_birth: string | null;
  created_at: string;
};

type CardLookupRow = {
  month: number;
  day: number;
  card_code: string;
};

type CardLibRow = {
  card_code: string;
  card_name: string;
};

const SUITS: BirthprintEntry["suit"][] = [
  "hearts",
  "diamonds",
  "clubs",
  "spades",
];

const TROPICAL_SIGNS: { sign: string; start: [number, number] }[] = [
  { sign: "Capricorn", start: [1, 1] },
  { sign: "Aquarius", start: [1, 20] },
  { sign: "Pisces", start: [2, 19] },
  { sign: "Aries", start: [3, 21] },
  { sign: "Taurus", start: [4, 20] },
  { sign: "Gemini", start: [5, 21] },
  { sign: "Cancer", start: [6, 21] },
  { sign: "Leo", start: [7, 23] },
  { sign: "Virgo", start: [8, 23] },
  { sign: "Libra", start: [9, 23] },
  { sign: "Scorpio", start: [10, 23] },
  { sign: "Sagittarius", start: [11, 22] },
  { sign: "Capricorn", start: [12, 22] },
];

function tropicalSunFromDob(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  let pick = "Capricorn";
  for (const entry of TROPICAL_SIGNS) {
    const [sm, sd] = entry.start;
    if (m > sm || (m === sm && d >= sd)) pick = entry.sign;
  }
  return pick;
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

const CHINESE_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const CHINESE_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth",
  "Earth", "Metal", "Metal", "Water", "Water",
];

function chineseZodiacFromDob(iso: string): string {
  const y = Number(iso.split("-")[0]);
  const animal = CHINESE_ANIMALS[(((y - 4) % 12) + 12) % 12];
  const element = CHINESE_ELEMENTS[(((y - 4) % 10) + 10) % 10];
  return `${element} ${animal}`;
}

const PYTHAGOREAN_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

function expressionNumberFromName(name: string): number | null {
  if (!name) return null;
  let total = 0;
  for (const ch of name.toLowerCase()) {
    const v = PYTHAGOREAN_VALUES[ch];
    if (typeof v === "number") total += v;
  }
  if (total === 0) return null;
  return reduce(total);
}

function medicineWheelFromLifePath(lp: number): string {
  const base = lp === 11 ? 2 : lp === 22 ? 4 : lp === 33 ? 6 : lp;
  if (base === 1 || base === 2) return "North";
  if (base === 3 || base === 4) return "East";
  if (base === 5 || base === 6) return "South";
  return "West";
}

export default async function AdminBirthprintsPage() {
  const { data: clients } = await supabaseAdmin
    .from("clients")
    .select("id, full_name, date_of_birth, place_of_birth, created_at")
    .order("created_at", { ascending: true })
    .returns<ClientRow[]>();

  const clientsAll = clients ?? [];

  const { data: lookups } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("month, day, card_code")
    .returns<CardLookupRow[]>();

  const lookupByKey = new Map<string, string>();
  for (const l of lookups ?? []) {
    lookupByKey.set(`${l.month}-${l.day}`, l.card_code);
  }
  const codes = Array.from(new Set(lookupByKey.values()));
  const cardNameByCode = new Map<string, string>();
  if (codes.length > 0) {
    const { data: cards } = await supabaseAdmin
      .from("card_library")
      .select("card_code, card_name")
      .in("card_code", codes)
      .returns<CardLibRow[]>();
    for (const c of cards ?? [])
      cardNameByCode.set(c.card_code, c.card_name.replace(/\s*\(.*$/, ""));
  }

  const entries: BirthprintEntry[] = clientsAll.map((c, i) => {
    const [, monthStr, dayStr] = c.date_of_birth.split("-");
    const key = `${Number(monthStr)}-${Number(dayStr)}`;
    const code = lookupByKey.get(key);
    const birthCardName = code ? cardNameByCode.get(code) ?? null : null;
    const lifePath = lifePathFromDob(c.date_of_birth);
    return {
      clientId: c.id,
      mhbNumber: `MHB-${String(i + 1).padStart(4, "0")}`,
      suit: SUITS[i % SUITS.length],
      fullName: c.full_name,
      dateOfBirth: c.date_of_birth,
      placeOfBirth: c.place_of_birth,
      createdAt: c.created_at,
      lenses: {
        tropicalSun: tropicalSunFromDob(c.date_of_birth),
        siderealSun: null,
        birthCardName,
        expressionNumber: expressionNumberFromName(c.full_name),
        lifePath,
        chineseZodiac: chineseZodiacFromDob(c.date_of_birth),
        dominantChakra: null,
        medicineWheelDirection: medicineWheelFromLifePath(lifePath),
      },
    };
  });

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/birthprints" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <BirthprintsBoard
          entries={entries}
          deleteBirthprint={deleteBirthprintAction}
        />
      </main>
    </div>
  );
}
