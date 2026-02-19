import type { PaymentTerm } from "./scm/canvasing";
export enum TermOfPaymentReference {
  RAB = "rab",
  PO = "po",
  OFFER = "offer",
}
export type TermOfPayment = {
  unique_id: string;
  unique_code: string;
  reference: TermOfPaymentReference;
  reference_id: string;
  name: string;
  value: number;
  unit: "percentage" | "nominal";
  term_of_payment: PaymentTerm;
  duration: number;
};
