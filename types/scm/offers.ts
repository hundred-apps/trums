import type { Catalogue } from "../catalogue";
import type { People } from "../people";

// enums
export enum OfferType {
  IN = "in",
  OUT = "out",
}

export enum WarrantyUnit {
  HARI = "hari",
  MINGGU = "minggu",
  BULAN = "bulan",
  TAHUN = "tahun",
}

export const warrantyUnitOption = [
  {
    label: 'Day',
    value: WarrantyUnit.HARI,
  },
  {
    label: 'Week',
    value: WarrantyUnit.MINGGU,
  },
  {
    label: 'Month',
    value: WarrantyUnit.BULAN,
  },
  {
    label: 'Year',
    value: WarrantyUnit.TAHUN,
  },
]

export enum DiscountUnit {
  PRICE = "price",
  PERCENT = "percent",
}

export enum DeliveryUnitTime {
  HARI = "hari",
  MINGGU = "minggu",
  BULAN = "bulan",
  TAHUN = "tahun",
}

// main interface
export type Offer = {
  unique_id: string;
  contact_id: string;
  contact_name?: string;
  contact_version: number;
  type: OfferType;

  location_id?: string | null; // bisa nullable karena reference
  location_name?: string;
  location_version: number,
  sourcing_number?: string | null;
  sourcing_document?: string | null;

  warranty?: number | null;
  warranty_unit: WarrantyUnit;

  discount: number;
  discount_unit: DiscountUnit;

  delivery_time: number;
  delivery_unit_time: DeliveryUnitTime;

  delivery_cost?: number | null;

  order_deadline: number;
  version: number;

  created_at: number;
  created_by: People|null;
  updated_at: number;
}


export type OfferItemVendor = {
  id: number;
  unique_id: string;

  catalogue_id: string;
  catalogue?: Catalogue;
  catalogue_version: number;

  offer_id: string;
  offer_version: number;

  quantity: number;
  price: number;
  date: number;

  warranty: number;
  warranty_unit?: WarrantyUnit | null;

  discount: number;
  discount_unit?: DiscountUnit | null;

  version: number;

  created_at: number;
  created_by: People;
  updated_at: number;
}
