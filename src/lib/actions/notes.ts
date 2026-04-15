'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';
import { noteSchema } from '@/lib/validation';

export async function createNote(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const contactId = parsed.data.contact_id || null;
  const dealId = parsed.data.deal_id || null;

  const { error } = await supabase.from('notes').insert({
    content: parsed.data.content,
    contact_id: contactId,
    deal_id: dealId,
    user_id: user.id,
  });

  if (error) throw error;

  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
}

export async function deleteNote(id: string, returnPath: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;

  revalidatePath(returnPath);
}
