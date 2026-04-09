<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Maintenance </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
              Simpan
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
          </el-form-item>
        </div>
      </template>
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        status-icon
      >
        <el-form-item label="Lokasi Maintenance" prop="location_name">
          <el-autocomplete
            :fetch-suggestions="querySearchLocation"
            v-model="ruleForm.location_name"
            placeholder="Cari Lokasi Maintenance"
            @select="onHandleSelectLocationAutocomplete"
          />
        </el-form-item>
        <el-form-item label="Item" prop="inventory_name">
          <el-autocomplete
            :fetch-suggestions="querySearchAsyncInventories"
            v-model="ruleForm.inventory_name"
            placeholder="Search Item"
            @select="onHandleSelectItemAutocomplete"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2"
                  >Tambahkan "{{ item.object.catalogue.name }}"</span
                >
              </div>
              <div v-else class="flex items-center gap-2">
                <!-- Thumbnail file pertama -->
                <div class="flex-shrink-0 mt-1">
                  <div
                    v-if="
                      item.object.catalogue.files &&
                      item.object.catalogue.files.length > 0
                    "
                    class="w-10 h-10 rounded overflow-hidden border"
                  >
                    <img
                      :src="getFirstFileUrl(item.object.catalogue.files)"
                      :alt="item.object.catalogue.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="w-10 h-10 rounded border flex items-center justify-center text-gray-400"
                  >
                    <el-icon><Picture /></el-icon>
                  </div>
                </div>

                <!-- Informasi produk -->
                <div class="flex-1 min-w-0">
                  <p style="line-height: 15px" class="font-bold truncate">
                    {{ item.object.catalogue.name }}
                  </p>
                  <p class="text-sm text-gray-500 truncate">
                    PN/SN:
                    {{
                      item.object.catalogue.sn || item.object.sn || "Tidak Ada"
                    }}
                    | Brand:
                    {{ item.object.catalogue.brand_name || "N/A" }}
                  </p>
                </div>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Penganggung Jawab" prop="responsible_name">
          <el-autocomplete
            :fetch-suggestions="querySearchAsyncPic"
            v-model="ruleForm.responsible_name"
            placeholder="Search People"
            @select="onHandleSelectPICAutocomplete"
          />
        </el-form-item>
        <el-form-item label="Tanggal Maintanance" prop="maintenance_date">
          <el-date-picker
            v-model="ruleForm.maintenance_date"
            type="date"
            placeholder="Tanggal Maintenance"
          />
        </el-form-item>
        <el-form-item label="Tanggal Mulai" prop="start_date">
          <el-date-picker
            v-model="ruleForm.start_date"
            type="date"
            placeholder="Tanggal Mulai"
          />
        </el-form-item>
        <el-form-item label="Tanggal Selesai" prop="end_date">
          <el-date-picker
            v-model="ruleForm.end_date"
            type="date"
            placeholder="Tanggal Selesai"
          />
        </el-form-item>
        <el-form-item label="Berulang" prop="is_repeate">
          <el-switch v-model="ruleForm.is_repeate" />
        </el-form-item>
        <el-form-item
          v-if="ruleForm.is_repeate"
          label="Periode Pengulangan"
          prop="count"
        >
          <el-select-v2
            placeholder="Periode"
            v-model="ruleForm.repeate_option"
            :options="[
              { value: '7H', label: '7 Hari' },
              { value: '1B', label: '1 Bulan' },
              { value: '3B', label: '3 Bulan' },
              { value: '6B', label: '6 Bulan' },
              { value: '1T', label: '1 Tahun' },
            ]"
            @change="onChangePriode"
          />
        </el-form-item>

        <el-form-item label="Prioritas" label-position="right">
          <el-radio-group v-model="ruleForm.priority" aria-label="Prioritas">
            <el-radio-button value="low">Low</el-radio-button>
            <el-radio-button value="medium">Medium</el-radio-button>
            <el-radio-button value="high">High</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Type Maintenance" label-position="right">
          <el-radio-group v-model="ruleForm.type" aria-label="Type Maintenance">
            <el-radio-button value="corrective">Corrective</el-radio-button>
            <el-radio-button value="preventive">Preventive</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="ruleForm.note" type="textarea" />
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Pengerjaan</span>
        </div>
      </template>
      <el-table :data="ruleForm.jobs">
        <el-table-column prop="name" label="Nama Pekerjaan">
          <template #default="scope">
            <el-input
              v-model="scope.row.name"
              placeholder="Masukan nama pekerjaan"
            />
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status">
          <template #default="scope">
            <el-select
              v-model="scope.row.status"
              placeholder="Select"
              style="width: 240px"
            >
              <el-option
                v-for="item in [
                  {
                    value: 'pending',
                    label: 'Pending',
                  },
                  {
                    value: 'progress',
                    label: 'Progress',
                  },
                  {
                    value: 'done',
                    label: 'Done',
                  },
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="pic_name" label="PIC">
          <template #default="scope">
            <el-autocomplete
              :disabled="loading"
              :fetch-suggestions="querySearchPIC"
              v-model="scope.row.pic_name"
              placeholder="Cari PIC"
              @select="(item: Record<string, any>) => onHandleSelectPICJO(item, scope.$index)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Aksi" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              :disabled="scope.$index == 0"
              @click="() => removeListJob(scope.$index)"
              :icon="Delete"
              circle
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLineJobs">
        Tambahkan Baris Baru
      </el-button>
    </el-card>
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Daftar Item</span>
        </div>
      </template>
      <el-table :data="ruleForm.items">
        <el-table-column label="Image" width="75">
          <template #default="scope">
            <ItemImageUpload
              v-model="scope.row.files"
              :image-url="scope.row.image"
              :show-text="false"
              @open-modal="() => openImageModal(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="catalogue_name" label="item">
          <template #default="scope">
            <el-autocomplete
              :disabled="loading"
              :fetch-suggestions="querySearchAsyncInventories"
              v-model="scope.row.catalogue_name"
              placeholder="Cari item"
              @select="(item: Record<string, any>) => onHandleSelectMaintenanceItemAutocomplete(item, scope)"
            >
              <template #append>
                <el-button
                  @click="() => openDrawerDetailInventory(scope.$index)"
                  :icon="Operation"
                />
              </template>
              <template #default="{ item }">
                <div v-if="item.isNew" class="flex items-center text-blue-500">
                  <el-icon><Plus /></el-icon>
                  <span class="ml-2"
                    >Tambahkan "{{ item.object?.catalogue?.name ?? "" }}"</span
                  >
                </div>
                <div v-else class="flex items-center gap-2">
                  <!-- Thumbnail file pertama -->
                  <div class="flex-shrink-0 mt-1">
                    <div
                      v-if="
                        item.object?.catalogue?.files &&
                        item.object?.catalogue?.files?.length > 0
                      "
                      class="w-10 h-10 rounded overflow-hidden border"
                    >
                      <img
                        :src="getFirstFileUrl(item.object.catalogue.files)"
                        :alt="item.object?.catalogue?.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="w-10 h-10 rounded border flex items-center justify-center text-gray-400"
                    >
                      <el-icon><Picture /></el-icon>
                    </div>
                  </div>

                  <!-- Informasi produk -->
                  <div class="flex-1 min-w-0">
                    <p style="line-height: 15px" class="font-bold truncate">
                      {{ item.object?.catalogue?.name }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      PN/SN:
                      {{
                        item.object?.catalogue?.sn ||
                        item.object?.sn ||
                        "Tidak Ada"
                      }}
                      | Brand:
                      {{ item.object?.catalogue?.brand_name || "N/A" }}
                    </p>
                  </div>
                </div>
              </template>
            </el-autocomplete>
          </template>
        </el-table-column>
        <el-table-column prop="inventory.sn" label="Serial Number" />

        <el-table-column prop="quantity" label="Quantity">
          <template #default="scope">
            <el-input
              v-model="scope.row.quantity"
              placeholder="Masukan quantity"
            >
              <template v-if="scope.row.quantity_to_in > 0" #append>
                <el-button
                  @click="() => (scope.row.quantity = scope.row.quantity_to_in)"
                  >/{{ scope.row.quantity_to_in }}</el-button
                >
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Unit">
          <template #default="scope">
            <el-autocomplete
              :disabled="loading"
              :fetch-suggestions="querySearchUnit"
              v-model="scope.row.unit_name"
              placeholder="Cari Customer"
              @select="(item: Record<string, any>) => handleSelectUnit(item, scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Aksi" width="100">
          <template #default="scope">
            <el-button
              type="danger"
              :disabled="scope.$index == 0"
              @click="() => removeListItem(scope.$index)"
              :icon="Delete"
              circle
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLineInventory">
        Tambahkan Baris Baru
      </el-button>
    </el-card>
    <el-drawer
      v-model="dialog_detail_form_catalogue"
      :direction="form_catalogue_direction"
      size="40%"
    >
      <template #default>
        <InventoryAdd :inventory="inventoryCreate!" />
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="() => (dialog_detail_form_catalogue = false)"
            >cancel</el-button
          >
          <el-button
            type="primary"
            @click="() => onEditInventory(inventoryCreate!)"
            >confirm</el-button
          >
        </div>
      </template>
    </el-drawer>

    <el-dialog
      v-model="showImageModal"
      :title="`Upload Gambar untuk Item ${activeItemIndex + 1}`"
      width="900px"
      :close-on-click-modal="false"
      @close="handleImageModalClose"
    >
      <div class="image-upload-modal">
        <!-- Photo Wall Upload -->
        <PhotoWallUploads
          ref="photoWallRef"
          v-model="modalImageFiles"
          :action="uploadAction"
          :multiple="true"
          :limit="10"
          :max-size="5"
          accept="image/*"
          @change="handleModalImagesChange"
          @remove="handleRemoveImageList"
        />

        <!-- Preview Section -->
        <div v-if="modalImageFiles.length > 0" class="preview-section"></div>

        <!-- Empty State -->
        <div v-else class="empty-state-modal">
          <el-empty description="Belum ada gambar" :image-size="100">
            <template #description>
              <p>Upload gambar untuk item ini</p>
              <p class="hint">Gambar pertama akan ditampilkan di tabel</p>
            </template>
          </el-empty>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelImageUpload">Batal</el-button>
          <el-button
            type="primary"
            @click="saveItemImages"
            :disabled="modalImageFiles.length === 0"
          >
            Simpan ({{ modalImageFiles.length }} gambar)
          </el-button>
        </span>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import {
  ElMessage,
  type DrawerProps,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Inventory } from "~/types/inventory";
import type {
  Maintenance,
  Maintenance_item,
  Maintenance_job,
  Team,
} from "~/types/maintenance";
import type { People, PeopleAndTeam } from "~/types/people";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Unit } from "~/types/unit";

