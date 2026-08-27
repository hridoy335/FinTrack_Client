import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../http/api.service';
import { AuthTokenData, AuthUser } from '../models';

const ACCESS_KEY = 'ft_access';
const REFRESH_KEY = 'ft_refresh';
const USER_KEY = 'ft_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly accessToken = signal<string | null>(sessionStorage.getItem(ACCESS_KEY));
  readonly user = signal<AuthUser | null>(readUser());
  readonly isLoggedIn = computed(() => !!this.accessToken() && !!this.user());

  register(body: {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string | null;
    currencyCode: string;
  }): Observable<{ id: number }> {
    return this.api.post<{ id: number }>('/api/UserInfos', body);
  }

  login(userNameOrEmail: string, password: string): Observable<AuthTokenData> {
    return this.api
      .post<AuthTokenData>('/api/Auths/login', { userNameOrEmail, password })
      .pipe(tap((data) => this.persist(data)));
  }

  refresh(): Observable<AuthTokenData> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    return this.api
      .post<AuthTokenData>('/api/Auths/refresh', { refreshToken })
      .pipe(tap((data) => this.persist(data)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    this.clear();

    if (refreshToken) {
      this.api.post<unknown>('/api/Auths/logout', { refreshToken }).subscribe({
        error: () => undefined
      });
    }

    void this.router.navigateByUrl('/');
  }

  private persist(data: AuthTokenData): void {
    sessionStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.accessToken.set(data.accessToken);
    this.user.set(data.user);
  }

  private clear(): void {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.accessToken.set(null);
    this.user.set(null);
  }
}

function readUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
