import type { Catalogue } from "./catalogue"
import type { Inquiry } from "./inquiry"
import type { Inventory } from "./inventory"
import type { People } from "./people"
import type { PurchaseRequest } from "./purchase_request"

export type ItemRequest = {
    id: number,
    unique_id: string | null,
    catalogue_id: string|null,
    catalogue_name: string|null,
    catalogue: Catalogue|null,
    inventory_id: string|null,
    inventory: Inventory|null,
    catalogue_version: number,
    unit_id: number|null,
    unit_name: string|null,
    description: string|null,
    inquiry_id: string|null,
    inquiry: Inquiry|null,
    request_id: string|null,
    request: PurchaseRequest|null,
    quantity: number,
    created_at: number | null,
    created_by: People | null,
    updated_at: number | null,
}