import { format, parseISO, differenceInDays, isToday, isBefore, startOfDay } from 'date-fns';

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
    const days = differenceInDays(startOfDay(new Date()), startOfDay(parseISO(dischargeIso)));
    return Number.isNaN(days) ? 0 : Math.max(0, days);
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
