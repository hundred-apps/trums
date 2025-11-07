import type { Contact } from "./contact"
import type { ItemRequest, ItemRequestTrail } from "./item_request"
import type { People } from "./people"

export enum PurchaseRequestStatus {
    DRAFT = 'draft',
    WAITING_APPROVAL = 'waiting_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANVASSING = 'canvassing',
}

export type PurchaseRequest = {
  unique_id: string
  source_document: string | null
  unique_code: string
  requester_id: string|null
  requester?: Contact,
  requester_name?: string,
  requester_version: number
  status: PurchaseRequestStatus,
  created_at: number // epoch timestamp (unix time)
  created_by: string // people.id (FK)
  updated_at: number // epoch timestamp (unix time)
  version: number,
  items_request_trail: ItemRequestTrail[],
  checked?: boolean,
  people?: People,
  note: string|null,
}

// Table: supply_chain_management.purchase_request_items
export type PurchaseRequestItem = {
  unique_id: string
  unique_code: string | null
  purchase_request_id: string // FK ke PurchaseRequest.unique_id
  item_request_id: string
  item_request?: ItemRequest,
  purchase_request?: PurchaseRequest,
  catalogue_name: string | null
  item_request_number: string
  request_quantity: number
  request_purchase_quantity: number
  purchase_request_version: number
  item_request_version: number
  status: PurchaseRequestStatus,
  checked?: boolean;

}