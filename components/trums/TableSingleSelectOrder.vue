<template>
  <el-row :gutter="20" class="mb-3 mt-4">
    <el-col :span="6">
      <el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Cari sales order..."
        clearable
      />
    </el-col>
  </el-row>

  <customTable
    :columns="filteredColumns"
    :data="data?.data ?? []"
    :loading="status === 'pending'"
    @sort-change="onSort"
  />

  <!-- Pagination -->
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="data?.total_data ?? 0"
      :current-page="Number(request_search.offset)"
      :page-size="Number(request_search.limit)"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script lang="tsx" setup>
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import OrderTable from "~/pages/sales/order/components/OrderTable.vue";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import type { ResponsePagination } from "~/types/response_pagination";
import type { ColumnTable } from "~/types/ColumnTable";
import { NuxtLink } from "#components";
import { ElButton } from "element-plus";
import customTable from "./table/customTable.vue";

const props = defineProps<{
  type: "so" | "po";
}>();

const refreshKey = `get-sales-order-selection-${props.type}`;

const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "vendor_name",
  "total_price",
  "date",
  "expected_arrival",
  "status",
  "created_at",
  "action",
]);

const emit = defineEmits(["onSelected"]);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [props.type],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const { data, status, refresh } = await useAsyncData(refreshKey, async () => {
  const res = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
    `/search`,
    refreshKey,
    "post",
    request_search.value
  );
  return res.data.value;
});

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
  refresh();
};

const columns: ColumnTable<PurchaseOrder>[] = [
  {
    key: "unique_code",
    title: "Nomor PO",
    dataKey: "unique_code",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`/sales/order/${row.unique_id}`} class="text-blue-500">
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "vendor_name",
    title: "Contact",
    dataKey: "vendor_name",
    fixed: true,
    sortable: true,
  },
  {
    key: "total_price",
    title: "Total Harga",
    dataKey: "total_price",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{currency(rowData.total_price)}</span>
    ),
  },
  {
    key: "date",
    title: "Tanggal PO",
    dataKey: "date",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{rowData.date ? formatLocalDate(rowData.date) : "-"}</span>
    ),
  },
  {
    key: "expected_arrival",
    title: "Estimasi Tiba",
    dataKey: "expected_arrival",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>
        {rowData.expected_arrival
          ? formatLocalDate(rowData.expected_arrival)
          : "-"}
      </span>
    ),
  },
  {
    key: "created_at",
    title: "Tanggal Dibuat",
    dataKey: "created_at",
    width: 170,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{formatLocalDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "action",
    title: "Pilih",
    dataKey: "action",
    width: 80,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <ElButton
        link
        size="small"
        type="primary"
        onClick={() => onSelect(rowData)}
      >
        Pilih
      </ElButton>
    ),
  },
];

// Computed
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refresh();
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refresh();
};

watch(
  () => request_search.value,
  () => refresh(),
  { deep: true }
);

const onSelect = (selections: PurchaseOrder) => {
  emit("onSelected", selections);
};
</script>
