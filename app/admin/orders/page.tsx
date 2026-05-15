import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import {
  OrdersBoard,
  type EnrichedOrder,
  type OrderClientPick,
  type OrderProductPick,
} from "@/components/admin/orders/OrdersBoard";

export const metadata: Metadata = {
  title: "Orders · BABE HQ",
};

type OrderRow = {
  id: string;
  profile_id: string;
  product_slug: string;
  product_name: string | null;
  amount_pence: number;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  stripe_session_id: string | null;
  engine: number | null;
  notes: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type ProductRow = {
  slug: string;
  name: string | null;
  engine: number | null;
};

type ReportRow = {
  order_id: string;
  status: "draft" | "in_review" | "delivered" | null;
};

function orderNumber(id: string): string {
  const compact = id.replace(/-/g, "");
  return `MHB-${compact.slice(-4).toUpperCase()}`;
}

async function saveOrderNotes(id: string, notes: string) {
  "use server";
  await supabaseAdmin
    .from("orders")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/orders");
}

async function saveOrderStatus(
  id: string,
  status: "pending" | "paid" | "failed" | "refunded",
) {
  "use server";
  await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/orders");
}

async function createOrderAction(input: {
  clientId: string;
  productSlug: string;
  notes: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  "use server";

  if (!input.clientId || !input.productSlug) {
    return { ok: false, error: "Client and product are required." };
  }

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("profile_id")
    .eq("id", input.clientId)
    .maybeSingle<{ profile_id: string }>();
  if (!client) return { ok: false, error: "Client not found." };

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("name, engine, price_pence")
    .eq("slug", input.productSlug)
    .maybeSingle<{
      name: string | null;
      engine: number | null;
      price_pence: number | null;
    }>();

  const { data: inserted, error } = await supabaseAdmin
    .from("orders")
    .insert({
      profile_id: client.profile_id,
      client_id: input.clientId,
      product_slug: input.productSlug,
      product_name: product?.name ?? input.productSlug,
      amount_pence: product?.price_pence ?? 0,
      currency: "gbp",
      status: "pending",
      engine: product?.engine ?? null,
      notes: input.notes || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !inserted?.id) {
    return { ok: false, error: error?.message ?? "Could not create order." };
  }

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${inserted.id}`);
}

async function updateOrderAction(
  id: string,
  input: {
    status: "pending" | "paid" | "failed" | "refunded";
    amountPence: number;
    notes: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: input.status,
      amount_pence: input.amountPence,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true };
}

async function deleteOrderAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin.from("orders").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true };
}

export default async function AdminOrdersPage() {
  const { data: rawOrders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, profile_id, product_slug, product_name, amount_pence, status, stripe_session_id, engine, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  const orders = rawOrders ?? [];

  const profileIds = Array.from(
    new Set(orders.map((o) => o.profile_id).filter(Boolean)),
  );
  const productSlugs = Array.from(
    new Set(orders.map((o) => o.product_slug).filter(Boolean)),
  );
  const orderIds = orders.map((o) => o.id);

  const [profilesRes, productsRes, reportsRes] = await Promise.all([
    profileIds.length > 0
      ? supabaseAdmin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [] as ProfileRow[] }),
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
          .select("order_id, status")
          .in("order_id", orderIds)
          .returns<ReportRow[]>()
      : Promise.resolve({ data: [] as ReportRow[] }),
  ]);

  const profileById = new Map<string, ProfileRow>();
  for (const p of profilesRes.data ?? []) profileById.set(p.id, p);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  // For each order, take the latest report status if multiple
  const reportByOrder = new Map<
    string,
    "draft" | "in_review" | "delivered" | null
  >();
  for (const r of reportsRes.data ?? []) {
    if (!reportByOrder.has(r.order_id)) {
      reportByOrder.set(r.order_id, r.status ?? null);
    }
  }

  const enriched: EnrichedOrder[] = orders.map((o) => {
    const profile = profileById.get(o.profile_id);
    const product = productBySlug.get(o.product_slug);
    return {
      id: o.id,
      orderNumber: orderNumber(o.id),
      profileId: o.profile_id,
      productSlug: o.product_slug,
      productName: product?.name ?? o.product_name ?? "",
      amountPence: o.amount_pence,
      rawStatus: o.status ?? "pending",
      reportStatus: reportByOrder.get(o.id) ?? null,
      engine: product?.engine ?? o.engine ?? null,
      notes: o.notes,
      createdAt: o.created_at,
      intakeTokenStatus: null,
      productSlaDays: null,
      clientFullName: profile?.full_name ?? null,
      clientEmail: profile?.email ?? null,
    };
  });

  const [clientsForPickRes, productsForPickRes] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, profile_id, full_name, created_at")
      .order("created_at", { ascending: true })
      .returns<
        Array<{
          id: string;
          profile_id: string;
          full_name: string;
          created_at: string;
        }>
      >(),
    supabaseAdmin
      .from("products")
      .select("slug, name, engine, price_pence, is_active")
      .order("engine", { ascending: true })
      .order("name", { ascending: true })
      .returns<
        Array<{
          slug: string;
          name: string;
          engine: number | null;
          price_pence: number | null;
          is_active: boolean | null;
        }>
      >(),
  ]);

  const clientPicks: OrderClientPick[] = (clientsForPickRes.data ?? []).map(
    (c, i) => ({
      id: c.id,
      mhbNumber: `MHB-${String(i + 1).padStart(4, "0")}`,
      profileId: c.profile_id,
      fullName: c.full_name,
    }),
  );
  const productPicks: OrderProductPick[] = (productsForPickRes.data ?? [])
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      engine: p.engine,
      pricePence: p.price_pence,
    }));

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/orders" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <OrdersBoard
          orders={enriched}
          clients={clientPicks}
          products={productPicks}
          saveNotes={saveOrderNotes}
          saveRawStatus={saveOrderStatus}
          createOrder={createOrderAction}
          updateOrder={updateOrderAction}
          deleteOrder={deleteOrderAction}
        />
      </main>
    </div>
  );
}
