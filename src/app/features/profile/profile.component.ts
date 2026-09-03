import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { finalize, throwError } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    currencyCode: ['BDT', Validators.required]
  });

  protected readonly profileResource = rxResource({
    params: () => ({ userId: this.auth.user()?.id ?? null }),
    stream: ({ params }) => {
      if (params.userId == null) {
        return throwError(() => new Error('Not signed in.'));
      }
      return this.profileService.getByUserId(params.userId);
    }
  });

  protected readonly profile = computed(() => this.profileResource.value());
  protected readonly loading = computed(() => this.profileResource.isLoading());
  protected readonly loadError = computed(() => {
    const err = this.profileResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  constructor() {
    effect(() => {
      const p = this.profile();
      if (!p) return;
      this.form.patchValue({
        firstName: p.firstName,
        lastName: p.lastName ?? '',
        email: p.email,
        currencyCode: p.currencyCode
      });
    });
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const p = this.profile();
    if (!p) return;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const v = this.form.getRawValue();

    this.profileService
      .update(p.id, {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim() || null,
        email: v.email.trim().toLowerCase(),
        currencyCode: v.currencyCode,
        isActive: p.isActive
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Profile updated successfully.');
          this.profileResource.reload();
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  protected retry(): void {
    this.profileResource.reload();
  }
}
