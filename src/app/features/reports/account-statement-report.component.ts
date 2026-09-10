import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { CoaService } from '../coa/coa.service';
import { pickDefaultFinancialYearId } from '../financial-years/financial-year.util';
import { ReportService } from './report.service';
import { formatReportDate } from './report.util';

@Component({
  selector: 'app-account-statement-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './account-statement-report.component.html'
})
export class AccountStatementReportComponent {
  private readonly reportService = inject(ReportService);
  private readonly coaService = inject(CoaService);
  private readonly auth = inject(AuthService);

  protected readonly formatReportDate = formatReportDate;
  protected readonly currency = computed(() => this.auth.user()?.currencyCode ?? 'BDT');

  protected readonly selectedYearId = signal<number | null>(null);
  protected readonly selectedCoaId = signal<number | null>(null);
  protected readonly fromDate = signal('');
  protected readonly toDate = signal('');

  protected readonly setupResource = rxResource({
    stream: () =>
      forkJoin({
        years: this.reportService.getFinancialYears(),
        coas: this.coaService.getAll()
      })
  });

  protected readonly years = computed(() => this.setupResource.value()?.years ?? []);
  protected readonly coaOptions = computed(() =>
    (this.setupResource.value()?.coas ?? [])
      .filter((c) => c.isActive && c.parentId != null)
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
  );

  private readonly refreshToken = signal(0);

  protected readonly reportResource = rxResource({
    params: () => ({
      coaId: this.selectedCoaId(),
      financialYearId: this.effectiveYearId(),
      fromDate: this.fromDate(),
      toDate: this.toDate(),
      refresh: this.refreshToken()
    }),
    stream: ({ params }) => {
      if (!params.coaId || !params.financialYearId) {
        return EMPTY;
      }

      return this.reportService.getAccountStatement({
        coaId: params.coaId,
        financialYearId: params.financialYearId,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined
      });
    }
  });

  protected readonly report = computed(() => this.reportResource.value());
  protected readonly loading = computed(
    () => this.setupResource.isLoading() || this.reportResource.isLoading()
  );
  protected readonly loadError = computed(() => {
    const err = this.setupResource.error() ?? this.reportResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected readonly effectiveYearId = computed(() => {
    const selected = this.selectedYearId();
    if (selected) return selected;
    return pickDefaultFinancialYearId(this.years());
  });

  constructor() {
    effect(() => {
      const years = this.years();
      const coas = this.coaOptions();
      if (years.length && !this.selectedYearId()) {
        const defaultId = pickDefaultFinancialYearId(years);
        const current = years.find((y) => y.id === defaultId) ?? years[0];
        if (current) {
          this.selectedYearId.set(current.id);
          this.fromDate.set(current.startDate.slice(0, 10));
          this.toDate.set(isoTodayOrYearEnd(current.endDate));
        }
      }
      if (coas.length && !this.selectedCoaId()) {
        this.selectedCoaId.set(coas[0].id);
      }
    });
  }

  protected onYearChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedYearId.set(value);
    const year = this.years().find((y) => y.id === value);
    if (year) {
      this.fromDate.set(year.startDate.slice(0, 10));
      this.toDate.set(isoTodayOrYearEnd(year.endDate));
    }
    this.runReport();
  }

  protected onCoaChange(event: Event): void {
    this.selectedCoaId.set(Number((event.target as HTMLSelectElement).value));
    this.runReport();
  }

  protected runReport(): void {
    this.refreshToken.update((v) => v + 1);
  }

  protected retry(): void {
    this.setupResource.reload();
    this.reportResource.reload();
  }
}

function isoTodayOrYearEnd(endDate: string): string {
  const end = endDate.slice(0, 10);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return todayIso < end ? todayIso : end;
}
