export interface FinancialYear {
  id: number;
  userInfoId: number;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface TransactionType {
  id: number;
  code: string;
  name: string;
}

export interface TransactionListItem {
  id: number;
  financialYearId: number;
  transactionTypeId: number;
  transactionType?: TransactionType;
  transactionDate: string;
  amount: number;
  description?: string | null;
}

export interface AccountType {
  id: number;
  code: string;
  name: string;
  normalBalance: string;
}

export interface Coa {
  id: number;
  userInfoId: number;
  parentId?: number | null;
  accountTypeId: number;
  accountType?: AccountType;
  accountCode: string;
  accountName: string;
  isSystemDefault: boolean;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface CreateTransactionRequest {
  transactionTypeId: number;
  financialYearId: number;
  transactionDate: string;
  amount: number;
  description?: string | null;
  debitCoaId: number;
  creditCoaId: number;
}

export interface TransactionListQuery {
  financialYearId: number;
  transactionTypeId?: number | null;
  page: number;
  pageSize: number;
}
