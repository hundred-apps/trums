export type AddressType = {
  unique_id: string;
  contact_id: string | null;
  contact_version: number;
  phone?: string;
  contact_name: string;
  address_name: string;
  street: string;
  village_id: string;
  village: string;
  city: string;
  regency: string;
  province: string;
  country: string;
  codepos?: number;
  created_at: number;
  created_by: number;
  updated_at: number;
  version: number;
  checked?: boolean;
  villages?: Village;
  type?: AddressLabel;
  tmp_address_view?: string;
};

export enum AddressLabel {
  DELIVERY = "delivery",
  INVOICE = "invoice",
}

export type Village = {
  id: string;
  name: string;
  district_id: string;
  districts?: District;
};

export type District = {
  id: string;
  name: string;
  regency_id: string;
  regencies?: Regency;
};
export type Regency = {
  id: string;
  name: string;
  province_id: string;
  province?: Province;
};
export type Province = {
  id: string;
  name: string;
};

export type coordinateAddress = {
  unique_id: string;
  address_id: string;
  address: AddressType;
  lat: string;
  lng: string;
  coordinate: string;
};

export type AddressSearch = {
  id: string;
  name: string;
};
