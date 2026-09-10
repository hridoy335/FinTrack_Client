import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiEndpoints, apiUrl } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import { FinancialYear } from '../financial-years/financial-year.model';
import { FinancialYearService } from '../financial-years/financial-year.service';
import { CashflowReport } from '../reports/report.model';
import { DashboardData, ExpenseCategoryItem, RecentTransaction } from './dashboard.model';
import { currentMonthDateRange } from './dashboard.util';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly financialYearService = inject(FinancialYearService);

  getFinancialYears(): Observable<FinancialYear[]> {
    return this.financialYearService.getAll();
  }

  getDashboard(financialYearId?: number | null): Observable<DashboardData> {
    const { fromDate, toDate } = currentMonthDateRange();
    const params = { financialYearId, fromDate, toDate };

    return forkJoin({
      dashboard: this.api.get<DashboardData>(apiUrl(ApiEndpoints.reports.dashboard, params)),
      cashflow: this.api.get<CashflowReport>(apiUrl(ApiEndpoints.reports.cashflow, params))
    }).pipe(
      map(({ dashboard, cashflow }) => ({
        ...dashboard,
        expenseCategoriesThisMonth: resolveExpenseCategories(
          dashboard.expenseCategoriesThisMonth,
          cashflow.outflows
        )
      }))
    );
  }

  getRecentTransactions(financialYearId: number, pageSize = 5): Observable<RecentTransaction[]> {
    return this.api.get<RecentTransaction[]>(
      apiUrl(ApiEndpoints.transactions.root, {
        financialYearId,
        page: 1,
        pageSize
      })
    );
  }
}

function resolveExpenseCategories(
  fromDashboard: ExpenseCategoryItem[] | undefined,
  fromCashflow: ExpenseCategoryItem[] | undefined
): ExpenseCategoryItem[] {
  const dashboardCategories = normalizeExpenseCategories(fromDashboard);
  if (dashboardCategories.length > 0) {
    return dashboardCategories;
  }

  return normalizeExpenseCategories(fromCashflow);
}

function normalizeExpenseCategories(
  items: ExpenseCategoryItem[] | undefined
): ExpenseCategoryItem[] {
  if (!items?.length) {
    return [];
  }

  return items
    .map((item) => ({
      coaId: item.coaId,
      accountCode: item.accountCode,
      accountName: item.accountName,
      amount: Number(item.amount ?? 0)
    }))
    .filter((item) => item.amount > 0);
}
