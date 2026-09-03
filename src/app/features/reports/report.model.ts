export interface FinancialYear {
  id: number;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

export interface CashflowCategoryItem {
  coaId: number;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface CashflowReport {
  financialYearId: number;
  financialYear: number;
  fromDate: string;
  toDate: string;
  totalInflow: number;
  totalOutflow: number;
  netCashflow: number;
  inflows: CashflowCategoryItem[];
  outflows: CashflowCategoryItem[];
}

export interface AccountBalanceItem {
  coaId: number;
  accountCode: string;
  accountName: string;
  accountTypeId: number;
  accountTypeCode: string;
  balance: number;
}

export interface BalanceSection {
  accountTypeId: number;
  accountTypeCode: string;
  accountTypeName: string;
  subtotal: number;
  accounts: AccountBalanceItem[];
}

export interface BalanceReport {
  financialYearId: number;
  financialYear: number;
  asOfDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netWorth: number;
  sections: BalanceSection[];
}

export interface AccountStatementLine {
  transactionId: number;
  transactionDate: string;
  description?: string | null;
  transactionTypeName: string;
  debit: number;
  credit: number;
  balance: number;
  counterpartyAccountName: string;
}

export interface AccountStatementReport {
  coaId: number;
  accountCode: string;
  accountName: string;
  accountTypeCode: string;
  financialYearId: number;
  financialYear: number;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  closingBalance: number;
  lines: AccountStatementLine[];
}

export interface MonthlyCashflowItem {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyCashflowReport {
  financialYearId: number;
  financialYear: number;
  months: MonthlyCashflowItem[];
  totalIncome: number;
  totalExpense: number;
  totalNet: number;
}

export interface CoaOption {
  id: number;
  accountCode: string;
  accountName: string;
  accountTypeId: number;
  parentId?: number | null;
}
