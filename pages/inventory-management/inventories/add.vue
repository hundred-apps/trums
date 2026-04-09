<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Inventory </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <el-form-item label="Foto Inventory" prop="photos">
          <div class="flex flex-col">
            <el-upload
              v-model:file-list="ruleForm.files"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :on-preview="handlePictureCardPreview"
              :limit="5"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="el-upload__tip">
              Upload foto item (max 5 file, format: jpg/png)
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Nama Item" prop="catalogue">
          <div class="flex items-center justify-center gap-2">
            <el-autocomplete
              v-model="ruleForm.catalogue"
              :fetch-suggestions="querySearchAsync"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              placeholder="Masukan Nama Item"
              @select="handleSelect"
            >
              <template #default="{ item }">
                <div v-if="item.isNew" class="flex items-center text-blue-500">
                  <el-icon><Plus /></el-icon>
                  <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <!-- Thumbnail file pertama -->
                  <div class="flex-shrink-0 mt-1">
                    <div
                      v-if="item.files && item.files.length > 0"
                      class="w-10 h-10 rounded overflow-hidden border"
                    >
                      <img
                        :src="getFirstFileUrl(item.files)"
                        :alt="item.catalogue_name"
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
                      {{ item.catalogue_name || item.value }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      PN/SN: {{ item.sn_number || "Tidak Ada" }} | Brand:
                      {{ item.brand_name || "N/A" }}
                    </p>
                  </div>
                </div>
              </template></el-autocomplete
            >
            <el-button
              v-if="ruleForm.catalogue_id"
              type="primary"
              :icon="View"
              @click="() => openCatalogueDetail('')"
            />
          </div>
        </el-form-item>
        <el-form-item label="Lokasi Inventory" prop="location_name">
          <el-autocomplete
            v-model="ruleForm.location_name"
            :fetch-suggestions="querySearchLocation"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Lokasi"
            @select="handleSelectLocation"
          />
        </el-form-item>
        <el-form-item label="Cost" prop="tmp_cost">
          <el-input
            v-model="ruleForm.tmp_cost"
            placeholder="Harga"
            :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value: any) => value.replace(/[^0-9]/g, '')"
          />
        </el-form-item>
        <el-form-item
          v-if="ruleForm.traceable == '0'"
          label="Quantity"
          prop="qty"
        >
          <el-input
            v-model="ruleForm.qty"
            :parser="(value: any) => value.replace(/[^0-9]/g, '')"
            placeholder="Quantity"
          />
        </el-form-item>
        <el-form-item label="Unit" prop="unit_name">
          <el-autocomplete
            v-model="ruleForm.unit_name"
            :fetch-suggestions="querySearchUnit"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Unit"
            @select="handleSelectUnit"
          />
        </el-form-item>
        <el-form-item label="Track Inventory" prop="is_traceable">
          <el-radio-group v-model="ruleForm.traceable">
            <el-radio value="1">Ya</el-radio>
            <el-radio value="0">Tidak</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="ruleForm.traceable == '1'"
          label="Serial Number"
          prop="sn"
        >
          <el-input v-model="ruleForm.sn" placeholder="Masukan Serial Number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(ruleFormRef)"
            >Reset</el-button
          >
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            Simpan
          </el-button>
        </div>
      </template>
    </el-card>

    <el-drawer
      v-model="drawerCatalogue"
      title="Detail Item"
      :with-header="true"
    >
      <CatalogueAdd
        :catalogue_form="ruleForm.catalogue_data!"
        :loading="loading"
      />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="handleCancel">Batal</el-button>
          <el-button
            type="primary"
            @click="() => handleSubmit(ruleForm.catalogue_data!)"
            >Simpan</el-button
          >
        </div>
      </template>
    </el-drawer>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventories-create",
  name: "Add New Inventory",
});

interface RuleForm {
  id: number;
  catalogue: string;
  catalogue_id: string | null;
  location_id: string | null;
  location_name: string;
  is_traceable: boolean;
  traceable: string;
  sn: string;
  unit_id: string | null;
  unit_name: string;
  qty: string;
  quantity: number;
  cost: number;
  tmp_cost: string;
  unique_id?: string;
  catalogue_data?: Catalogue;
  files?: UploadUserFile[];
}

import { reactive, ref, onMounted } from "vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type UploadFile,
  type UploadProps,
  type UploadUserFile,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Catalogue } from "~/types/catalogue";
import type { RequestSearch } from "~/types/request_search";
import type { Unit } from "~/types/unit";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Inventory } from "~/types/inventory";
import { View, Plus, Picture } from "@element-plus/icons-vue";
import { getFirstFileUrl } from "#imports";
import type { BaseResponse } from "~/types/response";
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";

