<template>
  <TrumsWrapper>
    <el-tabs type="border-card">
      <el-tab-pane label="Sales Order"><SalesOrderTable /> </el-tab-pane>
      <el-tab-pane label="Item Order">Item Order</el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import SalesOrderTable from "./components/SalesOrderTable.vue";
</script>
