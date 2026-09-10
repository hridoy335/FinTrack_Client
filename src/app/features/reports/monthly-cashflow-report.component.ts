import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { pickDefaultFinancialYearId } from '../financial-years/financial-year.util';
import { ReportService } from './report.service';
import { barWidth } from './report.util';

@Component({
  selector: 'app-monthly-cashflow-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './monthly-cashflow-report.component.html'
})
export class MonthlyCashflowReportComponent {
  private readonly reportService = inject(ReportService);
  private readonly auth = inject(AuthService);

  protected readonly barWidth = barWidth;
  protected readonly currency = computed(() => this.auth.user()?.currencyCode ?? 'BDT');

  protected readonly selectedYearId = signal<number | null>(null);

  protected readonly yearsResource = rxResource({
    stream: () => this.reportService.getFinancialYears()
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);

  protected readonly reportResource = rxResource({
    params: () => ({
      financialYearId: this.effectiveYearId()
    }),
    stream: ({ params }) => {
      if (!params.financialYearId) {
        throw new Error('Select a financial year.');
      }

      return this.reportService.getMonthlyCashflow(params.financialYearId);
    }
  });

  protected readonly report = computed(() => this.reportResource.value());
  protected readonly maxMonthValue = computed(() => {
    const months = this.report()?.months ?? [];
    if (!months.length) return 0;
    return Math.max(...months.map((m) => Math.max(m.income, m.expense)));
  });

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
    return pickDefaultFinancialYearId(this.years());
  });

  constructor() {
    effect(() => {
      const years = this.years();
      if (years.length && !this.selectedYearId()) {
        const defaultId = pickDefaultFinancialYearId(years);
        if (defaultId != null) {
          this.selectedYearId.set(defaultId);
        }
      }
    });
  }

  protected onYearChange(event: Event): void {
    this.selectedYearId.set(Number((event.target as HTMLSelectElement).value));
    this.reportResource.reload();
  }

  protected retry(): void {
    this.yearsResource.reload();
    this.reportResource.reload();
  }
}
