import type { AddressType } from "./address";
import type { Catalogue } from "./catalogue";
import type { Contact } from "./contact";
import type { ItemRequest } from "./item_request";
import type { Maintenance } from "./maintenance";
import type { People } from "./people";
import type { Canvassing } from "./scm/canvasing";
import type { PurchaseOrder } from "./scm/purchase_order";

export enum InquiryStatus {
  DRAFT = "draft",
  WAITING = "waiting",
  APPROVE = "approve",
  DONE = "done",
  CANCEL = "cancelled",
}
export enum TypeInquiry {
  SALES_INQUIRY = "sales_inquiry",
  INTERNAL = "internal",
}
export enum InquiryReference {
  MAINTENANCE = "maintenance",
  NON_MAINTENANCE = "non_maintenance",
  SALES_ORDER = "so",
}

export function referenceView(ref: InquiryReference) {
  switch (ref) {
    case InquiryReference.MAINTENANCE:
      return "Maintenance";
    case InquiryReference.NON_MAINTENANCE:
      return "Non-Maintenance";
    case InquiryReference.SALES_ORDER:
      return "Sales Order";

    default:
      return ref;
  }
}

export type Inquiry = {
  unique_id: string | null;
  unique_code: string | null;
  date: number | null;
  type?: TypeInquiry;
  reference: string;
  reference_id: string;
  location_id: string;
  location: Catalogue | null;
  address_id?: string;
  address_version?: number;
  address?: AddressType;
  reference_view: string;
  status: InquiryStatus;
  priority: string;
  description: string | null;
  request_by?: Contact;
  request_by_id: string;
  request_by_version: number;
  request_to_id: string;
  request_to_version: number;
  request_to?: Contact;
  reference_data?: Contact | Maintenance | PurchaseOrder | null;
  checked?: boolean;
  people: People;
  item_request: ItemRequest[];
  canvassing?: Canvassing;
  sales_order?: PurchaseOrder;
  version?: number;
};
