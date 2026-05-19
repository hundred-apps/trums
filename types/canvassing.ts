import type { Contact } from "./contact";

type CanvassingStatus = "draft" | "pending_approval" | "cancel";

export type Canvassing = {
  id: number | null;
  unique_id: string | null;
  unique_code: string | null;
  source_document: string | null;
  description: string | null;
  status: CanvassingStatus;
  version: number | null;
  created_at: number | null;
  created_by: number | null;
  updated_at: number | null;
  items: CanvassingItem[];
};

export type CanvassingItem = {
  id: number | null;
  unique_id: string | null;
  canvassing_id: number | null;
  item_request_id: number | null;
  created_at: number | null;
  created_by: number | null;
  updated_at: number | null;
  item_vendors: CanvassingVendor[];
};

export type CanvassingVendor = {
  id: number | null;
  unique_id: string | null;
  canvassing_item_id: number | null;
  offer_item_id: number | null;
  offer_item_name: string | null;
  offer_vendor_name: string | null;
  offer_item_version: number | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
  is_warranty: boolean;
  warranty: number | null;
  warranty_unit: string | null;
  discount: number | null;
  discount_unit: string | null;
  delivery_time: number | null;
  delivery_unit_time: string | null;
  delivery_cost: number | null;
  sourcing_document: string | null;
  additinal_information: string | null;
  created_at: number | null;
  created_by: number | null;
  updated_at: number | null;
  taxs: CanvassingVendorTax[];
  vendor?: Contact | null;
};

export type CanvassingVendorTax = {
  id: number | null;
  unique_id: string | null;
  canvassing_vendor_id: number | null;
  tax_id: number | null;
  tax_name: string | null;
  tax_value: number | null;
  tax_amount: number | null;
  include: boolean;
  created_at: number | null;
  created_by: number | null;
  updated_at: number | null;
};

export const dataCanvasingExample: Canvassing[] = [
  {
    id: 1,
    unique_id: "CNSV001",
    unique_code: "DRAFT",
    source_document: "CNSV-100929DBSS",
    description: "Pengadaan untuk proyek Jambi Pelumas",
    status: "draft",
    version: 1,
    created_at: 1625123400, // Unix timestamp untuk waktu pembuatan
    created_by: 1001, // ID user yang membuat pengadaan ini
    updated_at: 1625123500, // Unix timestamp untuk waktu pembaruan
    items: [
      {
        id: 1,
        unique_id: "ITEM001",
        canvassing_id: 1, // Merujuk ke pengadaan ini
        item_request_id: 1,
        created_at: 1625123400,
        created_by: 1001,
        updated_at: 1625123500,
        item_vendors: [
          {
            id: 1,
            unique_id: "VENDOR001",
            canvassing_item_id: 1, // Merujuk ke item ini
            offer_item_id: 101,
            offer_item_name: "Oli Meditran SX",
            offer_vendor_name: "Vendor A",
            offer_item_version: 1,
            quantity: 100, // Jumlah item yang dibutuhkan
            unit_price: 50, // Harga per unit (misalnya per liter)
            total_price: 5000, // Total harga untuk 100 unit
            is_warranty: false,
            warranty: null,
            warranty_unit: null,
            discount: 5, // Diskon 5%
            discount_unit: "percent",
            delivery_time: 7, // Waktu pengiriman dalam hari
            delivery_unit_time: "hari",
            delivery_cost: 100, // Biaya pengiriman
            sourcing_document: "VendorA_Proposal.pdf",
            additinal_information: "Oli Meditran SX untuk kendaraan berat.",
            created_at: 1625123400,
            created_by: 1001,
            updated_at: 1625123500,
            taxs: [
              {
                id: 1,
                unique_id: "TAX001",
                canvassing_vendor_id: 1,
                tax_id: 1,
                tax_name: "PPN",
                tax_value: 10,
                tax_amount: 500,
                include: true,
                created_at: 1625123400,
                created_by: 1001,
                updated_at: 1625123500,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        unique_id: "ITEM002",
        canvassing_id: 1,
        item_request_id: 2,
        created_at: 1625123401,
        created_by: 1001,
        updated_at: 1625123501,
        item_vendors: [
          {
            id: 2,
            unique_id: "VENDOR002",
            canvassing_item_id: 2,
            offer_item_id: 102,
            offer_item_name: "Oli Fastron Techno 10W-40",
            offer_vendor_name: "Vendor B",
            offer_item_version: 1,
            quantity: 150, // Jumlah item yang dibutuhkan
            unit_price: 70, // Harga per liter
            total_price: 10500, // Total harga untuk 150 unit
            is_warranty: false,
            warranty: null,
            warranty_unit: null,
            discount: 7, // Diskon 7%
            discount_unit: "percent",
            delivery_time: 10, // Waktu pengiriman dalam hari
            delivery_unit_time: "hari",
            delivery_cost: 150, // Biaya pengiriman
            sourcing_document: "VendorB_Proposal.pdf",
            additinal_information: "Oli Fastron untuk mesin industri.",
            created_at: 1625123401,
            created_by: 1001,
            updated_at: 1625123501,
            taxs: [
              {
                id: 2,
                unique_id: "TAX002",
                canvassing_vendor_id: 2,
                tax_id: 2,
                tax_name: "PPN",
                tax_value: 10,
                tax_amount: 1050,
                include: true,
                created_at: 1625123401,
                created_by: 1001,
                updated_at: 1625123501,
              },
            ],
          },
        ],
      },
      {
        id: 3,
        unique_id: "ITEM003",
        canvassing_id: 1,
        item_request_id: 3,
        created_at: 1625123402,
        created_by: 1001,
        updated_at: 1625123502,
        item_vendors: [
          {
            id: 3,
            unique_id: "VENDOR003",
            canvassing_item_id: 3,
            offer_item_id: 103,
            offer_item_name: "Oli Castrol GTX Magnatec 5W-30",
            offer_vendor_name: "Vendor C",
            offer_item_version: 1,
            quantity: 200, // Jumlah item yang dibutuhkan
            unit_price: 85, // Harga per liter
            total_price: 17000, // Total harga untuk 200 unit
            is_warranty: false,
            warranty: null,
            warranty_unit: null,
            discount: 10, // Diskon 10%
            discount_unit: "percent",
            delivery_time: 14, // Waktu pengiriman dalam hari
            delivery_unit_time: "hari",
            delivery_cost: 200, // Biaya pengiriman
            sourcing_document: "VendorC_Proposal.pdf",
            additinal_information: "Oli Castrol untuk mesin kendaraan ringan.",
            created_at: 1625123402,
            created_by: 1001,
            updated_at: 1625123502,
            taxs: [
              {
                id: 3,
                unique_id: "TAX003",
                canvassing_vendor_id: 3,
                tax_id: 3,
                tax_name: "PPN",
                tax_value: 10,
                tax_amount: 1700,
                include: true,
                created_at: 1625123402,
                created_by: 1001,
                updated_at: 1625123502,
              },
            ],
          },
        ],
      },
    ],
  },
];
