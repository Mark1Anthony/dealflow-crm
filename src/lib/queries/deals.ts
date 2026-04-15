import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { Deal, Note, Activity, PipelineStage } from '@/lib/types';

export async function getDeals() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(name), stage:pipeline_stages(name, color)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Deal[];
}

export async function getDealsByStage() {
  const supabase = await getSupabaseServerClient();

  const [stagesRes, dealsRes] = await Promise.all([
    supabase
      .from('pipeline_stages')
      .select('*')
      .order('position', { ascending: true }),
    supabase
      .from('deals')
      .select('*, contact:contacts(name), stage:pipeline_stages(name, color)')
      .order('created_at', { ascending: false }),
  ]);

  if (stagesRes.error) throw stagesRes.error;
  if (dealsRes.error) throw dealsRes.error;

  const stages = stagesRes.data as PipelineStage[];
  const deals = dealsRes.data as Deal[];

  return stages.map((stage) => ({
    stage,
    deals: deals.filter((d) => d.stage_id === stage.id),
  }));
}

export async function getDealById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('deals')
    .select(
      '*, contact:contacts(name, email, company), stage:pipeline_stages(name, color)',
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Deal;
}

export async function getDealWithDetails(id: string) {
  const supabase = await getSupabaseServerClient();

  const [dealRes, notesRes, activitiesRes] = await Promise.all([
    supabase
      .from('deals')
      .select(
        '*, contact:contacts(name, email, company), stage:pipeline_stages(name, color)',
      )
      .eq('id', id)
      .single(),
    supabase
      .from('notes')
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('activities')
      .select('*')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (dealRes.error) throw dealRes.error;

  return {
    deal: dealRes.data as Deal,
    notes: (notesRes.data ?? []) as Note[],
    activities: (activitiesRes.data ?? []) as Activity[],
  };
}
