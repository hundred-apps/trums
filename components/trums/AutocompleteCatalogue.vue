<template>
  <div class="flex items-center gap-3">
    <el-autocomplete
      :fetch-suggestions="handleFetch"
      v-model="model"
      placeholder="Cari Catalogue"
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
      </template>
    </el-autocomplete>
    <el-button
      type="primary"
      v-if="catalogue"
      @click="dialogFormCatalogue = true"
      :icon="InfoFilled"
    />
  </div>

  <el-dialog
    v-model="dialogFormCatalogue"
    title="Form Item"
    :with-header="true"
  >
    <CatalogueAdd :catalogue_form="tmpCatalogue!" :loading="loading" />
    <template #footer>
      <div style="flex: auto">
        <el-button @click="handleResetForm">Batal</el-button>
        <el-button
          type="primary"
          @click="() => handleSubmitCatalogue(tmpCatalogue!)"
          >Simpan</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { Picture, Plus, InfoFilled } from "@element-plus/icons-vue";
import type { Contact } from "~/types/contact";
import type { BaseResponse } from "~/types/response";
import type { Catalogue } from "~/types/catalogue";
import { getFirstFileUrl } from "#imports";
import CatalogueAdd from "./CatalogueAdd.vue";

const loading = ref<boolean>(false);
const dialogFormCatalogue = ref<boolean>(false);
const tmpCatalogue = ref<Catalogue | null>(null);

const formFieldsRefContact = ref();

interface Props {
  modelValue: string;
  type?: string; // 'to', 'from', dll
  placeholder?: string;
  fetchSuggestions: (
    query: string,
    cb: (arg: any) => void,
    type?: string
  ) => void;
  catalogue?: Catalogue;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Cari Catalogue",
});

const emit = defineEmits([
  "update:modelValue",
  "open-dialog",
  "save-catalogue",
]);

watch(
  () => props.catalogue,
  () => {
    tmpCatalogue.value = props.catalogue || null;
  },
  {
    immediate: true,
  }
);

// v-model binding
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// const openDialog = () => {
//     dialogContact.value = false;
//     tmpContact.value = props.cona
// }

// handle fetch
const handleFetch = (query: string, cb: any) => {
  props.fetchSuggestions(query, cb, props.type);
};

// handle select
const handleSelect = (item: any) => {
  if (item.isNew) {
    const catalogueInsert: Catalogue = {
      name: item.value,
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
    tmpCatalogue.value = catalogueInsert;
    dialogFormCatalogue.value = true;
  } else {
    console.log("item", item);
    if (item.data) {
      emit("save-catalogue", item.data as Contact);
    }
    // emit("select", item, props.type);
  }
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

const handleSubmitCatalogue = async (catalogue: Catalogue) => {
  try {
    const catalog: Catalogue | undefined =
      (await create_catalogue(catalogue)) ?? undefined;
    if (catalog !== null) {
      emit("save-catalogue", catalog);
    }
    dialogFormCatalogue.value = false;
  } catch (error) {
    console.log("eror", error);
  }
};

const handleResetForm = () => {
  formFieldsRefContact.value?.resetForm();
  dialogFormCatalogue.value = false;
};
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 18px !important;
}
</style>
