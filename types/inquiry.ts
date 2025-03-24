import type { Catalogue } from "./catalogue"
import type { Contact } from "./contact"
import type { ItemRequest } from "./item_request"
import type { Maintenance } from "./maintenance"
import type { People } from "./people"

export type Inquiry = {
    unique_id: string | null,
    unique_code: string | null,
    date: number | null,
    reference: string
    reference_id: string,
    location_id: string,
    location: Catalogue | null,
    reference_view: string,
    status: string,
    priority: string,
    description: string | null,
    reference_data: Contact | Maintenance | null,
    checked?: boolean,
    people: People,
    item_request: ItemRequest[],
}