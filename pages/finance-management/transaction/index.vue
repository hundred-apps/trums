<template>
  <TrumsWrapper>
    <el-row :gutter="16">
      <el-col :span="12">
        <div class="statistic-card">
          <el-statistic
            :value="
              (cashflow.data.value?.data ?? []).reduce(function (acc, obj) {
                return acc + obj.income;
              }, 0)
            "
          >
            <template #title>
              <div
                style="display: inline-flex; align-items: center"
                class="text-green-600"
              >
                Total Pemasukan
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statistic-card">
          <el-statistic
            :value="
              (cashflow.data.value?.data ?? []).reduce(function (acc, obj) {
                return acc + obj.expense;
              }, 0)
            "
          >
            <template #title>
              <div
                style="display: inline-flex; align-items: center"
                class="text-red-600"
              >
                Total Pengeluaran
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="4">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari transaksi..."
          clearable
        />
      </el-col>
      <el-col :span="3">
        <NuxtLink
          style="width: 100%"
          class="el-button el-button--primary el-button--default"
          @click="
            () => {
              const unique_id = useCookie('unique_id');
              unique_id.value = null;
            }
          "
          href="/finance-management/transaction/add"
        >
          Tambah Transaksi
        </NuxtLink>
      </el-col>
      <el-col :span="3">
        <el-button
          size="default"
          style="width: 100%"
          :loading-icon="Eleme"
          :loading="loading"
          @click="refreshData"
        >
          Muat Ulang
        </el-button>
      </el-col>
      <el-col :span="3">
        <el-button
          type="danger"
          style="width: 100%"
          :disabled="!hasSelected"
          @click="batchDelete"
        >
          Hapus yang Dipilih
        </el-button>
      </el-col>
      <el-col :span="3">
        <el-button type="default" style="width: 100%" @click="exportToExcel">
          Export ke Excel
        </el-button>
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="monthRange"
          type="monthrange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start month"
          end-placeholder="End month"
          :shortcuts="shortcuts"
        />
      </el-col>
    </el-row>

    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      @sort-change="onSort"
      @selection-change="handleSelectionChange"
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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, Setting, SetUp } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElCheckboxGroup,
  ElTag,
} from "element-plus";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { Transaction, TransactionItem } from "~/types/finance/transaction";
import { Filter } from "@element-plus/icons-vue";
import type { BaseResponse } from "~/types/response";
import { unique } from "element-plus/es/utils/arrays.mjs";
import { useCookie } from "#app";
import type { ColumnTable } from "~/types/ColumnTable";
import type { Canvassing } from "~/types/canvassing";

const { XLSX, createWorkbook } = useSheetjs();

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "transactions-read",
});

const currentYear = new Date().getFullYear();

const monthRange = ref([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 1),
]);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      transaction: {
        type: [],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "transaction_items",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  filter: {
    transaction: {
      date: {
        min: monthRange.value[0].getTime() / 1000,
        max: monthRange.value[1].getTime() / 1000,
      },
    },
  },
  flag: "list",
});

type CashFlow = {
  month: string;
  income: number;
  expense: number;
  saldo: number;
};

const request_cashflow = ref<{ start_date: number; end_date: number }>({
  start_date: monthRange.value[0].getTime() / 1000,
  end_date: monthRange.value[1].getTime() / 1000,
});

const cashflow = await useAsyncData("get-cashflow", async () => {
  const res = await useFetchApi<ResponsePagination<CashFlow[]>>(
    `/laporan-pengeluaran`,
    "get-cashflow",
    "post",
    request_search.value
  );
  return res.data.value;
});

