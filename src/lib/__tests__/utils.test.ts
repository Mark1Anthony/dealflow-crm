import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatRelativeTime, formErrorMessages } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toBe('base extra');
  });
});

describe('formatCurrency', () => {
  it('formats cents to EUR with de-DE locale', () => {
    const result = formatCurrency(12345);
    // de-DE locale: "123,45 €" (with non-breaking space)
    expect(result).toContain('123');
    expect(result).toContain('45');
    expect(result).toContain('€');
  });

  it('handles zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('handles large values', () => {
    const result = formatCurrency(10000000);
    // 10000000 cents = 100,000.00 EUR
    expect(result).toContain('100');
    expect(result).toContain('€');
  });
});

describe('formatDate', () => {
  it('formats ISO date string to en-GB format', () => {
    const result = formatDate('2026-04-15');
    // en-GB with day/short-month/year: "15 Apr 2026"
    expect(result).toContain('Apr');
    expect(result).toContain('2026');
  });

  it('formats another date correctly', () => {
    const result = formatDate('2025-12-25');
    expect(result).toContain('Dec');
    expect(result).toContain('2025');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5 minutes ago');
  });

  it('returns singular minute', () => {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    expect(formatRelativeTime(oneMinAgo)).toBe('1 minute ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
  });
});

describe('formatCurrency - edge cases', () => {
  it('formats negative amounts with a minus sign', () => {
    const result = formatCurrency(-12345);
    expect(result).toContain('123');
    expect(result).toContain('€');
    expect(result.replace(/−/, '-')).toContain('-');
  });

  it('rounds sub-cent input to two decimals', () => {
    expect(formatCurrency(1)).toContain('0');
    expect(formatCurrency(1)).toContain('01');
  });
});

describe('formatDate - edge cases', () => {
  it('returns a dash for an unparsable string instead of "Invalid Date"', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('returns a dash for an empty string', () => {
    expect(formatDate('')).toBe('—');
  });

  it('still formats a full ISO timestamp', () => {
    const result = formatDate('2026-04-15T13:45:00.000Z');
    expect(result).toContain('Apr');
    expect(result).toContain('2026');
  });
});

describe('formatRelativeTime - edge cases', () => {
  it('returns a dash for an unparsable string instead of "NaN years ago"', () => {
    expect(formatRelativeTime('garbage')).toBe('—');
  });

  it('returns a dash for an empty string', () => {
    expect(formatRelativeTime('')).toBe('—');
  });

  it('returns singular forms at the unit boundaries', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });

  it('returns months and years for older dates', () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    expect(formatRelativeTime(twoYearsAgo)).toBe('2 years ago');
  });

  // Known behaviour: a future timestamp produces a negative delta, which falls
  // into the "< 60 seconds" branch. Documented rather than changed - the app
  // only ever formats created_at, which is always in the past.
  it('reports future timestamps as "just now"', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(tomorrow)).toBe('just now');
  });
});

describe('formErrorMessages', () => {
  it('returns nothing for the initial null state', () => {
    expect(formErrorMessages(null)).toEqual([]);
    expect(formErrorMessages(undefined)).toEqual([]);
  });

  it('returns nothing when the action succeeded', () => {
    expect(formErrorMessages({})).toEqual([]);
  });

  it('flattens Zod fieldErrors into one message per entry', () => {
    const state = { error: { name: ['Name is required'], email: ['Invalid email'] } };
    expect(formErrorMessages(state)).toEqual(['Name is required', 'Invalid email']);
  });

  it('keeps multiple messages for the same field', () => {
    const state = { error: { value: ['Must be a number', 'Value must be positive'] } };
    expect(formErrorMessages(state)).toEqual(['Must be a number', 'Value must be positive']);
  });

  it('accepts a plain string error', () => {
    expect(formErrorMessages({ error: 'Not authenticated' })).toEqual(['Not authenticated']);
  });
});
