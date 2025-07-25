import type { Contact } from "./contact"
import type { Inventory } from "./inventory"
import type { FileDocument } from "./inventory_movement"

export type Consigment = {
    unique_id: string,
    unique_code: string,
    contact_id: string,
    contact_name: string,
    contact_version: number,
    contact?: Contact,
    inventory_movement_items: ConsigmentItem[],
    transaction_recaps_item: ConsigmentItem[],
    files: FileDocument[],
    checked?: boolean,
}

export type ConsigmentItem = {
    unique_id: string,
    recap_id: string,
    quantity: number,
    sn: string,
    selling_price: number,
    inventory_id: string,
    inventory_name: string,
    location_id: string,
    location_name: string,
    transaction_date: number,
    inventory_movement_id: string,
    unit_name: string,
    inventory?: Inventory,
    checked?: boolean,
}


