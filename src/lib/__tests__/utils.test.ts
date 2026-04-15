import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatRelativeTime } from '../utils';

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
