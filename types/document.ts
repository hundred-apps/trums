export type TrumDoc = {
  created_at: number;
  created_by: string;
  reference: DocRef;
  reference_id: string;
  unique_code: string;
  unique_id: string;
  updated_at: number;
  version: number;
};

export enum DocRef {
  INVOICE = "invoice",
  PO = "po",
  SO = "so",
  RR = "receive",
  BILL = "bill",
  SCM_MEMO = "scm_memo",
  INQUIRY = "inquiry",
}

export function getDocRefView(doc: DocRef | undefined) {
  switch (doc) {
    case DocRef.INVOICE:
      return "INVOICE";
    case DocRef.PO:
      return "PO";
    case DocRef.BILL:
      return "Tagihan";
    case DocRef.SO:
      return "SO";
    case DocRef.SCM_MEMO:
      return "SCM Memo";
    case DocRef.INQUIRY:
      return "RFQ";
    default:
      return "";
  }
}

export function getDocRefLink(doc: TrumDoc | undefined) {
  if (doc) {
    if (doc.reference == DocRef.INVOICE) {
      return "/finance-management/invoice/" + doc.reference_id;
    } else if (doc.reference == DocRef.BILL) {
      return "/finance-management/bill/" + doc.reference_id;
    } else if (doc.reference == DocRef.PO) {
      return "/supply-chain-management/purchase/order/" + doc.reference_id;
    } else if (doc.reference == DocRef.SO) {
      return "/sales/order/" + doc.reference_id;
    } else if (doc.reference == DocRef.SCM_MEMO) {
      return "/sales/quotation/" + doc.reference_id;
    }
  } else {
    return "/error/404";
  }
}
