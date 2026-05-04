import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Orbit } from "@/components/Orbit";
import FlipCard from "@/components/FlipCard";
import { supabaseAdmin } from "@/lib/supabase-admin";

type FeaturedCard = {
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

export default async function Home() {
  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  const { data: lookup } = await supabaseAdmin
    .from("daily_card_lookup")
    .select("card_code")
    .eq("month", month)
    .eq("day", day)
    .single<{ card_code: string }>();

  let featuredCard: FeaturedCard | null = null;
  if (lookup) {
    const { data: cardData } = await supabaseAdmin
      .from("card_library")
      .select(
        "card_code, card_name, suit, value, core_theme, daily_energy_heading, daily_energy_body, daily_energy_cta, locked_in_summary",
      )
      .eq("card_code", lookup.card_code)
      .single<FeaturedCard>();
    featuredCard = cardData;
  }

  const featuredTitle = featuredCard
    ? featuredCard.card_name.replace(/\s*\(.*$/, "")
    : null;
  const featuredValue = featuredCard
    ? featuredCard.value === "Joker"
      ? "★"
      : featuredCard.value
    : null;

  return (
    <div className="flex-1">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero min-h-[calc(100vh-76px)] flex items-center pt-20 pb-10 relative">
          <div className="container text-center">
            <p className="eyebrow mb-5">The MillionHeiress BABE&trade;</p>
            <h1 className="serif text-[clamp(2.75rem,5vw,4.25rem)] leading-[1.06] max-w-[920px] mx-auto mb-6">
              Eight Lenses.{" "}
              <span className="text-magenta">One Truth.</span>
              <br />
              <em className="serif-it text-gold">Yours.</em>
            </h1>
            <p className="muted text-[17px] max-w-[560px] mx-auto mb-11 leading-relaxed">
              Pattern recognition for women who are done being explained to.
              When eight independent systems confirm the same pattern, that is
              not coincidence. That is your Birthprint.
            </p>

            <div className="flex justify-center mb-14">
              <Orbit />
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/tools/daily-frequency"
                className="btn btn-primary"
              >
                Try Card of the Day, Free
              </Link>
              <Link href="#system" className="btn btn-outline">
                See How It Works
              </Link>
            </div>
            <p className="text-[11px] text-text-faint mt-8 tracking-[0.06em]">
              Pattern recognition for personal development. Non-predictive.
              Non-diagnostic.
            </p>
          </div>
        </section>

        {/* THE SYSTEM */}
        <section
          id="system"
          className="section bg-[rgba(15,20,40,0.55)] border-t border-b border-[rgba(201,169,110,0.18)] scroll-mt-24"
        >
          <div className="container max-w-[880px] text-center">
            <p className="eyebrow mb-5">The System</p>
            <h2 className="serif text-[clamp(1.75rem,3vw,2.5rem)] leading-tight">
              Eight independent systems,{" "}
              <em className="serif-it text-gold">triangulated.</em>
            </h2>
            <p className="text-[17px] muted mt-6 leading-relaxed">
              1 lens is a signal. 2 is a pattern. 3+ is structure. Only patterns
              confirmed by three or more systems make the report. Receipts, not
              vibes.
            </p>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="section">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20 items-start">
              <div>
                <p className="eyebrow mb-5">The Problem</p>
                <h2 className="serif text-[2.25rem] leading-tight text-gold">
                  You already <em className="serif-it">know.</em>
                  <br />
                  You just want it confirmed.
                </h2>
              </div>
              <div className="text-base leading-[1.75] text-cream/85 pt-3.5 flex flex-col gap-5">
                <p>
                  You have been to the therapists. Read the books. Done the
                  breathwork. Bought the courses. You can name your patterns
                  better than most people running the workshops.
                </p>
                <p>
                  What you do not need is another framework explaining who you
                  are. You need a mirror that will not blink.
                </p>
                <p>
                  Eight lenses. Triangulated. The pattern stops being your
                  imagination the third time it shows up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FREE TOOLS */}
        <section
          id="free-tools"
          className="section bg-[rgba(15,20,40,0.55)] border-t border-b border-[rgba(201,169,110,0.18)] scroll-mt-24"
        >
          <div className="container">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="eyebrow mb-3.5">Free Tools</p>
                <h2 className="serif text-[2.25rem]">Start with a daily read.</h2>
              </div>
              <Link href="/tools/daily-frequency" className="btn btn-ghost btn-sm">
                All free tools &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-5">
              {/* Featured: Card of the Day flip card */}
              {featuredCard && featuredValue && featuredTitle ? (
                <FlipCard
                  value={featuredValue}
                  suit={featuredCard.suit}
                  cardName={featuredTitle}
                  coreTheme={featuredCard.core_theme ?? ""}
                  dailyEnergyHeading={featuredCard.daily_energy_heading ?? ""}
                  dailyEnergyBody={
                    featuredCard.daily_energy_body ??
                    featuredCard.locked_in_summary ??
                    ""
                  }
                  dailyEnergyCta={featuredCard.daily_energy_cta ?? ""}
                  todayCardCode={featuredCard.card_code}
                />
              ) : (
                <div className="card p-8 bg-gradient-to-br from-[#11172B] to-[#0B1020] border-[1.5px] border-[rgba(181,30,90,0.35)] min-h-[320px] flex flex-col items-center justify-center">
                  <p className="muted text-sm">
                    Pull today&rsquo;s card on the full page.
                  </p>
                </div>
              )}

              {/* Right column: 2 small cards stacked */}
              <div className="flex flex-col gap-5">
                <Link
                  href="/tools/birthprint-snapshot"
                  className="card lift no-underline p-7 border-l-[3px] border-l-emerald flex flex-col gap-2.5"
                >
                  <p className="eyebrow text-emerald">Free &middot; Quick</p>
                  <h4 className="serif text-[1.35rem] leading-tight">
                    Birthprint Snapshot
                  </h4>
                  <p className="muted text-[13px] leading-snug">
                    Drop your date and time. Get a 5-lens preview of your
                    pattern. Zero fluff.
                  </p>
                  <span className="text-gold text-[13px] mt-auto">
                    Take it &rarr;
                  </span>
                </Link>

                <Link
                  href="/tools/your-babe-year"
                  className="card lift no-underline p-7 border-l-[3px] border-l-violet flex flex-col gap-2.5"
                >
                  <p className="eyebrow text-violet">Free &middot; Year</p>
                  <h4 className="serif text-[1.35rem] leading-tight">
                    Your BABE Year
                  </h4>
                  <p className="muted text-[13px] leading-snug">
                    Find out what this year is asking of you. One date in, one
                    year ahead.
                  </p>
                  <span className="text-gold text-[13px] mt-auto">
                    Read it &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="section">
          <div className="container max-w-[880px] text-center">
            <p className="eyebrow mb-6">Receipts</p>
            <div className="serif text-[86px] leading-none text-magenta opacity-45 -mb-4">
              &ldquo;
            </div>
            <blockquote className="serif-it text-[clamp(1.5rem,2.4vw,2rem)] leading-snug text-cream m-0">
              She named a pattern I have been swimming in for ten years and
              called it what it was: Checked Out. I cried. Then I got to work.
            </blockquote>
            <p className="eyebrow mt-7 text-gold">A.O., coach</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
