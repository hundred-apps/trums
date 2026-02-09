import type { UploadUserFile } from "element-plus";
import type { AddressType } from "../address";
import type { ReferenceTransactionAdjustment } from "../attribute_adjustment";
import type { Catalogue } from "../catalogue";
import type { Contact } from "../contact";
import type { Inquiry } from "../inquiry";
import type { ItemRequest, ItemRequestTrail } from "../item_request";
import type { PurchaseRequestItem } from "../purchase_request";
import type { DeliveryUnitTime, DiscountUnit, WarrantyUnit } from "./offers";
import type { AppFile } from "../file";

export enum CanvassingStatus {
  DRAFT = "draft",
  CANVASSING = "canvassing",
  RAB = "rab",
  PENDING_APPROVAL = "pending_approval",
  PENDING_APPROVAL_RAB = "pending_approval_rab",
  DONE = "done",
  CANCEL = "cancel",
}

export enum CanvassingVendorStatus {
  SUBMITTED = "submitted",
  SELECTED = "selected",
  REJECTED = "rejected",
}

export enum PaymentTerm {
  CASH = "cash",
  COD = "cod",
  CBD = "cbd",
  TEMPO = "tempo",
}
export enum PaymentTermUnit {
  DAY = "day",
  MONTH = "month",
  YEAR = "year",
}

export function paymentTermView(term: PaymentTerm | undefined) {
  switch (term) {
    case PaymentTerm.CASH:
      return "CASH";
    case PaymentTerm.TEMPO:
      return "TEMPO";
    case PaymentTerm.COD:
      return "COD";
    case PaymentTerm.CBD:
      return "CBD";
    default:
      return "N/A";
  }
}

export type Canvassing = {
  unique_id: string | null;
  unique_code: string | null;
  source_document: string | null;
  description?: string;
  status: CanvassingStatus;
  version: number;
  canvassing_item: CanvassingItem[];
  created_at: number;
  created_by: number;
  updated_at: number;
  checked?: boolean;
  note: string | null;
  canvasing_item_vendor_summery?: CanvassingItemVendorSummery[];
  reference_transaction?: ReferenceTransactionAdjustment[];
  source?: Inquiry;
  payment_term?: PaymentTerm;
  tempo_value?: number;
  tempo_unit?: PaymentTermUnit;
  address_id?: string;
  address?: AddressType;
  address_version?: number;
  address_view?: string;
};

export type CanvassingItem = {
  unique_id: string;
  canvassing_id: string;
  canvaasing_version: number;
  canvassing?: Canvassing;
  // item_request?: ItemRequest;
  item_request_trail?: ItemRequestTrail;
  item_request_trail_id: string;
  item_request_trail_version: number;
  canvassing_vendor: CanvassingVendor[];
  unit_id: string | null;
  unit_name: string | null;
  unit_version: number | null;
  catalogue_id: string;
  catalogue?: Catalogue;
  catalogue_name: string;
  quantity: number;
  unit_selling_price: number;
  created_at: number;
  created_by: number;
  updated_at: number;
  type_item: "request" | "quotation" | "equivalent";
  equivalent_id: string | null;
  files?: AppFile[];
  image?: string;
};

export type CanvassingVendor = {
  unique_id: string | null;
  type_item: "request" | "quotation" | "equivalent";
  equivalent_id: string | null;
  canvassing_item_id: string;
  canvassing_item?: CanvassingItem;
  pricetag_item_id: string | null;
  vendor_id: string | null;
  vendor?: Contact;
  pricetag_item_version: number;
  catalogue_id: string;
  catalogue_name: string;
  catalogue?: Catalogue;
  quantity: number;
  unit_price: number;
  selling_price?: number;
  total_price: number;
  is_warranty: boolean;
  warranty: number;
  unit_id: string | null;
  unit_name: string | null;
  unit_version: number | null;
  warranty_unit: WarrantyUnit | null;
  discount: number;
  discount_unit: DiscountUnit | null;
  delivery_time: number;
  delivery_unit_time: DeliveryUnitTime | null;
  delivery_cost: number;
  sourcing_document: string | null;
  status: CanvassingVendorStatus;
  additional_information?: string;
  created_at: number;
  created_by: number;
  updated_at: number;
  notes: string;
  children?: CanvassingVendor[];
  taxes: CanvassingVendorTax[];
  profit: number;
  profit_unit: "percent" | "amount";
  fee: number;
  fee_unit: "percent" | "amount";
  ongkir: number;
  ongkir_unit: "percent" | "amount";
  reference_transaction: ReferenceTransactionAdjustment[];
  files?: AppFile[];
};

