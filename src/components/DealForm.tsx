"use client";

import { useActionState } from "react";
import { createDeal, updateDeal } from "@/lib/actions/deals";
import { formErrorMessages } from "@/lib/utils";
import type { Contact, Deal, PipelineStage } from "@/lib/types";

interface DealFormProps {
  contacts: Contact[];
  stages: PipelineStage[];
  deal?: Deal;
}

export function DealForm({ contacts, stages, deal }: DealFormProps) {
  const [state, formAction, pending] = useActionState(
    (_: unknown, fd: FormData) => (deal ? updateDeal(deal.id, fd) : createDeal(fd)),
    null,
  );
  const errors = formErrorMessages(state);

  return (
    <form action={formAction} className="bg-[#111218] border border-white/5 rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title *</label>
        <input name="title" required defaultValue={deal?.title} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Value (&#x20AC;)</label>
          <input name="value" type="number" min="0" step="1" placeholder="0" defaultValue={deal?.value ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Expected close</label>
          <input name="expected_close" type="date" defaultValue={deal?.expected_close ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Pipeline stage *</label>
        <select name="stage_id" required defaultValue={deal?.stage_id} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition">
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Contact</label>
        <select name="contact_id" defaultValue={deal?.contact_id ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition">
          <option value="">No contact</option>
          {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
        <textarea name="description" rows={3} defaultValue={deal?.description ?? ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition resize-none" />
      </div>
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      <button type="submit" disabled={pending} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
        {pending ? (deal ? "Saving..." : "Creating...") : (deal ? "Save changes" : "Create deal")}
      </button>
    </form>
  );
}
