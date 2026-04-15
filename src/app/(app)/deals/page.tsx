import Link from "next/link";
import { getDealsByStage } from "@/lib/queries/deals";
import { TopBar } from "@/components/TopBar";
import { KanbanBoard } from "@/components/KanbanBoard";

export default async function DealsPage() {
  const stageData = await getDealsByStage();

  return (
    <>
      <TopBar
        title="Deals"
        subtitle="Drag deals between stages"
        action={
          <Link href="/deals/new" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition text-sm">
            + New deal
          </Link>
        }
      />
      {stageData.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">No pipeline stages configured.</p>
          <p className="text-sm">Load demo data on the Dashboard or create stages in Settings.</p>
        </div>
      ) : (
        <KanbanBoard stageData={stageData} />
      )}
    </>
  );
}
