<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Sales Order - {{ purchaseOrderData?.unique_code }}
        </span>
      </template>
    </el-page-header>
    <el-tabs type="border-card">
      <el-tab-pane label="Detail SO">
        <SalesOrderDetail
          v-if="!loading && purchaseOrderData"
          :purchase-order="purchaseOrderData"
          :privillage="privilage || []"
      /></el-tab-pane>
      <el-tab-pane label="PR">
        <PurchaseRequestDetail
          v-if="!loading && purchaseRequest"
          :purchase-request-data="purchaseRequest"
          @on-refresh="fetchPR"
        />
      </el-tab-pane>
      <el-tab-pane label="PO Vendor">
        <PurchaseOrderTable
          v-if="!loading && list_po_id.length > 0"
          :keyword-search="keywordSearchPO"
          :mode="'view'"
          :request-column="{ unique_id: list_po_id }"
        />
      </el-tab-pane>
      <el-tab-pane label="Tagihan Vendor">
        <InvoiceTable
          key="bill-vendor"
          v-if="!loading && list_po_id.length > 0"
          :mode="'view'"
          :dashboard="false"
          type="finance"
          :params-column="{
            reference: ['purchase_order'],
            reference_id: list_po_id,
          }"
          :fetch-key="'fetch-bill-vendor'"
          :view="'bill'"
        />
      </el-tab-pane>
      <el-tab-pane label="DO">
        <movementTable
          v-if="inquiryData.data"
          :mode="'view'"
          :prams-column="{
            reference: ['inquiry'],
            reference_id: inquiryData.data?.unique_id,
          }"
        />
      </el-tab-pane>
      <el-tab-pane label="INVOICE">
        <InvoiceTable
          key="invoice"
          v-if="!loading && purchaseOrderData"
          :mode="'view'"
          :dashboard="false"
          type="finance"
          :params-column="{
            reference: ['sales'],
            reference_id: [purchaseOrderData?.unique_id],
          }"
        />
      </el-tab-pane>
      <el-tab-pane label="Memo">
        <memoDetail
          v-if="transactionMemo"
          :canvassingData="transactionMemo!.data!"
          :privilages="transactionMemo.privilege"
        />
      </el-tab-pane>
    </el-tabs>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { type PurchaseOrder } from "~/types/scm/purchase_order";
import type { BaseResponse } from "~/types/response";
import SalesOrderDetail from "./components/SalesOrderDetail.vue";
import type { Permission } from "~/types/menu";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Inquiry } from "~/types/inquiry";
import type { RequestSearch } from "~/types/request_search";
import movementTable from "~/pages/inventory-management/checkin/components/movementTable.vue";
import InvoiceTable from "~/pages/finance-management/invoice/components/InvoiceTable.vue";
import type { ItemRequestTrail } from "~/types/item_request";
import type { PurchaseRequest } from "~/types/purchase_request";
import PurchaseRequestDetail from "~/pages/supply-chain-management/purchase/request/components/PurchaseRequestDetail.vue";
import PurchaseOrderTable from "~/pages/supply-chain-management/purchase/components/PurchaseOrderTable.vue";

import memoDetail from "./memo/memoDetail.vue";
import type { Canvassing } from "~/types/scm/canvasing";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "purchase-order-read",
  name: "Sales Order Detail",
});

const router = useRouter();
const route = useRoute();
const purchaseOrderId = ref<string>(route.params.id as string);

const loading = ref(false);
const purchaseOrderData = ref<PurchaseOrder | null>(null);
const purchaseRequest = ref<PurchaseRequest | undefined>();

const inquiryData = ref<BaseResponse<Inquiry | undefined>>({
  success: false,
  message: "",
  privilege: [],
});
const transactionMemo = ref<BaseResponse<Canvassing | undefined>>({
  success: false,
  message: "",
  privilege: [],
});

const privilage = ref<Permission[] | null>([]);
const list_po_id = ref<string[]>([]);

