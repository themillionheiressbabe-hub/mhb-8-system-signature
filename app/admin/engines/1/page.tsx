import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { EngineTriggerButton } from "@/components/admin/engines/EngineTriggerButton";

export const metadata: Metadata = {
  title: "Engine 1 · Passive · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toUkIso(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function formatStamp(iso: string): string {
  const d = new Date(iso);
  const date = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  return `${date}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatGbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 3)}***${domain}`;
}

function maskId(id: string): string {
  return id.replace(/-/g, "").slice(-8).toUpperCase();
}

function daysSinceIso(iso: string): number {
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24)));
}

async function regenerateTodayAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  "use server";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, error: "CRON_SECRET is not configured." };
  }
  try {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (!host) return { ok: false, error: "Unable to resolve server host." };
    const res = await fetch(`${proto}://${host}/api/generate-daily-read`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: body || `Generate-daily-read returned ${res.status}.`,
      };
    }
    revalidatePath("/admin/engines/1");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

type ProductRow = {
  slug: string;
  name: string;
  price_pence: number | null;
  is_active: boolean | null;
};

type DailyReadRow = {
  cache_date: string;
  card_code: string;
  created_at: string;
};

type CardRow = {
  card_code: string;
  card_name: string;
  suit: string;
};

type OrderRow = {
  id: string;
  product_slug: string;
  client_id: string | null;
  amount_pence: number;
  status: "pending" | "paid" | "failed" | "refunded" | "active_subscription" | null;
  created_at: string;
};

type ClientRow = {
  id: string;
  full_name: string;
};

type ReportRow = {
  order_id: string;
  status: "draft" | "in_review" | "approved" | "delivered" | null;
};

const ENGINE_1_SLUGS = [
  "daily-frequency-free",
  "birthprint-snapshot",
  "your-babe-year-free",
  "babe-life-spread",
  "daily-frequency-personal",
];

const ENGINE_1_DEFAULTS: Record<
  string,
  { name: string; price: string; freeProduct: boolean }
> = {
  "daily-frequency-free": {
    name: "The Daily Frequency",
    price: "FREE",
    freeProduct: true,
  },
  "birthprint-snapshot": {
    name: "The Birthprint Snapshot",
    price: "FREE",
    freeProduct: true,
  },
  "your-babe-year-free": {
    name: "Your BABE Year",
    price: "FREE",
    freeProduct: true,
  },
  "babe-life-spread": {
    name: "The BABE Life Spread",
    price: "£14",
    freeProduct: false,
  },
  "daily-frequency-personal": {
    name: "Daily Frequency · Personal",
    price: "£4.99/mo",
    freeProduct: false,
  },
};

