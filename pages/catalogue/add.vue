<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Catalogue </span>
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
        <el-form-item label="Foto Item" prop="photos">
          <div class="flex flex-col">
            <el-upload
              v-model:file-list="ruleForm.file_catalogues"
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
        <el-form-item label="Nama Item" prop="name">
          <el-input
            v-model="ruleForm.name"
            placeholder="Masukan Nama Item"
            clearable
          />
        </el-form-item>

        <el-form-item label="Brand" prop="brand_name">
          <el-autocomplete
            v-model="ruleForm.brand_name"
            :fetch-suggestions="querySearchBrand"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Brand"
            @select="handleSelectBrand"
          />
        </el-form-item>

        <el-form-item label="Tahun" prop="year">
          <el-input
            v-model="ruleForm.year"
            placeholder="Tahun Produksi"
            type="number"
          />
        </el-form-item>

        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            placeholder="Deskripsi Item"
          />
        </el-form-item>

        <el-form-item label="Serial Number" prop="sn">
          <el-input v-model="ruleForm.sn" placeholder="Masukan Serial Number" />
        </el-form-item>

        <el-form-item label="Jenis Item" prop="type">
          <el-select v-model="ruleForm.type" placeholder="Pilih Jenis Item">
            <el-option label="Item" value="item" />
            <el-option label="Place" value="place" />
            <el-option label="Document" value="document" />
          </el-select>
        </el-form-item>

        <el-form-item label="Jenis Asset" prop="tmp_asset">
          <el-select
            v-model="ruleForm.tmp_asset"
            placeholder="Pilih Jenis Asset"
          >
            <el-option label="Asset" value="1" />
            <el-option label="Non-Asset" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="Dimensi">
          <div class="flex gap-2">
            <el-input
              v-model="ruleForm.panjang"
              placeholder="Panjang (cm)"
              type="number"
            />
            <el-input
              v-model="ruleForm.lebar"
              placeholder="Lebar (cm)"
              type="number"
            />
            <el-input
              v-model="ruleForm.tinggi"
              placeholder="Tinggi (cm)"
              type="number"
            />
          </div>
        </el-form-item>

        <el-form-item label="Berat (gram)" prop="berat">
          <el-input
            v-model="ruleForm.berat"
            placeholder="Berat dalam gram"
            type="number"
          />
        </el-form-item>

        <el-form-item label="Volume (cm³)" prop="volume">
          <el-input
            v-model="ruleForm.volume"
            placeholder="Volume"
            type="number"
            disabled
          />
        </el-form-item>
        <el-form-item label="Buat Bundle" prop="volume">
          <el-switch v-model="ruleForm.is_bundle" />
        </el-form-item>
      </el-form>
      <div v-if="ruleForm.is_bundle" class="mt-4">
        <el-divider content-position="left">
          <span class="font-semibold">📦 Children Items</span>
          <el-tag size="small" type="info" class="ml-2">
            {{ ruleForm.children.length }} item
          </el-tag>
        </el-divider>

        <!-- Tombol Tambah Child -->
        <div class="mb-3 flex justify-end">
          <el-button type="primary" plain size="small" @click="addChild">
            <el-icon><Plus /></el-icon>
            Tambah Child
          </el-button>
        </div>

        <!-- Table Children -->
        <el-table :data="ruleForm.children" border style="width: 100%">
          <el-table-column type="index" label="#" width="50" align="center" />

          <el-table-column label="Nama Item" min-width="150">
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`children.${$index}.name`"
                :rules="[
                  {
                    required: true,
                    message: 'Nama wajib diisi',
                    trigger: 'blur',
                  },
                ]"
                class="mb-0"
              >
                <el-input
                  v-model="row.name"
                  placeholder="Nama Child"
                  size="small"
                  clearable
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="Brand" min-width="150">
            <template #default="{ row, $index }">
              <el-form-item
                :prop="`children.${$index}.brand_name`"
                :rules="[
                  {
                    required: true,
                    message: 'Brand wajib dipilih',
                    trigger: 'blur',
                  },
                ]"
                class="mb-0"
              >
                <el-autocomplete
                  v-model="row.brand_name"
                  :fetch-suggestions="
                    (query, cb) => querySearchBrandChild(query, cb, $index)
                  "
                  :trigger-on-focus="false"
                  clearable
                  size="small"
                  placeholder="Pilih Brand"
                  @select="(item) => handleSelectBrandChild(item, $index)"
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="Serial Number" width="150">
            <template #default="{ row }">
              <el-input
                v-model="row.sn"
                placeholder="SN"
                size="small"
                clearable
              />
            </template>
          </el-table-column>

          <el-table-column label="Tahun" width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.year"
                placeholder="Tahun"
                size="small"
                type="number"
              />
            </template>
          </el-table-column>

          <el-table-column label="Jenis" width="130">
            <template #default="{ row }">
              <el-select v-model="row.type" placeholder="Jenis" size="small">
                <el-option label="Item" value="item" />
                <el-option label="Place" value="place" />
                <el-option label="Document" value="document" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="Dimensi (P×L×T)" width="180">
            <template #default="{ row }">
              <div class="flex gap-1">
                <el-input
                  v-model="row.panjang"
                  placeholder="P"
                  size="small"
                  type="number"
                  style="width: 50px"
                />
                <span class="text-gray-400">×</span>
                <el-input
                  v-model="row.lebar"
                  placeholder="L"
                  size="small"
                  type="number"
                  style="width: 50px"
                />
                <span class="text-gray-400">×</span>
                <el-input
                  v-model="row.tinggi"
                  placeholder="T"
                  size="small"
                  type="number"
                  style="width: 50px"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Berat (g)" width="110">
            <template #default="{ row }">
              <el-input
                v-model="row.berat"
                placeholder="Berat"
                size="small"
                type="number"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="Aksi"
            width="100"
            align="center"
            fixed="right"
          >
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                link
                @click="removeChild($index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Informasi Total -->
        <div
          v-if="ruleForm.children.length > 0"
          class="mt-3 p-3 bg-gray-50 rounded"
        >
          <div class="flex gap-6 text-sm">
            <span>
              <span class="font-semibold">Total Items:</span>
              {{ ruleForm.children.length }}
            </span>
            <span>
              <span class="font-semibold">Total Berat:</span>
              {{ calculateTotalBerat() }} g
            </span>
            <span>
              <span class="font-semibold">Total Volume:</span>
              {{ calculateTotalVolume() }} cm³
            </span>
          </div>
        </div>
      </div>
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

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "catalogues-create",
  name: "Create New Catalogues",
});

