<template>
  <NuxtLayout :name="layout">
    <InvoiceTable :type="'invoicing'" />
  </NuxtLayout>
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

const layout = "partial-feature";

import { ref } from "vue";

const activeIndex = ref("1");
const activeIndex2 = ref("1");
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>
<style scoped>
:deep(.el-row) {
  margin-bottom: 20px;
}
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

:deep(.el-statistic) {
  --el-statistic-content-font-size: 28px;
}

:deep(.statistic-card) {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

:deep(.statistic-footer) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

:deep(.statistic-footer .footer-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.statistic-footer .footer-item span:last-child) {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

:deep(.is-guttered) {
  padding-top: 10px;
}

:deep(.green) {
  color: var(--el-color-success);
}
:deep(.red) {
  color: var(--el-color-error);
}
</style>
