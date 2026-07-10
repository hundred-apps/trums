<template></template>

<script lang="tsx" setup>
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { PurchaseOrderItem } from "~/types/scm/purchase_order";

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      purchase_order: {
        type: ["so"],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: "DESC",
  },
  flag: "list",
});

const { data, refresh } = await useAsyncData(
  "fetch-purchase-order-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      "fetch-purchase-order-item",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);
</script>
