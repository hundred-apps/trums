<template>
  <el-date-picker
    class="mb-5"
    v-model="monthRange"
    type="monthrange"
    unlink-panels
    range-separator="To"
    start-placeholder="Start month"
    end-placeholder="End month"
    :shortcuts="shortcuts"
  />
  <el-row :gutter="16" class="mb-3">
    <el-col :span="12">
      <div class="statistic-card">
        <el-statistic
          :value="
            (cashFlowMonth.data.value?.data ?? []).reduce(function (acc, obj) {
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
            (cashFlowMonth.data.value?.data ?? []).reduce(function (acc, obj) {
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

  <el-card shadow="never">
    <div class="flex gap-5">
      <el-form-item label="Cari">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari transaksi..."
          clearable
        />
      </el-form-item>
      <el-form-item label="CoA">
        <el-tree-select
          v-model="request_search.column[0].transaction_items.account_id"
          :data="treeAccounts.data.value?.data"
          placeholder="Filter CoA"
          multiple
          show-checkbox
          check-strictly
          node-key="unique_id"
          :props="{
            label: 'name',
            children: 'children',
          }"
        />
      </el-form-item>
      <el-button type="primary" @click="exportToExcel">
        Export ke Excel
      </el-button>
    </div>
    <TrumsDragScrollTable>
      <customTable
        :columns="columnsDetailTransaction"
        :data="transactionTree"
        :loading="transactionDetail.status.value == 'pending'"
        @sort-change="onSort"
        :table-props="{
          lazy: false,
          rowKey: 'unique_id',
          expandRowKeys: getExpandRowKeys ?? [],
          treeProps: {
            children: 'children',
          },
        }"
      />
    </TrumsDragScrollTable>
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        size="small"
        layout="prev, pager, next, sizes, total"
        :total="transactionDetail.data.value?.total_data"
        :current-page="transactionDetail.data.value?.currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </el-card>
  <el-card shadow="never" class="my-4">
    <v-chart
      :option="chartOption"
      autoresize
      style="height: 420px; width: 100%"
    />

    <custom-table
      :columns="column"
      :data="cashFlowMonth.data.value?.data ?? []"
      class="mt-4"
    />
  </el-card>
</template>
<script lang="tsx" setup>
import type { BaseResponse } from "~/types/response";
import { computed } from "vue";
import VChart from "vue-echarts";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Transaction } from "~/types/finance/transaction";
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElPopover,
  ElTag,
  NuxtLink,
} from "#components";
import { Filter } from "@element-plus/icons-vue";
import type { Account } from "~/types/finance/account";
import ExcelJS from "exceljs";

echarts.use([
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  CanvasRenderer,
]);

const { XLSX, createWorkbook } = useSheetjs();

const popoverRef = ref();
const currentYear = new Date().getFullYear();

const monthRange = ref<any>([
  new Date(currentYear, 0, 1),
  new Date(currentYear, 11, 1),
]);

type CashFlow = {
  month: string;
  income: number;
  expense: number;
  saldo: number;
};

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

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
      transaction_items: {
        account_id: [],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "transactions",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  filter: {
    date: {
      min: monthRange.value[0].getTime() / 1000,
      max: monthRange.value[1].getTime() / 1000,
    },
  },
  flag: "list",
});

type TransactionTreeTableView = {
  unique_id: string;
  unique_code: string;
  description: string;
  type: string;
  date: number;
  source: string;
  destination: string;
  amount: number;
  ref: string;
  ref_id: string;
  account_id: string;
  account_name: string;
  is_parent: boolean;
  children: TransactionTreeTableView[];
};

const paginateRequestTreeAccount = ref<{ limit: number; offset: number }>({
  limit: 10,
  offset: 1,
});

const transactionTree = ref<TransactionTreeTableView[]>([]);

const cashFlowMonth = await useAsyncData("get-cashflow", async () => {
  const res = await useFetchApi<BaseResponse<CashFlow[]>>(
    "/laporan-pengeluaran",
    "get-cashflow",
    "post",
    {
      start_date: request_search.value.filter.date.min,
      end_date: request_search.value.filter.date.max,
    }
  );
  return res.data.value;
});

