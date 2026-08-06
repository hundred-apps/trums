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
    <el-col :span="18" class="text-right space-x-2">
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="status == 'pending'"
        @click="refreshData"
      >
        Muat Ulang
      </el-button>
    </el-col>
  </el-row>
  <TrumsDragScrollTable>
    <customTable
      @sort-change="onSort"
      :columns="columns"
      :data="data?.data ?? []"
    />
  </TrumsDragScrollTable>
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
      :total="data?.total_data"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      size="small"
    />
  </div>
</template>

<script lang="tsx" setup>
import { ElTag, NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";

import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  displayStatusSOITEM,
  PurchaseOrderItemStatus,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import customTable from "~/components/trums/table/customTable.vue";
import { Eleme } from "@element-plus/icons-vue";

const { isMobile } = useDevice();

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      purchase_order: {
        type: ["so"],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: "DESC",
  },
  flag: "list",
});

const { data, status, refresh } = await useAsyncData(
  "fetch-purchase-order-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      "fetch-purchase-order-item",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const columns: ColumnTable<PurchaseOrderItem>[] = [
  {
    key: "catalogue_name",
    title: "Nama Item",
    dataKey: "catalogue_name",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>
        {rowData.catalogue
          ? displayCatalogueName(rowData.catalogue)
          : rowData.catalogue_name}
      </>
    ),
  },
  {
    key: "so_number",
    title: "No.SO",
    dataKey: "so_number",
    width: isMobile ? 0 : 200,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <NuxtLink
        target={"_blank"}
        class={"text-blue-600"}
        href={`/sales/order/${rowData.purchase_order?.unique_id}`}
      >
        {rowData.purchase_order?.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "ref_so_number",
    title: "Ref/No.PO",
    dataKey: "ref_so_number",
    width: isMobile ? 0 : 150,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>{rowData.purchase_order?.sourcing_document}</>
    ),
  },
  {
    key: "quantity",
    title: "QTY",
    dataKey: "quantity",
    width: isMobile ? 0 : 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>
        {rowData.quantity} {rowData.unit_name}
      </>
    ),
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: isMobile ? 0 : 200,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) =>
      renderStatusItem(rowData),
  },
];

const renderStatusItem = (data: PurchaseOrderItem) => {
  switch (data.status) {
    case PurchaseOrderItemStatus.WAITING_REQUEST:
      return <ElTag type="info">{displayStatusSOITEM(data.status)}</ElTag>;
    case PurchaseOrderItemStatus.WAITING_PO:
      return <ElTag type="primary">{displayStatusSOITEM(data.status)}</ElTag>;
    case PurchaseOrderItemStatus.WAITING_PR:
      return <ElTag type="warning">{displayStatusSOITEM(data.status)}</ElTag>;
    case PurchaseOrderItemStatus.DONE:
      return <ElTag type="success">{displayStatusSOITEM(data.status)}</ElTag>;
    default:
      return <></>;
  }
};

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

const handlePageChange = (page: number) => {
  console.log("harusnya referesh");
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  console.log("harusnya referesh");
  request_search.value.limit = `${size}`;
};

const refreshData = () => refresh();
watch(
  () => request_search.value,
  () => refreshData(),
  { deep: true }
);
</script>
<style scoped>
/* .el-table th .cell {
  font-weight: 700 !important;
} */

:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
