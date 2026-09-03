export function txIcon(code?: string): string {
  switch (code) {
    case 'INCOME':
      return '💰';
    case 'EXPENSE':
      return '🛒';
    case 'TRANSFER':
      return '⇄';
    case 'LOAN_BORROW':
      return '🏦';
    case 'LOAN_REPAY':
      return '💳';
    default:
      return '•';
  }
}

export function txAmountPrefix(code?: string): string {
  if (code === 'INCOME') return '+';
  if (code === 'EXPENSE') return '−';
  if (code === 'LOAN_BORROW') return '+';
  if (code === 'LOAN_REPAY') return '−';
  return '';
}

export function txRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d0.getTime() - d1.getTime()) / 86400000;

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function currentMonthDateRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { fromDate: toIsoDate(from), toDate: toIsoDate(to) };
}

function toIsoDate(value: Date): string {
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}
