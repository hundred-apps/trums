<template>
  <!-- Table -->
  <CustomTable
    :columns="filteredColumns"
    :data="data?.data ?? []"
    :loading="loading"
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
  type Column,
  type SortBy,
} from "element-plus";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  PurchaseOrderStatus,
  type PurchaseOrder,
} from "~/types/scm/purchase_order";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { BaseResponse } from "~/types/response";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ColumnTable } from "~/types/ColumnTable";

const props = withDefaults(
  defineProps<{
    request_search: RequestSearch;
    refreshKey: string;
    refreshTrigger: number;
    readonly?: boolean;
  }>(),
  {
    readonly: false,
  }
);

const selectedIds = ref<string[]>([]);
const loading = ref<boolean>(false);
const request_search = ref<RequestSearch>(props.request_search);
const columnsSelected = ref<string[]>(
  props.readonly
    ? [
        "selection",
        "unique_code",
        "vendor_name",
        "total_price",
        "date",
        "expected_arrival",
        "status",
        "created_at",
      ]
    : [
        "selection",
        "unique_code",
        "vendor_name",
        "total_price",
        "date",
        "expected_arrival",
        "status",
        "created_at",
        "operations",
        "setup",
      ]
);

const emit = defineEmits<{
  (e: "has-bulk", value: PurchaseOrder[]): void;
  (e: "on-pending", value: boolean): void;
  (e: "on-success", value: ResponsePagination<PurchaseOrder[]> | null): void;
}>();

// var data;

// Data state
const { data, status, refresh } = await useAsyncData(
  props.refreshKey,
  async () => {
    const res = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
      `/search`,
      props.refreshKey,
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

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
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <ElTag type={getStatusTagType(rowData.status)}>
        {formatStatus(rowData.status)}
      </ElTag>
    ),
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
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
    //   <>
    //     <NuxtLink
    //       class="el-button el-button--small"
    //       href={`/sales/order/add?id=${rowData.unique_id}`}
    //     >
    //       Edit
    //     </NuxtLink>
    //     <el-button
    //       size="small"
    //       type="danger"
    //       onClick={() => onDelete([rowData.unique_id!])}
    //     >
    //       Hapus
    //     </el-button>
    //   </>
    // ),
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/sales/order/add?id=${rowData.unique_id}`;
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
                <ElDropdownItem class={"text-red-600"} command="delete" divided>
                  Hapus
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

// Add selection column
columns.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
  fixed: true,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const onChange = (value: CheckboxValueType) => {
      data.value?.data?.forEach((item) => {
        item.checked = value as boolean;
      });
    };
    selectedIds.value = (data.value?.data ?? [])
      .filter((filter) => filter.checked)
      .map((value) => value.unique_id);
    return (
      <SelectionCell
        value={data.value?.data?.every((item) => item.checked) || false}
        onChange={onChange}
      />
    );
  },
});

// Setup column configuration
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
                      (col) =>
                        col.key !== "selection" &&
                        col.key !== "setup" &&
                        col.key !== "unique_code" &&
                        col.key !== "vendor_name"
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

const getStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return "primary";
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return "warning";
    case PurchaseOrderStatus.APPROVED:
      return "success";
    case PurchaseOrderStatus.CANCELLED:
      return "danger";
    case PurchaseOrderStatus.COMPLETED:
      return "primary";
    default:
      return "success";
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [PurchaseOrderStatus.DRAFT]: "Baru",
    [PurchaseOrderStatus.PENDING_APPROVAL]: "Menunggu Persetujuan",
    [PurchaseOrderStatus.APPROVED]: "Disetujui",
    [PurchaseOrderStatus.CANCELLED]: "Dibatalkan",
    [PurchaseOrderStatus.COMPLETED]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

// Computed
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const renderStatusTag = (status: PurchaseOrderStatus) => {
  if (!status) return <></>;

  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return <el-tag type="info">DRAFT</el-tag>;
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return <el-tag type="warning">PENDING APPROVAL</el-tag>;
    case PurchaseOrderStatus.APPROVED:
      return <el-tag type="success">APPROVED</el-tag>;
    case PurchaseOrderStatus.CANCELLED:
      return <el-tag type="danger">CANCELLED</el-tag>;
    case PurchaseOrderStatus.COMPLETED:
      return <el-tag type="success">COMPLETED</el-tag>;
    default:
      return <el-tag>{status}</el-tag>;
  }
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
      await refresh();
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
  }
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refresh();
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refresh();
};

watch(
  selectedIds,
  (val) => {
    emit(
      "has-bulk",
      (data.value?.data || []).filter((filter) =>
        val.includes(filter.unique_id)
      )
    );
  },
  { deep: true }
);
watch(
  () => status.value,
  (val) => {
    emit("on-success", data.value);
    emit("on-pending", val == "pending");
  },
  { immediate: true }
);
watch(
  () => props.refreshTrigger,
  (val) => {
    refresh();
  },
  { deep: true }
);
</script>