const keywordSearchPO = ref<string>("");

const goBack = () => router.back();

// Fetch purchase order data
const fetchPurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderData.value = response.data.value?.data ?? null;
      privilage.value = response.data.value?.privilege || [];
      fetchInquiry();
      fetchMemo();
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase order");
    goBack();
  } finally {
    loading.value = false;
  }
};

const fetchMemo = async () => {
  try {
    const memo_request: RequestSearch = {
      keyword: "",
      table: "canvassing",
      column: [
        {
          reference: ["so"],
          reference_id: [purchaseOrderData.value?.unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };

    // Fetch related purchase orders
    const memoResponse = await useFetchApi<ResponsePagination<Canvassing[]>>(
      `/search`,
      "fetch-canvassing",
      "post",
      memo_request
    );

    if (memoResponse.status.value === "success") {
      if (memoResponse.data.value?.data) {
        const canvassingDataResult: Canvassing[] =
          memoResponse.data.value?.data ?? [];

        // console.log("data inquiry", inquiryDataValue);

        if (canvassingDataResult.length > 0) {
          transactionMemo.value = {
            message: "",
            privilege: memoResponse.data.value.privilege || [],
            success: true,
            data: canvassingDataResult[0],
          };

          await fetchPR();
          await fetchPOVendor();
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const fetchInquiry = async () => {
  try {
    const inquiry_request: RequestSearch = {
      keyword: "",
      table: "inquiries",
      column: [
        {
          reference: ["so"],
          reference_id: [purchaseOrderData.value?.unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };

    // Fetch related purchase orders
    const inquiry = await useFetchApi<ResponsePagination<Inquiry[]>>(
      `/search`,
      "fetch-inquiries",
      "post",
      inquiry_request
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        const inquiryDataValue: Inquiry[] = inquiry.data.value?.data ?? [];

        console.log("data inquiry", inquiryDataValue);

        if (inquiryDataValue.length > 0) {
          inquiryData.value = {
            message: "",
            privilege: inquiry.data.value.privilege || [],
            success: true,
            data: inquiryDataValue[0],
          };

          await fetchPR();
          await fetchPOVendor();
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const fetchPR = async () => {
  try {
    const pr_request: RequestSearch = {
      keyword: "",
      table: "item_request_trail",
      column: [
        {
          reference: ["pr"],
          item_request_id: [inquiryData.value.data?.item_request[0].unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "1",
    };

    // Fetch related purchase orders
    const purchaseRequestResponse = await useFetchApi<
      ResponsePagination<ItemRequestTrail[]>
    >(`/search`, "fetch-inquiries", "post", pr_request);

    if (purchaseRequestResponse.status.value === "success") {
      if (purchaseRequestResponse.data.value?.data) {
        const item_request_trail: ItemRequestTrail[] =
          purchaseRequestResponse.data.value?.data ?? [];

        if (item_request_trail.length > 0) {
          purchaseRequest.value = item_request_trail[0]
            .data_reference as PurchaseRequest;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};
const fetchPOVendor = async () => {
  try {
    const pr_request: RequestSearch = {
      keyword: "",
      table: "item_request_trail",
      column: [
        {
          reference: ["po"],
          item_request_id: [inquiryData.value.data?.item_request[0].unique_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "10",
    };

    // Fetch related purchase orders
    const purchaseRequestResponse = await useFetchApi<
      ResponsePagination<ItemRequestTrail[]>
    >(`/search`, "fetch-inquiries", "post", pr_request);

    if (purchaseRequestResponse.status.value === "success") {
      if (purchaseRequestResponse.data.value?.data) {
        const item_request_trail: ItemRequestTrail[] =
          purchaseRequestResponse.data.value?.data ?? [];

        if (item_request_trail.length > 0) {
          list_po_id.value = item_request_trail.map(
            (map) => (map.data_reference as PurchaseOrder).unique_id
          );
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

onMounted(() => {
  fetchPurchaseOrder();
});
</script>
