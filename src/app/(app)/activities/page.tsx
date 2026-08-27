import Link from "next/link";
import { getActivities } from "@/lib/queries/activities";
import { TopBar } from "@/components/TopBar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ActivityForm } from "@/components/ActivityForm";

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ type?: string; page?: string }> }) {
  const { type, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { activities, total, limit } = await getActivities(type, page);

  const types = ["call", "email", "meeting", "task"];

  return (
    <>
      <TopBar title="Activities" subtitle={`${total} total`} />

      <div className="bg-[#111218] border border-white/5 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Log an activity</h2>
        <ActivityForm />
      </div>

      <div className="flex gap-2 mb-6">
        <a href="/activities" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${!type ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-zinc-400 hover:text-zinc-200"}`}>
          All
        </a>
        {types.map(t => (
          <a key={t} href={`/activities?type=${t}`} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${type === t ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-zinc-400 hover:text-zinc-200"}`}>
            {t}
          </a>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No activities{type ? ` of type "${type}"` : ""} yet.</p>
        </div>
      ) : (
        <div className="bg-[#111218] border border-white/5 rounded-2xl p-5">
          <ActivityFeed activities={activities} actionable />
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-zinc-500">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} activities
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/activities?${new URLSearchParams({ ...(type ? { type } : {}), page: String(page - 1) }).toString()}`}
                className="bg-white/5 hover:bg-white/10 text-zinc-300 font-medium px-4 py-2 rounded-lg transition text-sm"
              >
                Previous
              </Link>
            )}
            {page * limit < total && (
              <Link
                href={`/activities?${new URLSearchParams({ ...(type ? { type } : {}), page: String(page + 1) }).toString()}`}
                className="bg-white/5 hover:bg-white/10 text-zinc-300 font-medium px-4 py-2 rounded-lg transition text-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