interface RuleForm {
  id: number | null;
  unique_id: string | null;
  name: string;
  brand_id: string | null;
  brand_name: string;
  year: string;
  sn: string;
  description: string;
  berat: number | null;
  volume: number | null;
  panjang: number | null;
  lebar: number | null;
  tinggi: number | null;
  is_asset: boolean;
  tmp_asset: string;
  type: string;
  file_catalogues: any[];
  is_bundle: boolean;
  children: RuleForm[];
}

import { Plus } from "@element-plus/icons-vue";
import { reactive, ref, computed, watch } from "vue";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type UploadProps,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import type { Catalogue } from "~/types/catalogue";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Brands } from "~/types/brand";
import type { BaseResponse } from "~/types/response";
import { column } from "element-plus/es/components/table-v2/src/common.mjs";

const router = useRouter();
const goBack = () => router.back();

const route = useRoute();
const unique_id = computed(() => route.query.unique_id as string);

const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const api = useApi();

const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const ruleForm = reactive<RuleForm>({
  id: null,
  unique_id: null,
  name: "",
  brand_id: null,
  brand_name: "",
  year: "",
  sn: "",
  description: "",
  berat: null,
  volume: null,
  panjang: null,
  lebar: null,
  tinggi: null,
  is_asset: false,
  tmp_asset: "",
  type: "item",
  file_catalogues: [],
  is_bundle: false,
  children: [],
});

