import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactWithDetails } from "@/lib/queries/contacts";
import { TopBar } from "@/components/TopBar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { NoteList } from "@/components/NoteList";
import { NoteForm } from "@/components/NoteForm";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency } from "@/lib/utils";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getContactWithDetails(id);
  if (!data.contact) notFound();
  const { contact, deals, notes, activities } = data;

  return (
    <>
      <TopBar
        title={contact.name}
        subtitle={[contact.company, contact.position].filter(Boolean).join(" · ") || "Contact"}
        action={
          <div className="flex gap-2">
            <Link href={`/contacts/${id}/edit`} className="bg-white/5 border border-white/10 text-zinc-300 font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm">Edit</Link>
            <DeleteButton id={id} type="contact" />
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-6">
          {/* Info card */}
          <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Email</span><div className="text-zinc-200 mt-0.5">{contact.email || "—"}</div></div>
              <div><span className="text-zinc-500">Phone</span><div className="text-zinc-200 mt-0.5">{contact.phone || "—"}</div></div>
              <div><span className="text-zinc-500">Company</span><div className="text-zinc-200 mt-0.5">{contact.company || "—"}</div></div>
              <div><span className="text-zinc-500">Position</span><div className="text-zinc-200 mt-0.5">{contact.position || "—"}</div></div>
            </div>
            {contact.notes && <div className="mt-4 pt-4 border-t border-white/5 text-sm text-zinc-400">{contact.notes}</div>}
          </div>

          {/* Deals */}
          <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
            <h3 className="text-zinc-50 font-bold mb-3">Deals ({deals.length})</h3>
            {deals.length === 0 ? (
              <p className="text-zinc-500 text-sm">No deals yet.</p>
            ) : (
              <div className="space-y-2">
                {deals.map((d) => (
                  <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition">
                    <div>
                      <div className="text-zinc-200 text-sm font-medium">{d.title}</div>
                      <div className="text-zinc-500 text-xs">{d.stage?.name || ''}</div>
                    </div>
                    <div className="text-zinc-100 text-sm font-semibold">{d.value ? formatCurrency(d.value) : "—"}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
            <h3 className="text-zinc-50 font-bold mb-3">Notes</h3>
            <NoteForm contactId={id} />
            <NoteList notes={notes} returnPath={`/contacts/${id}`} />
          </div>
        </div>

        {/* Activity sidebar */}
        <div className="bg-[#111218] border border-white/5 rounded-2xl p-5 h-fit">
          <h3 className="text-zinc-50 font-bold mb-3">Activity</h3>
          {activities.length === 0 ? (
            <p className="text-zinc-500 text-sm">No activity yet.</p>
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </div>
      </div>
    </>
  );
}