import { Operation, Delete, View, Picture } from "@element-plus/icons-vue";
import InventoryAdd from "~/components/trums/InventoryAdd.vue";

import { getFirstFileUrl } from "#imports";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";
import ItemImageUpload from "~/pages/sales/inquiry/components/ItemImageUpload.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "maintenances-read",
  name: "Create New Maintenances",
});

interface RuleForm {
  location_id: string;
  location_name: string;
  location_version: number;
  inspection_item_name: string;
  inspection_item_id: string | null;
  inventory: Inventory | null;
  inventory_id: string;
  inventory_name: string;
  inventory_version: number;
  maintenance_date: string;
  team_id: string;
  responsible_id: string;
  responsible_name: string;
  start_date: string;
  end_date: string;
  is_repeate: boolean;
  repeate_unit: string;
  repeate_value: number;
  priority: string;
  status: string;
  type: string;
  repeate_option: string;
  items: Maintenance_item[];
  jobs: Maintenance_job[];
  note: string;
}
definePageMeta({
  middleware: ["auth", "app"],
  name: "New Maintenance",
});

const router = useRouter();
const route = useRoute();

const id = computed(() => route.query.unique_id as string);
const goBack = () => router.back();

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const axios = useApi();
const loading = ref<boolean>(false);
const dialog_detail_form_catalogue = ref<boolean>(false);
const form_catalogue_direction = ref<DrawerProps["direction"]>("rtl");
const inventoryCreate = ref<Inventory>();
const inventoryCreateIndexed = ref<number>(0);

