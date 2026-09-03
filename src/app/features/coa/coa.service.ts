import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { ApiService } from '../../core/http/api.service';
import {
  AccountType,
  Coa,
  CoaListResponse,
  CreateCoaRequest,
  UpdateCoaRequest
} from './coa.model';

@Injectable({ providedIn: 'root' })
export class CoaService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getAll(): Observable<Coa[]> {
    return this.api.get<Coa[]>(ApiEndpoints.coas.root);
  }

  getList(): Observable<CoaListResponse> {
    return this.api.get<CoaListResponse>(ApiEndpoints.coas.list);
  }

  getAccountTypes(): Observable<AccountType[]> {
    return this.api.get<AccountType[]>(ApiEndpoints.accountTypes);
  }

  downloadPdf(): Observable<Blob> {
    return this.http.get(`${this.base}${ApiEndpoints.coas.exportPdf}`, {
      responseType: 'blob'
    });
  }

  create(body: CreateCoaRequest): Observable<{ id: number; accountCode?: string }> {
    return this.api.post<{ id: number; accountCode?: string }>(ApiEndpoints.coas.root, body);
  }

  update(id: number, body: UpdateCoaRequest): Observable<{ id: number }> {
    return this.api.put<{ id: number }>(ApiEndpoints.coas.byId(id), body);
  }

  delete(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(ApiEndpoints.coas.byId(id));
  }
}
