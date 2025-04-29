<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3" v-if="lang === 'en'">
          {{ mode === "update" ? t("form.type.update") : t("form.type.new") }}
          {{ t("menu.submenu.people") }}
        </span>
        <span class="text-large font-600 mr-3" v-else>
          {{ t("menu.submenu.people") }}
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
            :label="`${t('form.label.name')}`"
            prop="name"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.name"
              :placeholder="`${t('form.placeholder.name')}`"
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.email')}`"
            prop="email"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.email"
              :placeholder="`${t('form.placeholder.email')}`"
            />
          </el-form-item>
        </div>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.phoneNumber')}`"
            prop="phone"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.phone"
              :placeholder="`${t('form.placeholder.phoneNumber')}`"
            />
          </el-form-item>
          <el-form-item
            :label="`${t('form.label.password')}`"
            prop="password"
            class="w-full"
          >
            <el-input
              v-model="ruleForm.password"
              type="password"
              :placeholder="`${t('form.placeholder.password')}`"
              show-password
            />
          </el-form-item>
        </div>
        <el-form-item
          :label="`${t('form.label.gender')}`"
          prop="gender"
          class="w-full"
        >
          <el-radio-group v-model="ruleForm.gender">
            <el-radio value="pria">{{ t("form.label.genderMale") }}</el-radio>
            <el-radio value="wanita">{{
              t("form.label.genderFemale")
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
          <el-form-item
            :label="`${t('form.label.departementName')}`"
            prop="departement"
            class="w-full"
          >
            <el-autocomplete
              v-model="ruleForm.departement"
              :fetch-suggestions="querySearchDepartement"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              :placeholder="`${t('form.placeholder.departement')}`"
              @select="handleSelectDepartement"
            />
          </el-form-item>
          <el-input
            v-model="ruleForm.departement_id"
            prop="departement_id"
            type="hidden"
          />
          <el-form-item
            :label="`${t('form.label.positionName')}`"
            prop="position"
            class="w-full"
          >
            <el-autocomplete
              v-model="ruleForm.position"
              :fetch-suggestions="querySearchPosition"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              :placeholder="`${t('form.placeholder.position')}`"
              @select="handleSelectPosition"
            />
          </el-form-item>
          <el-input
            v-model="ruleForm.position_id"
            prop="position_id"
            type="hidden"
          />
        </div>
        <el-form-item
          :label="`${t('form.label.contact')}`"
          prop="contact"
          class="w-full"
        >
          <div class="flex flex-col gap-4 w-full">
            <el-popconfirm
              v-if="selectContactApi.length === 2"
              width="250"
              :confirm-button-text="`${t('buttons.yes')}`"
              :cancel-button-text="`${t('buttons.no')}`"
              :icon="InfoFilled"
              icon-color="#626AEF"
              title="Are you sure to change selected contact?"
              @confirm="handleDeleteSelectedContact(selectContactApi)"
              @cancel="
                () => {
                  ElMessage.info(`${t('message.cancelChange')}`);
                }
              "
            >
              <template #reference>
                <el-button plain> Change Selected Contact </el-button>
              </template>
            </el-popconfirm>
            <el-button v-else plain @click="outerVisible = true">
              Change Contact
            </el-button>
            <div class="grid grid-cols-2 gap-4">
              <el-tooltip
                v-if="selectContactApi !== null"
                placement="top"
                v-for="contact in selectContactApi"
                v-key="contact.id"
              >
                <template #content>
                  {{ contact.phone }}<br />{{ contact.email }}
                </template>
                <el-card shadow="hover">{{ contact.name }}</el-card>
              </el-tooltip>
              <el-tooltip
                v-if="selectContact !== null"
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
          <el-dialog
            v-model="outerVisible"
            title="Select Contact"
            width="800"
            :before-close="handleCloseOuterVisible"
          >
            <el-col
              ><el-input
                :prefix-icon="Search"
                v-model="requestSearchContact.keyword"
                size="large"
                placeholder="Type to search Contact"
                clearable
            /></el-col>
            <CustomTable
              :data="dataContact?.data ?? []"
              :columns="columnsContact"
            />
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
              :title="`${t('buttons.add')} ${t('buttons.newContact')}`"
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
                <el-form-item :label="`${t('form.label.name')}`" prop="name">
                  <el-input
                    v-model="ruleFormContact.name"
                    :placeholder="`${t('form.placeholder.name')}`"
                  />
                </el-form-item>
                <el-form-item :label="`${t('form.label.email')}`" prop="email">
                  <el-input
                    v-model="ruleFormContact.email"
                    :placeholder="`${t('form.placeholder.email')}`"
                  />
                </el-form-item>
                <el-form-item
                  :label="`${t('form.label.phoneNumber')}`"
                  prop="phone"
                >
                  <el-input
                    v-model="ruleFormContact.phone"
                    :placeholder="`${t('form.placeholder.phoneNumber')}`"
                  />
                </el-form-item>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button type="danger" @click="innerVisible = false">{{
                    t("buttons.cancel")
                  }}</el-button>
                  <el-button
                    type="primary"
                    @click="submitFormContact(ruleFormRef)"
                    >{{ t("buttons.save") }}</el-button
                  >
                </div>
              </template>
            </el-dialog>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="innerVisible = true">
                  {{ t("buttons.newContact") }}
                </el-button>
                <el-button
                  type="primary"
                  @click="handleSubmitSelectContact()"
                  :disabled="selectContact.length < 1"
                >
                  {{ t("buttons.save") }}
                </el-button>
              </div>
            </template>
          </el-dialog>
        </el-form-item>
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

<style lang="css" scoped>
.el-form-item__content {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  font-size: var(--font-size);
  line-height: 32px;
  min-width: 0;
  position: inherit;
  justify-content: flex-end;
}
</style>

<script lang="tsx" setup>
import { reactive, ref, onMounted, watch } from "vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { InfoFilled, Search } from "@element-plus/icons-vue";
import { useApi } from "#imports";
import { type People } from "~/types/people";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Departement } from "~/types/departement";
import type { Position } from "~/types/position";
import type { Contact } from "~/types/contact";
import CustomTable from "~/components/trums/table/customTable.vue";

definePageMeta({
  middleware: ["auth", "app"],
});

const router = useRouter();
const route = useRoute();
const token = useCookie("token");
const { t } = useI18n();
const config = useRuntimeConfig();
const lang = useCookie("language");
const api = useApi();
const mode = route.query.mode;
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
const selectContactApi = ref<Contact[]>([]);

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
              value: `Tambahkan "${queryString}" di Departemen`,
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
              value: `Tambahkan "${queryString}" di Posisi`,
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
      selectContactApi.value = people.contacts;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
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
    selectContact.value = [];
  } else {
    detail();
  }
  ElMessage.info(`${t("message.resetForm")}`);
};

