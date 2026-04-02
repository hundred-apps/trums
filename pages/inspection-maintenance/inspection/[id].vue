<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Inspection - {{ data?.data.unique_code }}
        </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <template #header>
        <div class="flex justify-end">
          <el-button
            type="default"
            :icon="Eleme"
            :disabled="status === 'pending'"
            :loading="status === 'pending'"
            @click="refreshData"
            >Reload</el-button
          >
          <el-button
            type="danger"
            :disabled="status === 'pending'"
            :loading="status === 'pending'"
            :icon="Delete"
            @click="confirmDelete"
            >Hapus</el-button
          >
          <NuxtLink
            :disabled="status === 'pending'"
            :loading="status === 'pending'"
            :to="`/inspection-maintenance/inspection/add?id=${data?.data.unique_id}`"
            class="el-button el-button--warning"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
        </div>
      </template>
      <div class="flex gap-3 my-3" v-if="status !== 'pending'">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Inspeksi">{{
              data?.data.unique_code
            }}</el-descriptions-item>
            <el-descriptions-item label="Unit Inspeksi">{{
              data?.data.inventory?.name ??
              data?.data.inventory?.catalogue?.name ??
              ""
            }}</el-descriptions-item>
            <el-descriptions-item label="Penanggung Jawab">{{
              data?.data.responsible?.name || ""
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item
              label="Tanggal Inspeksi"
              >{{ formatLocalDate(data?.data.inspection_date!) }}</el-descriptions-item
            >
            <el-descriptions-item label="Kondisi">{{
              data?.data.condition
            }}</el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag v-if="data?.data.status == 'draft'" type="info">
                DRAFT
              </el-tag>
              <el-tag
                v-else-if="data?.data.status == 'progress'"
                type="primary"
              >
                PROGRESS
              </el-tag>
              <el-tag v-else-if="data?.data.status == 'repair'" type="danger">
                REPAIR
              </el-tag>
              <el-tag v-else-if="data?.data.status == 'done'" type="success">
                DONE
              </el-tag>
              <el-tag v-else type="warning"> CANCEL </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-descriptions title="Note">
        <el-descriptions-item label="">{{
          data?.data.inspection_name
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card>
      <template #header>
        <el-text class="font-bold" size="large">Daftar Item Inspeksi</el-text>
      </template>
      <el-table
        :data="data?.data.inspection_item"
        class="my-3"
        border
        style="width: 100%"
      >
        <el-table-column prop="inventories.catalogue.name" label="Nama" />
        <el-table-column prop="inventories.location.name" label="Lokasi" />
        <el-table-column prop="pic.name" label="PIC" />
        <el-table-column prop="condition" label="Kondisi" />
      </el-table>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import type { Inspection } from "~/types/inspection";
import type { DefaultResponse } from "~/types/pagination";
import ListNameAndValue from "~/components/trums/ListNameAndValue.vue";
import { formatDate } from "@vueuse/core";
import { Delete, Eleme, Edit } from "@element-plus/icons-vue";
import { formatLocalDate } from "#imports";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inspection-read",
  name: "Detail Of Inspection",
});

const router = useRouter();

const goBack = () => router.back();
const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");

const config = useRuntimeConfig();

const { data, status, refresh } = await useAsyncData(
  "get-inspection-detail",
  async () => {
    const res = await useFetchApi<DefaultResponse<Inspection>>(
      `/inspection-read/${id.value}`,
      "get-inspection-detail",
      "get",
      null
    );
    return res.data.value;
  }
);

const refreshData = () => refresh();

const confirmDelete = () => {
  ElMessageBox.confirm(
    "Inspeksi akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      handleSubmitDelete([data.value?.data.unique_id ?? ""]);
    })
    .catch(() => {
      // Cancel
    });
};

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi(
      "/inspection-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      goBack();
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

onMounted(() => {});
</script>
