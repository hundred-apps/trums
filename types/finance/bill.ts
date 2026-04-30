export enum PaymentMethod {
  Cash = "cash",
  BankTransfer = "bank",
  Giro = "giro",
}

export const getPaymentMethodLabel = (payment: PaymentMethod) => {
  switch (payment) {
    case PaymentMethod.Cash:
      return "Cash";
    case PaymentMethod.BankTransfer:
      return "Bank Transfer";
    case PaymentMethod.Giro:
      return "Giro";
    default:
      return payment;
  }
};

export enum PaymentStatus {
  DRAFT = "draft",
  UNPAID = "unpaid",
  PAID = "paid",
  RECEIVED = "received",
  RELEASE = "release",
  PERFORMA_INVOICE = "performa",
  WAITING = "waiting",
  APPROVED = "approved",
  REJECTED = "rejected",
  DRAFTVIEW = "DRAFT",
  UNPAIDVIEW = "UNPAID",
  PAIDVIEW = "PAID",
  RECEIVEDVIEW = "RECEIVED",
  WAITINGVIEW = "WAITING",
  APPROVEDVIEW = "APPROVED",
  REJECTEDVIEW = "REJECTED",
  PERFORMA_INVOICE_VIEW = "performa",
}

export type Bill = {
  id: number;
  unique_id: string;
  unique_code: string;
  bill_date: number | null;
  bill_date_view?: string | null;
  due_date_view?: string | null;
  posted_date: number | null;
  due_date: number | null;

  to: string | null;
  to_name: string;
  to_version: number;
  to_address_id: string | null;
  to_address_version: number;
  to_address_view?: string;

  order_reference: string | null;
  order_reference_view?: string | null;

  recipient_bank: string | null;
  accont_bank_name: string | null;
  account_bank_number: string | null;

  tempo: boolean;

  payment_term_id: string;
  payment_term_value: number;
  payment_term_unit: string | null;

  payment_method: PaymentMethod;

  total_amount: number;
  status: PaymentStatus | null;

  account_id: string | null;
  account_name: string | null;

  created_at: number;
  created_by: number;
  updated_at: number;

  note: string | null;

  items: BillItem[];
};

export type BillItem = {
  id: number;
  unique_id: string;
  unique_code: string;
  bill_id: string;
  item_id: string | null;
  item_name: string | null;
  quantity: number;
  unit_price: number;
  unit_id: string;
  unit_name: string;
  amount: number;
  created_at: number;
  created_by: number;
  updated_at: number;
  item_version: number;
};
