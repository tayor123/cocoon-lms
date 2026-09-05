import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Stripe needs the raw request body to verify the signature, so this
// route reads text() rather than json().
export async function POST(request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { course_id, user_id } = session.metadata || {};

    if (course_id && user_id) {
      // Service role client — bypasses RLS since this runs server-to-server,
      // authenticated by the Stripe webhook secret rather than a user session.
      const supabase = createServiceClient();
      await supabase.from("enrollments").upsert(
        {
          user_id,
          course_id,
          stripe_checkout_session_id: session.id,
        },
        { onConflict: "user_id,course_id" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
