export function isoDate(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

export function formatReportDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function sectionBadgeClass(code: string): string {
  switch (code) {
    case 'ASSET':
      return 'report-badge report-badge--asset';
    case 'LIABILITY':
      return 'report-badge report-badge--liability';
    case 'EQUITY':
      return 'report-badge report-badge--equity';
    default:
      return 'report-badge';
  }
}

export function barWidth(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(4, Math.round((value / max) * 100));
}
