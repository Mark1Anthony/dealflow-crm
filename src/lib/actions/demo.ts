'use server';

import { getSupabaseServerClient } from '@/lib/supabase-server';
import { seedDemoData } from '@/lib/actions/seed';

/**
 * Signs in the prepared demo account so the public deployment can be looked
 * at without creating an account. Credentials come from the environment, not
 * from the code - they are meant to be public, but they differ per deployment.
 *
 * The demo user is an ordinary user: RLS applies to it exactly like to anyone
 * else, so it only ever sees its own rows.
 */
export async function signInAsDemoUser(): Promise<{ error?: string }> {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    return { error: 'Demo access is not configured on this deployment.' };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  // seedDemoData() inserts unconditionally, so only run it while the account
  // is still empty - otherwise every demo login would duplicate the dataset.
  const { count, error: countError } = await supabase
    .from('pipeline_stages')
    .select('id', { count: 'exact', head: true });

  if (!countError && (count ?? 0) === 0) {
    await seedDemoData();
  }

  return {};
}
