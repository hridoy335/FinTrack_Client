import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import { CoaService } from './coa.service';
import { CoaListItem } from './coa.model';
import { accountTypeBadgeClass, defaultParentForType, duplicateAccountHeadMessage, filterCoaSections, isDuplicateAccountHeadName } from './coa.util';

@Component({
  selector: 'app-coa-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './coa-list.component.html'
})
export class CoaListComponent {
  private readonly coaService = inject(CoaService);
  private readonly fb = inject(FormBuilder);

  protected readonly accountTypeBadgeClass = accountTypeBadgeClass;

  protected readonly showAddForm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly downloadingPdf = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly form = this.fb.nonNullable.group({
    accountTypeId: [0, [Validators.required, Validators.min(1)]],
    accountName: ['', Validators.required]
  });

  protected readonly editForm = this.fb.nonNullable.group({
    accountName: ['', Validators.required],
    isActive: [true]
  });

  protected readonly dataResource = rxResource({
    stream: () =>
      forkJoin({
        list: this.coaService.getList(),
        accountTypes: this.coaService.getAccountTypes(),
        coas: this.coaService.getAll()
      })
  });

  protected readonly sections = computed(() => this.dataResource.value()?.list.sections ?? []);
  protected readonly filteredSections = computed(() =>
    filterCoaSections(this.sections(), this.searchQuery())
  );
  protected readonly hasSearch = computed(() => this.searchQuery().trim().length > 0);
  protected readonly totalMatchCount = computed(() =>
    this.filteredSections().reduce((sum, section) => sum + section.items.length, 0)
  );
  protected readonly accountTypes = computed(() => this.dataResource.value()?.accountTypes ?? []);
  protected readonly coas = computed(() => this.dataResource.value()?.coas ?? []);
  protected readonly loading = computed(() => this.dataResource.isLoading());
  protected readonly loadError = computed(() => {
    const err = this.dataResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  constructor() {
    effect(() => {
      const types = this.accountTypes();
      if (types.length && this.form.controls.accountTypeId.value === 0) {
        this.form.patchValue({ accountTypeId: types[0].id }, { emitEvent: false });
      }
    });
  }

  protected toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected submitAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const accountTypeId = Number(v.accountTypeId);
    const accountName = v.accountName.trim();
    const accountType = this.accountTypes().find((t) => t.id === accountTypeId);

    if (isDuplicateAccountHeadName(this.coas(), accountTypeId, accountName)) {
      this.errorMessage.set(duplicateAccountHeadMessage(accountType?.name));
      return;
    }

    const parent = defaultParentForType(this.coas(), accountTypeId);

    if (!parent) {
      this.errorMessage.set('No account group found for this type.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.coaService
      .create({
        accountTypeId,
        parentId: parent.id,
        accountName
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          const code = result.accountCode ? ` (${result.accountCode})` : '';
          this.successMessage.set(`Account added successfully${code}.`);
          this.form.patchValue({ accountName: '' });
          this.showAddForm.set(false);
          this.dataResource.reload();
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  protected startEdit(item: CoaListItem): void {
    if (!item.canEdit) return;

    this.editingId.set(item.id);
    this.editForm.patchValue({
      accountName: item.accountHeadName,
      isActive: item.isActive
    });
    this.errorMessage.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected submitEdit(item: CoaListItem): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const v = this.editForm.getRawValue();
    const accountName = v.accountName.trim();
    const coaRecord = this.coas().find((c) => c.id === item.id);

    if (
      coaRecord &&
      isDuplicateAccountHeadName(this.coas(), coaRecord.accountTypeId, accountName, item.id)
    ) {
      this.errorMessage.set(duplicateAccountHeadMessage(coaRecord.accountType?.name));
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.coaService
      .update(item.id, {
        parentId: item.parentId ?? null,
        accountName: v.accountName.trim(),
        isActive: v.isActive
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.editingId.set(null);
          this.successMessage.set('Account updated.');
          this.dataResource.reload();
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }

  protected deleteAccount(item: CoaListItem): void {
    if (!item.canDelete) return;
    if (!confirm(`Delete "${item.accountHeadName}"?`)) return;

    this.errorMessage.set(null);
    this.coaService.delete(item.id).subscribe({
      next: () => {
        this.successMessage.set('Account deleted.');
        this.dataResource.reload();
      },
      error: (err: Error) => this.errorMessage.set(err.message)
    });
  }

  protected downloadPdf(): void {
    this.downloadingPdf.set(true);
    this.errorMessage.set(null);

    this.coaService
      .downloadPdf()
      .pipe(finalize(() => this.downloadingPdf.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'chart-of-accounts.pdf';
          link.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.errorMessage.set('Could not download PDF. Please try again.')
      });
  }

  protected isGroupRow(item: CoaListItem): boolean {
    return item.parentId == null;
  }

  protected retry(): void {
    this.dataResource.reload();
  }
}
