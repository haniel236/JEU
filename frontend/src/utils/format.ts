import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy · HH:mm', { locale: fr });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: fr });
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
