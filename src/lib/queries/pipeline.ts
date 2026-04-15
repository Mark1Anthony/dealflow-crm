import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { PipelineStage } from '@/lib/types';

export async function getPipelineStages() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data as PipelineStage[];
}
