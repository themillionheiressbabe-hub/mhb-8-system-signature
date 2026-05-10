import type { Metadata } from "next";
import Link from "next/link";
import Anthropic from "@anthropic-ai/sdk";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Orbit } from "@/components/Orbit";
import FlipCard from "@/components/FlipCard";
import ProseBlock from "@/components/ProseBlock";
import RealisticMoon from "@/components/ui/RealisticMoon";
import TransitWheel from "@/components/TransitWheel";
import TransitInsights from "@/components/TransitInsights";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAllPlanets, getMoonData } from "@/lib/astrology/ephemeris";
import { getDailyNumerology } from "@/lib/astrology/daily-collective";
import { BABE_SYSTEM_PROMPT } from "@/lib/prompts/system-prompt";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SIGN_ELEMENT_LOOKUP: Record<string, string> = {
  Aries: "fire",
  Taurus: "earth",
  Gemini: "air",
  Cancer: "water",
  Leo: "fire",
  Virgo: "earth",
  Libra: "air",
  Scorpio: "water",
  Sagittarius: "fire",
  Capricorn: "earth",
  Aquarius: "air",
  Pisces: "water",
};

export const metadata: Metadata = {
  title: "Today's Cosmic Energy",
};

type CachedRead = { daily_read: string; card_code: string };

type CardRow = {
  card_code: string;
  card_name: string;
  suit: string;
  value: string;
  core_theme: string | null;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
  daily_energy_cta: string | null;
  locked_in_summary: string | null;
};

