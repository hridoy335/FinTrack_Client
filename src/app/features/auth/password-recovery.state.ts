import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryState {
  readonly email = signal('');
  readonly code = signal('');
  readonly infoMessage = signal<string | null>(null);
  readonly expiresInMinutes = signal(5);
  readonly codeExpiresAt = signal<number | null>(null);

  start(email: string, message: string, expiresInMinutes = 5): void {
    this.email.set(email.trim().toLowerCase());
    this.code.set('');
    this.infoMessage.set(message);
    this.expiresInMinutes.set(expiresInMinutes > 0 ? expiresInMinutes : 5);
    this.restartCodeTimer(this.expiresInMinutes());
  }

  setVerifiedCode(code: string): void {
    this.code.set(code.trim());
  }

  restartCodeTimer(expiresInMinutes = this.expiresInMinutes()): void {
    const minutes = expiresInMinutes > 0 ? expiresInMinutes : 5;
    this.expiresInMinutes.set(minutes);
    this.codeExpiresAt.set(Date.now() + minutes * 60_000);
  }

  clear(): void {
    this.email.set('');
    this.code.set('');
    this.infoMessage.set(null);
    this.expiresInMinutes.set(5);
    this.codeExpiresAt.set(null);
  }

  hasEmail(): boolean {
    return this.email().trim().length > 0;
  }

  hasVerifiedCode(): boolean {
    return this.hasEmail() && /^\d{6}$/.test(this.code());
  }
}
