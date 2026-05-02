import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  buildThreeLensContext,
  getDailyNumerology,
  getDailySunSign,
} from "@/lib/astrology/daily-collective";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VOICE_SYSTEM_PROMPT = `You are writing for The MillionHeiress BABE, a pattern recognition platform for women. Your voice is warm, direct, Caribbean big-sister energy. Plain. Specific. Never clinical, never guru, never spiritual brochure.

When the user gives you their birth card and today's collective card (with each card's daily energy body), write a combined read of 3-4 sentences that shows how these two energies meet TODAY specifically. Do not summarise each card separately. Write as if the two cards are in conversation with each other. Name the tension or the alignment between them. Be specific to these two cards. Second person (you). No em dashes. No italic markup. No bullet points. No headers. Plain prose only.`;

async function generateCombinedRead(args: {
  birthCardName: string;
  birthCardSuit: string;
  birthCardEnergyBody: string;
  todayCardName: string;
  todayCardSuit: string;
  todayCardEnergyBody: string;
  threeLensContext: string;
}): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 300,
      system: [
        {
          type: "text",
          text: VOICE_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `The client's birth card is ${args.birthCardName} (${args.birthCardSuit}).
Today's collective card is ${args.todayCardName} (${args.todayCardSuit}).

Today's collective context across three lenses:
${args.threeLensContext}

Birth card energy today: ${args.birthCardEnergyBody}

Today's collective card energy: ${args.todayCardEnergyBody}`,
        },
      ],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  } catch {
    return "";
  }
}

type CardRow = {
  card_code: string;
  card_name: string;
  suit: string;
  value: string;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
};

type RelationshipsRow = {
  karma_cards: string[] | null;
  karma_cousins: string[] | null;
  past_life_1: string | null;
  past_life_2: string | null;
};

function stripDescriptor(name: string): string {
  return name.replace(/\s*\(.*$/, "");
}

export async function POST(request: Request) {
  let body: { dob?: string; todayCardCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { dob, todayCardCode } = body;
  if (!dob || !todayCardCode) {
    return NextResponse.json(
      { error: "dob and todayCardCode are required" },
      { status: 400 },
    );
  }

  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Invalid dob" }, { status: 400 });
  }
  const birthMonth = parsed.getUTCMonth() + 1;
  const birthDay = parsed.getUTCDate();

  // 1. Look up the user's birth card code
  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", birthMonth)
    .eq("day", birthDay)
    .single<{ card_code: string }>();

  if (!lookup) {
    return NextResponse.json(
      { error: "Birth card not found" },
      { status: 404 },
    );
  }
  const birthCardCode = lookup.card_code;

  // 2. Fetch both card rows in one query (need today's energy fields too)
  const { data: cards } = await supabaseAdmin
    .from("card_library")
    .select(
      "card_code, card_name, suit, value, daily_energy_heading, daily_energy_body",
    )
    .in("card_code", [birthCardCode, todayCardCode])
    .returns<CardRow[]>();

  const birthCard = cards?.find((c) => c.card_code === birthCardCode);
  const todayCard = cards?.find((c) => c.card_code === todayCardCode);

  if (!birthCard || !todayCard) {
    return NextResponse.json(
      { error: "Card details not found" },
      { status: 500 },
    );
  }

  // 3. Look up relationships using raw card code (e.g. KH)
  const { data: relationships } = await supabaseAdmin
    .from("card_relationships")
    .select("karma_cards, karma_cousins, past_life_1, past_life_2")
    .eq("birth_card", birthCardCode)
    .maybeSingle<RelationshipsRow>();

  // 4. Determine relationship type
  let relationshipType: "karma_card" | "past_life" | "karma_cousin" | "neutral" =
    "neutral";

  if (relationships) {
    const karmaCards = relationships.karma_cards ?? [];
    const karmaCousins = relationships.karma_cousins ?? [];

    if (karmaCards.includes(todayCardCode)) {
      relationshipType = "karma_card";
    } else if (
      relationships.past_life_1 === todayCardCode ||
      relationships.past_life_2 === todayCardCode
    ) {
      relationshipType = "past_life";
    } else if (karmaCousins.includes(todayCardCode)) {
      relationshipType = "karma_cousin";
    }
  }

  const birthCardName = stripDescriptor(birthCard.card_name);
  const todayCardName = stripDescriptor(todayCard.card_name);

  const today = new Date();
  const numerology = getDailyNumerology(today);
  const sunSign = getDailySunSign(today);
  const threeLensContext = buildThreeLensContext(
    todayCardName,
    numerology,
    sunSign,
  );

  const combinedRead = await generateCombinedRead({
    birthCardName,
    birthCardSuit: birthCard.suit,
    birthCardEnergyBody: birthCard.daily_energy_body ?? "",
    todayCardName,
    todayCardSuit: todayCard.suit,
    todayCardEnergyBody: todayCard.daily_energy_body ?? "",
    threeLensContext,
  });

  return NextResponse.json({
    birthCardCode,
    birthCardName,
    birthCardSuit: birthCard.suit,
    birthCardValue: birthCard.value,
    birthCardEnergyHeading: birthCard.daily_energy_heading,
    birthCardEnergyBody: birthCard.daily_energy_body,
    todayCardEnergyHeading: todayCard.daily_energy_heading,
    todayCardEnergyBody: todayCard.daily_energy_body,
    relationshipType,
    combinedRead,
  });
}
