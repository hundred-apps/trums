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

    <InvoiceTable />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Eleme,
  SetUp,
  Filter,
  Plus,
  CircleCloseFilled,
  Setting,
} from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  subMenuProps,
  ElCheckboxGroup,
  type FormInstance,
  formProps,
  type FormProps,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import { PaymentStatus, PaymentMethod } from "~/types/finance/bill";
import type {
  Invoice,
  InvoiceItem,
  StatisticInvoice,
} from "~/types/finance/invoice";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { Contact } from "~/types/contact";
import { canAccess, useCookie, refreshNuxtData } from "#imports";
import type { ColumnTable } from "~/types/ColumnTable";
import InvoiceTable from "./components/InvoiceTable.vue";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "List Invoice",
});

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.invoices,
  type: "out",
});

// Data state
const statistic = await useFetchApi<ResponsePagination<StatisticInvoice>>(
  `/statistic`,
  "invoice-statistic",
  "post",
  request_statistic.value
);

const loading = ref<boolean>(false);

const router = useRouter();

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

onMounted(() => {
  // fetchData();
});
</script>

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
