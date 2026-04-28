import { Cormorant_Garamond, Outfit } from "next/font/google";
import Link from "next/link";
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

type LayoutKind =
  | "standard"
  | "free"
  | "signatures"
  | "go-deeper"
  | "subscription"
  | "journey";

type SectionDef = {
  slug: string;
  tabLabel: string;
  heading: string;
  subheading: string;
  layout: LayoutKind;
  filter: (p: ProductRow) => boolean;
};

const SIGNATURE_SLUGS = [
  "babe-signature",
  "babe-business-signature",
  "babe-bond-signature",
];

const SECTIONS: SectionDef[] = [
  {
    slug: "try-first",
    tabLabel: "Try First",
    heading: "Try First",
    subheading: "No commitment. Just a look.",
    layout: "free",
    filter: (p) => p.is_free,
  },
  {
    slug: "start-here",
    tabLabel: "Start Here",
    heading: "Start Here",
    subheading: "Pick a lens. See what shows up.",
    layout: "standard",
    filter: (p) => p.engine === 1 && !p.is_free,
  },
  {
    slug: "signatures",
    tabLabel: "The Signatures",
    heading: "The Full Picture",
    subheading: "The most complete read you can get.",
    layout: "signatures",
    filter: (p) => SIGNATURE_SLUGS.includes(p.slug),
  },
  {
    slug: "go-deeper",
    tabLabel: "Go Deeper",
    heading: "Go Deeper",
    subheading: "When you know exactly what you want to look at.",
    layout: "go-deeper",
    filter: (p) => {
      if (p.slug === "babe-business-signature") return false;
      if (p.slug === "babe-bond-signature") return false;
      if (p.engine === 3) return true;
      if (p.engine === 4) return true;
      if (p.engine === 6 && !p.is_free) return true;
      return false;
    },
  },
  {
    slug: "daily",
    tabLabel: "Daily",
    heading: "Daily Frequency · Personal",
    subheading: "Your card. Your pattern. Every morning.",
    layout: "subscription",
    filter: (p) => p.engine === 5,
  },
  {
    slug: "journey",
    tabLabel: "The Journey",
    heading: "The Long Game",
    subheading:
      "52 weeks. Your pattern, lived. Join monthly, cancel anytime.",
    layout: "journey",
    filter: (p) => p.slug === "babe-52-week-journey-monthly",
  },
];

const TABS = [
  { slug: "all", label: "All", href: "/shop" },
  ...SECTIONS.map((s) => ({
    slug: s.slug,
    label: s.tabLabel,
    href: `/shop?section=${s.slug}`,
  })),
];

const SIGNATURE_ENGINE_CLASS: Record<string, string> = {
  "babe-signature": "engine-1",
  "babe-business-signature": "engine-3",
  "babe-bond-signature": "engine-4",
};

function formatPrice(pence: number) {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  if (pounds === Math.floor(pounds)) return `£${pounds}`;
  return `£${pounds.toFixed(2)}`;
}

function BirthTimeNote() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="bg-gold w-2 h-2 rounded-full inline-block"
        aria-hidden="true"
      />
      <span className="text-gold text-xs">Birth time needed</span>
    </div>
  );
}

function ProductDescription({
  text,
  slug,
}: {
  text: string | null;
  slug: string;
}) {
  if (!text) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-white text-sm leading-relaxed line-clamp-2">{text}</p>
      <Link
        href={`/shop/${slug}`}
        className="text-gold text-sm hover:underline"
      >
        Read more &rarr;
      </Link>
    </div>
  );
}

function StandardCard({ product }: { product: ProductRow }) {
  const engineClass = `engine-${product.engine}`;
  return (
    <div
      className={`${engineClass} engine-card rounded-lg p-6 flex flex-col gap-3`}
    >
      <h3
        className={`${cormorant.className} text-white text-[22px] leading-tight`}
      >
        {product.name}
      </h3>
      <ProductDescription text={product.description} slug={product.slug} />
      <p className="engine-price font-bold text-lg">
        {formatPrice(product.price_pence)}
      </p>
      {product.requires_time_of_birth ? <BirthTimeNote /> : null}
      <div className="flex-1" />
      <Link
        href="/signup"
        className="engine-cta rounded-full px-5 py-2 text-sm font-semibold inline-block self-start"
      >
        Get Started
      </Link>
    </div>
  );
}

function FreeCard({ product }: { product: ProductRow }) {
  return (
    <div className="free-card rounded-lg p-6 flex flex-col gap-3">
      <h3
        className={`${cormorant.className} text-white text-[22px] leading-tight`}
      >
        {product.name}
      </h3>
      <ProductDescription text={product.description} slug={product.slug} />
      <p className="text-gold font-bold text-lg">Free</p>
      <div className="flex-1" />
      <Link
        href="/tools"
        className="border border-gold text-gold rounded-full px-5 py-2 text-sm font-semibold inline-block self-start"
      >
        Try Free
      </Link>
    </div>
  );
}

function SignatureCard({ product }: { product: ProductRow }) {
  const engineClass = SIGNATURE_ENGINE_CLASS[product.slug] ?? "engine-1";
  return (
    <div
      className={`${engineClass} engine-card signature-card rounded-lg p-8 flex flex-col gap-4 min-h-[280px]`}
    >
      <h3
        className={`${cormorant.className} text-white text-[28px] leading-tight`}
      >
        {product.name}
      </h3>
      <ProductDescription text={product.description} slug={product.slug} />
      <p className="engine-price font-bold text-xl">
        {formatPrice(product.price_pence)}
      </p>
      {product.requires_time_of_birth ? <BirthTimeNote /> : null}
      <div className="flex-1" />
      <Link
        href="/signup"
        className="engine-cta rounded-full px-6 py-3 text-base font-semibold inline-block self-start"
      >
        Get Started
      </Link>
    </div>
  );
}

