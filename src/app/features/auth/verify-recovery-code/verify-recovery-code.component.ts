import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, interval } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { PasswordRecoveryState } from '../password-recovery.state';

const RESEND_COOLDOWN_SECONDS = 30;

@Component({
  selector: 'app-verify-recovery-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-recovery-code.component.html'
})
export class VerifyRecoveryCodeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly recovery = inject(PasswordRecoveryState);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly resending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(this.recovery.infoMessage());
  protected readonly now = signal(Date.now());
  protected readonly resendAvailableAt = signal(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

  protected readonly email = this.recovery.email;

  protected readonly secondsLeft = computed(() => {
    const expiresAt = this.recovery.codeExpiresAt();
    if (expiresAt == null) {
      return 0;
    }
    return Math.max(0, Math.ceil((expiresAt - this.now()) / 1000));
  });

  protected readonly codeExpired = computed(() => this.secondsLeft() <= 0);

  protected readonly resendSecondsLeft = computed(() =>
    Math.max(0, Math.ceil((this.resendAvailableAt() - this.now()) / 1000))
  );

  protected readonly canResend = computed(
    () => !this.resending() && this.resendSecondsLeft() <= 0
  );

  protected readonly timerLabel = computed(() => formatMmSs(this.secondsLeft()));

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  ngOnInit(): void {
    if (!this.recovery.hasEmail()) {
      void this.router.navigateByUrl('/auth/forgot-password');
      return;
    }

    if (this.recovery.codeExpiresAt() == null) {
      this.recovery.restartCodeTimer();
    }

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));
  }

  verify(): void {
    if (this.submitting() || this.codeExpired()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const code = this.form.controls.code.value.trim();
    const email = this.recovery.email();

    this.auth
      .verifyRecoveryCode(email, code)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.recovery.setVerifiedCode(code);
          this.recovery.infoMessage.set(result.message);
          void this.router.navigateByUrl('/auth/reset-password');
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  resend(): void {
    if (!this.canResend()) {
      return;
    }

    this.resending.set(true);
    this.errorMessage.set(null);

    this.auth
      .forgotPassword(this.recovery.email())
      .pipe(finalize(() => this.resending.set(false)))
      .subscribe({
        next: (result) => {
          this.successMessage.set(result.message);
          this.recovery.infoMessage.set(result.message);
          this.recovery.restartCodeTimer(result.expiresInMinutes);
          this.resendAvailableAt.set(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
          this.form.controls.code.setValue('');
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }
}

function formatMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
