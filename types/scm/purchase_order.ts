import type { AddressType } from "../address";
import type { ReferenceTransactionAdjustment } from "../attribute_adjustment";
import type { Catalogue } from "../catalogue";
import type { Contact } from "../contact";
import type { PaymentMethod } from "../finance/bill";
import type { Invoice } from "../finance/invoice";
import type { ItemRequestTrail } from "../item_request";
import type { TermOfPayment } from "../payment_term";
import type { Tax } from "../tax";
import type { DiscountUnit } from "./offers";
// import { WarrantyUnit } from "./offers";

export enum PurchaseOrderStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "waiting",
  APPROVED = "approve",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  DONE = "done",
}
export enum PurchaseOrderItemStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "waiting_approval",
  CANCELLED = "cancelled",
  DONE = "done",
}

export type WarrantyUnit = "hari" | "minggu" | "bulan" | "tahun";
export type DeliveryUnitTime = "hari" | "minggu" | "bulan" | "tahun";

export type PurchaseOrderStatistic = {
  total_purchase_order: number;
  total_nominal: number;
  total_pending_approve: number;
  total_approve: number;
  total_vendor: number;
};

export type PurchaseOrder = {
  id: number;
  unique_id: string;
  unique_code: string;
  vendor_id: string;
  vendor_name: string;
  vendor?: Contact;
  vendor_version: number;
  sourcing_document?: string | null;
  total_price: number;
  delivery_address_id: string;
  delivery_address_version: number;
  delivery_address_view: string;
  address?: AddressType;
  expected_arrival?: number | null;
  date?: number | null;
  is_discount: boolean;
  discount: number;
  discount_unit?: DiscountUnit | null;
  delivery_cost: number;
  additional_information?: string;
  status: PurchaseOrderStatus;
  is_tempo: boolean;
  term_payment: string | null;
  term_payment_value: number | null;
  term_payment_unit: string | "day" | "month" | "year";
  method_payment: PaymentMethod;
  version: number;
  created_at: number;
  created_by: number;
  updated_at: number;
  checked?: boolean;
  purchase_order_item: PurchaseOrderItem[];
  type: "po" | "so";
  reference_transaction: ReferenceTransactionAdjustment[];
  reference_data: Invoice[];
  payment_terms?: TermOfPayment[];
  pic_id?: string;
  pic_name?: string;
  pic_version?: number;
  pic?: Contact;
};

export type StatisticOrder = {
  total_purchase_order: number;
  total_nominal: number;
};

export type PurchaseOrderItem = {
  id: number;
  unique_id: string;
  purchase_order?: PurchaseOrder;
  order_id: string;
  order_version: number;
  vendor_id: string;
  vendor_version: number;
  pr_item_request_trail_id: string | null;
  pr_number?: string;
  pr_item_request_trail_version: number;
  item_request_trail_id?: string | null;
  item_request_trail?: ItemRequestTrail;
  item_request_trail_version?: number | null;
  catalogue_id?: string | null;
  catalogue_name: string;
  catalogue_version: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  displayPrice?: string;
  is_warranty: boolean;
  warranty: number;
  warranty_unit?: WarrantyUnit | null;
  is_discount: boolean;
  discount?: number | null;
  discount_unit?: DiscountUnit | null;
  delivery_time?: number | null;
  delivery_unit_time?: DeliveryUnitTime | null;
  delivery_cost: number;
  sourcing_document?: string | null;
  additinal_information?: string;
  version: number;
  unit_id: string | null;
  unit_name: string | null;
  created_at: number;
  created_by: number;
  updated_at: number;
  status: PurchaseOrderItemStatus;
  catalogue?: Catalogue;
  checked?: boolean;
};

export type PurchaseOrderItemTax = {
  id: number;
  unique_id: string;
  purchase_order_item_id: number;
  tax_id: number;
  tax_name: string;
  tax_value: number;
  tax_amount: number;
  tax: Tax | null;
  include: boolean;
  created_at: number;
  created_by: number;
  updated_at: number;
};
