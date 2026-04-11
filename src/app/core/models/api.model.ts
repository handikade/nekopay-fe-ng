export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