export default async function AdminEngine1Page() {
  const todayUk = toUkIso(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoUk = toUkIso(sevenDaysAgo);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString();

  // Parallel fetches
  const [
    productsRes,
    dailyWeekRes,
    cardLibRes,
    lifeSpreadOrdersRes,
    subOrdersRes,
    monthOrdersRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("slug, name, price_pence, is_active")
      .in("slug", ENGINE_1_SLUGS)
      .returns<ProductRow[]>(),
    supabaseAdmin
      .from("daily_reads_cache")
      .select("cache_date, card_code, created_at")
      .gte("cache_date", sevenDaysAgoUk)
      .order("cache_date", { ascending: false })
      .returns<DailyReadRow[]>(),
    supabaseAdmin
      .from("card_library")
      .select("card_code, card_name, suit")
      .returns<CardRow[]>(),
    supabaseAdmin
      .from("orders")
      .select(
        "id, product_slug, client_id, amount_pence, status, created_at",
      )
      .eq("product_slug", "babe-life-spread")
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>(),
    supabaseAdmin
      .from("orders")
      .select(
        "id, product_slug, client_id, amount_pence, status, created_at",
      )
      .eq("product_slug", "daily-frequency-personal")
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>(),
    supabaseAdmin
      .from("orders")
      .select("product_slug, status, amount_pence, created_at")
      .in("product_slug", ENGINE_1_SLUGS)
      .gte("created_at", startOfMonthIso)
      .returns<
        Array<{
          product_slug: string;
          status: string | null;
          amount_pence: number;
          created_at: string;
        }>
      >(),
  ]);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  const cardByCode = new Map<
    string,
    { name: string; suit: string }
  >();
  for (const c of cardLibRes.data ?? [])
    cardByCode.set(c.card_code, {
      name: c.card_name.replace(/\s*\(.*$/, ""),
      suit: c.suit,
    });

  // Today's daily read status
  const dailyRows = dailyWeekRes.data ?? [];
  const todayRow = dailyRows.find((r) => r.cache_date === todayUk) ?? null;
  const lastSevenDays = (() => {
    const out: Array<{
      date: string;
      cardName: string | null;
      generated: boolean;
    }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toUkIso(d);
      const row = dailyRows.find((r) => r.cache_date === iso);
      const card = row ? cardByCode.get(row.card_code) : null;
      out.push({
        date: iso,
        cardName: card?.name ?? null,
        generated: !!row,
      });
    }
    return out;
  })();

  // Cron status
  const lastRunIso = dailyRows[0]?.created_at ?? null;
  const lastRunMsAgo = lastRunIso
    ? Date.now() - new Date(lastRunIso).getTime()
    : Infinity;
  const cronHealthy = lastRunMsAgo <= 25 * 60 * 60 * 1000;
  const nextRun = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    // 7am UK is roughly 7am Europe/London; we just label it.
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(t.getFullYear(), t.getMonth(), t.getDate(), 7, 0));
  })();

  // Life Spread analytics
  const lifeOrders = lifeSpreadOrdersRes.data ?? [];
  const lifeOrderIds = lifeOrders.map((o) => o.id);
  const lifeClientIds = Array.from(
    new Set(
      lifeOrders.map((o) => o.client_id).filter((v): v is string => !!v),
    ),
  );

  const [lifeReportsRes, lifeClientsRes] = await Promise.all([
    lifeOrderIds.length > 0
      ? supabaseAdmin
          .from("reports")
          .select("order_id, status")
          .in("order_id", lifeOrderIds)
          .returns<ReportRow[]>()
      : Promise.resolve({ data: [] as ReportRow[] }),
    lifeClientIds.length > 0
      ? supabaseAdmin
          .from("clients")
          .select("id, full_name")
          .in("id", lifeClientIds)
          .returns<ClientRow[]>()
      : Promise.resolve({ data: [] as ClientRow[] }),
  ]);

  const reportByOrder = new Map<string, ReportRow>();
  for (const r of lifeReportsRes.data ?? [])
    reportByOrder.set(r.order_id, r);
  const clientById = new Map<string, ClientRow>();
  for (const c of lifeClientsRes.data ?? []) clientById.set(c.id, c);

  const lifePaid = lifeOrders.filter((o) => o.status === "paid");
  const lifeTotalRevenuePence = lifePaid.reduce(
    (s, o) => s + (o.amount_pence ?? 0),
    0,
  );
  const lifeAvgPence =
    lifePaid.length > 0 ? Math.round(lifeTotalRevenuePence / lifePaid.length) : 0;

  const lifeQueue = lifeOrders.filter((o) => {
    if (o.status !== "paid") return false;
    const r = reportByOrder.get(o.id);
    return !r || r.status !== "delivered";
  });

  // Subscription analytics
  const subOrders = subOrdersRes.data ?? [];
  const subActive = subOrders.filter(
    (o) =>
      o.status === "active_subscription" ||
      o.status === "paid",
  );
  const mrrPence = subActive.length * 499;
  const subThisMonth = subOrders.filter(
    (o) => new Date(o.created_at) >= startOfMonth,
  );

  // Month counts per product
  const monthOrdersAll = monthOrdersRes.data ?? [];
  const monthCountsBySlug = new Map<string, number>();
  for (const o of monthOrdersAll) {
    monthCountsBySlug.set(
      o.product_slug,
      (monthCountsBySlug.get(o.product_slug) ?? 0) + 1,
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/engines/1" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <p className={EYEBROW}>Engine 1 · Passive</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              Automated products.
            </h1>
            <p
              className="text-cream/65 mt-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
              }}
            >
              Zero of your time. AI-drafted. Auto-delivered.
            </p>
          </div>

          {/* Product overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {ENGINE_1_SLUGS.map((slug) => {
              const product = productBySlug.get(slug);
              const def = ENGINE_1_DEFAULTS[slug];
              const name = product?.name ?? def.name;
              const active = product ? product.is_active !== false : false;
              const monthCount = monthCountsBySlug.get(slug) ?? 0;
              return (
                <div
                  key={slug}
                  className="bg-[#151B33] rounded-2xl flex flex-col gap-2.5"
                  style={{
                    border: "1px solid rgba(201,169,110,0.15)",
                    padding: "18px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <p className={EYEBROW}>{name}</p>
                  <p
                    className="serif-it text-gold leading-none"
                    style={{ fontSize: "26px" }}
                  >
                    {def.price}
                  </p>
                  <span
                    className="inline-flex self-start rounded-full px-2.5 py-0.5 uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: active
                        ? "rgba(45,155,110,0.15)"
                        : "rgba(201,169,110,0.15)",
                      color: active ? "#2D9B6E" : "#C9A96E",
                      fontSize: "10px",
                      fontWeight: 500,
                    }}
                  >
                    {active ? "Live" : "Draft"}
                  </span>
                  <p
                    className="text-cream/70 mt-1"
                    style={{ fontSize: "13px" }}
                  >
                    {def.freeProduct
                      ? monthCount > 0
                        ? `${monthCount} uses this month`
                        : "No data yet"
                      : monthCount > 0
                        ? `${monthCount} ${
                            monthCount === 1 ? "order" : "orders"
                          } this month`
                        : "No data yet"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* SECTION 1 — Daily Frequency */}
          <section className="flex flex-col gap-4">
            <p className={EYEBROW}>The Daily Frequency</p>
            <div
              className="bg-[#151B33] rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              style={{
                border: "1px solid rgba(201,169,110,0.15)",
                padding: "20px",
              }}
            >
              <div>
                <p
                  className="text-cream/55 uppercase tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "10.5px",
                    fontWeight: 500,
                  }}
                >
                  {todayRow
                    ? cardByCode.get(todayRow.card_code)?.suit
                      ? cardByCode.get(todayRow.card_code)!.suit.toUpperCase()
                      : "TODAY"
                    : "TODAY"}{" "}
                  · {formatDate(todayUk)}
                </p>
                <h2
                  className="serif-it text-gold mt-2"
                  style={{ fontSize: "24px", lineHeight: 1.2 }}
                >
                  {todayRow
                    ? cardByCode.get(todayRow.card_code)?.name ??
                      todayRow.card_code
                    : "Awaiting today's card"}
                </h2>
                <span
                  className="inline-flex mt-3 rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: todayRow
                      ? "rgba(45,155,110,0.15)"
                      : "rgba(181,30,90,0.15)",
                    color: todayRow ? "#2D9B6E" : "#D63F7E",
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  {todayRow ? "Generated" : "Pending"}
                </span>
              </div>
              <div
                className="flex flex-col gap-2.5 md:items-end"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Link
                  href="/tools/daily-frequency"
                  className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] text-center"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  View Today&rsquo;s Read
                </Link>
                <EngineTriggerButton
                  label="Regenerate Today"
                  pendingLabel="Regenerating..."
                  successLabel="Generated successfully"
                  action={regenerateTodayAction}
                />
              </div>
            </div>

            <div
              className="bg-[#151B33] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(201,169,110,0.15)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ fontFamily: "var(--font-sans)" }}>
                      <Th>Date</Th>
                      <Th>Card</Th>
                      <Th>Status</Th>
                      <Th>Views</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSevenDays.map((row) => (
                      <tr
                        key={row.date}
                        className="border-t border-[rgba(201,169,110,0.08)]"
                      >
                        <Td>{formatDate(row.date)}</Td>
                        <Td>
                          {row.cardName ?? (
                            <span className="text-cream/30">—</span>
                          )}
                        </Td>
                        <Td>
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 uppercase tracking-[0.18em]"
                            style={{
                              backgroundColor: row.generated
                                ? "rgba(45,155,110,0.15)"
                                : "rgba(181,30,90,0.15)",
                              color: row.generated ? "#2D9B6E" : "#D63F7E",
                              fontFamily: "var(--font-sans)",
                              fontSize: "10px",
                              fontWeight: 500,
                            }}
                          >
                            {row.generated ? "Generated" : "Missed"}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-cream/30">Logging not yet enabled</span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 2 — Birthprint Snapshot */}
          <section className="flex flex-col gap-4">
            <p className={EYEBROW}>The Birthprint Snapshot</p>
            <LogStub
              note="Logging not yet enabled."
              emptyTableLabel="Enable snapshot logging to see data here."
              recentEyebrow="Recent Snapshots"
            />
          </section>

          {/* SECTION 3 — Your BABE Year */}
          <section className="flex flex-col gap-4">
            <p className={EYEBROW}>Your BABE Year</p>
            <LogStub
              note="Logging not yet enabled."
              emptyTableLabel="Enable usage logging to see data here."
              recentEyebrow="Recent Uses"
            />
          </section>

          {/* SECTION 4 — BABE Life Spread */}
          <section className="flex flex-col gap-4">
            <p className={EYEBROW}>The BABE Life Spread · £14</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Kpi
                label="Total Orders"
                value={`${lifePaid.length}`}
                colour="#C9A96E"
              />
              <Kpi
                label="Total Revenue"
                value={formatGbp(lifeTotalRevenuePence)}
                colour="#2D9B6E"
              />
              <Kpi
                label="Average Order"
                value={
                  lifePaid.length > 0 ? formatGbp(lifeAvgPence) : "No data yet"
                }
                colour="#D63F7E"
              />
            </div>

            <div
              className="bg-[#151B33] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(201,169,110,0.15)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ fontFamily: "var(--font-sans)" }}>
                      <Th>Order ID</Th>
                      <Th>Date</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifeOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-6 text-cream/40 italic"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          No orders yet for the Life Spread.
                        </td>
                      </tr>
                    ) : null}
                    {lifeOrders.slice(0, 10).map((o) => (
                      <tr
                        key={o.id}
                        className="border-t border-[rgba(201,169,110,0.08)]"
                      >
                        <Td mono>{`MHB-${maskId(o.id).slice(-4)}`}</Td>
                        <Td>{formatDate(toUkIso(new Date(o.created_at)))}</Td>
                        <Td>{formatGbp(o.amount_pence ?? 0)}</Td>
                        <Td>{o.status ?? "—"}</Td>
                        <Td>
                          <Link
                            href="/admin/orders"
                            className="text-gold border border-gold/40 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em] inline-flex"
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "10px",
                              fontWeight: 500,
                            }}
                          >
                            View Order
                          </Link>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className={EYEBROW}>Generation Queue</p>
              <div className="mt-3 flex flex-col gap-2.5">
                {lifeQueue.length === 0 ? (
                  <p
                    className="text-cream/40 italic"
                    style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}
                  >
                    Nothing in the queue. All orders generated.
                  </p>
                ) : null}
                {lifeQueue.map((o) => {
                  const client = o.client_id
                    ? clientById.get(o.client_id)
                    : null;
                  return (
                    <div
                      key={o.id}
                      className="bg-[#151B33] rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                      style={{
                        border: "1px solid rgba(201,169,110,0.15)",
                        padding: "14px 18px",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-gold"
                          style={{
                            fontFamily:
                              "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                            fontSize: "12px",
                            letterSpacing: "0.05em",
                          }}
                        >
                          MHB-{maskId(o.id).slice(-4)}
                        </span>
                        <span
                          className="text-cream"
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          {client?.full_name ?? "Unknown client"}
                        </span>
                        <span
                          className="text-cream/50"
                          style={{ fontSize: "12px" }}
                        >
                          Ordered{" "}
                          {formatDate(toUkIso(new Date(o.created_at)))} ·{" "}
                          {daysSinceIso(o.created_at)} days waiting
                        </span>
                      </div>
                      <Link
                        href={`/admin/reports/new?order=${o.id}`}
                        className="bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        Generate Report
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 5 — Daily Frequency Personal */}
          <section className="flex flex-col gap-4">
            <p className={EYEBROW}>Daily Frequency · Personal · £4.99/mo</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Kpi
                label="Active Subscribers"
                value={`${subActive.length}`}
                colour="#2D9B6E"
              />
              <Kpi
                label="Monthly Recurring Revenue"
                value={formatGbp(mrrPence)}
                colour="#C9A96E"
              />
              <Kpi label="Churned This Month" value="No data yet" colour="#D63F7E" />
              <Kpi
                label="New This Month"
                value={`${subThisMonth.length}`}
                colour="#C9A96E"
              />
            </div>

            <div
              className="bg-[#151B33] rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(201,169,110,0.15)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ fontFamily: "var(--font-sans)" }}>
                      <Th>Subscriber</Th>
                      <Th>Joined</Th>
                      <Th>Status</Th>
                      <Th>Last Email</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {subOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-6 text-cream/40 italic"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          No subscribers yet.
                        </td>
                      </tr>
                    ) : null}
                    {subOrders.slice(0, 10).map((o) => (
                      <tr
                        key={o.id}
                        className="border-t border-[rgba(201,169,110,0.08)]"
                      >
                        <Td mono>{maskId(o.id)}</Td>
                        <Td>{formatDate(toUkIso(new Date(o.created_at)))}</Td>
                        <Td>{o.status ?? "—"}</Td>
                        <Td>
                          <span className="text-cream/30">No data yet</span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Cron health */}
          <section className="flex flex-col gap-3">
            <p className={EYEBROW}>Cron Status</p>
            <div
              className="bg-[#151B33] rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              style={{
                border: "1px solid rgba(201,169,110,0.15)",
                padding: "20px",
                fontFamily: "var(--font-sans)",
              }}
            >
              <div className="flex flex-col gap-1">
                <span
                  className="text-cream/55 uppercase tracking-[0.2em]"
                  style={{ fontSize: "10.5px", fontWeight: 500 }}
                >
                  Last successful run
                </span>
                <span
                  className="text-cream"
                  style={{ fontSize: "14px" }}
                >
                  {lastRunIso ? formatStamp(lastRunIso) : "No runs recorded"}
                </span>
                <span
                  className="text-cream/55 uppercase tracking-[0.2em] mt-2"
                  style={{ fontSize: "10.5px", fontWeight: 500 }}
                >
                  Next scheduled
                </span>
                <span
                  className="text-cream"
                  style={{ fontSize: "14px" }}
                >
                  {nextRun} UK
                </span>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <span
                  className="inline-flex self-start md:self-end rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: cronHealthy
                      ? "rgba(45,155,110,0.15)"
                      : "rgba(181,30,90,0.15)",
                    color: cronHealthy ? "#2D9B6E" : "#D63F7E",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  {cronHealthy ? "Healthy" : "Missed"}
                </span>
                <EngineTriggerButton
                  label="Trigger Now"
                  pendingLabel="Triggering..."
                  successLabel="Generated successfully"
                  variant="gold"
                  action={regenerateTodayAction}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-4 py-3 border-b border-[rgba(201,169,110,0.15)] text-cream/60 uppercase text-left"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        letterSpacing: "0.2em",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className="px-4 py-3 text-cream"
      style={{
        fontFamily: mono
          ? "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)"
          : "var(--font-sans)",
        fontSize: mono ? "12px" : "13px",
        color: mono ? "#C9A96E" : "rgba(244,241,237,0.85)",
        letterSpacing: mono ? "0.04em" : undefined,
      }}
    >
      {children}
    </td>
  );
}

