'use server';

import { getSupabaseServerClient } from '@/lib/supabase-server';
import { seedDemoData } from '@/lib/actions/seed';

/**
 * Opens the app without anyone having to sign up.
 *
 * Two ways in, tried in order:
 *   1. A prepared account, if DEMO_USER_EMAIL and DEMO_USER_PASSWORD are set.
 *   2. Otherwise a per-visitor account created on the spot, so a deployment
 *      works with no configuration at all.
 *
 * Either way the visitor is an ordinary user: RLS applies exactly as it does
 * to anyone else, so they only ever see their own rows. The per-visitor route
 * means two people trying the demo do not edit each other's data.
 */
export async function signInAsDemoUser(): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();

  const configuredEmail = process.env.DEMO_USER_EMAIL;
  const configuredPassword = process.env.DEMO_USER_PASSWORD;

  if (configuredEmail && configuredPassword) {
    const { error } = await supabase.auth.signInWithPassword({
      email: configuredEmail,
      password: configuredPassword,
    });
    if (error) return { error: error.message };
    return seedIfEmpty();
  }

  // No prepared account: make one for this visitor. The address has to look
  // real enough for Supabase to accept it; example.com is reserved for this.
  const suffix = crypto.randomUUID().slice(0, 8);
  const { error } = await supabase.auth.signUp({
    email: `demo-${suffix}@example.com`,
    password: crypto.randomUUID(),
  });

  if (error) {
    // The usual cause is "Confirm email" being on for the project, which makes
    // a fresh account unusable until someone clicks a link nobody will receive.
    return {
      error:
        `${error.message} - if this deployment has email confirmation enabled, ` +
        `either turn it off or set DEMO_USER_EMAIL and DEMO_USER_PASSWORD.`,
    };
  }

  return seedIfEmpty();
}

/**
 * seedDemoData() inserts unconditionally, so only run it while the account is
 * still empty - otherwise a second visit would duplicate the dataset.
 */
async function seedIfEmpty(): Promise<{ error?: string }> {
  const supabase = await getSupabaseServerClient();

  const { count, error } = await supabase
    .from('pipeline_stages')
    .select('id', { count: 'exact', head: true });

  if (!error && (count ?? 0) === 0) {
    await seedDemoData();
  }

  return {};
}
