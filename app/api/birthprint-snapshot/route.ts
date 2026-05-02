import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getDailySunSign } from "@/lib/astrology/daily-collective";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PYTHAGOREAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const SUIT_NAME: Record<string, string> = {
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
  spades: "Spades",
  joker: "Joker",
};

const ANIMALS = [
  "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox",
  "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat",
];
const ELEMENTS = [
  "Metal", "Metal", "Water", "Water", "Wood",
  "Wood", "Fire", "Fire", "Earth", "Earth",
];

function reduceNum(n: number): number {
  if (n === 11 || n === 22) return n;
  if (n < 10) return n;
  let sum = 0;
  for (const ch of String(n)) sum += parseInt(ch, 10);
  return reduceNum(sum);
}

function nameNumbers(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  let exp = 0;
  let soul = 0;
  let personality = 0;
  for (const ch of letters) {
    const v = PYTHAGOREAN[ch];
    if (!v) continue;
    exp += v;
    if (VOWELS.has(ch)) soul += v;
    else personality += v;
  }
  return {
    expression: reduceNum(exp),
    soulUrge: reduceNum(soul),
    personality: reduceNum(personality),
  };
}

function calcLifePath(year: number, month: number, day: number): number {
  const dayN = reduceNum(day);
  const monthN = reduceNum(month);
  let yearSum = 0;
  for (const ch of String(year)) yearSum += parseInt(ch, 10);
  const yearN = reduceNum(yearSum);
  return reduceNum(dayN + monthN + yearN);
}

function chineseZodiac(year: number, month: number, day: number) {
  let animalYear = year;
  if (month === 1) animalYear = year - 1;
  else if (month === 2 && day < 10) animalYear = year - 1;
  const animalIndex = ((animalYear % 12) + 12) % 12;
  const elementIndex = ((year % 10) + 10) % 10;
  return {
    animal: ANIMALS[animalIndex],
    element: ELEMENTS[elementIndex],
    yinYang: year % 2 === 0 ? "Yang" : "Yin",
  };
}

type CardRow = {
  card_name: string;
  suit: string;
  core_theme: string | null;
  daily_energy_body: string | null;
};

export async function POST(request: Request) {
  let body: { fullName?: string; chosenName?: string; dob?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const chosenName = body.chosenName?.trim() ?? "";
  const dob = body.dob?.trim() ?? "";

  if (!fullName || !dob) {
    return NextResponse.json(
      { error: "fullName and dob are required" },
      { status: 400 },
    );
  }

  const dobMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!dobMatch) {
    return NextResponse.json({ error: "Invalid dob format" }, { status: 400 });
  }
  const year = Number(dobMatch[1]);
  const month = Number(dobMatch[2]);
  const day = Number(dobMatch[3]);

  const sunSign = getDailySunSign(new Date(dob));

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", month)
    .eq("day", day)
    .single<{ card_code: string }>();

  if (!lookup) {
    return NextResponse.json(
      { error: "No destiny card found for this date" },
      { status: 404 },
    );
  }

  const { data: card } = await supabaseAdmin
    .from("card_library")
    .select("card_name, suit, core_theme, daily_energy_body")
    .eq("card_code", lookup.card_code)
    .single<CardRow>();

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 500 });
  }

  const cardName = card.card_name.replace(/\s*\(.*$/, "");
  const suitLabel = SUIT_NAME[card.suit] ?? card.suit;

  const fullNameNumbers = nameNumbers(fullName);
  const chosenDiffersFromFull =
    chosenName.length > 0 &&
    chosenName.toLowerCase() !== fullName.toLowerCase();
  const chosenNameExpression = chosenDiffersFromFull
    ? nameNumbers(chosenName).expression
    : null;

  const lifePath = calcLifePath(year, month, day);
  const zodiac = chineseZodiac(year, month, day);

  const firstName = chosenName || fullName.split(/\s+/)[0];

  const userPrompt = `TASK: Birthprint Snapshot read

Client name: ${firstName}

Five lenses from her birth data:

1. Sun Sign: ${sunSign.sign} (${sunSign.element}, ${sunSign.quality}) — ${sunSign.theme}

2. Destiny Card: ${cardName} (${suitLabel}) — ${card.core_theme ?? ""}. Card energy: ${card.daily_energy_body ?? ""}

3. Name Frequency:
   Birth name Expression: ${fullNameNumbers.expression} (how she is wired to express in the world)
   Chosen name Expression: ${chosenNameExpression ?? "not provided"}
   Soul Urge: ${fullNameNumbers.soulUrge} (what she actually wants underneath)
   Personality: ${fullNameNumbers.personality} (how she comes across to others)
   ${
     chosenNameExpression !== null
       ? `Note the gap: her birth name carries Expression ${fullNameNumbers.expression} but the name she actually goes by carries Expression ${chosenNameExpression}. If there is a real difference between these two numbers, name what that gap might mean. The name she chose is the frequency she is actively running. The name on her birth certificate is the frequency she was given. The space between them often holds something honest about who she has become versus who she was named to be.`
       : ""
   }

4. Life Path: ${lifePath} (her primary life theme and timing)

5. Chinese Zodiac: ${zodiac.yinYang} ${zodiac.element} ${zodiac.animal}

Write a Birthprint Snapshot read. This is a free 5-lens preview, not a full report. 4-5 short paragraphs. Breathable. 1-2 sentences each.

Structure:
- Open by naming the dominant pattern you see across the most lenses. What keeps showing up?
- Name what she is built for. Identity framing. "You are the woman who..."
- Name the shadow that runs alongside it. Compassion-framed. Externalised.
- Name what this year or this season is asking of her specifically.
- Close with one line she can carry.

Use her name (${firstName}) once, naturally, in the opening.

Do not name which lens said what. Weave the patterns together. Show the receipts without showing the recipe.
Second person. Plain prose. No em dashes. No bullet points. No headers. No lens labels.`;

  let snapshot = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: BABE_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    snapshot = block.type === "text" ? block.text.trim() : "";
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 },
    );
  }

  if (!snapshot) {
    return NextResponse.json({ error: "Empty generation" }, { status: 500 });
  }

  return NextResponse.json({
    snapshot,
    cardCode: lookup.card_code,
    cardName,
    suit: card.suit,
    lifePath,
    expressionNumber: fullNameNumbers.expression,
    chosenName: chosenDiffersFromFull ? chosenName : null,
    chosenNameExpression,
    sunSign: sunSign.sign,
    animal: zodiac.animal,
    element: zodiac.element,
    yinYang: zodiac.yinYang,
  });
}
