import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ClientDetail,
  NotFoundState,
  type ClientDetailData,
  type DetailOrder,
  type DetailReport,
} from "@/components/admin/clients/ClientDetail";

export const metadata: Metadata = {
  title: "Client · BABE HQ",
};

type ClientRow = {
  id: string;
  profile_id: string;
  full_name: string;
  chosen_name?: string | null;
  email?: string | null;
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
  id: string;
  order_id: string;
  status: "draft" | "in_review" | "delivered" | null;
  product_slug: string | null;
  created_at: string;
  delivered_at: string | null;
};

type ClientIndexRow = { id: string; created_at: string };

const SUITS: ClientDetailData["suit"][] = [
  "hearts",
  "diamonds",
  "clubs",
  "spades",
];

function mhbNumber(i: number): string {
  return `MHB-${String(i + 1).padStart(4, "0")}`;
}

function sumDigits(n: number): number {
  let s = 0;
  let t = Math.abs(n);
  while (t > 0) {
    s += t % 10;
    t = Math.floor(t / 10);
  }
  return s;
}

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduce(sumDigits(n));
}

function lifePathFromDob(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return reduce(sumDigits(y) + sumDigits(m) + sumDigits(d));
}

function personalYearFromDob(iso: string): number {
  const [, m, d] = iso.split("-").map(Number);
  const yr = new Date().getFullYear();
  return reduce(sumDigits(m) + sumDigits(d) + sumDigits(yr));
}

const CHINESE_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

const CHINESE_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth",
  "Earth", "Metal", "Metal", "Water", "Water",
];

