export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: { totalData: number; totalPage: number } | null;
}

export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface DashboardData {
  financialYearId: number;
  financialYear: number;
  totalBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  netThisMonth: number;
  accountBalances: AccountBalanceItem[];
}

export interface AccountBalanceItem {
  coaId: number;
  accountCode: string;
  accountName: string;
  accountTypeId: number;
  accountTypeCode: string;
  balance: number;
}

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
