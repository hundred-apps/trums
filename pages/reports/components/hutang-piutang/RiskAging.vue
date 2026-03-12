<script setup lang="tsx">
import { computed } from "vue";
import VChart from "vue-echarts";
import type {
  HutangOrPiutang,
  UmurHutangPiutang,
} from "~/types/finance/hutangpiutang";
import type { Pagination } from "~/types/pagination";

import * as echarts from "echarts/core";

import { PieChart } from "echarts/charts";

import { TooltipComponent, LegendComponent } from "echarts/components";

import { CanvasRenderer } from "echarts/renderers";
import type { ColumnTable } from "~/types/ColumnTable";
import { NuxtLink } from "#components";
import customTable from "~/components/trums/table/customTable.vue";
import type { BaseResponse } from "~/types/response";

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const { data } = await useFetchApi<BaseResponse<UmurHutangPiutang>>(
  "/laporan-umur-piutang",
  "umur-hutang-piutang",
  "post",
  null
);

const buildAgingData = (data: any) => [
  { value: data["0"], name: "0 Hari", itemStyle: { color: "#67C23A" } },
  { value: data["30"], name: "1-30 Hari", itemStyle: { color: "#E6A23C" } },
  { value: data["60"], name: "31-60 Hari", itemStyle: { color: "#F56C6C" } },
  { value: data["90"], name: ">90 Hari", itemStyle: { color: "#C45656" } },
];

const column: ColumnTable<HutangOrPiutang>[] = [
  {
    key: "name",
    title: "Kontak",
    dataKey: "name",

    cellRenderer: ({ rowData }: { rowData: HutangOrPiutang }) => (
      <NuxtLink
        href={`/contact-management/${rowData.customer_id}`}
        class="text-blue-500"
      >
        {rowData.customer_name}
      </NuxtLink>
    ),
  },
  {
    key: "0",
    title: "0-30 Hari",
    dataKey: "0",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: HutangOrPiutang }) => (
      <p>{currency(rowData[0])}</p>
    ),
  },
  {
    key: "30",
    title: "30 Hari",
    dataKey: "30",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: HutangOrPiutang }) => (
      <p>{currency(rowData[30])}</p>
    ),
  },
  {
    key: "60",
    title: "60 Hari",
    dataKey: "60",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: HutangOrPiutang }) => (
      <p>{currency(rowData[60])}</p>
    ),
  },
  {
    key: "90",
    title: "90 Hari",
    dataKey: "90",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: HutangOrPiutang }) => (
      <p>{currency(rowData[90])}</p>
    ),
  },
];

const chartOption = computed(() => {
  const hutang = data.value?.data?.grand_total?.hutang;
  const piutang = data.value?.data?.grand_total?.piutang;

  const totalHutang = hutang?.total || 0;
  const totalPiutang = piutang?.total || 0;

  return {
    title: [
      {
        subtext: "Hutang",
        text: `Rp ${totalHutang.toLocaleString("id-ID")}`,
        left: "25%",
        top: 10,
        textAlign: "center",
      },
      {
        subtext: "Piutang",
        text: `Rp ${totalPiutang.toLocaleString("id-ID")}`,
        left: "75%",
        top: 10,
        textAlign: "center",
      },
    ],

    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `${params.name}<br/>${currency(params.value)} (${
          params.percent
        }%)`;
      },
    },

    legend: {
      bottom: 0,
      left: "center",
    },

    graphic: [
      {
        type: "text",
        left: "25%",
        top: "52%",
        style: {
          text: `Rp ${totalHutang.toLocaleString("id-ID")}`,
          textAlign: "center",
          fill: "#333",
          fontSize: 18,
          fontWeight: 600,
        },
      },
      {
        type: "text",
        left: "75%",
        top: "52%",
        style: {
          text: `Rp ${totalPiutang.toLocaleString("id-ID")}`,
          textAlign: "center",
          fill: "#333",
          fontSize: 18,
          fontWeight: 600,
        },
      },
    ],

    series: [
      {
        name: "Risk Hutang",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["25%", "55%"],

        label: {
          formatter: "{b}\n{d}%",
        },

        data: buildAgingData(hutang),
      },

      {
        name: "Risk Piutang",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["75%", "55%"],

        label: {
          formatter: "{b}\n{d}%",
        },

        data: buildAgingData(piutang),
      },
    ],
  };
});
</script>

<template>
  <v-chart
    :option="chartOption"
    autoresize
    style="height: 420px; width: 100%"
  />

  <ElCard shadow="never" class="my-4">
    <template #header>
      <div class="card-header">Rincian Hutang</div>
    </template>
    <custom-table :data="data?.data?.hutang ?? []" :columns="column" />
  </ElCard>
  <ElCard shadow="never">
    <template #header>
      <div class="card-header">Rincian Piutang</div>
    </template>
    <custom-table :data="data?.data?.piutang ?? []" :columns="column" />
  </ElCard>
</template>
