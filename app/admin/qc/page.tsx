import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Orbit } from "@/components/Orbit";
import {
  QcFlagButton,
  QcEditFlagButton,
  type QcReportOption,
} from "@/components/admin/qc/QcFlagButton";

export const metadata: Metadata = {
  title: "QC Queue · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

type FlaggedRow = {
  id: string;
  client_id: string;
  product_slug: string;
  flagged_for_qc: boolean | null;
  qc_flag_reason: string | null;
  updated_at: string;
};

type ReviewRow = {
  id: string;
  client_id: string;
  product_slug: string;
  content: { sections?: NlpSectionShape[] } | null;
};

type NlpSectionShape = {
  nlp?: Record<string, boolean>;
};

type ClientRow = {
  id: string;
  full_name: string;
};

type ProductRow = {
  slug: string;
  name: string | null;
};

const NLP_KEYS = [
  "pacing",
  "validation",
  "reframing",
  "pattern_interrupt",
  "future_pacing",
  "anchoring",
  "implementation_intention",
  "embedded_commands",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

async function clearFlagAction(reportId: string) {
  "use server";
  await supabaseAdmin
    .from("reports")
    .update({
      flagged_for_qc: false,
      qc_flag_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  revalidatePath("/admin/qc");
}

async function flagReportAction(
  reportId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  if (!reportId) return { ok: false, error: "Report id is required." };
  const { error } = await supabaseAdmin
    .from("reports")
    .update({
      flagged_for_qc: true,
      qc_flag_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/qc");
  return { ok: true };
}

async function updateFlagReasonAction(
  reportId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin
    .from("reports")
    .update({
      qc_flag_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/qc");
  return { ok: true };
}

export default async function AdminQcPage() {
  const [flaggedRes, reviewRes, allReportsRes] = await Promise.all([
    supabaseAdmin
      .from("reports")
      .select(
        "id, client_id, product_slug, flagged_for_qc, qc_flag_reason, updated_at",
      )
      .eq("flagged_for_qc", true)
      .order("updated_at", { ascending: false })
      .returns<FlaggedRow[]>(),
    supabaseAdmin
      .from("reports")
      .select("id, client_id, product_slug, content")
      .eq("status", "in_review")
      .order("updated_at", { ascending: false })
      .returns<ReviewRow[]>(),
    supabaseAdmin
      .from("reports")
      .select("id, client_id, product_slug")
      .order("updated_at", { ascending: false })
      .limit(200)
      .returns<
        Array<{ id: string; client_id: string; product_slug: string }>
      >(),
  ]);

  const flagged = flaggedRes.data ?? [];
  const reviews = reviewRes.data ?? [];
  const allReports = allReportsRes.data ?? [];

  const clientIds = Array.from(
    new Set([
      ...flagged.map((r) => r.client_id),
      ...reviews.map((r) => r.client_id),
      ...allReports.map((r) => r.client_id),
    ]),
  );
  const productSlugs = Array.from(
    new Set([
      ...flagged.map((r) => r.product_slug),
      ...reviews.map((r) => r.product_slug),
      ...allReports.map((r) => r.product_slug),
    ]),
  );

  const [clientsRes, productsRes] = await Promise.all([
    clientIds.length > 0
      ? supabaseAdmin
          .from("clients")
          .select("id, full_name")
          .in("id", clientIds)
          .returns<ClientRow[]>()
      : Promise.resolve({ data: [] as ClientRow[] }),
    productSlugs.length > 0
      ? supabaseAdmin
          .from("products")
          .select("slug, name")
          .in("slug", productSlugs)
          .returns<ProductRow[]>()
      : Promise.resolve({ data: [] as ProductRow[] }),
  ]);

  const clientById = new Map<string, ClientRow>();
  for (const c of clientsRes.data ?? []) clientById.set(c.id, c);
  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  function clientName(id: string): string {
    return clientById.get(id)?.full_name ?? "Unknown client";
  }
  function productName(slug: string): string {
    return productBySlug.get(slug)?.name ?? slug;
  }

  const flagOptions: QcReportOption[] = allReports.map((r) => ({
    id: r.id,
    clientName: clientName(r.client_id),
    productName: productName(r.product_slug),
  }));

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/qc" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-7">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className={EYEBROW}>QC Queue</p>
              <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
                Quality control.
              </h1>
            </div>
            <QcFlagButton
              reports={flagOptions}
              flagReport={flagReportAction}
            />
          </div>

          {/* Flagged reports */}
          <section>
            <p className={EYEBROW}>Flagged Reports</p>

            {flagged.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center py-14 px-4 text-center">
                <Orbit size={80} suit="clubs" compact showCardinals={false} />
                <p className={`${EYEBROW} mt-4`}>All clear</p>
                <h2 className="serif-it text-gold text-2xl leading-tight mt-2">
                  No reports flagged.
                </h2>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {flagged.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#151B33] rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    style={{
                      border: "1px solid rgba(201,169,110,0.15)",
                      padding: "20px",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <h3
                        className="serif-it text-white"
                        style={{ fontSize: "22px", lineHeight: 1.2 }}
                      >
                        {clientName(r.client_id)}
                      </h3>
                      <p
                        className="text-magenta mt-1"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        {productName(r.product_slug)}
                      </p>
                      {r.qc_flag_reason ? (
                        <p
                          className="text-cream/70 mt-2"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "13px",
                          }}
                        >
                          Reason: {r.qc_flag_reason}
                        </p>
                      ) : null}
                      <p
                        className="text-white/45 mt-2"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "11px",
                        }}
                      >
                        Flagged {formatDate(r.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/reports/${r.id}`}
                        className="bg-magenta text-cream rounded-full px-4 py-2 hover:bg-magenta-bright transition-colors uppercase tracking-[0.18em]"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}
                      >
                        Review Report
                      </Link>
                      <QcEditFlagButton
                        reportId={r.id}
                        initialReason={r.qc_flag_reason ?? ""}
                        updateFlag={updateFlagReasonAction}
                      />
                      <form action={clearFlagAction.bind(null, r.id)}>
                        <button
                          type="submit"
                          className="text-gold border border-gold/40 rounded-full px-4 py-2 hover:bg-gold/10 transition-colors uppercase tracking-[0.18em]"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          Clear Flag
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* NLP checklist status */}
          <section>
            <p className={EYEBROW}>NLP Checklist Status</p>
            {reviews.length === 0 ? (
              <p
                className="text-cream/40 italic mt-3"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                }}
              >
                Nothing currently in review.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">
                {reviews.map((r) => {
                  const sections = Array.isArray(r.content?.sections)
                    ? r.content!.sections!
                    : [];
                  const expected = sections.length * NLP_KEYS.length;
                  let checked = 0;
                  for (const s of sections) {
                    for (const k of NLP_KEYS) {
                      if (s.nlp && s.nlp[k]) checked += 1;
                    }
                  }
                  const pct = expected > 0
                    ? Math.round((checked / expected) * 100)
                    : 0;
                  let color = "#B51E5A";
                  let label = "Many missing";
                  if (expected > 0 && checked === expected) {
                    color = "#2D9B6E";
                    label = "All checked";
                  } else if (pct >= 60) {
                    color = "#C9A96E";
                    label = "Some missing";
                  }
                  return (
                    <Link
                      key={r.id}
                      href={`/admin/reports/${r.id}`}
                      className="bg-[#151B33] rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-gold/40 transition-colors"
                      style={{
                        border: "1px solid rgba(201,169,110,0.15)",
                        padding: "16px 20px",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3
                          className="serif-it text-white"
                          style={{ fontSize: "18px", lineHeight: 1.2 }}
                        >
                          {clientName(r.client_id)}
                        </h3>
                        <p
                          className="text-magenta mt-0.5"
                          style={{ fontSize: "13px", fontWeight: 500 }}
                        >
                          {productName(r.product_slug)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 md:min-w-[260px]">
                        <div
                          className="flex-1 rounded-full overflow-hidden"
                          style={{
                            height: 6,
                            border: "1px solid rgba(201,169,110,0.4)",
                            backgroundColor: "rgba(255,255,255,0.04)",
                          }}
                          aria-label={`${pct}% of NLP checks complete`}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span
                          className="uppercase tracking-[0.18em]"
                          style={{
                            color,
                            fontSize: "11px",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-cream/50"
                          style={{ fontSize: "11px" }}
                        >
                          {checked}/{expected}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
