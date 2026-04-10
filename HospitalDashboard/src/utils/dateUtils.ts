import { formatDistanceToNow, format, parseISO } from 'date-fns';

export function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function shortDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function timeStamp(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, h:mm a');
  } catch {
    return '—';
  }
}

export function dayOfProgram(days: number): string {
  if (days <= 0) return 'Day 1 of 30';
  if (days >= 30) return 'Day 30 of 30';
  return `Day ${days} of 30`;
}
