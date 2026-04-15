'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';
import { activitySchema } from '@/lib/validation';

export async function createActivity(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const contactId = parsed.data.contact_id || null;
  const dealId = parsed.data.deal_id || null;

  const { error } = await supabase.from('activities').insert({
    type: parsed.data.type,
    description: parsed.data.description,
    contact_id: contactId,
    deal_id: dealId,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath('/activities');
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
}

export async function completeActivity(id: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('activities')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/activities');
}

export async function deleteActivity(id: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;

  revalidatePath('/activities');
}
