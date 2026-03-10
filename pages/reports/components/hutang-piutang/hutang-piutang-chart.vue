<template>
  <ElCard shadow="never" class="mb-4">
    <el-row justify="space-between" style="margin-bottom: 20px">
      <el-col :span="12">
        <h3>Hutang Piutang</h3>
      </el-col>

      <el-col :span="12" style="text-align: right">
        <el-date-picker
          :model-value="modelValue"
          type="monthrange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start month"
          end-placeholder="End month"
          :shortcuts="shortcuts"
          @update:model-value="onDateChange"
        />
      </el-col>
    </el-row>
    <v-chart
      :option="chartOption"
      autoresize
      style="height: 400px; width: 100%"
    />
  </ElCard>
</template>

<script lang="tsx" setup>
import type { HutangPiutang } from "~/types/finance/hutangpiutang";
import VChart from "vue-echarts";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BarChart,
  CanvasRenderer,
]);

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

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

const props = defineProps<{
  data: HutangPiutang[];
  modelValue: any[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any[]): void;
}>();

// Handler ketika date picker berubah
const onDateChange = (value: any[]) => {
  emit("update:modelValue", value);
};

const processedData = computed(() => {
  console.log("data", props.data);
  return (props.data ?? [])
    .map((i) => ({
      ...i,
      total: i.hutang + i.piutang,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
});

const chartOption = computed(() => ({
  tooltip: {
    trigger: "axis",
  },
  legend: {
    top: 10,
  },
  xAxis: {
    type: "category",
    data: processedData.value.map((i) => i.name),
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: "Piutang",
      type: "bar",
      stack: "total",
      data: processedData.value.map((i) => i.piutang),
    },
    {
      name: "Hutang",
      type: "bar",
      stack: "total",
      data: processedData.value.map((i) => i.hutang),
    },
  ],
}));
</script>
