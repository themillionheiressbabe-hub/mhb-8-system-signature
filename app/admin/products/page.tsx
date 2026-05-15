import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ProductsBoard,
  type ProductCard,
  type ProductInput,
} from "@/components/admin/products/ProductsBoard";

export const metadata: Metadata = {
  title: "Products · BABE HQ",
};

type ProductRow = {
  slug: string;
  name: string;
  engine: number | null;
  price_pence: number | null;
  is_active: boolean | null;
  stripe_product_id: string | null;
};

const SECTION_COUNT_BY_SLUG: Record<string, number> = {
  "babe-signature": 22,
  "babe-business-signature": 22,
  "babe-bond-signature": 22,
};
const DEFAULT_SECTION_COUNT = 8;

const SLA_DAYS_BY_SLUG: Record<string, number> = {
  "babe-signature": 21,
  "babe-business-signature": 21,
  "babe-bond-signature": 21,
  "babe-life-spread": 14,
  "babe-mirror": 10,
  "babe-lens": 7,
  "babe-crossing": 10,
  "babe-reckoning": 14,
  "babe-rebuild": 14,
  "babe-90": 10,
  "babe-business-lens": 7,
  "babe-brand-frequency": 14,
  "babe-founder-read": 14,
  "babe-bond-mother-daughter": 14,
  "babe-bond-co-parenting": 14,
  "babe-bond-lens": 7,
  "babe-pulse": 10,
  "babe-business-pulse": 10,
  "babe-bond-pulse": 10,
  "your-babe-year-map": 14,
  "your-babe-business-year": 14,
  "your-babe-bond-year": 14,
  "babe-52-week-journey-monthly": 0,
  "daily-frequency-personal": 0,
  "daily-frequency-free": 0,
  "birthprint-snapshot": 0,
  "your-babe-year-free": 0,
};
const DEFAULT_SLA_DAYS = 14;

const CANON_PRODUCTS: Array<Omit<ProductCard, "sectionCount" | "slaDays">> = [
  // Engine 1 · Passive
  { slug: "daily-frequency-free", name: "Daily Frequency (Free)", engine: 1, pricePence: 0, isActive: true, stripeProductId: null },
  { slug: "birthprint-snapshot", name: "Birthprint Snapshot", engine: 1, pricePence: 0, isActive: true, stripeProductId: null },
  { slug: "your-babe-year-free", name: "Your BABE Year (Free)", engine: 1, pricePence: 0, isActive: true, stripeProductId: null },
  // Engine 2 · Personal
  { slug: "babe-life-spread", name: "The BABE Life Spread", engine: 2, pricePence: 9700, isActive: true, stripeProductId: null },
  { slug: "babe-mirror", name: "The BABE Mirror", engine: 2, pricePence: 14700, isActive: true, stripeProductId: null },
  { slug: "babe-lens", name: "The BABE Lens", engine: 2, pricePence: 9700, isActive: true, stripeProductId: null },
  { slug: "babe-crossing", name: "The BABE Crossing", engine: 2, pricePence: 14700, isActive: true, stripeProductId: null },
  { slug: "babe-reckoning", name: "The BABE Reckoning", engine: 2, pricePence: 19700, isActive: true, stripeProductId: null },
  { slug: "babe-rebuild", name: "The BABE Rebuild", engine: 2, pricePence: 24700, isActive: true, stripeProductId: null },
  { slug: "babe-90", name: "The BABE 90", engine: 2, pricePence: 19700, isActive: true, stripeProductId: null },
  { slug: "babe-signature", name: "The BABE Signature", engine: 2, pricePence: 44700, isActive: true, stripeProductId: null },
  // Engine 3 · Business
  { slug: "babe-business-lens", name: "The BABE Business Lens", engine: 3, pricePence: 14700, isActive: true, stripeProductId: null },
  { slug: "babe-brand-frequency", name: "The BABE Brand Frequency", engine: 3, pricePence: 24700, isActive: true, stripeProductId: null },
  { slug: "babe-founder-read", name: "The BABE Founder Read", engine: 3, pricePence: 29700, isActive: true, stripeProductId: null },
  { slug: "babe-business-signature", name: "The BABE Business Signature", engine: 3, pricePence: 49700, isActive: true, stripeProductId: null },
  // Engine 4 · Bond
  { slug: "babe-bond-mother-daughter", name: "The BABE Bond · Mother and Daughter", engine: 4, pricePence: 24700, isActive: true, stripeProductId: null },
  { slug: "babe-bond-co-parenting", name: "The BABE Bond · Co-Parenting", engine: 4, pricePence: 24700, isActive: true, stripeProductId: null },
  { slug: "babe-bond-lens", name: "The BABE Bond Lens", engine: 4, pricePence: 14700, isActive: true, stripeProductId: null },
  { slug: "babe-bond-signature", name: "The BABE Bond Signature", engine: 4, pricePence: 49700, isActive: true, stripeProductId: null },
  // Engine 5 · Subscription
  { slug: "daily-frequency-personal", name: "Daily Frequency Personal", engine: 5, pricePence: 1700, isActive: true, stripeProductId: null },
  // Engine 6 · Timing
  { slug: "babe-pulse", name: "The BABE Pulse", engine: 6, pricePence: 9700, isActive: true, stripeProductId: null },
  { slug: "babe-business-pulse", name: "The BABE Business Pulse", engine: 6, pricePence: 9700, isActive: true, stripeProductId: null },
  { slug: "babe-bond-pulse", name: "The BABE Bond Pulse", engine: 6, pricePence: 9700, isActive: true, stripeProductId: null },
  { slug: "your-babe-year-map", name: "Your BABE Year Map", engine: 6, pricePence: 19700, isActive: true, stripeProductId: null },
  { slug: "your-babe-business-year", name: "Your BABE Business Year", engine: 6, pricePence: 19700, isActive: true, stripeProductId: null },
  { slug: "your-babe-bond-year", name: "Your BABE Bond Year", engine: 6, pricePence: 19700, isActive: true, stripeProductId: null },
  // Engine 7 · Journey
  { slug: "babe-52-week-journey-monthly", name: "The BABE 52-Week Journey", engine: 7, pricePence: 1900, isActive: true, stripeProductId: null },
];

