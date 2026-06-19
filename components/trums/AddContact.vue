<template>
  <el-card class="my-3" shadow="never">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      :label-position="labelPosition"
      label-width="auto"
      class="demo-ruleForm max-w-full"
      :size="formSize"
      status-icon
      :disabled="loading"
    >
      <div class="flex">
        <el-form-item class="flex-1" label="Name" prop="name">
          <el-input v-model="ruleForm.name" placeholder="Nama" />
        </el-form-item>
        <el-form-item class="flex-1" label="Email" prop="email">
          <el-input v-model="ruleForm.email" placeholder="Email" />
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" label="Phone" prop="phone">
          <el-input v-model="ruleForm.phone" placeholder="Phone" />
        </el-form-item>
        <el-form-item class="flex-1" label="NPWP" prop="tax_id">
          <el-input v-model="ruleForm.tax_id" placeholder="NPWP" />
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" label="Website" prop="website">
          <el-input v-model="ruleForm.website" placeholder="Website" />
        </el-form-item>
        <el-form-item class="flex-1" label="Title" prop="title">
          <el-input v-model="ruleForm.title" placeholder="Title" />
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" label="Tipe">
          <el-checkbox v-model="ruleForm.is_personal" label="Personal" border />
          <el-checkbox
            v-model="ruleForm.is_company!"
            label="Perusahaan"
            border
          />
        </el-form-item>
        <el-form-item class="flex-1" label="Ownership?">
          <el-switch v-model="ruleForm.ownership" />
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" label="Tags" prop="tags">
          <el-input-tag
            v-model="ruleForm.tags"
            :max="3"
            clearable
            placeholder="enter up to 3 tags"
          />
        </el-form-item>
        <el-form-item class="flex-1" label="Parent" prop="parent_name">
          <el-autocomplete
            v-model="ruleForm.parent_name!"
            :fetch-suggestions="querySearchParent"
            placeholder="Search Parent"
            @select="onHandleSelectParent"
          >
            <template #default="{ item }">
              <div>
                {{ item.name }}
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
      </div>
    </el-form>
  </el-card>

  <el-card class="mt-3" shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span>Daftar PIC</span>
        <el-button :icon="Plus" type="primary" @click="addLineContact"
          >Tambahkan PIC</el-button
        >
      </div>
    </template>
    <el-table :data="ruleForm.children" border>
      <el-table-column label="Nama">
        <template #default="scope">
          <el-input v-model="scope.row.name" />
        </template>
      </el-table-column>
      <el-table-column label="Telepon">
        <template #default="scope">
          <el-input v-model="scope.row.phone" />
        </template>
      </el-table-column>
      <el-table-column label="Email">
        <template #default="scope">
          <el-input v-model="scope.row.email" />
        </template>
      </el-table-column>
      <el-table-column label="Aksi" width="75">
        <template #default="scope">
          <el-button
            :icon="Delete"
            type="danger"
            @click="() => handleDeletePIC(scope.$index)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-card class="mt-3" shadow="never">
    <template #header>
      <div class="card-header flex items-center justify-between">
        <span>Alamat</span>
        <el-button :icon="Plus" type="primary" @click="showDialogAddress"
          >Tambahkan Alamat</el-button
        >
      </div>
    </template>
    <div
      class="flex flex-col mb-5"
      v-for="(address, index) in ruleForm.address"
    >
      <div class="flex justify-between items-center">
        <p class="font-bold text-md mb-1">
          {{ address.address_name }} | {{ address.phone }}
        </p>
        <div>
          <el-button type="primary" link @click="handleEditAddress(index)"
            >Ubah</el-button
          >
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @confirm="handleDeleteAddress(index)"
            @cancel="() => {}"
          >
            <template #reference>
              <el-button type="danger" link>Hapus</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
      <p class="text-sm" style="line-height: 15px">
        {{ address.street }}
      </p>
      <p class="text-sm">
        {{ generateAddressView(address) }}
      </p>
    </div>
  </el-card>

  <el-card shadow="never" class="my-2 p-0">
    <div class="flex justify-end align-center">
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        Simpan
      </el-button>
      <el-button type="info" plain @click="resetForm(ruleFormRef)"
        >Reset</el-button
      >
    </div>
  </el-card>

  <el-dialog v-model="dialogNewAddress" title="Form Alamat" width="600">
    <FormAddress
      :use-tmp="true"
      :onSetInitital="{
        ...ruleFormAddress,
        address_view: ruleFormAddress.tmp_address_view,
      }"
      :onSuccess="submitFormAddress"
    />
  </el-dialog>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

