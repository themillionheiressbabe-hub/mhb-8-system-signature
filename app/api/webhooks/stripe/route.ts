import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${String(err)}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const productSlug = session.metadata?.productSlug ?? null;
      const userId = session.metadata?.userId || null;
      const customerEmail =
        session.customer_email ?? session.customer_details?.email ?? null;

      const { error } = await supabaseAdmin.from("orders").insert({
        user_id: userId,
        product_slug: productSlug,
        amount_pence: session.amount_total ?? 0,
        currency: session.currency ?? "gbp",
        status: "paid",
        customer_email: customerEmail,
        stripe_session_id: session.id,
        stripe_subscription_id:
          typeof session.subscription === "string"
            ? session.subscription
            : null,
      });

      if (error) {
        console.error("orders insert failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await supabaseAdmin.from("orders").insert({
        amount_pence: sub.items.data[0]?.price.unit_amount ?? 0,
        currency: sub.currency ?? "gbp",
        status: "active_subscription",
        stripe_subscription_id: sub.id,
        customer_email: null,
      });
      if (error) {
        console.error("subscription insert failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id);
      if (error) {
        console.error("subscription cancel update failed", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
