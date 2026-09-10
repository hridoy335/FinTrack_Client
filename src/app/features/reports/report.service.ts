import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints, apiUrl } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import { FinancialYear } from '../financial-years/financial-year.model';
import { FinancialYearService } from '../financial-years/financial-year.service';
import {
  AccountStatementReport,
  BalanceReport,
  CashflowReport,
  MonthlyCashflowReport
} from './report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);
  private readonly financialYearService = inject(FinancialYearService);

  getFinancialYears(): Observable<FinancialYear[]> {
    return this.financialYearService.getAll();
  }

  getCashflow(params: {
    financialYearId?: number;
    fromDate?: string;
    toDate?: string;
  }): Observable<CashflowReport> {
    return this.api.get<CashflowReport>(apiUrl(ApiEndpoints.reports.cashflow, params));
  }

  getBalance(params: {
    financialYearId?: number;
    asOfDate?: string;
  }): Observable<BalanceReport> {
    return this.api.get<BalanceReport>(apiUrl(ApiEndpoints.reports.balance, params));
  }

  getAccountStatement(params: {
    coaId: number;
    financialYearId?: number;
    fromDate?: string;
    toDate?: string;
  }): Observable<AccountStatementReport> {
    return this.api.get<AccountStatementReport>(
      apiUrl(ApiEndpoints.reports.accountStatement, params)
    );
  }

  getMonthlyCashflow(financialYearId?: number): Observable<MonthlyCashflowReport> {
    return this.api.get<MonthlyCashflowReport>(
      apiUrl(ApiEndpoints.reports.monthlyCashflow, { financialYearId })
    );
  }
}
