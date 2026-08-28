import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/http/api.service';
import {
  AccountBalanceItem,
  DashboardData,
  FinancialYear,
  TransactionListItem
} from '../../core/models';

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
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

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
    stream: () => this.api.get<FinancialYear[]>('/api/FinancialYears')
  });

  protected readonly dashboardResource = rxResource({
    params: () => ({ financialYearId: this.selectedYearId() }),
    stream: ({ params }) => {
      const query =
        params.financialYearId != null ? `?financialYearId=${params.financialYearId}` : '';
      return this.api.get<DashboardData>(`/api/Reports/dashboard${query}`);
    }
  });

  protected readonly transactionsResource = rxResource({
    params: () => ({ financialYearId: this.effectiveYearId() }),
    stream: ({ params }) => {
      if (params.financialYearId == null) {
        return of([] as TransactionListItem[]);
      }

      return this.api.get<TransactionListItem[]>(
        `/api/Transactions?financialYearId=${params.financialYearId}&page=1&pageSize=5`
      );
    }
  });

  protected readonly years = computed(() => this.yearsResource.value() ?? []);
  protected readonly dashboard = computed(() => this.dashboardResource.value());
  protected readonly transactions = computed(() => this.transactionsResource.value() ?? []);
  protected readonly loading = computed(
    () => this.dashboardResource.isLoading() || this.yearsResource.isLoading()
  );
  protected readonly transactionsLoading = computed(() => this.transactionsResource.isLoading());

  protected readonly loadError = computed(() => {
    const err = this.dashboardResource.error() ?? this.yearsResource.error();
    return err instanceof Error ? err.message : err ? String(err) : null;
  });

  protected readonly effectiveYearId = computed(
    () => this.selectedYearId() ?? this.dashboard()?.financialYearId ?? null
  );

  protected readonly selectedYearLabel = computed(() => {
    const id = this.effectiveYearId();
    const year = this.years().find((y) => y.id === id);
    return year?.name ?? (this.dashboard() ? `FY ${this.dashboard()!.financialYear}` : 'This year');
  });

  protected readonly walletAccounts = computed(() => {
    const balances = this.dashboard()?.accountBalances ?? [];
    const wallets = balances.filter((a) => WALLET_CODES.includes(a.accountCode));
    return wallets.length > 0
      ? wallets
      : balances.filter((a) => a.accountTypeCode === 'ASSET' || a.accountTypeCode === 'LIABILITY');
  });

  protected readonly expenseBreakdown = computed(() => {
    const balances = this.dashboard()?.accountBalances ?? [];
    return balances
      .filter((a) => a.accountTypeCode === 'EXPENSE' && a.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 6);
  });

  protected readonly totalExpenseBreakdown = computed(() =>
    this.expenseBreakdown().reduce((sum, item) => sum + item.balance, 0)
  );

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

  protected readonly smartTip = computed(() => {
    const d = this.dashboard();
    if (!d) return '';

    if (d.netThisMonth > 0 && d.incomeThisMonth > 0) {
      const pct = Math.round((d.netThisMonth / d.incomeThisMonth) * 100);
      return `Smart Tip: You saved ${pct}% of your income this month. Great job — keep it up and save more!`;
    }

    if (d.expenseThisMonth === 0 && d.incomeThisMonth === 0) {
      return 'Smart Tip: Add your first transaction to start tracking income and expenses.';
    }

    if (d.netThisMonth < 0) {
      return 'Smart Tip: Your expenses exceeded income this month. Review spending categories to get back on track.';
    }

    return 'Smart Tip: Track every transaction to unlock richer insights on your dashboard.';
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

  protected txIcon(code?: string): string {
    switch (code) {
      case 'INCOME':
        return '💰';
      case 'EXPENSE':
        return '🛒';
      case 'TRANSFER':
        return '⇄';
      default:
        return '•';
    }
  }

  protected txRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = (d0.getTime() - d1.getTime()) / 86400000;

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  protected txAmountPrefix(code?: string): string {
    if (code === 'INCOME') return '+';
    if (code === 'EXPENSE') return '−';
    return '';
  }

  protected budgetPlaceholderPct(spent: number, limit: number): number {
    return Math.min(100, Math.round((spent / limit) * 100));
  }
}
