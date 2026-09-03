import { CurrencyPipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { rxResource } from '@angular/core/rxjs-interop';

import { of } from 'rxjs';



import { AuthService } from '../../core/auth/auth.service';

import { TransactionService } from './transaction.service';
import { txAmountPrefix, txIcon, txRelativeDate } from './transaction.util';



@Component({

  selector: 'app-transactions-list',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CurrencyPipe, RouterLink],

  templateUrl: './transactions-list.component.html'

})

export class TransactionsListComponent {

  private readonly transactionService = inject(TransactionService);

  private readonly auth = inject(AuthService);



  protected readonly txIcon = txIcon;

  protected readonly txRelativeDate = txRelativeDate;

  protected readonly txAmountPrefix = txAmountPrefix;



  protected readonly currency = computed(() => this.auth.user()?.currencyCode ?? 'BDT');

  protected readonly page = signal(1);

  protected readonly pageSize = 20;

  protected readonly selectedYearId = signal<number | null>(null);

  protected readonly selectedTypeId = signal<number | null>(null);



  protected readonly yearsResource = rxResource({

    stream: () => this.transactionService.getFinancialYears()

  });



  protected readonly typesResource = rxResource({

    stream: () => this.transactionService.getTransactionTypes()

  });



  protected readonly listResource = rxResource({

    params: () => ({

      financialYearId: this.effectiveYearId(),

      transactionTypeId: this.selectedTypeId(),

      page: this.page()

    }),

    stream: ({ params }) => {

      if (params.financialYearId == null) {

        return of({ data: [], meta: { totalData: 0, totalPage: 0 } });

      }



      return this.transactionService.getTransactions({

        financialYearId: params.financialYearId,

        transactionTypeId: params.transactionTypeId,

        page: params.page,

        pageSize: this.pageSize

      });

    }

  });



  protected readonly years = computed(() => this.yearsResource.value() ?? []);

  protected readonly types = computed(() => this.typesResource.value() ?? []);

  protected readonly transactions = computed(() => this.listResource.value()?.data ?? []);

  protected readonly totalPages = computed(() => this.listResource.value()?.meta.totalPage ?? 0);

  protected readonly totalCount = computed(() => this.listResource.value()?.meta.totalData ?? 0);



  protected readonly loading = computed(

    () => this.yearsResource.isLoading() || this.listResource.isLoading()

  );



  protected readonly loadError = computed(() => {

    const err = this.listResource.error() ?? this.yearsResource.error();

    return err instanceof Error ? err.message : err ? String(err) : null;

  });



  protected readonly effectiveYearId = computed(() => {

    const selected = this.selectedYearId();

    if (selected != null) return selected;



    const years = this.years();

    const current = years.find((y) => y.isActive && !y.isClosed);

    return current?.id ?? years[0]?.id ?? null;

  });



  protected onYearChange(event: Event): void {

    const id = Number((event.target as HTMLSelectElement).value);

    if (!Number.isNaN(id)) {

      this.selectedYearId.set(id);

      this.page.set(1);

    }

  }



  protected onTypeChange(event: Event): void {

    const raw = (event.target as HTMLSelectElement).value;

    this.selectedTypeId.set(raw === '' ? null : Number(raw));

    this.page.set(1);

  }



  protected prevPage(): void {

    if (this.page() > 1) {

      this.page.update((p) => p - 1);

    }

  }



  protected nextPage(): void {

    if (this.page() < this.totalPages()) {

      this.page.update((p) => p + 1);

    }

  }



  protected retry(): void {

    this.yearsResource.reload();

    this.listResource.reload();

  }

}


