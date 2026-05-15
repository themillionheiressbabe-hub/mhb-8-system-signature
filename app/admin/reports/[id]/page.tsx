import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ReportDetailSidebar } from "@/components/admin/reports/ReportDetailSidebar";

export const metadata: Metadata = {
  title: "Report · BABE HQ",
};

type ReportStatus = "draft" | "in_review" | "approved" | "delivered";

type SectionShape = {
  title?: string;
  category?: string;
  lockedIn?: string;
  checkedOut?: string;
  receipts?: { lens?: string; finding?: string }[];
  body?: string;
  goldQuote?: string;
};

type ReportRow = {
  id: string;
  order_id: string;
  client_id: string;
  profile_id: string;
  product_slug: string;
  status: ReportStatus | null;
  content: { sections?: SectionShape[] } | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
};

type ProductRow = {
  slug: string;
  name: string | null;
  engine: number | null;
};

type ClientIndexRow = { id: string; created_at: string };

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const SLA_DAYS_BY_SLUG: Record<string, number> = {
  "babe-signature": 21,
  "bond-lens": 14,
  "business-lens": 14,
};
const DEFAULT_SLA_DAYS = 14;

const STATUS_INFO: Record<
  ReportStatus,
  { label: string; bg: string; text: string }
> = {
  draft: {
    label: "Draft",
    bg: "rgba(201,169,110,0.15)",
    text: "#C9A96E",
  },
  in_review: {
    label: "In Review",
    bg: "rgba(167,139,250,0.15)",
    text: "#A78BFA",
  },
  approved: {
    label: "Approved",
    bg: "rgba(181,30,90,0.15)",
    text: "#D63F7E",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(45,155,110,0.15)",
    text: "#2D9B6E",
  },
};

const LENS_LABEL: Record<string, string> = {
  tropical_astrology: "Tropical Astrology",
  sidereal_astrology: "Sidereal Astrology",
  destiny_cards: "Destiny Cards",
  name_frequency: "Name Frequency",
  numerology: "Numerology",
  chinese_zodiac: "Chinese Zodiac",
  chakras: "Chakras",
  medicine_wheel: "Medicine Wheel",
};

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function computeSla(report: ReportRow, slaDays: number) {
  if (report.status === "delivered") {
    return { label: "Delivered", color: "rgba(255,255,255,0.45)" };
  }
  const deadline = new Date(addDaysIso(report.created_at, slaDays));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0)
    return {
      label: `${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} overdue`,
      color: "#B51E5A",
    };
  if (diff <= 3)
    return {
      label: `${diff} day${diff === 1 ? "" : "s"} left`,
      color: "#C9A96E",
    };
  return {
    label: `${diff} days left`,
    color: "#2D9B6E",
  };
}

const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus | null> = {
  draft: "in_review",
  in_review: "approved",
  approved: "delivered",
  delivered: null,
};

function mhbNumber(i: number): string {
  return `MHB-${String(i + 1).padStart(4, "0")}`;
}