const showImageModal = ref(false);
const activeItemIndex = ref(-1);
const activeItemData = ref<Maintenance_item | null>(null);
const modalImageFiles = ref<UploadUserFile[]>([]);
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>();
const uploadAction = computed(
  () => `${config.public.apiBaseURL}/upload-item-image`
);

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  location_id: "",
  location_name: "",
  location_version: 0,
  inspection_item_name: "",
  inspection_item_id: null,
  maintenance_date: "",
  team_id: "",
  responsible_id: "",
  start_date: "",
  end_date: "",
  is_repeate: false,
  repeate_unit: "hari",
  repeate_value: 7,
  priority: "low",
  status: "draft",
  type: "corrective",
  responsible_name: "",
  repeate_option: "7H",
  items: [
    {
      unique_id: null,
      unique_code: null,
      inventory_id: null,
      catalogue_id: null,
      inventory_name: null,
      catalogue_name: null,
      inventory: null,
      catalogue: null,
      inventory_version: 0,
      catalogue_version: 0,
      quantity: 0,
      status: "draft",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      unit_name: null,
      unit_id: null,
      unit: null,
    },
  ],
  jobs: [
    {
      unique_id: null,
      unique_code: null,
      maintenance_id: null,
      name: null,
      status: "done",
      pic_id: null,
      pic_name: null,
      is_team: false,
      team_id: null,
      team_name: null,
      maintenance_version: 0,
    },
  ],
  inventory: null,
  inventory_id: "",
  inventory_name: "",
  inventory_version: 0,
  note: "",
});

// const validateRepeateUnit = (rule: any, value: any, callback: any) => {
//   if(ruleForm.is_repeate){
//     if (value === '') {
//       callback(new Error('Masukan Unit Pengulangan'))
//     }else {
//       callback()
//     }
//   }else{
//     callback()
//   }
// }

// const validateRepeateValue = (rule: any, value: any, callback: any) => {
//   if(ruleForm.is_repeate){
//     if (value === '') {
//       callback(new Error('Masukan Unit Pengulangan'))
//     }else {
//       callback()
//     }
//   }else{
//     callback()
//   }
// }

const rules = reactive<FormRules<RuleForm>>({
  maintenance_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Maintenance",
      trigger: "change",
    },
  ],
  inspection_item_name: [
    { required: true, message: "Item Maintenance", trigger: "blur" },
  ],
  location_id: [
    { required: true, message: "Lokasi Maintenance", trigger: "blur" },
  ],
  location_name: [
    { required: true, message: "Lokasi Maintenance", trigger: "blur" },
  ],
  inspection_item_id: [
    { required: true, message: "Item Maintenance", trigger: "blur" },
  ],
  start_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Mulai Maintenance",
      trigger: "change",
    },
  ],
  end_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Mulai Maintenance",
      trigger: "change",
    },
  ],
  responsible_name: [
    { required: true, message: "Penanggung Jawab", trigger: "blur" },
  ],
  items: [
    {
      required: true,
      validator: (rule, value: Maintenance_item[], callback) => {
        // if (!Array.isArray(value) || value.length === 0) {
        //   return callback(new Error('Minimal satu item harus diisi'))
        // }

        const invalid = value.some(
          (item) => !item.inventory_id || !item.catalogue_id
        );
        if (invalid) {
          return callback(new Error("Item Tidak Boleh Kosong!"));
        }

        callback();
      },
      trigger: "blur",
    },
  ],
  jobs: [
    {
      required: true,
      validator: (rule, value: Maintenance_job[], callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          return callback(new Error("Minimal satu item harus diisi"));
        }

        const invalid = value.some((item) => !item.name);
        if (invalid) {
          return callback(new Error("Item Tidak Boleh Kosong!"));
        }

        callback();
      },
      trigger: "blur",
    },
  ],
});

