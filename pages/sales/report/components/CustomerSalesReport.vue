<script setup lang="tsx">
import { computed } from "vue";
import VChart from "vue-echarts";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { TrumsWrapper } from "#components";
import type { BaseResponse } from "~/types/response";
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

const currentYear = new Date().getFullYear();

const monthRange = ref([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 1),
]);

const request_search = ref<{ start_date: number; end_date: number }>({
  start_date: monthRange.value[0].getTime() / 1000,
  end_date: monthRange.value[1].getTime() / 1000,
});

type SalesReport = {
  contact: string;
  total: number;
};

const { data } = await useFetchApi<BaseResponse<SalesReport[]>>(
  "/laporan-penjualan-customer",
  "get-customer-sales-performance",
  "post",
  request_search.value
);

watch(request_search, () => refreshNuxtData("get-customer-sales-performance"), {
  deep: true,
});

watch(
  () => monthRange,
  (newValue) => {
    const start = new Date(monthRange.value[0]);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(monthRange.value[1]);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    const startMs = start.getTime();
    const endMs = end.getTime();

    request_search.value.start_date = startMs / 1000;
    request_search.value.end_date = endMs / 1000;
    refreshNuxtData("get-cashflow");
  },
  { deep: true }
);

/* FORMAT BULAN */
const months = computed(() => (data.value?.data ?? []).map((i) => i.contact));

/* TOTAL SALES */
const totals = computed(() => (data.value?.data ?? []).map((i) => i.total));

/* CHART OPTION */
const chartOption = computed(() => ({
  title: {
    text: "Trend Penjualan Bulanan",
    left: "center",
  },

  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      const p = params[0];
      return `
      ${p.axisValue}<br/>
      ${p.marker} Penjualan: ${currency(p.value)}
      `;
    },
  },

  legend: {
    bottom: 0,
  },

  grid: {
    left: "3%",
    right: "3%",
    bottom: "12%",
    containLabel: true,
  },

  xAxis: {
    type: "category",
    data: months.value,
  },

  yAxis: {
    type: "value",
  },

  series: [
    {
      name: "Total Penjualan",
      type: "line",
      smooth: true,
      areaStyle: {},
      data: totals.value,
    },
  ],
}));

const column: ColumnTable<SalesReport>[] = [
  {
    key: "contact",
    title: "Customer",
    dataKey: "contact",

    cellRenderer: ({ rowData }: { rowData: SalesReport }) => (
      <p class={"font-bold"}>{rowData.contact}</p>
    ),
  },
  {
    key: "total",
    title: "Total",
    dataKey: "total",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: SalesReport }) => (
      <p class={"text-green-600"}>{currency(rowData.total)}</p>
    ),
  },
];
</script>

<template>
  <el-row justify="space-between" style="margin-bottom: 20px">
    <el-col :span="12">
      <h3></h3>
    </el-col>

    <el-col :span="12" style="text-align: right">
      <el-date-picker
        v-model="monthRange"
        type="monthrange"
        unlink-panels
        range-separator="To"
        start-placeholder="Start month"
        end-placeholder="End month"
      />
    </el-col>
  </el-row>
  <v-chart
    :option="chartOption"
    autoresize
    style="height: 420px; width: 100%"
  />
  <h2 class="font-bold mt-6 mb-4">Rincian Penjulaan Perbulan</h2>
  <custom-table :columns="column" :data="data?.data ?? []" />
</template>

<style scoped>
:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
