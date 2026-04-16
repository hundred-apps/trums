<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600 mr-3"> New Invoice </span>
    </template>
  </el-page-header>

  <AddInvoice />
</template>
<script lang="tsx" setup>
import AddInvoice from "../finance-management/invoice/components/AddInvoice.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Invoicing - Add Invoice",
  layout: "partial-feature",
});

const router = useRouter();
const goBack = () => router.back();

const layout = "partial-feature";
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-input-number) {
  width: 100% !important;
}
</style>
