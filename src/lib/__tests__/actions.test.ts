import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Server-action tests against a hand-rolled Supabase stub. The stub is a
 * chainable thenable: every builder method returns itself and awaiting it
 * resolves to whatever `state.results[table]` holds.
 */
const h = vi.hoisted(() => {
  type Result = { data?: unknown; error?: unknown; count?: number | null };
  type Credentials = { email: string; password: string };

  const state = {
    user: null as null | { id: string },
    results: {} as Record<string, Result>,
    calls: [] as { table: string; op: string; payload?: unknown }[],
    signIn: { error: null as null | { message: string } },
    signUp: { error: null as null | { message: string } },
  };

  const resultFor = (table: string): Result =>
    state.results[table] ?? { data: null, error: null, count: 0 };

  function query(table: string) {
    const q: Record<string, unknown> = {};
    const self = () => q;

    Object.assign(q, {
      select: self,
      eq: self,
      in: self,
      order: self,
      limit: self,
      range: self,
      or: self,
      insert: (payload: unknown) => {
        state.calls.push({ table, op: 'insert', payload });
        return q;
      },
      update: (payload: unknown) => {
        state.calls.push({ table, op: 'update', payload });
        return q;
      },
      delete: () => {
        state.calls.push({ table, op: 'delete' });
        return q;
      },
      single: () => Promise.resolve(resultFor(table)),
      then: (res: unknown, rej: unknown) =>
        Promise.resolve(resultFor(table)).then(
          res as (v: Result) => unknown,
          rej as (e: unknown) => unknown,
        ),
    });

    return q;
  }

  const client = {
    from: (table: string) => query(table),
    auth: {
      // Parameters are declared so mock.calls stays typed - vi.fn(async () => ...)
      // would infer an empty tuple and make calls[0][0] undefined.
      signInWithPassword: vi.fn(async (_credentials: Credentials) => ({
        error: state.signIn.error,
      })),
      signUp: vi.fn(async (_credentials: Credentials) => ({
        error: state.signUp.error,
      })),
    },
  };

  return { state, client };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error('NEXT_REDIRECT:' + path);
  },
}));

vi.mock('@/lib/supabase-server', () => ({
  getUser: async () => h.state.user,
  getSupabaseServerClient: async () => h.client,
}));

import * as contacts from '@/lib/actions/contacts';
import * as deals from '@/lib/actions/deals';
import * as notes from '@/lib/actions/notes';
import * as activities from '@/lib/actions/activities';
import * as pipeline from '@/lib/actions/pipeline';
import * as seed from '@/lib/actions/seed';
import { signInAsDemoUser } from '@/lib/actions/demo';

const UUID_A = '11111111-1111-4111-8111-111111111111';
const UUID_B = '22222222-2222-4222-8222-222222222222';

function fd(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(entries)) form.set(k, v);
  return form;
}

const validContact = () => fd({ name: 'Anna Schneider', email: 'anna@techwerk.de' });
const validDeal = () => fd({ title: 'Cloud Migration', stage_id: UUID_A });
const validNote = () => fd({ content: 'Called about pricing', contact_id: UUID_B });
const validActivity = () => fd({ type: 'call', description: 'Discovery call' });

beforeEach(() => {
  h.state.user = null;
  h.state.results = {};
  h.state.calls = [];
  h.state.signIn.error = null;
  h.state.signUp.error = null;
  h.client.auth.signInWithPassword.mockClear();
  h.client.auth.signUp.mockClear();
});

describe('server actions - unauthenticated access', () => {
  // Every mutating action must refuse to run without a session. RLS would
  // block the write too, but these throws are what the UI reacts to.
  const cases: [string, () => Promise<unknown>][] = [
    ['createContact', () => contacts.createContact(validContact())],
    ['updateContact', () => contacts.updateContact(UUID_A, validContact())],
    ['deleteContact', () => contacts.deleteContact(UUID_A)],
    ['createDeal', () => deals.createDeal(validDeal())],
    ['updateDeal', () => deals.updateDeal(UUID_A, validDeal())],
    ['deleteDeal', () => deals.deleteDeal(UUID_A)],
    ['moveDealToStage', () => deals.moveDealToStage(UUID_A, UUID_B)],
    ['createNote', () => notes.createNote(validNote())],
    ['deleteNote', () => notes.deleteNote(UUID_A, '/contacts/x')],
    ['createActivity', () => activities.createActivity(validActivity())],
    ['completeActivity', () => activities.completeActivity(UUID_A)],
    ['deleteActivity', () => activities.deleteActivity(UUID_A)],
    ['deleteStage', () => pipeline.deleteStage(UUID_A)],
    ['reorderStages', () => pipeline.reorderStages([UUID_A, UUID_B])],
    ['seedDemoData', () => seed.seedDemoData()],
  ];

  it.each(cases)('%s throws "Not authenticated"', async (_name, run) => {
    await expect(run()).rejects.toThrow('Not authenticated');
  });

  it('no write reached the database', async () => {
    for (const [, run] of cases) {
      await run().catch(() => {});
    }
    expect(h.state.calls).toEqual([]);
  });
});

describe('contacts actions', () => {
  it('rejects an empty name before touching the database', async () => {
    h.state.user = { id: 'u1' };
    const result = await contacts.createContact(fd({ name: '' }));

    expect(result).toEqual({ error: { name: ['Name is required'] } });
    expect(h.state.calls).toEqual([]);
  });

  it('rejects an invalid email', async () => {
    h.state.user = { id: 'u1' };
    const result = await contacts.createContact(fd({ name: 'Anna', email: 'not-an-email' }));

    expect(result).toEqual({ error: { email: ['Invalid email'] } });
  });

  it('inserts the contact with the current user id and redirects', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.contacts = { data: { id: 'c1' }, error: null };

    await expect(contacts.createContact(validContact())).rejects.toThrow(
      'NEXT_REDIRECT:/contacts/c1',
    );

    expect(h.state.calls).toHaveLength(1);
    expect(h.state.calls[0]).toMatchObject({ table: 'contacts', op: 'insert' });
    expect(h.state.calls[0].payload).toMatchObject({
      name: 'Anna Schneider',
      email: 'anna@techwerk.de',
      user_id: 'u1',
      phone: null,
    });
  });
});

