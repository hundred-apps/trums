<template>
  <TrumsWrapper>
    <CashFlow />
    <CashFlowTable />
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import CashFlow from "./components/CashFlow.vue";
import CashFlowTable from "./components/CashFlowTable.vue";
</script>
<style scoped>
.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
