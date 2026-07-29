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
          v-if="!loading"
          :purchase-order="purchaseOrderData!"
          :privillage="privilage || []"
      /></el-tab-pane>
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
const inquiryData = ref<BaseResponse<Inquiry | undefined>>({
  success: false,
  message: "",
  privilege: [],
});
const privilage = ref<Permission[] | null>([]);

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
      await fetchInquiry();
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase order");
    goBack();
  } finally {
    loading.value = false;
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
        const inquiryDataValue: Inquiry[] = inquiry.data.value!.data!;

        inquiryData.value = {
          message: "",
          privilege: inquiry.data.value.privilege || [],
          success: true,
          data: inquiryDataValue[0],
        };
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
