import type { AddressType } from "./address";
import type { People } from "./people";

export type Contact = {
  id: number;
  parent_id?: string;
  parent_name?: string;
  parent_version?: number;
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
  tags: string;
  tmp_tags?: string[];
  created_at: number;
  created_by: string;
  updated_at: number;
  ownership?: boolean;
  version: number;
  address: AddressType[];
  checked?: boolean;
  parent?: Contact;
  people_internal?: People;
  children?: Contact[];
};

export type CustomerOverView = {
  average_payment_duration: number;
  total_invoices_nominal: number;
  total_paid_invoices: number;
  total_unpaid_nominal: number;
  total_paid_nominal: number;
  unpaid_invoices: UnpaidInvoice[];
};

type UnpaidInvoice = {
  unique_id: string;
  unique_code: string;
  nominal: number;
  aging_days: number;
  remaining_nominal: number;
};