const transactionDetail = await useAsyncData(
  "fetch-transaction-item",
  async () => {
    const res = await useFetchApi<ResponsePagination<Transaction[]>>(
      `/search`,
      "fetch-transaction-item",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const treeAccounts = await useAsyncData("get-tree-accounts", async () => {
  const res = await useFetchApi<ResponsePagination<Account[]>>(
    `/account-list`,
    "get-tree-accounts",
    "post",
    paginateRequestTreeAccount.value
  );
  return res.data.value;
});

const generateBankView = (
  data: Transaction,
  type: "source" | "destination"
) => {
  let source = "";
  if (type == "source") {
    if (data.account_bank_name) {
      source = data.account_bank_name;
    }

    if (data.account_bank_number) {
      source = source + " " + `(${data.account_bank_number})`;
    }
  } else {
    if (data.account_bank_to_name) {
      source = data.account_bank_to_name;
    }

    if (data.account_bank_to_number) {
      source = source + " " + `(${data.account_bank_to_number})`;
    }
  }

  return source;
};

watch(
  () => monthRange.value,
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

    request_search.value.filter = {
      date: {
        min: startMs / 1000,
        max: endMs / 1000,
      },
    };
    onRefresh();
  },
  { deep: true }
);

watch(
  () => transactionDetail.data.value?.data,
  (newValue) => {
    console.log("masuk watch");
    transactionTree.value = [];
    (newValue || []).forEach((element) => {
      transactionTree.value.push({
        unique_id: element.unique_id,
        unique_code: element.unique_code,
        description: element.description,
        type: element.type,
        date: element.date,
        source: generateBankView(element, "source"),
        destination: generateBankView(element, "destination"),
        amount: element.amount,
        ref: "",
        ref_id: "",
        account_id: "",
        account_name: "",
        is_parent: true,
        children: (element.transaction_items || []).map((item) => ({
          unique_id: item.unique_id!,
          unique_code: "",
          description: item.description ?? "",
          type: element.type,
          date: 0,
          source: "",
          destination: "",
          amount: item.amount,
          ref: item.reference_value,
          ref_id: "",
          account_id: item.account_id!,
          account_name: item.account?.name!,
          is_parent: false,
          children: [],
        })),
      });
    });
  },
  { deep: true, immediate: true }
);

watchDebounced(
  () => request_search.value,
  () => {
    onRefresh();
  },
  { debounce: 500, deep: true }
);

const onRefresh = () => {
  cashFlowMonth.refresh();
  transactionDetail.refresh();
};

const months = computed(() =>
  (cashFlowMonth.data.value?.data ?? []).map((i) => i.month)
);
const income = computed(() =>
  (cashFlowMonth.data.value?.data ?? []).map((i) => i.income)
);
const expense = computed(() =>
  (cashFlowMonth.data.value?.data ?? []).map((i) => i.expense)
);
const saldo = computed(() =>
  (cashFlowMonth.data.value?.data ?? []).map((i) => i.saldo)
);

const chartOption = computed(() => ({
  title: {
    text: "Cashflow Trend",
    left: "center",
  },

  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      let text = params[0].axisValue + "<br/>";

      params.forEach((p: any) => {
        text += `${p.marker} ${p.seriesName}: ${currency(p.value)}<br/>`;
      });

      return text;
    },
  },

  legend: {
    bottom: 0,
  },

  grid: {
    left: "3%",
    right: "3%",
    bottom: "12%",
    containLabel: true,
  },

  color: [
    "#67C23A", // income
    "#F56C6C", // expense
    "#409EFF", // saldo
  ],

  xAxis: {
    type: "category",
    data: months.value,
  },

  yAxis: {
    type: "value",
  },

  series: [
    {
      name: "Income",
      type: "line",
      smooth: true,
      areaStyle: {},
      data: income.value,
    },

    {
      name: "Expense",
      type: "line",
      smooth: true,
      data: expense.value,
    },

    {
      name: "Saldo",
      type: "line",
      smooth: true,
      data: saldo.value,
    },
  ],
}));

