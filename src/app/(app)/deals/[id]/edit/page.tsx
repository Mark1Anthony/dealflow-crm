import { notFound } from "next/navigation";
import { getDealById } from "@/lib/queries/deals";
import { getContacts } from "@/lib/queries/contacts";
import { getPipelineStages } from "@/lib/queries/pipeline";
import { TopBar } from "@/components/TopBar";
import { DealForm } from "@/components/DealForm";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deal, { contacts }, stages] = await Promise.all([
    getDealById(id),
    getContacts(),
    getPipelineStages(),
  ]);
  if (!deal) notFound();

  return (
    <>
      <TopBar title="Edit deal" subtitle={deal.title} />
      <div className="max-w-xl">
        <DealForm contacts={contacts} stages={stages} deal={deal} />
      </div>
    </>
  );
}
