'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient, getUser } from '@/lib/supabase-server';

export async function seedDemoData() {
  const supabase = await getSupabaseServerClient();
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const userId = user.id;

  // 1. Pipeline stages
  const stageRows = [
    { name: 'Lead', color: '#6B7280', position: 1, user_id: userId },
    { name: 'Qualified', color: '#3B82F6', position: 2, user_id: userId },
    { name: 'Proposal', color: '#F59E0B', position: 3, user_id: userId },
    { name: 'Negotiation', color: '#8B5CF6', position: 4, user_id: userId },
    { name: 'Won', color: '#10B981', position: 5, user_id: userId },
    { name: 'Lost', color: '#EF4444', position: 6, user_id: userId },
  ];

  const { data: stages, error: stagesErr } = await supabase
    .from('pipeline_stages')
    .insert(stageRows)
    .select('id, name');

  if (stagesErr) throw stagesErr;

  const stageMap = Object.fromEntries(
    (stages ?? []).map((s) => [s.name, s.id]),
  );

  // 2. Contacts
  const contactRows = [
    {
      name: 'Anna Schneider',
      email: 'anna.schneider@techwerk.de',
      company: 'TechWerk GmbH',
      phone: '+49 30 1234567',
      position: 'Geschaeftsfuehrerin',
      user_id: userId,
    },
    {
      name: 'Markus Weber',
      email: 'markus.weber@bauhaus-digital.de',
      company: 'Bauhaus Digital AG',
      phone: '+49 89 9876543',
      position: 'CTO',
      user_id: userId,
    },
    {
      name: 'Sophie Mueller',
      email: 'sophie.mueller@gruenenergie.de',
      company: 'GruenEnergie Solutions',
      phone: '+49 40 5551234',
      position: 'Head of Procurement',
      user_id: userId,
    },
    {
      name: 'Thomas Braun',
      email: 'thomas.braun@finanzpro.de',
      company: 'FinanzPro Beratung',
      phone: '+49 69 4445678',
      position: 'Managing Director',
      user_id: userId,
    },
    {
      name: 'Laura Fischer',
      email: 'laura.fischer@medtec.de',
      company: 'MedTec Innovations',
      phone: '+49 711 3332222',
      position: 'VP Engineering',
      user_id: userId,
    },
  ];

  const { data: contacts, error: contactsErr } = await supabase
    .from('contacts')
    .insert(contactRows)
    .select('id, name');

  if (contactsErr) throw contactsErr;

  const contactMap = Object.fromEntries(
    (contacts ?? []).map((c) => [c.name, c.id]),
  );

  // 3. Deals
  const dealRows = [
    {
      title: 'TechWerk Cloud Migration',
      value: 85000,
      contact_id: contactMap['Anna Schneider'],
      stage_id: stageMap['Proposal'],
      expected_close: '2026-06-15',
      description: 'Full cloud migration project for TechWerk infrastructure',
      user_id: userId,
    },
    {
      title: 'Bauhaus Digital Platform Relaunch',
      value: 120000,
      contact_id: contactMap['Markus Weber'],
      stage_id: stageMap['Negotiation'],
      expected_close: '2026-05-30',
      description: 'Complete redesign and relaunch of digital platform',
      user_id: userId,
    },
    {
      title: 'GruenEnergie Dashboard',
      value: 45000,
      contact_id: contactMap['Sophie Mueller'],
      stage_id: stageMap['Qualified'],
      expected_close: '2026-07-01',
      description: 'Real-time energy monitoring dashboard',
      user_id: userId,
    },
    {
      title: 'MedTec Data Integration',
      value: 67000,
      contact_id: contactMap['Laura Fischer'],
      stage_id: stageMap['Lead'],
      expected_close: '2026-08-15',
      description: 'Integration of medical device data into central system',
      user_id: userId,
    },
  ];

  const { data: deals, error: dealsErr } = await supabase
    .from('deals')
    .insert(dealRows)
    .select('id, title');

  if (dealsErr) throw dealsErr;

  const dealMap = Object.fromEntries(
    (deals ?? []).map((d) => [d.title, d.id]),
  );

  // 4. Activities
  const activityRows = [
    {
      type: 'call' as const,
      description: 'Initial discovery call with Anna about cloud requirements',
      contact_id: contactMap['Anna Schneider'],
      deal_id: dealMap['TechWerk Cloud Migration'],
      user_id: userId,
    },
    {
      type: 'email' as const,
      description: 'Sent proposal document to Markus',
      contact_id: contactMap['Markus Weber'],
      deal_id: dealMap['Bauhaus Digital Platform Relaunch'],
      user_id: userId,
    },
    {
      type: 'meeting' as const,
      description: 'On-site workshop with GruenEnergie team',
      contact_id: contactMap['Sophie Mueller'],
      deal_id: dealMap['GruenEnergie Dashboard'],
      user_id: userId,
    },
    {
      type: 'task' as const,
      description: 'Prepare technical specification for MedTec integration',
      contact_id: contactMap['Laura Fischer'],
      deal_id: dealMap['MedTec Data Integration'],
      user_id: userId,
    },
    {
      type: 'call' as const,
      description: 'Follow-up call with Thomas about consulting needs',
      contact_id: contactMap['Thomas Braun'],
      user_id: userId,
    },
    {
      type: 'email' as const,
      description: 'Sent pricing update to Anna',
      contact_id: contactMap['Anna Schneider'],
      deal_id: dealMap['TechWerk Cloud Migration'],
      user_id: userId,
    },
  ];

  const { error: activitiesErr } = await supabase
    .from('activities')
    .insert(activityRows);

  if (activitiesErr) throw activitiesErr;

  // 5. Notes
  const noteRows = [
    {
      content:
        'Anna mentioned they want to migrate by Q3. Budget approved by board.',
      contact_id: contactMap['Anna Schneider'],
      deal_id: dealMap['TechWerk Cloud Migration'],
      user_id: userId,
    },
    {
      content:
        'Markus prefers a phased rollout. First phase: customer-facing portal.',
      contact_id: contactMap['Markus Weber'],
      deal_id: dealMap['Bauhaus Digital Platform Relaunch'],
      user_id: userId,
    },
    {
      content:
        'Sophie is evaluating two other vendors. Key differentiator: real-time data.',
      contact_id: contactMap['Sophie Mueller'],
      deal_id: dealMap['GruenEnergie Dashboard'],
      user_id: userId,
    },
  ];

  const { error: notesErr } = await supabase.from('notes').insert(noteRows);
  if (notesErr) throw notesErr;

  revalidatePath('/dashboard');
}
