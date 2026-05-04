import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CardArt from "@/components/CardArt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getDailyNumerology,
  getDailySunSign,
  getMoonData,
} from "@/lib/astrology/daily-collective";
import { DayInteractionForm } from "./DayInteractionForm";

const SUIT_DISPLAY: Record<
  string,
  { className: string; name: string }
> = {
  hearts: { className: "text-suit-hearts", name: "Hearts" },
  diamonds: { className: "text-suit-diamonds", name: "Diamonds" },
  clubs: { className: "text-suit-clubs", name: "Clubs" },
  spades: { className: "text-suit-spades", name: "Spades" },
  joker: { className: "text-cream", name: "Joker" },
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

function toParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  if (/\n{2,}/.test(text)) {
    return text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs: string[][] = [];
  sentences.forEach((sentence, i) => {
    if (i % 2 === 0) paragraphs.push([sentence]);
    else paragraphs[paragraphs.length - 1].push(sentence);
  });
  return paragraphs.map((group) => group.join(" "));
}

type CardLibrary = {
  card_name: string;
  suit: string;
  value: string;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
};

export default async function DailyFrequencyPage() {
  const { iso: cacheDate, month, day, formatted: formattedDate } =
    getUkDateParts();

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
        "card_name, suit, value, daily_energy_heading, daily_energy_body",
      )
      .eq("card_code", lookup.card_code)
      .single<CardLibrary>();
    card = cardData;
  }

  const ukNoon = new Date(`${cacheDate}T12:00:00Z`);
  const moon = getMoonData(ukNoon);
  const numerology = getDailyNumerology(ukNoon);
  const sunSign = getDailySunSign(ukNoon);

  const suit = card ? SUIT_DISPLAY[card.suit] : null;
  const valueName = card ? VALUE_NAME[card.value] ?? card.value : null;
  const cardValue = card
    ? card.value === "Joker"
      ? "★"
      : card.value
    : null;
  const paragraphs = toParagraphs(card?.daily_energy_body);
  const cardName = card ? card.card_name.replace(/\s*\(.*$/, "") : "";

  return (
    <div className="flex-1">
      <Navbar />

      <main className="pt-24 pb-24 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Page heading */}
          <header className="text-center mb-12">
            <h1 className="serif text-white text-4xl font-light">
              Card of the Day
            </h1>
            <p className="text-gold text-sm mt-1">{formattedDate}</p>
            <p className="text-white/60 text-sm mt-1">
              One pull. Three lenses. No signup.
            </p>
          </header>

          {card && suit ? (
            <>
              {/* Two-column main display */}
              <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-start">
                <div className="flex justify-center md:justify-start">
                  <CardArt
                    value={cardValue!}
                    suit={card.suit}
                    size="lg"
                  />
                </div>

                <div>
                  <p
                    className={`${suit.className} uppercase text-xs tracking-widest`}
                  >
                    {suit.name} &middot; {valueName} &middot; {cardName}
                  </p>

                  {card.daily_energy_heading ? (
                    <h2 className="serif-it text-white text-2xl leading-tight mt-3">
                      {card.daily_energy_heading}
                    </h2>
                  ) : null}

                  {paragraphs.length > 0 ? (
                    <div className="mt-3">
                      {paragraphs.map((paragraph, index) => (
                        <p
                          key={index}
                          className={`text-white/80 text-base leading-relaxed ${
                            index === paragraphs.length - 1 ? "" : "mb-4"
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <p className="text-gold uppercase text-xs tracking-widest mt-4">
                    Today&rsquo;s Invitation
                  </p>
                </div>
              </section>

              {/* Slim info row */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
                <span className="text-gold">
                  {moon.emoji} {moon.phase}
                </span>
                <span className="text-gold/40">&middot;</span>
                <span className="text-white/60">{moon.sign}</span>
                <span className="text-gold/40">&middot;</span>
                <span className="text-white/60">
                  Numerology Day {numerology.number}
                </span>
                <span className="text-gold/40">&middot;</span>
                <span className="text-white/60">{sunSign.sign} season</span>
              </div>

              {/* DayInteractionForm */}
              <section id="interact" className="mt-16 scroll-mt-24">
                <DayInteractionForm
                  todayCardCode={lookup!.card_code}
                  todayCardName={cardName}
                  todayCardSuit={card.suit}
                  todayCardValue={card.value}
                />
              </section>
            </>
          ) : (
            <p className="text-gold text-center text-lg">
              No card data found for today
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
