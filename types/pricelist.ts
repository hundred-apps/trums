import type { Catalogue } from "./catalogue"
import type { Contact } from "./contact"
import type { Inventory } from "./inventory"

export type Pricelist = {
    unique_id: string
    unique_code: string
    starting_date: number,
    location_id: string,
    location_version: number,
    location: Catalogue,
    contact_id: string,
    reference: string,
    reference_id: string|null,
    contact_version: number,
    contact_name: string,
    contacts: Contact,
    checked?: boolean,
    pricelist_item: Pricelist_item[],
    pricelist_contact: Pricelist_contact[],
    
}

export type Pricelist_contact = {
    contact_id: string,
    contact_version: number,
    contact_name: string,
    contacts?: Contact,
}

export type Pricelist_item = {
    unique_id: string,
    inventory_id: string,
    inventories: Inventory|null,
    inventory_version?: number,
    selling_price: number,
    stok: number,
    created_at: number,
    updated_at: number,
    created_by: number,
    readonly?: boolean,
}