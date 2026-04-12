/**
 * Date utilities merged from PatientAppPWA + HospitalDashboard.
 * All functions handle invalid input gracefully.
 */

import {
  format,
  parseISO,
  formatDistanceToNow,
  differenceInDays,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns';

// ─── From PatientAppPWA ───────────────────────────────────────────

export function friendlyDate(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return 'Today';
    return format(d, 'MMMM d');
  } catch {
    return '';
  }
}

export function shortTime(iso: string): string {
  try {
    return format(parseISO(iso), 'h:mm a');
  } catch {
    return '';
  }
}

export function fullDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMMM d, yyyy');
  } catch {
    return '';
  }
}

export function daysSinceDischarge(dischargeIso: string): number {
  try {
    return differenceInDays(startOfDay(new Date()), startOfDay(parseISO(dischargeIso)));
  } catch {
    return 0;
  }
}

export function isPastDay(iso: string): boolean {
  try {
    return isBefore(startOfDay(parseISO(iso)), startOfDay(new Date()));
  } catch {
    return false;
  }
}

// ─── From HospitalDashboard ──────────────────────────────────────

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
