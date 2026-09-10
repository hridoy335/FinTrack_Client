export interface DashboardData {

  financialYearId: number;

  financialYear: number;

  totalBalance: number;

  incomeThisMonth: number;

  expenseThisMonth: number;

  netThisMonth: number;

  accountBalances: AccountBalanceItem[];

  expenseCategoriesThisMonth?: ExpenseCategoryItem[];

}



export interface ExpenseCategoryItem {

  coaId: number;

  accountCode: string;

  accountName: string;

  amount: number;

}



export interface AccountBalanceItem {

  coaId: number;

  accountCode: string;

  accountName: string;

  accountTypeId: number;

  accountTypeCode: string;

  balance: number;

}



export type { FinancialYear } from '../financial-years/financial-year.model';



export interface RecentTransaction {

  id: number;

  financialYearId: number;

  transactionTypeId: number;

  transactionType?: { id: number; code: string; name: string };

  transactionDate: string;

  amount: number;

  description?: string | null;

}

