import type { Inventory } from "./inventory";
import type { People } from "./people";

export type Inspection = {
  id: number;
  unique_id: string;
  unique_code: string;
  inspection_name: string;
  inspection_date: number;
  condition: string | null;
  status: string;
  created_at: number | null;
  created_by: string | null;
  updated_at: number | null;
  inspection_item: InspectionItem[];
  checked?: boolean;
};

export type InspectionItem = {
  id: number;
  unique_id: string;
  unique_code: string;
  inventory_id: string | null;
  inventories: Inventory | null;
  pic: People | null;
  condition: string | null;
  created_at: number | null;
  created_by: string | null;
  updated_at: number | null;
};
