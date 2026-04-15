'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';
import { contactSchema } from '@/lib/validation';

export async function createContact(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      notes: parsed.data.notes || null,
      user_id: user.id,
    })
    .select('id')
    .single();

  if (error) throw error;

  redirect(`/contacts/${data.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('contacts')
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id);

  if (error) throw error;

  revalidatePath(`/contacts/${id}`);
}

export async function deleteContact(id: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;

  redirect('/contacts');
}
