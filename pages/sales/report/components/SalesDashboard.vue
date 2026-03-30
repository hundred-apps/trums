<script setup lang="tsx">
import dayjs from "dayjs";
import type { BaseResponse } from "~/types/response";
import VChart from "vue-echarts";

import * as echarts from "echarts/core";

import { LineChart, BarChart } from "echarts/charts";

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";

import { CanvasRenderer } from "echarts/renderers";
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";
import { OrderColumn } from "~/types/request_search";

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

const loading = ref(false);

const filter = reactive({
  month_range: [
    dayjs().startOf("year").format("YYYY-MM"),
    dayjs().endOf("year").format("YYYY-MM"),
  ],
});

type MonthlyReport = {
  month: string;
  total: number;
  transaction: number;
  avg_order: number;
};

type CustomerReport = {
  contact: string;
  total: number;
  transaction: number;
  avg_order: number;
};

type GoodsSalesReport = {
  catalogue: string;
  total: number;
  quantity: number;
};

const convertToUnix = (month: string, type: "start" | "end") => {
  if (type === "start") {
    return dayjs(month).startOf("month").unix();
  }

  return dayjs(month).endOf("month").unix();
};

const startDate = computed(() => convertToUnix(filter.month_range[0], "start"));
const endDate = computed(() => convertToUnix(filter.month_range[1], "start"));

const request_search_summery = ref<{
  start_date: number;
  end_date: number;
}>({
  start_date: startDate.value,
  end_date: endDate.value,
});

const request_search_customer = ref<{
  start_date: number;
  end_date: number;
  sort: {
    column: string;
    order: string;
  };
}>({
  start_date: startDate.value,
  end_date: endDate.value,
  sort: {
    column: "contact",
    order: "asc",
  },
});

interface SummeryData {
  total_penjualan: number;
  total_customer: number;
  total_barang: number;
}

const summeryData = await useFetchApi<BaseResponse<SummeryData>>(
  "/laporan-penjualan",
  "get-sales-report",
  "post",
  request_search_summery.value
);

const customerReport = await useFetchApi<BaseResponse<CustomerReport[]>>(
  "/laporan-penjualan-customer",
  "get-customer-report",
  "post",
  request_search_customer.value
);

const request_search_monthly = ref<{ start_date: number; end_date: number }>({
  start_date: startDate.value,
  end_date: endDate.value,
});

const monthlyReport = await useFetchApi<BaseResponse<MonthlyReport[]>>(
  "/laporan-penjualan-bulanan",
  "get-monthly-report",
  "post",
  request_search_monthly.value
);

const request_search_goods_report = ref<{
  start_date: number;
  end_date: number;
  sort: {
    column: string;
    order: string;
  };
}>({
  start_date: startDate.value,
  end_date: endDate.value,
  sort: {
    column: "total",
    order: "asc",
  },
});

const goodsReport = await useFetchApi<BaseResponse<GoodsSalesReport[]>>(
  "/laporan-penjualan-barang",
  "get-goods-report",
  "post",
  request_search_goods_report.value
);

const refreshData = () => {
  refreshNuxtData("get-goods-report");
  refreshNuxtData("get-monthly-report");
  refreshNuxtData("get-customer-report");
  refreshNuxtData("get-sales-report");
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

watch(filter, () => refreshData(), { deep: true });

const monthlyChart = computed(() => ({
  tooltip: { trigger: "axis" },

  xAxis: {
    type: "category",
    data: (monthlyReport.data.value?.data ?? []).map((i) => i.month),
  },

  yAxis: { type: "value" },

  series: [
    {
      name: "Revenue",
      type: "line",
      smooth: true,
      data: (monthlyReport.data.value?.data ?? []).map((i) => i.total),
    },
  ],
}));

const customerChart = computed(() => ({
  tooltip: { trigger: "axis" },

  xAxis: { type: "value" },

  yAxis: {
    type: "category",
    data: (customerReport.data.value?.data ?? []).map((i) => i.contact),
  },

  series: [
    {
      type: "bar",
      data: (customerReport.data.value?.data ?? []).map((i) => i.total),
    },
  ],
}));

const productChart = computed(() => ({
  tooltip: { trigger: "axis" },

  xAxis: { type: "value" },

  yAxis: {
    type: "category",
    data: (goodsReport.data.value?.data ?? []).map((i) => i.catalogue),
  },

  series: [
    {
      type: "bar",
      data: (goodsReport.data.value?.data ?? []).map((i) => i.quantity),
    },
  ],
}));

const productColumn: ColumnTable<GoodsSalesReport>[] = [
  {
    key: "catalogue",
    title: "Catalogue",
    dataKey: "catalogue",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: GoodsSalesReport }) => (
      <p class={"font-bold"}>{rowData.catalogue}</p>
    ),
  },
  {
    key: "quantity",
    title: "QTY",
    dataKey: "quantity",
    width: 100,
    align: "right",
    sortable: true,
  },
  {
    key: "total",
    title: "Total",
    dataKey: "total",
    sortable: true,
    width: 150,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: GoodsSalesReport }) => (
      <p>{currency(rowData.total)}</p>
    ),
  },
];

