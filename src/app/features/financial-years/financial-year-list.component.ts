import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { FinancialYearListItem } from './financial-year.model';
import { FinancialYearService } from './financial-year.service';
import {
  financialYearStatusClass,
  financialYearStatusLabel,
  formatFinancialYearDate
} from './financial-year.util';

@Component({
  selector: 'app-financial-year-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './financial-year-list.component.html'
})
export class FinancialYearListComponent {
  private readonly financialYearService = inject(FinancialYearService);
  private readonly fb = inject(FormBuilder);

  protected readonly formatDate = formatFinancialYearDate;
  protected readonly statusLabel = financialYearStatusLabel;
  protected readonly statusClass = financialYearStatusClass;

  protected readonly creating = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly editingIsCurrent = signal(false);

  protected readonly editForm = this.fb.nonNullable.group({
    year: [{ value: 0, disabled: true }],
    startDate: [{ value: '', disabled: true }],
    endDate: [{ value: '', disabled: true }],
    name: ['', Validators.required],
    isClosed: [false]
  });

  protected readonly listResource = rxResource({
    stream: () => this.financialYearService.getAll()
  });

  protected readonly years = computed(() => this.listResource.value() ?? []);
  protected readonly loading = computed(() => this.listResource.isLoading());
  protected readonly loadError = computed(() => {
    const err = this.listResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected createNext(): void {
    if (this.creating()) return;
    if (!confirm('Create the next financial year?')) return;

    this.creating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.financialYearService
      .createNext()
      .pipe(finalize(() => this.creating.set(false)))
      .subscribe({
        next: (result) => {
          this.successMessage.set(
            result.message || 'Next financial year created successfully.'
          );
          this.listResource.reload();
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  protected startEdit(item: FinancialYearListItem): void {
    if (!item.canEdit || this.submitting()) return;

    this.editingId.set(item.id);
    this.editingIsCurrent.set(item.isCurrent);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.submitting.set(true);

    this.financialYearService
      .getById(item.id)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (detail) => {
          this.editForm.reset({
            year: detail.year,
            startDate: this.toDateInput(detail.startDate),
            endDate: this.toDateInput(detail.endDate),
            name: detail.name,
            isClosed: detail.isClosed
          });

          if (item.isCurrent) {
            this.editForm.controls.isClosed.disable({ emitEvent: false });
          } else {
            this.editForm.controls.isClosed.enable({ emitEvent: false });
          }
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.cancelEdit();
        }
      });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editingIsCurrent.set(false);
  }

  protected submitEdit(): void {
    if (this.submitting()) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const id = this.editingId();
    if (id == null) return;

    const name = this.editForm.controls.name.value.trim();
    const isClosed = this.editingIsCurrent()
      ? false
      : this.editForm.controls.isClosed.value;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.financialYearService
      .update(id, { name, isClosed })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.successMessage.set(result.message || 'Financial year updated.');
          this.cancelEdit();
          this.listResource.reload();
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  protected retry(): void {
    this.listResource.reload();
  }

  private toDateInput(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.slice(0, 10);
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
