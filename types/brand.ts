export type Brands = {
    unique_id: string;
    parent_id: string | null;
    name: string;
    description: string | null;
    created_at: number;
    created_by: number;
    updated_at: number;
    version: number;
    checked?: boolean;
    parent?: Brands;
    children?: Brands[];
}