import Link from "next/link";
import { createCourse } from "@/app/admin/actions";

export default async function NewCoursePage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  const fieldStyle = {
    background: "rgba(243,236,217,0.06)",
    border: "1px solid rgba(243,236,217,0.15)",
    color: "#F3ECD9",
  };

  return (
    <div className="px-6 md:px-10 py-16" style={{ color: "#F3ECD9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-lg mx-auto">
        <Link href="/admin" className="text-sm mb-8 inline-block" style={{ color: "#8C8577" }}>
          ← Your lessons
        </Link>
        <h1 className="text-3xl mb-8" style={{ fontFamily: "'Fraunces', serif" }}>
          New lesson.
        </h1>

        {error && (
          <p className="text-sm mb-4 px-4 py-3 rounded-lg" style={{ background: "rgba(122,35,49,0.2)", color: "#E8A5A5" }}>
            {error}
          </p>
        )}

        <form action={createCourse} className="space-y-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Title</label>
            <input name="title" required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Description</label>
            <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Instructor name</label>
              <input name="instructor_name" required className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Craft / title</label>
              <input name="instructor_craft" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Price (USD)</label>
              <input name="price" type="number" min="0" step="0.01" defaultValue="10" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={fieldStyle} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#8C8577" }}>Accent color</label>
              <input name="hue" type="color" defaultValue="#C9A135" className="w-full h-[46px] rounded-xl" style={{ background: "transparent", border: "1px solid rgba(243,236,217,0.15)" }} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-sm font-medium px-6 py-3 rounded-full mt-2"
            style={{ background: "#C9A135", color: "#201803" }}
          >
            Create lesson
          </button>
        </form>
      </div>
    </div>
  );
}
