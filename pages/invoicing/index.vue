<template>
  <TrumsWrapper>
    <InvoiceTable />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import InvoiceTable from "../finance-management/invoice/components/InvoiceTable.vue";
import HeaderFeature from "~/components/trums/HeaderFeature.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Invoicing - List Invoice",
  layout: false,
});

import { ref } from "vue";

const activeIndex = ref("1");
const activeIndex2 = ref("1");
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

const layout = "partialFeature";
</script>

<style scoped>
/* :deep(.el-header) {
  padding: 0px !important;
} */
</style>
