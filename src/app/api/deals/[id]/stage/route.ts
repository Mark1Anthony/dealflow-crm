import { getSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { stageId } = await request.json();

  if (!stageId) return NextResponse.json({ error: "stageId required" }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("deals").update({ stage_id: stageId }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
