import type { Permission } from "./menu";

export type ResponsePagination<T> = {
  success: boolean;
  current_page: number;
  total_page: number;
  total_data: number;
  data: T;
  privilege?: Permission[];
  message?: string;
};
