import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { togglePublish, addModule, addLesson } from "@/app/admin/actions";

const fieldStyle = {
  background: "rgba(243,236,217,0.06)",
  border: "1px solid rgba(243,236,217,0.15)",
  color: "#F3ECD9",
};

export default async function EditCoursePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();

  if (!course) {
    return <div className="p-10" style={{ color: "#F3ECD9" }}>Lesson not found.</div>;
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", id)
    .order("position");

  const togglePublishBound = togglePublish.bind(null, course.id, course.published);
  const addModuleBound = addModule.bind(null, course.id);

  return (
    <div className="px-6 md:px-10 py-16" style={{ color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm mb-8 inline-block" style={{ color: "#8C8577" }}>
          ← Your lessons
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl" style={{ fontFamily: "'Fraunces', serif" }}>
            {course.title}
          </h1>
          <form action={togglePublishBound}>
            <button
              type="submit"
              className="text-xs px-4 py-2 rounded-full"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: course.published ? "rgba(201,161,53,0.15)" : "#C9A135",
                color: course.published ? "#C9A135" : "#201803",
                border: course.published ? "1px solid rgba(201,161,53,0.4)" : "none",
              }}
            >
              {course.published ? "UNPUBLISH" : "PUBLISH"}
            </button>
          </form>
        </div>
        <p className="text-sm mb-10" style={{ color: "#8C8577" }}>
          /courses/{course.slug} · ${(course.price_cents / 100).toFixed(2)}
        </p>

        <div className="space-y-8 mb-10">
          {modules?.map((mod) => {
            const addLessonBound = addLesson.bind(null, course.id, mod.id);
            return (
              <div key={mod.id} className="rounded-2xl p-5" style={{ background: "rgba(243,236,217,0.03)", border: "1px solid rgba(243,236,217,0.1)" }}>
                <p className="text-sm font-medium mb-4">{mod.title}</p>

                <div className="space-y-2 mb-4">
                  {mod.lessons
                    ?.sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <div key={lesson.id} className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(243,236,217,0.04)", color: "#D9D3C4" }}>
                        {lesson.title}
                      </div>
                    ))}
                  {(!mod.lessons || mod.lessons.length === 0) && (
                    <p className="text-xs" style={{ color: "#6B655A" }}>No lessons in this module yet.</p>
                  )}
                </div>

                <form action={addLessonBound} className="flex flex-col sm:flex-row gap-2">
                  <input name="title" placeholder="Lesson title" required className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={fieldStyle} />
                  <input name="video_url" placeholder="Video URL" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={fieldStyle} />
                  <button type="submit" className="text-xs px-4 py-2 rounded-lg whitespace-nowrap" style={{ background: "rgba(243,236,217,0.1)", color: "#F3ECD9" }}>
                    Add lesson
                  </button>
                </form>
              </div>
            );
          })}

          {(!modules || modules.length === 0) && (
            <p className="text-sm" style={{ color: "#8C8577" }}>
              No modules yet — add one below to start building this lesson.
            </p>
          )}
        </div>

        <form action={addModuleBound} className="flex gap-2">
          <input name="title" placeholder="New module title" required className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
          <button type="submit" className="text-sm font-medium px-6 py-3 rounded-full whitespace-nowrap" style={{ background: "#C9A135", color: "#201803" }}>
            Add module
          </button>
        </form>
      </div>
    </div>
  );
}
