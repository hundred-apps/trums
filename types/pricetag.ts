import type { UploadUserFile } from "element-plus";
import type { Catalogue } from "./catalogue";
import type { Contact } from "./contact";
import type { AppFile } from "./file";
import type { Inventory } from "./inventory";
import type { Canvassing } from "./scm/canvasing";
import type { TermOfPayment } from "./payment_term";
import type { ReferenceTransactionAdjustment } from "./attribute_adjustment";

export enum ReferencePriceTag {
  CANVASING_VENDOR = "canvassing_vendor",
  CANVASSING = "canvassing",
}

export type Pricetag = {
  unique_id: string;
  unique_code?: string;
  name: string;
  location_id: string;
  location: Catalogue;
  start_date: number;
  end_date: number;
  start_date_view: string;
  end_date_view: string;
  owner_id: string;
  owner_name?: string;
  owner?: Contact;
  to?: Contact;
  type: "in" | "out" | null;
  created_at: number;
  created_by: string;
  updated_at: number;
  version: number;
  pricetag_item: Pricetag_item[];
  pricetag_condition: Pricetag_condition[];
  checked?: boolean;
  reference: ReferencePriceTag | null;
  reference_version: number | null;
  reference_id: string | null;
  note: string;
  code?: string | null;
  to_id?: string;
  to_name?: string;
  to_version?: number;
  files: AppFile[];
  reference_data?: any | Canvassing;
  subject?: string;
  pic_id?: string;
  pic_name?: string;
  pic_version?: number;
  payment_terms?: TermOfPayment[];
  reference_transaction_adjustment?: ReferenceTransactionAdjustment[];
};

export type Pricetag_item = {
  item_name?: string;
  unique_id: string | null;
  tag_id: string | null;
  catalogue_id: string | null;
  catalogue: Catalogue | null;
  inventory_id: string;
  inventory: Inventory | null;
  quantity: number;
  price: number;
  displayPrice?: string;
  readonly?: boolean;
  pricetag?: Pricetag;
  sn?: string;
  checked?: boolean;
  is_new?: boolean;
  unit_id: string | null;
  unit_name: string | null;
  unit_version: number | null;
  version?: number;
  fileUploads: UploadUserFile[];
  image?: string;
  files?: AppFile[];
};

export type Pricetag_condition = {
  unique_id: string | null;
  tag_id: string | null;
  variable?: string;
  operation?: string;
  value_display?: string;
  value: string;
  operation_pricetag?: Pricetag_variable;
  variable_pricetag?: Pricetag_variable;
  data?: Contact | Catalogue;
  value_data?: Contact | Catalogue;
  is_new?: boolean;
};

export type Pricetag_variable = {
  unique_id: string;
  name: string;
  type: "variable" | "operation";
  slug: string;
};

export enum OperationPriceTag {
  IS_EQUAL = "is_equal",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  IS_NOT = "is_not",
}
export enum VariablePriceTag {
  ROLE = "role",
  KONTAK = "contact",
  ITEM_QUANTITY = "item_quantity",
  PURCHASE_AMOUNT = "purchase_amount",
  LOCATION = "location",
}

export function getVariableName(name: string) {
  if (name == VariablePriceTag.ITEM_QUANTITY) return "Minimum Quantity";
  if (name == VariablePriceTag.KONTAK) return "Kontak";
  if (name == VariablePriceTag.LOCATION) return "Lokasi";
  if (name == VariablePriceTag.PURCHASE_AMOUNT) return "Minimum Pembelian";
  return name;
}
export function getValue(condition: Pricetag_condition) {
  console.log(condition);
  if (condition.variable_pricetag?.name == VariablePriceTag.ITEM_QUANTITY) {
    return condition.value;
  }
  if (condition.variable_pricetag?.name == VariablePriceTag.KONTAK) {
    const contact: Contact = condition.value_data as Contact;
    return contact.name;
  }
  if (condition.variable_pricetag?.name == VariablePriceTag.LOCATION) {
    const catalogue: Catalogue = condition.value_data as Catalogue;
    return catalogue.name;
  }
  if (condition.variable_pricetag?.name == VariablePriceTag.PURCHASE_AMOUNT)
    return condition.value;
}

export function checkCondition(pricetag: Pricetag) {
  for (let index = 0; index < pricetag.pricetag_condition.length; index++) {
    const element = pricetag.pricetag_condition[index];
  }
}
