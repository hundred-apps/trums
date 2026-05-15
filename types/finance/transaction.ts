import type { BankAccount } from "../bank_account";
import type { AppFile } from "../file";
import type { People } from "../people";
import type { Account } from "./account";
import type { PaymentMethod } from "./bill";

export enum TransactionBankReference {
  PURCHASEORDER = "purchase_order",
  INVOICE = "invoice",
}

export type TransactionBank = {
  unique_id: string;
  reference: TransactionBankReference;
  reference_id: string;
  bank_account_id: string;
  bank_account_name: string;
  bank_account_version: number;
  bank?: BankAccount;
};

export type Transaction = {
  unique_id: string;
  unique_code: string;
  type: "income" | "expense" | "transfer";

  recipient_bank: string | null;
  recipient_bank_version?: number;

  account?: Account;
  account_id: string | null;
  account_name: string | null;
  account_version?: number;

  account_bank_name: string | null;
  account_bank_number: string | null;
  account_bank_version?: number;

  bank_account?: BankAccount | null;
  bank_account_to?: BankAccount | null;

  recipient_bank_to?: string;
  recipient_bank_to_version?: number;

  account_bank_to_name?: string;
  account_bank_to_number?: string;
  account_bank_to_version?: number;

  account_to_id?: string;
  account_to_name?: string;
  account_to_version?: number;

  date: number;
  description: string;
  amount: number;
  display_amount?: string;

  transaction_items: TransactionItem[];
  created_at: number;
  created_by: string;
  files?: AppFile[];
  checked?: boolean;
  payment_method?: PaymentMethod;
  people?: People;
};

export type TransactionItem = {
  unique_id: string | null;
  account_id: string | null;
  reference: string | null; // digunakan untuk jika itemnya adalah invoice, bill, pembayaran atau kosong
  reference_id: string | null; // digunakan untuk menyimpan ID jika itemnya adalah invoice, bill, pembayaran
  reference_value: string; // digunakan untuk menyimpan nomor jika itemnya adalah invoice, bill, pembayaran atau jika pembelian langsung maka ini sebagai nama item
  description?: string;
  quantity: number;
  price_per_unit: number;
  amount: number;
  transaction?: Transaction;
  display_price_per_unit?: string;
  display_amount?: string;
  debit?: number;
  kredit?: number;
  debit_display?: string;
  kredit_display?: string;
};