function withCalc(
  p: Omit<ProductCard, "sectionCount" | "slaDays">,
): ProductCard {
  return {
    ...p,
    sectionCount: SECTION_COUNT_BY_SLUG[p.slug] ?? DEFAULT_SECTION_COUNT,
    slaDays: SLA_DAYS_BY_SLUG[p.slug] ?? DEFAULT_SLA_DAYS,
  };
}

async function createProductAction(
  input: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  if (!input.slug.trim() || !input.name.trim()) {
    return { ok: false, error: "Slug and name are required." };
  }
  const { error } = await supabaseAdmin.from("products").insert({
    slug: input.slug,
    name: input.name,
    engine: input.engine,
    price_pence: input.pricePence,
    currency: "gbp",
    description: input.description || null,
    is_active: input.isActive,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

async function updateProductAction(
  slug: string,
  input: ProductInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin
    .from("products")
    .update({
      slug: input.slug,
      name: input.name,
      engine: input.engine,
      price_pence: input.pricePence,
      description: input.description || null,
      is_active: input.isActive,
    })
    .eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

async function deleteProductAction(
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  "use server";
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

export default async function AdminProductsPage() {
  const { data: rows } = await supabaseAdmin
    .from("products")
    .select("slug, name, engine, price_pence, is_active, stripe_product_id")
    .order("engine", { ascending: true })
    .order("price_pence", { ascending: true })
    .returns<ProductRow[]>();

  const dbRows = rows ?? [];
  let products: ProductCard[];
  let isSeeded = true;
  if (dbRows.length === 0) {
    isSeeded = false;
    products = CANON_PRODUCTS.map(withCalc);
  } else {
    products = dbRows.map((r) =>
      withCalc({
        slug: r.slug,
        name: r.name,
        engine: r.engine,
        pricePence: r.price_pence,
        isActive: r.is_active !== false,
        stripeProductId: r.stripe_product_id,
      }),
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar activeHref="/admin/products" />

      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1280px", padding: "28px 36px" }}
      >
        <ProductsBoard
          products={products}
          isSeeded={isSeeded}
          createProduct={createProductAction}
          updateProduct={updateProductAction}
          deleteProduct={deleteProductAction}
        />
      </main>
    </div>
  );
}
