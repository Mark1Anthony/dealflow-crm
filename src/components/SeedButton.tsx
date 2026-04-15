"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    const { seedDemoData } = await import("@/lib/actions/seed");
    await seedDemoData();
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
      >
        {loading ? "Loading demo data..." : "Load demo data"}
      </button>
    </div>
  );
}
