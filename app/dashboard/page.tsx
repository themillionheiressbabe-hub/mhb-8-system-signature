import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DailyCardWidget } from "@/components/DailyCardWidget";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

const REPORT_PILL: Record<string, string> = {
  draft: "pill-pending",
  in_review: "pill-violet",
  delivered: "pill-active",
};

const REPORT_PILL_LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  delivered: "Ready",
};

type ProfileRow = {
  full_name: string | null;
  role: string | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  product_slug: string;
  status: string;
  created_at: string;
};

type DailyCard = {
  card_name: string;
  suit: string;
  value: string;
  core_theme: string | null;
  daily_energy_heading: string | null;
};

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatMonthDay(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

function daysSince(iso: string) {
  const start = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();
  const todayLabel = `${MONTHS_SHORT[today.getUTCMonth()]} ${day}`;

  // Run user-bound queries in parallel
  const [
    profileRes,
    ordersCountRes,
    reportsCountRes,
    reportsListRes,
    lookupRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role, created_at")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>(),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("reports")
      .select("id, product_slug, status, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<ReportRow[]>(),
    supabaseAdmin
      .from("daily_card_lookup")
      .select("card_code")
      .eq("month", month)
      .eq("day", day)
      .single<{ card_code: string }>(),
  ]);

  const profile = profileRes.data;
  const ordersCount = ordersCountRes.count ?? 0;
  const reportsCount = reportsCountRes.count ?? 0;
  const reports = reportsListRes.data ?? [];

  let card: DailyCard | null = null;
  if (lookupRes.data) {
    const { data: cardData } = await supabaseAdmin
      .from("card_library")
      .select("card_name, suit, value, core_theme, daily_energy_heading")
      .eq("card_code", lookupRes.data.card_code)
      .single<DailyCard>();
    card = cardData;
  }

  const firstName =
    profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "you";
  const memberSinceLabel = profile?.created_at
    ? `Member since ${formatMonthDay(profile.created_at)}`
    : null;
  const memberDays = profile?.created_at
    ? daysSince(profile.created_at)
    : 0;

  const suit = card ? SUIT_DISPLAY[card.suit] : null;
  const cardValueDisplay = card?.value === "Joker" ? "★" : card?.value ?? "";

  return (
    <div className="flex-1">
      <Navbar />

      <main>
        <section className="pt-24 pb-24">
          <div className="container">
            {/* Header */}
            <div className="flex justify-between items-end flex-wrap gap-4 mb-12">
              <div>
                <p className="eyebrow mb-3">The Sanctuary</p>
                <h1 className="serif text-magenta text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] mb-2">
                  Welcome back, {firstName}.
                </h1>
                <p className="text-gold text-sm">
                  {user.email}
                  {memberSinceLabel ? ` · ${memberSinceLabel}` : ""}
                </p>
              </div>
              <span className="pill pill-locked">
                {profile?.role === "admin" ? "Admin" : "Member"}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mb-10">
              <div className="card p-[22px]">
                <p className="eyebrow mb-2.5">Reports</p>
                <p className="serif text-[2rem] text-cream leading-none mb-1.5">
                  {reportsCount}
                </p>
                <p className="muted text-xs">Built and in build</p>
              </div>
              <div className="card p-[22px] border-l-[3px] border-l-magenta">
                <p className="eyebrow eyebrow-mag mb-2.5">Orders</p>
                <p className="serif text-[2rem] text-cream leading-none mb-1.5">
                  {ordersCount}
                </p>
                <p className="muted text-xs">All time</p>
              </div>
              <div className="card p-[22px] border-l-[3px] border-l-emerald">
                <p className="eyebrow text-emerald mb-2.5">Days Inside</p>
                <p className="serif text-[2rem] text-cream leading-none mb-1.5">
                  {memberDays}
                </p>
                <p className="muted text-xs">Since you joined</p>
              </div>
              <div className="card p-[22px] border-l-[3px] border-l-violet">
                <p className="eyebrow text-violet mb-2.5">Today</p>
                <p className="serif text-[1.5rem] text-cream leading-tight mb-1.5">
                  {card && suit
                    ? `${cardValueDisplay}${suit.symbol}`
                    : "Card"}
                </p>
                <p className="muted text-xs">{todayLabel} collective</p>
              </div>
            </div>

            {/* Two-col main */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mb-6">
              {/* LEFT: Today's Frequency */}
              <div className="card p-8">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
                  <div>
                    <p className="eyebrow eyebrow-mag mb-2">Today · {todayLabel}</p>
                    <h2 className="serif text-[1.6rem]">Today&apos;s Frequency</h2>
                  </div>
                  <span className="pill pill-pending">3+ Confirmed</span>
                </div>

                <DailyCardWidget
                  variant="compact"
                  ctaHref="/dashboard/daily-cards"
                  ctaLabel="Read full pull"
                />
              </div>

              {/* RIGHT: Birthprint (placeholder + CTA) */}
              <div className="card p-7 flex flex-col">
                <p className="eyebrow mb-3.5">Your Birthprint · Snapshot</p>
                <h3 className="serif text-[1.4rem] mb-4">
                  Get your full read.
                </h3>
                <p className="muted text-sm leading-relaxed mb-5">
                  When you order The BABE Signature, your dominant lenses appear
                  here. Until then, this is what is available.
                </p>

                <div className="flex flex-col gap-3 mb-5">
                  <Link
                    href="/dashboard/cosmic-weather"
                    className="flex items-center gap-3 px-3.5 py-3 border border-[rgba(201,169,110,0.18)] rounded-lg border-l-[3px] border-l-amber no-underline hover:border-gold/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-[rgba(245,158,11,0.15)] text-amber inline-flex items-center justify-center text-xs font-semibold serif">
                      C
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-[13px] font-medium">
                        Cosmic Weather
                      </p>
                      <p className="muted text-xs">
                        Today&rsquo;s planets and collective card
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/daily-cards"
                    className="flex items-center gap-3 px-3.5 py-3 border border-[rgba(201,169,110,0.18)] rounded-lg border-l-[3px] border-l-magenta no-underline hover:border-gold/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-[rgba(181,30,90,0.15)] text-magenta inline-flex items-center justify-center text-xs font-semibold serif">
                      M
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-[13px] font-medium">
                        Daily Cards
                      </p>
                      <p className="muted text-xs">
                        Destiny + tarot + journal
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/daily-cards"
                    className="flex items-center gap-3 px-3.5 py-3 border border-[rgba(201,169,110,0.18)] rounded-lg border-l-[3px] border-l-emerald no-underline hover:border-gold/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-[rgba(45,155,110,0.15)] text-emerald inline-flex items-center justify-center text-xs font-semibold serif">
                      D
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-[13px] font-medium">
                        Card of the Day
                      </p>
                      <p className="muted text-xs">Free · daily pull</p>
                    </div>
                  </Link>
                  <Link
                    href="/tools/birthprint-snapshot"
                    className="flex items-center gap-3 px-3.5 py-3 border border-[rgba(201,169,110,0.18)] rounded-lg border-l-[3px] border-l-gold no-underline hover:border-gold/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-[rgba(197,150,58,0.15)] text-gold inline-flex items-center justify-center text-xs font-semibold serif">
                      A
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-[13px] font-medium">
                        Birthprint Snapshot
                      </p>
                      <p className="muted text-xs">Free · 5-lens preview</p>
                    </div>
                  </Link>
                  <Link
                    href="/tools/your-babe-year"
                    className="flex items-center gap-3 px-3.5 py-3 border border-[rgba(201,169,110,0.18)] rounded-lg border-l-[3px] border-l-violet no-underline hover:border-gold/40 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-[rgba(167,139,250,0.15)] text-violet inline-flex items-center justify-center text-xs font-semibold serif">
                      E
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-[13px] font-medium">
                        Your BABE Year
                      </p>
                      <p className="muted text-xs">Free · personal year</p>
                    </div>
                  </Link>
                </div>

                <Link
                  href="/shop/babe-signature"
                  className="btn btn-outline btn-sm mt-auto"
                >
                  View full Signature
                </Link>
              </div>
            </div>

            {/* Reports table */}
            <div className="card p-7">
              <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
                <h3 className="serif text-[1.4rem]">Your Reports</h3>
                <Link
                  href="/shop"
                  className="text-gold text-sm no-underline hover:text-gold-bright transition-colors"
                >
                  Order new &rarr;
                </Link>
              </div>

              {reports.length > 0 ? (
                <div className="flex flex-col">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-4 sm:gap-6 py-4 border-t border-[rgba(201,169,110,0.12)] items-center"
                    >
                      <div>
                        <p className="text-cream text-sm font-medium mb-1">
                          {r.product_slug}
                        </p>
                        <p className="muted text-xs">
                          {REPORT_PILL_LABEL[r.status] ?? r.status}
                        </p>
                      </div>
                      <span
                        className={`pill ${REPORT_PILL[r.status] ?? "pill-pending"}`}
                      >
                        {REPORT_PILL_LABEL[r.status] ?? r.status}
                      </span>
                      <span className="text-xs text-gold">
                        {formatShortDate(r.created_at)}
                      </span>
                      <Link
                        href={`/shop/${r.product_slug}`}
                        className={`btn btn-outline btn-sm ${r.status === "delivered" ? "" : "opacity-50 pointer-events-none"}`}
                      >
                        {r.status === "delivered" ? "Open" : "Pending"}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="muted text-sm mb-5">
                    No reports yet. Pick a read in the shop to start.
                  </p>
                  <Link href="/shop" className="btn btn-primary btn-sm">
                    Explore the Shop
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
