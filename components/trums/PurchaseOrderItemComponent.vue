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
      :row-click="onRowClick"
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
import { ElPopover, ElTag, NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";

import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  PurchaseOrderStatus,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import customTable from "~/components/trums/table/customTable.vue";
import { Eleme, Filter } from "@element-plus/icons-vue";
import { ElCheckbox, ElCheckboxGroup, ElIcon } from "element-plus";

const props = defineProps<{ request_column?: any[] }>();

const emit = defineEmits<{
  rowClick: [data: PurchaseOrderItem];
}>();

const { isMobile } = useDevice();

const request_search = ref<RequestSearch>({
  keyword: "",
  column: props.request_column || [],
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
    width: isMobile ? 0 : 400,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>
        {rowData.catalogue
          ? displayCatalogueName(rowData.catalogue)
          : rowData.catalogue_name}
      </>
    ),
  },
  {
    key: "po_number",
    title: "No.PO",
    dataKey: "po_number",
    width: isMobile ? 0 : 200,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <NuxtLink
        target={"_blank"}
        class={"text-blue-600"}
        href={`/supply-chain-management/purchase/order/${rowData.purchase_order?.unique_id}`}
      >
        {rowData.purchase_order?.unique_code}
      </NuxtLink>
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
    key: "unit_price",
    title: "Harga Beli",
    dataKey: "unit_price",
    width: isMobile ? 0 : 150,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>{currencyWithoutSymbol(rowData.unit_price)}</>
    ),
  },
  {
    key: "total_price",
    title: "Total",
    dataKey: "total_price",
    width: isMobile ? 0 : 150,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) => (
      <>{currencyWithoutSymbol(rowData.total_price)}</>
    ),
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 180,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrderItem }) =>
      renderStatusTag(rowData.purchase_order!.status!),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover trigger="click" width={200}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].status}
                  >
                    <ElCheckbox
                      key={PurchaseOrderStatus.DRAFT}
                      value={PurchaseOrderStatus.DRAFT}
                      label="Draft"
                    />
                    <ElCheckbox
                      key={PurchaseOrderStatus.PENDING_APPROVAL}
                      value={PurchaseOrderStatus.PENDING_APPROVAL}
                      label="Pending Approval"
                    />
                    <ElCheckbox
                      key={PurchaseOrderStatus.APPROVED}
                      value={PurchaseOrderStatus.APPROVED}
                      label="Approved"
                    />
                    <ElCheckbox
                      key={PurchaseOrderStatus.CANCELLED}
                      value={PurchaseOrderStatus.CANCELLED}
                      label="Cancelled"
                    />
                    <ElCheckbox
                      key={PurchaseOrderStatus.COMPLETED}
                      value={PurchaseOrderStatus.COMPLETED}
                      label="Completed"
                    />
                  </ElCheckboxGroup>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
];

const renderStatusTag = (status: PurchaseOrderStatus) => {
  if (!status) return <></>;

  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return <ElTag type="info">DRAFT</ElTag>;
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return <ElTag type="warning">PENDING APPROVAL</ElTag>;
    case PurchaseOrderStatus.APPROVED:
      return <ElTag type="success">APPROVED</ElTag>;
    case PurchaseOrderStatus.CANCELLED:
      return <ElTag type="danger">CANCELLED</ElTag>;
    case PurchaseOrderStatus.COMPLETED:
      return <ElTag type="success">COMPLETED</ElTag>;
    case PurchaseOrderStatus.COMPLETED:
      return <ElTag type="success">COMPLETED</ElTag>;
    default:
      return <ElTag>{status}</ElTag>;
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

const onRowClick = (item: PurchaseOrderItem) => emit("rowClick", item);

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
