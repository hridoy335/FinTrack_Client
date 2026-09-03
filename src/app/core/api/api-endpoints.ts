/** Central API path list — feature services should use these instead of raw strings. */

export const ApiEndpoints = {
  auth: {
    login: '/api/Auths/login',
    refresh: '/api/Auths/refresh',
    logout: '/api/Auths/logout'
  },

  userInfos: {
    root: '/api/UserInfos',
    byId: (id: number | string) => `/api/UserInfos/${id}`
  },

  financialYears: '/api/FinancialYears',
  accountTypes: '/api/AccountTypes',
  transactionTypes: '/api/TransactionTypes',

  coas: {
    root: '/api/Coas',
    list: '/api/Coas/list',
    exportPdf: '/api/Coas/export/pdf',
    byId: (id: number | string) => `/api/Coas/${id}`
  },

  transactions: {
    root: '/api/Transactions'
  },

  reports: {
    dashboard: '/api/Reports/dashboard',
    cashflow: '/api/Reports/cashflow',
    balance: '/api/Reports/balance',
    accountStatement: '/api/Reports/account-statement',
    monthlyCashflow: '/api/Reports/monthly-cashflow'
  }
} as const;

/** Build `?a=1&b=2` from a params object; empty string when nothing is set. */
export function apiQuery(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** Join a path with an optional query string from params. */
export function apiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  return params ? `${path}${apiQuery(params)}` : path;
}
