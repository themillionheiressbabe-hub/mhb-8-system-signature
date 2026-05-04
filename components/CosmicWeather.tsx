import FlipCard from "@/components/FlipCard";
import PlanetaryPositions from "@/components/PlanetaryPositions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAllPlanets, getMoonData, getSunData } from "@/lib/astrology/ephemeris";
import { getDailyNumerology } from "@/lib/astrology/daily-collective";

type Context = "public" | "portal" | "admin";

type Props = {
  context?: Context;
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

export async function CosmicWeather({ context = "public" }: Props) {
  const { iso: cacheDate, month, day, formatted: formattedDate } =
    getUkDateParts();

  // 1) Try cache first (daily_reads_cache)
  const { data: cached } = await supabaseAdmin
    .from("daily_reads_cache")
    .select("daily_read, card_code")
    .eq("cache_date", cacheDate)
    .maybeSingle<CachedRead>();

  // 2) Fall back to daily_card_lookup
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
  // Sun data fetched alongside moon for completeness; planets array also includes the sun.
  void getSunData(ukNoon);
  const numerology = getDailyNumerology(ukNoon);
  const planets = getAllPlanets(ukNoon);

  const cardName = card ? card.card_name.replace(/\s*\(.*$/, "") : "";
  const cardValue = card
    ? card.value === "Joker"
      ? "★"
      : card.value
    : "";

  const cardCtaHref =
    context === "portal"
      ? "/dashboard/daily-cards"
      : "/tools/daily-frequency";
  const cardCtaLabel =
    context === "portal" ? "See your personal read" : "Get my personal read";

  const chartLinkHref =
    context === "portal" || context === "admin"
      ? "/dashboard/birthprint"
      : undefined;

  return (
    <div className="flex flex-col gap-12">
      {/* HERO BAR */}
      <div className="text-center">
        <p className="serif text-white text-xl font-light">
          {formattedDate}
        </p>
        <p className="text-gold text-sm mt-1">
          {moon.emoji} {moon.phase} in {moon.sign}
        </p>
        {numerology.meaning ? (
          <p className="text-white/50 text-xs mt-1">
            Day {numerology.number} &middot; {numerology.meaning}
          </p>
        ) : (
          <p className="text-white/50 text-xs mt-1">
            Day {numerology.number}
          </p>
        )}
      </div>

      {/* CARD OF THE DAY */}
      <section>
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
            />
            <p className="serif-it text-gold text-center mt-5">
              The collective energy is the same for everyone. What changes is
              how it lands for you.
            </p>
            <p className="text-center mt-3">
              <a
                href={cardCtaHref}
                className="text-gold text-sm hover:text-gold-bright transition-colors"
              >
                {cardCtaLabel} &rarr;
              </a>
            </p>
          </>
        ) : (
          <p className="text-gold/70 text-center">
            No card data found for today
          </p>
        )}
      </section>

      {/* PLANETARY POSITIONS */}
      <section>
        <div className="text-center mb-5">
          <h2 className="serif text-white text-xl font-light">
            Where the Planets Are Right Now
          </h2>
          <p className="text-gold/50 text-xs mt-1">
            Live positions. Recalculated daily.
          </p>
        </div>
        <PlanetaryPositions
          planets={planets}
          chartLinkHref={chartLinkHref}
        />
      </section>
    </div>
  );
}
