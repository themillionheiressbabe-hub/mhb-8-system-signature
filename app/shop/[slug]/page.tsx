import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  engine: number | null;
  price_pence: number;
  is_free: boolean;
  requires_time_of_birth: boolean;
  description: string | null;
};

type AccentName = "magenta" | "gold" | "emerald" | "violet";

const ENGINE_LABEL: Record<number, string> = {
  1: "Pattern Reads",
  2: "Full Signature",
  3: "Business",
  4: "Bond",
  5: "Subscription",
  6: "Timing",
  7: "The Journey",
};

const ENGINE_ACCENT: Record<number, AccentName> = {
  1: "magenta",
  2: "gold",
  3: "emerald",
  4: "violet",
  5: "magenta",
  6: "gold",
  7: "emerald",
};

const ENGINE_SECTION: Record<number, string> = {
  1: "start-here",
  2: "signatures",
  3: "go-deeper",
  4: "go-deeper",
  5: "daily",
  6: "go-deeper",
  7: "journey",
};

const SIGNATURE_SLUGS = new Set([
  "babe-signature",
  "babe-business-signature",
  "babe-bond-signature",
]);

const MONTHLY_SLUGS = new Set([
  "daily-frequency-personal",
  "babe-52-week-journey-monthly",
]);

const FREE_TOOL_ROUTE: Record<string, string> = {
  "daily-frequency-free": "/tools/daily-frequency",
  "birthprint-snapshot": "/tools/birthprint-snapshot",
  "your-babe-year-free": "/tools/your-babe-year",
};

const ACCENT_CLASS: Record<
  AccentName,
  { text: string; border: string; eyebrow: string }
> = {
  magenta: { text: "text-magenta", border: "border-magenta", eyebrow: "eyebrow-mag" },
  gold: { text: "text-gold", border: "border-gold", eyebrow: "" },
  emerald: { text: "text-emerald", border: "border-emerald", eyebrow: "" },
  violet: { text: "text-violet", border: "border-violet", eyebrow: "" },
};

function formatPrice(pence: number) {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  if (pounds === Math.floor(pounds)) return `£${pounds}`;
  return `£${pounds.toFixed(2)}`;
}

function tierLabel(p: ProductRow) {
  if (p.is_free) return "Free Tool · Instant";
  if (SIGNATURE_SLUGS.has(p.slug)) return "Flagship · Manual";
  if (p.slug === "daily-frequency-personal") return "Subscription · Monthly";
  if (p.slug === "babe-52-week-journey-monthly")
    return "The Journey · Monthly";
  return "Read · Manual";
}

function billingNote(p: ProductRow) {
  if (p.is_free) return "No account needed. Just your birth date.";
  if (MONTHLY_SLUGS.has(p.slug)) return "Cancel anytime. No lock-in.";
  if (SIGNATURE_SLUGS.has(p.slug))
    return "One-time. PDF + voice walkthrough. No subscription.";
  return "One-time. Hand-built. Delivered as PDF.";
}

