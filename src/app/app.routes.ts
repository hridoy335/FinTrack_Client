import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

const transactionFormRoute = (mode: string) => ({
  loadComponent: () =>
    import('./features/transactions/transaction-form.component').then(
      (m) => m.TransactionFormComponent
    ),
  data: { mode }
});

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/landing/landing.component').then((m) => m.LandingComponent)
      }
    ]
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          )
      },
      {
        path: 'verify-recovery-code',
        loadComponent: () =>
          import('./features/auth/verify-recovery-code/verify-recovery-code.component').then(
            (m) => m.VerifyRecoveryCodeComponent
          )
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          )
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/app-layout/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports-hub.component').then((m) => m.ReportsHubComponent)
      },
      {
        path: 'reports/cashflow',
        loadComponent: () =>
          import('./features/reports/cashflow-report.component').then((m) => m.CashflowReportComponent)
      },
      {
        path: 'reports/balance',
        loadComponent: () =>
          import('./features/reports/balance-report.component').then((m) => m.BalanceReportComponent)
      },
      {
        path: 'reports/account-statement',
        loadComponent: () =>
          import('./features/reports/account-statement-report.component').then(
            (m) => m.AccountStatementReportComponent
          )
      },
      {
        path: 'reports/monthly-cashflow',
        loadComponent: () =>
          import('./features/reports/monthly-cashflow-report.component').then(
            (m) => m.MonthlyCashflowReportComponent
          )
      },
      {
        path: 'coa',
        loadComponent: () =>
          import('./features/coa/coa-list.component').then((m) => m.CoaListComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions-list.component').then(
            (m) => m.TransactionsListComponent
          )
      },
      { path: 'transactions/income', ...transactionFormRoute('income') },
      { path: 'transactions/expense', ...transactionFormRoute('expense') },
      { path: 'transactions/transfer', ...transactionFormRoute('transfer') },
      { path: 'transactions/new', redirectTo: 'transactions/expense', pathMatch: 'full' },
      { path: 'loans', redirectTo: 'loans/borrow', pathMatch: 'full' },
      { path: 'loans/borrow', ...transactionFormRoute('loan-borrow') },
      { path: 'loans/repay', ...transactionFormRoute('loan-repay') },
      { path: 'loans/lend', ...transactionFormRoute('loan-lend') },
      { path: 'loans/collect', ...transactionFormRoute('loan-collect') },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
