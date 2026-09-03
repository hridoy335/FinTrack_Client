import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { ReportService } from './report.service';
import { formatReportDate } from './report.util';

@Component({
  selector: 'app-cashflow-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cashflow-report.component.html'
})
export class CashflowReportComponent {
  private readonly reportService = inject(ReportService);
  private readonly auth = inject(AuthService);

  protected readonly formatReportDate = formatReportDate;
  protected readonly currency = computed(() => this.auth.user()?.currencyCode ?? 'BDT');

  protected readonly selectedYearId = signal<number | null>(null);
  protected readonly fromDate = signal('');
  protected readonly toDate = signal('');

  protected readonly yearsResource = rxResource({
    stream: () => this.reportService.getFinancialYears()
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);

  private readonly refreshToken = signal(0);

  protected readonly reportResource = rxResource({
    params: () => ({
      financialYearId: this.effectiveYearId(),
      fromDate: this.fromDate(),
      toDate: this.toDate(),
      refresh: this.refreshToken()
    }),
    stream: ({ params }) => {
      if (!params.financialYearId) {
        throw new Error('Select a financial year.');
      }

      return this.reportService.getCashflow({
        financialYearId: params.financialYearId,
        fromDate: params.fromDate || undefined,
        toDate: params.toDate || undefined
      });
    }
  });

  protected readonly report = computed(() => this.reportResource.value());
  protected readonly loading = computed(
    () => this.yearsResource.isLoading() || this.reportResource.isLoading()
  );
  protected readonly loadError = computed(() => {
    const err = this.yearsResource.error() ?? this.reportResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected readonly effectiveYearId = computed(() => {
    const selected = this.selectedYearId();
    if (selected) return selected;
    const years = this.years();
    return years.find((y) => y.isActive && !y.isClosed)?.id ?? years[0]?.id ?? null;
  });

  constructor() {
    effect(() => {
      const years = this.years();
      if (years.length && !this.selectedYearId()) {
        const current = years.find((y) => y.isActive && !y.isClosed) ?? years[0];
        if (current) {
          this.selectedYearId.set(current.id);
          this.fromDate.set(current.startDate.slice(0, 10));
          this.toDate.set(isoTodayOrYearEnd(current.endDate));
        }
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

  protected runReport(): void {
    this.refreshToken.update((v) => v + 1);
  }

  protected retry(): void {
    this.yearsResource.reload();
    this.reportResource.reload();
  }
}

function isoTodayOrYearEnd(endDate: string): string {
  const end = endDate.slice(0, 10);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return todayIso < end ? todayIso : end;
}
