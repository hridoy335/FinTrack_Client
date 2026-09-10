import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { pickDefaultFinancialYearId } from '../financial-years/financial-year.util';
import { DashboardService } from './dashboard.service';
import { txAmountPrefix, txIcon, txRelativeDate } from './dashboard.util';



const WALLET_CODES = ['10100', '10200', '10300', '20100'];

const DONUT_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#94a3b8'];



interface DonutSegment {

  coaId: number;

  accountName: string;

  balance: number;

  pct: number;

  start: number;

  color: string;

}



@Component({

  selector: 'app-dashboard',

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [CurrencyPipe, DecimalPipe, RouterLink],

  templateUrl: './dashboard.component.html'

})

export class DashboardComponent {

  private readonly dashboardService = inject(DashboardService);

  private readonly auth = inject(AuthService);



  protected readonly txIcon = txIcon;

  protected readonly txRelativeDate = txRelativeDate;

  protected readonly txAmountPrefix = txAmountPrefix;



  protected readonly user = this.auth.user;

  protected readonly today = new Date();

  protected readonly currency = computed(() => this.user()?.currencyCode ?? 'BDT');

  protected readonly greeting = computed(() => {

    const hour = this.today.getHours();

    if (hour < 12) return 'Good morning';

    if (hour < 17) return 'Good afternoon';

    return 'Good evening';

  });



  protected readonly selectedYearId = signal<number | null>(null);

  protected readonly yearsResource = rxResource({
    stream: () => this.dashboardService.getFinancialYears()
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);

  protected readonly effectiveYearId = computed(() => {
    const selected = this.selectedYearId();
    if (selected != null) return selected;
    return pickDefaultFinancialYearId(this.years());
  });

  protected readonly dashboardResource = rxResource({
    params: () => ({ financialYearId: this.effectiveYearId() }),
    stream: ({ params }) => {
      if (params.financialYearId == null) {
        return of(undefined);
      }
      return this.dashboardService.getDashboard(params.financialYearId);
    }
  });

  protected readonly transactionsResource = rxResource({
    params: () => ({ financialYearId: this.effectiveYearId() }),
    stream: ({ params }) => {
      if (params.financialYearId == null) {
        return of([]);
      }
      return this.dashboardService.getRecentTransactions(params.financialYearId);
    }
  });

  protected readonly dashboard = computed(() => this.dashboardResource.value());
  protected readonly transactions = computed(() => this.transactionsResource.value() ?? []);
  protected readonly loading = computed(
    () => this.yearsResource.isLoading() || this.dashboardResource.isLoading()
  );
  protected readonly transactionsLoading = computed(() => this.transactionsResource.isLoading());

  protected readonly loadError = computed(() => {
    const err = this.yearsResource.error() ?? this.dashboardResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected readonly selectedYearLabel = computed(() => {
    const id = this.effectiveYearId();
    const year = this.years().find((y) => y.id === id);
    return year?.name ?? (this.dashboard() ? `FY ${this.dashboard()!.financialYear}` : 'This year');
  });

  constructor() {
    // Resolve current (or active) FY before dashboard/transactions load.
    effect(() => {
      const years = this.years();
      if (years.length && this.selectedYearId() == null) {
        const defaultId = pickDefaultFinancialYearId(years);
        if (defaultId != null) {
          this.selectedYearId.set(defaultId);
        }
      }
    });
  }



  protected readonly walletAccounts = computed(() => {

    const balances = this.dashboard()?.accountBalances ?? [];

    const wallets = balances.filter((a) => WALLET_CODES.includes(a.accountCode));

    return wallets.length > 0

      ? wallets

      : balances.filter((a) => a.accountTypeCode === 'ASSET' || a.accountTypeCode === 'LIABILITY');

  });



  protected readonly expenseBreakdown = computed(() => {
    const categories = this.dashboard()?.expenseCategoriesThisMonth ?? [];
    return categories
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((item) => ({
        coaId: item.coaId,
        accountName: item.accountName,
        balance: item.amount
      }));
  });



  protected readonly totalExpenseBreakdown = computed(() => {
    const fromCategories = this.expenseBreakdown().reduce((sum, item) => sum + item.balance, 0);
    if (fromCategories > 0) {
      return fromCategories;
    }

    return this.dashboard()?.expenseThisMonth ?? 0;
  });



  protected readonly donutSegments = computed((): DonutSegment[] => {

    const items = this.expenseBreakdown();

    const total = this.totalExpenseBreakdown();

    if (!total) return [];



    let acc = 0;

    return items.map((item, idx) => {

      const pct = (item.balance / total) * 100;

      const start = acc;

      acc += pct;

      return {

        coaId: item.coaId,

        accountName: item.accountName,

        balance: item.balance,

        pct,

        start,

        color: DONUT_COLORS[idx % DONUT_COLORS.length]

      };

    });

  });



  protected readonly donutGradient = computed(() => {

    const segments = this.donutSegments();

    if (!segments.length) return '#e2e8f0';

    return `conic-gradient(${segments

      .map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`)

      .join(', ')})`;

  });



  /** Tip derived only from this month's income, expense, and net savings KPIs. */
  protected readonly smartTip = computed(() => {
    const d = this.dashboard();
    if (!d) return '';

    const income = d.incomeThisMonth;
    const expense = d.expenseThisMonth;
    const net = d.netThisMonth;

    if (income === 0 && expense === 0) {
      return 'Smart Tip: Add your first transaction to start tracking income and expenses.';
    }

    if (net < 0) {
      return 'Smart Tip: Your expenses exceeded income this month. Review spending categories to get back on track.';
    }

    if (net > 0 && income > 0) {
      const pct = Math.round((net / income) * 100);
      return `Smart Tip: You saved ${pct}% of your income this month. Great job — keep it up and save more!`;
    }

    // Net savings is exactly 0 (income === expense, both > 0)
    return 'Smart Tip: Income and expenses balanced this month. A small cut in spending can grow your savings.';
  });



  protected onYearChange(event: Event): void {

    const id = Number((event.target as HTMLSelectElement).value);

    if (!Number.isNaN(id)) {

      this.selectedYearId.set(id);

    }

  }



  protected retry(): void {

    this.yearsResource.reload();

    this.dashboardResource.reload();

    this.transactionsResource.reload();

  }



  protected accountIconClass(code: string): string {

    const map: Record<string, string> = {

      '10100': 'dash-acct-icon dash-acct-icon--cash',

      '10200': 'dash-acct-icon dash-acct-icon--bank',

      '10300': 'dash-acct-icon dash-acct-icon--wallet',

      '20100': 'dash-acct-icon dash-acct-icon--card'

    };

    return map[code] ?? 'dash-acct-icon';

  }



  protected accountIconLabel(code: string, name: string): string {

    const map: Record<string, string> = {

      '10100': '💵',

      '10200': '🏦',

      '10300': '📱',

      '20100': '💳'

    };

    return map[code] ?? name.charAt(0);

  }



  protected budgetPlaceholderPct(spent: number, limit: number): number {

    return Math.min(100, Math.round((spent / limit) * 100));

  }

}


