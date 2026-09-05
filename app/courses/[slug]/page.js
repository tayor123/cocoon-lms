import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnrollButton from "./EnrollButton";

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0A08", color: "#F3ECD9" }}>
        <p>Lesson not found.</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", course.id)
    .order("position");

  return (
    <div
      className="min-h-screen px-6 md:px-10 py-16"
      style={{ background: "#0B0A08", color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-3xl mx-auto">
        <Link href="/courses" className="text-sm mb-8 inline-block" style={{ color: "#8C8577" }}>
          ← All lessons
        </Link>

        <p className="text-xs mb-3" style={{ color: "#C9A135", fontFamily: "'IBM Plex Mono', monospace" }}>
          {course.instructor_name?.toUpperCase()} — {course.instructor_craft?.toUpperCase()}
        </p>
        <h1 className="text-4xl mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
          {course.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#8C8577" }}>
          {course.description}
        </p>

        {isEnrolled ? (
          <Link
            href={`/courses/${course.slug}/lessons/${modules?.[0]?.lessons?.[0]?.id ?? ""}`}
            className="inline-block text-sm font-medium px-8 py-3 rounded-full"
            style={{ background: "#C9A135", color: "#201803" }}
          >
            Continue lesson
          </Link>
        ) : (
          <EnrollButton courseId={course.id} isLoggedIn={!!user} />
        )}

        <div className="mt-12 space-y-6">
          {modules?.map((mod) => (
            <div key={mod.id}>
              <p className="text-xs mb-3" style={{ color: "#8C8577", fontFamily: "'IBM Plex Mono', monospace" }}>
                {mod.title?.toUpperCase()}
              </p>
              <div style={{ border: "1px solid rgba(243,236,217,0.1)", borderRadius: "16px", overflow: "hidden" }}>
                {mod.lessons
                  ?.sort((a, b) => a.position - b.position)
                  .map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="px-5 py-4 text-sm flex items-center justify-between"
                      style={{
                        borderBottom: idx !== mod.lessons.length - 1 ? "1px solid rgba(243,236,217,0.08)" : "none",
                      }}
                    >
                      <span>{lesson.title}</span>
                      {isEnrolled && (
                        <Link href={`/courses/${course.slug}/lessons/${lesson.id}`} style={{ color: "#C9A135" }}>
                          Watch
                        </Link>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
