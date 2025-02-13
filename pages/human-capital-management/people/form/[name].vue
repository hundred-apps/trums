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
        <el-form-item label="contact" prop="contact">
          <div class="flex flex-col gap-4 w-full">
            <el-button
              v-if="selectContact.length < 1"
              plain
              @click="outerVisible = true"
            >
              Select Contact
            </el-button>
            <el-button v-else plain @click="outerVisible = true">
              Change Contact
            </el-button>
            <div class="grid grid-cols-2 gap-4">
              <el-tooltip
                placement="top"
                v-for="contact in selectContact"
                v-key="contact.id"
              >
                <template #content>
                  {{ contact.phone }}<br />{{ contact.email }}
                </template>
                <el-card shadow="hover">{{ contact.name }}</el-card>
              </el-tooltip>
            </div>
          </div>
          <el-dialog v-model="outerVisible" title="Select Contact" width="800">
            <el-table
              class="w-screen"
              height="400"
              @selection-change="handleSelectionChangeContact"
              :data="dataContact?.data"
              :loading="loading"
              ref="tableContact"
              lazy
            >
              <el-table-column type="selection" width="55" />
              <el-table-column
                v-for="col in columnsContact"
                :key="col.prop || col.label"
                :prop="col.prop"
                :label="col.label"
                :sortable="col.sortable"
                :fixed="col.fixed"
                :width="col.width"
              >
              </el-table-column>
            </el-table>
            <div class="flex justify-end">
              <el-pagination
                class="my-3"
                v-model:page-size="limit"
                :page-sizes="[10, 20, 30, 40]"
                background
                layout="total, sizes, prev, pager, next"
                :total="dataContact?.total_data"
                @size-change="handleSizeChangeContact"
                @current-change="handleCurrentChangeContact"
              />
            </div>
            <el-dialog
              v-model="innerVisible"
              width="500"
              title="Add New Contact"
              append-to-body
            >
              <el-form
                ref="ruleFormRef"
                style="max-width: 600px"
                :model="ruleFormContact"
                :rules="rulesContact"
                label-width="auto"
                class="demo-ruleForm"
                :size="formSize"
                status-icon
                :disabled="loading"
              >
                <el-form-item label="Name" prop="name">
                  <el-input v-model="ruleFormContact.name" placeholder="Nama" />
                </el-form-item>
                <el-form-item label="Email" prop="email">
                  <el-input
                    v-model="ruleFormContact.email"
                    placeholder="Email"
                  />
                </el-form-item>
                <el-form-item label="Phone" prop="phone">
                  <el-input
                    v-model="ruleFormContact.phone"
                    placeholder="Phone"
                  />
                </el-form-item>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button type="danger" @click="innerVisible = false"
                    >Cancel</el-button
                  >
                  <el-button
                    type="primary"
                    @click="submitFormContact(ruleFormRef)"
                    >Submit</el-button
                  >
                </div>
              </template>
            </el-dialog>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="innerVisible = true">
                  New Contact
                </el-button>
                <el-button type="danger" @click="handleCancelContact()"
                  >Cancel</el-button
                >
                <el-button
                  type="primary"
                  @click=""
                  :disabled="selectContact.length < 1"
                >
                  Submit
                </el-button>
              </div>
            </template>
          </el-dialog>
        </el-form-item>
      </el-card>
    </el-form>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});
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
import type { Contact } from "~/types/contact";
import { toPascalCase } from "~/utils/string_format";

const router = useRouter();
const route = useRoute();
const token = useCookie("token");
const { t } = useI18n();
const config = useRuntimeConfig();
const api = useApi();

const mode = toPascalCase(route.query.mode);
const unique_id = route.query.unique_id;

const goBack = () => router.back();
const outerVisible = ref<boolean>(false);
const innerVisible = ref<boolean>(false);

const loading = ref<boolean>(false);
const people = ref<People[]>([]);
const limit = ref(10);
const currentPage = ref(1);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const selectContact = ref<Contact[]>([]);

// request data people start

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
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

// request data people end

// request data contact start
const requestSearchContact = ref<RequestSearch>({
  keyword: "",
  table: "contacts",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
});

