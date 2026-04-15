import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { Note } from '@/lib/types';

export async function getNotes(contactId?: string, dealId?: string) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (contactId) {
    query = query.eq('contact_id', contactId);
  }

  if (dealId) {
    query = query.eq('deal_id', dealId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Note[];
}
