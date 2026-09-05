import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*, lessons(count))")
    .eq("user_id", user.id);

  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedSet = new Set(completedLessons?.map((c) => c.lesson_id));

  return (
    <div
      className="min-h-screen px-6 md:px-10 py-16"
      style={{ background: "#0B0A08", color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs mb-1" style={{ color: "#C9A135", fontFamily: "'IBM Plex Mono', monospace" }}>
              WELCOME BACK
            </p>
            <h1 className="text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>
              {profile?.full_name || "there"}.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-sm" style={{ color: "#8C8577" }}>
              Browse lessons
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm px-4 py-2 rounded-full" style={{ border: "1px solid rgba(243,236,217,0.25)" }}>
                Log out
              </button>
            </form>
          </div>
        </div>

        {(!enrollments || enrollments.length === 0) && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(243,236,217,0.04)", border: "1px solid rgba(243,236,217,0.1)" }}
          >
            <p className="mb-4" style={{ color: "#8C8577" }}>
              You haven't started a lesson yet.
            </p>
            <Link
              href="/courses"
              className="inline-block text-sm font-medium px-6 py-3 rounded-full"
              style={{ background: "#C9A135", color: "#201803" }}
            >
              Browse lessons
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {enrollments?.map((enr) => {
            const course = enr.courses;
            const totalLessons = course?.lessons?.[0]?.count ?? 0;
            return (
              <Link
                key={enr.id}
                href={`/courses/${course?.slug}`}
                className="rounded-2xl p-6 block"
                style={{ background: "rgba(243,236,217,0.04)", border: "1px solid rgba(243,236,217,0.1)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-xs"
                  style={{ background: course?.hue, color: "#0B0A08", fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {course?.instructor_name?.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                  {course?.title}
                </h3>
                <p className="text-xs" style={{ color: "#8C8577" }}>
                  {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