const column: ColumnTable<CashFlow>[] = [
  {
    key: "month",
    title: "Bulan",
    dataKey: "month",

    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"font-bold"}>{rowData.month}</p>
    ),
  },
  {
    key: "income",
    title: "Pemasukan",
    dataKey: "income",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-green-600"}>{currency(rowData.income)}</p>
    ),
  },
  {
    key: "expense",
    title: "Pengeluaran",
    dataKey: "expense",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-red-600"}>{currency(rowData.expense)}</p>
    ),
  },
  {
    key: "saldo",
    title: "Saldo",
    dataKey: "saldo",
    width: 300,
    align: "right",
    cellRenderer: ({ rowData }: { rowData: CashFlow }) => (
      <p class={"text-blue-600"}>{currency(rowData.saldo)}</p>
    ),
  },
];

const columnsDetailTransaction: ColumnTable<TransactionTreeTableView>[] = [
  {
    key: "unique_code",
    title: "Kode Transaksi",
    dataKey: "unique_code",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) =>
      rowData.is_parent ? (
        <NuxtLink
          href={`/finance-management/transaction/${rowData.unique_id}`}
          class="text-blue-500"
        >
          {wrapUniqueCode(rowData.unique_code)}
        </NuxtLink>
      ) : (
        <></>
      ),
  },
  {
    key: "description",
    title: "Deskripsi",
    dataKey: "description",
    width: 400,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) => (
      <p class={rowData.is_parent ? "font-bold" : ""}>{rowData.description}</p>
    ),
  },
  {
    key: "type",
    title: "Jenis",
    dataKey: "type",
    width: 100,
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
                    v-model={request_search.value.column[0].type}
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
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) =>
      rowData.is_parent ? renderTypeTag(rowData.type) : <></>,
  },
  {
    key: "account_name",
    title: "CoA",
    dataKey: "account_name",
    width: 200,
  },
  {
    key: "date",
    title: "Tanggal",
    dataKey: "date",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) =>
      rowData.is_parent ? (
        <span>{rowData.date ? formatLocalDate(rowData.date) : "-"}</span>
      ) : (
        <></>
      ),
  },
  {
    key: "amount",
    title: "Jumlah",
    dataKey: "amount",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) => (
      <span
        class={rowData!.type === "income" ? "text-green-500" : "text-red-500"}
      >
        {currency(rowData.amount)}
      </span>
    ),
  },

  {
    key: "account_bank_name",
    title: "Rekening Sumber",
    dataKey: "account_bank_name",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) =>
      rowData.is_parent ? <>{rowData.source}</> : <></>,
  },
  {
    key: "account_bank_to_name",
    title: "Rekening Tujuan",
    dataKey: "account_bank_to_name",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: TransactionTreeTableView }) =>
      rowData.is_parent ? <>{rowData.destination}</> : <></>,
  },
  {
    key: "ref",
    title: "Referensi",
    dataKey: "ref",
    width: 300,
  },
];
const renderTypeTag = (type: string) => {
  switch (type.toLowerCase()) {
    case "income":
      return <ElTag type="success">IN</ElTag>;
    case "expense":
      return <ElTag type="danger">OUT</ElTag>;
    default:
      return <ElTag>{type.toUpperCase()}</ElTag>;
  }
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
const getExpandRowKeys = computed(() => {
  const rowKeys = transactionTree.value
    .filter((value) => value.children && value.children.length > 0)
    .map((value) => value.unique_id);

  return rowKeys;
});

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  const headers = [
    "Kode",
    "Tanggal",
    "Type",
    "Akun",
    "Keterangan",
    "Debit",
    "Kredit",
    "No.Ref",
    "Rek.Sumber",
    "Rek.Tujuan",
  ];

  // ==========================
  // Header Report
  // ==========================
  worksheet.mergeCells(1, 1, 1, headers.length);
  worksheet.getCell("A1").value = "CASH FLOW STATEMENT";
  worksheet.getCell("A1").font = {
    bold: true,
    size: 18,
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.mergeCells(2, 1, 2, headers.length);
  worksheet.getCell("A2").value = `${formatLocalDate(
    monthRange.value[0].getTime() / 1000
  )} - ${formatLocalDate(monthRange.value[1].getTime() / 1000)}`;
  worksheet.getCell("A2").font = {
    size: 12,
  };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // ==========================
  // Header Table
  // ==========================
  const headerRow = worksheet.addRow([]);
  headerRow.commit();

  const tableHeader = worksheet.addRow(headers);

  tableHeader.font = {
    bold: true,
  };

  tableHeader.alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  tableHeader.eachCell((cell) => {
    cell.font = {
      bold: true,
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFD9D9D9",
      },
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let totalDebit = 0;
  let totalKredit = 0;

  // ==========================
  // Data
  // ==========================
  transactionTree.value.forEach((element) => {
    const parentRow = worksheet.addRow([
      element.unique_code,
      formatLocalDate(element.date!),
      element.type == "expense" ? "Pengeluaran" : "Pemasukan",
      "",
      element.description ?? "",
      element.type === "income" ? element.amount : "",
      element.type === "expense" ? element.amount : "",
      "",
      element.source,
      element.destination,
    ]);

    parentRow.font = {
      bold: true,
    };

    const amountCell = parentRow.getCell(6);
    const debitCell = parentRow.getCell(6);
    const kreditCell = parentRow.getCell(7);

    debitCell.numFmt = "#,##0.00";
    kreditCell.numFmt = "#,##0.00";

    // amountCell.font = {
    //   bold: true,
    //   color: {
    //     argb:
    //       element.type === "expense"
    //         ? "FFFF0000" // Merah
    //         : "FF008000", // Hijau
    //   },
    // };

    if (element.type === "income") {
      totalDebit += Number(element.amount ?? 0);
    } else {
      totalKredit += Number(element.amount ?? 0);
    }

    if (element.children) {
      element.children.forEach((child) => {
        const childRow = worksheet.addRow([
          child.unique_code,
          "",
          "",
          child.account_name,
          child.description ?? "",
          element.type === "income" ? child.amount : "",
          element.type === "expense" ? child.amount : "",
          "",
          child.source,
          child.destination,
        ]);

        const childTypeCell = childRow.getCell(6);
        const debitCell = childRow.getCell(6);
        const kreditCell = childRow.getCell(7);

        debitCell.numFmt = "#,##0.00";
        kreditCell.numFmt = "#,##0.00";
        // childTypeCell.font = {
        //   color: {
        //     argb:
        //       element.type === "expense"
        //         ? "FFFF0000" // Merah
        //         : "FF008000", // Hijau
        //   },
        // };
      });
    }
  });

  const totalRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "TOTAL",
    totalDebit,
    totalKredit,
    "",
    "",
    "",
  ]);

  totalRow.font = {
    bold: true,
  };

  totalRow.getCell(6).numFmt = "#,##0.00";
  totalRow.getCell(7).numFmt = "#,##0.00";

  totalRow.getCell(6).alignment = {
    horizontal: "right",
  };

  totalRow.getCell(7).alignment = {
    horizontal: "right",
  };

  totalRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "double" },
      right: { style: "thin" },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFF2F2F2",
      },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    // Mulai dari header tabel (baris ke-4 kosong, baris ke-5 header)
    if (rowNumber >= 5) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  // ==========================
  // Auto Width
  // ==========================
  worksheet.columns.forEach((column, index) => {
    let maxLength = 10;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const length = cell.value ? cell.value.toString().length : 0;
      if (length > maxLength) maxLength = length;
    });

    // Kolom Tanggal
    if (index === 1) {
      column.width = 20;
      return;
    }

    // Kolom Type
    if (index === 2) {
      column.width = 20;
      return;
    }
    if (index === 5 || index === 6) {
      column.width = 20;
      return;
    }

    // Kolom lainnya tetap auto
    column.width = maxLength + 2;
  });

  worksheet.getColumn(6).alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getColumn(7).alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // ==========================
  // Export
  // ==========================
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Laporan-Pengeluaran-dan-Pemasukan.xlsx";
  link.click();

  URL.revokeObjectURL(url);
};

onMounted(() => {
  console.log(monthRange.value[0]);
  console.log(monthRange.value[1]);
});
</script>
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

:deep(.el-table__cell) {
  padding: 5px !important;
}

:deep(.el-table__expand-icon) {
  display: none !important;
}
</style>
