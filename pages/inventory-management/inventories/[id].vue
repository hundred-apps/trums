<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Detail - {{ data?.data?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <el-card class="my-3">
      <template #header>
        <div class="flex justify-end">
          <NuxtLink
            :to="`/inventory-management/inventories/add?id=${data?.data?.unique_id}`"
            class="el-button el-button--warning"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>

          <el-button
            type="danger"
            :icon="Delete"
            @click="onDelete([data?.data?.unique_id!])"
          >
            Hapus
          </el-button>
        </div>
      </template>

      <!-- FILES -->
      <div class="mb-5">
        <h1 class="text-lg font-bold">Lampiran</h1>

        <div v-if="data?.data?.files?.length" class="flex flex-wrap gap-4">
          <el-image
            v-for="(file, index) in data?.data?.files"
            :key="index"
            :src="getFileUrl(file)"
            :preview-src-list="previewImageList"
            :initial-index="index"
            fit="cover"
            class="w-32 h-32 rounded-md border"
          >
            <template #error>
              <div
                class="w-full h-full flex items-center justify-center bg-gray-100"
              >
                <el-icon :size="30"><Document /></el-icon>
              </div>
            </template>
          </el-image>
        </div>

        <el-empty v-else description="Tidak ada file" />
      </div>

      <div class="flex gap-3 my-3">
        <!-- LEFT -->
        <div class="flex-1">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="Catalogue">
              {{ data?.data?.catalogue?.name || "-" }}
            </el-descriptions-item>

            <el-descriptions-item label="Location">
              {{ data?.data?.location?.name || "-" }}
            </el-descriptions-item>

            <el-descriptions-item label="Quantity">
              {{ data?.data?.quantity }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- RIGHT -->
        <div class="flex-1">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="Serial Number">
              {{ data?.data?.sn || "-" }}
            </el-descriptions-item>

            <el-descriptions-item label="Traceable">
              <el-tag v-if="data?.data?.is_traceable" type="primary">
                Traceable
              </el-tag>
              <el-tag v-else type="info">Non-Traceable</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Unit">
              {{ data?.data?.unit_name || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- STATUS -->
      <div class="mb-5">
        <h1 class="text-lg font-bold">Status Stok</h1>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="Order">
            {{ data?.data?.order }}
          </el-descriptions-item>

          <el-descriptions-item label="Request">
            {{ data?.data?.request }}
          </el-descriptions-item>

          <el-descriptions-item label="Booking">
            {{ data?.data?.booking }}
          </el-descriptions-item>

          <el-descriptions-item label="Available">
            {{ data?.data?.available }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- AUDIT -->
      <div class="mb-5">
        <h1 class="text-lg font-bold">Informasi Sistem</h1>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="Dibuat Pada">
            {{ formatLocalDate(data?.data?.created_at || 0) }}
          </el-descriptions-item>

          <el-descriptions-item label="Terakhir Update">
            {{ formatLocalDate(data?.data?.updated_at || 0) }}
          </el-descriptions-item>

          <el-descriptions-item label="Versi">
            {{ data?.data?.version }}
          </el-descriptions-item>

          <el-descriptions-item label="Pengguna">
            {{ data?.data?.people?.name || "" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- MOVEMENT -->
    <el-card class="mt-3">
      <h1 class="mb-4">Movement History</h1>

      <el-timeline
        v-if="
          movementHistory.status.value !== 'pending' &&
          movementHistory.data.value?.data
        "
      >
        <el-timeline-item
          v-for="(item, index) in movementHistory.data.value?.data"
          :key="index"
          :timestamp="formatLocalDate(item.created_at)"
        >
          {{
            item.inventory_movement?.type == "in" ? "CHECK IN" : "CHECK OUT"
          }}
          ({{ `${item.inventory_movement?.to_name}` }})
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="Belum ada pergerakan" />
    </el-card>
  </TrumsWrapper>
</template>

<script setup lang="ts">
import { Delete, Edit } from "@element-plus/icons-vue";
import type { Inventory } from "~/types/inventory";
import type { BaseResponse } from "~/types/response";
import { formatLocalDate, currency, getFileUrl } from "#imports";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { InventoryMovementItem } from "~/types/inventory_movement";

const router = useRouter();
const route = useRoute();

const id = computed(() => route.params.id);

const goBack = () => router.back();

const { data, refresh, status } = await useAsyncData(
  "inventory-detail",
  async () => {
    const res = await useFetchApi<BaseResponse<Inventory>>(
      `/inventories-read/${route.params.id}`,
      "inventory-detail",
      "get",
      null
    );
    return res.data.value;
  }
);

const request_search_movement_history = ref<RequestSearch>({
  keyword: "",
  table: "inventory_movement_item",
  column: [
    {
      inventory_id: [data.value?.data?.unique_id],
    },
  ],
  sort: null,
  offset: "1",
  limit: "10",
});

const movementHistory = await useAsyncData("movement-history", async () => {
  const res = await useFetchApi<ResponsePagination<InventoryMovementItem[]>>(
    `/search`,
    "movement-history",
    "post",
    request_search_movement_history.value
  );
  return res.data.value;
});

watch(
  () => data.value?.data?.unique_id,
  () => {
    request_search_movement_history.value.column = [
      {
        inventory_id: [data.value?.data?.unique_id],
      },
    ];
    movementHistory.refresh();
  },
  { deep: true }
);

// DELETE
const onDelete = async (ids: string[]) => {
  await useFetchApi("/inventories-delete", "delete", "post", ids);
  router.back();
};

const previewImageList = computed(() => {
  return mapAllAppFileToFileUri(data.value?.data?.files ?? []);
});
</script>
