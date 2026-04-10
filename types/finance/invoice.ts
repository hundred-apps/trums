import type { AddressType } from "../address";
import type { ReferenceTransactionAdjustment } from "../attribute_adjustment";
import type { Contact } from "../contact";
import type { TermOfPayment } from "../payment_term";
import type { PaymentTerm } from "../scm/canvasing";
import type { PaymentMethod, PaymentStatus } from "./bill";
import type { TransactionBank, TransactionItem } from "./transaction";

export enum FinanceReference {
  TRANSACTION_RECAP = "transaction_recap",
  SALES = "sales",
  PURCHASE_ORDER = "purchase_order",
  OTHER = "other",
}
export type StatisticInvoice = {
  total_invoices: number;
  total_nominal: number;
  total_draft: number;
  total_received: number;
  total_paid: number;
  total_unpaid: number;
};
export type Invoice = {
  unique_id: string;
  source_document?: string | null;
  unique_code: string;

  customer_id: string | null;
  customer_name: string;
  customer_version: number;

  vendor_id: string | null;
  vendor_name: string;
  vendor_version: number;
  vendor_address_id: string;
  vendor_address_view?: string;
  vendor_address_version: number;

  billing_address_id: string | null;
  billing_address_view: string;
  billing_address_version: number;

  billing_address?: AddressType;

  invoice_date?: number | null;
  due_date: number | null;
  received_date?: number | null;

  invoice_date_view?: string;
  due_date_view?: string;

  is_tempo: boolean;
  payment_term: PaymentTerm;
  payment_term_value?: number | null;
  payment_term_unit: "day" | "weeks" | "months" | null;
  payment_term_view?: string;
  payment_term_id?: string;
  payment_method: PaymentMethod;
  recipient_bank?: string | null;
  account_bank_name?: string | null;
  account_bank_number?: string | null;

  account_id: string | null;
  account_name?: string | null;

  status: PaymentStatus;

  subtotal?: number;
  total_amount: number;
  paid_amount?: number;

  invoice_item: InvoiceItem[];

  notes: string | null;

  reference: string | null;
  reference_id: string | null;
  reference_number: string | null;

  created_at: number;
  created_by: number;
  updated_at: number;
  checked?: boolean;
  history_payment?: TransactionItem[];
  purchase_order_bank?: TransactionBank[];
  data_reference?: any;
  reference_transaction?: ReferenceTransactionAdjustment[];
  vendor?: Contact;
  vendor_address?: AddressType;
  payment_terms?: TermOfPayment;

  subject?: string;
  type: "in" | "out";
  pic_id?: string;
  pic_name?: string;
  pic_version?: number;
};

export type InvoiceItem = {
  unique_id: string;
  unique_code: string;

  invoice_id: string | null;
  item_id: string | null;

  item_version: number;
  item_name: string;

  unit_id: string;
  unit_name: string;
  quantity: number;
  price: number;
  total_amount: number;

  version: number;
  invoice_version: number;
  created_at: number;
  created_by: number;
  updated_at: number;
};
