<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3">
          {{ t("menu.submenu.stockOpnameHistory") }}
        </span>
      </template>
    </el-page-header>
    <div class="w-auto my-3">
      <CustomTable
        :column-sort="onSort"
        :columns="filteredColumn"
        :data="data?.data ?? []"
      />
      <div class="flex justify-end mt-3">
        <el-pagination
          class="my-3"
          background
          layout="prev, pager, next"
          :total="data?.total_data"
          @next-click="paginationClick"
          @prev-click="paginationClick"
          @change="paginationClick"
        />
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="Detail Item Stok Opname"
      width="80%"
    >
      <CustomTable
        :columns="itemColumns"
        :data="currentItems"
        row-key="unique_id"
        v-loading="loading"
      />

      <template #footer>
        <el-button @click="dialogVisible = false">Tutup</el-button>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref } from "vue";
import { type StokOpname } from "~/types/stok_opname";
import { SetUp } from "@element-plus/icons-vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  ElDialog,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type SortBy,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import { Filter } from "@element-plus/icons-vue";
import { Icon } from "#components";

definePageMeta({
  middleware: ["auth", "app"],
});

const popoverRef = ref();
const router = useRouter();
const config = useRuntimeConfig();
const { t } = useI18n();
const goBack = () => router.back();
const axios = useApi();
const loading = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const currentItems = ref<StockOpnameItem[]>([]);

interface StockOpnameItem {
  unique_id: string;
  inventory_id: string;
  real_stok: number;
  sistem_stok: number;
  difference: number;
  status: string | null;
  inventories: {
    sn: string;
    unit_name: string;
    catalogue: {
      name: string;
    };
  };
}

const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  limit: "10",
  offset: "1",
  table: "stok_opname",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const { data } = await useFetchApi<ResponsePagination<StokOpname[]>>(
  `/search`,
  "stok_opname",
  "post",
  request_search.value
);

const column_selected = ref<string[]>([
  "unique_id",
  "date",
  "location_name",
  "status",
  "note",
  "setup",
]);

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const availableColumn: Column<StokOpname>[] = [
  {
    title: "unique",
    key: "unique_id",
    dataKey: "unique_id",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton link onClick={() => openDialog(row)} type="primary">
          {row.unique_id}
        </ElButton>
      </>
    ),
  },
  {
    title: "date",
    key: "date",
    dataKey: "date",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.date == null ? "-" : formatLocalDate(row.date)}</p>
    ),
  },
  {
    title: "Location",
    key: "location_name",
    dataKey: "location_name",
    width: 200,
  },
  {
    title: "status",
    key: "status",
    dataKey: "status",
    sortable: false,
    width: 100,
    cellRenderer: ({ rowData }) => (
      <el-tag type={rowData.status === "done" ? "success" : "warning"}>
        {rowData.status}
      </el-tag>
    ),
  },
  {
    title: "note",
    key: "note",
    dataKey: "note",
    sortable: false,
    width: 100,
  },
  {
    title: "Operasi",
    key: "operasi",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        edit dan delete
        {/* <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton> */}
      </>
    ),
  },
  {
    title: "",
    key: "setup",
    dataKey: "setup",
    sortable: false,
    width: 40,
  },
];

const itemColumns: Column<StockOpnameItem>[] = [
  {
    title: "SN",
    key: "sn",
    width: 120,
    cellRenderer: ({ rowData }) => rowData.inventories.sn,
  },
  {
    title: "Nama Item",
    key: "name",
    width: 200,
    cellRenderer: ({ rowData }) => rowData.inventories.catalogue.name,
  },
  {
    title: "Satuan",
    key: "unit",
    width: 100,
    cellRenderer: ({ rowData }) => rowData.inventories.unit_name,
  },
  {
    title: "Stok Sistem",
    key: "sistem_stok",
    width: 120,
    dataKey: "sistem_stok",
  },
  {
    title: "Stok Real",
    key: "real_stok",
    width: 120,
    dataKey: "real_stok",
  },
  {
    title: "Selisih",
    key: "difference",
    width: 120,
    cellRenderer: ({ rowData }) => (
      <span
        class={rowData.difference === 0 ? "text-green-500" : "text-red-500"}
      >
        {rowData.difference}
      </span>
    ),
  },
  {
    title: "Status",
    key: "status",
    width: 100,
    cellRenderer: ({ rowData }) => (
      <el-tag type={rowData.status === "done" ? "success" : "warning"}>
        {rowData.status || "Pending"}
      </el-tag>
    ),
  },
];

const openDialog = (row: StokOpname) => {
  dialogVisible.value = true;
  currentItems.value = row.stock_opname_item;
};

const onSearch = async (value: string) => {
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.keyword = value;
  request_search.value = data;
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  request_search.value = data;
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<StokOpname[]>>(
      `/search`,
      "stok_opname",
      "post",
      request_search.value
    );
    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<StokOpname[]>;
    }
  } catch (error: any) {
    ElMessage.error(
      `${error.response?.data?.message ?? "Gagal Mengambil Data!"}`
    );
    return [];
  } finally {
    loading.value = false;
    // ElMessage.success(`${t("message.reloadData")}`);
  }
};

watch(request_search, fetchData, { immediate: true });
</script>
