export enum OrderColumn {
  ASC = "ASC",
  DESC = "DESC",
  ASCENDING = "ascending",
  DESCENDING = "descending",
}

export type RequestSearch = {
  keyword: string;
  table: string;
  column: any[];
  filter?: any;
  sort: {
    column: string;
    order: string;
  } | null;
  flag?: "list" | "form";
  offset: string;
  limit: string;
};

export enum StatisticTable {
  brands = "brands",
  inventories = "inventories",
  inventory_movement = "inventory_movement",
  canvassing = "canvassing",
  inquiries = "inquiries",
  rab = "rab",
  pricetag = "pricetag",
  purchase_order = "purchase_order",
  purchase_request = "purchase_request",
  invoices = "invoices",
  transactions = "transactions",
}

export type RequestStatistic = {
  table: StatisticTable;
  start_date?: number;
  end_date?: number;
  type?: string;
};
