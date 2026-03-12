export interface Pagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

// List endpoint'lerinin meta response shape'i
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
