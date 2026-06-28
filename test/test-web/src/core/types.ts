export type Pagination = {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export const initialPagination: Pagination = {
  page: 1,
  perPage: 10,
  totalPages: 0,
  totalItems: 0,
  hasNextPage: false,
  hasPrevPage: false,
};
