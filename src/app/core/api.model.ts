export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: { totalData: number; totalPage: number } | null;
}

export interface PagedResult<T> {
  data: T;
  meta: { totalData: number; totalPage: number };
}
