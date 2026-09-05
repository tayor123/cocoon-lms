import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 500 }
    );
  }

  const { courseId } = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  // Already enrolled? Don't charge twice.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already enrolled." }, { status: 400 });
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: course.currency || "usd",
          product_data: {
            name: course.title,
            description: `${course.instructor_name} — ${course.instructor_craft}`,
          },
          unit_amount: course.price_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      course_id: course.id,
      user_id: user.id,
    },
    success_url: `${origin}/courses/${course.slug}?checkout=success`,
    cancel_url: `${origin}/courses/${course.slug}?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