function sectionAnchorId(i: number): string {
  return `section-${i + 1}`;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReportDetailPage({ params }: Props) {
  const { id } = await params;

  async function moveStageAction() {
    "use server";
    const { data: row } = await supabaseAdmin
      .from("reports")
      .select("id, status, client_id, product_slug")
      .eq("id", id)
      .maybeSingle<{
        id: string;
        status: ReportStatus | null;
        client_id: string;
        product_slug: string;
      }>();
    if (!row) return;
    const current = row.status ?? "draft";
    const next = VALID_TRANSITIONS[current];
    if (!next) return;

    const patch: {
      status: ReportStatus;
      updated_at: string;
      delivered_at?: string | null;
    } = { status: next, updated_at: new Date().toISOString() };
    if (next === "delivered") patch.delivered_at = new Date().toISOString();

    await supabaseAdmin.from("reports").update(patch).eq("id", id);

    if (next === "delivered") {
      let productName = row.product_slug;
      let clientName = "a client";
      const [{ data: prod }, { data: client }] = await Promise.all([
        supabaseAdmin
          .from("products")
          .select("name")
          .eq("slug", row.product_slug)
          .maybeSingle<{ name: string | null }>(),
        supabaseAdmin
          .from("clients")
          .select("full_name")
          .eq("id", row.client_id)
          .maybeSingle<{ full_name: string | null }>(),
      ]);
      if (prod?.name) productName = prod.name;
      if (client?.full_name) clientName = client.full_name;
      await supabaseAdmin.from("admin_notifications").insert({
        type: "report_delivered",
        title: `Report delivered: ${productName} for ${clientName}`,
        link: "/admin/reports",
      });
    }

    revalidatePath(`/admin/reports/${id}`);
    revalidatePath("/admin/reports");
    revalidatePath("/admin/orders/processing");
  }

  async function deliverAction() {
    "use server";
    // Stub for now: flip to delivered if currently approved, mirror the
    // notification behaviour from moveStageAction.
    const { data: row } = await supabaseAdmin
      .from("reports")
      .select("status, client_id, product_slug")
      .eq("id", id)
      .maybeSingle<{
        status: ReportStatus | null;
        client_id: string;
        product_slug: string;
      }>();
    if (!row || row.status !== "approved") return;
    const nowIso = new Date().toISOString();
    await supabaseAdmin
      .from("reports")
      .update({ status: "delivered", delivered_at: nowIso, updated_at: nowIso })
      .eq("id", id);

    let productName = row.product_slug;
    let clientName = "a client";
    const [{ data: prod }, { data: client }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("name")
        .eq("slug", row.product_slug)
        .maybeSingle<{ name: string | null }>(),
      supabaseAdmin
        .from("clients")
        .select("full_name")
        .eq("id", row.client_id)
        .maybeSingle<{ full_name: string | null }>(),
    ]);
    if (prod?.name) productName = prod.name;
    if (client?.full_name) clientName = client.full_name;
    await supabaseAdmin.from("admin_notifications").insert({
      type: "report_delivered",
      title: `Report delivered: ${productName} for ${clientName}`,
      link: "/admin/reports",
    });

    revalidatePath(`/admin/reports/${id}`);
    revalidatePath("/admin/reports");
    revalidatePath("/admin/orders/processing");
  }

  async function deleteReportAction() {
    "use server";
    await supabaseAdmin.from("reports").delete().eq("id", id);
    revalidatePath("/admin/reports");
    revalidatePath("/admin/orders/processing");
    redirect("/admin/reports");
  }

  const { data: report } = await supabaseAdmin
    .from("reports")
    .select(
      "id, order_id, client_id, profile_id, product_slug, status, content, delivered_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle<ReportRow>();

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <main
          className="mx-auto w-full"
          style={{ maxWidth: "1200px", padding: "28px 36px" }}
        >
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <p className={EYEBROW}>Not found</p>
            <h1 className="serif-it text-gold text-3xl leading-tight mt-3">
              This report does not exist.
            </h1>
            <Link
              href="/admin/reports"
              className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] mt-6"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Back to Reports
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const [clientRes, productRes, clientIndexRes] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, full_name, date_of_birth, created_at")
      .eq("id", report.client_id)
      .maybeSingle<ClientRow>(),
    supabaseAdmin
      .from("products")
      .select("slug, name, engine")
      .eq("slug", report.product_slug)
      .maybeSingle<ProductRow>(),
    supabaseAdmin
      .from("clients")
      .select("id, created_at")
      .order("created_at", { ascending: true })
      .returns<ClientIndexRow[]>(),
  ]);

  const client = clientRes.data;
  const product = productRes.data;
  const indexList = clientIndexRes.data ?? [];
  const idx = client ? indexList.findIndex((c) => c.id === client.id) : -1;
  const safeIdx = idx >= 0 ? idx : 0;

  const status: ReportStatus = (report.status ?? "draft") as ReportStatus;
  const statusInfo = STATUS_INFO[status];
  const slaDays = SLA_DAYS_BY_SLUG[report.product_slug] ?? DEFAULT_SLA_DAYS;
  const sla = computeSla(report, slaDays);
  const sections = Array.isArray(report.content?.sections)
    ? report.content!.sections!
    : [];

  const sidebarSections = sections.map((s, i) => ({
    id: sectionAnchorId(i),
    title: s.title?.trim() || `Section ${i + 1}`,
    number: i + 1,
  }));

  const reportLabel =
    [client?.full_name, product?.name ?? report.product_slug]
      .filter(Boolean)
      .join(" · ") || "this report";

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-6">
          {/* Back link */}
          <Link
            href="/admin/reports"
            className="text-gold hover:text-gold-bright transition-colors inline-flex items-center gap-2 self-start"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span aria-hidden="true">&larr;</span>
            Back to reports
          </Link>

          {/* Header */}
          <div>
            <span
              className="text-gold"
              style={{
                fontFamily:
                  "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
                fontSize: "13px",
                letterSpacing: "0.05em",
              }}
            >
              {client ? mhbNumber(safeIdx) : "MHB-????"}
            </span>
            <h1
              className="serif-it text-white mt-1"
              style={{ fontSize: "48px", lineHeight: 1.05 }}
            >
              {client?.full_name ?? "Unknown client"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="text-magenta"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {product?.name ?? report.product_slug}
              </span>
              <span
                className="inline-flex rounded-full px-3 py-1 uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: statusInfo.bg,
                  color: statusInfo.text,
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {statusInfo.label}
              </span>
              {product?.engine ? (
                <span
                  className="inline-flex border border-gold/40 text-gold uppercase rounded-full px-2.5 py-0.5"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "10px",
                    letterSpacing: "0.18em",
                    fontWeight: 500,
                  }}
                >
                  Engine {product.engine}
                </span>
              ) : null}
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: sla.color,
                  fontWeight: 500,
                }}
              >
                {sla.label}
              </span>
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
            <article
              className="flex flex-col gap-10"
              style={{ maxWidth: "720px", justifySelf: "start" }}
            >
              {sections.length === 0 ? (
                <p
                  className="text-cream/40 italic"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                  }}
                >
                  This report has no sections yet. Open the report builder to
                  start drafting.
                </p>
              ) : null}

              {sections.map((s, i) => {
                const anchor = sectionAnchorId(i);
                const isLast = i === sections.length - 1;
                return (
                  <section key={anchor} id={anchor}>
                    <p className={EYEBROW}>
                      Section {String(i + 1).padStart(2, "0")}
                      {s.category ? ` · ${s.category}` : ""}
                    </p>
                    <h2
                      className="serif-it text-white mt-2"
                      style={{
                        fontSize: "28px",
                        lineHeight: 1.15,
                        borderLeft: "3px solid #B51E5A",
                        paddingLeft: "14px",
                      }}
                    >
                      {s.title?.trim() || `Section ${i + 1}`}
                    </h2>

                    {s.lockedIn ? (
                      <div
                        className="mt-5 rounded-xl"
                        style={{
                          backgroundColor: "rgba(45,155,110,0.08)",
                          border: "1px solid rgba(45,155,110,0.35)",
                          padding: "18px",
                        }}
                      >
                        <p
                          className="font-sans uppercase tracking-[0.35em] text-emerald font-semibold"
                          style={{ fontSize: "10.5px" }}
                        >
                          Locked In
                        </p>
                        <p
                          className="text-cream mt-2 whitespace-pre-wrap"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "16px",
                            lineHeight: 1.65,
                          }}
                        >
                          {s.lockedIn}
                        </p>
                      </div>
                    ) : null}

                    {s.checkedOut ? (
                      <div
                        className="mt-3 rounded-xl"
                        style={{
                          backgroundColor: "rgba(181,30,90,0.08)",
                          border: "1px solid rgba(181,30,90,0.35)",
                          padding: "18px",
                        }}
                      >
                        <p
                          className="font-sans uppercase tracking-[0.35em] text-magenta font-semibold"
                          style={{ fontSize: "10.5px" }}
                        >
                          Checked Out
                        </p>
                        <p
                          className="text-cream mt-2 whitespace-pre-wrap"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "16px",
                            lineHeight: 1.65,
                          }}
                        >
                          {s.checkedOut}
                        </p>
                      </div>
                    ) : null}

                    {Array.isArray(s.receipts) && s.receipts.length > 0 ? (
                      <div
                        className="mt-3 rounded-xl"
                        style={{
                          backgroundColor: "rgba(201,169,110,0.06)",
                          border: "1px solid rgba(201,169,110,0.35)",
                          padding: "18px",
                        }}
                      >
                        <p className={EYEBROW}>The Receipts</p>
                        <div className="mt-3 flex flex-col gap-3">
                          {s.receipts
                            .filter(
                              (r) => r.lens || (r.finding && r.finding.trim()),
                            )
                            .map((r, j) => (
                              <div key={j}>
                                <p
                                  className="text-gold uppercase tracking-[0.18em]"
                                  style={{
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "10.5px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {LENS_LABEL[r.lens ?? ""] ??
                                    r.lens ??
                                    "Lens"}
                                </p>
                                <p
                                  className="text-cream/80 mt-1 whitespace-pre-wrap"
                                  style={{
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "14px",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {r.finding}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : null}

                    {s.body ? (
                      <p
                        className="text-cream mt-5 whitespace-pre-wrap"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "16px",
                          lineHeight: 1.7,
                        }}
                      >
                        {s.body}
                      </p>
                    ) : null}

                    {s.goldQuote ? (
                      <p
                        className="serif-it text-gold text-center mt-7"
                        style={{ fontSize: "24px", lineHeight: 1.35 }}
                      >
                        {s.goldQuote}
                      </p>
                    ) : null}

                    {!isLast ? (
                      <hr
                        className="mt-8 border-0 border-t"
                        style={{ borderColor: "rgba(201,169,110,0.15)" }}
                      />
                    ) : null}
                  </section>
                );
              })}

              {/* Compliance footer */}
              <footer
                className="text-center pt-10 mt-6 border-t border-gold/15 flex flex-col gap-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <p
                  className="text-white/45"
                  style={{ fontSize: "12px", lineHeight: 1.55 }}
                >
                  If your lived experience disagrees with anything in this
                  document, trust your lived experience. For personal
                  development and entertainment purposes only.
                </p>
                <p
                  className="serif-it text-gold"
                  style={{ fontSize: "16px" }}
                >
                  With love, The MillionHeiress BABE x
                </p>
              </footer>
            </article>

            <ReportDetailSidebar
              status={status}
              orderId={report.order_id}
              sections={sidebarSections}
              reportLabel={reportLabel}
              moveStage={moveStageAction}
              deliver={deliverAction}
              deleteReport={deleteReportAction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
