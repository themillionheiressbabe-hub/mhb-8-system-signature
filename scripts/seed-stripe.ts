import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type Recurring = { interval: "month" | "year" };

type Seed = {
  slug: string;
  name: string;
  description: string;
  pricePence: number;
  engine: number;
  recurring?: Recurring;
};

const PRODUCTS: Seed[] = [
  // ENGINE 1 - PASSIVE
  {
    slug: "babe-life-spread",
    name: "The BABE Life Spread",
    description:
      "A 3-lens preview of your Life Spread. Destiny Cards, Numerology, and Name Frequency cross-referenced. Instant delivery.",
    pricePence: 1400,
    engine: 1,
  },
  {
    slug: "daily-frequency-personal",
    name: "Daily Frequency Personal",
    description:
      "Your personal daily card read Mon-Fri 7am UK. Your birth card meets today's collective energy every morning.",
    pricePence: 499,
    engine: 1,
    recurring: { interval: "month" },
  },

  // ENGINE 2 - PERSONAL
  {
    slug: "babe-mirror",
    name: "The BABE Mirror",
    description:
      "A shadow read. 12 sections, all 8 lenses. Gentle entry to the deeper work.",
    pricePence: 2400,
    engine: 2,
  },
  {
    slug: "babe-lens",
    name: "The BABE Lens",
    description:
      "A single life domain read. Money, Voice, Roots, Presence. You pick the domain. All 8 lenses.",
    pricePence: 3700,
    engine: 2,
  },
  {
    slug: "babe-crossing",
    name: "The BABE Crossing",
    description:
      "A decision read. Path A vs Path B. All 8 lenses on the choice in front of you.",
    pricePence: 3700,
    engine: 2,
  },
  {
    slug: "babe-reckoning",
    name: "The BABE Reckoning",
    description:
      "A grief read. All 8 lenses held with care. For the loss that has not yet been named.",
    pricePence: 3700,
    engine: 2,
  },
  {
    slug: "babe-rebuild",
    name: "The BABE Rebuild",
    description:
      "A late-life reinvention read. 16 sections, all 8 lenses. For the woman starting over with everything she knows.",
    pricePence: 5700,
    engine: 2,
  },
  {
    slug: "babe-90",
    name: "The BABE 90",
    description:
      "A 90-day action map. 18 sections, all 8 lenses. Three 30-day sprints built from your patterns.",
    pricePence: 7700,
    engine: 2,
  },
  {
    slug: "babe-signature",
    name: "The BABE Signature",
    description:
      "The flagship full read. 22 sections, all 8 lenses, Chiron section included. 10-14 days to build.",
    pricePence: 12700,
    engine: 2,
  },
  {
    slug: "babe-debrief",
    name: "The BABE Debrief",
    description:
      "A 60-minute live Zoom walkthrough of your report. Add-on to The BABE Signature only.",
    pricePence: 5500,
    engine: 2,
  },

  // ENGINE 3 - BUSINESS
  {
    slug: "babe-business-lens",
    name: "The BABE Business Lens",
    description:
      "A single business domain read. Brand, Revenue, Voice, Foundations. All 8 lenses through a founder filter.",
    pricePence: 3700,
    engine: 3,
  },
  {
    slug: "babe-brand-frequency",
    name: "The BABE Brand Frequency",
    description:
      "Your business name read. 4 lenses on the frequency your brand is running.",
    pricePence: 3700,
    engine: 3,
  },
  {
    slug: "babe-founder-read",
    name: "The BABE Founder Read",
    description:
      "Founder identity and working style. All 8 lenses. For pre-launch and idea-stage founders.",
    pricePence: 5700,
    engine: 3,
  },
  {
    slug: "babe-business-signature",
    name: "The BABE Business Signature",
    description:
      "The flagship founder read. 24 sections, all 8 lenses plus business overlay.",
    pricePence: 14700,
    engine: 3,
  },

  // ENGINE 4 - BOND
  {
    slug: "babe-bond-mother-daughter",
    name: "The BABE Bond Mother Daughter",
    description:
      "A two-person read for mother and daughter. All 8 lenses for both. Non-romantic.",
    pricePence: 2700,
    engine: 4,
  },
  {
    slug: "babe-bond-co-parenting",
    name: "The BABE Bond Co-Parenting",
    description:
      "A co-parenting pattern read. All 8 lenses for both people. Together or separated.",
    pricePence: 3700,
    engine: 4,
  },
  {
    slug: "babe-bond-lens",
    name: "The BABE Bond Lens",
    description:
      "A single relationship domain read. Communication, Money, Conflict, Intimacy. All 8 lenses for both.",
    pricePence: 4700,
    engine: 4,
  },
  {
    slug: "babe-bond-signature",
    name: "The BABE Bond Signature",
    description:
      "The flagship two-person read. 26 sections, all 8 lenses for both, full synastry overlay.",
    pricePence: 17700,
    engine: 4,
  },

  // ENGINE 6 - TIMING
  {
    slug: "babe-pulse",
    name: "The BABE Pulse",
    description: "A 3-month timing read. 10 sections across 4 timing lenses.",
    pricePence: 2700,
    engine: 6,
  },
  {
    slug: "babe-business-pulse",
    name: "The BABE Business Pulse",
    description:
      "A 3-month business timing read. 10 sections across 4 timing lenses.",
    pricePence: 2700,
    engine: 6,
  },
  {
    slug: "babe-bond-pulse",
    name: "The BABE Bond Pulse",
    description: "A 3-month relationship timing read. 12 sections, both people.",
    pricePence: 4700,
    engine: 6,
  },
  {
    slug: "babe-year-map",
    name: "Your BABE Year Map",
    description:
      "A 12-month timing read. Birthday-to-birthday or calendar year. 16 sections.",
    pricePence: 5700,
    engine: 6,
  },
  {
    slug: "babe-business-year",
    name: "Your BABE Business Year",
    description:
      "A 12-month business timing read. 16 sections across 4 timing lenses.",
    pricePence: 5700,
    engine: 6,
  },
  {
    slug: "babe-bond-year",
    name: "Your BABE Bond Year",
    description:
      "A 12-month relationship timing read. 20 sections, both people.",
    pricePence: 7700,
    engine: 6,
  },

  // ENGINE 7 - JOURNEY
  {
    slug: "babe-journey-full",
    name: "The BABE Journey Full",
    description:
      "The full 52-week chakra journey. One-time payment. Wednesday mirror personalised to your Birthprint.",
    pricePence: 14700,
    engine: 7,
  },
  {
    slug: "babe-journey-monthly",
    name: "The BABE Journey Monthly",
    description: "The 52-week chakra journey on a monthly plan.",
    pricePence: 1499,
    engine: 7,
    recurring: { interval: "month" },
  },
  {
    slug: "babe-journey-skool",
    name: "The BABE Journey Skool",
    description:
      "The full 52-week chakra journey. Community discount for MillionHeiress U members.",
    pricePence: 12700,
    engine: 7,
  },
];

async function main() {
  console.log(`Seeding ${PRODUCTS.length} Stripe products...\n`);

  for (const p of PRODUCTS) {
    const { data: existing } = await supabase
      .from("products")
      .select("stripe_product_id, stripe_price_id")
      .eq("slug", p.slug)
      .maybeSingle<{
        stripe_product_id: string | null;
        stripe_price_id: string | null;
      }>();

    if (existing?.stripe_product_id && existing?.stripe_price_id) {
      console.log(`  ${p.slug}  already seeded, skipping`);
      continue;
    }

    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
      metadata: {
        engine: String(p.engine),
        slug: p.slug,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.pricePence,
      currency: "gbp",
      ...(p.recurring ? { recurring: p.recurring } : {}),
    });

    const { error } = await supabase
      .from("products")
      .update({
        stripe_product_id: product.id,
        stripe_price_id: price.id,
      })
      .eq("slug", p.slug);

    if (error) {
      console.error(
        `  ${p.slug}  Stripe created (${product.id}) but Supabase update failed: ${error.message}`,
      );
    } else {
      console.log(`  ${p.slug}  ${product.id}  ${price.id}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