import { reactive, ref, onMounted } from "vue";
import { toPascalCase } from "~/utils/string_format";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Contact } from "~/types/contact";
import type { AddressSearch, AddressType } from "~/types/address";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  Search,
  Plus,
  Edit,
  Delete,
  InfoFilled,
  Right,
} from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import FormAddress from "~/components/trums/FormAddress.vue";
import { generateAddressView } from "#imports";

const props = defineProps<{
  onSubmit: (data: Contact | undefined) => void;
  data: Contact | null;
}>();

// const emit = defineEmits<{
//   onSubmit: [data: Contact];
//   reset: [];
//   cancel: [];
// }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dialogNewAddress = ref<boolean>(false);

const goBack = () => router.back();
const is_company =
  route.query.company != undefined ? Boolean(route.query.company) : false;
const ownership =
  route.query.ownership != undefined ? Boolean(route.query.ownership) : false;

interface RuleForm {
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
  tags: string[];
  ownership: boolean;
  address: AddressType[];
  parent_id: string;
  parent_name: string;
  perent_version: number;
  children: Contact[];
}

interface formAddress {
  unique_id?: string;
  contact_id?: string;
  contact_name?: string;
  contact_version?: number;
  address_id?: string;
  address_name?: string;
  address?: string;
  street?: string;
  village_id?: string;
  village?: string;
  city?: string;
  regency?: string;
  codepos?: string;
  province?: string;
  country?: string;
  lat?: string;
  lng?: string;
}
const ruleForm = reactive<RuleForm>({
  id: 1,
  unique_id: "",
  unique_code: "",
  is_personal: false,
  is_company: is_company,
  internal_id: 1,
  name: "",
  email: "",
  phone: "",
  tax_id: "",
  website: "",
  title: "",
  tags: [],
  ownership: ownership,
  address: [],
  parent_id: "",
  parent_name: "",
  perent_version: 0,
  children: [
    {
      id: 0,
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: null,
      internal_id: "",
      name: "",
      email: "",
      phone: null,
      tax_id: null,
      website: null,
      title: null,
      tags: "",
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
      address: [],
    },
  ],
});

const addLineContact = () =>
  ruleForm.children.push({
    id: 0,
    unique_id: "",
    unique_code: "",
    is_personal: false,
    is_company: null,
    internal_id: "",
    name: "",
    email: "",
    phone: null,
    tax_id: null,
    website: null,
    title: null,
    tags: "",
    created_at: 0,
    created_by: "",
    updated_at: 0,
    version: 0,
    address: [],
  });

const rules = reactive<FormRules>({
  name: [
    {
      required: true,
      message: `${t("form.validate.name")}`,
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: `${t("form.validate.phone")}`, trigger: "blur" },
    {
      min: 7,
      max: 13,
      message: `${t("form.validate.phoneLength")}`,
      trigger: ["blur", "change"],
    },
  ],
  tax_id: [
    {
      pattern: /^(\d{10}|\d{15}|\d{16})$/,
      message: "masukan format npwp",
      trigger: ["blur", "change"],
    },
  ],
  website: [
    {
      type: "url",
      message: `url yaaa`,
      trigger: ["blur", "change"],
    },
  ],
});

const { formSize, labelPosition } = useFormConfig();

