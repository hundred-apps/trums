<template>
  <el-dialog
    v-model="visible"
    title="Item"
    :width="isMobile ? '100%' : '800'"
    @close="onClose"
  >
    <el-form
      ref="ruleFormRefDialogItem"
      :model="ruleFormDialogAddItem"
      :rules="rulesDialogItem"
      :label-position="labelPositionDialogItem"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
      :disabled="loading"
    >
      <el-form-item prop="item_name" label="" class="form-dialog">
        <div class="flex items-center gap-3 w-full">
          <el-autocomplete
            :disabled="loading"
            :fetch-suggestions="querySearchAsyncInventories"
            v-model="ruleFormDialogAddItem.item_name"
            placeholder="Cari item"
            @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteModal(item)"
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
        </div>
      </el-form-item>
      <el-form-item prop="price" :label="`Harga Satuan`" class="form-dialog">
        <el-form-item
          label=""
          :prop="`ruleFormDialogAddItem.price`"
          class="mb-0 w-full"
          style="margin-bottom: 0px !important"
        >
          <el-input
            v-model="ruleFormDialogAddItem.price"
            class="mb-0"
            inputmode="decimal"
            placeholder="Harga"
            :formatter="(value: any) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value: any) => value.replace(/\Rp\s?|(,*)/g, '')"
            @input="
              (value) => {
                ruleFormDialogAddItem.total_price =
                  Number(value) * ruleFormDialogAddItem.quantity;
              }
            "
          />
        </el-form-item>
      </el-form-item>
      <div class="flex gap-2">
        <el-form-item label="QTY" prop="quantity" class="w-full form-dialog">
          <el-input
            v-model="ruleFormDialogAddItem.quantity"
            placeholder="QTY"
            class="w-full"
            type="number"
            @input="
              (value) => {
                ruleFormDialogAddItem.total_price =
                  Number(ruleFormDialogAddItem.price) * Number(value);
              }
            "
          />
        </el-form-item>
        <el-form-item prop="unit_name" label="UoM" class="form-dialog">
          <div class="flex items-center gap-3 w-full">
            <el-autocomplete
              :fetch-suggestions="querySearchUnit"
              v-model="ruleFormDialogAddItem.unit_name!"
              placeholder="Unit"
              class="w-full"
              @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteModalUnit(item)"
            />
          </div>
        </el-form-item>
      </div>
      <el-form-item
        prop="ruleFormDialogAddItem.total_price"
        :label="`Total`"
        class="form-dialog"
        :disabled="true"
      >
        <el-input
          v-model="ruleFormDialogAddItem.total_price"
          class="mb-0"
          inputmode="decimal"
          placeholder="Harga"
          :disabled="true"
          :formatter="(value: any) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value: any) => value.replace(/\Rp\s?|(,*)/g, '')"
        />
      </el-form-item>

      <el-form-item
        :prop="'ruleFormDialogAddItem.garansi'"
        :label="'Garansi (Hari)'"
        class="form-dialog"
        :disabled="true"
      >
        <el-input
          v-model="ruleFormDialogAddItem.garansi"
          class="mb-0"
          inputmode="decimal"
        />
      </el-form-item>

      <el-form-item
        label=""
        prop="note"
        class="form-dialog"
        style="margin-top: 18px"
      >
        <el-input
          v-model="ruleFormDialogAddItem.note"
          type="textarea"
          placeholder="Masukkan deskripsi"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-popconfirm
          v-if="withDeleteAction"
          width="220"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="Are you sure to delete this?"
          @cancel="() => {}"
        >
          <template #reference>
            <el-button type="danger">Hapus</el-button>
          </template>
          <template #actions="{ confirm, cancel }">
            <el-button size="small" @click="cancel">No!</el-button>
            <el-button type="danger" size="small" @click="onDelete">
              Yes?
            </el-button>
          </template>
        </el-popconfirm>
        <el-button type="primary" @click="onSubmit"> Simpan </el-button>
      </div>
    </template>
  </el-dialog>
  <el-drawer v-model="drawerCatalogue" title="Detail Item" :with-header="true">
    <TrumsCatalogueAdd :catalogue_form="tmpCatalogue!" :loading="loading" />
    <template #footer>
      <div style="flex: auto">
        <el-button @click="handleCancelCreateCatalogue">Batal</el-button>
        <el-button type="primary" @click="handleSubmitCatalogue"
          >Simpan</el-button
        >
      </div>
    </template>
  </el-drawer>
</template>

<script lang="tsx" setup>
const props = defineProps<{
  data?: Pricetag_item;
  visible: boolean;
  withDeleteAction: boolean;
}>();

interface Emits {
  (e: "onSubmit", value: Pricetag_item): void;
  (e: "onClose"): void;
  (e: "onDelete"): void;
  (e: "update:visible", value: boolean): void;
}

const emit = defineEmits<Emits>();

