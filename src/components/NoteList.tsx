"use client";

import type { Note } from "@/lib/types";

interface NoteListProps {
  notes: Note[];
  onDelete?: (noteId: string) => void;
}

export function NoteList({ notes, onDelete }: NoteListProps) {
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
            {onDelete && (
              <button
                onClick={() => onDelete(note.id)}
                className="text-xs text-zinc-600 transition hover:text-red-400"
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
