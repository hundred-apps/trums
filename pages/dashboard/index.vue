<script lang="ts" setup>
import { onMounted } from "vue";
import OrderSummery from "./components/OrderSummery.vue";
import WorkQueues from "./components/WorkQueues.vue";
import BillSummery from "../finance-management/bill/components/BillSummery.vue";
import InvoiceTable from "../finance-management/invoice/components/InvoiceTable.vue";
import { checkPermission } from "#imports";

definePageMeta({
  middleware: ["auth", "app"],
});

const canReadPO = ref(false);
const canReadInvoice = ref(false);
const currentYear = new Date().getFullYear();
const dateRange = ref<[Date, Date]>([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 31),
]);

onMounted(async () => {
  canReadPO.value = await checkPermission("purchase-order-read");
  canReadInvoice.value = await checkPermission("invoices-read");
});
</script>

<template>
  <TrumsWrapper>
    <el-card shadow="never" class="mb-6">
      <section class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-semibold">Ringkasan dashboard</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Filter tanggal berlaku untuk antrean kerja, penjualan, dan pembelian.</p>
        </div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          class="dashboard-date-filter self-end"
          range-separator="Sampai"
          start-placeholder="Tanggal dari"
          end-placeholder="Tanggal sampai"
          unlink-panels
        />
      </section>
      <WorkQueues :date-range="dateRange" />
      <el-divider v-if="canReadPO" />
      <h2 v-if="canReadPO" class="mb-3 text-lg font-semibold">Total penjualan dan pembelian</h2>
      <OrderSummery v-if="canReadPO" :date-range="dateRange" />
    </el-card>
    <div v-if="canReadInvoice">
      <p class="font-bold text-xl mb-3">INVOICE</p>
      <InvoiceTable />
      <p class="font-bold text-xl mb-5">TAGIHAN</p>
      <BillSummery />
    </div>
  </TrumsWrapper>
</template>

<style scoped>
:deep(.el-date-editor.dashboard-date-filter) {
  width: 320px !important;
  flex: 0 0 320px;
}

@media (max-width: 639px) {
  :deep(.el-date-editor.dashboard-date-filter) {
    width: 100% !important;
    flex-basis: 100%;
  }
}
</style>
