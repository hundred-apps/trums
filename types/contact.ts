import type { AddressType } from "./address";

export type Contact = {
    id: number;
    parent_id?: string,
    parent_name?: string,
    parent_version?: number,
    unique_id: string;
    unique_code: string;
    is_personal: boolean;
    is_company: boolean | null;
    internal_id: string;
    name: string;
    email: string;
    phone: string | null;
    tax_id: string | null;
    website: string | null;
    title: string | null;
    tags: string | string[] | null;
    tmp_tags?: string[],
    created_at: number;
    created_by: string;
    updated_at: number;
    ownership?: boolean;
    version: number;
    address: AddressType[];
    checked?: boolean;
};