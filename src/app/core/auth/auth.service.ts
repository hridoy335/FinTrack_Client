import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../http/api.service';
import { ApiEndpoints } from '../api/api-endpoints';
import {
  AuthTokenData,
  AuthUser,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  PasswordRecoveryMessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyRecoveryCodeRequest
} from '../../features/auth/auth.model';

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
    return this.api.post<{ id: number }>(ApiEndpoints.userInfos.root, {
      ...body,
      email: normalizeEmail(body.email)
    });
  }

  login(email: string, password: string): Observable<AuthTokenData> {
    const body: LoginRequest = {
      email: normalizeEmail(email),
      password
    };

    return this.api
      .post<AuthTokenData>(ApiEndpoints.auth.login, body)
      .pipe(tap((data) => this.persist(data)));
  }

  loginWithGoogle(idToken: string): Observable<AuthTokenData> {
    const body: GoogleLoginRequest = { idToken };
    return this.api
      .post<AuthTokenData>(ApiEndpoints.auth.google, body)
      .pipe(tap((data) => this.persist(data)));
  }

  forgotPassword(email: string): Observable<PasswordRecoveryMessageResponse> {
    const body: ForgotPasswordRequest = { email: normalizeEmail(email) };
    return this.api.post<PasswordRecoveryMessageResponse>(ApiEndpoints.auth.forgotPassword, body);
  }

  verifyRecoveryCode(
    email: string,
    code: string
  ): Observable<PasswordRecoveryMessageResponse> {
    const body: VerifyRecoveryCodeRequest = {
      email: normalizeEmail(email),
      code: code.trim()
    };
    return this.api.post<PasswordRecoveryMessageResponse>(
      ApiEndpoints.auth.verifyRecoveryCode,
      body
    );
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Observable<PasswordRecoveryMessageResponse> {
    const body: ResetPasswordRequest = {
      email: normalizeEmail(email),
      code: code.trim(),
      newPassword
    };
    return this.api.post<PasswordRecoveryMessageResponse>(ApiEndpoints.auth.resetPassword, body);
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
    const user = normalizeAuthUser(data.user);
    sessionStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.accessToken.set(data.accessToken);
    this.user.set(user);
  }

  private clear(): void {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.accessToken.set(null);
    this.user.set(null);
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeAuthUser(user: AuthUser & { userName?: string }): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    currencyCode: user.currencyCode
  };
}

function readUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(raw) as AuthUser & { userName?: string });
  } catch {
    return null;
  }
}
