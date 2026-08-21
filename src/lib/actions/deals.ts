'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';
import { dealSchema } from '@/lib/validation';

export async function createDeal(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = dealSchema.safeParse({
    ...raw,
    value: raw.value ? Number(raw.value) : undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('deals').insert({
    title: parsed.data.title,
    value: parsed.data.value ?? null,
    contact_id: parsed.data.contact_id || null,
    stage_id: parsed.data.stage_id,
    expected_close: parsed.data.expected_close || null,
    description: parsed.data.description || null,
    user_id: user.id,
  });

  if (error) throw error;

  redirect('/deals');
}

export async function updateDeal(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = dealSchema.safeParse({
    ...raw,
    value: raw.value ? Number(raw.value) : undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('deals')
    .update({
      title: parsed.data.title,
      value: parsed.data.value ?? null,
      contact_id: parsed.data.contact_id || null,
      stage_id: parsed.data.stage_id,
      expected_close: parsed.data.expected_close || null,
      description: parsed.data.description || null,
    })
    .eq('id', id);

  if (error) throw error;

  revalidatePath(`/deals/${id}`);
}

export async function deleteDeal(id: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) throw error;

  redirect('/deals');
}

export async function moveDealToStage(dealId: string, stageId: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deals')
    .update({ stage_id: stageId })
    .eq('id', dealId)
    .select('id');

  if (error) throw error;
  // An update that matches no row is not an error for Supabase. Without this
  // check the optimistic move in KanbanBoard would never be rolled back.
  if (!data || data.length === 0) throw new Error('Deal not found');

  revalidatePath('/deals');
}
