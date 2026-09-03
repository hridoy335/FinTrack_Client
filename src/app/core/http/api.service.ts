import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult } from '../api.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(path: string): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`)
      .pipe(map((r) => this.unwrap(r)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => this.unwrap(r)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => this.unwrap(r)));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${path}`)
      .pipe(map((r) => this.unwrap(r)));
  }

  getPaged<T>(path: string): Observable<PagedResult<T>> {
    return this.http.get<ApiResponse<T>>(`${this.base}${path}`).pipe(
      map((r) => {
        if (!r.success) {
          throw new Error(r.message || 'Request failed.');
        }
        return {
          data: r.data,
          meta: r.meta ?? { totalData: 0, totalPage: 0 }
        };
      })
    );
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Request failed.');
    }
    return response.data;
  }
}
