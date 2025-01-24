import type { Catalogue } from "./catalogue";

export type Maintenance = {
    id: number;
    unique_id: string;
    unique_code: string;
    inspection_item_id: string;
    maintenance_date: number;
    team_id: string | null;
    responsible_id: string | null;
    duration: number | null;
    start_date: number | null;
    end_date: number | null;
    is_repeate: boolean | null;
    repeate_unit: string | null;
    repeate_value: number | null;
    priority: string;
    status: string;
    type: string;
    created_at: number;
    created_by: string;
    updated_at: number;
    catalogues: Catalogue | null,
};