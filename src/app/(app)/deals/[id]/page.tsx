import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealWithDetails } from "@/lib/queries/deals";
import { TopBar } from "@/components/TopBar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { NoteList } from "@/components/NoteList";
import { NoteForm } from "@/components/NoteForm";
import { DeleteButton } from "@/components/DeleteButton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDealWithDetails(id);
  if (!data.deal) notFound();
  const { deal, notes, activities } = data;
  const contact = deal.contact;
  const stage = deal.stage;

  return (
    <>
      <TopBar
        title={deal.title}
        subtitle={stage?.name || "Deal"}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/deals/${id}/edit`} className="bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold px-4 py-2 rounded-lg transition text-sm">Edit</Link>
            <DeleteButton id={id} type="deal" />
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-6">
          <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Value</span><div className="text-zinc-200 mt-0.5 text-lg font-bold">{deal.value ? formatCurrency(deal.value) : "—"}</div></div>
              <div><span className="text-zinc-500">Stage</span><div className="flex items-center gap-2 mt-0.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage?.color || "#666" }} /><span className="text-zinc-200">{stage?.name}</span></div></div>
              <div><span className="text-zinc-500">Contact</span><div className="text-zinc-200 mt-0.5">{contact ? <Link href={`/contacts/${deal.contact_id}`} className="text-cyan-400 hover:text-cyan-300">{contact.name}</Link> : "—"}</div></div>
              <div><span className="text-zinc-500">Expected close</span><div className="text-zinc-200 mt-0.5">{deal.expected_close ? formatDate(deal.expected_close) : "—"}</div></div>
            </div>
            {deal.description && <div className="mt-4 pt-4 border-t border-white/5 text-sm text-zinc-400">{deal.description}</div>}
          </div>

          <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
            <h3 className="text-zinc-50 font-bold mb-3">Notes</h3>
            <NoteForm dealId={id} />
            <NoteList notes={notes} returnPath={`/deals/${id}`} />
          </div>
        </div>

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
