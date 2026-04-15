import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { Activity } from '@/lib/types';

export async function getActivities(type?: string, page = 1, limit = 20) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('activities')
    .select('*, contact:contacts(name), deal:deals(title)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { activities: data as Activity[], total: count ?? 0, page, limit };
}
