import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PagedResult } from '../../core/api.model';
import { ApiEndpoints, apiUrl } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import {
  Coa,
  CreateTransactionRequest,
  FinancialYear,
  TransactionListItem,
  TransactionListQuery,
  TransactionType
} from './transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly api = inject(ApiService);

  getFinancialYears(): Observable<FinancialYear[]> {
    return this.api.get<FinancialYear[]>(ApiEndpoints.financialYears);
  }

  getTransactionTypes(): Observable<TransactionType[]> {
    return this.api.get<TransactionType[]>(ApiEndpoints.transactionTypes);
  }

  getCoas(): Observable<Coa[]> {
    return this.api.get<Coa[]>(ApiEndpoints.coas.root);
  }

  getTransactions(query: TransactionListQuery): Observable<PagedResult<TransactionListItem[]>> {
    return this.api.getPaged<TransactionListItem[]>(
      apiUrl(ApiEndpoints.transactions.root, {
        financialYearId: query.financialYearId,
        page: query.page,
        pageSize: query.pageSize,
        transactionTypeId: query.transactionTypeId
      })
    );
  }

  createTransaction(body: CreateTransactionRequest): Observable<{ id: number }> {
    return this.api.post<{ id: number }>(ApiEndpoints.transactions.root, body);
  }
}