const customerColumn: ColumnTable<CustomerReport>[] = [
  {
    key: "contact",
    title: "Customer",
    dataKey: "contact",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: CustomerReport }) => (
      <p class={"font-bold"}>{rowData.contact}</p>
    ),
  },
  {
    key: "transaction",
    title: "Transaction",
    dataKey: "transaction",
    width: 150,
    align: "right",
    sortable: true,
  },
  {
    key: "avg_order",
    title: "AVG Order",
    dataKey: "avg_order",
    width: 150,
    align: "right",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: CustomerReport }) => (
      <p>{currency(rowData.avg_order)}</p>
    ),
  },
  {
    key: "total",
    title: "Total",
    dataKey: "total",
    sortable: true,
    width: 150,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CustomerReport }) => (
      <p>{currency(rowData.total)}</p>
    ),
  },
];

const onProductSort = (sortBy: { order: string; prop: string }) => {
  request_search_goods_report.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC.toLowerCase()
        : OrderColumn.DESC.toLowerCase(),
  };
};
const onCustomerSort = (sortBy: { order: string; prop: string }) => {
  request_search_customer.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC.toLowerCase()
        : OrderColumn.DESC.toLowerCase(),
  };
};
</script>

<template>
  <el-row :gutter="16" class="mb-3">
    <el-col :span="8">
      <div class="statistic-card el-card is-always-shadow">
        <el-statistic
          :value="summeryData.data.value?.data?.total_penjualan || 0"
        >
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-green-600"
            >
              Total Penjualan
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="statistic-card el-card is-always-shadow">
        <el-statistic
          :value="summeryData.data.value?.data?.total_customer || 0"
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
    <el-col :span="8">
      <div class="statistic-card el-card is-always-shadow">
        <el-statistic :value="summeryData.data.value?.data?.total_barang">
          <template #title>
            <div
              style="display: inline-flex; align-items: center"
              class="text-red-600"
            >
              Total Product
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <!-- FILTER -->
    <el-col :span="24">
      <el-date-picker
        v-model="filter.month_range"
        type="monthrange"
        format="MMM YYYY"
        value-format="YYYY-MM"
        start-placeholder="Start Month"
        end-placeholder="End Month"
      />
    </el-col>

    <!-- MONTHLY CHART -->
    <el-col :span="24">
      <el-card
        header="Monthly Revenue Trend"
        class="mb-4 mt-4"
        v-loading="loading"
      >
        <VChart :option="monthlyChart" autoresize style="height: 350px" />
      </el-card>
    </el-col>

    <!-- CUSTOMER SALES -->
    <el-col :span="12">
      <el-card header="Revenue by Customer" class="mb-4">
        <VChart :option="customerChart" autoresize style="height: 350px" />
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card header="Customer Sales" class="mb-4">
        <customTable
          :columns="customerColumn"
          :data="customerReport.data.value?.data ?? []"
          @sort-change="onCustomerSort"
        />
      </el-card>
    </el-col>

    <!-- PRODUCT SALES -->
    <el-col :span="12">
      <el-card header="Product Quantity Sold" class="mb-4">
        <VChart :option="productChart" autoresize style="height: 350px" />
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card header="Product Sales" class="mb-4">
        <customTable
          :columns="productColumn"
          :data="goodsReport.data.value?.data ?? []"
          @sort-change="onProductSort"
        />
      </el-card>
    </el-col>
  </el-row>
</template>

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
