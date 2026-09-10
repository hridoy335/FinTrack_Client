import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { rxResource } from '@angular/core/rxjs-interop';

import { finalize, map } from 'rxjs';

import { CoaQuickAddComponent } from '../coa/coa-quick-add.component';
import { pickDefaultFinancialYearId } from '../financial-years/financial-year.util';
import {
  TRANSACTION_FORM_MODES,
  TransactionFormMode
} from './transaction-form.config';
import { TransactionService } from './transaction.service';
import { coaLabel, selectableCoas } from './transaction.util';

@Component({
  selector: 'app-transaction-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CoaQuickAddComponent, LowerCasePipe],
  templateUrl: './transaction-form.component.html'
})
export class TransactionFormComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly coaLabel = coaLabel;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly pendingCoaSelection = signal<{ side: 'debit' | 'credit'; id: number } | null>(
    null
  );

  protected readonly mode = toSignal(
    this.route.data.pipe(map((data) => data['mode'] as TransactionFormMode)),
    { initialValue: 'expense' as TransactionFormMode }
  );

  protected readonly config = computed(() => TRANSACTION_FORM_MODES[this.mode()]);

  protected readonly form = this.fb.nonNullable.group({
    transactionTypeId: [0, [Validators.required, Validators.min(1)]],
    financialYearId: [0, [Validators.required, Validators.min(1)]],
    transactionDate: [todayIso(), Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
    debitCoaId: [0, [Validators.required, Validators.min(1)]],
    creditCoaId: [0, [Validators.required, Validators.min(1)]]
  });

  protected readonly yearsResource = rxResource({
    stream: () => this.transactionService.getFinancialYears()
  });

  protected readonly coasResource = rxResource({
    stream: () => this.transactionService.getCoas()
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);
  protected readonly coas = computed(() => this.coasResource.value() ?? []);

  protected readonly loading = computed(
    () => this.yearsResource.isLoading() || this.coasResource.isLoading()
  );

  protected readonly loadError = computed(() => {
    const err = this.yearsResource.error() ?? this.coasResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected readonly debitCoas = computed(() =>
    selectableCoas(this.coas(), this.config().debitAccountTypeId)
  );

  protected readonly creditCoas = computed(() =>
    selectableCoas(this.coas(), this.config().creditAccountTypeId)
  );

  constructor() {
    effect(() => {
      const cfg = this.config();
      this.form.patchValue({ transactionTypeId: cfg.transactionTypeId }, { emitEvent: false });
    });

    effect(() => {
      const years = this.years();
      const defaultId = pickDefaultFinancialYearId(years);
      if (defaultId != null && this.form.controls.financialYearId.value === 0) {
        this.form.patchValue({ financialYearId: defaultId }, { emitEvent: false });
      }
    });

    effect(() => {
      const debit = this.debitCoas();
      const credit = this.creditCoas();
      const debitId = this.form.controls.debitCoaId.value;
      const creditId = this.form.controls.creditCoaId.value;

      const patch: Partial<{ debitCoaId: number; creditCoaId: number }> = {};

      if (!debit.some((c) => c.id === debitId) && debit[0]) {
        patch.debitCoaId = debit[0].id;
      }
      if (!credit.some((c) => c.id === creditId) && credit[0]) {
        patch.creditCoaId = credit[0].id;
      }

      if (Object.keys(patch).length) {
        this.form.patchValue(patch, { emitEvent: false });
      }
    });

    effect(() => {
      const pending = this.pendingCoaSelection();
      const coas = this.coas();
      if (!pending || !coas.some((c) => c.id === pending.id)) {
        return;
      }

      if (pending.side === 'debit') {
        this.form.patchValue({ debitCoaId: pending.id });
      } else {
        this.form.patchValue({ creditCoaId: pending.id });
      }
      this.pendingCoaSelection.set(null);
    });

    this.route.data.pipe(takeUntilDestroyed()).subscribe(() => {
      this.errorMessage.set(null);
      this.form.patchValue({ amount: null, description: '' }, { emitEvent: false });
    });
  }

  protected onCoaCreated(id: number, side: 'debit' | 'credit'): void {
    this.pendingCoaSelection.set({ side, id });
    this.coasResource.reload();
  }

  submit(): void {
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }



    const v = this.form.getRawValue();

    if (v.debitCoaId === v.creditCoaId) {

      this.errorMessage.set('Please choose two different accounts.');

      return;

    }



    this.submitting.set(true);

    this.errorMessage.set(null);



    this.transactionService

      .createTransaction({

        transactionTypeId: Number(v.transactionTypeId),

        financialYearId: Number(v.financialYearId),

        transactionDate: v.transactionDate,

        amount: Number(v.amount),

        description: v.description.trim() || null,

        debitCoaId: Number(v.debitCoaId),

        creditCoaId: Number(v.creditCoaId)

      })

      .pipe(finalize(() => this.submitting.set(false)))

      .subscribe({

        next: () => void this.router.navigate(['/app/transactions']),

        error: (err: Error) => this.errorMessage.set(err.message)

      });

  }



  protected retry(): void {

    this.yearsResource.reload();

    this.coasResource.reload();

  }

}



function todayIso(): string {

  const d = new Date();

  const month = String(d.getMonth() + 1).padStart(2, '0');

  const day = String(d.getDate()).padStart(2, '0');

  return `${d.getFullYear()}-${month}-${day}`;

}


