<template>
  <el-row :gutter="16">
    <el-col :span="12">
      <div class="statistic-card">
        <el-statistic
          :value="
            (data?.data ?? []).reduce(function (acc, obj) {
              return acc + obj.income;
            }, 0)
          "
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-green-600"
            >
              Total Pemasukan
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
    <el-col :span="12">
      <div class="statistic-card">
        <el-statistic
          :value="
            (data?.data ?? []).reduce(function (acc, obj) {
              return acc + obj.expense;
            }, 0)
          "
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-red-600"
            >
              Total Pengeluaran
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
  </el-row>
  <ElCard shadow="never" class="my-4">
    <el-row justify="space-between" style="margin-bottom: 20px">
      <el-col :span="12">
        <h3>Hutang Piutang</h3>
      </el-col>

      <el-col :span="12" style="text-align: right">
        <el-date-picker
          v-model="monthRange"
          type="monthrange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start month"
          end-placeholder="End month"
          :shortcuts="shortcuts"
        />
      </el-col>
    </el-row>
    <v-chart
      :option="chartOption"
      autoresize
      style="height: 420px; width: 100%"
    />

    <custom-table :columns="column" :data="data?.data ?? []" class="mt-4" />
  </ElCard>
</template>
<script lang="tsx" setup>
import type { BaseResponse } from "~/types/response";
import { computed } from "vue";
import VChart from "vue-echarts";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";

echarts.use([
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  CanvasRenderer,
]);

const currentYear = new Date().getFullYear();

const monthRange = ref([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 1),
]);

const request_cashflow = ref<{ start_date: number; end_date: number }>({
  start_date: monthRange.value[0].getTime() / 1000,
  end_date: monthRange.value[1].getTime() / 1000,
});

type CashFlow = {
  month: string;
  income: number;
  expense: number;
  saldo: number;
};

const shortcuts = [
  {
    text: "This month",
    value: [new Date(), new Date()],
  },
  {
    text: "This year",
    value: () => {
      const end = new Date();
      const start = new Date(new Date().getFullYear(), 0);
      return [start, end];
    },
  },
  {
    text: "Last 6 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return [start, end];
    },
  },
];

const { data } = await useFetchApi<BaseResponse<CashFlow[]>>(
  "/laporan-pengeluaran",
  "get-cashflow",
  "post",
  request_cashflow.value
);

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

    request_cashflow.value.start_date = startMs / 1000;
    request_cashflow.value.end_date = endMs / 1000;
    refreshNuxtData("get-cashflow");
  },
  { deep: true }
);

const months = computed(() => (data.value?.data ?? []).map((i) => i.month));
const income = computed(() => (data.value?.data ?? []).map((i) => i.income));
const expense = computed(() => (data.value?.data ?? []).map((i) => i.expense));
const saldo = computed(() => (data.value?.data ?? []).map((i) => i.saldo));

const chartOption = computed(() => ({
  title: {
    text: "Cashflow Trend",
    left: "center",
  },

  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      let text = params[0].axisValue + "<br/>";

      params.forEach((p: any) => {
        text += `${p.marker} ${p.seriesName}: ${currency(p.value)}<br/>`;
      });

      return text;
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

  color: [
    "#67C23A", // income
    "#F56C6C", // expense
    "#409EFF", // saldo
  ],

  xAxis: {
    type: "category",
    data: months.value,
  },

  yAxis: {
    type: "value",
  },

  series: [
    {
      name: "Income",
      type: "line",
      smooth: true,
      areaStyle: {},
      data: income.value,
    },

    {
      name: "Expense",
      type: "line",
      smooth: true,
      data: expense.value,
    },

    {
      name: "Saldo",
      type: "line",
      smooth: true,
      data: saldo.value,
    },
  ],
}));

const column: ColumnTable<CashFlow>[] = [
  {
    key: "month",
    title: "Bulan",
    dataKey: "month",

    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"font-bold"}>{rowData.month}</p>
    ),
  },
  {
    key: "income",
    title: "Pemasukan",
    dataKey: "income",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-green-600"}>{currency(rowData.income)}</p>
    ),
  },
  {
    key: "expense",
    title: "Pengeluaran",
    dataKey: "expense",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-red-600"}>{currency(rowData.income)}</p>
    ),
  },
  {
    key: "saldo",
    title: "Saldo",
    dataKey: "saldo",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-blue-600"}>{currency(rowData.saldo)}</p>
    ),
  },
];

onMounted(() => {
  console.log(monthRange.value[0]);
  console.log(monthRange.value[1]);
});
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
