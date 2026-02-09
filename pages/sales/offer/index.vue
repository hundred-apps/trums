<template>
  <TrumsWrapper>
    <el-card>
      <toCustomer />
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { TrumsWrapper } from "#components";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import fromVendor from "./fromVendor.vue";
import toCustomer from "./toCustomer.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Pricetag } from "~/types/pricetag";

const request_search_in = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["in"],
      category: ["penawaran"],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});
const request_search_out = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["out"],
      category: ["penawaran"],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const formVendorData = await useFetchApi<ResponsePagination<Pricetag[]>>(
  `/search`,
  "Pricetag-from-vendor",
  "post",
  request_search_in.value
);
const toCustomerData = await useFetchApi<ResponsePagination<Pricetag[]>>(
  `/search`,
  "Pricetag-to-vendor",
  "post",
  request_search_out.value
);

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "pricetag-read",
  name: "Daftar Penawaran",
});

const activeName = ref("vendor");
</script>
