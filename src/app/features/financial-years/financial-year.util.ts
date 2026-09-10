import { FinancialYearListItem } from './financial-year.model';

export function formatFinancialYearDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function financialYearStatusLabel(year: FinancialYearListItem): string {
  if (year.isCurrent) return 'Current';
  if (year.isClosed) return 'Closed';
  if (year.isActive) return 'Active';
  if (year.year > new Date().getFullYear()) return 'Upcoming';
  return 'Inactive';
}

export function financialYearStatusClass(year: FinancialYearListItem): string {
  if (year.isCurrent) return 'fy-badge fy-badge--current';
  if (year.isClosed) return 'fy-badge fy-badge--closed';
  if (year.isActive) return 'fy-badge fy-badge--active';
  if (year.year > new Date().getFullYear()) return 'fy-badge fy-badge--upcoming';
  return 'fy-badge';
}

/** Prefer current open year, then active open, then any open, then first. */
export function pickDefaultFinancialYearId(
  years: Array<Pick<FinancialYearListItem, 'id' | 'isCurrent' | 'isActive' | 'isClosed'>>
): number | null {
  const currentOpen = years.find((y) => y.isCurrent && !y.isClosed);
  if (currentOpen) return currentOpen.id;

  const activeOpen = years.find((y) => y.isActive && !y.isClosed);
  if (activeOpen) return activeOpen.id;

  const anyOpen = years.find((y) => !y.isClosed);
  return anyOpen?.id ?? years[0]?.id ?? null;
}
