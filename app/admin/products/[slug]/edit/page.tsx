import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  ProductFormModal,
  type ProductCard,
  type ProductInput,
} from "@/components/admin/products/ProductsBoard";

export const metadata: Metadata = {
  title: "Edit Product · BABE HQ",
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

type ProductRow = {
  slug: string;
  name: string;
  engine: number | null;
  price_pence: number | null;
  description: string | null;
  is_active: boolean | null;
  stripe_product_id: string | null;
};

type Props = {
  params: Promise<{ slug: string }>;
};

const SECTION_COUNT_BY_SLUG: Record<string, number> = {
  "babe-signature": 22,
  "babe-business-signature": 22,
  "babe-bond-signature": 22,
};
const SLA_DAYS_BY_SLUG: Record<string, number> = {
  "babe-signature": 21,
};

export default async function ProductEditPage({ params }: Props) {
  const { slug } = await params;

  async function updateProductAction(
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
    redirect("/admin/products");
  }

  const { data: row } = await supabaseAdmin
    .from("products")
    .select(
      "slug, name, engine, price_pence, description, is_active, stripe_product_id",
    )
    .eq("slug", slug)
    .maybeSingle<ProductRow>();

  if (!row) {
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
              This product does not exist.
            </h1>
            <Link
              href="/admin/products"
              className="bg-magenta text-cream rounded-full px-5 py-2.5 hover:bg-magenta-bright transition-colors uppercase tracking-[0.2em] mt-6"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const initial: ProductCard = {
    slug: row.slug,
    name: row.name,
    engine: row.engine,
    pricePence: row.price_pence,
    sectionCount: SECTION_COUNT_BY_SLUG[row.slug] ?? 8,
    slaDays: SLA_DAYS_BY_SLUG[row.slug] ?? 14,
    isActive: row.is_active !== false,
    stripeProductId: row.stripe_product_id,
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main
        className="mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "28px 36px" }}
      >
        <div className="flex flex-col gap-4">
          <Link
            href="/admin/products"
            className="text-gold hover:text-gold-bright transition-colors inline-flex items-center gap-2 self-start"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <span aria-hidden="true">&larr;</span>
            Back to products
          </Link>
          <div>
            <p className={EYEBROW}>Edit Product</p>
            <h1 className="serif-it text-gold text-[2rem] leading-none mt-2">
              {row.name}
            </h1>
          </div>
        </div>
        <ProductFormModal
          mode="edit"
          initial={initial}
          onCancel={async () => {
            "use server";
            redirect("/admin/products");
          }}
          onSave={updateProductAction}
        />
      </main>
    </div>
  );
}
