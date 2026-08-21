import { describe, it, expect } from 'vitest';
import { contactSchema, dealSchema, noteSchema, activitySchema, stageSchema } from '../validation';

describe('contactSchema', () => {
  it('accepts valid contact with all fields', () => {
    const result = contactSchema.safeParse({
      name: 'Anna Schmidt',
      email: 'anna@test.de',
      phone: '+49 123 456',
      company: 'Schmidt GmbH',
      position: 'CEO',
    });
    expect(result.success).toBe(true);
  });

  it('accepts contact with only name', () => {
    const result = contactSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
  });

  it('rejects contact without name', () => {
    const result = contactSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = contactSchema.safeParse({ name: 'Test', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('accepts empty email string (treated as no email)', () => {
    const result = contactSchema.safeParse({ name: 'Test', email: '' });
    expect(result.success).toBe(true);
  });

  it('accepts contact with optional notes field', () => {
    const result = contactSchema.safeParse({ name: 'Test', notes: 'Some notes' });
    expect(result.success).toBe(true);
  });
});

describe('dealSchema', () => {
  it('accepts valid deal with all fields', () => {
    const result = dealSchema.safeParse({
      title: 'Big Deal',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      value: 5000,
      contact_id: '550e8400-e29b-41d4-a716-446655440001',
      expected_close: '2026-06-01',
      description: 'A big deal',
    });
    expect(result.success).toBe(true);
  });

  it('accepts deal with only required fields', () => {
    const result = dealSchema.safeParse({
      title: 'Test Deal',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects deal without title', () => {
    const result = dealSchema.safeParse({ stage_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });

  it('rejects deal without stage_id', () => {
    const result = dealSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects deal with non-UUID stage_id', () => {
    const result = dealSchema.safeParse({ title: 'Test', stage_id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects deal with negative value', () => {
    const result = dealSchema.safeParse({
      title: 'Test',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      value: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects deal with string value (expects number)', () => {
    const result = dealSchema.safeParse({
      title: 'Test',
      stage_id: '550e8400-e29b-41d4-a716-446655440000',
      value: '5000',
    });
    expect(result.success).toBe(false);
  });
});

describe('noteSchema', () => {
  it('accepts note with content only', () => {
    const result = noteSchema.safeParse({ content: 'Test note' });
    expect(result.success).toBe(true);
  });

  it('accepts note with content and contact_id', () => {
    const result = noteSchema.safeParse({
      content: 'Test note',
      contact_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts note with content and deal_id', () => {
    const result = noteSchema.safeParse({
      content: 'Test note',
      deal_id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects note without content', () => {
    const result = noteSchema.safeParse({ contact_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });

  it('rejects note with empty content', () => {
    const result = noteSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });
});

describe('activitySchema', () => {
  it('accepts valid activity', () => {
    const result = activitySchema.safeParse({ type: 'call', description: 'Called client' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid activity type', () => {
    const result = activitySchema.safeParse({ type: 'invalid', description: 'test' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid types', () => {
    for (const type of ['call', 'email', 'meeting', 'task']) {
      const result = activitySchema.safeParse({ type, description: 'test' });
      expect(result.success).toBe(true);
    }
  });

  it('rejects activity without description', () => {
    const result = activitySchema.safeParse({ type: 'call' });
    expect(result.success).toBe(false);
  });

  it('rejects activity with empty description', () => {
    const result = activitySchema.safeParse({ type: 'call', description: '' });
    expect(result.success).toBe(false);
  });
});

describe('stageSchema', () => {
  it('accepts valid stage', () => {
    const result = stageSchema.safeParse({ name: 'Lead', position: 0, color: '#22d3ee' });
    expect(result.success).toBe(true);
  });

  it('accepts stage without color', () => {
    const result = stageSchema.safeParse({ name: 'Lead', position: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects stage without name', () => {
    const result = stageSchema.safeParse({ position: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects stage without position', () => {
    const result = stageSchema.safeParse({ name: 'Lead' });
    expect(result.success).toBe(false);
  });

  it('rejects stage with string position (expects number)', () => {
    const result = stageSchema.safeParse({ name: 'Lead', position: '0' });
    expect(result.success).toBe(false);
  });
});