const router = useRouter();
const route = useRoute();

const id = computed(() => route.query.id as string);

const goBack = () => router.back();

const loading = ref<boolean>(false);
const drawerCatalogue = ref<boolean>(false);
const dialogVisible = ref(false);

const catalogues = ref<Catalogue[]>([]);

const dialogImageUrl = ref("");

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  sort: null,
  limit: "50",
  offset: "1",
});

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

// const tableForm = reactive<RuleForm[]>(Array.from({length: 4}, (_, i) => ({
//     id: i,
//     catalogue: '',
//     location_name: '',
//     catalogue_id: 1,
//     location_id: '',
//     is_traceable: false,
//     sn: '',
//     unit_id: 0,
//     unit_name: '',
//     quantity: 0,
//     cost: 0,
//     qty: '0',
//     tmp_cost: '0',
//     traceable: '0',
// })));

// const columnTable: Column<RuleForm>[] = ([
//     {
//         width: 150,

//     }
// ]);

const ruleForm = reactive<RuleForm>({
  id: 1,
  catalogue: "",
  location_name: "",
  catalogue_id: "",
  location_id: "",
  is_traceable: false,
  sn: "",
  unit_id: "",
  unit_name: "",
  quantity: 0,
  cost: 0,
  qty: "0",
  tmp_cost: "0",
  traceable: "0",
});

const api = useApi();

const rules = reactive<FormRules<RuleForm>>({
  catalogue: [{ required: true, message: "Masukan Item", trigger: "blur" }],
  location_name: [
    { required: true, message: "Masukan Lokasi Item", trigger: "blur" },
  ],
  quantity: [{ required: true, message: "Masukan Quantity", trigger: "blur" }],
  cost: [{ required: true, message: "Masukan Lokasi Item", trigger: "blur" }],
  unit_name: [
    { required: true, message: "Masukan Jenis Unit", trigger: "blur" },
  ],
  sn: [{ required: true, message: "Masukan Serial Number", trigger: "blur" }],
});

const handleFileChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  ruleForm.files = uploadFiles;
};

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};

