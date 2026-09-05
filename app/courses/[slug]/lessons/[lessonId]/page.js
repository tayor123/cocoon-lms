import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompleteButton from "./CompleteButton";

export default async function LessonPage({ params }) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) {
    return <div style={{ background: "#0B0A08", color: "#F3ECD9" }} className="min-h-screen p-10">Lesson not found.</div>;
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, position")
    .eq("course_id", course.id)
    .order("position");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return (
    <div
      className="min-h-screen px-6 md:px-10 py-10"
      style={{ background: "#0B0A08", color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_280px] gap-8">
        <div>
          <Link href={`/courses/${slug}`} className="text-sm mb-6 inline-block" style={{ color: "#8C8577" }}>
            ← {course.title}
          </Link>

          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{ background: "#000", aspectRatio: "16/9", border: "1px solid rgba(243,236,217,0.1)" }}
          >
            {lesson?.video_url ? (
              <video controls className="w-full h-full" src={lesson.video_url} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "#6B655A" }}>
                No video uploaded for this lesson yet.
              </div>
            )}
          </div>

          <h1 className="text-2xl mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            {lesson?.title}
          </h1>

          <CompleteButton lessonId={lessonId} userId={user.id} initialCompleted={!!progress?.completed} />
        </div>

        <aside>
          <p className="text-xs mb-3" style={{ color: "#8C8577", fontFamily: "'IBM Plex Mono', monospace" }}>
            LESSONS
          </p>
          <div className="space-y-1">
            {allLessons?.map((l) => (
              <Link
                key={l.id}
                href={`/courses/${slug}/lessons/${l.id}`}
                className="block text-sm px-4 py-3 rounded-xl"
                style={{
                  background: l.id === lessonId ? "rgba(201,161,53,0.12)" : "transparent",
                  color: l.id === lessonId ? "#C9A135" : "#D9D3C4",
                }}
              >
                {l.title}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
