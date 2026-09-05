import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Log in to access the admin area");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["instructor", "admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div style={{ background: "#0B0A08", minHeight: "100vh" }}>{children}</div>
  );
}
