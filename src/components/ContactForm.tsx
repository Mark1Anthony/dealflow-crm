"use client";

import { useActionState } from "react";
import { createContact, updateContact } from "@/lib/actions/contacts";
import type { Contact } from "@/lib/types";

export function ContactForm({ contact }: { contact?: Contact }) {
  const action = contact
    ? ((_: unknown, fd: FormData) => updateContact(contact.id, fd))
    : ((_: unknown, fd: FormData) => createContact(fd));

  const [error, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="bg-[#111218] border border-white/5 rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Name *</label>
        <input name="name" required defaultValue={contact?.name} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
          <input name="email" type="email" defaultValue={contact?.email || ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Phone</label>
          <input name="phone" defaultValue={contact?.phone || ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Company</label>
          <input name="company" defaultValue={contact?.company || ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Position</label>
          <input name="position" defaultValue={contact?.position || ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Notes</label>
        <textarea name="notes" rows={3} defaultValue={contact?.notes || ""} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition resize-none" />
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">{String(error)}</div>}
      <button type="submit" disabled={pending} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
        {pending ? "Saving..." : contact ? "Update contact" : "Create contact"}
      </button>
    </form>
  );
}