function SubscriptionCard({ product }: { product: ProductRow }) {
  return (
    <div className="engine-5 engine-card rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 min-h-[160px]">
      <div className="flex-1 flex flex-col gap-3">
        <h3
          className={`${cormorant.className} text-white text-[28px] leading-tight`}
        >
          {product.name}
        </h3>
        <ProductDescription text={product.description} slug={product.slug} />
      </div>
      <div className="flex flex-col sm:items-end gap-3">
        <p className="engine-price font-bold text-2xl whitespace-nowrap">
          {formatPrice(product.price_pence)}
          <span className="text-base font-normal text-gold">
            {" "}
            per month
          </span>
        </p>
        <Link
          href="/signup"
          className="engine-cta rounded-full px-6 py-3 text-base font-semibold inline-block"
        >
          Subscribe
        </Link>
      </div>
    </div>
  );
}

function JourneyCard({ product }: { product: ProductRow }) {
  return (
    <div className="engine-7 engine-card rounded-lg p-8 flex flex-col gap-4">
      <h3
        className={`${cormorant.className} text-white text-[24px] leading-tight`}
      >
        {product.name}
      </h3>
      <ProductDescription text={product.description} slug={product.slug} />
      <p className="engine-price font-bold text-3xl">
        {formatPrice(product.price_pence)}
        <span className="text-base font-normal text-gold"> per month</span>
      </p>
      <div className="flex-1" />
      <Link
        href="/signup"
        className="engine-cta rounded-full px-6 py-3 text-base font-semibold inline-block self-start"
      >
        Get Started
      </Link>
    </div>
  );
}

function renderSection(section: SectionDef, products: ProductRow[]) {
  if (products.length === 0) return null;

  let body: React.ReactNode;
  switch (section.layout) {
    case "standard":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <StandardCard key={p.id} product={p} />
          ))}
        </div>
      );
      break;
    case "free":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <FreeCard key={p.id} product={p} />
          ))}
        </div>
      );
      break;
    case "signatures":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SIGNATURE_SLUGS.map((slug) => {
            const p = products.find((x) => x.slug === slug);
            if (!p) return null;
            return <SignatureCard key={p.id} product={p} />;
          })}
        </div>
      );
      break;
    case "subscription":
      body = (
        <div className="flex flex-col gap-6">
          {products.map((p) => (
            <SubscriptionCard key={p.id} product={p} />
          ))}
        </div>
      );
      break;
    case "go-deeper": {
      const byPrice = (a: ProductRow, b: ProductRow) =>
        a.price_pence - b.price_pence;
      const groups: {
        label: string;
        labelClass: string;
        products: ProductRow[];
      }[] = [
        {
          label: "Business",
          labelClass: "text-emerald",
          products: products.filter((p) => p.engine === 3).sort(byPrice),
        },
        {
          label: "Bond",
          labelClass: "text-violet",
          products: products.filter((p) => p.engine === 4).sort(byPrice),
        },
        {
          label: "Timing",
          labelClass: "text-gold",
          products: products.filter((p) => p.engine === 6).sort(byPrice),
        },
      ];
      body = (
        <div className="flex flex-col gap-12">
          {groups
            .filter((g) => g.products.length > 0)
            .map((g) => (
              <div key={g.label}>
                <p
                  className={`${g.labelClass} text-[11px] uppercase tracking-widest font-semibold mb-4 text-center`}
                >
                  {g.label}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {g.products.map((p) => (
                    <StandardCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      );
      break;
    }
    case "journey":
      body = (
        <div className="flex justify-center">
          <div className="w-full max-w-[400px]">
            {products.map((p) => (
              <JourneyCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      );
      break;
  }

  return (
    <section
      key={section.slug}
      id={section.slug}
      className="px-6 py-12 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className={`${cormorant.className} text-white text-3xl sm:text-4xl font-semibold`}
          >
            {section.heading}
          </h2>
          <p className="text-gold text-base mt-2">{section.subheading}</p>
        </div>
        {body}
      </div>
    </section>
  );
}

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { section } = await searchParams;
  const validSlugs = SECTIONS.map((s) => s.slug);
  const selectedSlug =
    section && validSlugs.includes(section) ? section : "all";

  const visibleSections =
    selectedSlug === "all"
      ? SECTIONS
      : SECTIONS.filter((s) => s.slug === selectedSlug);

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, slug, name, engine, price_pence, is_free, requires_time_of_birth, description",
    )
    .eq("is_active", true)
    .order("price_pence", { ascending: true })
    .returns<ProductRow[]>();

  const allProducts = products ?? [];

  return (
    <div className={`${outfit.className} flex-1 bg-transparent`}>
      <Navbar />

      <section className="px-6 pt-32 pb-8 text-center">
        <h1
          className={`${cormorant.className} text-white text-5xl sm:text-6xl font-semibold`}
        >
          The Shop
        </h1>
        <p className="text-gold text-lg mt-3">Find your read</p>
      </section>

      <section className="px-6 pb-4 sticky top-16 z-40 bg-bg/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto shop-tabs overflow-x-auto">
          <div className="flex gap-2 w-max mx-auto pb-2">
            {TABS.map((tab) => {
              const isSelected = selectedSlug === tab.slug;
              return (
                <Link
                  key={tab.slug}
                  href={tab.href}
                  className={
                    isSelected
                      ? "bg-magenta text-white rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap"
                      : "border border-gold text-gold rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="pb-24">
        {visibleSections.map((s) =>
          renderSection(s, allProducts.filter(s.filter)),
        )}
      </div>

      <Footer />
    </div>
  );
}
