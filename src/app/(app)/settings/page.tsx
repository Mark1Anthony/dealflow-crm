import { getPipelineStages } from "@/lib/queries/pipeline";
import { TopBar } from "@/components/TopBar";
import { StageEditor } from "@/components/StageEditor";

export default async function SettingsPage() {
  const stages = await getPipelineStages();

  return (
    <>
      <TopBar title="Settings" subtitle="Configure your pipeline" />
      <div className="max-w-xl">
        <StageEditor stages={stages} />
      </div>
    </>
  );
}
