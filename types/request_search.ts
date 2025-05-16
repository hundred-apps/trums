export enum OrderColumn {
  ASC = "ASC",
  DESC = "DESC",
}

export type RequestSearch = {
  keyword: string;
  table: string;
  column: any | null;
  sort: {
    column: string;
    order: string;
  } | null;
  offset: string;
  limit: string;
};