// Data state
const { data, refresh } = await useAsyncData(
  "fetch-transaction-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<TransactionItem[]>>(
      `/search`,
      "fetch-transaction-item",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const selectedTransactions = ref<any[]>([]);
const loading = ref(false);
const search = ref("");
const popoverRef = ref();
const router = useRouter();
const axios = useApi();

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

// Columns
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "description",
  "account",
  "date",
  "type",
  "reference_number",
  "amount",
  "operations",
  "setup",
]);
const columns: ColumnTable<TransactionItem>[] = [
  {
    key: "unique_code",
    title: "Kode Transaksi",
    dataKey: "unique_code",
    width: 300,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <NuxtLink
        href={`/finance-management/transaction/${rowData.transaction?.unique_id}`}
        class="text-blue-500"
      >
        {rowData.transaction?.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "description",
    title: "Deskripsi",
    dataKey: "description",
  },
  {
    key: "type",
    title: "Jenis",
    dataKey: "type",
    width: 200,
    fixed: true,
    align: "center",
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].transaction.type}
                  >
                    <ElCheckbox value="income">Pemasukan</ElCheckbox>
                    <ElCheckbox value="expense">Pengeluaran</ElCheckbox>
                    <ElCheckbox value="transfer">Transfer</ElCheckbox>
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
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) =>
      renderTypeTag(rowData.transaction!.type),
  },
  {
    key: "date",
    title: "Tanggal",
    dataKey: "date",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <span>
        {rowData.transaction!.date
          ? formatLocalDate(rowData.transaction!.date)
          : "-"}
      </span>
    ),
  },
  {
    key: "amount",
    title: "Jumlah",
    dataKey: "amount",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <span
        class={
          rowData.transaction!.type === "income"
            ? "text-green-500"
            : "text-red-500"
        }
      >
        {currency(rowData.amount)}
      </span>
    ),
  },
  {
    key: "account",
    title: "CoA",
    dataKey: "account",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <>{rowData.account?.name}</>
    ),
  },
  {
    key: "pic",
    title: "PIC",
    dataKey: "pic",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <>{rowData.party_data?.name ?? ""}</>
    ),
  },
  {
    key: "reference",
    title: "referensi",
    dataKey: "reference",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <>{rowData.reference_value ?? ""}</>
    ),
  },
  {
    key: "account_bank_name",
    title: "Rekening Sumber",
    dataKey: "account_bank_name",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <>
        {rowData.transaction!.account_bank_name} (
        {rowData.transaction!.account_bank_number})
      </>
    ),
  },
  {
    key: "account_bank_to_name",
    title: "Rekening Tujuan",
    dataKey: "account_bank_to_name",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => (
      <>
        {rowData.transaction!.account_bank_to_name} (
        {rowData.transaction!.account_bank_to_number})
      </>
    ),
  },

  {
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: Transaction }) => (
    //   <>
    //     <el-button size="small" onClick={() => onEdit(rowData)}>
    //       Edit
    //     </el-button>
    //     <el-button
    //       size="small"
    //       type="danger"
    //       onClick={() => onDelete([rowData.unique_id])}
    //     >
    //       Hapus
    //     </el-button>
    //   </>
    // ),
    // width: 150,
    // align: "center",
    cellRenderer: ({ rowData }: { rowData: TransactionItem }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          onEdit(rowData.transaction!);
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
                  Delete
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
    width: 70,
    align: "center",
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
    const _data = unref(data.value);
    const onChange = (value: CheckboxValueType) =>
      (data.value!.data = _data!.data.map((row: any) => {
        row.checked = value;
        return row;
      }));
    const allSelected = _data!.data.every((row: any) => row.checked);
    const containsChecked = _data!.data.some((row: any) => row.checked);

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

// Add column setup
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={columnsSelected.value}>
                  {columns
                    .filter((c) => c.key !== "selection" && c.key !== "setup")
                    .map((value) => (
                      <ElCheckbox key={value.key} value={value.key!.toString()}>
                        {value.title}
                      </ElCheckbox>
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

// Filter columns based on selection
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

// Render type tag
const renderTypeTag = (type: string) => {
  switch (type.toLowerCase()) {
    case "income":
      return <ElTag type="success">PEMASUKAN</ElTag>;
    case "expense":
      return <ElTag type="danger">PENGELUARAN</ElTag>;
    default:
      return <ElTag>{type.toUpperCase()}</ElTag>;
  }
};

// Handle selection change
const handleSelectionChange = (selection: any[]) => {
  selectedTransactions.value = selection;
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onSort = async (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

const hasSelected = computed(() => {
  return data.value?.data.some((item) => item.checked);
});

// Edit transaction
const onEdit = (transaction: Transaction) => {
  router.push(
    `/finance-management/transaction/add?id=${transaction.unique_id}`
  );
};

// Delete transaction
const onDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus transaksi ?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/transaction-items-delete",
      "delete-transaction",
      "post",
      ids
    );
    if (response.status.value == "success") {
      ElMessage.success("Data Transaksi berhasil dihapus");
      refreshNuxtData("fetch-transaction");
    }
  } catch (error) {
    // User canceled or error occurred
  }
};

// Batch delete
const batchDelete = async () => {
  const ids: string[] = [];
  for (let index = 0; index < (data.value?.data ?? []).length; index++) {
    const element = data.value?.data[index];
    if (element?.checked) {
      ids.push(element.unique_id!);
    }
  }
  onDelete(ids);
};

const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();
  const dataToExcel = (data.value?.data ?? []).map((value) => ({
    Kode: value.transaction?.unique_code,
    Type: value.transaction?.type == "expense" ? "Pengeluaran" : "Pemasukan",
    Keterangan: value.description ?? "",
    Tanggal: formatLocalDate(value.transaction!.date!),
    Jumlah: value.amount,
    CoA:
      value.account == null
        ? ""
        : `${value.account?.code}-${value.account?.name}`,
    "No.Ref": value.reference_value,
    PIC: `${value.party?.name ?? ""}`,
    "Rek.Sumber": `${value.transaction?.account_bank_name} (${value.transaction?.account_bank_number})`,
    "Rek.Tujuan":
      value.transaction?.account_bank_to_name == null
        ? ""
        : `${value.transaction?.account_bank_to_name} (${value.transaction?.account_bank_to_number})`,
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataToExcel);
  const headers = Object.keys(dataToExcel[0] ?? {});

  worksheet["!cols"] = headers.map((header) => {
    const maxLength = Math.max(
      header.length,
      ...dataToExcel.map(
        (row) => String(row[header as keyof typeof row] ?? "").length
      )
    );

    return {
      wch: maxLength + 2,
    };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, "Laporan-Pengeluaran-dan-Pemasukan.xlsx");
};

// Watch search query
watchDebounced(
  () => request_search.value,
  () => {
    refresh();
  },
  { debounce: 500, deep: true }
);

watch(
  () => monthRange,
  (newValue) => {
    const start = new Date(monthRange.value[0]);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(monthRange.value[1]);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    const startMs = start.getTime();
    const endMs = end.getTime();

    request_cashflow.value.start_date = startMs / 1000;
    request_cashflow.value.end_date = endMs / 1000;

    request_search.value.filter = {
      transaction: {
        date: {
          min: startMs / 1000,
          max: endMs / 1000,
        },
      },
    };
    refreshData();
  },
  { deep: true }
);

const refreshData = () => {
  cashflow.refresh();
  refresh();
};

onMounted(() => {});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.text-green-500 {
  color: #10b981;
}

.text-red-500 {
  color: #ef4444;
}
</style>
<style scoped>
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
</style>
