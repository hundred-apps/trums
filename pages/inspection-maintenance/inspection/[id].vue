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
        <div class="flex justify-end gap-3">
          <el-button
            type="default"
            :icon="Eleme"
            :disabled="status === 'pending'"
            :loading="status === 'pending'"
            @click="refreshData"
            >Reload</el-button
          >
          <el-dropdown @command="handleUpdateStatus">
            <el-button type="primary">
              Ubah Status<el-icon class="el-icon--right"
                ><arrow-down
              /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="draft">DRAFT</el-dropdown-item>
                <el-dropdown-item command="progress">PROGRESS</el-dropdown-item>
                <el-dropdown-item command="repair">REPAIR</el-dropdown-item>
                <el-dropdown-item command="done">DONE</el-dropdown-item>
                <el-dropdown-item command="cancel">CANCEL</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
            class="el-button el-button--warning m-0"
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
        <el-table-column prop="image" label="Image" width="75" align="center">
          <template #default="scope">
            <div
              class="demo-image__preview flex items-center"
              style="width: 25px; height: 25px"
            >
              <ItemImageUpload
                v-if="getFile(scope.row as InspectionItem) != ''"
                v-model="scope.row.files"
                :image-url="getFirstFileUrl((scope.row as InspectionItem).files ?? [])"
                :show-text="false"
                @open-modal="() => {
                    fileList = getFilesUrl(scope.row as InspectionItem);
                    initialIndexImage = 0;
                    previewImage = true;
                  }"
              />
              <el-image v-else>
                <template #error>
                  <div
                    class="flex items-center justify-center border rounded py-2 px-2"
                    style="width: 25px; height: 25px; font-size: 10px"
                  >
                    <ElIcon>
                      <PictureFilled />
                    </ElIcon>
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="inventories.catalogue.name" label="Nama" />
        <el-table-column prop="inventories.location.name" label="Lokasi" />
        <el-table-column prop="pic.name" label="PIC" />
        <el-table-column prop="condition" label="Kondisi" />
      </el-table>
    </el-card>

    <el-image-viewer
      v-if="previewImage"
      show-progress
      :url-list="fileList"
      @close="previewImage = false"
    >
      <template #viewer-error="{ activeIndex, src }">
        <div class="image-slot viewer-error">
          <el-icon><icon-picture /></el-icon>
          <span>
            this is viewer-error slot. current index: {{ activeIndex }}. src:
            {{ src }}
          </span>
        </div>
      </template>
    </el-image-viewer>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import type { Inspection, InspectionItem } from "~/types/inspection";
import type { DefaultResponse } from "~/types/pagination";
import ListNameAndValue from "~/components/trums/ListNameAndValue.vue";
import { formatDate } from "@vueuse/core";
import {
  Delete,
  Eleme,
  Edit,
  PictureFilled,
  ArrowDown,
} from "@element-plus/icons-vue";
import { formatLocalDate } from "#imports";
import { getFirstFileUrl } from "#imports";
import ItemImageUpload from "~/pages/sales/inquiry/components/ItemImageUpload.vue";
import type { BaseResponse } from "~/types/response";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inspection-read",
  name: "Detail Of Inspection",
});

const router = useRouter();

const goBack = () => router.back();
const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const fileList = ref<string[]>([]);
const initialIndexImage = ref<number>(0);
const previewImage = ref<boolean>(false);

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

const handleUpdateStatus = (command: string) => {
  const formData = new FormData();

  formData.append("unique_id", `${data.value?.data.unique_id}`);
  formData.append("status", command);

  updateData(formData);
};

const updateData = async (formData: FormData) => {
  status.value = "pending";
  try {
    const response = await useFetchApi<BaseResponse<Inspection>>(
      "/inspection-create",
      "inspection-create",
      "post",
      formData
    );

    if (response.status.value === "success") {
      refreshData();
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    status.value = "success";
  }
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

const getFile = (inspectionItem: InspectionItem) => {
  if (inspectionItem.files != null && inspectionItem.files!.length > 0) {
    return `${imageUrl}/${inspectionItem.files![0].image_path}/${
      inspectionItem.files![0].filename
    }`;
  } else {
    return "";
  }
};
const getFilesUrl = (inspectionItem: InspectionItem): string[] => {
  if (inspectionItem.files != null && inspectionItem.files!.length > 0) {
    return inspectionItem.files.map(
      (file) => `${imageUrl}/${file.image_path}/${file.filename}`
    );
  } else {
    return [""];
  }
};

onMounted(() => {});
</script>
