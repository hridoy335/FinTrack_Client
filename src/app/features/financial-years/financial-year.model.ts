export interface FinancialYearListItem {
  id: number;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  isCurrent: boolean;
  canEdit: boolean;
}

/** Detail payload from GET /api/FinancialYears/{id} */
export interface FinancialYearDetail {
  id: number;
  userInfoId?: number;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  createdDate?: string;
  updatedDate?: string | null;
}

export interface UpdateFinancialYearRequest {
  name: string;
  isClosed: boolean;
}

/** Alias used by pickers/forms across the app. */
export type FinancialYear = FinancialYearListItem;
