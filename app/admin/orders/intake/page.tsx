import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  IntakeBoard,
  type EnrichedIntake,
  type IntakeData,
  type IntakeEdit,
} from "@/components/admin/orders/IntakeBoard";

export const metadata: Metadata = {
  title: "Pending Intake · BABE HQ",
};

type OrderRow = {
  id: string;
  profile_id: string;
  client_id: string | null;
  product_slug: string;
  product_name: string | null;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  engine: number | null;
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
  latitude: number | string | null;
  longitude: number | string | null;
  is_joker: boolean | null;
};

type ProductRow = {
  slug: string;
  name: string | null;
  engine: number | null;
};

type ReportRow = {
  order_id: string;
};

function orderNumber(id: string): string {
  return `MHB-${id.replace(/-/g, "").slice(-4).toUpperCase()}`;
}

function numOrNull(value: number | string | null): number | null {
  if (value === null) return null;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

async function markIntakeComplete(
  orderId: string,
  profileId: string,
  productSlug: string,
  clientId: string,
) {
  "use server";
  if (!clientId) return;
  await supabaseAdmin.from("reports").insert({
    order_id: orderId,
    client_id: clientId,
    profile_id: profileId,
    product_slug: productSlug,
    status: "draft",
  });
  revalidatePath("/admin/orders/intake");
}

async function saveIntakeAction(
  orderId: string,
  profileId: string,
  clientId: string | null,
  input: IntakeEdit,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";

  const nowIso = new Date().toISOString();
  if (clientId) {
    const { error } = await supabaseAdmin
      .from("clients")
      .update({
        full_name: input.fullName,
        date_of_birth: input.dateOfBirth,
        time_of_birth: input.timeOfBirth,
        place_of_birth: input.placeOfBirth,
        updated_at: nowIso,
      })
      .eq("id", clientId);
    if (error) return { ok: false, error: error.message };
  } else {
    // No client row yet: create one and link to the order.
    const { data: inserted, error } = await supabaseAdmin
      .from("clients")
      .insert({
        profile_id: profileId,
        full_name: input.fullName,
        date_of_birth: input.dateOfBirth,
        time_of_birth: input.timeOfBirth,
        place_of_birth: input.placeOfBirth,
      })
      .select("id")
      .single<{ id: string }>();
    if (error || !inserted?.id) {
      return { ok: false, error: error?.message ?? "Could not save intake." };
    }
    await supabaseAdmin
      .from("orders")
      .update({ client_id: inserted.id, updated_at: nowIso })
      .eq("id", orderId);
  }

  revalidatePath("/admin/orders/intake");
  return { ok: true };
}

async function deleteOrderAction(orderId: string) {
  "use server";
  await supabaseAdmin.from("orders").delete().eq("id", orderId);
  revalidatePath("/admin/orders/intake");
  revalidatePath("/admin/orders");
}

export default async function AdminIntakePage() {
  // Fetch open orders. Status enum in schema is
  // ('pending', 'paid', 'failed', 'refunded'). Any order with a successful
  // payment (paid) that has not been escalated to a report counts as
  // "pending intake" or "intake received" depending on whether a client
  // row is attached.
  const { data: rawOrders } = await supabaseAdmin
    .from("orders")
    .select(
      "id, profile_id, client_id, product_slug, product_name, status, engine, created_at",
    )
    .in("status", ["pending", "paid"])
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
            "id, full_name, date_of_birth, time_of_birth, place_of_birth, latitude, longitude, is_joker",
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
          .select("order_id")
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

  const reportedOrderIds = new Set<string>();
  for (const r of reportsRes.data ?? []) reportedOrderIds.add(r.order_id);

  // Exclude orders that already have a report attached (those are out of
  // the intake queue and live in the reports surface).
  const intakeOrders = ordersAll.filter((o) => !reportedOrderIds.has(o.id));

  const enriched: EnrichedIntake[] = intakeOrders.map((o) => {
    const profile = profileById.get(o.profile_id);
    const product = productBySlug.get(o.product_slug);
    const client = o.client_id ? clientById.get(o.client_id) : null;

    let intake: IntakeData | null = null;
    if (client) {
      intake = {
        fullName: client.full_name,
        dateOfBirth: client.date_of_birth,
        timeOfBirth: client.time_of_birth,
        placeOfBirth: client.place_of_birth,
        latitude: numOrNull(client.latitude),
        longitude: numOrNull(client.longitude),
        isJoker: !!client.is_joker,
      };
    }

    const clientName =
      intake?.fullName ??
      profile?.full_name ??
      profile?.email ??
      "Unknown client";

    return {
      id: o.id,
      orderNumber: orderNumber(o.id),
      profileId: o.profile_id,
      clientId: o.client_id,
      productSlug: o.product_slug,
      productName: product?.name ?? o.product_name ?? "",
      engine: product?.engine ?? o.engine ?? null,
      createdAt: o.created_at,
      clientName,
      intake,
      hasReport: false,
    };
  });

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/orders/intake" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <IntakeBoard
          intakes={enriched}
          markComplete={markIntakeComplete}
          saveIntake={saveIntakeAction}
          deleteOrder={deleteOrderAction}
        />
      </main>
    </div>
  );
}
