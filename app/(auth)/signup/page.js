import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0B0A08", color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm mb-8 inline-block" style={{ color: "#8C8577" }}>
          ← Back to The Cocoon
        </Link>

        <h1 className="text-3xl mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
          Step into the light.
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8C8577" }}>
          Create an account to start your first lesson.
        </p>

        {error && (
          <p
            className="text-sm mb-4 px-4 py-3 rounded-lg"
            style={{ background: "rgba(122,35,49,0.2)", color: "#E8A5A5" }}
          >
            {error}
          </p>
        )}

        <form action={signup} className="space-y-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background: "rgba(243,236,217,0.06)",
                border: "1px solid rgba(243,236,217,0.15)",
                color: "#F3ECD9",
              }}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background: "rgba(243,236,217,0.06)",
                border: "1px solid rgba(243,236,217,0.15)",
                color: "#F3ECD9",
              }}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background: "rgba(243,236,217,0.06)",
                border: "1px solid rgba(243,236,217,0.15)",
                color: "#F3ECD9",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full text-sm font-medium px-6 py-3 rounded-full"
            style={{ background: "#C9A135", color: "#201803" }}
          >
            Create account
          </button>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: "#8C8577" }}>
          Already a member?{" "}
          <Link href="/login" style={{ color: "#C9A135" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
