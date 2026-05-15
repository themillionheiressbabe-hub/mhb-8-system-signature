import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ClientsBoard,
  type EnrichedClient,
  type ClientOrderSummary,
  type ClientStatus,
} from "@/components/admin/clients/ClientsBoard";

export const metadata: Metadata = {
  title: "Clients · BABE HQ",
};

type ClientRow = {
  id: string;
  profile_id: string;
  full_name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  place_of_birth: string | null;
  is_joker: boolean | null;
  notes: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
};

type OrderRow = {
  id: string;
  client_id: string | null;
  product_slug: string;
  product_name: string | null;
  amount_pence: number;
  status: "pending" | "paid" | "failed" | "refunded" | null;
  engine: number | null;
  created_at: string;
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

type CardLookupRow = {
  month: number;
  day: number;
  card_code: string;
};

type CardLibRow = {
  card_code: string;
  card_name: string;
};

const SUITS: EnrichedClient["suit"][] = [
  "hearts",
  "diamonds",
  "clubs",
  "spades",
];

function suitForIndex(i: number): EnrichedClient["suit"] {
  return SUITS[i % SUITS.length];
}

function mhbNumber(i: number): string {
  return `MHB-${String(i + 1).padStart(4, "0")}`;
}

function deriveClientStatus(
  orders: ClientOrderSummary[],
): ClientStatus {
  if (orders.length === 0) return "pending";
  const hasActive = orders.some(
    (o) =>
      o.reportStatus === "draft" || o.reportStatus === "in_review",
  );
  if (hasActive) return "active";
  const hasPendingIntake = orders.some(
    (o) => o.reportStatus === null && o.status === "paid",
  );
  if (hasPendingIntake) return "active";
  const allDelivered = orders.every((o) => o.reportStatus === "delivered");
  if (allDelivered) return "delivered";
  return "pending";
}

async function deleteClientAction(clientId: string) {
  "use server";
  await supabaseAdmin.from("clients").delete().eq("id", clientId);
  revalidatePath("/admin/clients");
}

async function saveClientNotes(clientId: string, notes: string) {
  "use server";
  await supabaseAdmin
    .from("clients")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", clientId);
  revalidatePath("/admin/clients");
}

export default async function AdminClientsPage() {
  const { data: rawClients } = await supabaseAdmin
    .from("clients")
    .select(
      "id, profile_id, full_name, date_of_birth, time_of_birth, place_of_birth, is_joker, notes, created_at",
    )
    .order("created_at", { ascending: true })
    .returns<ClientRow[]>();

  const clientsAll = rawClients ?? [];

  const clientIds = clientsAll.map((c) => c.id);
  const profileIds = Array.from(
    new Set(clientsAll.map((c) => c.profile_id).filter(Boolean)),
  );

  const [profilesRes, ordersRes, cardLookupRes] = await Promise.all([
    profileIds.length > 0
      ? supabaseAdmin
          .from("profiles")
          .select("id, email")
          .in("id", profileIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [] as ProfileRow[] }),
    clientIds.length > 0
      ? supabaseAdmin
          .from("orders")
          .select(
            "id, client_id, product_slug, product_name, amount_pence, status, engine, created_at",
          )
          .in("client_id", clientIds)
          .order("created_at", { ascending: false })
          .returns<OrderRow[]>()
      : Promise.resolve({ data: [] as OrderRow[] }),
    supabaseAdmin
      .from("daily_card_lookup")
      .select("month, day, card_code")
      .returns<CardLookupRow[]>(),
  ]);

  const orders = ordersRes.data ?? [];

  const productSlugs = Array.from(
    new Set(orders.map((o) => o.product_slug).filter(Boolean)),
  );
  const orderIds = orders.map((o) => o.id);

  const [productsRes, reportsRes] = await Promise.all([
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

  // Build a map of birth-date (mm-dd) -> card_name via daily_card_lookup +
  // card_library.
  const lookupByKey = new Map<string, string>();
  for (const r of cardLookupRes.data ?? []) {
    const key = `${r.month}-${r.day}`;
    lookupByKey.set(key, r.card_code);
  }
  const neededCardCodes = Array.from(new Set(lookupByKey.values()));
  const cardNameByCode = new Map<string, string>();
  if (neededCardCodes.length > 0) {
    const { data: cardsData } = await supabaseAdmin
      .from("card_library")
      .select("card_code, card_name")
      .in("card_code", neededCardCodes)
      .returns<CardLibRow[]>();
    for (const c of cardsData ?? []) {
      cardNameByCode.set(c.card_code, c.card_name.replace(/\s*\(.*$/, ""));
    }
  }

  const profileById = new Map<string, ProfileRow>();
  for (const p of profilesRes.data ?? []) profileById.set(p.id, p);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  const reportByOrder = new Map<
    string,
    "draft" | "in_review" | "delivered" | null
  >();
  for (const r of reportsRes.data ?? []) {
    // First report row wins; if multiple, prefer non-null status.
    const existing = reportByOrder.get(r.order_id);
    if (!existing) reportByOrder.set(r.order_id, r.status ?? null);
  }

  const ordersByClient = new Map<string, OrderRow[]>();
  for (const o of orders) {
    if (!o.client_id) continue;
    const arr = ordersByClient.get(o.client_id) ?? [];
    arr.push(o);
    ordersByClient.set(o.client_id, arr);
  }

  const enriched: EnrichedClient[] = clientsAll.map((c, i) => {
    const profile = profileById.get(c.profile_id);
    const clientOrders = ordersByClient.get(c.id) ?? [];

    const orderSummaries: ClientOrderSummary[] = clientOrders.map((o) => {
      const prod = productBySlug.get(o.product_slug);
      return {
        id: o.id,
        productSlug: o.product_slug,
        productName: prod?.name ?? o.product_name ?? "",
        engine: prod?.engine ?? o.engine ?? null,
        amountPence: o.amount_pence,
        status: o.status ?? null,
        reportStatus: reportByOrder.get(o.id) ?? null,
        createdAt: o.created_at,
      };
    });

    const orderCount = orderSummaries.length;
    const totalSpendPence = orderSummaries
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + o.amountPence, 0);
    const engines = Array.from(
      new Set(
        orderSummaries
          .map((o) => o.engine)
          .filter((e): e is number => typeof e === "number"),
      ),
    ).sort((a, b) => a - b);
    const latest = orderSummaries[0] ?? null;

    const [, monthStr, dayStr] = c.date_of_birth.split("-");
    const lookupKey = `${Number(monthStr)}-${Number(dayStr)}`;
    const code = lookupByKey.get(lookupKey);
    const birthCardName = code ? cardNameByCode.get(code) ?? null : null;

    return {
      id: c.id,
      mhbNumber: mhbNumber(i),
      fullName: c.full_name,
      email: profile?.email ?? null,
      dateOfBirth: c.date_of_birth,
      timeOfBirth: c.time_of_birth,
      placeOfBirth: c.place_of_birth,
      isJoker: !!c.is_joker,
      notes: c.notes,
      createdAt: c.created_at,
      suit: suitForIndex(i),
      engines,
      orders: orderSummaries,
      orderCount,
      totalSpendPence,
      latestProductName: latest?.productName ?? null,
      latestOrderDate: latest?.createdAt ?? null,
      latestEngine: latest?.engine ?? null,
      status: deriveClientStatus(orderSummaries),
      birthCardName,
    };
  });

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/clients" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <ClientsBoard
          clients={enriched}
          saveNotes={saveClientNotes}
          deleteClient={deleteClientAction}
        />
      </main>
    </div>
  );
}
