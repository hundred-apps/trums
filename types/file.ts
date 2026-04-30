export enum AppFileReference {
  PEOPLE = "people",
  RECRUITMENTS = "recruitments",
  CATALOGUES = "catalogues",
  INVOICES = "invoices",
  TRANSACTIONS = "transactions",
  OFFERS = "offers",
  INVENTORY_MOVEMENT = "inventory_movement",
  CANVASSING = "canvassing",
  PURCHASE_REQUEST = "purchase_request",
  INQUIRIES = "inquiries",
  PURCHASE_ORDER = "purchase_order",
  PRICETAG = "pricetag",
  PRICETAG_ITEM = "pricetag_item",
  CANVASSING_ITEM = "canvassing_item",
  CANVASSING_VENDOR = "canvassing_vendor",
  ITEM_REQUEST = "item_request",
  INSPECTIONS = "inspections",
  INSPECTION_ITEM = "inspection_item",
  MAINTENANCES = "maintenances",
  MAINTENANCE_ITEM = "maintenance_item",
  INVENTORIES = "inventories",
  INVENTORY_MOVEMENT_ITEM = "inventory_movement_item",
  TRANSACTION_ITEMS = "transaction_items",
}
export enum AppFileType {
  LOGO = "logo",
  KOP_SURAT = "kop_surat",
  STEMPEL = "stempel",
  TANDA_TANGAN = "tanda_tangan",
  FAKTUR_PAJAK = "faktur_pajak",
}

const typesObject = {
  logo: "LOGO",
  kop_surat: "KOP SURAT",
  stempel: "STEMPEL",
  tanda_tangan: "TANDA TANGAN",
  faktur_pajak: "FAKTUR PAJAK",
};

export const getDisplayFileType = (type: AppFileType | null) =>
  type == null ? "N/A" : typesObject[type];

export type AppFile = {
  id: number;
  unique_id: string;
  filename: string;
  filename_original?: string;
  mime_type: string;
  image_path: string;
  created_at: number;
  type: AppFileType | null;
};
