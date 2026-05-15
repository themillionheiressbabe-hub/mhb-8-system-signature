import Link from "next/link";
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DailyCardWidget } from "@/components/DailyCardWidget";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ThreeThings } from "@/components/admin/today/ThreeThings";
import { TasksKanban } from "@/components/admin/today/TasksKanban";
import { QuickNotes } from "@/components/admin/today/QuickNotes";
import { GymCheckIn } from "@/components/admin/today/GymCheckIn";
import { ContentPostsSummary } from "@/components/admin/today/ContentPostsSummary";

export const metadata: Metadata = {
  title: "Today · BABE HQ",
};

const WEEKDAYS_UPPER = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const MONTHS_UPPER = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const TRAINING_WEEKDAYS = new Set([1, 2, 4, 5]); // Mon, Tue, Thu, Fri

const PERSONAL_YEAR = 7; // Yemi's locked Personal Year

const PERSONAL_MONTH_IN_YEAR_7: Record<number, string> = {
  1: "Month 1 plants a quiet beginning inside the year of going inward.",
  2: "Month 2 asks for patience with what is still forming.",
  3: "Month 3 asks you to express what the stillness has shown you.",
  4: "Month 4 turns the reflection into something you can stand on.",
  5: "Month 5 brings the first movement after a long pause.",
  6: "Month 6 asks who you are tending now that you know more.",
  7: "Month 7 doubles the depth. Go further in, not faster.",
  8: "Month 8 lets the inner work meet a material edge.",
  9: "Month 9 closes the loop. Let what is finished, finish.",
  11: "Month 11 cracks the year open. Listen for what arrives.",
};

function sumDigits(n: number): number {
  let sum = 0;
  let temp = Math.abs(n);
  while (temp > 0) {
    sum += temp % 10;
    temp = Math.floor(temp / 10);
  }
  return sum;
}

function reduce(n: number): number {
  if (n === 11 || n === 22) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

function getPersonalMonth(personalYear: number, month: number): number {
  return reduce(personalYear + month);
}

type UkDate = {
  iso: string;
  weekdayIndex: number;
  day: number;
  month: number;
  year: number;
};

function getUkDateParts(): UkDate {
  const now = new Date();
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = iso.split("-").map(Number);
  const weekdayName = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
  }).format(now);
  const weekdayIndex = WEEKDAYS_UPPER.findIndex(
    (w) => w === weekdayName.toUpperCase(),
  );
  return { iso, weekdayIndex, day, month, year };
}

type CachedRead = { card_code: string };

const ELEMENT_BG: Record<string, string> = {
  hearts: "rgba(196,74,110,0.10)",
  diamonds: "rgba(201,169,110,0.10)",
  clubs: "rgba(45,155,110,0.10)",
  spades: "rgba(167,139,250,0.10)",
};

const QUICK_LINKS: { label: string; href: string; desc: string }[] = [
  {
    label: "New Report",
    href: "/admin/reports/new",
    desc: "Start a new client report",
  },
  {
    label: "All Orders",
    href: "/admin/orders",
    desc: "Every paid and pending order",
  },
  {
    label: "All Clients",
    href: "/admin/clients",
    desc: "The full client roster",
  },
  {
    label: "Content Intelligence",
    href: "/admin/content-intelligence",
    desc: "Patterns and angles for posts",
  },
  {
    label: "Cosmic Weather",
    href: "/admin/cosmic-weather",
    desc: "Today's transit picture",
  },
  {
    label: "Daily Frequency",
    href: "/admin/daily-frequency",
    desc: "Public collective read view",
  },
];

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

export default async function AdminTodayPage() {
  const { iso, weekdayIndex, day, month, year } = getUkDateParts();

  const headerDate = `${WEEKDAYS_UPPER[weekdayIndex]} · ${day} ${MONTHS_UPPER[month - 1]} ${year}`;
  const isTrainingDay = TRAINING_WEEKDAYS.has(weekdayIndex);
  const personalMonth = getPersonalMonth(PERSONAL_YEAR, month);
  const personalMonthContext =
    PERSONAL_MONTH_IN_YEAR_7[personalMonth] ?? "";

  const { data: cached } = await supabaseAdmin
    .from("daily_reads_cache")
    .select("card_code")
    .eq("cache_date", iso)
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

  let cardName = "Today's card";
  let cardSuit: string | null = null;
  if (cardCode) {
    const { data: cardRow } = await supabaseAdmin
      .from("card_library")
      .select("card_name, suit")
      .eq("card_code", cardCode)
      .single<{ card_name: string; suit: string }>();
    if (cardRow) {
      cardName = cardRow.card_name.replace(/\s*\(.*$/, "");
      cardSuit = cardRow.suit;
    }
  }

  const headerAccent = cardSuit ? ELEMENT_BG[cardSuit] : undefined;

  const threeThingsKey = `babe-hq:today:three-things:${iso}`;
  const gymKey = `babe-hq:today:gym:${iso}`;

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/today" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        {/* 1. Date and energy header */}
        <section
          className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-7 mb-10"
          style={headerAccent ? { backgroundColor: headerAccent } : undefined}
        >
          <p className={EYEBROW}>{headerDate}</p>
          <h1 className="serif-it text-gold text-[2.4rem] leading-tight mt-3">
            {cardName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-cream/80 text-base"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span>
              Personal Year{" "}
              <span className="text-gold font-medium">{PERSONAL_YEAR}</span>
            </span>
            <span className="text-gold/40">·</span>
            <span>
              Personal Month{" "}
              <span className="text-gold font-medium">{personalMonth}</span>
            </span>
          </div>
          {personalMonthContext ? (
            <p
              className="text-cream/60 text-[14px] leading-relaxed mt-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {personalMonthContext}
            </p>
          ) : null}
        </section>

        <div className="-mt-6 mb-10">
          <ContentPostsSummary todayIso={iso} weekdayIndex={weekdayIndex} />
        </div>

        {/* 2. Three things today */}
        <section className="mb-10">
          <p className={`${EYEBROW} mb-4`}>Today&rsquo;s Three</p>
          <ThreeThings storageKey={threeThingsKey} />
        </section>

        {/* 3. Tasks */}
        <section className="mb-10">
          <p className={`${EYEBROW} mb-4`}>Tasks</p>
          <TasksKanban />
        </section>

        {/* 4. Notes */}
        <section className="mb-10">
          <p className={`${EYEBROW} mb-4`}>Notes</p>
          <QuickNotes />
        </section>

        {/* 5. Gym check-in */}
        <section className="mb-10">
          <p className={`${EYEBROW} mb-4`}>Gym</p>
          <GymCheckIn storageKey={gymKey} isTrainingDay={isTrainingDay} />
        </section>

        {/* 6. Content seeds */}
        <section className="mb-10">
          <p className={`${EYEBROW} mb-4`}>Today&rsquo;s Content Seeds</p>
          <div className="bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-6">
            <DailyCardWidget
              variant="full"
              ctaHref="/tools/daily-frequency"
              ctaLabel="Open the full read"
              showCopySeed
            />
          </div>
        </section>

        {/* 7. Admin quick links */}
        <section className="mb-4">
          <p className={`${EYEBROW} mb-4`}>Quick Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl p-5 hover:border-[rgba(201,169,110,0.35)] transition-colors"
              >
                <p className={EYEBROW}>{link.label}</p>
                <p
                  className="text-cream/65 text-[13px] mt-2 leading-relaxed"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