const handleFileRemove: UploadProps["onRemove"] = async (
  uploadFile,
  uploadFiles
) => {
  try {
    const response = await useApiFetch<BaseResponse<any>>("/file-delete", {
      method: "POST",
      body: [uploadFile.uid],
    });

    if (response.success) {
      ruleForm.files = uploadFiles;
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.message ?? error}`);
  }
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [{ type: ["item"] }];
  requestSearch.value.flag = "form";
  useFetchApi<ResponsePagination<Catalogue[]>>(
    "/search",
    "search-catalogue",
    "post",
    requestSearch.value
  )
    .then((response) => {
      console.log("response", response);
      if (response.status.value == "success") {
        const resultApi: Catalogue[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          const result = resultApi.map((value) => ({
            data: value,
            isNew: false,
            value: value.name,
          }));
          cb([
            ...result,
            {
              value: `${queryString}`,
              id: `${queryString}`,
              isNew: true,
            },
          ]);
        } else {
          cb([
            {
              value: `${queryString}`,
              id: `${queryString}`,
              isNew: true,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(
        error.response?.message || error || "Gagal Mencari Data Catalogue"
      );
    });
};

const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [
    {
      type: ["place"],
    },
  ];
  requestSearch.value.flag = "form";
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...requestSearch.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  api
    .post("/search", params)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Unit[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const handleSelect = (item: Record<string, any>) => {
  if (item.isNew) {
    openCatalogueDetail(item.value);
  } else {
    const data: Catalogue = item.data as Catalogue;
    ruleForm.catalogue = data.name ?? "";
    ruleForm.catalogue_id = data.unique_id;
    ruleForm.catalogue_data = data;
    ruleForm.catalogue_data.file_catalogues = mapApiFilesView(data.files ?? []);

    console.log("catalogue", data);
  }
};
const handleSelectUnit = (item: Record<string, any>) => {
  console.log(item);

  if (item.unique_id == undefined) {
    ruleForm.unit_name = item.id;
    ruleForm.unit_id = null;
  } else {
    ruleForm.unit_name = item.value;
    ruleForm.unit_id = item.unique_id;
  }
};
const handleSelectLocation = (item: Record<string, any>) => {
  console.log(item);

  if (item.unique_id == undefined) {
    ruleForm.location_name = item.id;
    ruleForm.location_id = null;
  } else {
    ruleForm.location_name = item.value;
    ruleForm.location_id = item.unique_id;
  }
};

const openCatalogueDetail = (name?: string) => {
  if (!ruleForm.catalogue_data) {
    ruleForm.catalogue_data = {
      name: name || "",
      id: null,
      unique_id: null,
      unique_code: null,
      brand_id: null,
      brand_name: null,
      year: null,
      sn: null,
      description: null,
      berat: null,
      volume: null,
      length: null,
      width: null,
      height: null,
      is_asset: null,
      tmp_asset: null,
      version: null,
      type: "item",
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
    };
  }
  drawerCatalogue.value = true;
};

const create_catalogue = async (catalogue: Catalogue) => {
  loading.value = true;
  try {
    console.log("catalogue", catalogue);
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

    catalogue.file_catalogues.forEach((file) => {
      if (file.raw) {
        formData.append("files[]", file.raw);
      }
    });

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );

    console.log(response.status);
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | undefined = response.data.value?.data;
      return catalogue_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (catalogue: Catalogue) => {
  loading.value = true;

  try {
    const catalogueInsert = (await create_catalogue(catalogue)) ?? undefined;
    if (catalogueInsert != undefined) {
      ruleForm.catalogue_data = catalogueInsert;
      ruleForm.catalogue = catalogueInsert.name || "";
      ruleForm.catalogue_id = catalogueInsert.unique_id || "";
    } else {
      ElMessage.error("Kesalahan saat menyimpan data catalogue!");
    }
  } catch (error: any) {
    console.log(error);
    ElMessage.error(`Gagal menyimpan catalogue`);
  } finally {
    loading.value = false;
    drawerCatalogue.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  drawerCatalogue.value = false;
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const formData = new FormData();

    // transform dulu
    const isTraceable = ruleForm.traceable == "0" ? false : true;
    const cost = parseInt(ruleForm.tmp_cost);
    const quantity = parseInt(ruleForm.qty);

    // append ke formData
    formData.append("catalogue_id", `${ruleForm.catalogue_id}`);
    formData.append("catalogue_name", ruleForm.catalogue);
    formData.append("location_id", `${ruleForm.location_id}`);
    formData.append("location_name", ruleForm.location_name);
    formData.append("is_traceable", String(isTraceable));
    formData.append("sn", ruleForm.sn);
    formData.append("unit_id", `${ruleForm.unit_id}`);
    formData.append("unit_name", ruleForm.unit_name);
    formData.append("quantity", String(quantity));
    formData.append("cost", String(cost));
    formData.append("unique_id", ruleForm.unique_id ?? "");
    (ruleForm.files ?? []).forEach((file, index) => {
      if (file.raw) {
        formData.append(`files[${index}]`, file.raw);
      }
    });

    const response = await useFetchApi<BaseResponse<Inventory>>(
      "/inventories-create",
      "create-inventory",
      "post",
      formData
    );

    if (response.status.value == "success") {
      ElMessage.success(`Berhasil Menambahkan Inventori`);

      if (response.data.value?.data?.unique_id) {
        goBack();
      } else {
        window.location.href = `/inventory-management/inventories/${response.data.value?.data?.unique_id}`;
      }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submit(formEl);
    } else {
      console.log(ruleForm);
      ElMessage.error(`${fields}`);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.catalogue = "";
  ruleForm.location_name = "";
  ruleForm.catalogue_id = null;
  ruleForm.location_id = "";
  ruleForm.is_traceable = false;
  ruleForm.sn = "";
  ruleForm.unit_id = null;
  ruleForm.unit_name = "";
  ruleForm.quantity = 0;
  ruleForm.cost = 0;
  ruleForm.qty = "0";
  ruleForm.tmp_cost = "0";
  ruleForm.traceable = "0";
};

const detail = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/inventories-read/${id.value}`);
    if (response.status == 200) {
      const inventory: Inventory = response.data.data;
      ruleForm.catalogue = inventory.catalogue?.name ?? "";
      ruleForm.catalogue_id = inventory.catalogue.unique_id;
      ruleForm.is_traceable = inventory.is_traceable;
      ruleForm.traceable = inventory.is_traceable ? "1" : "0";
      ruleForm.cost = inventory.cost;
      ruleForm.location_id = inventory.location_id ?? "";
      ruleForm.location_name = inventory.location?.name ?? "";
      ruleForm.qty = (inventory.quantity ?? "").toString();
      ruleForm.quantity = inventory.quantity;
      ruleForm.sn = inventory.sn;
      ruleForm.tmp_cost = (inventory.cost ?? "").toString();
      ruleForm.unique_id = inventory.unique_id;
      ruleForm.files = mapApiFilesView(inventory.files || []);
      ruleForm.unit_id = inventory.unit_id || "";
      ruleForm.unit_name = inventory.unit_name;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => detail());
</script>
