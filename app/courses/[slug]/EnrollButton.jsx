"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId, isLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Something went wrong starting checkout.");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium px-8 py-3 rounded-full"
      style={{ background: "#7A2331", color: "#F3ECD9" }}
    >
      {loading ? "Redirecting…" : "Get this lesson"}
    </button>
  );
}
