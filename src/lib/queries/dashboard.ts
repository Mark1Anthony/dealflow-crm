import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { DashboardStats, Activity } from '@/lib/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getSupabaseServerClient();

  // Get the IDs for "Won" and "Lost" stages to exclude them
  const { data: excludedStages } = await supabase
    .from('pipeline_stages')
    .select('id')
    .in('name', ['Won', 'Lost']);

  const excludedIds = (excludedStages ?? []).map((s) => s.id);

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [contactsRes, dealsRes, valueRes, activitiesRes] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    excludedIds.length > 0
      ? supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .not('stage_id', 'in', `(${excludedIds.join(',')})`)
      : supabase
          .from('deals')
          .select('*', { count: 'exact', head: true }),
    excludedIds.length > 0
      ? supabase
          .from('deals')
          .select('value')
          .not('stage_id', 'in', `(${excludedIds.join(',')})`)
      : supabase.from('deals').select('value'),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
  ]);

  const pipelineValue = (valueRes.data ?? []).reduce(
    (sum: number, d: any) => sum + (d.value ?? 0),
    0,
  );

  return {
    totalContacts: contactsRes.count ?? 0,
    activeDeals: dealsRes.count ?? 0,
    pipelineValue,
    activitiesThisWeek: activitiesRes.count ?? 0,
  };
}

export async function getRecentActivities(limit: number) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*, contact:contacts(name), deal:deals(title)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Activity[];
}
