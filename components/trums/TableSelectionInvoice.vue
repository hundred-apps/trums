<template>
  <el-row :gutter="20" class="mb-3 mt-4">
    <el-col :span="6">
      <el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Cari dengan Nomor, Customer atau tanggal..."
        clearable
      />
    </el-col>
  </el-row>
  <customTable
    :columns="filteredColumns"
    :data="data?.data ?? []"
    :loading="status == 'pending'"
    @sort-change="onSort"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="data?.total_data"
      :current-page="data?.currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import { Filter, Setting, SetUp } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopover,
  TableV2FixedDir,
  type CheckboxValueType,
} from "element-plus";
import type { ColumnTable } from "~/types/ColumnTable";
import { PaymentMethod, PaymentStatus } from "~/types/finance/bill";
import type { Invoice } from "~/types/finance/invoice";
import SelectionCell from "./table/SelectionCell.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import customTable from "./table/customTable.vue";

const props = defineProps<{
  type: "invoice" | "bill";
}>();

const { isMobile } = useDevice();
const selectedIds = ref<Invoice[]>([]);
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "invoice_date",
  "customer_id",
  "total_amount",
  "status",
  "payment_method",
  "operations",
  "setup",
]);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [props.type == "invoice" ? "out" : "in"],
      status: [],
      payment_method: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "invoices",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const emit = defineEmits(["onSelected"]);

const { data, refresh, status } = await useAsyncData(
  `fetch-invoice-${props.type}`,
  async () => {
    const res = await useFetchApi<ResponsePagination<Invoice[]>>(
      `/search`,
      `fetch-invoice-${props.type}`,
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const columns: ColumnTable<Invoice>[] = [
  {
    key: "unique_code",
    title: "Nomor Invoice",
    dataKey: "unique_code",
    width: 200,
    fixed: isMobile ? undefined : true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={
          props.type === "invoice"
            ? `/finance-management/invoice/${row.unique_id}`
            : `/finance-management/bill/${row.unique_id}`
        }
        class="text-blue-500"
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "customer_id",
    title: "Customer",
    dataKey: "customer_id",
    fixed: isMobile ? undefined : true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>{rowData.customer_name}</span>
    ),
  },
  {
    key: "invoice_date",
    title: "Tanggal Invoice",
    dataKey: "invoice_date",
    width: 170,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>
        {rowData.invoice_date ? formatLocalDate(rowData.invoice_date) : "-"}
      </span>
    ),
  },
  // {
  //   key: "due_date",
  //   title: "Tenggat Waktu",
  //   dataKey: "due_date",
  //   width: 170,
  //   sortable: true,
  //   cellRenderer: ({ rowData }: { rowData: Invoice }) => (
  //     <span>
  //       {rowData.invoice_date ? formatLocalDate(rowData.due_date!) : "-"}
  //     </span>
  //   ),
  // },

  {
    key: "total_amount",
    title: "Total",
    dataKey: "total_amount",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => {
      // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
      return <span>{currency(rowData.total_amount)}</span>;
    },
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
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].status}
                  >
                    <ElCheckbox
                      key={PaymentStatus.DRAFT}
                      value={PaymentStatus.DRAFT}
                      label={PaymentStatus.DRAFTVIEW}
                    />
                    <ElCheckbox
                      key={PaymentStatus.RECEIVED}
                      value={PaymentStatus.RECEIVED}
                      label={PaymentStatus.RECEIVEDVIEW}
                    />
                    <ElCheckbox
                      key={PaymentStatus.PAIDVIEW}
                      value={PaymentStatus.PAIDVIEW}
                      label={PaymentStatus.PAIDVIEW}
                    />
                    <ElCheckbox
                      key={PaymentStatus.UNPAID}
                      value={PaymentStatus.UNPAID}
                      label={PaymentStatus.UNPAIDVIEW}
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
    key: "received_date",
    title: "Tanggal Diterima",
    dataKey: "received_date",
    width: 150,
    sortable: true,

    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>
        {rowData.received_date ? formatLocalDate(rowData.received_date!) : "-"}
      </span>
    ),
  },
  {
    key: "payment_method",
    title: "Pembayaran",
    dataKey: "payment_method",
    width: 150,
    align: "center",
    cellRenderer: ({ rowData: row }) => renderPaymentMethod(row.payment_method),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Pembayaran</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].payment_method}
                  >
                    <ElCheckbox
                      key={PaymentMethod.BankTransfer}
                      value={PaymentMethod.BankTransfer}
                      label={PaymentMethod.BankTransfer.toUpperCase()}
                    />
                    <ElCheckbox
                      key={PaymentMethod.Giro}
                      value={PaymentMethod.Giro}
                      label={PaymentMethod.Giro.toUpperCase()}
                    />
                    <ElCheckbox
                      key={PaymentMethod.Cash}
                      value={PaymentMethod.Cash}
                      label={PaymentMethod.Cash.toUpperCase()}
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
    key: "operations",
    title: "Pilih",
    dataKey: "operations",
    width: 80,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
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

// // Add selection column
// columns.unshift({
//   key: "selection",
//   width: 50,
//   maxWidth: 50,
//   align: "center",
//   fixed: true,
//   cellRenderer: ({ rowData }) => {
//     const onChange = (value: CheckboxValueType) => (rowData.checked = value);
//     return <SelectionCell value={rowData.checked} onChange={onChange} />;
//   },
//   headerCellRenderer: () => {
//     const _data = unref(data.value);
//     const onChange = (value: CheckboxValueType) =>
//       (data.value!.data = (_data?.data ?? []).map((row: any) => {
//         row.checked = value;
//         return row;
//       }));
//     const allSelected = _data?.data.every((row: any) => row.checked) ?? false;
//     const containsChecked =
//       _data?.data.some((row: any) => row.checked) ?? false;
//     selectedIds.value = (data.value?.data ?? [])
//       .filter((filter) => filter.checked)
//       .map((value) => value);
//     return (
//       <SelectionCell
//         value={allSelected}
//         interminate={containsChecked && !allSelected}
//         onChange={onChange}
//       />
//     );
//   },
// });

const getOptionColumn = () => {};

const popoverRef = ref();

const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});
const renderStatusTag = (status: PaymentStatus | null) => {
  console.log(status);
  if (!status) return <></>;

  switch (status.toLowerCase()) {
    case "draft":
      return <el-tag type="info">{status.toUpperCase()}</el-tag>;
    case "paid":
      return <el-tag type="primary">{status.toUpperCase()}</el-tag>;
    case "unpaid":
      return <el-tag type="success">{status.toUpperCase()}</el-tag>;
    case "received":
      return <el-tag type="danger">{status.toUpperCase()}</el-tag>;
    default:
      return <el-tag>{status.toUpperCase()}</el-tag>;
  }
};

const renderPaymentMethod = (method: PaymentMethod | null) => {
  if (!method) return <>-</>;

  switch (method.toLowerCase()) {
    case "transfer":
      return <el-tag type="success">{method.toUpperCase()}</el-tag>;
    case "cash":
      return <el-tag type="warning">{method.toUpperCase()}</el-tag>;
    case "credit":
      return <el-tag type="danger">{method.toUpperCase()}</el-tag>;
    default:
      return <el-tag>{method.toUpperCase()}</el-tag>;
  }
};

const refreshData = () => refresh();

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

watchDebounced(
  () => request_search.value,
  () => refreshData(),
  { debounce: 500, deep: true }
);

const onSelect = (data: Invoice) => {
  emit("onSelected", data);
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshData();
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refreshData();
};
</script>
