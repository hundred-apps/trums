import type { Invoice } from "~/types/finance/invoice";
import type { Canvassing, CanvassingItem, CanvassingVendor } from "~/types/scm/canvasing";

function resolveCanvassing(
  dataReference: CanvassingItem | CanvassingVendor | undefined
): Canvassing | undefined {
  if (!dataReference) return undefined;

  if ("canvassing" in dataReference) {
    return dataReference.canvassing;
  }

  if ("canvassing_item" in dataReference) {
    return dataReference.canvassing_item?.canvassing;
  }

  return undefined;
}

export function getInvoiceInqNumbers(invoice: Invoice): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const orderItem of invoice.data_reference?.purchase_order_item ?? []) {
    const dataReference = orderItem.pricetag_item?.data_reference;
    const canvassing = resolveCanvassing(dataReference);
    const sourceDocument = canvassing?.source_document?.trim();

    if (!sourceDocument || seen.has(sourceDocument)) continue;

    seen.add(sourceDocument);
    result.push(sourceDocument);
  }

  return result;
}
