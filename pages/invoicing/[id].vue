<template>
  <TrumsWrapper>
    <InvoiceDetail />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import InvoiceDetail from "../finance-management/invoice/components/InvoiceDetail.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Invoicing - Detail Invoice",
  layout: "partial-feature",
});

onMounted(() => {
  // fetchData();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