function chineseZodiacFromDob(iso: string): string {
  const y = Number(iso.split("-")[0]);
  const animal = CHINESE_ANIMALS[(((y - 4) % 12) + 12) % 12];
  const element = CHINESE_ELEMENTS[(((y - 4) % 10) + 10) % 10];
  return `${element} ${animal}`;
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ geocoded?: string }>;
};

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { geocoded } = await searchParams;

  async function saveClientNotes(notes: string) {
    "use server";
    await supabaseAdmin
      .from("clients")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", id);
    revalidatePath(`/admin/clients/${id}`);
  }

  async function deleteClientAction() {
    "use server";
    await supabaseAdmin.from("clients").delete().eq("id", id);
    revalidatePath("/admin/clients");
    redirect("/admin/clients");
  }

  // Fetch only universally-present columns first. The optional fields
  // (`chosen_name`, `email`) come from a follow-up `select("*")` so the
  // base query still succeeds even when migration 20260513002 has not been
  // applied to the remote yet.
  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select(
      "id, profile_id, full_name, date_of_birth, time_of_birth, place_of_birth, is_joker, notes, created_at",
    )
    .eq("id", id)
    .maybeSingle<ClientRow>();

  if (client) {
    const { data: extras } = await supabaseAdmin
      .from("clients")
      .select("chosen_name, email")
      .eq("id", id)
      .maybeSingle<{
        chosen_name: string | null;
        email: string | null;
      }>();
    if (extras) {
      client.chosen_name = extras.chosen_name;
      client.email = extras.email;
    }
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <AdminSidebar activeHref="/admin/clients" />
        <main
          className="mx-auto w-full"
          style={{ maxWidth: "1200px", padding: "28px 36px" }}
        >
          <NotFoundState />
        </main>
      </div>
    );
  }

  const [profileRes, indexRes, ordersRes, cardLookupRes] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email")
        .eq("id", client.profile_id)
        .maybeSingle<ProfileRow>(),
      supabaseAdmin
        .from("clients")
        .select("id, created_at")
        .order("created_at", { ascending: true })
        .returns<ClientIndexRow[]>(),
      supabaseAdmin
        .from("orders")
        .select(
          "id, product_slug, product_name, amount_pence, status, engine, created_at",
        )
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .returns<OrderRow[]>(),
      supabaseAdmin
        .from("daily_card_lookup")
        .select("card_code")
        .eq("month", Number(client.date_of_birth.split("-")[1]))
        .eq("day", Number(client.date_of_birth.split("-")[2]))
        .maybeSingle<{ card_code: string }>(),
    ]);

  const orders = ordersRes.data ?? [];
  const orderIds = orders.map((o) => o.id);
  const productSlugs = Array.from(
    new Set(orders.map((o) => o.product_slug).filter(Boolean)),
  );

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
          .select(
            "id, order_id, status, product_slug, created_at, delivered_at",
          )
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
          .returns<ReportRow[]>()
      : Promise.resolve({ data: [] as ReportRow[] }),
  ]);

  const productBySlug = new Map<string, ProductRow>();
  for (const p of productsRes.data ?? []) productBySlug.set(p.slug, p);

  const reportByOrder = new Map<string, ReportRow>();
  for (const r of reportsRes.data ?? []) {
    const existing = reportByOrder.get(r.order_id);
    if (!existing) reportByOrder.set(r.order_id, r);
  }

  // Resolve birth card name via card_library
  let birthCardName: string | null = null;
  const birthCardCode = cardLookupRes.data?.card_code ?? null;
  if (birthCardCode) {
    const { data: card } = await supabaseAdmin
      .from("card_library")
      .select("card_name")
      .eq("card_code", birthCardCode)
      .maybeSingle<{ card_name: string }>();
    if (card?.card_name) {
      birthCardName = card.card_name.replace(/\s*\(.*$/, "");
    }
  }

  // Index for MHB number / suit
  const indexList = indexRes.data ?? [];
  const idx = indexList.findIndex((c) => c.id === client.id);
  const safeIdx = idx >= 0 ? idx : 0;

  const detailOrders: DetailOrder[] = orders.map((o) => ({
    id: o.id,
    productSlug: o.product_slug,
    productName: productBySlug.get(o.product_slug)?.name ?? o.product_name ?? "",
    engine: productBySlug.get(o.product_slug)?.engine ?? o.engine ?? null,
    amountPence: o.amount_pence,
    status: o.status ?? null,
    reportStatus: reportByOrder.get(o.id)?.status ?? null,
    createdAt: o.created_at,
    intakeSubmitted: true, // we're on the client detail; intake = client exists
  }));

  const detailReports: DetailReport[] = (reportsRes.data ?? []).map((r) => {
    const slug = r.product_slug ?? "";
    return {
      id: r.id,
      orderId: r.order_id,
      productSlug: slug,
      productName: productBySlug.get(slug)?.name ?? slug,
      status: r.status,
      createdAt: r.created_at,
      deliveredAt: r.delivered_at,
    };
  });

  const intakeComplete = !!client.place_of_birth && !!client.date_of_birth;

  // Derive client status from orders/reports (mirrors clients list)
  let status: ClientDetailData["status"];
  if (orders.length === 0) {
    status = "pending";
  } else {
    const hasActive = detailOrders.some(
      (o) =>
        o.reportStatus === "draft" ||
        o.reportStatus === "in_review" ||
        (o.reportStatus === null && o.status === "paid"),
    );
    if (hasActive) status = "active";
    else if (detailOrders.every((o) => o.reportStatus === "delivered"))
      status = "delivered";
    else status = "pending";
  }

  const detailData: ClientDetailData = {
    id: client.id,
    mhbNumber: mhbNumber(safeIdx),
    suit: SUITS[safeIdx % SUITS.length],
    fullName: client.full_name,
    chosenName: client.chosen_name ?? null,
    email: client.email ?? profileRes.data?.email ?? null,
    dateOfBirth: client.date_of_birth,
    timeOfBirth: client.time_of_birth,
    placeOfBirth: client.place_of_birth,
    isJoker: !!client.is_joker,
    notes: client.notes,
    createdAt: client.created_at,
    status,
    intakeComplete,
    birthCardName,
    lifePath: lifePathFromDob(client.date_of_birth),
    personalYear: personalYearFromDob(client.date_of_birth),
    chineseZodiac: chineseZodiacFromDob(client.date_of_birth),
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <ClientDetail
          client={detailData}
          orders={detailOrders}
          reports={detailReports}
          saveNotes={saveClientNotes}
          deleteClient={deleteClientAction}
          geocodeWarning={geocoded === "0"}
        />
      </main>
    </div>
  );
}
