import type { ItemRequest } from "./item_request"
import type { People } from "./people"

export type PurchaseRequest = {
    id: number,
    unique_id: string|null,
    unique_code: string|null,
    order_deadline: number | null,
    priority: string | null,
    source_document: string | null,
    description: string | null,
    created_at: number | null,
    created_by: People | null,
    updated_at: number | null,
    items: ItemRequest[],
}