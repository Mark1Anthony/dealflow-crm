"use client";

import { useState } from "react";
import { createStage, updateStage, deleteStage, reorderStages } from "@/lib/actions/pipeline";
import { formErrorMessages } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { PipelineStage } from "@/lib/types";

export function StageEditor({ stages }: { stages: PipelineStage[] }) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#22d3ee");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const fd = new FormData();
    fd.set("name", newName);
    fd.set("position", String(stages.length));
    fd.set("color", newColor);
    const messages = formErrorMessages(await createStage(fd));
    if (messages.length > 0) setError(messages.join(" "));
    else { setError(null); setNewName(""); router.refresh(); }
  }

  async function handleRename(stage: PipelineStage, name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed === stage.name) return;

    const fd = new FormData();
    fd.set("name", trimmed);
    fd.set("position", String(stage.position));
    fd.set("color", stage.color ?? "");

    const messages = formErrorMessages(await updateStage(stage.id, fd));
    if (messages.length > 0) setError(messages.join(" "));
    else { setError(null); router.refresh(); }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;

    const order = stages.map(s => s.id);
    [order[index], order[target]] = [order[target], order[index]];

    await reorderStages(order);
    setError(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const messages = formErrorMessages(await deleteStage(id));
    if (messages.length > 0) setError(messages.join(" "));
    else { setError(null); router.refresh(); }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
        <h3 className="text-zinc-50 font-bold mb-4">Pipeline stages</h3>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400 mb-4">{error}</div>}

        {stages.length === 0 ? (
          <p className="text-zinc-500 text-sm mb-4">No stages configured.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {stages.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ backgroundColor: s.color || "#666", borderColor: s.color || "#666" }} />
                <input
                  defaultValue={s.name}
                  aria-label={`Name of stage ${s.name}`}
                  onBlur={e => handleRename(s, e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  className="flex-1 bg-transparent text-sm text-zinc-200 font-medium rounded px-1 py-0.5 outline-none hover:bg-white/5 focus:bg-zinc-900 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${s.name} up`}
                  className="text-xs text-zinc-500 hover:text-cyan-400 disabled:opacity-25 disabled:hover:text-zinc-500 transition px-1"
                >↑</button>
                <button
                  onClick={() => handleMove(i, 1)}
                  disabled={i === stages.length - 1}
                  aria-label={`Move ${s.name} down`}
                  className="text-xs text-zinc-500 hover:text-cyan-400 disabled:opacity-25 disabled:hover:text-zinc-500 transition px-1"
                >↓</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-zinc-500 hover:text-red-400 transition">Remove</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New stage name" className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition" />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer" />
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition text-sm">Add</button>
        </form>
      </div>
    </div>
  );
}
