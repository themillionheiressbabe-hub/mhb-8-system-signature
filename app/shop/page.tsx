import Link from "next/link";
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
    slug: "try-first",
    tabLabel: "Try First",
    heading: "Try First",
    subheading: "No commitment. Just a look.",
    layout: "free",
    accent: "emerald",
    filter: (p) => p.is_free,
  },
  {
    slug: "start-here",
    tabLabel: "Start Here",
    heading: "Start Here",
    subheading: "Pick a lens. See what shows up.",
    layout: "standard",
    accent: "gold",
    filter: (p) => p.engine === 1 && !p.is_free,
  },
  {
    slug: "signatures",
    tabLabel: "The Signatures",
    heading: "The Signatures",
    subheading: "The most complete read you can get.",
    layout: "signatures",
    accent: "magenta",
    filter: (p) => SIGNATURE_SLUGS.includes(p.slug),
  },
  {
    slug: "go-deeper",
    tabLabel: "Go Deeper",
    heading: "Go Deeper",
    subheading: "When you know exactly what you want to look at.",
    layout: "go-deeper",
    accent: "violet",
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
    accent: "magenta",
    filter: (p) => p.engine === 5,
  },
  {
    slug: "journey",
    tabLabel: "The Journey",
    heading: "The Long Game",
    subheading:
      "52 weeks. Your pattern, lived. Join monthly, cancel anytime.",
    layout: "journey",
    accent: "emerald",
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

function StandardCard({
  product,
  accent,
  sectionLabel,
}: {
  product: ProductRow;
  accent: AccentName;
  sectionLabel: string;
}) {
  const a = ACCENT_CLASS[accent];
  const price = priceLabel(product);
  return (
    <Link
      href={cardHref(product)}
      className={`card lift block p-6 border-l-4 ${a.border} no-underline flex flex-col`}
    >
      <p className={`eyebrow ${a.text} mb-2.5`}>
        {sectionLabel} &middot; {price}
      </p>
      <h4 className="serif-it text-[1.4rem] leading-tight mb-2.5">
        {product.name}
      </h4>
      {product.description ? (
        <p className="muted text-[13px] leading-[1.6] line-clamp-3">
          {product.description}
        </p>
      ) : null}
      {product.requires_time_of_birth ? <BirthTimeNote /> : null}
      <p className={`${a.price} font-bold text-lg mt-auto pt-4`}>{price}</p>
    </Link>
  );
}

function SignatureCard({ product }: { product: ProductRow }) {
  const accent = SIGNATURE_ACCENT[product.slug] ?? "magenta";
  const a = ACCENT_CLASS[accent];
  const price = priceLabel(product);
  return (
    <Link
      href={`/shop/${product.slug}`}
      className={`card lift block p-8 border-l-4 ${a.border} no-underline grid grid-cols-[1fr_auto] gap-7 items-start`}
    >
      <div>
        <p className={`eyebrow ${a.text} mb-3`}>The Signature &middot; Flagship</p>
        <h3 className="serif text-[1.6rem] leading-tight mb-2.5">
          {product.name}
        </h3>
        {product.description ? (
          <p className="muted text-sm leading-[1.65] mb-4 line-clamp-4">
            {product.description}
          </p>
        ) : null}
        {product.requires_time_of_birth ? <BirthTimeNote /> : null}
      </div>
      <div className="text-right">
        <p
          className={`${a.price} text-[32px] font-bold leading-none whitespace-nowrap`}
        >
          {price}
        </p>
        <p className="eyebrow mt-2">Flagship</p>
      </div>
    </Link>
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
          {products.map((p) => (
            <StandardCard
              key={p.id}
              product={p}
              accent={section.accent}
              sectionLabel={section.tabLabel}
            />
          ))}
        </div>
      );
      break;
    case "signatures":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SIGNATURE_SLUGS.map((slug) => {
            const p = products.find((x) => x.slug === slug);
            if (!p) return null;
            return <SignatureCard key={p.id} product={p} />;
          })}
        </div>
      );
      break;
    case "subscription":
    case "journey":
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <StandardCard
              key={p.id}
              product={p}
              accent={section.accent}
              sectionLabel={section.tabLabel}
            />
          ))}
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
                  {g.products.map((p) => (
                    <StandardCard
                      key={p.id}
                      product={p}
                      accent={g.accent}
                      sectionLabel={g.label}
                    />
                  ))}
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
              Every report runs the same seven-lens verification. The tier sets
              the depth, not the rigour.
            </p>
          </div>
        </section>

        {/* FILTER PILLS */}
        <section className="pb-8 sticky top-[68px] z-40 bg-[rgba(10,14,26,0.72)] backdrop-blur-[20px] border-b border-[rgba(201,169,110,0.12)]">
          <div className="container py-3 shop-tabs overflow-x-auto">
            <div className="flex gap-2.5 w-max">
              {TABS.map((tab) => {
                const isSelected = selectedSlug === tab.slug;
                return (
                  <Link
                    key={tab.slug}
                    href={tab.href}
                    className={`btn btn-sm whitespace-nowrap ${isSelected ? "btn-primary" : "btn-outline"}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
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
