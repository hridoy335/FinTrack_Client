import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { ReportService } from './report.service';
import { formatReportDate, isoDate, sectionBadgeClass } from './report.util';

@Component({
  selector: 'app-balance-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './balance-report.component.html'
})
export class BalanceReportComponent {
  private readonly reportService = inject(ReportService);
  private readonly auth = inject(AuthService);
  protected readonly formatReportDate = formatReportDate;
  protected readonly sectionBadgeClass = sectionBadgeClass;
  protected readonly currency = computed(() => this.auth.user()?.currencyCode ?? 'BDT');
  protected readonly selectedYearId = signal<number | null>(null);
  protected readonly asOfDate = signal(isoDate(new Date()));
  protected readonly yearsResource = rxResource({
    stream: () => this.reportService.getFinancialYears()
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);
  private readonly refreshToken = signal(0);
  protected readonly reportResource = rxResource({
    params: () => ({
      financialYearId: this.effectiveYearId(),
      asOfDate: this.asOfDate(),
      refresh: this.refreshToken()
    }),
    stream: ({ params }) => {
      if (!params.financialYearId) {
        throw new Error('Select a financial year.');
      }

      return this.reportService.getBalance({
        financialYearId: params.financialYearId,
        asOfDate: params.asOfDate || undefined
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
        }
      }
    });
  }

  protected onYearChange(event: Event): void {
    this.selectedYearId.set(Number((event.target as HTMLSelectElement).value));
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
