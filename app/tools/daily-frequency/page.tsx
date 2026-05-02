import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CardArt from "@/components/CardArt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DayInteractionForm } from "./DayInteractionForm";

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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const SUIT_DISPLAY: Record<
  string,
  { symbol: string; className: string; name: string }
> = {
  hearts: { symbol: "♥", className: "text-suit-hearts", name: "Hearts" },
  diamonds: { symbol: "♦", className: "text-suit-diamonds", name: "Diamonds" },
  clubs: { symbol: "♣", className: "text-suit-clubs", name: "Clubs" },
  spades: { symbol: "♠", className: "text-suit-spades", name: "Spades" },
  joker: { symbol: "★", className: "text-cream", name: "Joker" },
};

const VALUE_NAME: Record<string, string> = {
  A: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
  Joker: "Joker",
};

const MORE_TOOLS = [
  {
    href: "/tools/birthprint-snapshot",
    eyebrow: "Free",
    eyebrowColor: "text-emerald",
    border: "border-l-emerald",
    title: "Birthprint Snapshot",
    body: "Drop your date and time. Get a 5-lens preview of your dominant frequency.",
  },
  {
    href: "/tools/your-babe-year",
    eyebrow: "Free · Year",
    eyebrowColor: "text-violet",
    border: "border-l-violet",
    title: "Your BABE Year",
    body: "Find out which personal year you are in and what it is asking of you.",
  },
];

type CardLibrary = {
  card_name: string;
  suit: string;
  value: string;
  core_theme: string | null;
  locked_in_summary: string | null;
  checked_out_summary: string | null;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
  daily_energy_cta: string | null;
};

export default async function DailyFrequencyPage() {
  const { iso: cacheDate, month, day } = getUkDateIso();

  const dateLabel = `${day} ${MONTHS_SHORT[month - 1]}`;

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", month)
    .eq("day", day)
    .single<{ card_code: string }>();

  let card: CardLibrary | null = null;
  if (lookup) {
    const { data: cardData } = await supabaseAdmin
      .from("card_library")
      .select(
        "card_name, suit, value, core_theme, locked_in_summary, checked_out_summary, daily_energy_heading, daily_energy_body, daily_energy_cta",
      )
      .eq("card_code", lookup.card_code)
      .single<CardLibrary>();
    card = cardData;
  }

  const suit = card ? SUIT_DISPLAY[card.suit] : null;
  const valueName = card ? VALUE_NAME[card.value] ?? card.value : null;
  const cardValue = card
    ? card.value === "Joker"
      ? "★"
      : card.value
    : null;

  let dailyRead = "";
  if (card) {
    const { data: cached } = await supabaseAdmin
      .from("daily_reads_cache")
      .select("daily_read")
      .eq("cache_date", cacheDate)
      .maybeSingle<{ daily_read: string }>();
    dailyRead = cached?.daily_read ?? card.daily_energy_body ?? "";
  }

  const paragraphs = dailyRead
    .split(/(?<=[.!?])\s+/)
    .reduce((acc: string[][], sentence: string, i: number) => {
      if (i % 2 === 0) acc.push([sentence]);
      else acc[acc.length - 1].push(sentence);
      return acc;
    }, [])
    .map((group) => group.join(" "));

  return (
    <div className="flex-1">
      <Navbar />

      <main>
        <section className="pt-32 pb-24">
          <div className="container max-w-[880px]">
            <p className="eyebrow text-center mb-4">Free · Daily</p>
            <h1 className="serif text-[clamp(2rem,4vw,3rem)] text-center leading-[1.1] mb-3.5">
              Card of the Day
            </h1>
            <p className="serif-it text-[1.25rem] text-gold text-center mb-14">
              One pull. Three lenses. No signup.
            </p>

            {card && suit ? (
              <>
                {/* Card centerpiece */}
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-center">
                  {/* Card art */}
                  <div className="flex justify-center">
                    <CardArt value={cardValue!} suit={card.suit} size="lg" />
                  </div>

                  {/* Card meaning */}
                  <div>
                    <p className={`eyebrow ${suit.className} mb-2.5`}>
                      {suit.name} · {valueName} · {dateLabel}
                    </p>
                    <h2 className="serif-it text-[2rem] text-gold leading-snug mb-5">
                      {card.core_theme ?? card.card_name.replace(/\s*\(.*$/, "")}
                    </h2>
                    {paragraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-white/85 text-base leading-relaxed ${
                          index === paragraphs.length - 1 ? "" : "mb-4"
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                    {card.daily_energy_cta ? (
                      <p className="eyebrow text-gold mb-6">
                        {card.daily_energy_cta}
                      </p>
                    ) : null}

                  </div>
                </div>

                {/* Day-interaction form */}
                <div className="mt-16">
                  <DayInteractionForm
                    todayCardCode={lookup!.card_code}
                    todayCardName={card.card_name.replace(/\s*\(.*$/, "")}
                    todayCardSuit={card.suit}
                    todayCardValue={card.value}
                  />
                </div>

                <hr className="rule-gold my-20" />

                {/* More free tools */}
                <p className="eyebrow text-center mb-6">More free tools</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {MORE_TOOLS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`card lift no-underline p-6 border-l-[3px] ${tool.border}`}
                    >
                      <p className={`eyebrow ${tool.eyebrowColor} mb-2`}>
                        {tool.eyebrow}
                      </p>
                      <h4 className="serif-it text-[1.25rem] mb-2 leading-tight">
                        {tool.title}
                      </h4>
                      <p className="muted text-[13px] leading-[1.55]">
                        {tool.body}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gold text-center text-lg">
                No card data found for today
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