const ruleFormRef = ref<FormInstance>();
const api = useApi();
const loading = ref<boolean>(false);

const ruleFormRefAddress = ref<FormInstance>();
const ruleFormAddress = ref<AddressType>({
  unique_id: "",
  contact_id: null,
  contact_version: 0,
  contact_name: "",
  address_name: "",
  street: "",
  village_id: "",
  village: "",
  city: "",
  regency: "",
  province: "",
  country: "",
  created_at: 0,
  created_by: 0,
  updated_at: 0,
  version: 0,
  phone: "",
});

const rulesAddress = reactive<FormRules<formAddress>>({
  address_name: [
    { required: true, message: "Masukan Nama/Label Alamat", trigger: "blur" },
  ],
  street: [{ required: true, message: "Masukan Detail", trigger: "blur" }],
  codepos: [{ required: true, message: "Masukan Kode Pos", trigger: "blur" }],
  address: [{ required: true, message: "Masukan Alamant", trigger: "blur" }],
  village_id: [
    { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
  ],
  village: [
    { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
  ],
  city: [{ required: true, message: "Masukan Kecamatan", trigger: "blur" }],
  regency: [
    { required: true, message: "Masukan Kota/Kabupaten", trigger: "blur" },
  ],
  province: [{ required: true, message: "Masukan Provinsi", trigger: "blur" }],
});

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.name = "";
  ruleForm.email = "";
  ruleForm.phone = "";
  ruleForm.tax_id = "";
  ruleForm.website = "";
  ruleForm.title = "";
  ruleForm.is_personal = false;
  ruleForm.is_company = false;
  ruleForm.tags = [];
};

const handleDeleteAddress = async (index: number) => {
  try {
    if (props.data) {
      const response = await useApiFetch<BaseResponse<any>>("/address-delete", {
        body: [ruleForm.address[index].unique_id],
      });

      ruleForm.address.splice(index, 1);
    } else {
      ruleForm.address.splice(index, 1);
    }
  } catch (error: any) {
    // ElMessage.error(error?.response?.message ?? error);
    console.log("Gagal hapus data alamat1");
  }
};

const handleDeletePIC = (index: number) => {
  ruleForm.children.splice(index, 1);
};

const handleEditAddress = (index: number) => {
  ruleFormAddress.value = ruleForm.address[index];

  // ruleFormAddress.street = ruleForm.address[index].street;
  // ruleFormAddress.unique_id = ruleForm.address[index].unique_id;
  // ruleFormAddress.address_name = ruleForm.address[index].address_name;
  // ruleFormAddress.contact_id = ruleForm.address[index].contact_id || "";
  // ruleFormAddress.contact_name = ruleForm.address[index].contact_name;
  // ruleFormAddress.contact_version = ruleForm.address[index].contact_version;
  // ruleFormAddress.village = ruleForm.address[index].village;
  // ruleFormAddress.village_id = ruleForm.address[index].village_id;
  // ruleFormAddress.city = ruleForm.address[index].city;
  // ruleFormAddress.province = ruleForm.address[index].province;
  // ruleFormAddress.regency = ruleForm.address[index].regency;
  // ruleFormAddress.street = ruleForm.address[index].street;
  // ruleFormAddress.codepos = ruleForm.address[index].codepos;
  // ruleFormAddress.country = ruleForm.address[index].country;

  dialogNewAddress.value = true;
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const payload = {
      name: ruleForm.name,
      email: ruleForm.email,
      phone: ruleForm.phone,
      tax_id: ruleForm.tax_id,
      website: ruleForm.website,
      title: ruleForm.title,
      is_personal: ruleForm.is_personal,
      is_company: ruleForm.is_company,
      tags: ruleForm.tags?.toString(),
      unique_id: ruleForm.unique_id,
      ownership: ruleForm.ownership,
      parent_id: ruleForm.parent_id,
      parent_version: ruleForm.perent_version,
      address: ruleForm.address.map((value) => ({
        address_name: value.address_name,
        street: value.street,
        village_id: value.village_id,
        village: value.village,
        city: value.city,
        regency: value.regency,
        province: value.province,
        country: "indonesia",
        codepos: parseInt(`${value.codepos || 0}`),
        unique_id: value.unique_id.includes("temp-") ? null : value.unique_id,
      })),
      children: ruleForm.children,
    };

    console.log("payload", payload);

    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-contact",
      "post",
      payload
    );
    if (response.status.value == "success") {
      if (props.data) {
        ElMessage.success(`Berhasil Mengedit contact`);
      } else {
        ElMessage.success(`Berhasil Menambahkan contact`);
      }

      if (response.data.value?.data) {
        console.log("response", response.data.value?.data);
        props.onSubmit(response.data.value!.data!);
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

const querySearchParent = (query: string, cb: (arg: any) => void) => {
  try {
    const request_contact: RequestSearch = {
      column: [
        {
          is_company: true,
        },
      ],
      keyword: query,
      table: "contacts",
      sort: null,
      offset: "1",
      limit: "10",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-publisher",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              ...value,
              value: value.name,
              unique_id: value.unique_id,
            }))
          );
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendor", error);
    cb([]);
  }
};

