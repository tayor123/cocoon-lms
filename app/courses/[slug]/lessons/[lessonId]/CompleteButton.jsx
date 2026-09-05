"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CompleteButton({ lessonId, userId, initialCompleted }) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function toggle() {
    setSaving(true);
    const nextValue = !completed;

    await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: nextValue,
        completed_at: nextValue ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" }
    );

    setCompleted(nextValue);
    setSaving(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="text-sm font-medium px-6 py-3 rounded-full"
      style={{
        background: completed ? "#C9A135" : "rgba(243,236,217,0.08)",
        color: completed ? "#201803" : "#F3ECD9",
      }}
    >
      {completed ? "✓ Completed" : "Mark as complete"}
    </button>
  );
}
