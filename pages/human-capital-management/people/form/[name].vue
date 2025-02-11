<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ mode }} People </span>
      </template>
    </el-page-header>
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
        <el-form-item label="Nama Departemen" prop="departement_id">
          <el-autocomplete
            v-model="ruleForm.departement_id"
            :fetch-suggestions="querySearchDepartement"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Masukan Nama Item"
            @select="handleSelectDepartement"
          />
        </el-form-item>
        <el-form-item label="Nama Posisi" prop="position_id">
          <el-autocomplete
            v-model="ruleForm.position_id"
            :fetch-suggestions="querySearchPosition"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Lokasi"
            @select="handleSelectPosition"
          />
        </el-form-item>

        <!-- <el-form-item label="Cost" prop="tmp_cost">
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
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Unit"
            @select="handleSelect"
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
        </el-form-item> -->
      </el-card>
    </el-form>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

interface RuleForm {
  id: number;
  unique_id: string;
  unique_code: string;
  gid: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  join_date: number;
  gender: string | null;
  departement_id: number | null;
  position_id: number | null;
  file_id: number | null;
  parent_people: string | null;
  position: string | null;
  photo: string | null;
}

import { reactive, ref, onMounted } from "vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type People } from "~/types/people";
import type { RequestSearch } from "~/types/request_search";
import type { Unit } from "~/types/unit";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Departement } from "~/types/departement";
import type { Position } from "~/types/position";
import { toPascalCase } from "~/utils/string_format";

const router = useRouter();
const route = useRoute();

const mode = toPascalCase(route.params.mode);

const goBack = () => router.back();

const loading = ref<boolean>(false);
const people = ref<People[]>([]);
const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: "50",
  offset: "1",
});

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive<RuleForm>({
  id: 1,
  unique_id: "",
  unique_code: "",
  gid: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  join_date: 1,
  gender: "",
  departement_id: 1,
  position_id: 1,
  file_id: 1,
  parent_people: "",
  position: "",
  photo: "",
});

const api = useApi();

const createFilterLocation = (queryString: string) => {
  return (people: People) => {
    return people.name?.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
};

const createFilterUnit = (queryString: string) => {
  return (unit: Unit) => {
    return unit.name?.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
  };
};

const rules = reactive<FormRules<RuleForm>>({
  departement_id: [
    { required: true, message: "Masukan Item", trigger: "blur" },
  ],
  position_id: [
    { required: true, message: "Masukan Lokasi Item", trigger: "blur" },
  ],
  // quantity: [{ required: true, message: "Masukan Quantity", trigger: "blur" }],
  // cost: [{ required: true, message: "Masukan Lokasi Item", trigger: "blur" }],
  // unit_name: [
  //   { required: true, message: "Masukan Jenis Unit", trigger: "blur" },
  // ],
  // sn: [{ required: true, message: "Masukan Serial Number", trigger: "blur" }],
});

const querySearchDepartement = (
  queryString: string,
  cb: (arg: any) => void
) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "departements";
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Departement[] = response.data.data;
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

const querySearchPosition = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "positions";
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Position[] = response.data.data;

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

const handleSelectDepartement = (item: Record<string, any>) => {
  console.log(item);

  // if (item.unique_id == undefined) {
  //   ruleForm.catalogue = item.id;
  //   ruleForm.catalogue_id = null;
  // } else {
  //   ruleForm.catalogue = item.value;
  //   ruleForm.catalogue_id = item.unique_id;
  // }
};
const handleSelectPosition = (item: Record<string, any>) => {
  console.log(item);

  // if (item.unique_id == undefined) {
  //   ruleForm.location_name = item.id;
  //   ruleForm.location_id = null;
  // } else {
  //   ruleForm.location_name = item.value;
  //   ruleForm.location_id = item.unique_id;
  // }
};

const submit = async (formEl: FormInstance | undefined) => {
  // loading.value = true;
  // try {
  //   ruleForm.is_traceable = ruleForm.traceable == "0" ? false : true;
  //   ruleForm.cost = parseInt(ruleForm.tmp_cost);
  //   ruleForm.quantity = parseInt(ruleForm.qty);
  //   const response = await api.post("/inventories-create", {
  //     catalogue_id: ruleForm.catalogue_id,
  //     catalogue_name: ruleForm.catalogue,
  //     location_id: ruleForm.location_id,
  //     location_name: ruleForm.location_name,
  //     is_traceable: ruleForm.is_traceable,
  //     sn: ruleForm.sn,
  //     unit_id: ruleForm.unit_id,
  //     unit_name: ruleForm.unit_name,
  //     quantity: ruleForm.quantity,
  //     cost: ruleForm.cost,
  //     unique_id: ruleForm.unique_id ?? null,
  //   });
  //   if (response.status == 201) {
  //     ElMessage.success(`Berhasil Menambahkan Inventori`);
  //     const unique_id = useCookie("unique_id");
  //     if (unique_id.value == null) {
  //       resetForm(formEl);
  //     } else {
  //       detail();
  //     }
  //   }
  // } catch (error: any) {
  //   ElMessage.error(`${error.response?.data?.message}`);
  // } finally {
  //   loading.value = false;
  // }
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
  // ruleForm.catalogue = "";
  // ruleForm.location_name = "";
  // ruleForm.catalogue_id = null;
  // ruleForm.location_id = "";
  // ruleForm.is_traceable = false;
  // ruleForm.sn = "";
  // ruleForm.unit_id = null;
  // ruleForm.unit_name = "";
  // ruleForm.quantity = 0;
  // ruleForm.cost = 0;
  // ruleForm.qty = "0";
  // ruleForm.tmp_cost = "0";
  // ruleForm.traceable = "0";
};

const detail = async () => {
  // loading.value = true;
  // try {
  //   const unique_id = useCookie("unique_id");
  //   const response = await api.get(`/inventories-read/${unique_id.value}`);
  //   if (response.status == 200) {
  //     const inventory: Inventory = response.data.data;
  //     ruleForm.catalogue = inventory.catalogue?.name ?? "";
  //     ruleForm.catalogue_id = inventory.catalogue.unique_id;
  //     ruleForm.is_traceable = inventory.is_traceable;
  //     ruleForm.traceable = inventory.is_traceable ? "1" : "0";
  //     ruleForm.cost = inventory.cost;
  //     ruleForm.location_id = inventory.location_id ?? "";
  //     ruleForm.location_name = inventory.location?.name ?? "";
  //     ruleForm.qty = (inventory.quantity ?? "").toString();
  //     ruleForm.quantity = inventory.quantity;
  //     ruleForm.sn = inventory.sn;
  //     ruleForm.tmp_cost = (inventory.cost ?? "").toString();
  //     ruleForm.unique_id = inventory.unique_id;
  //   }
  // } catch (error: any) {
  //   ElMessage.error(`${error.response?.data?.message}`);
  // } finally {
  //   loading.value = false;
  // }
};

// onMounted(() => {
//   const unique_id = useCookie("unique_id");

//   if (unique_id.value != null) {
//     detail();
//   }
// });
</script>
