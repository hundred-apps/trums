`
<template>
  <div class="flex items-center gap-3 my-3">
    <el-input
      v-model="request_search.keyword"
      size="default"
      placeholder="Cari invoice..."
      clearable
      style="width: 300px"
    />

    <el-button
      size="default"
      :loading-icon="Eleme"
      :icon="Eleme"
      :loading="status === 'pending'"
      @click="refreshData"
      style="margin-left: 0px"
    >
      Muat Ulang
    </el-button>
    <el-button
      v-if="hasSelected"
      type="danger"
      :disabled="!hasSelected"
      @click="batchDelete"
    >
      Hapus yang Dipilih
    </el-button>
  </div>
  <div class="grid grid-cols-6 gap-4 my-3">
    <el-button
      size="default"
      class="button-new-tag"
      :icon="Plus"
      @click="visibleFilter = true"
      >Filter</el-button
    >
    <template v-for="(tag, i) in request_search.column" :key="i">
      <el-tag
        size="large"
        @close="handleClose(key, 'column')"
        v-for="[key, value] in Object.entries(tag).filter(
          ([k, v]) => !excludeFilterView.includes(k) && !filterIsEmpty(v)
        )"
        closable
        type="info"
      >
        {{ availableColumn.findLast((value) => value.dataKey == key)?.title }}
      </el-tag>
    </template>
    <el-tag
      size="large"
      @close="handleClose(key, 'filter')"
      v-if="request_search.filter != null"
      v-for="[key, value] in Object.entries(request_search.filter).filter(
        ([k, v]) => k !== 'type' && !filterIsEmpty(v)
      )"
      closable
      type="info"
    >
      {{ availableColumn.findLast((value) => value.dataKey == key)?.title }}
    </el-tag>
  </div>

  <ClientOnly>
    <TrumsDragScrollTable>
      <customTable
        :columns="filteredColumns"
        :data="data?.data ?? []"
        @sort-change="onSort"
        @selection-change="handleSelectionChange"
      />
    </TrumsDragScrollTable>
  </ClientOnly>
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="data?.total_data"
      :current-page="data?.current_page"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>

  <el-drawer v-model="visibleFilter" :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">Filter</h4>
      <el-button type="danger" @click="close">
        <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
        Close
      </el-button>
    </template>
    <el-form
      ref="ruleFormRef"
      style="max-width: 600px"
      :model="ruleFormFilter"
      label-width="auto"
      class="demo-ruleForm"
      size="default"
      status-icon
      :label-position="labelPositionFormFilter"
    >
      <el-form-item label="Tanggal Invoice" prop="dateInvoice">
        <el-date-picker
          v-model="ruleFormFilter.dateInvoice"
          type="daterange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          :shortcuts="shortcutDate"
        />
      </el-form-item>
      <el-form-item label="Tenggat Waktu" prop="dueDateInvoice">
        <el-date-picker
          v-model="ruleFormFilter.dueDateInvoice"
          type="daterange"
          unlink-panels
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          :shortcuts="shortcutDate"
        />
      </el-form-item>
      <el-form-item label="Customer" prop="customer_id">
        <el-select
          v-model="ruleFormFilter.customer_id"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="Cari Customer"
          :remote-method="remoteSearchCustomer"
          :loading="loadingFilter"
          style="width: 100%"
        >
          <el-option
            v-for="item in optionsCustomer"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Invoice Total">
        <el-col :span="11">
          <el-input-number
            style="width: 100%"
            v-model="ruleFormFilter.amount_start"
            :min="1"
          />
        </el-col>
        <el-col :span="2" class="text-center">
          <span class="text-gray-500">-</span>
        </el-col>
        <el-col :span="11">
          <el-input-number
            style="width: 100%"
            v-model="ruleFormFilter.amount_end"
            :min="1"
          />
        </el-col>
      </el-form-item>
      <el-form-item label="Status" prop="status">
        <el-select
          v-model="ruleFormFilter.status"
          multiple
          collapse-tags
          placeholder="Select"
          style="width: 100%"
          :loading="loadingFilter"
        >
          <el-option
            v-for="item in paymentStatuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Metode Pembayaran" prop="payment_method">
        <el-select
          v-model="ruleFormFilter.payment_method"
          multiple
          collapse-tags
          placeholder="Select"
          style="width: 100%"
          :loading="loadingFilter"
        >
          <el-option
            v-for="item in paymentStatuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="demo-drawer__footer">
      <el-button @click="cancelFilter">Batal</el-button>
      <el-button type="primary" :loading="loading" @click="onFilter">
        {{ loading ? "Loading ..." : "Terapkan" }}
      </el-button>
    </div>
  </el-drawer>
</template>

<script lang="tsx" setup>
import { ElIcon, ElPopover, NuxtLink } from "#components";
import {
  Filter,
  Plus,
  Setting,
  SetUp,
  Eleme,
  CircleCloseFilled,
  ArrowDown,
  Warning,
} from "@element-plus/icons-vue";
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type FormInstance,
  type FormProps,
} from "element-plus";
import type { ColumnTable } from "~/types/ColumnTable";
import { PaymentMethod, PaymentStatus } from "~/types/finance/bill";
import type {
  Invoice,
  InvoiceReport,
  StatisticInvoice,
} from "~/types/finance/invoice";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { BaseResponse } from "~/types/response";
import type { Contact } from "~/types/contact";
import { canAccess } from "#imports";
import customTable from "~/components/trums/table/customTable.vue";
import type { Canvassing } from "~/types/scm/canvasing";

interface Props {
  paramsColumn?: Record<string, any>;
  dashboard?: boolean;
  fetchKey?: string;
  mode?: "edit" | "view";
  type?: "finance" | "invoicing";
  view?: "invoice" | "bill";
}

const { isMobile } = useDevice();

const props = withDefaults(defineProps<Props>(), {
  dashboard: true,
  mode: "edit",
  type: "finance",
  fetchKey: "fetch-invoice",
  view: "invoice",
});

interface formFilter {
  dateInvoice: string;
  dueDateInvoice: string;
  customer_id: string[];
  customer_name: string[];
  amount_start: number;
  amount_end: number;
  status: string[];
  payment_method: string[];
}

interface ListItem {
  label: string;
  value: string;
}

const paymentStatuses = [
  {
    label: PaymentStatus.DRAFT.toUpperCase(),
    value: PaymentStatus.DRAFT,
  },
  {
    label: PaymentStatus.RECEIVED.toUpperCase(),
    value: PaymentStatus.RECEIVED,
  },
  {
    label: PaymentStatus.PAID.toUpperCase(),
    value: PaymentStatus.PAID,
  },
  {
    label: PaymentStatus.UNPAID.toUpperCase(),
    value: PaymentStatus.UNPAID,
  },
];
const paymentMethods = [
  {
    label: PaymentMethod.BankTransfer.toUpperCase(),
    value: PaymentMethod.BankTransfer,
  },
  {
    label: PaymentMethod.Cash.toUpperCase(),
    value: PaymentMethod.Cash,
  },
  {
    label: PaymentMethod.Giro.toUpperCase(),
    value: PaymentMethod.Giro,
  },
];

const visibleFilter = ref(false);
const loadingFilter = ref<boolean>(false);
const loading = ref<boolean>(false);

const popoverRef = ref();

const selectedInvoices = ref<Invoice[]>([]);

const optionsCustomer = ref<ListItem[]>([]);

const ruleFormRefFilter = ref<FormInstance>();
const ruleFormFilter = reactive<formFilter>({
  dateInvoice: "",
  dueDateInvoice: "",
  customer_id: [],
  customer_name: [],
  amount_start: 0,
  amount_end: 0,
  status: [PaymentStatus.DRAFT],
  payment_method: [PaymentMethod.BankTransfer],
});

const labelPositionFormFilter = ref<FormProps["labelPosition"]>("top");

const shortcutDate = [
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
  column: [{ type: ["out"], status: [], payment_method: [] }],
  limit: "10",
  offset: "1",
  table: "",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data, refresh, status } = await useAsyncData(
  props.fetchKey,
  async () => {
    const res = await useFetchApi<ResponsePagination<InvoiceReport[]>>(
      `/invoice-list-report`,
      props.fetchKey,
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.invoices,
  type: "out",
});

const statistic = await useFetchApi<ResponsePagination<StatisticInvoice>>(
  `/statistic`,
  "invoice-statistic",
  "post",
  request_statistic.value
);

const handleClose = (tag: string, type: string) => {
  console.log("close tag", tag);
  if (type == "column") {
    for (let index = 0; index < request_search.value.column.length; index++) {
      const element = request_search.value.column[index];
      request_search.value.column[index][tag] = [];
    }
  } else {
    request_search.value.filter[tag] = null;
  }
};

const cancelFilter = () => {
  ruleFormRefFilter.value?.resetFields();
  visibleFilter.value = false;
};

const filterIsEmpty = (val: unknown) => {
  if (val == null) return true;
  if (typeof val === "string") return val.trim() === "";
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

const excludeFilterView = ref<string[]>(["type", "reference", "reference_id"]);
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "invoice_date",
  "due_date",
  "publisher",
  "customer_id",
  "sourcing_document",
  "total_amount",
  "status",
  "payment_method",
  "operations",
  "setup",
]);

const availableColumn = computed(() => {
  let columns: ColumnTable<InvoiceReport>[] = [
    {
      key: "unique_code",
      title: "Nomor Invoice",
      dataKey: "unique_code",
      width: 200,
      fixed: isMobile ? undefined : true,
      class: "stay-on-top",
      cellRenderer: ({ rowData: row }) => (
        <div class={"flex items-end"}>
          <NuxtLink
            href={
              props.type === "invoicing"
                ? `/invoicing/${row.unique_id}`
                : `/finance-management/invoice/${row.unique_id}`
            }
            class="text-blue-500"
          >
            {row.unique_code}
          </NuxtLink>
        </div>
      ),
    },
    {
      key: "customer_id",
      title: props.view == "invoice" ? "Customer" : "Vendor",
      dataKey: "customer_id",
      fixed: isMobile ? undefined : true,
      width: 300,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => (
        <span>
          {props.view == "invoice"
            ? rowData.customer_name
            : rowData.vendor?.name}
        </span>
      ),
    },
    {
      key: "sourcing_document",
      title: "No.PO",
      dataKey: "sourcing_document",
      width: 120,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return (
          <NuxtLink
            target={"_blank"}
            class={"text-blue-600 cursor-pointer"}
            href={
              rowData.data_reference
                ? `/sales/order/${rowData.data_reference.unique_id}`
                : "/error/404"
            }
          >
            {rowData.data_reference?.sourcing_document ?? ""}
          </NuxtLink>
        );
      },
    },
    {
      key: "invoice_date",
      title: "Tanggal Invoice",
      dataKey: "invoice_date",
      width: 170,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => (
        <span>
          {rowData.invoice_date == 0
            ? "-"
            : formatLocalDate(rowData.invoice_date!)}
        </span>
      ),
    },
    {
      key: "due_date",
      title: "Jatuh Tempo",
      dataKey: "due_date",
      width: 170,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => (
        <span>
          {rowData.due_date == 0 || rowData.due_date == null
            ? "-"
            : formatLocalDate(rowData.due_date!)}
        </span>
      ),
    },

    {
      key: "total_amount",
      title: "Total Invoice",
      dataKey: "total_amount",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.paid_amount || 0)}</span>;
      },
    },
    {
      key: "total_po",
      title: "Total PO",
      dataKey: "total_po",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.total_po || 0)}</span>;
      },
    },
    {
      key: "total_harga_jual",
      title: "Total Jual",
      dataKey: "total_harga_jual",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return (
          <span>{currencyWithoutSymbol(rowData.total_harga_jual || 0)}</span>
        );
      },
    },

    {
      key: "ppn_masukan",
      title: "PPN Masukan",
      dataKey: "ppn_masukan",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.ppn_masukan || 0)}</span>;
      },
    },
    {
      key: "ppn_keluaran",
      title: "PPN Keluaran",
      dataKey: "ppn_keluaran",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.ppn_keluaran || 0)}</span>;
      },
    },
    {
      key: "total_harga_beli",
      title: "Total Beli",
      dataKey: "total_harga_beli",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return (
          <span>{currencyWithoutSymbol(rowData.total_harga_beli || 0)}</span>
        );
      },
    },
    {
      key: "biaya_lain_lain",
      title: "Biaya Lain-Lain",
      dataKey: "biaya_lain_lain",
      width: 400,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return (
          <span class={"flex flex-col"}>
            <span class={"mb-3 font-bold"}>
              {currencyWithoutSymbol(rowData.biaya_lain_lain || 0)}
            </span>
            {(rowData.data_reference?.canvassing?.reference_transaction || [])
              .filter(
                (tr) =>
                  (tr.adjustments_transaction?.name || "").toLowerCase() !=
                    "fee" &&
                  (tr.adjustments_transaction?.name || "").toLowerCase() !=
                    "ppn"
              )
              .map((c) => (
                <span class={"flex justify-between items-center"}>
                  <span class={"text-xs"}>
                    {c.adjustments_transaction?.name}
                  </span>
                  <span class={"text-xs"}>
                    {currencyWithoutSymbol(c.amount)}
                  </span>
                </span>
              ))}
          </span>
        );
      },
    },
    {
      key: "total_fee",
      title: "Total Fee",
      dataKey: "total_fee",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.total_fee || 0)}</span>;
      },
    },
    {
      key: "profit",
      title: "Profit",
      dataKey: "profit",
      width: 150,
      sortable: true,
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => {
        // const total = row.items?.reduce((sum: any, item: { total_amount: any }) => sum + (item.total_amount || 0), 0) || 0
        return <span>{currencyWithoutSymbol(rowData.profit || 0)}</span>;
      },
    },
    {
      key: "status",
      title: "Status",
      dataKey: "status",
      width: 150,
      align: "center",
      class: "stay-on-top",
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
      class: "stay-on-top",
      cellRenderer: ({ rowData }: { rowData: InvoiceReport }) => (
        <span>
          {rowData.received_date
            ? formatLocalDate(rowData.received_date!)
            : "-"}
        </span>
      ),
    },
    {
      key: "payment_method",
      title: "Pembayaran",
      dataKey: "payment_method",
      width: 150,
      align: "center",
      class: "stay-on-top",
      cellRenderer: ({ rowData: row }) =>
        renderPaymentMethod(row.payment_method),
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
  ];

  if (props.mode == "edit") {
    columns.push({
      key: "operations",
      title: "Aksi",
      // cellRenderer: ({ rowData }: { rowData: Invoice }) => (
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
                  <ElDropdownItem
                    class={"text-red-600"}
                    command="delete"
                    divided
                  >
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
    });
  }

  columns.push({
    title: "Setup",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  });
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
  return columns;
});

const getOptionColumn = () => {};

// Filter columns based on selection
const filteredColumns = computed(() => {
  return availableColumn.value;
});

const hasSelected = computed(() => {
  return data.value?.data.some((item) => item.checked);
});

const renderStatusTag = (status: PaymentStatus | null) => {
  console.log("status", status);
  if (!status) return <></>;

  switch (status.toLowerCase()) {
    case "draft":
      return <ElTag type="info">{status.toUpperCase()}</ElTag>;
    case "paid":
      return <ElTag type="primary">{status.toUpperCase()}</ElTag>;
    case "unpaid":
      return <ElTag type="success">{status.toUpperCase()}</ElTag>;
    case "received":
      return <ElTag type="danger">{status.toUpperCase()}</ElTag>;
    default:
      return <ElTag>{status.toUpperCase()}</ElTag>;
  }
};

const renderPaymentMethod = (method: PaymentMethod | null) => {
  if (!method) return <>-</>;

  switch (method.toLowerCase()) {
    case "transfer":
      return <ElTag type="success">{method.toUpperCase()}</ElTag>;
    case "cash":
      return <ElTag type="warning">{method.toUpperCase()}</ElTag>;
    case "credit":
      return <ElTag type="danger">{method.toUpperCase()}</ElTag>;
    default:
      return <ElTag>{method.toUpperCase()}</ElTag>;
  }
};

// Delete invoice
const onDelete = async (uniques: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus invoice?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/invoice-delete",
      "delete-invoice",
      "post",
      uniques
    );
    if (response.status.value == "success") {
      ElMessage.success("Invoice berhasil dihapus");
      refreshData();
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

const handleNewInvoice = (command: string) => {
  if (command == "tunggal") {
    window.location.href = "/finance-management/invoice/add?is_termin=0";
  } else {
    window.location.href = "/finance-management/invoice/add?is_termin=1";
  }
};

// Edit invoice
const onEdit = (invoice: Invoice) => {
  //   const uniqueId = useCookie("unique_id");
  //   uniqueId.value = invoice.unique_id;
  //   router.push(`/finance-management/invoice/add`);
  if (props.type == "finance") {
    window.location.href = `/finance-management/invoice/add?id=${invoice.unique_id}`;
  } else {
    window.location.href = `/invoicing/add?id=${invoice.unique_id}`;
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

watchDebounced(
  () => request_search.value,
  () => refreshData(),
  { debounce: 500, deep: true, immediate: true }
);

const handleSelectionChange = (selection: Invoice[]) => {
  selectedInvoices.value = selection;
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

const remoteSearchCustomer = (query: string) => {
  if (!query) return;
  loadingFilter.value = true;
  try {
    const request_contact = { ...request_search.value };
    request_contact.column = [];
    request_contact.table = "contacts";
    request_contact.keyword = query;
    request_contact.flag = "form";

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          optionsCustomer.value = contacts.map((value) => ({
            value: value.unique_id,
            label: value.name,
          }));

          console.log("option customer", optionsCustomer.value);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch customers", error);
  } finally {
    loadingFilter.value = false;
  }
};

const onFilter = () => {
  loading.value = true;
  try {
    console.log("rule form", ruleFormFilter.dateInvoice);

    if (ruleFormFilter.dateInvoice != "") {
      request_search.value.filter = {
        ...request_search.value.filter,
        invoice_date: {
          min: new Date(ruleFormFilter.dateInvoice[0]).getTime() / 1000,
          max: new Date(ruleFormFilter.dateInvoice[1]).getTime() / 1000,
        },
      };

      // request_statistic.value.start_date =
    }
    if (ruleFormFilter.dueDateInvoice != "") {
      request_search.value.filter = {
        ...request_search.value.filter,
        due_date: {
          min: new Date(ruleFormFilter.dueDateInvoice[0]).getTime() / 1000,
          max: new Date(ruleFormFilter.dueDateInvoice[1]).getTime() / 1000,
        },
      };
    }
    if (ruleFormFilter.dueDateInvoice != "") {
      request_search.value.filter = {
        ...request_search.value.filter,
        total_amount: {
          min: ruleFormFilter.amount_start,
          max: ruleFormFilter.amount_end,
        },
      };
    }

    request_search.value.column = [
      {
        type: ["out"],
        status: ruleFormFilter.status,
        payment_method: ruleFormFilter.payment_method,
        customer_id: ruleFormFilter.customer_id,
      },
    ];
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.paramsColumn,
  (value) => console.log("param column", value),
  { deep: true, immediate: true }
);

const fetchCanvassing = async (
  unique_id: string
): Promise<Canvassing | undefined> => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${unique_id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error) {
    console.log("Gagal mengambil data canvassing", error);
  }
};

const fetchCanvassingBySO = async (
  so_id: string
): Promise<Canvassing | undefined> => {
  loading.value = true;
  try {
    const request_search: RequestSearch = {
      keyword: "",
      table: "canvassing",
      column: [
        {
          reference: ["so"],
          reference_id: [so_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };
    const response = await useFetchApi<ResponsePagination<Canvassing[]>>(
      `/search`,
      "detail-canvassing",
      "post",
      request_search
    );

    if (response.status.value == "success") {
      if ((response.data.value?.data || []).length >= 0) {
        return await fetchCanvassing(response.data.value?.data[0].unique_id!);
      }
    }
  } catch (error) {
    console.log("Gagal mengambil data canvassing", error);
  }
};

const refreshData = () => refresh();
</script>

<style scoped>
:deep(.el-row) {
  margin-bottom: 20px;
}
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

:deep(.el-statistic) {
  --el-statistic-content-font-size: 28px;
}

:deep(.el-table__body .stay-on-top) {
  vertical-align: top;
}

:deep(.statistic-card) {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

:deep(.statistic-footer) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

:deep(.statistic-footer .footer-item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.statistic-footer .footer-item span:last-child) {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

:deep(.is-guttered) {
  padding-top: 10px;
}

:deep(.green) {
  color: var(--el-color-success);
}
:deep(.red) {
  color: var(--el-color-error);
}
</style>
`
