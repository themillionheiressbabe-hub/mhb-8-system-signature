import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getDailyNumerology,
  getDailySunSign,
  getMoonData,
} from "@/lib/astrology/daily-collective";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getUkDateParts(): { iso: string; month: number; day: number; formatted: string } {
  const now = new Date();
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [, month, day] = iso.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return { iso, month, day, formatted };
}

// Shared cron handler used by both POST (admin "Regenerate Today" /
// "Trigger Now" buttons) and GET (Vercel scheduled cron invocation, which
// always uses GET). The CRON_SECRET is required on both paths.
async function handleGenerateDailyRead(request: Request) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    ?? request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { iso: cacheDate, month, day, formatted: formattedDate } = getUkDateParts();

  const { data: existing } = await supabaseAdmin
    .from("daily_reads_cache")
    .select("id")
    .eq("cache_date", cacheDate)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ cached: true, cacheDate });
  }

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", month)
    .eq("day", day)
    .single<{ card_code: string }>();

  if (!lookup) {
    return NextResponse.json({ error: "No card for today" }, { status: 404 });
  }

  const { data: card } = await supabaseAdmin
    .from("card_library")
    .select("card_name")
    .eq("card_code", lookup.card_code)
    .single<{ card_name: string }>();

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const ukNoon = new Date(`${cacheDate}T12:00:00Z`);
  const numerology = getDailyNumerology(ukNoon);
  const sunSign = getDailySunSign(ukNoon);
  const moon = getMoonData(ukNoon);

  const cardName = card.card_name.replace(/\s*\(.*$/, "");

  const userPrompt = `Today is ${formattedDate}.

Four lenses are informing today's read:
- Destiny Card: ${cardName}
- Numerology: Day ${numerology.number} — ${numerology.meaning}
- Sun season: ${sunSign.sign} — ${sunSign.theme}
- Moon: ${moon.phase} in ${moon.sign} (${moon.illumination}% illuminated)

Write today's collective read in 3-4 short paragraphs. 1-2 sentences each. Breathable. White space between them.

Name each lens once in plain language as you weave it in. Like this:
- "Today's card is the [card name]." or just reference what the card energy is doing
- "Today's numerology is [number] — [what that means in plain words]."
- "We are in [sign] season — [what that means in plain words]."
- "The moon is [phase] in [sign] — [what that emotional weather is doing]."

Then show how the four are in conversation with each other. What are they saying together? Where do they agree? Where is the tension?

Second person. Plain prose. No em dashes. No spiritual brochure language. No guru tone. Short sentences. Breathable paragraphs.`;

  let dailyRead = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
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
    dailyRead = block.type === "text" ? block.text.trim() : "";
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 },
    );
  }

  if (!dailyRead) {
    return NextResponse.json({ error: "Empty generation" }, { status: 500 });
  }

  const { error: insertError } = await supabaseAdmin
    .from("daily_reads_cache")
    .insert({
      cache_date: cacheDate,
      card_code: lookup.card_code,
      daily_read: dailyRead,
      numerology_number: numerology.number,
      numerology_meaning: numerology.meaning,
      sun_sign: sunSign.sign,
      sun_sign_theme: sunSign.theme,
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Insert failed", detail: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ generated: true, cacheDate });
}

export function GET(request: Request) {
  return handleGenerateDailyRead(request);
}

export function POST(request: Request) {
  return handleGenerateDailyRead(request);
}
