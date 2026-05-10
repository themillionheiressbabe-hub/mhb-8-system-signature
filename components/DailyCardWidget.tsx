import Link from "next/link";
import CardArt from "@/components/CardArt";
import { CopySeedButton } from "@/components/CopySeedButton";
import ProseBlock from "@/components/ProseBlock";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getDailyNumerology,
  getDailySunSign,
  getMoonData,
} from "@/lib/astrology/daily-collective";

const SUIT_DISPLAY: Record<string, { className: string; name: string }> = {
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

function firstNSentences(
  text: string | null | undefined,
  n: number,
): string {
  if (!text) return "";
  return text.split(/(?<=[.!?])\s+/).slice(0, n).join(" ");
}

type CardRow = {
  card_name: string;
  suit: string;
  value: string;
  daily_energy_heading: string | null;
  daily_energy_body: string | null;
};

type Props = {
  variant?: "compact" | "full";
  ctaHref?: string;
  ctaLabel?: string;
  showCopySeed?: boolean;
  bodyOverride?: string | null;
  seedOverride?: string | null;
};

export async function DailyCardWidget({
  variant = "full",
  ctaHref = "/tools/daily-frequency",
  ctaLabel = "Open the read",
  showCopySeed = false,
  bodyOverride = null,
  seedOverride = null,
}: Props) {
  const { iso: cacheDate, month, day } = getUkDateParts();

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", month)
    .eq("day", day)
    .single<{ card_code: string }>();

  let card: CardRow | null = null;
  if (lookup) {
    const { data: cardData } = await supabaseAdmin
      .from("card_library")
      .select(
        "card_name, suit, value, daily_energy_heading, daily_energy_body",
      )
      .eq("card_code", lookup.card_code)
      .single<CardRow>();
    card = cardData;
  }

  const ukNoon = new Date(`${cacheDate}T12:00:00Z`);
  const moon = getMoonData(ukNoon);
  const numerology = getDailyNumerology(ukNoon);
  const sunSign = getDailySunSign(ukNoon);

  const suit = card ? SUIT_DISPLAY[card.suit] : null;
  if (!card || !suit) {
    return (
      <p className="muted text-sm">No card data for today.</p>
    );
  }

  const valueName = VALUE_NAME[card.value] ?? card.value;
  const cardValue = card.value === "Joker" ? "★" : card.value;
  const cardName = card.card_name.replace(/\s*\(.*$/, "");

  const defaultSeedText = [
    `Today's card: ${cardName}`,
    card.daily_energy_heading
      ? `Heading: ${card.daily_energy_heading}`
      : null,
    `Moon: ${moon.phase} in ${moon.sign}`,
    `Numerology: Day ${numerology.number}`,
    `Sun: ${sunSign.sign} season`,
  ]
    .filter(Boolean)
    .join("\n");
  const seedText = seedOverride ?? defaultSeedText;

  const slimRow = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
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
  );

  if (variant === "compact") {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-5 items-start">
          <div className="flex justify-center sm:justify-start">
            <CardArt value={cardValue} suit={card.suit} size="sm" />
          </div>
          <div>
            <p
              className={`${suit.className} uppercase text-xs tracking-widest`}
            >
              {suit.name} &middot; {valueName}
            </p>
            {card.daily_energy_heading ? (
              <p className="serif-it text-white text-lg leading-tight mt-2">
                {card.daily_energy_heading}
              </p>
            ) : null}
            <ProseBlock
              text={bodyOverride ?? firstNSentences(card.daily_energy_body, 1)}
              className="mt-2"
            />
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <Link
                href={ctaHref}
                className="text-gold text-sm hover:text-gold-bright transition-colors"
              >
                {ctaLabel} &rarr;
              </Link>
              {showCopySeed ? <CopySeedButton text={seedText} /> : null}
            </div>
          </div>
        </div>
        <div className="mt-4">{slimRow}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8 items-start">
        <div className="flex justify-center md:justify-start">
          <CardArt value={cardValue} suit={card.suit} size="md" />
        </div>
        <div>
          <p
            className={`${suit.className} uppercase text-xs tracking-widest`}
          >
            {suit.name} &middot; {valueName} &middot; {cardName}
          </p>
          {card.daily_energy_heading ? (
            <h3 className="serif-it text-white text-2xl leading-tight mt-2">
              {card.daily_energy_heading}
            </h3>
          ) : null}
          <ProseBlock
            text={bodyOverride ?? firstNSentences(card.daily_energy_body, 3)}
            className="mt-3"
          />
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link
              href={ctaHref}
              className="text-gold text-sm hover:text-gold-bright transition-colors"
            >
              {ctaLabel} &rarr;
            </Link>
            {showCopySeed ? <CopySeedButton text={seedText} /> : null}
          </div>
        </div>
      </div>
      <div className="mt-5">{slimRow}</div>
    </div>
  );
}
