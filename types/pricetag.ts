import type { Catalogue } from "./catalogue"
import type { Contact } from "./contact"
import type { Inventory } from "./inventory"

export type Pricetag = {
    unique_id: string,
    name: string,
    location_id: string,
    location: Catalogue
    start_date: number,
    end_date: number,
    start_date_view: string,
    end_date_view: string,
    owner_id: string,
    created_at: number,
    created_by: string,
    updated_at: number,
    version: number,
    pricetag_item: Pricetag_item[],
    pricetag_condition: Pricetag_condition[],
    checked?: boolean,
}

export type Pricetag_item = {
    unique_id: string|null,
    tag_id: string|null,
    catalogue_id: string,
    catalogue: Catalogue | null,
    inventory_id: string,
    inventory: Inventory|null,
    price: number,
    readonly?: boolean,
    is_new?: boolean,
}

export type Pricetag_condition = {
    unique_id: string|null,
    tag_id: string|null,
    variable?: string,
    operation?: string,
    value_display?: string,
    value: string,
    operation_pricetag?: Pricetag_variable,
    variable_pricetag?: Pricetag_variable,
    data?: Contact | Catalogue,
    is_new?: boolean,
}

export type Pricetag_variable = {
    unique_id: string,
    name: string,
    type: "variable"|"operation",
    slug: string,
}

export enum OperationPriceTag {
    IS_EQUAL = 'is_equal',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    IS_NOT = 'is_not',
}
export enum VariablePriceTag {
    ROLE = 'role',
    KONTAK = 'kontak',
    ITEM_QUANTITY = 'item_quantity',
    PURCHASE_AMOUNT = 'purchase_amount',
    LOCATION = 'location',
}