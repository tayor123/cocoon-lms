import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div
      className="min-h-screen px-6 md:px-10 py-16"
      style={{ background: "#0B0A08", color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm mb-8 inline-block" style={{ color: "#8C8577" }}>
          ← The Cocoon
        </Link>
        <h1 className="text-3xl md:text-4xl mb-10" style={{ fontFamily: "'Fraunces', serif" }}>
          Every lesson.
        </h1>

        {(!courses || courses.length === 0) && (
          <p className="text-sm" style={{ color: "#8C8577" }}>
            No lessons published yet — check back soon.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="rounded-2xl p-6 block"
              style={{ background: "rgba(243,236,217,0.04)", border: "1px solid rgba(243,236,217,0.1)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-sm"
                style={{ background: course.hue, color: "#0B0A08", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {course.instructor_name?.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                {course.title}
              </h3>
              <p className="text-sm mb-3" style={{ color: "#8C8577" }}>
                {course.instructor_name} — {course.instructor_craft}
              </p>
              <p className="text-sm" style={{ color: "#C9A135" }}>
                ${(course.price_cents / 100).toFixed(0)}/mo
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
