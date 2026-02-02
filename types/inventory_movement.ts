import type { AddressType } from "./address";
import type { Contact } from "./contact";
import type { Inventory } from "./inventory";

export interface FileDocument {
  unique_id: string;
  inventory_movement_id: string;
  filename: string;
  mime_type: string;
  image_path: string;
}

export enum InventoryMovementStatus {}

export enum InventoryMovementReferenceItem {
  INQUIRY = "inquiry",
  ITEM_REQUEST = "item_request",
}

export interface InventoryMovementItem {
  id: number;
  unique_id: string;
  movement_id: string;
  inventory_id: string;
  quantity: number;
  created_at: number;
  created_by: string;
  updated_at: number;
  version: number;
  is_traceable: boolean;
  sn: string;
  cost: number;
  selling_price: number;
  contact_id: string | null;
  contact_name: string | null;
  contact_version: number | null;
  inventory: Inventory | null;
}

export interface InventoryMovement {
  id: number;
  unique_id: string;
  unique_code: string;
  type: "in" | "out"; // Sesuai dengan contoh data
  reference_to?: string;
  reference: string;
  reference_id: string;
  from: string;
  from_name: string;
  from_version: number;
  to: string;
  to_name: string;
  to_version: number;
  status:
    | "draft"
    | "waiting"
    | "approve"
    | "done"
    | "cancelled"
    | "repair"
    | "ready"
    | "delivery"; // Bisa disesuaikan dengan status lainnya
  address_id: string | null;
  address_version: number | null;
  delivery_id: string | null;
  schedule_date: number | null;
  source_document: string | null;
  created_at: number;
  created_by: string;
  updated_at: number;
  version: number;
  inventory_movement_item: InventoryMovementItem[];
  address: AddressType | null; // Jika struktur `address` diketahui, lebih baik diganti dengan tipe yang sesuai
  checked?: boolean | null;
  contact?: Contact;
  files: FileDocument[];
  data_reference?: any;
}
