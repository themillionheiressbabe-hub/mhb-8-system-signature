import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CosmicWeather } from "@/components/CosmicWeather";
import CardArt from "@/components/CardArt";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ClientRow = {
  full_name: string;
  date_of_birth: string;
};

type CardRow = {
  card_code: string;
  card_name: string;
  suit: string;
  value: string;
};

type RelationshipsRow = {
  karma_cards: string[] | null;
  karma_cousins: string[] | null;
  past_life_1: string | null;
  past_life_2: string | null;
};

type CachedRead = { card_code: string };

type Relationship = "karma_card" | "past_life" | "karma_cousin" | "neutral";

const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  karma_card: "KARMA CARD",
  past_life: "PAST LIFE",
  karma_cousin: "KARMA COUSIN",
  neutral: "NEUTRAL",
};

const RELATIONSHIP_PILL: Record<Relationship, string> = {
  karma_card: "bg-magenta text-white",
  past_life: "bg-violet text-white",
  karma_cousin: "border border-gold text-gold",
  neutral: "border border-cream/30 text-cream/60",
};

const RELATIONSHIP_LINE: Record<Relationship, string> = {
  karma_card:
    "Today's collective card is one of your karma cards. The energy has a direct line to your core pattern.",
  past_life:
    "Today's collective card is one of your past life cards. Old soul resonance is active.",
  karma_cousin:
    "Today's collective card is a karma cousin to your birth card. A secondary resonance is running.",
  neutral:
    "Today's collective card meets your birth card without a karma or past life link. Notice what you notice.",
};

function getUkDateParts(): { iso: string; month: number; day: number } {
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

function stripDescriptor(name: string): string {
  return name.replace(/\s*\(.*$/, "");
}

function cardValueDisplay(value: string): string {
  return value === "Joker" ? "★" : value;
}

export default async function DashboardCosmicWeatherPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1) Fetch user's first client record (their own birth date)
  const { data: client } = await supabase
    .from("clients")
    .select("full_name, date_of_birth")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<ClientRow>();

  // 2) Fetch today's collective card via cache then lookup fallback
  const { iso: cacheDate, month, day } = getUkDateParts();

  const { data: cached } = await supabaseAdmin
    .from("daily_reads_cache")
    .select("card_code")
    .eq("cache_date", cacheDate)
    .maybeSingle<CachedRead>();

  let todayCardCode = cached?.card_code ?? null;
  if (!todayCardCode) {
    const { data: lookup } = await supabaseAdmin
      .from("daily_card_lookup")
      .select("card_code")
      .eq("month", month)
      .eq("day", day)
      .single<{ card_code: string }>();
    todayCardCode = lookup?.card_code ?? null;
  }

  // 3) If client has DOB, look up birth card and relationship
  let birthCard: CardRow | null = null;
  let todayCard: CardRow | null = null;
  let relationship: Relationship = "neutral";

  if (client?.date_of_birth && todayCardCode) {
    const dob = new Date(client.date_of_birth);
    const birthMonth = dob.getUTCMonth() + 1;
    const birthDay = dob.getUTCDate();

    const { data: birthLookup } = await supabaseAdmin
      .from("daily_card_lookup")
      .select("card_code")
      .eq("month", birthMonth)
      .eq("day", birthDay)
      .single<{ card_code: string }>();

    const birthCardCode = birthLookup?.card_code ?? null;

    if (birthCardCode) {
      const { data: cards } = await supabaseAdmin
        .from("card_library")
        .select("card_code, card_name, suit, value")
        .in("card_code", [birthCardCode, todayCardCode])
        .returns<CardRow[]>();

      birthCard = cards?.find((c) => c.card_code === birthCardCode) ?? null;
      todayCard = cards?.find((c) => c.card_code === todayCardCode) ?? null;

      const { data: relRow } = await supabaseAdmin
        .from("card_relationships")
        .select("karma_cards, karma_cousins, past_life_1, past_life_2")
        .eq("birth_card", birthCardCode)
        .maybeSingle<RelationshipsRow>();

      if (relRow) {
        const karma = relRow.karma_cards ?? [];
        const cousins = relRow.karma_cousins ?? [];
        if (karma.includes(todayCardCode)) relationship = "karma_card";
        else if (
          relRow.past_life_1 === todayCardCode ||
          relRow.past_life_2 === todayCardCode
        )
          relationship = "past_life";
        else if (cousins.includes(todayCardCode))
          relationship = "karma_cousin";
      }
    }
  }

  return (
    <div className="flex-1">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/dashboard"
            className="text-gold text-sm hover:underline inline-block mb-6"
          >
            &larr; Dashboard
          </Link>

          <CosmicWeather context="portal" />

          {/* YOUR CARDS TODAY */}
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gold/30" />
              <span className="text-gold uppercase text-xs tracking-widest">
                YOUR CARDS TODAY
              </span>
              <div className="flex-1 h-px bg-gold/30" />
            </div>

            {!client?.date_of_birth ? (
              <div className="bg-navy-card border border-gold/30 rounded-2xl p-6 text-center">
                <p className="text-white/70 text-sm">
                  Add your birth date to unlock your daily card pairing.
                </p>
                <div className="mt-4">
                  <Link
                    href="/tools/birthprint-snapshot"
                    className="btn btn-outline btn-sm"
                  >
                    Calculate your Birthprint
                  </Link>
                </div>
              </div>
            ) : !birthCard || !todayCard ? (
              <p className="text-gold/70 text-center text-sm">
                Card data unavailable for today.
              </p>
            ) : (
              <div className="bg-navy-card border border-gold/30 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-5 sm:gap-8 items-center">
                  {/* Birth card */}
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-gold uppercase text-xs tracking-widest">
                      Your Birth Card
                    </p>
                    <CardArt
                      value={cardValueDisplay(birthCard.value)}
                      suit={birthCard.suit}
                      size="sm"
                    />
                    <p className="text-cream text-sm text-center">
                      {stripDescriptor(birthCard.card_name)}
                    </p>
                  </div>

                  {/* Relationship pill */}
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold whitespace-nowrap ${RELATIONSHIP_PILL[relationship]}`}
                    >
                      {RELATIONSHIP_LABEL[relationship]}
                    </span>
                  </div>

                  {/* Today's collective card */}
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-gold uppercase text-xs tracking-widest">
                      Today&rsquo;s Collective Card
                    </p>
                    <CardArt
                      value={cardValueDisplay(todayCard.value)}
                      suit={todayCard.suit}
                      size="sm"
                    />
                    <p className="text-cream text-sm text-center">
                      {stripDescriptor(todayCard.card_name)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gold/15 text-center">
                  <p className="text-white/70 text-sm">
                    {RELATIONSHIP_LINE[relationship]}
                  </p>
                  <Link
                    href="/dashboard/daily-cards"
                    className="text-gold text-sm hover:text-gold-bright transition-colors mt-3 inline-block"
                  >
                    Open the full pairing &rarr;
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
