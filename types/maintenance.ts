import type { UploadUserFile } from "element-plus";
import type { Catalogue } from "./catalogue";
import type { InspectionItem } from "./inspection";
import type { Inventory } from "./inventory";
import type { People } from "./people";
import type { Unit } from "./unit";

export type Maintenance = {
  id: number;
  unique_id: string;
  unique_code: string;
  inspection_item_id: string;
  inspection_item: InspectionItem | null;
  maintenance_date: number;
  team_id: string | null;
  responsible_id: string | null;
  responsible: People | null;
  duration: number | null;
  start_date: number | null;
  end_date: number | null;
  is_repeate: boolean | null;
  repeate_unit: string | null;
  repeate_value: number | null;
  priority: string;
  status: string;
  type: string;
  created_at: number;
  created_by: string;
  updated_at: number;
  inventory: Inventory | null;
  inventory_id: string | null;
  inventory_name: string | null;
  inventory_version: number | null;
  catalogue_name: string | null;
  location_id: string | null;
  location: Catalogue | null;
  version: number;
  maintenance_item?: Maintenance_item[];
  maintenance_jobs?: Maintenance_job[];
  note: string;
  checked?: boolean;
};

export type Maintenance_item = {
  unique_id: string | null;
  unique_code: string | null;
  inventory_id: string | null;
  catalogue_id: string | null;
  inventory_name: string | null;
  catalogue_name: string | null;
  inventory: Inventory | null;
  catalogue: Catalogue | null;
  inventory_version: number;
  catalogue_version: number;
  quantity: number;
  unit_name: string | null;
  unit_id: string | null;
  unit: Unit | null;
  status: "draft" | "request" | "used";
  created_at: number;
  created_by: string;
  updated_at: number;
  files_upload?: UploadUserFile[];
  image?: string;
};

export type Maintenance_job = {
  unique_id: string | null;
  unique_code: string | null;
  maintenance_id: string | null;
  name: string | null;
  status: "pending" | "progress" | "done";
  pic_id: string | null;
  pic_name: string | null;
  is_team: boolean;
  team_id: string | null;
  team_name: string | null;
  team?: Team;
  maintenance_version: number;
  people_pic?: People;
};

export type Team = {
  id: string;
  unique_id: string;
  name: string;
  note?: string;
  version: number;
  maintenance_jobs?: Maintenance_job[];
  people?: People;
  maintenance_team_member?: TeamMember[];
  checked?: boolean;
};

export type TeamMember = {
  id: number;
  unique_id: string;
  team_id: string;
  pic_id: string;
  created_at: number;
  created_by: string;
  updated_at: number;
  version: number;
};
