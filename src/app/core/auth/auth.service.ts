import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../http/api.service';
import { ApiEndpoints } from '../api/api-endpoints';
import { AuthTokenData, AuthUser, RegisterRequest } from '../../features/auth/auth.model';

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

  register(body: RegisterRequest): Observable<{ id: number }> {
    return this.api.post<{ id: number }>(ApiEndpoints.userInfos.root, body);
  }

  login(userNameOrEmail: string, password: string): Observable<AuthTokenData> {
    return this.api
      .post<AuthTokenData>(ApiEndpoints.auth.login, { userNameOrEmail, password })
      .pipe(tap((data) => this.persist(data)));
  }

  refresh(): Observable<AuthTokenData> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    return this.api
      .post<AuthTokenData>(ApiEndpoints.auth.refresh, { refreshToken })
      .pipe(tap((data) => this.persist(data)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    this.clear();

    if (refreshToken) {
      this.api.post<unknown>(ApiEndpoints.auth.logout, { refreshToken }).subscribe({
        error: () => undefined
      });
    }

    void this.router.navigateByUrl('/');
  }

  updateSessionUser(user: AuthUser): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
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
