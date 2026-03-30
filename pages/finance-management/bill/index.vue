<template>
  <TrumsWrapper>
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_invoices || 0"
            title="Invoice Draft"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Data
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_nominal || 0"
            title="Invoice Received"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Nominal Invoice
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_received || 0"
            title="Invoice Received"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Invoice Received
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_unpaid || 0"
            title="Invoice Unpaid"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Invoice Unpaid
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_paid || 0"
            title="Invoice Paid"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Invoice Paid
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="statistic-card mt-3">
          <el-statistic
            :value="statistic.data.value?.data.total_draft || 0"
            title="Invoice Draft"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Invoice Draft
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    <div class="flex my-6">
      <el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Cari bill..."
        clearable
        style="width: 300px; margin-right: 12px"
      />
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        @click="
          () => {
            const unique = useCookie('unique_id');
            unique.value = null;
          }
        "
        href="/finance-management/bill/add"
      >
        Buat Bill Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="fetchData"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="batchDelete">
        Hapus yang Dipilih
      </el-button>
    </div>

    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      :column-sort="onSort"
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
import { Eleme, SetUp, Filter, Setting } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import { PaymentStatus, PaymentMethod, type Bill } from "~/types/finance/bill";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { Invoice, StatisticInvoice } from "~/types/finance/invoice";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import { unique } from "element-plus/es/utils/arrays.mjs";
import type { BaseResponse } from "~/types/response";
import { useCookie } from "#app";
import type { ColumnTable } from "~/types/ColumnTable";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "List Bill",
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["in"],
      status: [],
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

// Data state
const { data } = await useFetchApi<ResponsePagination<Invoice[]>>(
  `/search`,
  "invoice",
  "post",
  request_search.value
);

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.invoices,
  type: "in",
});

// Data state
const statistic = await useFetchApi<ResponsePagination<StatisticInvoice>>(
  `/statistic`,
  "invoice-statistic",
  "post",
  request_statistic.value
);

const selectedBills = ref<Invoice[]>([]);
const loading = ref(false);
const search = ref("");
const popoverRef = ref();
const router = useRouter();
const axios = useApi();

// Columns
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "bill_date",
  "due_date",
  "to_name",
  "total_amount",
  "status",
  "payment_method",
  "operations",
  "setup",
]);

const columns: ColumnTable<Invoice>[] = [
  {
    key: "unique_code",
    title: "Nomor Bill",
    dataKey: "unique_code",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/finance-management/invoice/${row.unique_id}`}
        class="text-blue-500"
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "to_name",
    title: "Vendor",
    dataKey: "to_name",
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>{rowData.vendor?.name ?? "-"}</span>
    ),
  },
  {
    key: "bill_date",
    title: "Tanggal Bill",
    dataKey: "bill_date",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>
        {rowData.invoice_date == null
          ? ""
          : formatLocalDate(rowData.invoice_date)}
      </span>
    ),
  },
  {
    key: "bill_date",
    title: "Tenggat Waktu",
    dataKey: "bill_date",
    width: 170,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>{rowData.due_date ? formatLocalDate(rowData.due_date) : "-"}</span>
    ),
  },

  {
    key: "total_amount",
    title: "Total",
    dataKey: "total_amount",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Invoice }) => (
      <span>{formatCurrency(rowData.total_amount)}</span>
    ),
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 150,
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
                    <ElCheckbox value={PaymentStatus.DRAFT}>
                      {PaymentStatus.DRAFTVIEW}
                    </ElCheckbox>
                    <ElCheckbox value={PaymentStatus.RECEIVED}>
                      {PaymentStatus.RECEIVEDVIEW}
                    </ElCheckbox>
                    <ElCheckbox value={PaymentStatus.PAIDVIEW}>
                      {PaymentStatus.PAIDVIEW}
                    </ElCheckbox>
                    <ElCheckbox value={PaymentStatus.UNPAID}>
                      {PaymentStatus.UNPAIDVIEW}
                    </ElCheckbox>
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
    width: 170,
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
    cellRenderer: ({ rowData: row }) => renderPaymentMethod(row.payment_method),
  },
  {
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: Bill }) => (
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
    cellRenderer: ({ rowData }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          onEdit(rowData);
        }
        if (command === "delete") {
          onDelete([rowData.unique_id]);
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

// Tambahkan kolom seleksi di awal
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
      (data.value!.data = (_data?.data ?? []).map((row: any) => {
        row.checked = value;
        return row;
      }));
    const allSelected = _data?.data.every((row: any) => row.checked) ?? false;
    const containsChecked =
      _data?.data.some((row: any) => row.checked) ?? false;

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

// Tambahkan setup kolom di akhir
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
                    .map((c) => (
                      <ElCheckbox
                        key={c.key}
                        value={c.key!.toString()}
                        label={c.title}
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

// Filter columns based on selection
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("id-ID");
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Render status tag
const renderStatusTag = (status: PaymentStatus | null) => {
  if (!status) return <></>;

  switch (status.toLowerCase()) {
    case "draft":
      return <el-tag type="info">{status.toUpperCase()}</el-tag>;
    case "posted":
      return <el-tag type="primary">{status.toUpperCase()}</el-tag>;
    case "paid":
      return <el-tag type="success">{status.toUpperCase()}</el-tag>;
    case "overdue":
      return <el-tag type="danger">{status.toUpperCase()}</el-tag>;
    default:
      return <el-tag>{status.toUpperCase()}</el-tag>;
  }
};

// Render payment method
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

const hasSelected = computed(() => {
  return data.value?.data.some((item) => item.checked);
});

// Handle selection change
const handleSelectionChange = (selection: Invoice[]) => {
  selectedBills.value = selection;
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

// Edit bill
const onEdit = (bill: Bill) => {
  const cookie = useCookie("unique_id");
  cookie.value = bill.unique_id;
  router.push(`/finance-management/bill/add`);
};

// Delete bill
const onDelete = async (bill: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus bill?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/invoice-delete",
      "delete-invoice",
      "post",
      bill
    );
    if (response.status.value == "success") {
      ElMessage.success("bill berhasil dihapus");
      refreshNuxtData("invoice");
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
      ids.push(element.unique_id);
    }
  }
  onDelete(ids);
};

// Fetch data from API
const fetchData = async () => {
  loading.value = true;
  try {
    // const response = await axios.get('/bills', {
    //   params: {
    //     page: pagination.currentPage,
    //     pageSize: pagination.pageSize,
    //     search: search.value
    //   }
    // })
    // if (response.status === 200) {
    //   bills.value = response.data.data.map((bill: Bill) => ({
    //     ...bill,
    //     checked: false
    //   }))
    //   pagination.total = response.data.total
    // }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Gagal memuat data bill");
  } finally {
    loading.value = false;
  }
};

const onSort = async (sortBy: SortBy) => {
  // console.log('sort', sortBy.key);
  // console.log(request_search.value);
  // const data:RequestSearch = {...request_search.value};
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

// Watch search query
watchDebounced(
  request_search.value,
  () => {
    refreshNuxtData("invoice");
  },
  { debounce: 500 }
);

onMounted(() => {
  // fetchData()
});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
<style scoped>
.el-row {
  margin-bottom: 20px;
}
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

.is-guttered {
  padding-top: 10px;
}

.green {
  color: var(--el-color-success);
}
.red {
  color: var(--el-color-error);
}
</style>
