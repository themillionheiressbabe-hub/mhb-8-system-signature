import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ReportsBoard,
  type EnrichedReport,
  type ReportSectionShape,
  type ReportStatus,
} from "@/components/admin/reports/ReportsBoard";

export const metadata: Metadata = {
  title: "Reports · BABE HQ",
};

const SECTION_COUNT_BY_SLUG: Record<string, number> = {
  "babe-signature": 22,
};
const DEFAULT_SECTION_COUNT = 8;

const SLA_DAYS_BY_SLUG: Record<string, number> = {
  "babe-signature": 21,
  "bond-lens": 14,
  "business-lens": 14,
};
const DEFAULT_SLA_DAYS = 14;

const BABE_SIGNATURE_TITLES = [
  "Identity",
  "Power Pattern",
  "Shadow Pattern",
  "Voice and Worth",
  "Love and Connection",
  "Work and Purpose",
  "Money and Value",
  "Body and Safety",
  "Creative Current",
  "Insight and Clarity",
  "Boundaries and Capacity",
  "Inherited Patterns",
  "Relationship to Authority",
  "The Wound and the Gift",
  "Current Activation",
  "What is Ending",
  "What is Beginning",
  "The 90-Day Window",
  "Integration Practice",
  "Your Pattern in One Page",
  "Compliance and Close",
  "Personalised Affirmations",
];

const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus | null> = {
  draft: "in_review",
  in_review: "approved",
  approved: "delivered",
  delivered: null,
};

type ReportRow = {
  id: string;
  order_id: string;
  client_id: string;
  product_slug: string;
  status: ReportStatus | null;
  content: { sections?: ReportSectionShape[] } | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

type ClientRow = {
  id: string;
  full_name: string;
};

type OrderRow = {
  id: string;
};

type ProductRow = {
  slug: string;
  name: string | null;
  engine: number | null;
};

function reportNumber(id: string): string {
  return `RPT-${id.replace(/-/g, "").slice(-4).toUpperCase()}`;
}

function defaultTitlesFor(slug: string, count: number): string[] {
  if (slug === "babe-signature" || count === 22) {
    return BABE_SIGNATURE_TITLES.slice(0, count);
  }
  return Array.from({ length: count }, (_, i) => `Section ${i + 1}`);
}

async function moveStageAction(id: string, newStatus: ReportStatus) {
  "use server";

  // Validate transition against the current row to honour the allowed
  // forward path: draft -> in_review -> approved -> delivered.
  const { data: current } = await supabaseAdmin
    .from("reports")
    .select("id, status, client_id, product_slug")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      status: ReportStatus | null;
      client_id: string;
      product_slug: string;
    }>();

  if (!current) return;

  const expectedNext = current.status
    ? VALID_TRANSITIONS[current.status]
    : null;
  if (current.status !== newStatus && expectedNext !== newStatus) {
    // The Move Stage menu can pick any stage; only allow the forward
    // transitions called out in the spec.
    return;
  }

  const patch: {
    status: ReportStatus;
    updated_at: string;
    delivered_at?: string | null;
  } = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (newStatus === "delivered") {
    patch.delivered_at = new Date().toISOString();
  }

  await supabaseAdmin.from("reports").update(patch).eq("id", id);

  if (newStatus === "delivered") {
    // Best-effort lookups for the notification copy.
    let productName = current.product_slug;
    let clientName = "a client";
    const [{ data: prod }, { data: client }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("name")
        .eq("slug", current.product_slug)
        .maybeSingle<{ name: string | null }>(),
      supabaseAdmin
        .from("clients")
        .select("full_name")
        .eq("id", current.client_id)
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

  revalidatePath("/admin/reports");
  revalidatePath("/admin/orders/processing");
}

async function deleteReportAction(id: string) {
  "use server";
  await supabaseAdmin.from("reports").delete().eq("id", id);
  revalidatePath("/admin/reports");
  revalidatePath("/admin/orders/processing");
}

export default async function AdminReportsPage() {
  const { data: rawReports } = await supabaseAdmin
    .from("reports")
    .select(
      "id, order_id, client_id, product_slug, status, content, delivered_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .returns<ReportRow[]>();

  const reports = rawReports ?? [];

  const clientIds = Array.from(new Set(reports.map((r) => r.client_id)));
  const orderIds = Array.from(new Set(reports.map((r) => r.order_id)));
  const productSlugs = Array.from(new Set(reports.map((r) => r.product_slug)));

  const [clientsRes, ordersRes, productsRes] = await Promise.all([
    clientIds.length > 0
      ? supabaseAdmin
          .from("clients")
          .select("id, full_name")
          .in("id", clientIds)
          .returns<ClientRow[]>()
      : Promise.resolve({ data: [] as ClientRow[] }),
    orderIds.length > 0
      ? supabaseAdmin
          .from("orders")
          .select("id")
          .in("id", orderIds)
          .returns<OrderRow[]>()
      : Promise.resolve({ data: [] as OrderRow[] }),
    productSlugs.length > 0
      ? supabaseAdmin
          .from("products")
          .select("slug, name, engine")
          .in("slug", productSlugs)
          .returns<ProductRow[]>()
      : Promise.resolve({ data: [] as ProductRow[] }),
  ]);

  const clientById = new Map<string, ClientRow>();
  for (const c of clientsRes.data ?? []) clientById.set(c.id, c);

  const orderIdSet = new Set<string>();
  for (const o of ordersRes.data ?? []) orderIdSet.add(o.id);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  const enriched: EnrichedReport[] = reports.map((r) => {
    const product = productBySlug.get(r.product_slug);
    const client = clientById.get(r.client_id);
    const sectionCount =
      SECTION_COUNT_BY_SLUG[r.product_slug] ?? DEFAULT_SECTION_COUNT;
    const titles = defaultTitlesFor(r.product_slug, sectionCount);
    const contentSections = Array.isArray(r.content?.sections)
      ? r.content!.sections
      : [];
    const sectionTitles = titles.map(
      (t, i) =>
        (typeof contentSections[i]?.title === "string"
          ? (contentSections[i]!.title as string)
          : t) || t,
    );
    const sectionCompletes = titles.map(
      (_, i) => !!contentSections[i]?.complete,
    );
    const completedSections = sectionCompletes.filter(Boolean).length;
    return {
      id: r.id,
      reportNumber: reportNumber(r.id),
      orderId: orderIdSet.has(r.order_id) ? r.order_id : r.order_id,
      clientId: r.client_id,
      clientName: client?.full_name ?? "Unknown client",
      productSlug: r.product_slug,
      productName: product?.name ?? "",
      engine: product?.engine ?? null,
      status: (r.status ?? "draft") as ReportStatus,
      slaDays: SLA_DAYS_BY_SLUG[r.product_slug] ?? DEFAULT_SLA_DAYS,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deliveredAt: r.delivered_at,
      sectionCount,
      completedSections,
      sectionTitles,
      sectionCompletes,
    };
  });

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/reports" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <ReportsBoard
          reports={enriched}
          moveStage={moveStageAction}
          deleteReport={deleteReportAction}
        />
      </main>
    </div>
  );
}