function reduceToSingleDigit(n: number): number {
  while (n > 9 && n !== 11 && n !== 22) {
    n = String(n)
      .split("")
      .reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return n;
}

const UNIVERSAL_DAY_MEANINGS: Record<number, string> = {
  1: "Today carries the energy of initiation. It is a good day to start something, make a decision you have been sitting on, or take a first step. The Universal Year 1 and a Universal Day 1 running together doubles the initiation energy. What you begin today is not accidental.",
  2: "Today carries the energy of partnership and patience. The impulse to force a result will not serve you. Connection, cooperation, and sensitivity to others are where today's energy flows. Listen more than you speak.",
  3: "Today carries the energy of expression and creativity. Say the thing. Create the thing. Share the thing. The energy supports communication, social connection, and anything that requires you to put yourself out there.",
  4: "Today carries the energy of foundation and discipline. Practical work, systems, and structure are supported. This is not a day for grand vision. It is a day to build the thing that holds the vision.",
  5: "Today carries the energy of change and movement. Expect the unexpected. Flexibility is your greatest asset. Resist the urge to lock anything down today.",
  6: "Today carries the energy of responsibility and care. Family, home, and the people who depend on you are the focus. Service is the theme. Make sure what you are giving is genuinely chosen.",
  7: "Today carries the energy of reflection and inner truth. Go inward rather than outward. Research, study, and solitude serve you better than socialising or pushing for results. What you discover today is worth knowing.",
  8: "Today carries the energy of power and material focus. Money, career, and tangible outcomes are highlighted. The work you have put in is ready to produce results. Step into the authority.",
  9: "Today carries the energy of completion and release. Something is finishing. Let it. Clear the ground rather than starting something new. Endings today create the space for what the 1 energy wants to begin.",
  11: "Today carries master number energy. Heightened sensitivity, intuition, and spiritual awareness are running high. Trust what arrives without demanding it make logical sense.",
  22: "Today carries master builder energy. What you work on today has the potential to outlast the moment. Think at scale.",
};

function getUkDateParts(): {
  iso: string;
  month: number;
  day: number;
  formatted: string;
} {
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

export default async function ToolsPage() {
  const { iso: cacheDate, month, day, formatted: formattedDate } =
    getUkDateParts();

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

  let card: CardRow | null = null;
  if (cardCode) {
    const { data: cardData } = await supabaseAdmin
      .from("card_library")
      .select(
        "card_code, card_name, suit, value, core_theme, daily_energy_heading, daily_energy_body, daily_energy_cta, locked_in_summary",
      )
      .eq("card_code", cardCode)
      .single<CardRow>();
    card = cardData;
  }

  const ukNoon = new Date(`${cacheDate}T12:00:00Z`);
  const moon = getMoonData(ukNoon);
  const planets = getAllPlanets(ukNoon);
  const numerology = getDailyNumerology(ukNoon);

  const cardName = card ? card.card_name.replace(/\s*\(.*$/, "") : "";
  const cardValue = card
    ? card.value === "Joker"
      ? "★"
      : card.value
    : "";

  const today = new Date();
  const universalDay = reduceToSingleDigit(
    today.getDate() + (today.getMonth() + 1) + today.getFullYear(),
  );
  const universalDayMeaning = UNIVERSAL_DAY_MEANINGS[universalDay] ?? "";

  // Synthesis read — cached in daily_reads_cache.synthesis_read, generated on miss.
  // Wrapped so a missing column or API error degrades to no synthesis section.
  let synthesisRead: string | null = null;
  const retrogradeNames = planets
    .filter((p) => p.isRetrograde)
    .map((p) => p.name);
  try {
    const { data: synth } = await supabaseAdmin
      .from("daily_reads_cache")
      .select("synthesis_read")
      .eq("cache_date", cacheDate)
      .maybeSingle<{ synthesis_read: string | null }>();

    if (synth?.synthesis_read) {
      synthesisRead = synth.synthesis_read;
    } else if (anthropic && card) {
      const elementCounts: Record<string, number> = {};
      for (const p of planets) {
        const el = SIGN_ELEMENT_LOOKUP[p.sign];
        if (el) elementCounts[el] = (elementCounts[el] ?? 0) + 1;
      }
      const dominantElement =
        Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "balanced";
      const sunPlanet = planets.find((p) => p.name === "Sun");
      const sunSignName = sunPlanet?.sign ?? "Unknown";

      const userPrompt = `TASK: Daily collective synthesis read for the Cosmic Weather page.

Today's date: ${formattedDate}
Universal Year: 1 (New Beginnings)
Universal Day: ${universalDay} (${numerology.meaning})
Moon: ${moon.phase} in ${moon.sign}
Sun: in ${sunSignName}
Dominant sky element: ${dominantElement}
Retrograde planets: ${retrogradeNames.length > 0 ? retrogradeNames.join(", ") : "none"}
Today's collective Destiny Card: ${cardName} (${card.suit})
Card core theme: ${card.core_theme ?? ""}

Write one paragraph of 3-4 sentences. This is the synthesis that ties all of these systems together into one coherent read of what today means collectively. Not a list. Not a summary of each system. One flowing read that shows what all the systems are saying together. What is the dominant theme when you look at all of this at once? Second person. Plain prose. BABE voice. No em dashes.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
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
      synthesisRead = block.type === "text" ? block.text.trim() : null;

      // Best-effort cache: succeeds when today's row already exists (cron has run);
      // silently no-ops otherwise and we will regenerate next load.
      if (synthesisRead) {
        await supabaseAdmin
          .from("daily_reads_cache")
          .update({ synthesis_read: synthesisRead })
          .eq("cache_date", cacheDate);
      }
    }
  } catch (err) {
    console.error("synthesis read failed:", err);
    synthesisRead = null;
  }

  return (
    <div className="flex-1">
      <Navbar />

      <RealisticMoon phase={moon.phase} size={140} />

      <main className="pt-24 pb-24">
        {/* ORBIT */}
        <div className="flex justify-center mb-8">
          <Orbit />
        </div>

        {/* 1. HERO BAR */}
        <section className="text-center px-6 pb-8">
          <p className="text-gold uppercase text-xs tracking-widest">
            TODAY&rsquo;S COSMIC ENERGY
          </p>
          <h1 className="serif-it text-white text-3xl mt-3">
            {formattedDate}
          </h1>
          <p className="text-gold text-sm mt-1">
            {moon.emoji} {moon.phase} in {moon.sign}
          </p>
        </section>

        {/* 2. TODAY'S COLLECTIVE READ — synthesis */}
        {synthesisRead ? (
          <section className="max-w-4xl mx-auto px-6 mb-12">
            <div
              className="border border-gold/40 rounded-[20px] p-8"
              style={{
                background:
                  "linear-gradient(135deg, #0D1220 0%, #0A0E1A 100%)",
              }}
            >
              <p className="text-gold uppercase text-xs tracking-widest mb-3">
                TODAY&rsquo;S COLLECTIVE READ
              </p>
              <ProseBlock text={synthesisRead} />

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="border border-gold/25 text-white/60 text-xs rounded-full px-3 py-1">
                  {moon.emoji} {moon.phase}
                </span>
                {cardName ? (
                  <span className="border border-gold/25 text-white/60 text-xs rounded-full px-3 py-1">
                    {cardName}
                  </span>
                ) : null}
                <span className="border border-gold/25 text-white/60 text-xs rounded-full px-3 py-1">
                  Day {universalDay}
                </span>
                {retrogradeNames.map((name) => (
                  <span
                    key={`rx-${name}`}
                    className="border border-gold/25 text-white/60 text-xs rounded-full px-3 py-1"
                  >
                    ⟲ {name} Rx
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* 3. TRANSIT WHEEL + INSIGHTS */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="w-full md:w-[280px] md:flex-shrink-0">
              <TransitWheel
                planets={planets}
                moonEmoji={moon.emoji}
                moonSign={moon.sign}
              />
            </div>
            <div className="flex-1 w-full">
              <TransitInsights
                planets={planets}
                numerologyMeaning={numerology.meaning}
              />
            </div>
          </div>
        </section>

        {/* SEPARATOR */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-gold/10 my-12" />
        </div>

        {/* 4. UNIVERSAL YEAR */}
        <section className="max-w-4xl mx-auto px-6 mb-8">
          <div className="bg-navy-card border border-gold/30 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-center">
            <div>
              <p className="text-gold uppercase text-xs tracking-widest">
                2026 UNIVERSAL YEAR
              </p>
              <h2 className="serif-it text-white text-2xl mt-2">
                The Year of New Beginnings
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mt-3">
                2026 reduces to 1 (2+0+2+6=10, 1+0=1). A Universal Year 1 is a
                collective reset. The previous 9-year cycle has completed. What
                begins now, personally, culturally, globally, carries the seed
                of the next nine years. The energy rewards initiation over
                continuation, building over maintaining, and bold first moves
                over cautious refinement. What you start in a Universal Year 1
                tends to define the chapter ahead.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <p className="serif text-magenta text-7xl leading-none">1</p>
              <p className="text-gold/60 uppercase text-xs tracking-widest mt-2">
                Universal Year
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="border border-gold/30 text-gold/60 text-xs rounded-full px-3 py-1">
                  New Cycle
                </span>
                <span className="border border-gold/30 text-gold/60 text-xs rounded-full px-3 py-1">
                  Initiation
                </span>
                <span className="border border-gold/30 text-gold/60 text-xs rounded-full px-3 py-1">
                  Foundation
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. UNIVERSAL DAY */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="bg-navy-card border border-gold/20 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="text-center md:text-left">
              <p className="serif text-gold text-6xl leading-none">
                {universalDay}
              </p>
            </div>
            <div>
              <p className="text-gold uppercase text-xs tracking-widest">
                UNIVERSAL DAY {universalDay}
              </p>
              <p className="text-white/80 text-sm leading-relaxed mt-2">
                {universalDayMeaning}
              </p>
            </div>
          </div>
        </section>

        {/* SEPARATOR */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-gold/10 my-12" />
        </div>

        {/* 6. DIVIDER — CARD OF THE DAY */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold uppercase text-xs tracking-widest">
              CARD OF THE DAY
            </span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>
        </div>

        {/* 7. FLIP CARD */}
        <section className="max-w-xl mx-auto px-6 mb-12">
          {card ? (
            <>
              <FlipCard
                value={cardValue}
                suit={card.suit}
                cardName={cardName}
                coreTheme={card.core_theme ?? ""}
                dailyEnergyHeading={card.daily_energy_heading ?? ""}
                dailyEnergyBody={
                  card.daily_energy_body ?? card.locked_in_summary ?? ""
                }
                dailyEnergyCta={card.daily_energy_cta ?? ""}
                todayCardCode={card.card_code}
                hideBackLink
              />
              <p className="text-white/40 text-xs text-center mt-4">
                Click to reveal today&rsquo;s full energy read
              </p>
            </>
          ) : (
            <p className="text-gold/70 text-center">
              No card data found for today
            </p>
          )}
        </section>

        {/* 8. DIVIDER — FREE TOOLS */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold uppercase text-xs tracking-widest">
              FREE TOOLS
            </span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>
        </div>

        {/* 9. FREE TOOL CARDS */}
        <section className="max-w-2xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-navy-card border border-gold/30 rounded-xl p-5 flex flex-col">
              <p className="text-gold uppercase text-xs tracking-widest">
                Personal read
              </p>
              <h3 className="serif-it text-white text-lg mt-2">
                Card of the Day
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mt-2 flex-1">
                Your birth card meets today&rsquo;s collective energy.
              </p>
              <div className="mt-5">
                <Link
                  href="/tools/daily-frequency"
                  className="btn btn-primary btn-sm"
                >
                  Get my personal read
                </Link>
              </div>
            </div>

            <div className="bg-navy-card border border-gold/30 rounded-xl p-5 flex flex-col">
              <p className="text-gold uppercase text-xs tracking-widest">
                Pattern preview
              </p>
              <h3 className="serif-it text-white text-lg mt-2">
                Birthprint Snapshot
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mt-2 flex-1">
                Your name and date of birth across four independent systems.
              </p>
              <div className="mt-5">
                <Link
                  href="/tools/birthprint-snapshot"
                  className="btn btn-primary btn-sm"
                >
                  Get my snapshot
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
