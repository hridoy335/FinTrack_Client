import { Coa, TransactionType } from './transaction.model';

export const ACCOUNT_TYPE = {
  asset: 1,
  liability: 2,
  equity: 3,
  income: 4,
  expense: 5
};

export const TRANSACTION_TYPE = {
  income: 1,
  expense: 2,
  transfer: 3,
  loanBorrow: 5,
  loanRepay: 6
};

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

export function selectableCoas(coas: Coa[], accountTypeId: number): Coa[] {
  return coas
    .filter((c) => c.isActive && c.accountTypeId === accountTypeId && c.parentId != null)
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

export function coaLabel(coa: Coa): string {
  return `${coa.accountName} (${coa.accountCode})`;
}

export function findTransactionType(types: TransactionType[], code: string): TransactionType | undefined {
  return types.find((t) => t.code === code);
}