const onHandleSelectParent = (item: any) => {
  const customer = item as Contact;
  ruleForm.parent_id = customer.unique_id;
  ruleForm.parent_name = customer.name;
  ruleForm.perent_version = customer.version || 1;
};

const querySearchGeolocation = (
  queryString: string,
  cb: (arg: any) => void
) => {
  useFetchApi<ResponsePagination<AddressSearch[]>>(
    "/search-indonesia",
    "address",
    "post",
    { keyword: queryString, limit: 500, offset: 1, flag: "form" }
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressSearch[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb(resultApi.map((value) => ({ ...value, value: value.name })));
      }
    }
  });
};

const showDialogAddress = () => {
  ruleFormAddress.value.address_name = ruleForm.name;
  ruleFormAddress.value.phone = ruleForm.phone || "";
  dialogNewAddress.value = true;
};

const submitFormAddress = async (address: AddressType) => {
  if (address.unique_id) {
    const findIndex = ruleForm.address.findIndex(
      (find) => find.unique_id == address.unique_id
    );
    console.log("find index exist", findIndex);
    if (findIndex >= 0) {
      ruleForm.address[findIndex] = address;
    } else {
      ruleForm.address?.push(address);
    }
  }

  ruleFormAddress.value = {
    unique_id: "",
    contact_id: null,
    contact_version: 0,
    contact_name: "",
    address_name: "",
    street: "",
    village_id: "",
    village: "",
    city: "",
    regency: "",
    province: "",
    country: "",
    created_at: 0,
    created_by: 0,
    updated_at: 0,
    version: 0,
    phone: "",
  };
  dialogNewAddress.value = false;
};

watch(
  () => props.data,
  (newValue) => {
    ruleForm.name = newValue?.name ?? "";
    ruleForm.email = newValue?.email ?? "";
    ruleForm.phone = newValue?.phone || "";
    ruleForm.tax_id = newValue?.tax_id || "";
    ruleForm.website = newValue?.website || "";
    ruleForm.title = newValue?.title || "";
    ruleForm.is_personal = newValue?.is_personal || false;
    ruleForm.is_company = newValue?.is_company || false;
    if (newValue?.tags) {
      ruleForm.tags = newValue?.tags.split(",") as string[];
    }
    ruleForm.unique_id = newValue?.unique_id || "";
    ruleForm.address = newValue?.address || [];
    ruleForm.parent_id = newValue?.parent_id ?? "";
    ruleForm.parent_name = newValue?.parent?.name ?? "";
    ruleForm.children = newValue?.children || [];

    console.log("masuk watch", newValue);
  },
  { immediate: true }
);
</script>