function Kpi({
  label,
  value,
  colour,
}: {
  label: string;
  value: string;
  colour: string;
}) {
  return (
    <div
      className="bg-[#151B33] rounded-2xl"
      style={{
        border: "1px solid rgba(201,169,110,0.15)",
        padding: "18px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <p className={EYEBROW}>{label}</p>
      <p
        className="leading-none mt-2"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "30px",
          color: colour,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function LogStub({
  note,
  recentEyebrow,
  emptyTableLabel,
}: {
  note: string;
  recentEyebrow: string;
  emptyTableLabel: string;
}) {
  return (
    <>
      <div
        className="bg-[#151B33] rounded-2xl"
        style={{
          border: "1px solid rgba(201,169,110,0.15)",
          padding: "18px",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p className={EYEBROW}>Total Uses</p>
        <p
          className="text-cream/55 mt-2"
          style={{ fontSize: "14px" }}
        >
          {note}
        </p>
      </div>
      <div>
        <p className={EYEBROW}>{recentEyebrow}</p>
        <div
          className="mt-3 bg-[#151B33] rounded-2xl"
          style={{
            border: "1px solid rgba(201,169,110,0.15)",
            padding: "18px",
            fontFamily: "var(--font-sans)",
          }}
        >
          <p
            className="text-cream/40 italic text-center"
            style={{ fontSize: "13px" }}
          >
            {emptyTableLabel}
          </p>
        </div>
      </div>
    </>
  );
}
