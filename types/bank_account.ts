import type { Account } from "./finance/account";
import type { People } from "./people";

export type Bank = {
  id: number;
  unique_id: string;
  bank_name: string;
  created_at: number; // timestamp
  created_by: number;
  updated_at: number;
  people?: People;
  checked?: boolean;
};

export type BankAccount = {
  id: number;
  unique_id: string;
  bank_id?: string | null; // nullable karena default: null
  bank_name: string;
  account_name: string;
  account_number: string;
  account_id?: string;
  account?: Account;
  created_at: number; // timestamp
  created_by: number;
  updated_at: number;
  checked?: boolean;
  version?: number;
};
