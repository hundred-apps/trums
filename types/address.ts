export type AddressType = {
    unique_id: string,
    contact_id: string|null,
    contact_version: number,
    contact_name: string,
    address_name: string,
    street: string,
    village_id: number,
    village: string,
    city: string,
    regency: string,
    province: string,
    country: string,
    created_at: number,
    created_by: number,
    updated_at: number,
    version: number,
    checked?: boolean,
}

export type coordinateAddress = {
    unique_id: string,
    address_id: string,
    address: AddressType,
    lat: string,
    lng: string,
    coordinate: string,
}

export type AddressSearch = {
    id: string,
    name: string,
}