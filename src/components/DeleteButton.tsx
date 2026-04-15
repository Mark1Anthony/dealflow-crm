"use client";

import { useState } from "react";
import { deleteContact } from "@/lib/actions/contacts";
import { deleteDeal } from "@/lib/actions/deals";

export function DeleteButton({ id, type }: { id: string; type: "contact" | "deal" }) {
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (type === "contact") await deleteContact(id);
    else await deleteDeal(id);
  }

  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} className="bg-red-500/10 text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-500/20 transition text-sm">
        Delete
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleDelete} className="bg-red-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">
        Confirm
      </button>
      <button onClick={() => setConfirm(false)} className="bg-white/5 text-zinc-300 font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm">
        Cancel
      </button>
    </div>
  );
}
