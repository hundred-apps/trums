import type { Contact } from "./contact";
import type { Canvassing } from "./scm/canvasing";
import type { PurchaseOrder } from "./scm/purchase_order";


export enum FeeType{
  PERCENT='percent',
  AMOUNT='amount',
}
export enum ReferenceAdjustment {
  CONTACT='contact',
  CANVASSING='canvassing',
  CANVASSINGITEM='canvassing_item',
  CANVASSINGVENDOR='canvassing_vendor',
  PURCHASEORDER='purchase_order',
}

export enum PartyType {
  CONTACT='contact',
  CANVASSING='canvassing',
  CANVASSINGITEM='canvassing_item',
  CANVASSINGVENDOR='canvassing_vendor',
  PURCHASEORDER='purchase_order',
}
export type FeeOperator = 'plus' | 'minus' | 'multiply' | 'divide';


// Adjustment component definition
export type AdjustmentTransaction = {
  unique_id: string;        // primary key (UUID/ULID/string)
  unique_code: string;      // unique code for adjustment
  name: string;
  type: FeeType;
  default_value: number;    // decimal -> number in TS
  operator: FeeOperator;
  allow_party: boolean;
  created_at: number;       // unix timestamp
  updated_at: number;     
  checked?: boolean;
  version?: number;
};

// Reference transaction adjustment (usage of adjustment in a transaction)
export type ReferenceTransactionAdjustment = {
  unique_id: string;        // primary key
  reference: ReferenceAdjustment;        // table name or entity reference
  reference_id: string;     // ID from the reference table
  reference_view?: string;
  adjustment_id: string;    // FK to AdjustmentTransaction.unique_id
  value: number | null;    // optional override value
  type: FeeType;    // optional override value
  amount: number;           // final calculated amount
  amount_nominal?: number;
  adjustment?: AdjustmentTransaction;
  adjustments_transaction?: AdjustmentTransaction;
  // Polymorphic relation
  party_type?: PartyType; // could be 'contact' | 'warehouse' | 'agent' etc.
  party_id?: string | null;
  party?: Contact|Canvassing|PurchaseOrder;
  changeType?: boolean;
  created_at?: number;       // unix timestamp
};
