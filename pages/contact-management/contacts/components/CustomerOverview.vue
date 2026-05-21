<template></template>
<script lang="tsx" setup>
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { PurchaseOrder } from "~/types/scm/purchase_order";

const request_search_po_histories = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      vendor_id: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inquiries",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});
const customer_po_histories = await useAsyncData(
  "fetch-order-histories",
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
      `/search`,
      "fetch-order-histories",
      "post",
      request_search_po_histories.value
    );
    return res.data.value;
  }
);
</script>
