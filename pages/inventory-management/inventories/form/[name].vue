<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3" v-if="lang === 'en'">
          {{ mode === "update" ? t("form.type.update") : t("form.type.new") }}
          {{ t("menu.submenu.inventories") }}
        </span>
        <span class="text-large font-600 mr-3" v-else>
          {{ t("menu.submenu.inventories") }}
          {{ mode === "update" ? t("form.type.update") : t("form.type.new") }}
        </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.itemName')}`"
            prop="catalogue"
            class="w-full"
          >
            <el-autocomplete
              v-model="ruleForm.catalogue"
              :fetch-suggestions="querySearchAsync"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              :placeholder="`${t('form.placeholder.item')}`"
              @select="handleSelect"
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.location')}`"
            prop="location_name"
            class="w-full"
          >
            <el-autocomplete
              v-model="ruleForm.location_name"
              :fetch-suggestions="querySearchLocation"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              :placeholder="`${t('form.placeholder.location')}`"
              @select="handleSelectLocation"
            />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.cost')}`"
            prop="tmp_cost"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.tmp_cost"
              :placeholder="`${t('form.placeholder.cost')}`"
              :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: any) => value.replace(/[^0-9]/g, '')"
            >
              <template #prefix>
                <el-text>Rp</el-text>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.unit')}`"
            prop="unit_name"
            class="w-full"
          >
            <el-autocomplete
              v-model="ruleForm.unit_name"
              :fetch-suggestions="querySearchUnit"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              :placeholder="`${t('form.placeholder.unit')}`"
              @select="handleSelectUnit"
            />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.trackInventory')}`"
            prop="is_traceable"
            class="w-full"
          >
            <el-radio-group v-model="ruleForm.traceable">
              <el-radio value="1">{{ t("buttons.yes") }}</el-radio>
              <el-radio value="0">{{ t("buttons.no") }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="ruleForm.traceable == '0'"
            :label="`${t('form.label.quantity')}`"
            prop="qty"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.qty"
              :parser="(value: any) => value.replace(/[^0-9]/g, '')"
              :placeholder="`${t('form.placeholder.quantity')}`"
            />
          </el-form-item>
          <el-form-item
            v-if="ruleForm.traceable == '1'"
            :label="`${t('form.label.serialNumber')}`"
            prop="sn"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.sn"
              :placeholder="`${t('form.placeholder.serialNumber')}`"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(ruleFormRef)">{{
            t("buttons.reset")
          }}</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            {{ t("buttons.save") }}
          </el-button>
        </div>
      </template>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Catalogue } from "~/types/catalogue";
import type { RequestSearch } from "~/types/request_search";
import type { Unit } from "~/types/unit";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Inventory } from "~/types/inventory";

definePageMeta({
  middleware: ["auth", "app"],
});

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const router = useRouter();
const route = useRoute();
const localePath = useLocalePath();
const mode = route.query.mode;
const unique_id = route.query.unique_id;
const lang = useCookie("language");
const goBack = () => router.back();
const loading = ref<boolean>(false);
const catalogues = ref<Catalogue[]>([]);
const api = useApi();
const { t } = useI18n();

interface RuleForm {
  id: number;
  catalogue: string;
  catalogue_id: string | null;
  location_id: string | null;
  location_name: string;
  is_traceable: boolean;
  traceable: string;
  sn: string;
  unit_id: number | null;
  unit_name: string;
  qty: string;
  quantity: number;
  cost: number;
  tmp_cost: string;
  unique_id?: string;
}

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: "50",
  offset: "1",
});

const ruleForm = reactive<RuleForm>({
  id: 1,
  catalogue: "",
  location_name: "",
  catalogue_id: "",
  location_id: "",
  is_traceable: false,
  sn: "",
  unit_id: 0,
  unit_name: "",
  quantity: 0,
  cost: 0,
  qty: "0",
  tmp_cost: "0",
  traceable: "0",
});

const rules = reactive<FormRules<RuleForm>>({
  catalogue: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  quantity: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  cost: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  unit_name: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  sn: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  location_name: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
});

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [{ type: ["item"] }];
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;
        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `${t("form.dropdown.addItem", {
                name: queryString,
              })}`,
              id: `${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
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
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `${t("form.dropdown.addLocation", {
                name: queryString,
              })}`,
              id: `${queryString}`,
            },
          ]);
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
  api
    .post("/search", params)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Unit[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `${t("form.dropdown.addUnit", {
                name: queryString,
              })}`,
              id: `${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const handleSelect = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleForm.catalogue = item.id;
    ruleForm.catalogue_id = null;
  } else {
    ruleForm.catalogue = item.value;
    ruleForm.catalogue_id = item.unique_id;
  }
};

const handleSelectUnit = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleForm.unit_name = item.id;
    ruleForm.unit_id = null;
  } else {
    ruleForm.unit_name = item.value;
    ruleForm.unit_id = item.unique_id;
  }
};

const handleSelectLocation = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleForm.location_name = item.id;
    ruleForm.location_id = null;
  } else {
    ruleForm.location_name = item.value;
    ruleForm.location_id = item.unique_id;
  }
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    ruleForm.is_traceable = ruleForm.traceable == "0" ? false : true;
    ruleForm.cost = parseInt(ruleForm.tmp_cost);
    ruleForm.quantity = parseInt(ruleForm.qty);

    const response = await api.post("/inventories-create", {
      catalogue_id: ruleForm.catalogue_id,
      catalogue_name: ruleForm.catalogue,
      location_id: ruleForm.location_id,
      location_name: ruleForm.location_name,
      is_traceable: ruleForm.is_traceable,
      sn: ruleForm.sn,
      unit_id: ruleForm.unit_id,
      unit_name: ruleForm.unit_name,
      quantity: ruleForm.quantity,
      cost: ruleForm.cost,
      unique_id: ruleForm.unique_id ?? null,
    });

    if (response.status == 201) {
      if (unique_id === null) {
        ElMessage.success(`${t("message.submitNewItemInventory")}`);
        resetForm(formEl);
      } else {
        detail();
        ElMessage.success(`${t("message.submitUpdateItemInventory")}`);
        navigateTo(localePath("/inventory-management/inventories"));
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
  if (unique_id === null) {
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
  } else {
    detail();
  }
  ElMessage.info(`${t("message.resetForm")}`);
};

const detail = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/inventories-read/${unique_id}`);
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
      ruleForm.unit_name = inventory.unit_name;
      ruleForm.unit_id = inventory.unit_id;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (unique_id != null) {
    detail();
  }
});
</script>