describe('deals actions', () => {
  it('requires a valid stage id', async () => {
    h.state.user = { id: 'u1' };
    const result = await deals.createDeal(fd({ title: 'Deal', stage_id: 'not-a-uuid' }));

    expect(result).toEqual({ error: { stage_id: ['Stage is required'] } });
  });

  it('moveDealToStage throws when no row was updated', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.deals = { data: [], error: null };

    await expect(deals.moveDealToStage(UUID_A, UUID_B)).rejects.toThrow('Deal not found');
  });

  it('moveDealToStage succeeds when a row was updated', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.deals = { data: [{ id: UUID_A }], error: null };

    await expect(deals.moveDealToStage(UUID_A, UUID_B)).resolves.toBeUndefined();
    expect(h.state.calls[0]).toMatchObject({
      table: 'deals',
      op: 'update',
      payload: { stage_id: UUID_B },
    });
  });
});

describe('pipeline actions', () => {
  it('refuses to delete a stage that still holds deals', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.deals = { data: null, error: null, count: 3 };

    const result = await pipeline.deleteStage(UUID_A);

    expect(result).toEqual({ error: 'Cannot delete stage with active deals' });
    expect(h.state.calls.some((c) => c.op === 'delete')).toBe(false);
  });

  it('deletes a stage that holds no deals', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.deals = { data: null, error: null, count: 0 };
    h.state.results.pipeline_stages = { data: null, error: null };

    await expect(pipeline.deleteStage(UUID_A)).resolves.toBeUndefined();
    expect(h.state.calls).toContainEqual({ table: 'pipeline_stages', op: 'delete' });
  });

  it('createStage accepts the string position that StageEditor sends', async () => {
    h.state.user = { id: 'u1' };
    h.state.results.pipeline_stages = { data: [{ position: 2 }], error: null };

    // StageEditor builds this FormData; every FormData value is a string.
    const result = await pipeline.createStage(
      fd({ name: 'Negotiation', position: '2', color: '#8B5CF6' }),
    );

    expect(result).toBeUndefined();
    expect(h.state.calls).toContainEqual({
      table: 'pipeline_stages',
      op: 'insert',
      payload: { name: 'Negotiation', color: '#8B5CF6', position: 3, user_id: 'u1' },
    });
  });
});

describe('signInAsDemoUser', () => {
  it('creates a per-visitor account when nothing is configured', async () => {
    delete process.env.DEMO_USER_EMAIL;
    delete process.env.DEMO_USER_PASSWORD;
    h.state.user = { id: 'demo' };
    h.state.results.pipeline_stages = { data: null, error: null, count: 0 };

    expect(await signInAsDemoUser()).toEqual({});
    expect(h.client.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(h.client.auth.signUp).toHaveBeenCalledTimes(1);

    const { email, password } = h.client.auth.signUp.mock.calls[0][0];
    expect(email).toMatch(/^demo-[0-9a-f]{8}@example\.com$/);
    expect(password.length).toBeGreaterThan(20);
  });

  it('gives every visitor their own account', async () => {
    delete process.env.DEMO_USER_EMAIL;
    delete process.env.DEMO_USER_PASSWORD;
    h.state.user = { id: 'demo' };

    await signInAsDemoUser();
    await signInAsDemoUser();

    const [first, second] = h.client.auth.signUp.mock.calls.map((c) => c[0].email);
    expect(first).not.toBe(second);
  });

  it('explains what to do when sign-up is blocked', async () => {
    delete process.env.DEMO_USER_EMAIL;
    delete process.env.DEMO_USER_PASSWORD;
    h.state.signUp.error = { message: 'Email confirmation required' };

    const result = await signInAsDemoUser();

    expect(result.error).toContain('Email confirmation required');
    expect(result.error).toContain('DEMO_USER_EMAIL');
  });

  it('passes the configured credentials through and seeds an empty account', async () => {
    process.env.DEMO_USER_EMAIL = 'demo@example.com';
    process.env.DEMO_USER_PASSWORD = 'demo-password';
    h.state.user = { id: 'demo' };
    h.state.results.pipeline_stages = { data: null, error: null, count: 0 };

    const result = await signInAsDemoUser();

    expect(result).toEqual({});
    expect(h.client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'demo@example.com',
      password: 'demo-password',
    });
    // Account was empty, so the seed ran.
    expect(h.state.calls.some((c) => c.op === 'insert')).toBe(true);
  });

  it('does not seed an account that already has data', async () => {
    process.env.DEMO_USER_EMAIL = 'demo@example.com';
    process.env.DEMO_USER_PASSWORD = 'demo-password';
    h.state.user = { id: 'demo' };
    h.state.results.pipeline_stages = { data: null, error: null, count: 6 };

    await signInAsDemoUser();

    expect(h.state.calls.some((c) => c.op === 'insert')).toBe(false);
  });

  it('surfaces a failed sign-in', async () => {
    process.env.DEMO_USER_EMAIL = 'demo@example.com';
    process.env.DEMO_USER_PASSWORD = 'wrong';
    h.state.signIn.error = { message: 'Invalid login credentials' };

    expect(await signInAsDemoUser()).toEqual({ error: 'Invalid login credentials' });
  });
});
