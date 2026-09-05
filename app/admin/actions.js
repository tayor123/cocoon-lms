"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCourse(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title");
  const slug = slugify(title);

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug,
      description: formData.get("description"),
      instructor_name: formData.get("instructor_name"),
      instructor_craft: formData.get("instructor_craft"),
      price_cents: Math.round(Number(formData.get("price")) * 100) || 1000,
      hue: formData.get("hue") || "#C9A135",
      created_by: user.id,
      published: false,
    })
    .select()
    .single();

  if (error) {
    redirect(`/admin/courses/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/admin/courses/${course.id}`);
}

export async function togglePublish(courseId, currentlyPublished) {
  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({ published: !currentlyPublished })
    .eq("id", courseId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin");
}

export async function addModule(courseId, formData) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase.from("modules").insert({
    course_id: courseId,
    title: formData.get("title"),
    position: count ?? 0,
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function addLesson(courseId, moduleId, formData) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  await supabase.from("lessons").insert({
    course_id: courseId,
    module_id: moduleId,
    title: formData.get("title"),
    video_url: formData.get("video_url"),
    position: count ?? 0,
  });

  revalidatePath(`/admin/courses/${courseId}`);
}
