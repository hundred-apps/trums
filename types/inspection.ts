import type { Inventory } from "./inventory"

export type Inspection = {
    id: number,
    unique_id: string,
    unique_code: string,
    inspection_name: string,
    inspection_date: number,
    condition: string|null,
    status: string,
    created_at: number|null,
    created_by: string|null,
    updated_at: number|null,
    items: InspectionItem[],
}

export type InspectionItem = {
    id: number,
    unique_id: string,
    unique_code: string,
    inventory_id: string|null,
    inventory: Inventory|null,
    pic: string|null,
    condition: string|null,
    created_at: number|null,
    created_by: string|null,
    updated_at: number|null
}