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
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Inspeksi">{{
              data?.data.unique_code
            }}</el-descriptions-item>
            <el-descriptions-item
              label="Tanggal Inspeksi"
              >{{ formatLocalDate(data?.data.inspection_date!) }}</el-descriptions-item
            >
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
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
    <el-text class="font-bold" size="large">Daftar Item Inspeksi</el-text>
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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import type { Inspection } from "~/types/inspection";
import type { DefaultResponse } from "~/types/pagination";
import ListNameAndValue from "~/components/trums/ListNameAndValue.vue";
import { formatDate } from "@vueuse/core";

definePageMeta({
    middleware: ["auth", "check-access"],
    requiredPermission: "inspection-read",
    name: "Detail Of Inspection"
})

const router = useRouter();

const goBack = () => router.back();
const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");

const config = useRuntimeConfig();

const { data } = await useFetchApi<DefaultResponse<Inspection>>(
  `/inspection-read/${id.value}`,
  'get-inspection',
  'get',
  null,
);

onMounted(() => {});
</script>