//data table contact selection start

const columnsContact: Column<Contact>[] = [
  {
    title: "Name",
    key: "name",
    dataKey: "name",
    sortable: true,
    fixed: true,
    width: 200,
  },
  {
    title: "Phone",
    key: "phone",
    dataKey: "phone",
    width: 200,
  },
  {
    title: "Email",
    key: "email",
    dataKey: "email",
    width: 200,
  },
];

const { data: dataContact } = await useFetchApi<ResponsePagination<Contact[]>>(
  "/search",
  "contacts",
  "post",
  requestSearchContact.value
);

const fetchDataContact = async () => {
  const { data: newDataContact } = await useFetchApi<
    ResponsePagination<Contact[]>
  >("/search", "contacts", "post", requestSearchContact.value);
  dataContact.value = newDataContact.value;
};

const handleSelectionChangeContact = (selection: Contact[]) => {
  if (selectContactApi.value?.length === 2) {
    ElMessage.error("Hapus dahulu jika ingin mengubah data kontaknya");
  } else if (selectContactApi.value?.length === 1) {
    if (selection.length <= 1) {
      selectContact.value = selection;
    } else {
      ElMessage.warning(
        "Pilih maksimal 1 orang contact karena sudah ada 1 data yang lain"
      );
      selectContact.value = selection.slice(0, 1);
    }
  } else {
    if (selection.length <= 2) {
      selectContact.value = selection;
    } else {
      ElMessage.warning("Pilih maksimal 2 orang contact.");
      selectContact.value = selection.slice(0, 2);
    }
  }
};
const tableContact = ref([]);

const handleDeleteSelectedContact = async (row: Contact) => {
  for (const contact of row) {
    await api.post("/contact-create", {
      internal_id: null,
      unique_id: contact.unique_id,
    });
  }
  await detail();
  // selectContact.value = [];
  // tableContact.value!.clearSelection();
};

const handleCloseOuterVisible = (done: () => void) => {
  outerVisible.value = false;
  tableContact.value!.clearSelection();
};

const handleSubmitSelectContact = () => {
  outerVisible.value = false;
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
watch(selectContactApi, async (newValue) => {}, { immediate: true });

// watch end

// mounted data edit start

onMounted(() => {
  if (unique_id !== null) {
    detail();
  }
});

//mounted data edit end
</script>
