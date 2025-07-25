import type { Catalogue } from "./catalogue"
import type { Pricelist_item } from "./pricelist";
import type { Unit } from "./unit"

export type Inventory = {
    id: number,
    name?: string,
    unique_id: string,
    unique_code: string,
    catalogue_id: string,
    catalogue: Catalogue,
    location_id: string,
    is_traceable: boolean,
    traceable?: number,
    sn: string,
    unit_id: string,
    unit_name: string,
    quantity: number,
    cost: number,
    selling_price?: number,
    contact_id?: string,
    contact_name?: string,
    contact_version?: number,
    location: Catalogue|null
    checked?: boolean,
    unit: Unit|null;
    version: number,
    pricelist_item?: Pricelist_item,

}