interface RuleFormContact {
  id: number;
  unique_id: string;
  unique_code: string;
  is_personal: boolean;
  is_company: boolean | null;
  internal_id: number;
  name: string;
  email: string;
  phone: string | null;
  tax_id: string | null;
  website: string | null;
  title: string | null;
  tags: string | [] | null;
}
const ruleFormContact = reactive<RuleFormContact>({
  id: 1,
  unique_code: "",
  is_personal: false,
  is_company: false,
  internal_id: 1,
  name: "",
  email: "",
  phone: "",
  tax_id: "",
  website: "",
  title: "",
  tags: "",
});

const rulesContact = reactive<FormRules<RuleFormContact>>({
  name: [
    {
      required: true,
      message: `${t("form.validate.name")}`,
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: `${t("form.validate.email")}`, trigger: "blur" },
    {
      type: "email",
      message: `${t("form.validate.emailAddress")}`,
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    { required: true, message: `${t("form.validate.phone")}`, trigger: "blur" },
    {
      min: 11,
      max: 13,
      message: `${t("form.validate.phoneLength")}`,
      trigger: ["blur", "change"],
    },
  ],
});
// request data contact end

// data autocomplete departemen start
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
//data autocomplete departemen end

// data autocomplete posisi start
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
// data autocomplete posisi end

// submit people start

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;

  try {
    const arrayContact = ref([]);
    Object.values(selectContact.value).forEach((contact) => {
      arrayContact.value.push(contact.unique_id);
    });
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
        contacts: arrayContact.value,
        unique_id: ruleForm.unique_id ?? null,
      }
      // {
      //   headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      // }
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

// submit people end

// submit contact start
const submitContact = async (formEl: FormInstance | undefined) => {
  try {
    const response = await api.post(
      "/contact-create",
      {
        name: ruleFormContact.name,
        email: ruleFormContact.email,
        phone: ruleFormContact.phone,
        unique_id: ruleFormContact.unique_id ?? null,
      },
      {
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      }
    );
    if (response.status == 201) {
      ElMessage.success(`Berhasil Menambahkan Contact`);
      await fetchDataContact();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    innerVisible.value = false;
  }
};

const submitFormContact = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submitContact(formEl);
    } else {
      console.log(ruleForm);
      ElMessage.error(`${fields}`);
    }
  });
};
// submit contact end

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

//data table contact selection start

const columnsContact = [
  {
    label: "Name",
    prop: "name",
    sortable: true,
    fixed: true,
    width: 200,
  },
  {
    label: "Phone",
    prop: "phone",
  },
  {
    label: "Email",
    prop: "email",
  },
];
const { data: dataContact } = await useFetch<ResponsePagination<Contact[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "",
    method: "post",
    body: requestSearchContact.value,
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  }
);
const fetchDataContact = async () => {
  const { data: newDataContact } = await useFetch<
    ResponsePagination<Contact[]>
  >(`${config.public.baseURL}/search`, {
    key: "fetchData",
    method: "post",
    body: requestSearchContact.value,
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  });
  dataContact.value = newDataContact.value;
};
const handleSelectionChangeContact = (selection: Contact[]) => {
  if (selection.length <= 2) {
    selectContact.value = selection;
  } else {
    ElMessage.warning("Pilih maksimal 2 orang contact.");
    selectContact.value = selection.slice(0, 2);
  }
};
const tableContact = ref([]);

const handleCancelContact = () => {
  selectContact.value = [];
  outerVisible.value = false;
  tableContact.value.clearSelection();
};

const selectRowsByUniqueId = () => {
  console.log("data COntacnt:", dataContact.value?.data.length);

  console.log("data Unique:", selectContact.value?.length);

  if (dataContact.value?.data.length > 0 && selectContact.value?.length > 0) {
    dataContact.value?.data.forEach((row) => {
      console.log("row", row);
      if (selectContact.includes(row.unique_id)) {
        tableContact.value.toggleRowSelection(row, true);
      }
    });
  }
};

const handleSizeChangeContact = (val: number) => {
  // loading.value = true;
};
const handleCurrentChangeContact = (val: number) => {
  currentPage.value = val;
};

//data table contact selection end

// watch setiap ada perubahan data start

watch(requestSearch, async (newValue) => {}, { immediate: true });
watch(requestSearchContact, async (newValue) => {}, { immediate: true });
watch(selectContact, async (newValue) => {}, { immediate: true });

// watch end

// mounted data edit start

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
      selectContact.value = people.contacts;
    }
    console.log("res:", response);
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  if (unique_id !== null) {
    detail();
    selectRowsByUniqueId();
  }
});

//mounted data edit end
</script>
