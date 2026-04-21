<script lang="tsx" setup>
import { onMounted } from "vue";
import OrderSummery from "./components/OrderSummery.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { TypeInquiry } from "~/types/inquiry";
import { CanvassingStatus } from "~/types/scm/canvasing";
import CanvassingTable from "../sales/canvassing/components/CanvassingTable.vue";
import { Eleme } from "@element-plus/icons-vue";
import { refreshNuxtData } from "#app";
import UmurPiutangLineChart from "../reports/components/hutang-piutang/UmurPiutangLineChart.vue";
import inquiryTable from "../sales/inquiry/components/inquiryTable.vue";
import InvoiceSummery from "../finance-management/invoice/components/InvoiceSummery.vue";
import BillSummery from "../finance-management/bill/components/BillSummery.vue";
import InvoiceTable from "../finance-management/invoice/components/InvoiceTable.vue";
import { checkPermission } from "#imports";

definePageMeta({
  middleware: ["auth", "app"],
});

const refreshTrigger = ref<Number>(0);

const canReadPO = ref(false);
const canReadCanvassing = ref(false);
const canReadInquiry = ref(false);
const canReadInvoice = ref(false);

const request_search_rab_approval = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      inquiries: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
      status: [CanvassingStatus.PENDING_APPROVAL],
    },
  ],
  limit: "10",
  offset: "1",
  table: "canvassing",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const tableRABRef = ref<{
  reloadData: () => Promise<void>;
} | null>(null);

const onReload = async () => {
  console.log("ref", tableRABRef);
  if (!tableRABRef.value) return;
  await tableRABRef.value?.reloadData();
};

onMounted(async () => {
  canReadPO.value = await checkPermission("purchase-order-read");
  canReadCanvassing.value = await checkPermission("canvassing-read");
  canReadInquiry.value = await checkPermission("inquiry-read");
  canReadInvoice.value = await checkPermission("invoices-read");
});
</script>
<template>
  <TrumsWrapper>
    <OrderSummery v-if="canReadPO" />
    <ElCard class="mt-2 mb-5" shadow="never" v-if="canReadCanvassing">
      <template #header>
        <div class="card-header">
          <span>RAB Pending Approval</span>
        </div>
      </template>
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="request_search_rab_approval.keyword"
            size="default"
            placeholder="Cari RAB..."
            clearable
          />
        </el-col>
        <el-button
          size="default"
          :loading-icon="Eleme"
          @click="refreshNuxtData('get-rab')"
        >
          Muat Ulang
        </el-button>
      </el-row>
      <CanvassingTable
        :refresh-trigger="refreshTrigger"
        :request_search="request_search_rab_approval"
        :fetchKey="'get-rab'"
        type="RAB"
      />
    </ElCard>
    <ElCard class="mt-2 mb-5" shadow="never" v-if="canReadInquiry">
      <template #header>
        <div class="card-header">
          <span>Status RFQ</span>
        </div>
      </template>
      <inquiryTable />
    </ElCard>
    <!-- <UmurPiutangLineChart /> -->
    <div v-if="canReadInvoice">
      <p class="font-bold text-xl mb-3">INVOICE</p>
      <InvoiceTable />
      <p class="font-bold text-xl mb-5">TAGIHAN</p>
      <BillSummery />
    </div>
  </TrumsWrapper>
</template>
