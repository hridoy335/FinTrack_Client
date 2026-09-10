import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiEndpoints } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import {
  FinancialYearDetail,
  FinancialYearListItem,
  UpdateFinancialYearRequest
} from './financial-year.model';

@Injectable({ providedIn: 'root' })
export class FinancialYearService {
  private readonly api = inject(ApiService);

  getAll(): Observable<FinancialYearListItem[]> {
    return this.api.get<FinancialYearListItem[]>(ApiEndpoints.financialYears.root);
  }

  getById(id: number): Observable<FinancialYearDetail> {
    return this.api.get<FinancialYearDetail>(ApiEndpoints.financialYears.byId(id));
  }

  createNext(): Observable<{ data: { id: number }; message: string }> {
    return this.api.postWithMessage<{ id: number }>(ApiEndpoints.financialYears.next);
  }

  update(
    id: number,
    body: UpdateFinancialYearRequest
  ): Observable<{ data: { id: number }; message: string }> {
    return this.api.putWithMessage<{ id: number }>(ApiEndpoints.financialYears.byId(id), body);
  }
}
