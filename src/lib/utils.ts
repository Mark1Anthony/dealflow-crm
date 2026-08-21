import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes without conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer (cents) as a Euro currency string.
 * e.g. 123456 → "€1,234.56"
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Shown instead of a date that cannot be parsed. */
const INVALID_DATE = '—';

/**
 * Format an ISO date string to a readable format.
 * e.g. "2026-04-12" → "12 Apr 2026"
 * Unparsable input yields "—" rather than "Invalid Date".
 */
export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return INVALID_DATE;

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an ISO date string as relative time.
 * e.g. "2 hours ago", "3 days ago"
 * Unparsable input yields "—" rather than "NaN years ago".
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return INVALID_DATE;

  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Turn what a form action returns on failure into readable lines.
 *
 * The actions answer `{ error: fieldErrors }` where fieldErrors is the object
 * produced by a failed Zod parse, e.g. `{ name: ['Name is required'] }`.
 * Rendering that with String() yields "[object Object]", so flatten it here.
 */
export function formErrorMessages(state: unknown): string[] {
  if (!state || typeof state !== 'object') return [];

  const fieldErrors = (state as { error?: unknown }).error;
  if (!fieldErrors) return [];
  if (typeof fieldErrors === 'string') return [fieldErrors];
  if (typeof fieldErrors !== 'object') return [String(fieldErrors)];

  return Object.values(fieldErrors as Record<string, unknown>)
    .flatMap((messages) => (Array.isArray(messages) ? messages : messages ? [messages] : []))
    .map((message) => String(message));
}
