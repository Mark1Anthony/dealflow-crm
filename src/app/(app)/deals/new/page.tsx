import { TopBar } from "@/components/TopBar";
import { DealForm } from "@/components/DealForm";
import { getContacts } from "@/lib/queries/contacts";
import { getPipelineStages } from "@/lib/queries/pipeline";

export default async function NewDealPage() {
  const [{ contacts }, stages] = await Promise.all([getContacts(), getPipelineStages()]);

  return (
    <>
      <TopBar title="New deal" subtitle="Create a new deal in your pipeline" />
      <div className="max-w-xl">
        <DealForm contacts={contacts} stages={stages} />
      </div>
    </>
  );
}
