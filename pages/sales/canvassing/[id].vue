<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          RAB - {{ canvassingData?.unique_code || "Loading..." }}
        </span>
      </template>
    </el-page-header>
    <CanvassingDetail
      v-if="canvassingData"
      :canvassingData="canvassingData"
      :privilages="currentPrivilage"
      :itemHighlights="itemHighlights"
    />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { Canvassing } from "~/types/scm/canvasing";
import type { BaseResponse } from "~/types/response";

import CanvassingDetail from "./components/CanvassingDetail.vue";
import type { Permission } from "~/types/menu";
import type { ItemRequest } from "~/types/item_request";
import type { AppFile } from "~/types/file";

definePageMeta({
  middleware: ["auth", "check-access"],
  name: "Detail Canvassing SI",
  requiredPermission: "canvassing-read",
});

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const canvassingData = ref<Canvassing | null>(null);
const currentPrivilage = ref<Permission[]>([]);
const itemHighlights = ref<string[]>((route.query.items ?? []) as string[]);

const goBack = () => router.back();

// Fetch canvassing data
const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      if (response.data.value?.data) {
        canvassingData.value = response.data.value!.data;

        const item_request: ItemRequest[] =
          canvassingData.value.source?.item_request ?? [];

        (canvassingData.value.canvassing_item ?? []).forEach((element) => {
          const appFile: AppFile[] =
            item_request.findLast(
              (ireq) => ireq.catalogue_id === element.catalogue_id
            )?.files ?? [];
          element.files = appFile;
          element.image = getFirstFileUrl(appFile);
        });

        console.log("canvassing data", canvassingData.value);

        currentPrivilage.value = response.data.value!.privilege;
      }
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log("items", route.query.items);
  fetchCanvassing();
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

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.demo-image__error .el-image {
  max-width: 300px;
  max-height: 200px;
  width: 100%;
}

.demo-image__error .image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 30px;
  height: 200px;
  background: #fff;
}
.demo-image__error .image-slot .el-icon {
  font-size: 30px;
}
.image-viewer-slot {
  background: var(--el-fill-color-light);
}
.viewer-error {
  color: #000;
}
:deep(.image-viewer-slot) {
  height: 30px !important;
}
</style>
