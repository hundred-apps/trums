<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          RAB - {{ canvassingData?.unique_code || "Loading..." }}
        </span>
      </template>
    </el-page-header>

    <CanvassingDetailApprove
      v-if="
        canvassingData &&
        (canvassingData.status == CanvassingStatus.PENDING_APPROVAL ||
          canvassingData.status == CanvassingStatus.DONE ||
          canvassingData.status == CanvassingStatus.CANCEL)
      "
      :canvassingData="canvassingData"
      :privilages="currentPrivilage"
    />
    <CanvassingDetail
      v-if="
        canvassingData &&
        (canvassingData.status == CanvassingStatus.PENDING_APPROVAL_RAB ||
          canvassingData.status == CanvassingStatus.RAB)
      "
      :canvassingData="canvassingData"
      :privilages="currentPrivilage"
    />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { CanvassingStatus, type Canvassing } from "~/types/scm/canvasing";
import type { BaseResponse } from "~/types/response";
import type { Permission } from "~/types/menu";
import CanvassingDetailApprove from "./components/CanvassingDetailApprove.vue";
import CanvassingDetail from "./components/CanvassingDetail.vue";

// ========== PAGE META & ROUTING ==========
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "canvassing-read",
  name: "Quotation Detail",
});

// ========== COMPOSABLES ==========
const router = useRouter();
const route = useRoute();

const goBack = () => router.back();

// ========== STATE MANAGEMENT ==========
// UI State
const loading = ref(false);

// Data State
const canvassingData = ref<Canvassing | null>(null);
const currentPrivilage = ref<Permission[]>([]);

// ========== API CALLS ==========
const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success" && response.data.value?.data) {
      currentPrivilage.value = response.data.value.privilege ?? [];
      canvassingData.value = response.data.value.data;
      canvassingData.value.canvassing_item.forEach((element) => {
        element.canvassing_vendor.forEach((vendor) => {
          console.log(" status", vendor.status);
        });
      });
      // console.log(
      //   "canvassing vendor status",
      //   canvassingData.value.canvassing_item[0].canvassing_vendor[0].status
      // );
      // console.log(
      //   "canvassing vendor",
      //   canvassingData.value.canvassing_item[0].canvassing_vendor[0]
      // );
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

// ========== LIFECYCLE ==========
onMounted(() => {
  if (route.params.id) fetchCanvassing();
});
</script>

<style scoped>
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

.vendor-info {
  line-height: 1.4;
}

:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
:deep(.el-table .success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
