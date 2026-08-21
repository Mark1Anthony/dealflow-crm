import { getSupabaseServerClient, getUser } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // The middleware exempts /api/* from the auth redirect, so this route has to
  // check for itself. RLS would block the write anyway, but a Supabase update
  // that matches no rows returns no error - without this the route would answer
  // { ok: true } while nothing happened.
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { stageId } = await request.json();

  if (!stageId) return NextResponse.json({ error: "stageId required" }, { status: 400 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .update({ stage_id: stageId })
    .eq("id", id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "deal not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
