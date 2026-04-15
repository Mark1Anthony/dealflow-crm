'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';
import { stageSchema } from '@/lib/validation';

export async function createStage(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = stageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Get max position
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('position')
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = stages?.[0]?.position ?? 0;

  const { error } = await supabase.from('pipeline_stages').insert({
    name: parsed.data.name,
    color: parsed.data.color || null,
    position: maxPosition + 1,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath('/settings');
}

export async function updateStage(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = stageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('pipeline_stages')
    .update({
      name: parsed.data.name,
      color: parsed.data.color || null,
    })
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/settings');
}

export async function deleteStage(id: string) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if any deals use this stage
  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', id);

  if (count && count > 0) {
    return { error: 'Cannot delete stage with active deals' };
  }

  const { error } = await supabase
    .from('pipeline_stages')
    .delete()
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/settings');
}

export async function reorderStages(stageIds: string[]) {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Update each stage's position based on its index in the array
  const updates = stageIds.map((id, index) =>
    supabase
      .from('pipeline_stages')
      .update({ position: index + 1 })
      .eq('id', id),
  );

  await Promise.all(updates);

  revalidatePath('/settings');
}