const submit = async (formEl: FormInstance | undefined) => {
  const formData = new FormData();

  // ===== DATE PARSE =====
  const maintenanceDate = new Date(ruleForm.maintenance_date);

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (ruleForm.start_date) {
    startDate = new Date(ruleForm.start_date);
  }

  if (ruleForm.end_date) {
    endDate = new Date(ruleForm.end_date);
  }

  // ===== BASIC FIELD =====
  formData.append("unique_id", "");

  const id = useCookie("maintenance_id");
  if (id.value) {
    formData.set("unique_id", id.value);
  }

  formData.append("location_id", ruleForm.location_id);
  formData.append("location_version", String(ruleForm.location_version));
  formData.append("inspection_item_id", `${ruleForm.inspection_item_id}`);
  formData.append(
    "maintenance_date",
    String(Math.floor(maintenanceDate.getTime() / 1000))
  );
  formData.append("team_id", ruleForm.team_id);
  formData.append("responsible_id", ruleForm.responsible_id);

  formData.append("duration", "");

  // DATE OPTIONAL
  formData.append(
    "start_date",
    startDate ? String(Math.floor(startDate.getTime() / 1000)) : ""
  );

  formData.append(
    "end_date",
    endDate ? String(Math.floor(endDate.getTime() / 1000)) : ""
  );

  // OTHER FIELD
  formData.append("is_repeate", String(ruleForm.is_repeate));
  formData.append("repeate_unit", ruleForm.repeate_unit ?? "");
  formData.append("repeate_value", String(ruleForm.repeate_value ?? ""));
  formData.append("priority", ruleForm.priority);
  formData.append("status", ruleForm.status);
  formData.append("type", ruleForm.type);
  formData.append("inventory_id", ruleForm.inventory_id);
  formData.append("inventory_version", String(ruleForm.inventory_version));
  formData.append("note", ruleForm.note ?? "");

  // ===== MAINTENANCE ITEMS =====
  ruleForm.items.forEach((item, index) => {
    formData.append(
      `maintenance_items[${index}][inventory_id]`,
      `${item.inventory_id}`
    );
    formData.append(
      `maintenance_items[${index}][inventory_name]`,
      item.inventory?.catalogue?.name ?? "-"
    );
    formData.append(
      `maintenance_items[${index}][inventory_version]`,
      String(item.inventory_version)
    );
    formData.append(
      `maintenance_items[${index}][catalogue_id]`,
      item.inventory?.catalogue_id ?? ""
    );
    formData.append(
      `maintenance_items[${index}][catalogue_name]`,
      item.inventory?.catalogue?.name ?? ""
    );
    formData.append(`maintenance_items[${index}][catalogue_version]`, "0");
    formData.append(
      `maintenance_items[${index}][quantity]`,
      String(parseInt(item.quantity?.toString() ?? "0"))
    );
    formData.append(`maintenance_items[${index}][unit_id]`, item.unit_id ?? "");
    formData.append(
      `maintenance_items[${index}][unit_name]`,
      item.unit_name ?? ""
    );
    formData.append(`maintenance_items[${index}][unit_version]`, "0");
    formData.append(`maintenance_items[${index}][status]`, "draft");

    if (item.files_upload) {
      (item.files_upload ?? []).forEach((file, indexFile) => {
        if (file.raw) {
          formData.append(
            `maintenance_items[${index}][files]`,
            file.raw as Blob
          );
        }
      });
    }
  });

  // ===== MAINTENANCE JOBS =====
  ruleForm.jobs.forEach((job, index) => {
    formData.append(`maintenance_jobs[${index}][name]`, `${job.name}`);
    formData.append(`maintenance_jobs[${index}][status]`, job.status);
    formData.append(`maintenance_jobs[${index}][pic_id]`, job.pic_id ?? "");
    formData.append(`maintenance_jobs[${index}][is_team]`, String(job.is_team));
    formData.append(`maintenance_jobs[${index}][team_id]`, job.team_id ?? "");
  });

  const response = await useFetchApi<BaseResponse<Maintenance>>(
    "/maintenances-create",
    "create-maintenance",
    "post",
    formData
  );

  if (response.status.value == "success") {
    ElMessage.success(`Data maintenance berhasil di buat!`);
    resetForm(formEl);
    ruleForm.items = [
      {
        unique_id: null,
        unique_code: null,
        inventory_id: null,
        catalogue_id: null,
        inventory_name: null,
        catalogue_name: null,
        inventory: null,
        catalogue: null,
        inventory_version: 0,
        catalogue_version: 0,
        quantity: 0,
        status: "draft",
        created_at: 0,
        created_by: "",
        updated_at: 0,
        unit_name: null,
        unit_id: null,
        unit: null,
      },
    ];
    ruleForm.jobs = [
      {
        unique_id: null,
        unique_code: null,
        maintenance_id: null,
        name: null,
        status: "done",
        pic_id: null,
        pic_name: null,
        is_team: false,
        team_id: null,
        team_name: null,
        maintenance_version: 0,
      },
    ];
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submit(formEl);
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const querySearchAsyncPic = (queryString: string, cb: (arg: any) => void) => {
  axios
    .post("/people-read")
    .then((response) => {
      if (response.status == 200) {
        // console.log(response.data.data.q);
        const peoples: People[] = response.data.data;

        const filters = queryString
          ? peoples.filter(
              (data) =>
                data.name?.toLowerCase().includes(queryString.toLowerCase()) ||
                data.email?.toLowerCase().includes(queryString.toLowerCase()) ||
                data.position?.toLowerCase().includes(queryString.toLowerCase())
            )
          : peoples;

        const results = filters.map((data: People) => {
          return { value: `${data.name}`, id: data.unique_id };
        });
        cb(results);
      } else {
        ElMessage.error(response.data.message);
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  try {
    const data: RequestSearch = {
      table: "units",
      column: [],
      keyword: queryString,
      limit: "20",
      offset: "1",
      sort: null,
    };
    useFetchApi<ResponsePagination<Unit[]>>(
      "/search",
      "units",
      "post",
      data
    ).then((response) => {
      if (response.status.value == "success") {
        const units: Unit[] = response.data?.value?.data ?? [];

        const results = units.map((data: Unit) => {
          return { ...data, value: data.name };
        });
        cb(results);
      }
    });
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message ?? error}`);
  }
};

const handleSelectUnit = (record: Record<string, any>, scope: any) => {
  const unit: Unit = record as Unit;
  ruleForm.items[scope.$index].unit_id = unit.unique_id!;
  ruleForm.items[scope.$index].unit_name = unit.name!;
};

const querySearchAsyncItem = (queryString: string, cb: (arg: any) => void) => {
  const data: RequestSearch = {
    table: "inventories",
    column: [
      {
        location_id: ruleForm.location_id,
        catalogue: {
          type: ["item"],
        },
      },
    ],
    keyword: queryString,
    limit: "20",
    offset: "1",
    sort: null,
  };
  useFetchApi<ResponsePagination<Inventory[]>>(
    "/search",
    "search-item-maintenance",
    "post",
    data
  )
    .then((response) => {
      if (response.status == 200) {
        // console.log(response.data.data.q);
        const inventories: Inventory[] = response.data.value
          ?.data as Inventory[];

        const results = inventories.map((data: Inventory) => {
          return {
            value: `${data.name}-${data.sn}`,
            unique_id: data.unique_id,
            data: data,
          };
        });
        cb(results);
      } else {
        ElMessage.error(response.error.value);
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const openImageModal = (index: number, itemData: Maintenance_item) => {
  activeItemIndex.value = index;
  activeItemData.value = itemData;

  // Reset photoWallRef jika perlu (clear selection)
  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.();
  }

  // Load files dengan memastikan URL valid
  modalImageFiles.value = (itemData.files_upload || []).map((file) => {
    // Clone file object
    const fileCopy = { ...file };

    // Jika file punya raw tapi URL invalid/expired, buat URL baru
    if (fileCopy.raw && (!fileCopy.url || !isValidUrl(fileCopy.url))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw);
    }

    return fileCopy;
  });

  console.log("modal file ", modalImageFiles.value);

  showImageModal.value = true;
};

const openDrawerDetailInventory = (index: number) => {
  inventoryCreateIndexed.value = index;
  inventoryCreate.value = ruleForm.items[index].inventory!;
  dialog_detail_form_catalogue.value = true;
};

const onHandleSelectItemAutocomplete = (item: Record<string, any>) => {
  console.log(item);
  if (item.is_new) {
  } else {
    const inventory: Inventory = item.object as Inventory;
    ruleForm.inventory = inventory;
    ruleForm.inventory_id = inventory.unique_id;
    ruleForm.inventory_version = inventory.version;
    ruleForm.inventory_name = inventory.catalogue?.name ?? "";
  }
  // ruleForm.inven = item.value;
  // ruleForm.inspection_item_id = item.unique_id;
};
const onHandleSelectLocationAutocomplete = (item: Record<string, any>) => {
  console.log(item);
  const location: Catalogue = item.object;
  ruleForm.location_id = location.unique_id ?? "";
  ruleForm.location_name = location.name ?? "";
};

const onHandleSelectMaintenanceItemAutocomplete = async (
  record: Record<string, any>,
  scope: any
) => {
  if (record.is_new) {
    loading.value = true;
    try {
      const inventoryMap = {
        catalogue_id: null,
        catalogue_name: record.object.name,
        location_id: ruleForm.location_id,
        location_name: ruleForm.location_name,
        is_traceable: false,
        sn: null,
        unit_id: null,
        unit_name: null,
        quantity: 0,
        cost: 0,
        unique_id: null,
      };
      const response = await useFetchApi<BaseResponse<Inventory>>(
        "/inventories-create",
        "create-inventory",
        "post",
        inventoryMap
      );
      if (response.status.value == "success") {
        const dataInventory: Inventory = response.data.value!.data!;

        ruleForm.items[scope.$index].unique_id = null;
        ruleForm.items[scope.$index].unique_code = null;
        ruleForm.items[scope.$index].inventory_id = dataInventory.unique_id;
        ruleForm.items[scope.$index].catalogue_id = dataInventory.catalogue_id;
        ruleForm.items[scope.$index].inventory_name =
          dataInventory.catalogue.name;
        ruleForm.items[scope.$index].catalogue_name =
          dataInventory.catalogue.name;
        ruleForm.items[scope.$index].inventory = dataInventory;
        ruleForm.items[scope.$index].catalogue = dataInventory.catalogue;
        ruleForm.items[scope.$index].inventory_version = dataInventory.version;
        ruleForm.items[scope.$index].catalogue_version = 0;
        ruleForm.items[scope.$index].quantity = 0;
        ruleForm.items[scope.$index].status = "draft";
        ruleForm.items[scope.$index].unit_name = dataInventory.unit_name;
        ruleForm.items[scope.$index].unit_id = dataInventory.unit_id;
        ruleForm.items[scope.$index].unit = dataInventory.unit;
      }
    } catch (error: any) {
      ElMessage.error(error?.response?.message ?? error);
    } finally {
      loading.value = false;
    }
  } else {
    if (record.object != undefined) {
      const dataInventory: Inventory = record.object as Inventory;
      ruleForm.items[scope.$index].unique_id = null;
      ruleForm.items[scope.$index].unique_code = null;
      ruleForm.items[scope.$index].inventory_id = dataInventory.unique_id;
      ruleForm.items[scope.$index].catalogue_id = dataInventory.catalogue_id;
      ruleForm.items[scope.$index].inventory_name =
        dataInventory.catalogue.name;
      ruleForm.items[scope.$index].catalogue_name =
        dataInventory.catalogue.name;
      ruleForm.items[scope.$index].inventory = dataInventory;
      ruleForm.items[scope.$index].catalogue = dataInventory.catalogue;
      ruleForm.items[scope.$index].inventory_version = dataInventory.version;
      ruleForm.items[scope.$index].catalogue_version = 0;
      ruleForm.items[scope.$index].quantity = 0;
      ruleForm.items[scope.$index].status = "draft";
      ruleForm.items[scope.$index].unit_name = dataInventory.unit_name;
      ruleForm.items[scope.$index].unit_id = dataInventory.unit_id;
      ruleForm.items[scope.$index].unit = dataInventory.unit;
    }
  }
};
const onHandleSelectPICAutocomplete = (item: Record<string, any>) => {
  console.log(item);
  ruleForm.responsible_name = item.value;
  ruleForm.responsible_id = item.id;
};
const onHandleSelectPICJO = (item: Record<string, any>, index: number) => {
  console.log(item);
  const pic: PeopleAndTeam = item.object as PeopleAndTeam;
  if (pic.type == "people") {
    ruleForm.jobs[index].is_team = false;
    ruleForm.jobs[index].pic_id = pic.unique_id;
    ruleForm.jobs[index].pic_name = pic.name;
  } else if (pic.type == "team") {
    ruleForm.jobs[index].is_team = true;
    ruleForm.jobs[index].pic_id = pic.unique_id;
    ruleForm.jobs[index].pic_name = pic.name;
  }
};

const onChangePriode = (value: string) => {
  if (value == "7H") {
    ruleForm.repeate_unit = "hari";
    ruleForm.repeate_value = 7;
  } else if (value == "1B") {
    ruleForm.repeate_unit = "bulan";
    ruleForm.repeate_value = 1;
  } else if (value == "3B") {
    ruleForm.repeate_unit = "bulan";
    ruleForm.repeate_value = 3;
  } else if (value == "6B") {
    ruleForm.repeate_unit = "bulan";
    ruleForm.repeate_value = 6;
  } else if (value == "1T") {
    ruleForm.repeate_unit = "tahun";
    ruleForm.repeate_value = 1;
  }
};

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void,
  type?: string[]
) => {
  const data: RequestSearch = {
    table: "inventories",
    column: [
      {
        location_id: [`${ruleForm.location_id}`],
        catalogue: {
          type: type ?? ["item"],
        },
      },
    ],
    keyword: queryString,
    limit: "20",
    offset: "1",
    sort: null,
  };

  var endpoint = "/search";
  console.log("query", queryString);
  if (queryString != null) {
    useFetchApi<ResponsePagination<Inventory[]>>(
      endpoint,
      "inventories",
      "post",
      data
    )
      .then((response) => {
        if (response.status.value == "success") {
          const inventories: Inventory[] = response.data?.value?.data ?? [];

          if (inventories.length > 0) {
            const results = inventories.map((data: Inventory) => {
              return {
                value: `(${data.sn || data.catalogue.sn})-${
                  data.catalogue.name
                }`,
                unique_id: data.unique_id,
                object: data,
              };
            });
            cb(results);
          } else {
            cb([
              {
                value: `Tambahkan ${queryString}`,
                is_new: true,
                object: { name: queryString },
              },
            ]);
          }
        }
      })
      .catch((error: any) => {
        ElMessage.error(`${error.response?.data?.message ?? error}`);
      });
  } else {
    cb([
      {
        value: `Tambah Baru`,
        is_new: true,
        object: { name: queryString },
      },
    ]);
  }
};

const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
  const data: RequestSearch = {
    table: "catalogues",
    column: [
      {
        type: ["place"],
      },
    ],
    keyword: queryString,
    limit: "20",
    offset: "1",
    sort: null,
  };

  var endpoint = "/search";

  useFetchApi<ResponsePagination<Catalogue[]>>(
    endpoint,
    "location",
    "post",
    data
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: Catalogue[] = response.data?.value?.data ?? [];

        if (inventories.length > 0) {
          const results = inventories.map((data: Catalogue) => {
            return {
              value: `${data.name}`,
              unique_id: data.unique_id,
              object: data,
            };
          });
          cb(results);
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              is_new: true,
              object: { name: queryString },
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
};
const querySearchPIC = (queryString: string, cb: (arg: any) => void) => {
  var endpoint = "/read-people-team";

  useFetchApi<ResponsePagination<any>>(endpoint, "people-team", "post", {
    keyword: queryString,
  })
    .then((response) => {
      if (response.status.value == "success") {
        const peopleInTeam: PeopleAndTeam[] = [];

        console.log(response.data?.value?.data);

        const peoples: People[] = response.data?.value?.data.people as People[];
        const teams: Team[] = response.data?.value?.data.team as Team[];

        peoples.forEach((data) => {
          peopleInTeam.push({
            name: data.name ?? "",
            type: "people",
            unique_id: data.unique_id,
            version: data.version,
          });
        });
        teams.forEach((data) => {
          peopleInTeam.push({
            name: data.name ?? "",
            type: "team",
            unique_id: data.unique_id,
            version: data.version,
          });
        });

        // const inventories: Inventory[] = response.data?.value?.data ?? [];

        if (peopleInTeam.length > 0) {
          const results = peopleInTeam.map((data: PeopleAndTeam) => {
            return {
              value: `(${data.type})-${data.name}`,
              unique_id: data.unique_id,
              object: data,
            };
          });
          cb(results);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
};

const create_catalogue = async (catalogue: Catalogue) => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", catalogue.unique_id ?? "");
    formData.append("name", catalogue.name ?? "");
    formData.append("brand_id", catalogue.brand_id ?? "");
    formData.append("year", catalogue.year ?? "");
    formData.append("sn", catalogue.sn ?? "");
    formData.append("description", catalogue.description ?? "");
    formData.append("berat", (catalogue.berat ?? 0).toString());
    formData.append(
      "volume",
      `${catalogue.length}x${catalogue.width}x${catalogue.height}`
    );
    formData.append(
      "is_asset",
      (catalogue.tmp_asset == "1" ? true : false).toString()
    );
    formData.append("type", catalogue.type);

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );
    if (response.status.value == "success") {
      if (response.data.value?.data) {
        const catalogue_result: Catalogue = response.data.value!.data;
        return catalogue_result;
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const addNewLineInventory = () => {
  const add = [
    ...ruleForm.items,
    {
      unique_id: null,
      unique_code: null,
      inventory_id: null,
      catalogue_id: null,
      inventory_name: null,
      catalogue_name: null,
      inventory: null,
      catalogue: null,
      inventory_version: 0,
      catalogue_version: 0,
      quantity: 0,
      status: "draft",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      unit_name: null,
      unit_id: null,
      unit: null,
    } as Maintenance_item,
  ];

  ruleForm.items = add;
};
const addNewLineJobs = () => {
  const add = [
    ...ruleForm.jobs,
    {
      unique_id: null,
      unique_code: null,
      maintenance_id: null,
      name: null,
      status: "done",
      pic_id: null,
      pic_name: null,
      is_team: false,
      team_id: null,
      team_name: null,
      maintenance_version: 0,
    } as Maintenance_job,
  ];

  ruleForm.jobs = add;
};

const removeListJob = (index: number) => {
  ruleForm.jobs = ruleForm.jobs.filter((_, i) => i !== index);
};
const removeListItem = (index: number) => {
  ruleForm.items = ruleForm.items.filter((_, i) => i !== index);
};

const onEditInventory = async (inventory: Inventory) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Inventory>>(
      "/inventories-create",
      "create-inventory",
      "post",
      {
        catalogue_id: inventory.catalogue_id,
        catalogue_name: inventory.catalogue,
        location_id: inventory.location_id,
        location_name: inventory.location?.name,
        is_traceable: inventory.is_traceable,
        sn: inventory.sn,
        unit_id: inventory.unit_id,
        unit_name: inventory.unit_name,
        quantity: inventory.quantity,
        cost: inventory.cost,
        unique_id: inventory.unique_id ?? null,
      }
    );

    if (response.status.value == "success") {
      const dataInventory: Inventory = response.data.value!.data as Inventory;

      ruleForm.items[inventoryCreateIndexed.value].unique_id = null;
      ruleForm.items[inventoryCreateIndexed.value].unique_code = null;
      ruleForm.items[inventoryCreateIndexed.value].inventory_id =
        dataInventory.unique_id;
      ruleForm.items[inventoryCreateIndexed.value].catalogue_id =
        dataInventory.catalogue_id;
      ruleForm.items[inventoryCreateIndexed.value].inventory_name =
        dataInventory.catalogue.name;
      ruleForm.items[inventoryCreateIndexed.value].catalogue_name =
        dataInventory.catalogue.name;
      ruleForm.items[inventoryCreateIndexed.value].inventory = dataInventory;
      ruleForm.items[inventoryCreateIndexed.value].catalogue =
        dataInventory.catalogue;
      ruleForm.items[inventoryCreateIndexed.value].inventory_version =
        dataInventory.version;
      ruleForm.items[inventoryCreateIndexed.value].catalogue_version = 0;
      ruleForm.items[inventoryCreateIndexed.value].quantity = 0;
      ruleForm.items[inventoryCreateIndexed.value].status = "draft";
      ruleForm.items[inventoryCreateIndexed.value].unit_name =
        dataInventory.unit_name;
      ruleForm.items[inventoryCreateIndexed.value].unit_id =
        dataInventory.unit_id;
      ruleForm.items[inventoryCreateIndexed.value].unit = dataInventory.unit;

      ElMessage.success(`Berhasil Menambahkan Inventori`);
      //   const unique_id = useCookie("unique_id");
      //   if (unique_id.value == null) {
      //     resetForm(formEl);
      //   } else {
      //     props.inventory = response.data.value?.data;
      //   }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const fetchDataEdit = async (id: string) => {
  try {
    const response = await useFetchApi<BaseResponse<Maintenance>>(
      `/maintenances-read/${id}`,
      "maintenance-detail",
      "get",
      null
    );
    if (response.status.value == "success") {
      const maintenance = response.data.value?.data as Maintenance;
      ruleForm.location_id = maintenance.location_id ?? "";
      ruleForm.location_name = maintenance.location?.name ?? "";
      ruleForm.location_version = maintenance.location?.version ?? 1;
      ruleForm.inspection_item_name = "";
      ruleForm.inspection_item_id = null;
      ruleForm.maintenance_date =
        new Date(maintenance.maintenance_date * 1000).toDateString() ?? null;
      ruleForm.team_id = "";
      ruleForm.responsible_id = maintenance.responsible_id ?? "";
      ruleForm.start_date =
        new Date(
          (maintenance.start_date ?? new Date().getTime()) * 1000
        ).toDateString() ?? null;
      ruleForm.end_date =
        new Date(
          (maintenance.end_date ?? new Date().getTime()) * 1000
        ).toDateString() ?? null;
      ruleForm.is_repeate = maintenance.is_repeate ?? false;
      ruleForm.repeate_unit = maintenance.repeate_unit ?? "hari";
      ruleForm.repeate_value = maintenance.repeate_value ?? 7;
      ruleForm.priority = maintenance.priority;
      ruleForm.status = maintenance.status;
      ruleForm.type = maintenance.type;
      ruleForm.responsible_name = maintenance.responsible?.name ?? "";
      ruleForm.repeate_option = "7H";
      (ruleForm.items = (maintenance.maintenance_item ?? []).map((value) => ({
        unique_id: value.unique_id,
        unique_code: value.unique_code,
        inventory_id: value.inventory_id,
        catalogue_id: value.catalogue_id,
        inventory_name: value.inventory_name,
        catalogue_name: value.catalogue_name,
        inventory: value.inventory,
        catalogue: value.catalogue,
        inventory_version: value.inventory_version,
        catalogue_version: value.catalogue_version,
        quantity: value.quantity,
        status: value.status,
        unit_name: value.unit_name,
        unit_id: value.unit_id,
        unit: value.unit,
        created_at: value.created_at,
        created_by: value.created_by,
        updated_at: value.updated_at,
      }))),
        (ruleForm.jobs = (maintenance.maintenance_jobs ?? []).map((value) => ({
          unique_id: value.unique_id,
          unique_code: value.unique_code,
          maintenance_id: value.maintenance_id,
          name: value.name,
          status: value.status,
          pic_id: value.pic_id,
          pic_name: value.is_team
            ? value.team?.name ?? ""
            : value.people_pic?.name ?? "",
          is_team: value.is_team,
          team_id: value.team_id,
          team_name: value.team_name,
          maintenance_version: value.maintenance_version,
        }))),
        (ruleForm.inventory = maintenance.inventory);
      ruleForm.inventory_id = maintenance.inventory_id ?? "";
      ruleForm.inventory_name = maintenance.inventory?.catalogue?.name ?? "";
      ruleForm.inventory_version = maintenance.inventory_version ?? 0;
      ruleForm.note = maintenance.note ?? "";
    }
  } catch (error: any) {
    ElMessage.error(`${error.respons?.message ?? error}`);
  }
};

const handleImageModalClose = () => {
  // Optional: Clear temporary blob URLs
  modalImageFiles.value.forEach((file) => {
    if (file.url?.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }
  });
  modalImageFiles.value = [];
  activeItemIndex.value = -1;
  activeItemData.value = null;
};

const handleRemoveImageList = async (
  file: UploadUserFile,
  files: UploadUserFile[]
) => {
  if (file.raw) {
    console.log("file baru upload");
  } else {
    console.log("file lama", file.uid);
    try {
      const response = await useApiFetch<BaseResponse<any>>("/file-delete", {
        method: "POST",
        body: [file.uid],
      });

      if (response.success) {
        ElMessage.success(`Image Berhasil Di Hapus!`);
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.message ?? error}`);
    }
  }
};

const handleModalImagesChange = (files: UploadUserFile[]) => {
  console.log("images", files);
  modalImageFiles.value = files;
};

const cancelImageUpload = () => {
  showImageModal.value = false;
};

const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {
    // Update dataTable dengan files baru
    ruleForm.items[activeItemIndex.value].files_upload = [
      ...modalImageFiles.value,
    ];

    // Set image URL untuk preview di tabel (mengambil gambar pertama)
    if (modalImageFiles.value.length > 0) {
      const firstFile = modalImageFiles.value[0];
      if (firstFile.url) {
        ruleForm.items[activeItemIndex.value].image = firstFile.url;
      } else if (firstFile.raw) {
        ruleForm.items[activeItemIndex.value].image = URL.createObjectURL(
          firstFile.raw
        );
      }
    } else {
      ruleForm.items[activeItemIndex.value].image = "";
    }

    ElMessage.success(
      `Gambar untuk item ${activeItemIndex.value + 1} disimpan`
    );
  }

  showImageModal.value = false;
};

onMounted(() => {
  if (id.value) {
    fetchDataEdit(id.value);
  }
});
</script>

<style scoped>
:deep(.avatar-uploader) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
}

:deep(.avatar-uploader .avatar-uploader-icon) {
  width: 50px;
  height: 50px;
}

:deep(.image-preview-container) {
  width: 50px !important;
  height: 50px !important;
}
</style>
