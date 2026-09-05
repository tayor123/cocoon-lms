# The Cocoon — LMS

A learning management system: marketing landing page, auth, courses/lessons,
a student dashboard, an instructor/admin studio for creating content, and
Stripe-based paid enrollment.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/ssr`
- Stripe Checkout for payments
- Docker (multi-stage, `standalone` output)

## What's built

- **Landing page** (`/`) — the marketing page.
- **Auth** — email/password signup & login (`/signup`, `/login`), session
  handled via Supabase SSR cookies and refreshed in `middleware.js`.
- **Course catalog** (`/courses`) and **course detail** pages, pulling from
  Postgres via Supabase.
- **Enrollment + payment** — "Get this lesson" starts a Stripe Checkout
  session (`/api/checkout`); a webhook (`/api/webhooks/stripe`) grants
  access once payment succeeds.
- **Lesson player** (`/courses/[slug]/lessons/[lessonId]`) — gated to
  enrolled users, with a "mark complete" action that writes progress.
- **Student dashboard** (`/dashboard`) — enrolled courses.
- **Instructor/admin studio** (`/admin`) — create lessons, add modules and
  lessons within them, publish/unpublish. Gated to users whose `profiles.role`
  is `instructor` or `admin`.
- **Database schema + RLS** — `supabase/schema.sql`.

## What's still not here

- Video hosting/streaming (lesson `video_url` is just a plain URL — you'll
  want something like Mux, Cloudflare Stream, or S3 + a player for real
  video delivery).
- Email delivery for the newsletter signup on the landing page (it's still
  just client-side state, no backend wired to it).
- Subscriptions/recurring billing — the current Stripe integration is a
  one-time payment per course. Swap `mode: "payment"` for `mode:
  "subscription"` in `app/api/checkout/route.js` if you want recurring.
- Search, reviews, certificates, notifications — none of that exists yet.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`.
3. Copy your Project URL, anon key, and service role key into `.env`
   (copy `.env.example` to `.env` first — Docker Compose reads this file
   automatically for both build args and runtime env vars).
4. To make yourself an instructor: sign up through the app, then in the
   Supabase table editor set your row in `profiles.role` to `instructor`
   or `admin`.

## 2. Set up Stripe

1. Grab your test secret key from the Stripe dashboard → `.env` as
   `STRIPE_SECRET_KEY`.
2. For local webhook testing, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   It'll print a `whsec_...` value — put that in `.env` as
   `STRIPE_WEBHOOK_SECRET`.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## 4. Run with Docker

Docker Compose reads `.env` for the same variables:

```bash
docker compose up --build
```

Visit http://localhost:3000

## Notes for deployment

- The Stripe webhook needs a **publicly reachable URL** — set it up in the
  Stripe dashboard once deployed, using your real domain and the same
  `/api/webhooks/stripe` path.
- Set `NEXT_PUBLIC_SITE_URL` to your real domain in production so Stripe's
  redirect URLs are correct.
- Consider Supabase's connection pooler if you deploy somewhere with many
  server instances.