export type CanvassingVendorTax = {
  unique_id: string;
  canvassing_vendor_id: string | null;
  tax_id: string | null;
  tax_name: string;
  tax_value: number;
  tax_amount: number;
  include: boolean;
  created_at: number;
  created_by: number;
  updated_at: number;
};

// Canvassing Form
export type CanvassingForm = {
  unique_id: string | null;
  source_document: string | null;
  description?: string;
  status: CanvassingStatus;
  canvassing_item: CanvassingItemForm[];
  inquiry?: Inquiry | null;
  payment_term?: PaymentTerm;
  tempo_value?: number;
  tempo_unit?: PaymentTermUnit;
  address_id?: string;
  address_version?: number;
  address_view?: string;
};

export type CanvasingVendorView = {
  vendor_name: string;
  vendor_id: string;
  vendor_version: number;
  items: CanvassingItemForm[];
};

export type CanvassingItemForm = {
  index: string;
  parent_index?: string;
  image?: string;
  imageFile?: UploadUserFile | null;
  canvassing_id: string | null;
  canvaasing_version: number | null;
  item_request_trail_version: number | null;
  item_request_trail_id: string | null;
  request_number?: string;
  unique_id: string | null;
  vendor_id: string | null;
  vendor_name: string;
  unit_id: string | null;
  unit_name: string | null;
  unit_version: number | null;
  offer_item_id: string | null;
  offer_item_version: number;
  catalogue_id: string;
  catalogue_name: string;
  sn: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: CanvassingVendorStatus;
  additional_information?: string;
  taxes: CanvassingVendorTaxForm[];
  editing: boolean | null;
  type: "parent" | "child";
  type_item: "request" | "equivalent" | "quotation" | "original";
  equivalent_id: string | null;
  children: CanvassingItemForm[];
  parent_catalogue_id?: string;
  selling_price: number;
  profit: number;
  profit_unit: "percent" | "amount";
  profit_nominal?: number;
  fee: number;
  fee_unit: "percent" | "amount";
  fee_nominal?: number;
  ongkir: number;
  ongkir_unit: "percent" | "amount";
  pricetag_item_id: string;
  pricetag_item_version: number;
  contacts_fee: ReferenceTransactionAdjustment[];
  checked?: boolean;
  has_different_unit?: boolean;
  files?: UploadUserFile[];
};

export type CanvassingItemVendorSummery = {
  unique_id: string;
  vendor_id: string;
  vendor_version: number;
  note: string;
  discount_unit: "percent" | "nominal";
  discount_value: number;
  canvassing_id: string | null;
  canvassing_version: number | null;
  created_at: number | null;
  created_by: string | null;
  updated_at: number | null;
  version: number | null;
};

export type CanvassingVendorTaxForm = {
  unique_id: string | null;
  tax_id: string | null;
  tax_name: string;
  tax_value: number;
  tax_amount: number;
  include: boolean;
};

export type QuotationVendor = {
  unique_id: string;
  vendor_id: string;
  vendor_name: string;
  price: number;
  margin: number;
  qty: number;
  selling_price: number;
  profit: number;
  profit_unit: "percent" | "amount";
  fee: number;
  fee_unit: "percent" | "amount";
  ongkir: number;
  ongkir_unit: "percent" | "amount";
};

export type QuatotationVendorEquivalent = {
  item_id: string;
  catalogue_id: string;
  parent_item_id: string;
  catalogue_name: string;
  sn: string;
  qty: number;
  vendors: QuotationVendor[];
};

export type QuotationItemInterface = {
  type: "request" | "equivalent";
  unique_id: string;
  item_id: string;
  parent_item_id: string;
  item_name: string;
  item_request_id: string;
  request_number: string;
  sn: string;
  qty: number | null;
  unit_id: string;
  unit_name: string;
  vendor: string | null;
  vendor_id: string | null;
  price: number;
  profit: number;
  profit_unit: "percent" | "amount";
  fee: number;
  fee_unit: "percent" | "amount";
  ongkir: number;
  ongkir_unit: "percent" | "amount";
  selling_price: number;

  margin: number;
  price_field: "input" | "label";
  equivalents: QuatotationVendorEquivalent[];
};
