import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DailyCardWidget } from "@/components/DailyCardWidget";

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

type AttentionRow = {
  id: string;
  product_slug: string;
  status: string;
  created_at: string;
};

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  place_of_birth: string | null;
  is_joker: boolean;
  created_at: string;
};

type OrderAmount = {
  amount_pence: number;
};

function formatGBP(pence: number) {
  const pounds = Math.floor(pence / 100);
  return `£${pounds.toLocaleString("en-GB")}`;
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

export default async function AdminPage() {
  const today = new Date();
  const dateLabel = `${WEEKDAYS[today.getDay()]} · ${today.getDate()} ${MONTHS[today.getMonth()]}`;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    clientsRes,
    ordersRes,
    reportsRes,
    pendingReportsRes,
    inReviewRes,
    revenueRes,
    attentionRes,
    recentClientsRes,
  ] = await Promise.all([
    supabaseAdmin.from("clients").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("reports").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
    supabaseAdmin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_review"),
    supabaseAdmin
      .from("orders")
      .select("amount_pence")
      .eq("status", "paid")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .returns<OrderAmount[]>(),
    supabaseAdmin
      .from("reports")
      .select("id, product_slug, status, created_at")
      .eq("status", "in_review")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<AttentionRow[]>(),
    supabaseAdmin
      .from("clients")
      .select("id, full_name, date_of_birth, place_of_birth, is_joker, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<ClientRow[]>(),
  ]);

  const clientsCount = clientsRes.count ?? 0;
  const ordersCount = ordersRes.count ?? 0;
  const reportsCount = reportsRes.count ?? 0;
  const pendingCount = pendingReportsRes.count ?? 0;
  const attentionCount = inReviewRes.count ?? 0;
  const revenuePence =
    revenueRes.data?.reduce((sum, o) => sum + o.amount_pence, 0) ?? 0;
  const attention = attentionRes.data ?? [];
  const recentClients = recentClientsRes.data ?? [];

  return (
    <div className="min-h-screen bg-[#111827] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin" />

      {/* MAIN */}
      <main className="p-6 sm:p-9">
        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2.5">{dateLabel}</p>
            <h1 className="serif text-magenta text-[2.25rem] leading-[1.1]">
              BABE HQ Overview
            </h1>
          </div>
          <div className="flex gap-2.5">
            <Link href="/shop" className="btn btn-outline btn-sm">
              View Shop
            </Link>
            <Link
              href="/admin/reports"
              className="btn btn-primary btn-sm"
            >
              Reports
            </Link>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
          <div className="card-admin">
            <p className="eyebrow mb-2">Revenue · 30d</p>
            <p
              className="text-cream text-[1.85rem] font-semibold leading-none tabular-nums"
            >
              {formatGBP(revenuePence)}
            </p>
            <p className="text-emerald text-xs mt-1.5">Paid orders</p>
          </div>
          <div className="card-admin">
            <p className="eyebrow mb-2">Reports in build</p>
            <p className="text-cream text-[1.85rem] font-semibold leading-none">
              {pendingCount}
            </p>
            <p className="text-gold text-xs mt-1.5">Drafts open</p>
          </div>
          <div className="card-admin border-l-[3px] border-l-magenta">
            <p className="eyebrow eyebrow-mag mb-2">Attention</p>
            <p className="text-cream text-[1.85rem] font-semibold leading-none">
              {attentionCount}
            </p>
            <p className="text-magenta text-xs mt-1.5">Need review</p>
          </div>
          <div className="card-admin">
            <p className="eyebrow mb-2">Active clients</p>
            <p className="text-cream text-[1.85rem] font-semibold leading-none">
              {clientsCount}
            </p>
            <p className="text-emerald text-xs mt-1.5">{ordersCount} orders all-time</p>
          </div>
        </div>

        {/* Today's collective read — content seeds */}
        <div className="card-admin mb-[18px]">
          <div className="flex justify-between items-end mb-5 flex-wrap gap-3">
            <div>
              <p className="eyebrow mb-2">Today&rsquo;s Content Seeds</p>
              <h2 className="serif text-magenta text-[1.4rem]">
                Today&rsquo;s Collective Read
              </h2>
            </div>
          </div>
          <DailyCardWidget
            variant="full"
            ctaHref="/tools/daily-frequency"
            ctaLabel="Open the full read"
            showCopySeed
          />
        </div>

        {/* Two-col main */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[18px] mb-[18px]">
          {/* Attention queue */}
          <div className="card-admin">
            <div className="flex justify-between items-end mb-4">
              <h2 className="serif text-magenta text-[1.4rem]">
                Attention Queue
              </h2>
              <span className="pill pill-pending text-[10px]">
                {attentionCount} {attentionCount === 1 ? "item" : "items"}
              </span>
            </div>
            {attention.length > 0 ? (
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="text-left text-cream/50 text-[10px] tracking-[0.2em] uppercase">
                    <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                      Report
                    </th>
                    <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                      Status
                    </th>
                    <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                      Date
                    </th>
                    <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {attention.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[rgba(201,169,110,0.10)]"
                    >
                      <td className="py-3.5 px-3 text-cream">
                        {r.product_slug}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`pill ${REPORT_PILL[r.status] ?? "pill-pending"} text-[9px]`}
                        >
                          {REPORT_PILL_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 muted">
                        {formatShortDate(r.created_at)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href="/admin/reports"
                          className="btn btn-outline btn-sm py-1.5 px-3.5 text-[11px]"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted text-sm py-6 text-center">
                Nothing in the queue. Inbox zero.
              </p>
            )}
          </div>

          {/* Pipeline */}
          <div className="card-admin">
            <h2 className="serif text-magenta text-[1.4rem] mb-4">
              Pipeline at a glance
            </h2>
            <div className="flex flex-col gap-3.5">
              <div className="p-3.5 bg-[rgba(45,155,110,0.08)] border border-[rgba(45,155,110,0.25)] rounded-lg">
                <p className="eyebrow text-emerald mb-1.5">Engine 1 · Auto</p>
                <p className="text-cream text-sm">
                  Card-of-the-Day live for collective
                </p>
                <p className="muted text-xs mt-1">All 3 lenses verifying</p>
              </div>
              <div className="p-3.5 bg-[rgba(201,169,110,0.08)] border border-[rgba(201,169,110,0.25)] rounded-lg">
                <p className="eyebrow mb-1.5">Engine 2 · Manual</p>
                <p className="text-cream text-sm">
                  {pendingCount} {pendingCount === 1 ? "report" : "reports"} in
                  build
                </p>
                <p className="muted text-xs mt-1">
                  {attentionCount} awaiting review
                </p>
              </div>
              <div className="p-3.5 bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.25)] rounded-lg">
                <p className="eyebrow text-violet mb-1.5">Engine 3 · Bond</p>
                <p className="text-cream text-sm">
                  {clientsCount} {clientsCount === 1 ? "client" : "clients"} on
                  the books
                </p>
                <p className="muted text-xs mt-1">{reportsCount} total reports built</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent clients */}
        <div className="card-admin">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-3">
            <h2 className="serif text-magenta text-[1.4rem]">
              Recent Clients
            </h2>
            <Link href="/admin/clients" className="btn btn-outline btn-sm">
              View all
            </Link>
          </div>
          {recentClients.length > 0 ? (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-cream/50 text-[10px] tracking-[0.2em] uppercase">
                  <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                    Name
                  </th>
                  <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                    Date of birth
                  </th>
                  <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                    Place
                  </th>
                  <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)] font-medium">
                    Added
                  </th>
                  <th className="py-2.5 px-3 border-b border-[rgba(201,169,110,0.15)]"></th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[rgba(201,169,110,0.10)]"
                  >
                    <td className="py-3.5 px-3 text-cream">
                      {c.full_name}
                      {c.is_joker ? (
                        <span className="text-violet text-[10px] ml-2 align-middle">
                          ★ Joker
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-3 muted">{c.date_of_birth}</td>
                    <td className="py-3.5 px-3 muted">
                      {c.place_of_birth ?? "Not set"}
                    </td>
                    <td className="py-3.5 px-3 text-gold">
                      {formatShortDate(c.created_at)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={`/admin/clients/${c.id}/edit`}
                        className="btn btn-outline btn-sm py-1.5 px-3.5 text-[11px]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted text-sm py-8 text-center">
              No clients yet. Add the first one from the Clients page.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

