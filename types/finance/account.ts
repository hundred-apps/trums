import type { AccountRole } from "./account_role";

// Definisi enum untuk tipe akun
export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  REVENUE = "revenue",
  EQUITY = "equity",
  EXPENSE = "expense",
}

export enum AccountMappingReference {
  ADJUSTMENT_TRANSACTION = "adjustments_transaction",
  CATALOGUES = "catalogues",
}

export type AccountMapping = {
  unique_id: string;
  reference: AccountMappingReference;
  reference_id: string;
  account_role?: AccountRole;
  account_role_id: string;
  account_id: string;
  account_name?: string;
  version: number;
};

// Interface utama
export type Account = {
  unique_id: string; // Primary key
  parent_id: string | null; // Referensi ke parent account (jika ada)
  code: string; // Unique code
  name: string; // Nama akun
  type: AccountType; // Enum: asset/liability/revenue/equity/expense
  created_at: number; // Timestamp (unix epoch)
  created_by: string; // ID/user yang membuat,
  parent?: Account | null;
  children?: Account[];
  version?: number;
  checked?: boolean;
};

export const sampleAccount: Account[] = [
  {
    unique_id: "acc_001",
    parent_id: null,
    code: "1101",
    name: "Kas di Tangan",
    type: AccountType.ASSET,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_002",
    parent_id: null,
    code: "1102",
    name: "Kas di Bank",
    type: AccountType.ASSET,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_003",
    parent_id: null,
    code: "1201",
    name: "Piutang Usaha",
    type: AccountType.ASSET,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_004",
    parent_id: null,
    code: "2101",
    name: "Hutang Usaha",
    type: AccountType.LIABILITY,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_005",
    parent_id: null,
    code: "3101",
    name: "Modal Pemilik",
    type: AccountType.EQUITY,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_006",
    parent_id: null,
    code: "4101",
    name: "Pendapatan Penjualan",
    type: AccountType.REVENUE,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_007",
    parent_id: null,
    code: "5101",
    name: "Beban Listrik",
    type: AccountType.EXPENSE,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_008",
    parent_id: null,
    code: "5102",
    name: "Beban Air",
    type: AccountType.EXPENSE,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_009",
    parent_id: null,
    code: "5103",
    name: "Beban Internet",
    type: AccountType.EXPENSE,
    created_at: Date.now(),
    created_by: "user_001",
  },
  {
    unique_id: "acc_010",
    parent_id: null,
    code: "5104",
    name: "Beban Gaji",
    type: AccountType.EXPENSE,
    created_at: Date.now(),
    created_by: "user_001",
  },
];
