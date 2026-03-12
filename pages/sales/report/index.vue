<script setup lang="tsx">
import { computed } from "vue";
import SalesPerformanceReport from "./components/SalesPerformanceReport.vue";
import CustomerSalesReport from "./components/CustomerSalesReport.vue";
import SalesDashboard from "./components/SalesDashboard.vue";
</script>

<template>
  <TrumsWrapper>
    <!-- <ElCard shadow="never" class="mb-4">
      <SalesPerformanceReport />
    </ElCard>
    <ElCard shadow="never" class="mb-4">
      <CustomerSalesReport />
    </ElCard> -->
    <SalesDashboard />
  </TrumsWrapper>
</template>
