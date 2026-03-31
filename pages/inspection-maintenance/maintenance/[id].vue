<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Maintenance - {{ data?.data?.unique_code }}
        </span>
      </template>
    </el-page-header>
    <el-card
      class="my-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete">Hapus</el-button>
          <NuxtLink
            href="/inspection-maintenance/maintenance/add"
            @click="() => setCookie('maintenance_id', data?.data?.unique_id)"
            class="el-button el-button--primary"
            ><el-icon class="me-2"><Edit /></el-icon> Edit</NuxtLink
          >
        </div>
      </template>
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Item">
              {{ data?.data?.inventory?.catalogue?.name ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Lokasi">
              {{ data?.data?.location?.name ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Penanggung Jawab">
              {{ data?.data?.responsible?.name ?? "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Tipe">
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-tag
                    v-if="data?.data?.type == 'corrective'"
                    type="primary"
                    >{{ (data?.data?.type ?? "").toUpperCase() }}</el-tag
                  >
                  <el-tag
                    v-else-if="data?.data?.type == 'preventive'"
                    type="success"
                    >{{ (data?.data?.type ?? "").toUpperCase() }}</el-tag
                  >
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            type: 'preventive',
                          })
                      "
                      >Preventive</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            type: 'corrective',
                          })
                      "
                      >Corrective</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Tanggal Mulai">
              {{ formatLocalDate(data!.data!.start_date!) }}
            </el-descriptions-item>
            <el-descriptions-item label="Tanggal Selesai">
              {{ formatLocalDate(data!.data!.end_date!) }}
            </el-descriptions-item>
            <el-descriptions-item label="Prioritas">
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-tag v-if="data?.data?.priority == 'low'" type="primary">{{
                    (data?.data?.priority ?? "").toUpperCase()
                  }}</el-tag>
                  <el-tag
                    v-else-if="data?.data?.priority == 'medium'"
                    type="success"
                    >{{ (data?.data?.priority ?? "").toUpperCase() }}</el-tag
                  >
                  <el-tag
                    v-else-if="data?.data?.priority == 'high'"
                    type="danger"
                    >{{ (data?.data?.priority ?? "").toUpperCase() }}</el-tag
                  >
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            priority: 'low',
                          })
                      "
                      >Low</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            priority: 'medium',
                          })
                      "
                      >Medium</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            priority: 'high',
                          })
                      "
                      >High</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-tag v-if="data?.data?.status == 'draft'" type="info">{{
                    (data?.data?.status ?? "").toUpperCase()
                  }}</el-tag>
                  <el-tag
                    v-else-if="data?.data?.status == 'progress'"
                    type="primary"
                    >{{ (data?.data?.status ?? "").toUpperCase() }}</el-tag
                  >
                  <el-tag
                    v-else-if="data?.data?.status == 'done'"
                    type="success"
                    >{{ (data?.data?.status ?? "").toUpperCase() }}</el-tag
                  >
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            status: 'draft',
                          })
                      "
                      >Draft</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            status: 'progress',
                          })
                      "
                      >Progress</el-dropdown-item
                    >
                    <el-dropdown-item
                      @click="
                        () =>
                          updateData({
                            unique_id: data?.data?.unique_id,
                            status: 'done',
                          })
                      "
                      >Done</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-descriptions title="Note">
        <el-descriptions-item label="">{{
          data?.data?.note
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card
      class="mb-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header">
          <span>Pengerjaan</span>
        </div>
      </template>
      <el-table :data="data?.data?.maintenance_jobs">
        <el-table-column prop="name" label="Nama Pekerjaan"></el-table-column>
        <el-table-column prop="status" label="Status"></el-table-column>
        <el-table-column prop="pic_name" label="PIC">
          <template #default="scope">
            <p v-if="data?.data?.maintenance_jobs![scope.$index].is_team">
              {{ data?.data.maintenance_jobs![scope.$index].team?.name ?? '' }}
            </p>
            <p
              v-else="
                data?.data.maintenance_jobs[scope.$index].is_team == false
              "
            >
              {{ data?.data?.maintenance_jobs![scope.$index].people_pic?.name ?? '' }}
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="Aksi" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              :disabled="scope.$index == 0"
              @click="() => {}"
              :icon="Delete"
              circle
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card
      class="mb-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header">
          <span>Daftar Item</span>
        </div>
      </template>
      <el-table :data="data?.data?.maintenance_item ?? []">
        <el-table-column prop="inventory_name" label="item" />
        <el-table-column prop="inventory.sn" label="Serial Number">
          <template #default="scope">
            <p>
              {{ data?.data?.maintenance_item![scope.$index].inventory?.sn ?? '' }}
            </p>
          </template>
        </el-table-column>

        <el-table-column prop="quantity" label="Quantity">
          <template #default="scope">
            <el-text
              v-if="data!.data!.maintenance_item![scope.$index].quantity > data!.data!.maintenance_item![scope.$index].inventory!.quantity"
              class="mx-1"
              type="danger"
              >{{data!.data!.maintenance_item![scope.$index].quantity}}</el-text
            >
            <el-text
              v-else
              class="mx-1"
              >{{data!.data!.maintenance_item![scope.$index].quantity}}</el-text
            >
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Unit" />
        <el-table-column prop="unit_name" label="Aksi" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              :disabled="scope.$index == 0"
              @click="() => {}"
              :icon="Delete"
              circle
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import type { Maintenance } from "~/types/maintenance";
import type { BaseResponse } from "~/types/response";
import { Delete, Edit } from "@element-plus/icons-vue";
import { formatLocalDate } from "#imports";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "maintenances-read",
  name: "Detail Of Maintenances",
});

const router = useRouter();
const goBack = () => router.back();

const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");

const { data } = await useFetchApi<BaseResponse<Maintenance>>(
  `/maintenances-read/${id.value}`,
  "maintenance-detail",
  "get",
  null
);

const loading = ref(false);
const svg = `
    <path class="path" d="
        M 30 15
        L 28 17
        M 25.61 25.61
        A 15 15, 0, 0, 1, 15 30
        A 15 15, 0, 1, 1, 27.99 7.5
        L 15 15
    " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

const updateData = async (item: Record<string, any>) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Maintenance>>(
      "/maintenances-create",
      "maintenance-update-status",
      "post",
      item
    );
    if (response.status.value == "success") {
      data.value!.data = response.data.value!.data as Maintenance;
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const setCookie = (name: string, value: any) => {
  const type = useCookie(name);
  type.value = value;
};
</script>
