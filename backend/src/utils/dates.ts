export type Period = 'week' | 'month' | 'year';

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(date = new Date()): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // lundi = début de semaine
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth(date = new Date()): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function startOfYear(date = new Date()): Date {
  const d = startOfDay(date);
  d.setMonth(0, 1);
  return d;
}

export function startOfPeriod(period: Period, date = new Date()): Date {
  switch (period) {
    case 'week':
      return startOfWeek(date);
    case 'month':
      return startOfMonth(date);
    case 'year':
      return startOfYear(date);
  }
}
