export type Contact = {
    id: number;
    unique_id: string;
    unique_code: string;
    is_personal: boolean;
    is_company: boolean | null;
    internal_id: number;
    name: string;
    email: string;
    phone: string | null;
    tax_id: string | null;
    website: string | null;
    title: string | null;
    tags: string | null;
    created_at: number;
    created_by: string;
    updated_at: number;
};