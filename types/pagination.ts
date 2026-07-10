export type Pagination<T> = {
  current_page: number;
  total_page: number;
  total_data: number;
  query: T;
};

export type DefaultResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
export type DefaultResponsePagination<T> = {
  success: boolean;
  message: string;
  data: Pagination<T>;
};
