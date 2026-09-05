import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase.from("courses").select("*, lessons(count)").order("created_at", { ascending: false });
  if (profile?.role !== "admin") {
    query = query.eq("created_by", user.id);
  }
  const { data: courses } = await query;

  return (
    <div className="px-6 md:px-10 py-16" style={{ color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs mb-1" style={{ color: "#C9A135", fontFamily: "'IBM Plex Mono', monospace" }}>
              INSTRUCTOR STUDIO
            </p>
            <h1 className="text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>
              Your lessons.
            </h1>
          </div>
          <Link
            href="/admin/courses/new"
            className="text-sm font-medium px-6 py-3 rounded-full"
            style={{ background: "#C9A135", color: "#201803" }}
          >
            + New lesson
          </Link>
        </div>

        {(!courses || courses.length === 0) && (
          <p className="text-sm" style={{ color: "#8C8577" }}>
            You haven't created a lesson yet.
          </p>
        )}

        <div className="space-y-3">
          {courses?.map((course) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="flex items-center justify-between px-5 py-4 rounded-xl"
              style={{ background: "rgba(243,236,217,0.04)", border: "1px solid rgba(243,236,217,0.1)" }}
            >
              <div>
                <p className="text-sm font-medium">{course.title}</p>
                <p className="text-xs" style={{ color: "#8C8577" }}>
                  {course.lessons?.[0]?.count ?? 0} lesson(s)
                </p>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  background: course.published ? "rgba(201,161,53,0.15)" : "rgba(243,236,217,0.08)",
                  color: course.published ? "#C9A135" : "#8C8577",
                }}
              >
                {course.published ? "PUBLISHED" : "DRAFT"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
