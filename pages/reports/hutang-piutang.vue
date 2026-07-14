<script lang="tsx" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Eleme, SetUp, Filter } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  ElTag,
  ElText,
  ElButton,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
} from "element-plus";
import type { FunctionalComponent } from "vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { HutangPiutang } from "~/types/finance/hutangpiutang";
import { currency } from "#imports";
import { dayjs } from "element-plus";

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
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";
import HutangPiutangChart from "./components/hutang-piutang/hutang-piutang-chart.vue";
import UmurPiutangLineChart from "./components/hutang-piutang/UmurPiutangLineChart.vue";
import type { BaseResponse } from "~/types/response";
import RiskAging from "./components/hutang-piutang/RiskAging.vue";

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

definePageMeta({
  middleware: ["auth", "app"],
  name: "Hutang Piutang",
});

const router = useRouter();

// Request search
const request_search = ref<{
  contacts_id: string[];
  start_date: number | null;
  end_date: number | null;
  page: number;
  limit: number;
  sort?: {
    column: string;
    order: string;
  };
}>({
  contacts_id: [],
  start_date: null,
  end_date: null,
  page: 1,
  limit: 10,
});

// Data state
const { data } = await useFetchApi<ResponsePagination<HutangPiutang[]>>(
  "/laporan-invoice",
  "hutang-piutang",
  "post",
  request_search.value
);

const loading = ref<boolean>(false);
const search = ref("");
const popoverRef = ref();

const currentYear = dayjs().year();

const monthRange = ref([]);

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

// Type untuk Selection Cell
type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

// Definisi kolom tabel
const columns: ColumnTable<HutangPiutang>[] = [
  {
    key: "name",
    title: "Nama Kontak",
    dataKey: "name",
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/contact-management/${row.contact_id}`}
        class={"text-blue-500"}
      >
        {row.name}
      </NuxtLink>
    ),
  },
  {
    key: "hutang",
    title: "Hutang",
    dataKey: "hutang",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData: row }) => (
      <p class={"text-red-600 text-end"}>{currency(row.hutang)}</p>
    ),
    sortable: true,
  },
  {
    key: "piutang",
    title: "Piutang",
    dataKey: "piutang",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData: row }) => (
      <p class={"text-green-600 text-end"}>{currency(row.piutang)}</p>
    ),
    sortable: true,
  },
  // {
  //   key: "balance",
  //   title: "Saldo",
  //   width: 150,
  //   cellRenderer: ({ rowData: row }) => {
  //     const balance = row.piutang - row.hutang;
  //     return (
  //       <ElTag type={balance >= 0 ? "success" : "danger"}>
  //         {currency(balance)}
  //       </ElTag>
  //     );
  //   },
  // },
  // {
  //   key: "created_at",
  //   title: "Tanggal Dibuat",
  //   dataKey: "created_at",
  //   width: 200,
  //   sortable: true,
  //   cellRenderer: ({ rowData: row }) => (
  //     <ElText>{formatLocalDate(row.created_at)}</ElText>
  //   ),
  // },
  // {
  //   key: "operations",
  //   title: "Aksi",
  //   cellRenderer: ({ rowData: row }) => (
  //     <>
  //       <ElButton size="small" onClick={() => onEdit(row)}>
  //         Edit
  //       </ElButton>
  //       <ElButton size="small" type="danger" onClick={() => onDelete(row)}>
  //         Hapus
  //       </ElButton>
  //     </>
  //   ),
  //   width: 150,
  //   align: "center",
  // },
  // {
  //   title: "",
  //   key: "setup",
  //   width: 50,
  //   fixed: TableV2FixedDir.RIGHT,
  // },
];

const processedData = computed(() => {
  return (data.value?.data ?? [])
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
// Handler untuk delete
const onDelete = async (value: HutangPiutang) => {
  try {
    // Ganti dengan API call sebenarnya
    // await axios.delete(`/hutang-piutang/${value.contact_id}`)
    ElMessage.success("Data berhasil dihapus");
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Gagal menghapus data");
  }
};

// Handler untuk edit
const onEdit = async (value: HutangPiutang) => {
  router.push(`/finance-management/hutang-piutang/edit/${value.contact_id}`);
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.page = page;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = size;
};

// Watch search query
watchDebounced(
  request_search.value,
  () => {
    // Ganti dengan API call sebenarnya
    // refreshNuxtData('hutang-piutang')
  },
  { debounce: 500 }
);

const piutang = computed(() => {
  const piutang =
    (data.value?.data ?? []).reduce(
      (sum, item) => sum + (item.piutang || 0),
      0
    ) ?? 0;
  return piutang;
});
const hutang = computed(() => {
  const hutang =
    (data.value?.data ?? []).reduce(
      (sum, item) => sum + (item.hutang || 0),
      0
    ) ?? 0;
  console.log(data.value?.data);
  return hutang;
});
const outputValuePiutang = useTransition(piutang, {
  duration: 1500,
});
const outputValueHutang = useTransition(hutang, {
  duration: 1500,
});

watch(monthRange, () => {
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
});
watch(request_search, () => refreshNuxtData("hutang-piutang"), { deep: true });

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC.toLowerCase()
        : OrderColumn.DESC.toLowerCase(),
  };
};

onMounted(() => {});
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="16" class="my-4">
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="data?.data?.length || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Kontak
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic
            :value="outputValueHutang"
            value-style="color: #e04d4d;"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Hutang
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card">
          <el-statistic :value="outputValuePiutang" value-style="color: green;">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Piutang
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <HutangPiutangChart :data="data?.data ?? []" v-model="monthRange" />

    <ElCard shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">Rincian Hutang & Piutang</div>
      </template>
      <customTable
        :data="data?.data ?? []"
        :columns="columns"
        @sort-change="onSort"
      />

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="data?.total_data"
          :current-page="data?.current_page"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>
    <ElCard shadow="never" class="mb-4">
      <UmurPiutangLineChart />
    </ElCard>
    <ElCard shadow="never" class="mb-4">
      <RiskAging />
    </ElCard>
  </TrumsWrapper>
</template>

<style scoped>
.el-col {
  text-align: center;
}
</style>

<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

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

.green {
  color: var(--el-color-success);
}
.red {
  color: var(--el-color-error);
}
:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
