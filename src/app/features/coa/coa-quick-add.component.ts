import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Coa } from './coa.model';
import { CoaService } from './coa.service';
import { defaultParentForType, duplicateAccountHeadMessage, isDuplicateAccountHeadName } from './coa.util';

@Component({
  selector: 'app-coa-quick-add',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './coa-quick-add.component.html'
})
export class CoaQuickAddComponent {
  private readonly coaService = inject(CoaService);
  private readonly fb = inject(FormBuilder);

  readonly accountTypeId = input.required<number>();
  readonly coas = input.required<Coa[]>();
  readonly label = input('account');

  readonly created = output<number>();

  protected readonly expanded = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    accountName: ['', Validators.required]
  });

  protected open(): void {
    this.errorMessage.set(null);
    this.form.reset({ accountName: '' });
    this.expanded.set(true);
  }

  protected cancel(): void {
    this.expanded.set(false);
    this.errorMessage.set(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const parent = defaultParentForType(this.coas(), this.accountTypeId());
    if (!parent) {
      this.errorMessage.set('No account group found. Add one from Chart of Accounts first.');
      return;
    }

    const accountName = this.form.controls.accountName.value.trim();

    if (isDuplicateAccountHeadName(this.coas(), this.accountTypeId(), accountName)) {
      this.errorMessage.set(duplicateAccountHeadMessage());
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.coaService
      .create({
        accountTypeId: this.accountTypeId(),
        parentId: parent.id,
        accountName
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.expanded.set(false);
          this.form.reset({ accountName: '' });
          this.created.emit(result.id);
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
  }
}
