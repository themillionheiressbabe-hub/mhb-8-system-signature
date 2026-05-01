import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { DayInteractionForm } from "./DayInteractionForm";

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

const LENSES = [
  { initial: "A", name: "Tropical Astrology" },
  { initial: "D", name: "Destiny Cards" },
  { initial: "E", name: "Numerology" },
];

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
  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  const dateLabel = `${day} ${MONTHS_SHORT[today.getUTCMonth()]}`;

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
                  <div className="relative aspect-[280/420] w-full max-w-[280px] mx-auto rounded-2xl border border-[rgba(201,169,110,0.45)] bg-gradient-to-b from-[#1A1428] to-[#0F1428] shadow-[0_16px_56px_rgba(0,0,0,0.6),0_0_40px_rgba(201,169,110,0.15)] p-[22px]">
                    {/* Top-left: value */}
                    <span className="serif-it absolute top-[18px] left-[22px] text-gold text-[32px] leading-none">
                      {card.value === "Joker" ? "★" : card.value}
                    </span>
                    {/* Top-right: suit */}
                    <span
                      className={`absolute top-[22px] right-[22px] text-[32px] leading-none ${suit.className}`}
                      aria-hidden="true"
                    >
                      {suit.symbol}
                    </span>
                    {/* Centre: large suit */}
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-[120px] opacity-85 ${suit.className}`}
                      aria-hidden="true"
                    >
                      {suit.symbol}
                    </span>
                    {/* Bottom-right: value rotated */}
                    <span className="serif-it absolute bottom-[18px] right-[22px] text-gold text-[32px] leading-none rotate-180">
                      {card.value === "Joker" ? "★" : card.value}
                    </span>
                    {/* Bottom-left: suit rotated */}
                    <span
                      className={`absolute bottom-[22px] left-[22px] text-[32px] leading-none rotate-180 ${suit.className}`}
                      aria-hidden="true"
                    >
                      {suit.symbol}
                    </span>
                    {/* Inner border */}
                    <div className="absolute inset-[14px] border border-[rgba(201,169,110,0.20)] rounded-lg pointer-events-none" />
                  </div>

                  {/* Card meaning */}
                  <div>
                    <p className={`eyebrow ${suit.className} mb-2.5`}>
                      {suit.name} · {valueName} · {dateLabel}
                    </p>
                    <h2 className="serif-it text-[2rem] text-gold leading-snug mb-5">
                      {card.core_theme ?? card.card_name.replace(/\s*\(.*$/, "")}
                    </h2>
                    {card.daily_energy_heading ? (
                      <p className="text-base leading-[1.75] text-cream/85 mb-3">
                        {card.daily_energy_heading}
                      </p>
                    ) : null}
                    {card.daily_energy_body ? (
                      <p className="text-sm leading-[1.7] text-cream/75 mb-6">
                        {card.daily_energy_body}
                      </p>
                    ) : null}
                    {card.daily_energy_cta ? (
                      <p className="eyebrow text-gold mb-6">
                        {card.daily_energy_cta}
                      </p>
                    ) : null}

                    <p className="eyebrow mb-3">Three lenses confirm</p>
                    <div className="flex flex-col gap-2 mb-7">
                      {LENSES.map((lens) => (
                        <div
                          key={lens.initial}
                          className="flex items-center gap-3 px-3.5 py-2.5 border border-[rgba(201,169,110,0.18)] rounded-lg"
                        >
                          <span className="w-7 h-7 rounded-full bg-[rgba(197,150,58,0.15)] text-gold inline-flex items-center justify-center text-xs font-semibold serif">
                            {lens.initial}
                          </span>
                          <span className="text-cream text-sm flex-1">
                            {lens.name}
                          </span>
                          <span className="text-emerald text-xs tracking-[0.1em]">
                            CONFIRMED
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link
                        href="/tools/birthprint-snapshot"
                        className="btn btn-primary"
                      >
                        Get My Personal Read
                      </Link>
                      <Link href="/signup" className="btn btn-outline">
                        Save to Journal
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Day-interaction form */}
                <div className="mt-16">
                  <DayInteractionForm />
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
