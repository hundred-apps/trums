import type { Catalogue } from "./catalogue"

export type Inventory = {
    id: number,
    unique_id: string,
    unique_code: string,
    catalogue_id: string,
    catalogue: Catalogue,
    location_id: number,
    is_traceable: number,
    sn: string,
    unit_id: number,
    unit_name: string,
    quantity: number,
    cost: number,

}