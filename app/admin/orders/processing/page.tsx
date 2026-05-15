import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ProcessingBoard,
  type ProcessingItem,
} from "@/components/admin/orders/ProcessingBoard";

export const metadata: Metadata = {
  title: "Processing · BABE HQ",
};

type OrderRow = {
  id: string;
  profile_id: string;
  client_id: string | null;
  product_slug: string;
  product_name: string | null;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  engine: number | null;
  notes: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
};

type ProductRow = {
  slug: string;
  name: string | null;
  engine: number | null;
};

type ReportRow = {
  id: string;
  order_id: string;
  status: "draft" | "in_review" | "delivered" | null;
  created_at: string;
  updated_at: string;
};

function orderNumber(id: string): string {
  return `MHB-${id.replace(/-/g, "").slice(-4).toUpperCase()}`;
}

async function startDraftAction(
  orderId: string,
  profileId: string,
  productSlug: string,
  clientId: string,
) {
  "use server";
  if (!clientId) return;
  const { data: existing } = await supabaseAdmin
    .from("reports")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle<{ id: string }>();
  if (existing?.id) {
    return;
  }
  await supabaseAdmin.from("reports").insert({
    order_id: orderId,
    client_id: clientId,
    profile_id: profileId,
    product_slug: productSlug,
    status: "draft",
  });
  revalidatePath("/admin/orders/processing");
}

async function sendToReviewAction(reportId: string) {
  "use server";
  await supabaseAdmin
    .from("reports")
    .update({ status: "in_review", updated_at: new Date().toISOString() })
    .eq("id", reportId);
  revalidatePath("/admin/orders/processing");
}

async function deliverAction(
  orderId: string,
  reportId: string,
  productName: string,
  clientName: string,
) {
  "use server";
  const nowIso = new Date().toISOString();
  await supabaseAdmin
    .from("reports")
    .update({
      status: "delivered",
      delivered_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", reportId);
  await supabaseAdmin
    .from("admin_notifications")
    .insert({
      type: "report_delivered",
      title: `Report delivered: ${productName} for ${clientName}`,
      link: "/admin/reports",
    });
  revalidatePath("/admin/orders/processing");
}

async function deleteReportAction(reportId: string) {
  "use server";
  await supabaseAdmin.from("reports").delete().eq("id", reportId);
  revalidatePath("/admin/orders/processing");
  revalidatePath("/admin/reports");
}

async function saveOrderNotes(orderId: string, notes: string) {
  "use server";
  await supabaseAdmin
    .from("orders")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  revalidatePath("/admin/orders/processing");
}

export default async function AdminProcessingPage() {
  // Paid orders with intake submitted (client_id set) are the candidates.
  const { data: rawOrders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, profile_id, client_id, product_slug, product_name, status, engine, notes, created_at",
    )
    .eq("status", "paid")
    .not("client_id", "is", null)
    .order("created_at", { ascending: true })
    .returns<OrderRow[]>();

  const ordersAll = rawOrders ?? [];

  const orderIds = ordersAll.map((o) => o.id);
  const profileIds = Array.from(
    new Set(ordersAll.map((o) => o.profile_id).filter(Boolean)),
  );
  const clientIds = Array.from(
    new Set(
      ordersAll.map((o) => o.client_id).filter((v): v is string => !!v),
    ),
  );
  const productSlugs = Array.from(
    new Set(ordersAll.map((o) => o.product_slug).filter(Boolean)),
  );

  const [profilesRes, clientsRes, productsRes, reportsRes] = await Promise.all([
    profileIds.length > 0
      ? supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [] as ProfileRow[] }),
    clientIds.length > 0
      ? supabaseAdmin
          .from("clients")
          .select(
            "id, full_name, date_of_birth, time_of_birth, place_of_birth",
          )
          .in("id", clientIds)
          .returns<ClientRow[]>()
      : Promise.resolve({ data: [] as ClientRow[] }),
    productSlugs.length > 0
      ? supabaseAdmin
          .from("products")
          .select("slug, name, engine")
          .in("slug", productSlugs)
          .returns<ProductRow[]>()
      : Promise.resolve({ data: [] as ProductRow[] }),
    orderIds.length > 0
      ? supabaseAdmin
          .from("reports")
          .select("id, order_id, status, created_at, updated_at")
          .in("order_id", orderIds)
          .returns<ReportRow[]>()
      : Promise.resolve({ data: [] as ReportRow[] }),
  ]);

  const profileById = new Map<string, ProfileRow>();
  for (const p of profilesRes.data ?? []) profileById.set(p.id, p);

  const clientById = new Map<string, ClientRow>();
  for (const c of clientsRes.data ?? []) clientById.set(c.id, c);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  const reportByOrder = new Map<string, ReportRow>();
  for (const r of reportsRes.data ?? []) {
    // Prefer the most recent non-delivered report if multiple.
    const existing = reportByOrder.get(r.order_id);
    if (!existing) {
      reportByOrder.set(r.order_id, r);
      continue;
    }
    if (existing.status === "delivered" && r.status !== "delivered") {
      reportByOrder.set(r.order_id, r);
    } else if (r.updated_at > existing.updated_at) {
      reportByOrder.set(r.order_id, r);
    }
  }

  const items: ProcessingItem[] = [];
  for (const o of ordersAll) {
    const report = reportByOrder.get(o.id);
    if (report?.status === "delivered") continue;

    const profile = profileById.get(o.profile_id);
    const client = o.client_id ? clientById.get(o.client_id) : null;
    const product = productBySlug.get(o.product_slug);

    items.push({
      id: o.id,
      orderNumber: orderNumber(o.id),
      profileId: o.profile_id,
      clientId: o.client_id,
      productSlug: o.product_slug,
      productName: product?.name ?? o.product_name ?? "",
      engine: product?.engine ?? o.engine ?? null,
      createdAt: o.created_at,
      orderNotes: o.notes,
      clientName:
        client?.full_name ??
        profile?.full_name ??
        profile?.email ??
        "Unknown client",
      clientDob: client?.date_of_birth ?? null,
      clientTob: client?.time_of_birth ?? null,
      clientPlace: client?.place_of_birth ?? null,
      reportId: report?.id ?? null,
      reportStatus:
        report?.status === "draft" || report?.status === "in_review"
          ? report.status
          : null,
      reportCreatedAt: report?.created_at ?? null,
      reportUpdatedAt: report?.updated_at ?? null,
    });
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/orders/processing" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <ProcessingBoard
          items={items}
          startDraft={startDraftAction}
          sendToReview={sendToReviewAction}
          deliver={deliverAction}
          saveNotes={saveOrderNotes}
          deleteReport={deleteReportAction}
        />
      </main>
    </div>
  );
}
