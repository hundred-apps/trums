export type Catalogue = {
    id: number | null;
    unique_id: string | null;
    unique_code: string | null;
    name: string | null;
    brand_id: string | null;
    brand_name: string|null,
    year: string | null,
    sn: string | null;
    description: string | null;
    berat: number | null;
    volume: number | null;
    panjang: number|null;
    lebar: number|null;
    tinggi: number|null;
    is_asset: boolean | null;
    tmp_asset: string|null;
    version: number | null;
    type: string;
    created_at: number | null;
    created_by: string | null;
    updated_at: number | null;
    file_catalogues: any[];
    checked?: boolean;
}