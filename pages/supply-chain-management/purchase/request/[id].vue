<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Purchase Request - {{ purchaseRequestData?.unique_code }}
        </span>
      </template>
    </el-page-header>
    <PurchaseRequestDetail
      v-if="purchaseRequestData"
      :purchase-request-data="purchaseRequestData"
    />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { PurchaseRequest } from "~/types/purchase_request";
import PurchaseRequestDetail from "./components/PurchaseRequestDetail.vue";
import type { BaseResponse } from "~/types/response";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Purchase Request Detail",
});

const router = useRouter();
const route = useRoute();
const purchaseRequestId = ref<string>(route.params.id as string);

const loading = ref(false);
const purchaseRequestData = ref<PurchaseRequest | null>(null);

const goBack = () => router.back();

// Fetch purchase request data
const fetchPurchaseRequest = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      `/purchase-request-read/${purchaseRequestId.value}`,
      "detail-purchase-request",
      "get",
      null
    );

    if (response.status.value === "success") {
      console.log(response.data.value!.data);
      purchaseRequestData.value = response.data.value!.data!;

      // await fetchRelatedData()
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase request");
    goBack();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPurchaseRequest();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 0.75rem;
}

.my-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.font-bold {
  font-weight: bold;
}

.text-large {
  font-size: 1.125rem;
}

.font-600 {
  font-weight: 600;
}

.mr-3 {
  margin-right: 0.75rem;
}
</style>
