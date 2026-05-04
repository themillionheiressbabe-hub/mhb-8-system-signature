import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type ProductRow = {
  slug: string;
  name: string;
  stripe_price_id: string | null;
};

type ProfileRow = {
  email: string | null;
};

export async function POST(request: Request) {
  let body: { priceId?: string; productSlug?: string; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { priceId, productSlug, userId } = body;
  if (!priceId || !productSlug) {
    return NextResponse.json(
      { error: "priceId and productSlug are required" },
      { status: 400 },
    );
  }

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("slug, name, stripe_price_id")
    .eq("slug", productSlug)
    .single<ProductRow>();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stripe_price_id !== priceId) {
    return NextResponse.json(
      { error: "priceId does not match product" },
      { status: 400 },
    );
  }

  const stripePrice = await stripe.prices.retrieve(priceId);
  const mode: "payment" | "subscription" = stripePrice.recurring
    ? "subscription"
    : "payment";

  let customerEmail: string | undefined;
  if (userId) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle<ProfileRow>();
    customerEmail = profile?.email ?? undefined;
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/intake?orderId={CHECKOUT_SESSION_ID}&product=${productSlug}`,
    cancel_url: `${baseUrl}/shop/${productSlug}`,
    metadata: {
      productSlug,
      userId: userId ?? "",
    },
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
