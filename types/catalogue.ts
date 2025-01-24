export type Catalogue = {
    id: number | null;
    unique_id: string | null;
    unique_code: string | null;
    name: string | null;
    brand_id: number | null;
    year: string | null;
    sn: string | null;
    description: string | null;
    berat: number | null;
    volume: number | null;
    is_asset: boolean | null;
    version: number | null;
    created_at: number | null;
    created_by: string | null;
    updated_at: number | null;
    file_catalogues: any[];
}