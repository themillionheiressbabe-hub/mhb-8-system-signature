import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ReportBuilder,
  type ClientOption,
  type ProductOption,
  type ReportSectionState,
} from "@/components/admin/reports/ReportBuilder";

export const metadata: Metadata = {
  title: "New Report · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

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

type ClientRow = {
  id: string;
  full_name: string;
  date_of_birth: string;
  created_at: string;
};

type ProductRow = {
  slug: string;
  name: string;
  engine: number | null;
  is_active: boolean | null;
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

function personalYearFromDob(iso: string): number {
  const [, m, d] = iso.split("-").map(Number);
  const yr = new Date().getFullYear();
  return reduce(sumDigits(m) + sumDigits(d) + sumDigits(yr));
}

async function saveDraftAction(
  clientId: string,
  orderId: string | null,
  productSlug: string,
  sections: ReportSectionState[],
): Promise<{ ok: true; reportId: string } | { ok: false; error: string }> {
  "use server";

  if (!orderId) {
    return {
      ok: false,
      error:
        "Order id is required to save to the reports table. Local drafts are still being saved.",
    };
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, profile_id, client_id, product_slug")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      profile_id: string;
      client_id: string | null;
      product_slug: string;
    }>();

  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  const profileId = order.profile_id;
  const effectiveClientId = order.client_id ?? clientId;

  const { data: existing } = await supabaseAdmin
    .from("reports")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle<{ id: string }>();

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from("reports")
      .update({
        content: { sections } as unknown as object,
        product_slug: productSlug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/reports");
    revalidatePath("/admin/orders/processing");
    return { ok: true, reportId: existing.id };
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("reports")
    .insert({
      order_id: orderId,
      client_id: effectiveClientId,
      profile_id: profileId,
      product_slug: productSlug,
      status: "draft",
      content: { sections } as unknown as object,
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !inserted?.id) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not save draft.",
    };
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin/orders/processing");
  return { ok: true, reportId: inserted.id };
}

async function sendToReviewAction(
  reportId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin
    .from("reports")
    .update({
      status: "in_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reports");
  revalidatePath("/admin/orders/processing");
  return { ok: true };
}

type Props = {
  searchParams: Promise<{ client?: string; order?: string }>;
};

export default async function NewReportPage({ searchParams }: Props) {
  const { client: clientParam, order: orderParam } = await searchParams;

  const [clientsRes, productsRes, cardLookupRes] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id, full_name, date_of_birth, created_at")
      .order("created_at", { ascending: true })
      .returns<ClientRow[]>(),
    supabaseAdmin
      .from("products")
      .select("slug, name, engine, is_active")
      .order("engine", { ascending: true })
      .order("name", { ascending: true })
      .returns<ProductRow[]>(),
    supabaseAdmin
      .from("daily_card_lookup")
      .select("month, day, card_code")
      .returns<CardLookupRow[]>(),
  ]);

  const clients = clientsRes.data ?? [];

  // Build card lookup map
  const cardByDate = new Map<string, string>();
  for (const r of cardLookupRes.data ?? []) {
    cardByDate.set(`${r.month}-${r.day}`, r.card_code);
  }
  const neededCardCodes = Array.from(new Set(cardByDate.values()));
  const cardNameByCode = new Map<string, string>();
  if (neededCardCodes.length > 0) {
    const { data } = await supabaseAdmin
      .from("card_library")
      .select("card_code, card_name")
      .in("card_code", neededCardCodes)
      .returns<CardLibRow[]>();
    for (const c of data ?? [])
      cardNameByCode.set(c.card_code, c.card_name.replace(/\s*\(.*$/, ""));
  }

  const clientOptions: ClientOption[] = clients.map((c, i) => {
    const [, monthStr, dayStr] = c.date_of_birth.split("-");
    const key = `${Number(monthStr)}-${Number(dayStr)}`;
    const code = cardByDate.get(key);
    const birthCardName = code ? cardNameByCode.get(code) ?? null : null;
    return {
      id: c.id,
      mhbNumber: `MHB-${String(i + 1).padStart(4, "0")}`,
      fullName: c.full_name,
      dateOfBirth: c.date_of_birth,
      birthCardName,
      personalYear: personalYearFromDob(c.date_of_birth),
    };
  });

  const productOptions: ProductOption[] = (productsRes.data ?? [])
    .filter((p) => p.is_active !== false)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      engine: p.engine,
      sectionCount: SECTION_COUNT_BY_SLUG[p.slug] ?? DEFAULT_SECTION_COUNT,
      slaDays: SLA_DAYS_BY_SLUG[p.slug] ?? DEFAULT_SLA_DAYS,
    }));

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/reports/new" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-5">
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
          <div>
            <p className={EYEBROW}>New Report</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              Build a report.
            </h1>
          </div>
          <ReportBuilder
            clients={clientOptions}
            products={productOptions}
            preselectedClientId={clientParam ?? null}
            preselectedOrderId={orderParam ?? null}
            saveDraft={saveDraftAction}
            sendToReview={sendToReviewAction}
          />
        </div>
      </main>
    </div>
  );
}