const createEmptyChild = (): RuleForm => ({
  id: null,
  unique_id: null,
  name: "",
  brand_id: null,
  brand_name: "",
  year: "",
  sn: "",
  description: "",
  berat: null,
  volume: null,
  panjang: null,
  lebar: null,
  tinggi: null,
  is_asset: false,
  tmp_asset: "0",
  type: "item",
  file_catalogues: [],
  is_bundle: false,
  children: [],
});

const rules = reactive<FormRules<RuleForm>>({
  name: [{ required: true, message: "Nama item wajib diisi", trigger: "blur" }],
  tmp_asset: [
    { required: true, message: "Brand wajib dipilih", trigger: "blur" },
  ],
  type: [
    { required: true, message: "Jenis item wajib dipilih", trigger: "change" },
  ],
});

// Hitung volume otomatis ketika dimensi berubah
watch(
  () => [ruleForm.panjang, ruleForm.lebar, ruleForm.tinggi],
  ([panjang, lebar, tinggi]) => {
    if (panjang && lebar && tinggi) {
      ruleForm.volume = Number(panjang) * Number(lebar) * Number(tinggi);
    } else {
      ruleForm.volume = null;
    }
  }
);

const handleFileChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
  ruleForm.file_catalogues = uploadFiles;
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
      ruleForm.file_catalogues = uploadFiles;
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.message ?? error}`);
  }
};

// Cari brand
const querySearchBrand = (queryString: string, cb: (arg: any) => void) => {
  const requestSearch = {
    keyword: queryString,
    table: "brands",
    limit: "10",
    offset: "1",
  };

  try {
    useFetchApi<ResponsePagination<Brands[]>>(
      "/search",
      "search-brand",
      "post",
      requestSearch
    ).then((response) => {
      if (response.status.value == "success") {
        const brands = response.data.value?.data as Brands[];

        if (brands.length > 0) {
          cb(
            brands.map((brand: any) => ({
              ...brand,
              value: brand.name,
              isNew: false,
            }))
          );
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              name: queryString,
              isNew: true,
            },
          ]);
        }
      }
    });
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
    cb([]);
  }
};

const handleSelectBrand = (item: any) => {
  if (item.isNew) {
    useFetchApi<BaseResponse<Brands>>(
      "/brands-create",
      "create-barand",
      "post",
      { name: item.name }
    ).then((response) => {
      if (response.status.value == "success") {
        const brand = response.data.value!.data as Brands;
        ruleForm.brand_id = brand.unique_id;
        ruleForm.brand_name = brand.name;
      }
    });
  } else {
    ruleForm.brand_id = item.unique_id;
    ruleForm.brand_name = item.name;
  }
};

const querySearchBrandChild = (
  queryString: string,
  cb: (arg: any) => void,
  index: number
) => {
  const requestSearch = {
    keyword: queryString,
    table: "brands",
    limit: "10",
    offset: "1",
  };

  try {
    useFetchApi<ResponsePagination<Brands[]>>(
      "/search",
      "search-brand-child",
      "post",
      requestSearch
    ).then((response) => {
      if (response.status.value == "success") {
        const brands = response.data.value?.data as Brands[];

        if (brands.length > 0) {
          cb(
            brands.map((brand: any) => ({
              ...brand,
              value: brand.name,
              isNew: false,
            }))
          );
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              name: queryString,
              isNew: true,
            },
          ]);
        }
      }
    });
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
    cb([]);
  }
};

const handleSelectBrandChild = (item: any, index: number) => {
  const child = ruleForm.children[index];
  if (!child) return;

  if (item.isNew) {
    useFetchApi<BaseResponse<Brands>>(
      "/brands-create",
      "create-brand-child",
      "post",
      { name: item.name }
    ).then((response) => {
      if (response.status.value == "success") {
        const brand = response.data.value!.data as Brands;
        child.brand_id = brand.unique_id;
        child.brand_name = brand.name;
      }
    });
  } else {
    child.brand_id = item.unique_id;
    child.brand_name = item.name;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      // Set is_asset berdasarkan type
      ruleForm.is_asset = ruleForm.tmp_asset === "1" ? true : false;

      const formData = new FormData();

      formData.append("name", ruleForm.name);

      formData.append("brand_id", ruleForm.brand_id || "");
      formData.append("brand_name", ruleForm.brand_name);
      formData.append("year", ruleForm.year);
      formData.append("sn", ruleForm.sn);
      formData.append("description", ruleForm.description);
      formData.append("berat", ruleForm.berat?.toString() || "");
      formData.append(
        "volume",
        `${ruleForm.panjang}x${ruleForm.lebar}x${ruleForm.tinggi}`
      );
      formData.append("length", ruleForm.panjang?.toString() || "");
      formData.append("width", ruleForm.lebar?.toString() || "");
      formData.append("height", ruleForm.tinggi?.toString() || "");
      formData.append("is_asset", ruleForm.is_asset.toString());
      formData.append("type", ruleForm.type);
      formData.append("is_bundle", `${ruleForm.is_bundle}`);

      if (ruleForm.unique_id) {
        formData.append("unique_id", ruleForm.unique_id);
      }

      // Tambahkan file foto
      ruleForm.file_catalogues.forEach((file, i) => {
        if (file.raw) {
          formData.append(`files[${i}]`, file.raw);
        }
      });

      if (ruleForm.is_bundle && ruleForm.children.length > 0) {
        const childrenData = ruleForm.children.map((child) => ({
          name: child.name,
          brand_id: child.brand_id,
          brand_name: child.brand_name,
          year: child.year,
          sn: child.sn,
          description: child.description,
          berat: child.berat,
          panjang: child.panjang,
          lebar: child.lebar,
          tinggi: child.tinggi,
          is_asset: child.tmp_asset === "1",
          type: child.type,
          volume: `${child.panjang}x${child.lebar}x${child.tinggi}`,
        }));

        ruleForm.children.forEach((element, childIndex) => {
          formData.append(`children[${childIndex}][name]`, element.name);

          formData.append(
            `children[${childIndex}][brand_id]`,
            element.brand_id || ""
          );
          formData.append(
            `children[${childIndex}][brand_name]`,
            element.brand_name
          );
          formData.append(`children[${childIndex}][year]`, element.year);
          formData.append(`children[${childIndex}][sn]`, element.sn);
          formData.append(
            `children[${childIndex}][description]`,
            element.description
          );
          formData.append(
            `children[${childIndex}][berat]`,
            element.berat?.toString() || ""
          );
          formData.append(
            `children[${childIndex}][volume]`,
            `${element.panjang}x${element.lebar}x${element.tinggi}`
          );
          formData.append(
            `children[${childIndex}][length]`,
            element.panjang?.toString() || ""
          );
          formData.append(
            `children[${childIndex}][width]`,
            element.lebar?.toString() || ""
          );
          formData.append(
            `children[${childIndex}][height]`,
            element.tinggi?.toString() || ""
          );
          formData.append(
            `children[${childIndex}][is_asset]`,
            element.is_asset.toString()
          );
          formData.append(`children[${childIndex}][type]`, element.type);

          if (element.unique_id) {
            formData.append(
              `children[${childIndex}][unique_id]`,
              element.unique_id
            );
          }
        });
      }

      // console.log(payload);

      const response = await useFetchApi<BaseResponse<Catalogue>>(
        "/catalogues-create",
        "create-catalogue",
        "post",
        formData
      );

      if (response.status.value == "success") {
        ElMessage.success(
          `Berhasil ${
            ruleForm.unique_id ? "memperbarui" : "menambahkan"
          } katalog`
        );

        formEl.resetFields();
        ruleForm.file_catalogues = [];
        ruleForm.panjang = null;
        ruleForm.lebar = null;
        ruleForm.tinggi = null;

        if (unique_id) {
          fetchDataEdit();
        } else {
          window.location.href = "/catalogue";
        }
      }

      // const endpoint = ruleForm.id ? "/catalogues-update" : "/catalogues-create";
      // const response = ruleForm.id
      //   ? await api.put(endpoint, payload)
      //   : await api.post(endpoint, payload);

      // if ([200, 201].includes(response.status)) {
      //   ElMessage.success(
      //     `Berhasil ${ruleForm.id ? "memperbarui" : "menambahkan"} katalog`
      //   );
      //   resetForm(formEl);
      //   router.push("/catalogues");
      // }
    } catch (error: any) {
      ElMessage.error(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan"
      );
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  Object.assign(ruleForm, {
    id: null,
    unique_id: null,
    name: "",
    brand_id: null,
    brand_name: "",
    year: "",
    sn: "",
    description: "",
    berat: null,
    volume: null,
    panjang: null,
    lebar: null,
    tinggi: null,
    is_asset: false,
    type: "non-asset",
    file_catalogues: [],
  });
};

const mapApiFilesToUpload = (files: any[]) => {
  const baseUrl = useRuntimeConfig().public.baseImageURL;
  // sesuaikan dengan config kamu

  return files.map((file) => ({
    uid: file.unique_id,
    name: file.filename_original || file.filename,
    url: `${baseUrl}${file.image_path}/${file.filename}`,
    status: "success",
  }));
};

const mapApiChildrenToForm = (children: any[]): RuleForm[] => {
  if (!children || children.length === 0) return [];

  return children.map((child) => ({
    id: child.id || null,
    unique_id: child.unique_id || null,
    name: child.name || "",
    brand_id: child.brand_id || null,
    brand_name: child.brand?.name || "",
    year: child.year || "",
    sn: child.sn || "",
    description: child.description || "",
    berat: child.berat || null,
    volume: child.volume || null,
    panjang: child.length || null,
    lebar: child.width || null,
    tinggi: child.height || null,
    is_asset: child.is_asset || false,
    tmp_asset: child.is_asset ? "1" : "0",
    type: child.type || "item",
    file_catalogues: [],
    is_bundle: false,
    children: [],
  }));
};

const fetchDataEdit = async () => {
  loading.value = true;
  try {
    const requestSearch = {
      keyword: "",
      table: "catalogues",
      column: [
        {
          unique_id: [unique_id.value],
        },
      ],
      limit: "1",
      offset: "1",
    };

    const response = await useFetchApi<ResponsePagination<Catalogue[]>>(
      "/search",
      "get-initial-edit",
      "post",
      requestSearch
    );
    console.log("response", response.status);
    if (response.status.value === "success") {
      const catalogues: Catalogue[] = response.data.value?.data as Catalogue[];

      if (catalogues.length > 0) {
        const catalogue = catalogues[0];

        Object.assign(ruleForm, {
          id: catalogue.id,
          unique_id: catalogue.unique_id,
          name: catalogue.name,
          brand_id: catalogue.brand_id,
          brand_name: catalogue.brand?.name || "",
          year: catalogue.year || "",
          sn: catalogue.sn || "",
          description: catalogue.description || "",
          berat: catalogue.berat,
          volume: catalogue.volume,
          panjang: catalogue.length,
          lebar: catalogue.width,
          tinggi: catalogue.height,
          is_asset: catalogue.is_asset,
          tmp_asset: catalogue.is_asset ? "1" : "0",
          type: catalogue.type,
          is_bundle: catalogue.is_bundle || false,
          file_catalogues: mapApiFilesToUpload(catalogue.files || []),
          children: mapApiChildrenToForm(catalogue.children || []),
        });
      } else {
        ElMessage.error(`Data Tidak Di Temukan!`);
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    loading.value = false;
  }
};

const addChild = () => {
  ruleForm.children.push(createEmptyChild());
};

const removeChild = (index: number) => {
  ElMessageBox.confirm("Yakin ingin menghapus child item ini?", "Konfirmasi", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  }).then(() => {
    ruleForm.children.splice(index, 1);
    ElMessage.success("Child item dihapus");
  });
};

const calculateTotalBerat = () => {
  return ruleForm.children.reduce(
    (total, child) => total + (child.berat || 0),
    0
  );
};

const calculateTotalVolume = () => {
  return ruleForm.children.reduce((total, child) => {
    const volume =
      (child.panjang || 0) * (child.lebar || 0) * (child.tinggi || 0);
    return total + volume;
  }, 0);
};

onMounted(async () => {
  if (unique_id.value) {
    fetchDataEdit();
  }
});
</script>
