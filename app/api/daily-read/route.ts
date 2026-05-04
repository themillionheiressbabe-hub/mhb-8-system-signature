import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getUkDateIso(): { iso: string; month: number; day: number } {
  const now = new Date();
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [, month, day] = iso.split("-").map(Number);
  return { iso, month, day };
}

type CachedRead = { daily_read: string; card_code: string };

type CardRow = {
  card_name: string;
  suit: string;
  value: string;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
  daily_energy_cta: string | null;
};

export async function GET() {
  const { iso: cacheDate, month, day } = getUkDateIso();

  const { data: cached } = await supabaseAdmin
    .from("daily_reads_cache")
    .select("daily_read, card_code")
    .eq("cache_date", cacheDate)
    .maybeSingle<CachedRead>();

  let cardCode = cached?.card_code ?? null;
  if (!cardCode) {
    const { data: lookup } = await supabaseAdmin
      .from("daily_card_lookup")
      .select("card_code")
      .eq("month", month)
      .eq("day", day)
      .single<{ card_code: string }>();
    cardCode = lookup?.card_code ?? null;
  }

  if (!cardCode) {
    return NextResponse.json(
      { error: "No card for today" },
      { status: 404 },
    );
  }

  const { data: card } = await supabaseAdmin
    .from("card_library")
    .select(
      "card_name, suit, value, daily_energy_heading, daily_energy_body, daily_energy_cta",
    )
    .eq("card_code", cardCode)
    .single<CardRow>();

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json({
    dailyRead: cached?.daily_read ?? null,
    cardCode,
    cardName: card.card_name.replace(/\s*\(.*$/, ""),
    cardSuit: card.suit,
    cardValue: card.value,
    dailyEnergyHeading: card.daily_energy_heading,
    dailyEnergyBody: card.daily_energy_body,
    dailyEnergyCta: card.daily_energy_cta,
  });
}
