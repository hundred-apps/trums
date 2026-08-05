<template>
  <customTable
    :columns="filteredColumns"
    :data="data?.data ?? []"
    :loading="loading"
    @sort-change="onSort"
    @selection-change="handleSelectionChange"
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
import { NuxtLink } from "#components";
import { Filter, Setting, SetUp } from "@element-plus/icons-vue";
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
} from "element-plus";
import type { ColumnTable } from "~/types/ColumnTable";
import {
  PurchaseOrderStatus,
  type PurchaseOrder,
} from "~/types/scm/purchase_order";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { formatLocalDate, currency } from "#imports";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { BaseResponse } from "~/types/response";
import customTable from "~/components/trums/table/customTable.vue";

interface Props {
  mode: "view" | "edit";
  keywordSearch: string;
  requestColumn?: Record<string, any>;
}
const props = withDefaults(defineProps<Props>(), {
  mode: "edit",
});

const emit = defineEmits<{
  onSelectionChange: [data: PurchaseOrder[]];
  reset: [];
  cancel: [];
}>();

const loading = ref<boolean>(false);
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "vendor_name",
  "total_price",
  "expected_arrival",
  "status",
  "created_at",
  "operations",
  "setup",
]);

const selectedPurchaseOrders = ref<PurchaseOrder[]>([]);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      status: [],
      type: ["po"],
      ...props.requestColumn,
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
const onRefreshData = () => refresh();
defineExpose({
  onRefreshData,
});
const { data, refresh, status } = await useAsyncData(
  "search-purchase-order",
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
      `/search`,
      "search-purchase-order",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const availableColumns = computed(() => {
  let columns: ColumnTable<PurchaseOrder>[] = [
    {
      key: "unique_code",
      title: "Nomor PO",
      dataKey: "unique_code",
      width: 200,
      fixed: true,
      cellRenderer: ({ rowData: row }) => (
        <NuxtLink
          href={`/supply-chain-management/purchase/order/${row.unique_id}`}
          class="text-blue-500"
        >
          {row.unique_code}
        </NuxtLink>
      ),
    },
    {
      key: "vendor_name",
      title: "Vendor",
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
      key: "status",
      title: "Status",
      dataKey: "status",
      width: 150,
      align: "center",
      cellRenderer: ({ rowData: row }) => renderStatusTag(row.status),
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
  ];

  if (props.mode == "edit") {
    columns.push({
      key: "operations",
      title: "Aksi",
      width: 100,
      cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => {
        const onCommand = (command: string) => {
          if (command === "edit") {
            window.location.href = `/supply-chain-management/purchase/order/add?id=${rowData.unique_id}`;
          }
          if (command === "delete") {
            onDelete([rowData.unique_id!]);
          }
        };

        return (
          <ElDropdown onCommand={onCommand} hideOnClick={false}>
            {{
              default: () => (
                <span class="cursor-pointer text-primary">
                  <ElIcon>
                    <Setting />
                  </ElIcon>
                </span>
              ),
              dropdown: () => (
                <ElDropdownMenu>
                  <ElDropdownItem command="edit">Edit</ElDropdownItem>
                  <ElDropdownItem
                    class={"text-red-600"}
                    command="delete"
                    divided
                  >
                    Hapus
                  </ElDropdownItem>
                </ElDropdownMenu>
              ),
            }}
          </ElDropdown>
        );
      },
      align: "center",
    });
  }

  columns.push({
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  });

  columns.unshift({
    key: "selection",
    width: 50,
    maxWidth: 50,
    align: "center",
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => {
        rowData.checked = value;
        emit(
          "onSelectionChange",
          (data.value?.data || []).filter((filter) => filter.checked)
        );
      };
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    headerCellRenderer: () => {
      const onChange = (value: CheckboxValueType) => {
        data.value?.data?.forEach((item) => {
          item.checked = value as boolean;
        });
        emit(
          "onSelectionChange",
          (data.value?.data || []).filter((filter) => filter.checked)
        );
      };
      return (
        <SelectionCell
          value={data.value?.data?.every((item) => item.checked) || false}
          onChange={onChange}
        />
      );
    },
  });

  columns[columns.length - 1].headerCellRenderer = () => {
    return (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs"></span>
        <ElPopover trigger="click" width={200}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup v-model={columnsSelected.value}>
                    {columns
                      .filter(
                        (col) => col.key !== "selection" && col.key !== "setup"
                      )
                      .map((col) => (
                        <ElCheckbox
                          key={col.key}
                          value={col.key!.toString()}
                          label={col.title}
                        />
                      ))}
                  </ElCheckboxGroup>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <SetUp />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    );
  };

  return columns;
});

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
    default:
      return <ElTag>{status}</ElTag>;
  }
};

const filteredColumns = computed(() => {
  return availableColumns.value.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const onSort = async (sortBy: { prop: string; order: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order == OrderColumn.DESCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

const handleSelectionChange = (selection: PurchaseOrder[]) => {
  selectedPurchaseOrders.value = selection;
  emit("onSelectionChange", selectedPurchaseOrders.value);
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onDelete = async (uniques: string[]) => {
  try {
    // Implement delete functionality here
    const response = await useFetchApi<BaseResponse<any>>(
      "/purchase-order-delete",
      "delete-purchase-order",
      "post",
      uniques
    );
    if (response.status.value === "success") {
      await onRefreshData();
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
  }
};

watch(
  () => props.keywordSearch,
  (value) => {
    request_search.value.keyword = value ?? "";
  }
);

watch(
  () => request_search.value,
  () => onRefreshData(),
  { deep: true }
);
</script>
