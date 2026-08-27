"use client";

import { useTransition } from "react";
import { deleteNote } from "@/lib/actions/notes";
import type { Note } from "@/lib/types";

interface NoteListProps {
  notes: Note[];
  /** Page to revalidate after a delete. Omit to hide the delete control. */
  returnPath?: string;
}

export function NoteList({ notes, returnPath }: NoteListProps) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-xl border border-white/5 bg-[#111218] p-4"
        >
          <p className="whitespace-pre-wrap text-sm text-zinc-300">
            {note.content}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {new Date(note.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {returnPath && (
              <button
                onClick={() => startTransition(() => void deleteNote(note.id, returnPath))}
                disabled={pending}
                className="text-xs text-zinc-600 transition hover:text-red-400 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
