export type Delivery = {
    unique_id: string;
    unique_code: string;
    to: string | null;
    to_name: string;
    to_version: number;
    address_id: number;
    address_version: number;
    status: string | null;
    schedule_date: number;
    source_document: string | null;
    created_at: number;
    created_by: string;
};