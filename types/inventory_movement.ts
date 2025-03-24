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
  }
  
  export interface InventoryMovement {
    id: number;
    unique_id: string;
    unique_code: string;
    type: 'in' | 'out'; // Sesuai dengan contoh data
    reference: string;
    reference_id: string;
    from: string;
    from_name: string;
    from_version: number;
    to: string;
    to_name: string;
    to_version: number;
    status: 'draft' | 'waiting' | 'approve' | 'done' | 'cancelled' | 'repair'; // Bisa disesuaikan dengan status lainnya
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
    address: any | null; // Jika struktur `address` diketahui, lebih baik diganti dengan tipe yang sesuai
    checked?: boolean|null,
  }
  