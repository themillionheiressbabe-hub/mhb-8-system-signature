import { Cormorant_Garamond, Outfit } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

const ENGINE_LABEL: Record<number, string> = {
  1: "Pattern Reads",
  2: "Full Signature",
  3: "Business",
  4: "Bond",
  5: "Subscription",
  6: "Timing",
  7: "The Journey",
};

const MONTHLY_SLUGS = new Set([
  "daily-frequency-personal",
  "babe-52-week-journey-monthly",
]);

const FREE_TOOL_ROUTE: Record<string, string> = {
  "daily-frequency-free": "/tools/daily-frequency",
  "birthprint-snapshot": "/tools/birthprint-snapshot",
  "your-babe-year-free": "/tools/your-babe-year",
};

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

function formatPrice(pence: number) {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  if (pounds === Math.floor(pounds)) return `£${pounds}`;
  return `£${pounds.toFixed(2)}`;
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
  const engineClass = `engine-${engine}`;
  const isMonthly = MONTHLY_SLUGS.has(product.slug);

  return (
    <div className={`${outfit.className} flex-1`}>
      <Navbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/shop"
            className="text-gold text-sm hover:underline inline-block mb-8"
          >
            &larr; Back to the shop
          </Link>

          <div
            className={`${engineClass} grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start`}
          >
            <div className="lg:col-span-3 flex flex-col gap-6">
              <span className="engine-label text-xs uppercase tracking-widest font-semibold">
                {ENGINE_LABEL[engine] ?? ""}
              </span>
              <h1
                className={`${cormorant.className} text-white font-semibold leading-tight text-4xl sm:text-5xl`}
              >
                {product.name}
              </h1>
              {product.description ? (
                <p className="text-white text-base leading-relaxed">
                  {product.description}
                </p>
              ) : null}
              {product.requires_time_of_birth ? (
                <div className="flex items-center gap-2">
                  <span
                    className="bg-gold w-2 h-2 rounded-full inline-block"
                    aria-hidden="true"
                  />
                  <span className="text-gold text-sm">Birth time needed</span>
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-navy border border-gold/30 rounded-lg p-8 flex flex-col gap-6">
                <p className="engine-price font-bold text-3xl">
                  {formatPrice(product.price_pence)}
                  {isMonthly ? (
                    <span className="text-base font-normal text-gold">
                      {" "}
                      per month
                    </span>
                  ) : null}
                </p>
                {product.is_free ? (
                  <>
                    <Link
                      href={FREE_TOOL_ROUTE[product.slug] ?? "/shop"}
                      className="border border-gold text-gold rounded-full px-6 py-3 text-base font-semibold inline-block text-center"
                    >
                      Try it free
                    </Link>
                    <p className="text-gold text-xs text-center">
                      No account needed. Just your birth date.
                    </p>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="bg-magenta text-white rounded-full px-6 py-3 text-base font-semibold inline-block text-center"
                    >
                      Get Started
                    </Link>
                    <p className="text-gold text-xs text-center">
                      Secure checkout. Instant confirmation.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
