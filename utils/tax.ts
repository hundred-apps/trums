import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";

export const getDppComponent = (
  refs: ReferenceTransactionAdjustment[]
): ReferenceTransactionAdjustment | undefined => {
  return refs.find(
    (value) =>
      (value.adjustment ?? value.adjustments_transaction!).category ==
        "transform" &&
      (value.adjustment ?? value.adjustments_transaction!).unique_code == "DPPL"
  );
};

export const getPPNComponent = (
  refs: ReferenceTransactionAdjustment[]
): ReferenceTransactionAdjustment | undefined => {
  return refs.find(
    (value) =>
      (value.adjustment ?? value.adjustments_transaction!).category == "tax" &&
      (value.adjustment ?? value.adjustments_transaction!).name.toLowerCase() ==
        "ppn"
  );
};

export const getPPNFormula = (
  ref: ReferenceTransactionAdjustment,
  amount: number
) => {
  if (ref.type == FeeType.AMOUNT) {
    return ref.amount || 0;
  } else {
    return displayAmount(ref, amount || 0);
  }
};

export const getDPPFormula = (
  ref: ReferenceTransactionAdjustment,
  amount: number
) => {
  if (ref.type == FeeType.AMOUNT) {
    return ref.amount || 0;
  } else {
    return displayAmount(ref, amount || 0);
  }
};
