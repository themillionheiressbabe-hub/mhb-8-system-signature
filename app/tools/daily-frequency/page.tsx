import { Cormorant_Garamond, Outfit } from "next/font/google";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase-admin";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SUIT_DISPLAY: Record<string, { symbol: string; className: string }> = {
  hearts: { symbol: "♥", className: "text-magenta" },
  diamonds: { symbol: "♦", className: "text-gold" },
  clubs: { symbol: "♣", className: "text-emerald" },
  spades: { symbol: "♠", className: "text-violet" },
  joker: { symbol: "★", className: "text-white" },
};

type CardLibrary = {
  card_name: string;
  suit: string;
  core_theme: string | null;
  keywords: string[] | null;
  locked_in_summary: string | null;
};

type DailyCardRow = {
  id: string;
  month: number;
  day: number;
  card_code: string;
  card_library: CardLibrary | null;
};

export default async function DailyFrequencyPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const formattedDate = `${WEEKDAYS[today.getDay()]}, ${day} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select(
      "*, card_library!inner(card_name, suit, core_theme, keywords, locked_in_summary)",
    )
    .eq("month", month)
    .eq("day", day)
    .maybeSingle<DailyCardRow>();

  const card = lookup?.card_library ?? null;
  const suit = card ? SUIT_DISPLAY[card.suit] : null;

  return (
    <div className={`${outfit.className} flex-1`}>
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-gold text-sm hover:underline inline-block mb-6"
          >
            &larr; Back
          </Link>

          <p className="text-gold text-base text-center mb-8">
            {formattedDate}
          </p>

          {card ? (
            <div className="bg-navy border border-gold rounded-lg p-8 max-w-lg mx-auto flex flex-col gap-4 items-center text-center">
              <h1
                className={`${cormorant.className} text-white text-4xl font-semibold leading-tight`}
              >
                {card.card_name}
              </h1>
              <span
                className={`text-5xl leading-none ${suit?.className ?? "text-white"}`}
                aria-hidden="true"
              >
                {suit?.symbol ?? "★"}
              </span>
              {card.core_theme ? (
                <p className="text-gold italic">{card.core_theme}</p>
              ) : null}
              <hr className="border-t border-gold/30 w-full" />
              {card.keywords && card.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {card.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="border border-gold text-gold text-xs px-3 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}
              {card.locked_in_summary ? (
                <p className="text-white text-base leading-relaxed">
                  {card.locked_in_summary}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-gold text-center text-lg">
              No card found for today
            </p>
          )}

          {card ? (
            <div className="mt-12 max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
              <p className="text-gold italic">
                This is the collective card for today. Enter your birth date
                for your personal layer.
              </p>
              <Link
                href="/tools/birthprint-snapshot"
                className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block"
              >
                Get My Personal Read
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
