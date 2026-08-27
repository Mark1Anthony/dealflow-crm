"use client";

import { useState, useTransition } from "react";
import { completeActivity, deleteActivity } from "@/lib/actions/activities";

interface ActivityActionsProps {
  id: string;
  /** Null while the activity is still open. */
  completedAt: string | null;
}

export function ActivityActions({ id, completedAt }: ActivityActionsProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => startTransition(() => void deleteActivity(id))}
          disabled={pending}
          className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!completedAt && (
        <button
          onClick={() => startTransition(() => void completeActivity(id))}
          disabled={pending}
          title="Mark as done"
          className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:text-cyan-400 disabled:opacity-50"
        >
          Done
        </button>
      )}
      <button
        onClick={() => setConfirming(true)}
        title="Delete activity"
        className="rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition hover:text-red-400"
      >
        Remove
      </button>
    </div>
  );
}
