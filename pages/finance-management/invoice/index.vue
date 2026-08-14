<template>
  <TrumsWrapper>
    <el-tabs type="border-card">
      <el-tab-pane label="Daftar Invoice">
        <InvoiceTable
          :params-column="{ type: ['out'], status: [], payment_method: [] }"
          type="finance"
          :fetch-key="'invoice-data'"
        />
      </el-tab-pane>
      <el-tab-pane label="Laporan Invoice">
        <InvoiceReport
          :params-column="{ type: ['out'], status: [], payment_method: [] }"
          type="finance"
          :fetch-key="'invoice-report'"
        />
      </el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import InvoiceTable from "./components/InvoiceTable.vue";
import InvoiceReport from "./components/InvoiceReport.vue";

onMounted(() => {
  // fetchData();
});
</script>
