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
        <el-form-item label="Nama" prop="name">
          <el-input v-model="ruleForm.name" placeholder="Masukan Nama" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="ruleForm.email" placeholder="Masukan Email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="ruleForm.phone" placeholder="Masukan Telepon" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="ruleForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item :label="`${t('form.label.gender')}`" prop="gender">
          <el-radio-group v-model="ruleForm.gender">
            <el-radio value="pria">{{ t("form.label.genderMale") }}</el-radio>
            <el-radio value="wanita">{{
              t("form.label.genderFemale")
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Nama Departemen" prop="departement">
          <el-autocomplete
            v-model="ruleForm.departement"
            :fetch-suggestions="querySearchDepartement"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Masukan Nama Departemen"
            @select="handleSelectDepartement"
          />
        </el-form-item>
        <el-input
          v-model="ruleForm.departement_id"
          prop="departement_id"
          type="hidden"
        />
        <el-form-item label="Nama Posisi" prop="position">
          <el-autocomplete
            v-model="ruleForm.position"
            :fetch-suggestions="querySearchPosition"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Pilih Posisi"
            @select="handleSelectPosition"
          />
        </el-form-item>
        <el-input
          v-model="ruleForm.position_id"
          prop="position_id"
          type="hidden"
        />

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
  departement_id: string | null;
  position_id: string | null;
  file_id: number | null;
  parent_people: string | null;
  position: string | null;
  departement: string | null;
  photo: string | null;
}

import { reactive, ref, onMounted, watch } from "vue";
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
const token = useCookie("token");
const { t } = useI18n();

const mode = toPascalCase(route.query.mode);
const unique_id = route.query.unique_id;

const goBack = () => router.back();

const loading = ref<boolean>(false);
const people = ref<People[]>([]);
const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: "10",
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
  departement_id: "",
  position_id: "",
  file_id: 1,
  parent_people: "",
  position: "",
  departement: "",
  photo: "",
});

const api = useApi();

// const createFilterLocation = (queryString: string) => {
//   return (people: People) => {
//     return people.name?.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
//   };
// };

// const createFilterUnit = (queryString: string) => {
//   return (position: Position) => {
//     return (
//       position.name?.toLowerCase().indexOf(queryString.toLowerCase()) === 0
//     );
//   };
// };

const rules = reactive<FormRules<RuleForm>>({
  departement: [
    { required: true, message: "Masukan departemen", trigger: "blur" },
  ],
  position: [{ required: true, message: "Masukan posisi", trigger: "blur" }],
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
    .post("/search", requestSearch.value, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Departement[] = response.data.data;
        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `Tambahkan "${queryString}"`,
              name: `${queryString}`,
            },
          ]);
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
    .post("/search", requestSearch.value, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Position[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `Tambahkan "${queryString}"`,
              name: `${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const handleSelectDepartement = async (item: Record<string, any>) => {
  if (item.unique_id === undefined) {
    ruleForm.departement = item.name;
    try {
      const response = await api.post(
        "/departement-create",
        {
          name: item.name,
          unique_id: null, // Let the backend generate a new unique_id
        },
        {
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
        }
      );
      if (response.status === 201) {
        ruleForm.departement_id = response.data.data.unique_id;
        ElMessage.success("Berhasil menambahkan departemen.");
      }
    } catch (error) {
      ElMessage.error("Gagal menambahkan departemen baru.");
      console.error(error);
    }
  } else {
    ruleForm.departement = item.name;
    ruleForm.departement_id = item.unique_id;
  }
};
const handleSelectPosition = async (item: Record<string, any>) => {
  if (item.unique_id === undefined) {
    ruleForm.position = item.name;
    try {
      const response = await api.post(
        "/position-create",
        {
          name: item.name,
          unique_id: null,
        },
        {
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
        }
      );
      if (response.status === 201) {
        ruleForm.position_id = response.data.data.unique_id;
        ElMessage.success("Berhasil menambahkan posisi");
      }
    } catch (error) {
      ElMessage.error("Gagal menambahakan posisi");
      console.log(error);
    }
  } else {
    ruleForm.position = item.name;
    ruleForm.position_id = item.unique_id;
  }
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const response = await api.post(
      "/people-create",
      {
        name: ruleForm.name,
        email: ruleForm.email,
        phone: ruleForm.phone,
        gender: ruleForm.gender,
        password: ruleForm.password,
        position_id: ruleForm.position_id,
        departement_id: ruleForm.departement_id,
        unique_id: ruleForm.unique_id ?? null,
      },
      {
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      }
    );
    if (response.status == 201) {
      if (unique_id !== null) {
        ElMessage.success(`Berhasil Mengedit People`);
      } else {
        ElMessage.success(`Berhasil Menambahkan People`);
      }
      router.push("/human-capital-management/people");
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
    ruleForm.name = "";
    ruleForm.email = "";
    ruleForm.phone = "";
    ruleForm.password = "";
    ruleForm.gender = "";
    ruleForm.position = "";
    ruleForm.position_id = "";
    ruleForm.departement_id = "";
  } else {
    detail();
  }
};

const detail = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/people-read/${unique_id}`);
    if (response.status == 200) {
      const people: People = response.data.data;
      ruleForm.name = people.name ?? "";
      ruleForm.email = people.email;
      ruleForm.phone = people.phone;
      ruleForm.password = people.password;
      ruleForm.gender = people.gender;
      ruleForm.position_id = people.position_id ?? "";
      ruleForm.position = people.position_name ?? "";
      ruleForm.departement = people.departement_name;
      ruleForm.departement_id = people.departement_id;
      ruleForm.unique_id = people.unique_id;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

watch(
  requestSearch,
  async (newValue) => {
    console.log("new", newValue);
  },
  { immediate: true }
);

onMounted(() => {
  if (unique_id !== null) {
    detail();
  }
});
</script>
