import type { People } from "./people";

export enum TaxUnit {
    PERCENT = 'percentage',
    NOMINAL = 'nominal',
}

export type Tax = {
    id: number|null;
    unique_id:string|null;
    tax_name:string|null;
    tax_value:number|null;
    unit: TaxUnit|null;
    description:string|null;
    created_at: number|null;
    created_by: number|null;
    updated_at: number|null;
    people?: People;
    checked?: boolean;
}