function detailRows(p: ProductRow): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (p.is_free) {
    rows.push({ label: "Format", value: "Free web tool" });
    rows.push({ label: "Lenses", value: "Multi-lens preview" });
  } else if (p.slug === "daily-frequency-personal") {
    rows.push({ label: "Delivery", value: "Daily, Mon to Fri" });
    rows.push({ label: "Format", value: "Email + portal" });
    rows.push({ label: "Lenses", value: "Three, cross-referenced" });
  } else if (p.slug === "babe-52-week-journey-monthly") {
    rows.push({ label: "Delivery", value: "Weekly, 52 releases" });
    rows.push({ label: "Format", value: "Portal modules" });
    rows.push({ label: "Lenses", value: "Seven, woven through" });
  } else if (SIGNATURE_SLUGS.has(p.slug)) {
    rows.push({ label: "Delivery", value: "10 business days" });
    rows.push({ label: "Format", value: "PDF + voice walkthrough" });
    rows.push({ label: "Lenses", value: "All seven, cross-referenced" });
  } else {
    rows.push({ label: "Delivery", value: "5 business days" });
    rows.push({ label: "Format", value: "PDF + voice notes" });
    rows.push({ label: "Lenses", value: "Cross-referenced" });
  }
  rows.push({ label: "Built by", value: "Yemi (no AI)" });
  if (p.requires_time_of_birth) {
    rows.push({ label: "Birth time", value: "Required" });
  }
  return rows;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, slug, name, engine, price_pence, is_free, requires_time_of_birth, description",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<ProductRow>();

  if (!product) {
    redirect("/shop");
  }

  const engine = product.engine ?? 1;
  const accent = ENGINE_ACCENT[engine] ?? "magenta";
  const a = ACCENT_CLASS[accent];
  const categoryName = ENGINE_LABEL[engine] ?? "Read";
  const sectionSlug = ENGINE_SECTION[engine] ?? "all";
  const sectionFilter = product.is_free ? "try-first" : sectionSlug;

  const price = formatPrice(product.price_pence);
  const isMonthly = MONTHLY_SLUGS.has(product.slug);

  const ctaHref = product.is_free
    ? FREE_TOOL_ROUTE[product.slug] ?? "/shop"
    : "/signup";
  const ctaLabel = product.is_free ? "Try It Free" : "Begin Intake";

  const details = detailRows(product);

  return (
    <div className="flex-1">
      <Navbar />

      <main>
        <section className="pt-32 pb-24">
          <div className="container">
            {/* Breadcrumb */}
            <p className="text-xs text-text-faint mb-6">
              <Link
                href="/shop"
                className="text-gold no-underline hover:text-gold-bright transition-colors"
              >
                Shop
              </Link>
              <span className="mx-2.5">·</span>
              <Link
                href={`/shop?section=${sectionFilter}`}
                className="text-gold no-underline hover:text-gold-bright transition-colors"
              >
                {product.is_free ? "Try First" : categoryName}
              </Link>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-start">
              {/* LEFT: description */}
              <div>
                <p className={`eyebrow ${a.eyebrow || a.text} mb-4`}>
                  {tierLabel(product)}
                </p>
                <h1 className="serif text-[clamp(2.25rem,4vw,3rem)] leading-[1.1] mb-3.5">
                  {product.name}
                </h1>

                <hr className="rule-gold mb-8" />

                {product.description ? (
                  <div className="text-base leading-[1.75] text-cream/85">
                    <p>{product.description}</p>
                  </div>
                ) : null}

                {product.requires_time_of_birth ? (
                  <div className="mt-8 flex items-center gap-2.5 px-4 py-3 rounded-lg border border-gold/25 bg-[rgba(201,169,110,0.05)] inline-flex">
                    <span
                      className="bg-gold w-2 h-2 rounded-full inline-block"
                      aria-hidden="true"
                    />
                    <span className="text-gold text-sm">
                      Birth time required for this read.
                    </span>
                  </div>
                ) : null}
              </div>

              {/* RIGHT: sticky purchase card */}
              <aside className="lg:sticky lg:top-28">
                <div className="card p-7">
                  <p className={`eyebrow ${a.eyebrow || a.text} mb-3`}>
                    {tierLabel(product)}
                  </p>
                  <p
                    className={`serif ${a.text} text-[3rem] leading-none mb-1.5 font-semibold`}
                  >
                    {price}
                    {isMonthly ? (
                      <span className="text-base font-normal text-cream/60 ml-2">
                        /mo
                      </span>
                    ) : null}
                  </p>
                  <p className="muted text-[13px] mb-6">{billingNote(product)}</p>

                  <Link
                    href={ctaHref}
                    className={`btn ${product.is_free ? "btn-outline" : "btn-primary"} w-full mb-3`}
                  >
                    {ctaLabel}
                  </Link>

                  <hr className="rule-gold my-6" />

                  <div className="flex flex-col gap-3.5 text-[13px]">
                    {details.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between gap-4"
                      >
                        <span className="muted">{row.label}</span>
                        <span className="text-cream text-right">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr className="rule-gold my-6" />

                  <p className="text-[11px] text-text-faint leading-[1.6]">
                    Pattern recognition for personal development.
                    Non-predictive. Non-diagnostic. Non-prescriptive.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
