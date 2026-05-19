import type { UploadUserFile } from "element-plus";
import type { Catalogue } from "./catalogue";
import type { Inquiry } from "./inquiry";
import type { Inventory } from "./inventory";
import type { People } from "./people";
import type { AppFile } from "./file";
import type { CanvassingVendor } from "./scm/canvasing";

export enum ItemRequestTrailReference {
  BOOK = "inventory",
  PO = "PO",
  PR = "PR",
  MOVEMENT_ITEM = "movement_item",
}
export enum ItemRequestTrailStatus {
  WAITING = "waiting",
  DONE = "done",
  REJECT = "rejected",
  DRAFT = "draft",
}

export type ItemRequest = {
  quantity: any;
  imageFile?: UploadUserFile;
  files?: AppFile[];
  unique_id: string | null;
  catalogue_id: string | null;
  catalogue_name: string | null;
  sn: string | null;
  catalogue: Catalogue | null;
  inventory_id: string | null;
  inventory: Inventory | null;
  catalogue_version: number;
  unit_id: string | null;
  unit_name: string | null;
  unit_version?: number;
  description: string | null;
  inquiry_id: string | null;
  inquiry: Inquiry | null;
  request_qty: number;
  approved_qty?: number;
  rejected_qty?: number;
  remaining_qty?: number;
  created_at: number | null;
  created_by: People | null;
  updated_at: number | null;
  checked: boolean;
  version?: number;
  item_request_trail: ItemRequestTrail[];
  stok?: number;
  total_canvassing_vendor?: number;
};

export type ItemRequestTrail = {
  unique_id: string;
  item_name?: string;
  request_number?: string;
  data_reference?: any;
  item_request_id: string;
  item_request_version: number;
  item_request?: ItemRequest;
  reference: ItemRequestTrailReference;
  reference_id?: string | null;
  reference_code?: string;
  version?: number;
  reference_version?: number;
  quantity?: number;
  request_quantity?: number;
  status?: ItemRequestTrailStatus;
  created_at: number;
  created_by: string;
  updated_at: number;
  checked?: boolean;
  vendor?: CanvassingVendor[];
};