import type {
  ComponentSize,
  FormInstance,
  FormProps,
  FormRules,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { ItemSearch } from "~/types/item_search";
import type { Pricetag_item } from "~/types/pricetag";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import { getFirstFileUrl } from "#imports";
import type { Unit } from "~/types/unit";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { InfoFilled, Picture } from "@element-plus/icons-vue";

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const { isMobile } = useDevice();

const dialogAddItem = ref<boolean>(false);
const loading = ref<boolean>(false);
const drawerCatalogue = ref<boolean>(false);

const tmpCatalogue = ref<Catalogue | null>(null);

const formSize = ref<ComponentSize>("default");
const labelPositionDialogItem = ref<FormProps["labelPosition"]>("top");
const ruleFormRefDialogItem = ref<FormInstance>();

const getDefaultForm = (): Pricetag_item => ({
  note: "",
  catalogue: {
    id: null,
    unique_id: null,
    unique_code: null,
    name: "",

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
    type: "",
    created_at: null,
    created_by: null,
    updated_at: null,
    file_catalogues: [],
  },
  unique_id: null,
  tag_id: null,
  catalogue_id: "",
  inventory_id: "",
  inventory: null,
  price: 0,
  displayPrice: formatCurrencyID(0),
  is_new: true,
  unit_id: "",
  unit_name: "",
  unit_version: 0,
  checked: false,
  quantity: 1,
  fileUploads: [],
  total_price: 0,
  display_total_price: formatCurrencyID(0),
  garansi: 0,
});

const ruleFormDialogAddItem = reactive<Pricetag_item>(getDefaultForm());

const rulesDialogItem = reactive<FormRules>({
  item_name: [
    {
      required: true,
      message: "Item Tidak Boleh Kosong!",
      trigger: "blur",
    },
  ],
  price: [
    { required: true, message: "Harga Tidak Boleh Kosong!", trigger: "blur" },
  ],
  quantity: [
    { required: true, message: "QTY Tidak Boleh Kosong!", trigger: "blur" },
  ],
  unit_name: [
    { required: true, message: "UoM Tidak Boleh Kosong!", trigger: "blur" },
  ],
});
const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params: RequestSearch = {
    keyword: "",
    table: "units",
    column: [],
    sort: {
      column: "created_at",
      order: OrderColumn.ASC,
    },
    limit: "50",
    offset: "1",
  };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "search-unit",
    "post",
    params
  )
    .then((response) => {
      if (response.status.value === "success") {
        const resultApi: Unit[] = response.data.value?.data ?? [];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, label: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};
const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  const data = {
    location_id: "",
    keyword: queryString,
    limit: 50,
    flag: "form",
  };
  useFetchApi<ResponsePagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "catalogues-inventory",
    "post",
    data
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: ItemSearch[] = response.data?.value?.data ?? [];

        if (inventories.length > 0) {
          const results = inventories.map((data: ItemSearch) => {
            return { isNew: false, value: `${data.catalogue_name}`, ...data };
          });
          cb([
            ...results,
            {
              isNew: true,
              value: `${queryString}`,
              name: `Tambahkan ${queryString}`,
            },
          ]);
        } else {
          cb([
            {
              isNew: true,
              value: `${queryString}`,
              name: `Tambahkan ${queryString}`,
            },
          ]);
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

    // Tambahkan file foto
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
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | null =
        response.data.value?.data ?? null;
      return catalogue_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const onHandleSelectItemAutocompleteModal = async (
  record: Record<string, any>
  // scope: any
) => {
  if (record.isNew) {
    const catalogueInsert: Catalogue = {
      name: record.value,
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
    // itemActive.value = scope.$index;
    drawerCatalogue.value = true;
  } else {
    const selected: ItemSearch = record as ItemSearch;
    ruleFormDialogAddItem.item_name = selected.catalogue_name!;
    ruleFormDialogAddItem.catalogue_id = selected.catalogue_id!;
    // ruleFormDialogAddItem.unit_id = selected.unit_id ?? "";
    // ruleFormDialogAddItem.unit_name = selected.unit_name ?? "";
    // ruleFormDialogAddItem.quantity = 1;
    // ruleFormDialogAddItem.catalogue = catalogue;
    // ruleFormDialogAddItem.price = 0;
  }
};

const onHandleSelectItemAutocompleteModalUnit = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleFormDialogAddItem.unit_name = item.label;
    ruleFormDialogAddItem.unit_id = "";
  } else {
    ruleFormDialogAddItem.unit_name = item.value;
    ruleFormDialogAddItem.unit_id = `${item.unique_id}`;
  }
};
const onClose = () => {
  emit("onClose");
};
const onDelete = () => {
  emit("onDelete");
};
const onSubmit = () => {
  emit("onSubmit", JSON.parse(JSON.stringify(ruleFormDialogAddItem)));
};

const handleCancelCreateCatalogue = () => {
  tmpCatalogue.value = null;
  drawerCatalogue.value = false;
};
const handleSubmitCatalogue = async () => {
  loading.value = true;
  console.log("on submit");
  try {
    const catalogueInsert =
      (await create_catalogue(tmpCatalogue.value!)) ?? undefined;

    if (catalogueInsert != undefined) {
      ruleFormDialogAddItem.item_name = catalogueInsert?.name ?? "";
      // dataTable.value[itemActive.value].item_id = catalogueInsert?.unique_id ?? '';
      ruleFormDialogAddItem.sn = catalogueInsert?.sn ?? "";
      ruleFormDialogAddItem.catalogue = catalogueInsert;
      ruleFormDialogAddItem.catalogue_id = catalogueInsert.unique_id;
      ruleFormDialogAddItem.fileUploads = mapApiFilesView(
        catalogueInsert.files ?? []
      );
      ruleFormDialogAddItem.image = getFirstFileUrl(
        catalogueInsert.files ?? []
      );
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

watch(
  () => props.data,
  (value) => {
    if (value) {
      Object.assign(ruleFormDialogAddItem, JSON.parse(JSON.stringify(value)));
      ruleFormDialogAddItem.total_price = value.price * value.quantity;
    } else {
      Object.assign(ruleFormDialogAddItem, getDefaultForm());
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>
