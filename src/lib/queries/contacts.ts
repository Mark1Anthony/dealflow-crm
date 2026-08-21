import { getSupabaseServerClient } from '@/lib/supabase-server';
import type { Contact, Deal, Note, Activity } from '@/lib/types';

export async function getContacts(search?: string, page = 1, limit = 20) {
  const supabase = await getSupabaseServerClient();

  let query = supabase.from('contacts').select('*', { count: 'exact' }).order('name');

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`,
    );
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { contacts: data as Contact[], total: count ?? 0, page, limit };
}

export async function getContactById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function getContactWithDetails(id: string) {
  const supabase = await getSupabaseServerClient();

  const [contactRes, dealsRes, notesRes, activitiesRes] =
    await Promise.all([
      supabase.from('contacts').select('*').eq('id', id).single(),
      supabase
        .from('deals')
        .select('*, stage:pipeline_stages(name, color)')
        .eq('contact_id', id),
      supabase
        .from('notes')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('*')
        .eq('contact_id', id)
        .order('created_at', { ascending: false }),
    ]);

  if (contactRes.error) throw contactRes.error;

  return {
    contact: contactRes.data as Contact,
    deals: (dealsRes.data ?? []) as Deal[],
    notes: (notesRes.data ?? []) as Note[],
    activities: (activitiesRes.data ?? []) as Activity[],
  };
}
