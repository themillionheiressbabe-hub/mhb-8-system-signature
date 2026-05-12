import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import FilterTabs from "./FilterTabs";
import ProductCard from "./ProductCard";
import SignatureCard from "./SignatureCard";

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
  accent: AccentName;
  filter: (p: ProductRow) => boolean;
};

const SIGNATURE_SLUGS = [
  "babe-signature",
  "babe-business-signature",
  "babe-bond-signature",
];

const SECTIONS: SectionDef[] = [
  {
    slug: "engine-1",
    tabLabel: "Engine 1 · Passive",
    heading: "Engine 1 · Passive",
    subheading: "Identity reads. Snapshots. First looks.",
    layout: "standard",
    accent: "gold",
    filter: (p) => p.engine === 1,
  },
  {
    slug: "engine-2",
    tabLabel: "Engine 2 · Personal",
    heading: "Engine 2 · Personal",
    subheading: "Personal pattern. Direct reads across your lenses.",
    layout: "signatures",
    accent: "magenta",
    filter: (p) => p.engine === 2,
  },
  {
    slug: "engine-3",
    tabLabel: "Engine 3 · Business",
    heading: "Engine 3 · Business",
    subheading: "Founder pattern. Business as a Birthprint expression.",
    layout: "standard",
    accent: "emerald",
    filter: (p) => p.engine === 3,
  },
  {
    slug: "engine-4",
    tabLabel: "Engine 4 · Bond",
    heading: "Engine 4 · Bond",
    subheading: "Two patterns in one read. Partnership, family, lineage.",
    layout: "standard",
    accent: "violet",
    filter: (p) => p.engine === 4,
  },
  {
    slug: "engine-5",
    tabLabel: "Engine 5 · Subscription",
    heading: "Engine 5 · Subscription",
    subheading: "Your card. Your pattern. Every morning.",
    layout: "subscription",
    accent: "gold",
    filter: (p) => p.engine === 5,
  },
  {
    slug: "engine-6",
    tabLabel: "Engine 6 · Timing",
    heading: "Engine 6 · Timing",
    subheading: "When to move. When to wait. Birthprint applied to the calendar.",
    layout: "standard",
    accent: "magenta",
    filter: (p) => p.engine === 6,
  },
  {
    slug: "engine-7",
    tabLabel: "Engine 7 · Journey",
    heading: "Engine 7 · Journey",
    subheading: "Long-form. The 52-week pattern, lived.",
    layout: "journey",
    accent: "violet",
    filter: (p) => p.engine === 7,
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

const SIGNATURE_ACCENT: Record<string, AccentName> = {
  "babe-signature": "magenta",
  "babe-business-signature": "emerald",
  "babe-bond-signature": "violet",
};

const FREE_TOOL_ROUTE: Record<string, string> = {
  "daily-frequency-free": "/tools/daily-frequency",
  "birthprint-snapshot": "/tools/birthprint-snapshot",
  "your-babe-year-free": "/tools/your-babe-year",
};

const MONTHLY_SLUGS = new Set([
  "daily-frequency-personal",
  "babe-52-week-journey-monthly",
]);

const ACCENT_HEX: Record<AccentName, { hex: string; rgb: string }> = {
  magenta: { hex: "#B51E5A", rgb: "181,30,90" },
  gold: { hex: "#C9A96E", rgb: "201,169,110" },
  emerald: { hex: "#2D9B6E", rgb: "45,155,110" },
  violet: { hex: "#A78BFA", rgb: "167,139,250" },
};

const ACCENT_CLASS: Record<
  AccentName,
  { border: string; text: string; price: string }
> = {
  magenta: {
    border: "border-l-magenta",
    text: "text-magenta",
    price: "text-magenta",
  },
  gold: {
    border: "border-l-gold",
    text: "text-gold",
    price: "text-gold",
  },
  emerald: {
    border: "border-l-emerald",
    text: "text-emerald",
    price: "text-emerald",
  },
  violet: {
    border: "border-l-violet",
    text: "text-violet",
    price: "text-violet",
  },
};

function formatPrice(pence: number) {
  if (pence === 0) return "Free";
  const pounds = pence / 100;
  if (pounds === Math.floor(pounds)) return `£${pounds}`;
  return `£${pounds.toFixed(2)}`;
}

function priceLabel(p: ProductRow) {
  if (p.is_free) return "Free";
  const base = formatPrice(p.price_pence);
  return MONTHLY_SLUGS.has(p.slug) ? `${base}/mo` : base;
}

function cardHref(p: ProductRow) {
  if (p.is_free) return FREE_TOOL_ROUTE[p.slug] ?? `/shop/${p.slug}`;
  return `/shop/${p.slug}`;
}

function BirthTimeNote() {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span
        className="bg-gold w-2 h-2 rounded-full inline-block"
        aria-hidden="true"
      />
      <span className="text-gold text-xs">Birth time needed</span>
    </div>
  );
}

function renderSection(section: SectionDef, products: ProductRow[]) {
  if (products.length === 0) return null;

  let body: React.ReactNode;
  switch (section.layout) {
    case "standard":
    case "free":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const accent = ACCENT_HEX[section.accent];
            return (
              <ProductCard
                key={p.id}
                name={p.name}
                description={p.description}
                priceLabel={priceLabel(p)}
                href={cardHref(p)}
                accentColour={accent.hex}
                accentRgb={accent.rgb}
                categoryLabel={section.tabLabel}
                requiresBirthTime={p.requires_time_of_birth}
              />
            );
          })}
        </div>
      );
      break;
    case "signatures":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SIGNATURE_SLUGS.map((slug) => {
            const p = products.find((x) => x.slug === slug);
            if (!p) return null;
            const accent = ACCENT_HEX[SIGNATURE_ACCENT[p.slug] ?? "magenta"];
            return (
              <SignatureCard
                key={p.id}
                name={p.name}
                description={p.description}
                priceLabel={priceLabel(p)}
                href={`/shop/${p.slug}`}
                accentColour={accent.hex}
                accentRgb={accent.rgb}
                requiresBirthTime={p.requires_time_of_birth}
              />
            );
          })}
        </div>
      );
      break;
    case "subscription":
    case "journey":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const accent = ACCENT_HEX[section.accent];
            return (
              <ProductCard
                key={p.id}
                name={p.name}
                description={p.description}
                priceLabel={priceLabel(p)}
                href={cardHref(p)}
                accentColour={accent.hex}
                accentRgb={accent.rgb}
                categoryLabel={section.tabLabel}
                requiresBirthTime={p.requires_time_of_birth}
              />
            );
          })}
        </div>
      );
      break;
    case "go-deeper": {
      const byPrice = (a: ProductRow, b: ProductRow) =>
        a.price_pence - b.price_pence;
      const groups: {
        label: string;
        accent: AccentName;
        products: ProductRow[];
      }[] = [
        {
          label: "Business",
          accent: "emerald",
          products: products.filter((p) => p.engine === 3).sort(byPrice),
        },
        {
          label: "Bond",
          accent: "violet",
          products: products.filter((p) => p.engine === 4).sort(byPrice),
        },
        {
          label: "Timing",
          accent: "gold",
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
                  className={`eyebrow ${ACCENT_CLASS[g.accent].text} mb-4 text-center`}
                >
                  {g.label}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {g.products.map((p) => {
                    const accent = ACCENT_HEX[g.accent];
                    return (
                      <ProductCard
                        key={p.id}
                        name={p.name}
                        description={p.description}
                        priceLabel={priceLabel(p)}
                        href={cardHref(p)}
                        accentColour={accent.hex}
                        accentRgb={accent.rgb}
                        categoryLabel={g.label}
                        requiresBirthTime={p.requires_time_of_birth}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      );
      break;
    }
  }

  return (
    <section
      key={section.slug}
      id={section.slug}
      className="py-8 scroll-mt-24"
    >
      <div className="container">
        <div className="flex items-baseline justify-between mb-7 flex-wrap gap-3">
          <h2 className="serif text-[2rem] leading-tight">{section.heading}</h2>
          <p className="eyebrow eyebrow-mag">{section.subheading}</p>
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
    <div className="flex-1">
      <Navbar />

      <main>
        {/* HEADER */}
        <section className="pt-32 pb-10">
          <div className="container">
            <p className="eyebrow mb-4">The Shop</p>
            <h1 className="serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] max-w-[740px]">
              The work, <em className="serif-it text-gold">tiered.</em>
              <span className="block text-magenta mt-1">Pick your way in.</span>
            </h1>
            <p className="muted text-base max-w-[620px] mt-5 leading-[1.65]">
              Every report runs the same eight-lens verification. The tier sets
              the depth, not the rigour.
            </p>
          </div>
        </section>

        {/* FILTER PILLS */}
        <section className="pb-8 sticky top-[68px] z-40 bg-[rgba(10,14,26,0.72)] backdrop-blur-[20px] border-b border-[rgba(201,169,110,0.12)]">
          <div className="container py-3 shop-tabs overflow-x-auto">
            <FilterTabs tabs={TABS} selectedSlug={selectedSlug} />
          </div>
        </section>

        {/* SECTIONS */}
        <div className="pb-20 pt-2">
          {visibleSections.map((s) =>
            renderSection(s, allProducts.filter(s.filter)),
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
