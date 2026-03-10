<script setup lang="tsx">
import { computed, ref } from "vue";
import VChart from "vue-echarts";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);
import type { BaseResponse } from "~/types/response";
import type { Pagination } from "~/types/pagination";
import type { ResponsePagination } from "~/types/response_pagination";

const request_search = ref<{
  start_date: number | null;
  end_date: number | null;
}>({
  end_date: null,
  start_date: null,
});

type UmurPiutangBulanan = {
  month: string;
  piutang: number;
  hutang: number;
};

const { data } = await useFetchApi<ResponsePagination<UmurPiutangBulanan[]>>(
  "/laporan-umur-piutang-bulanan",
  "get-umur-piutang-bulanan",
  "post",
  request_search.value
);
/**
 * filter + sort
 */
const processedData = computed(() => {
  return (data.value?.data ?? [])
    .filter((i) => i.month !== "1970-01")
    .sort((a, b) => a.month.localeCompare(b.month));
});

const chartOption = computed(() => ({
  title: {
    text: "Hutang Piutang per Bulan",
  },

  tooltip: {
    trigger: "axis",
  },

  legend: {
    bottom: 0,
    left: "center",
  },

  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    containLabel: true,
  },

  xAxis: {
    type: "category",
    data: processedData.value.map((i) => i.month),
  },

  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => {
        if (value >= 1000000000) return value / 1000000000 + "B";
        if (value >= 1000000) return value / 1000000 + "M";
        if (value >= 1000) return value / 1000 + "K";
        return value;
      },
    },
  },

  series: [
    {
      name: "Piutang",
      type: "line",
      smooth: true,
      data: processedData.value.map((i) => i.piutang),
    },
    {
      name: "Hutang",
      type: "line",
      smooth: true,
      data: processedData.value.map((i) => i.hutang),
    },
  ],
}));
</script>

<template>
  <v-chart
    :option="chartOption"
    autoresize
    style="height: 420px; width: 100%"
  />
</template>
