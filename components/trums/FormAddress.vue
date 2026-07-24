<template>
  <el-card shadow="never">
    <el-form
      :model="ruleFormAddress"
      ref="ruleFormRefAddress"
      :rules="rulesAddress"
      label-width="auto"
    >
      <div class="flex gap-3">
        <el-form-item
          label=""
          v-if="!useTmp"
          class="flex-1"
          prop="contact_name"
        >
          <el-autocomplete
            v-model="ruleFormAddress.contact_name"
            :fetch-suggestions="querySearchContact"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari Nama Kontak"
            @select="handleSelectContact"
          >
            <template #suffix>
              <el-icon class="el-input__icon">
                <ArrowDown />
              </el-icon> </template
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="" class="flex-1" prop="address_name">
          <el-input
            v-model="ruleFormAddress.address_name"
            autocomplete="off"
            placeholder="Nama/Label Alamat"
          />
        </el-form-item>
        <el-form-item v-if="useTmp" label="" class="flex-1" prop="phone">
          <el-input
            v-model="ruleFormAddress.phone"
            autocomplete="off"
            placeholder="Nomor Telepon"
          />
        </el-form-item>
      </div>
      <div class="flex gap-3">
        <el-form label="Tipe" class="flex-1" style="width: 50%">
          <el-select
            v-model="ruleFormAddress.type"
            placeholder="Select"
            size="default"
            class="inline-input w-50"
          >
            <el-option
              v-for="item in [
                {
                  value: AddressLabel.DELIVERY,
                  label: 'Pengiriman',
                },
                {
                  value: AddressLabel.INVOICE,
                  label: 'Invoice',
                },
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form>
        <el-form-item label="" props="address_view" class="flex-1">
          <!-- <el-select
          v-model="ruleFormAddress.address_view"
          placeholder="Select"
          style="width: 240px"
        >
          <el-row :gutter="20">
            <el-col :span="6">
              <el-option
                v-for="item in cities"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            /></el-col>
          </el-row>
          <el-option
            v-for="item in cities"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span style="float: left">{{ item.label }}</span>
            <span
              style="
                float: right;
                color: var(--el-text-color-secondary);
                font-size: 13px;
              "
            >
              {{ item.value }}
            </span>
          </el-option>
        </el-select> -->

          <el-autocomplete
            v-model="ruleFormAddress.address_view"
            :fetch-suggestions="querySearchGeolocation"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Kelurahan/Desa, Kecamatan, Kabupaten/Kota atau provinsi"
            @select="handleSelectGeoLocation"
          >
            <template #suffix>
              <el-icon class="el-input__icon">
                <ArrowDown />
              </el-icon>
            </template>
          </el-autocomplete>
          <!-- <el-select
          v-model="ruleFormAddress.address_view"
          placeholder="Kelurahan/Desa, Kecamatan, Kabupaten/Kota atau provinsi"
          :clo
        >
          <el-option :label="''" :value="''">
            <el-tabs v-model="addressSelectTabActive" class="demo-tabs">
              <el-tab-pane label="Provinsi" name="provinsi">User</el-tab-pane>
              <el-tab-pane label="Kota" name="kota">Config</el-tab-pane>
              <el-tab-pane label="Kecamatan" name="kecamatan">Role</el-tab-pane>
              <el-tab-pane label="Kelurahan/Desa" name="kelurahan"
                >Task</el-tab-pane
              >
            </el-tabs>
          </el-option>
        </el-select> -->
        </el-form-item>
      </div>
      <el-form-item label="" prop="street">
        <el-input
          v-model="ruleFormAddress.street"
          autocomplete="off"
          type="textarea"
          placeholder="Nama Jalan, Gedung, Nomor Rumah"
        />
      </el-form-item>
      <el-form-item label="" prop="codepos">
        <el-input
          v-model="ruleFormAddress.codepos"
          autocomplete="off"
          placeholder="Kode Pos"
        />
      </el-form-item>
      <!-- <el-form-item label="Latitude" prop="lat">
        <el-input v-model="ruleFormAddress.lat" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Longitude" prop="lng">
        <el-input v-model="ruleFormAddress.lng" autocomplete="off" />
      </el-form-item> -->
    </el-form>
    <template #footer>
      <div class="flex">
        <el-button @click="resetFormAddress">Batal</el-button>
        <el-button
          type="primary"
          @click="() => submitFormAddress(ruleFormRefAddress)"
        >
          Simpan
        </el-button>
      </div>
    </template>
  </el-card>
</template>

<script lang="tsx" setup>
import { ArrowDown } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import {
  AddressLabel,
  type AddressSearch,
  type AddressType,
} from "~/types/address";
import type { Contact } from "~/types/contact";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";

const props = defineProps<{
  onSuccess?: (value: AddressType) => void;
  onBack?: () => void;
  onSetInitital?: Record<string, any>;
  useTmp?: boolean;
}>();

interface formAddress {
  unique_id?: string;
  contact_id?: string;
  contact_name?: string;
  phone: string;
  contact_version?: number;
  address_id?: string;
  address_name?: string;
  street?: string;
  village_id?: string;
  village?: string;
  city?: string;
  regency?: string;
  province?: string;
  country?: string;
  codepos?: string;
  lat?: string;
  lng?: string;
  type: AddressLabel;
  address_view?: string;
}

const getDefaultForm = (): formAddress => ({
  unique_id: undefined,
  contact_id: undefined,
  contact_name: undefined,
  contact_version: undefined,
  address_id: undefined,
  address_name: undefined,
  street: undefined,
  village_id: undefined,
  village: undefined,
  city: undefined,
  regency: undefined,
  province: undefined,
  country: undefined,
  codepos: undefined,
  lat: undefined,
  lng: undefined,
  address_view: undefined,
  type: AddressLabel.DELIVERY,
  phone: "",
});

const ruleFormAddress = reactive<formAddress>(getDefaultForm());
const ruleFormRefAddress = ref<FormInstance>();

const addressSelectTabActive = ref<string>("provinsi");

const rulesAddress = reactive<FormRules<formAddress>>({
  address_name: [
    { required: true, message: "Masukan Nama/Label Alamat", trigger: "blur" },
  ],
  street: [{ required: true, message: "Masukan Detail", trigger: "blur" }],
  village_id: [
    { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
  ],
  village: [
    { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
  ],
  city: [{ required: true, message: "Masukan Kecamatan", trigger: "blur" }],
  phone: [
    { required: true, message: "Masukan Nomor Telepon", trigger: "blur" },
  ],
  regency: [
    { required: true, message: "Masukan Kota/Kabupaten", trigger: "blur" },
  ],
  province: [{ required: true, message: "Masukan Provinsi", trigger: "blur" }],
});

const querySearchGeolocation = (
  queryString: string,
  cb: (arg: any) => void
) => {
  useFetchApi<ResponsePagination<AddressSearch[]>>(
    "/search-indonesia",
    "address",
    "post",
    { keyword: queryString, limit: 500, offset: 1 }
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressSearch[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb(resultApi.map((value) => ({ ...value, value: value.name })));
      }
    }
  });
};

const handleSelectGeoLocation = (record: Record<string, any>) => {
  const address: AddressSearch = record as AddressSearch;
  const names = address.name.split(", ");

  ruleFormAddress.village_id = address.id;
  ruleFormAddress.village = names[0];
  ruleFormAddress.city = names[1];
  ruleFormAddress.regency = names[2];
  ruleFormAddress.province = names[3];
};

const submitFormAddress = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (props.useTmp) {
        const data: AddressType = {
          contact_id: ruleFormAddress.contact_id || "",
          contact_name: ruleFormAddress.contact_name || "",
          contact_version: ruleFormAddress.contact_version || 0,
          address_name: ruleFormAddress.address_name || "",
          street: ruleFormAddress.street || "",
          village_id: ruleFormAddress.village_id || "",
          village: ruleFormAddress.village || "",
          city: ruleFormAddress.city || "",
          regency: ruleFormAddress.regency || "",
          province: ruleFormAddress.province || "",
          codepos: parseInt(ruleFormAddress.codepos ?? "0") || 0,
          country: "indonesia",
          unique_id:
            ruleFormAddress.unique_id ||
            `temp-${Math.random().toString(36).substring(2, 7)}`,
          created_at: 0,
          created_by: 0,
          updated_at: 0,
          phone: ruleFormAddress.phone,
          version: 0,
          tmp_address_view: ruleFormAddress.address_view,
        };

        props.onSuccess!(data);
        formEl.resetFields();
      } else {
        onSubmitAddress();
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};

const setInitital = (item: Record<string, any>) => {
  const allowedKeys: (keyof formAddress)[] = [
    "contact_id",
    "contact_name",
    "contact_version",
    "address_id",
    "address_name",
    "street",
    "village_id",
    "village",
    "city",
    "regency",
    "province",
    "country",
    "lat",
    "lng",
    "phone",
  ];

  for (const key of allowedKeys) {
    if (key in item) {
      ruleFormAddress[key] = item[key];
    }
  }
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  const data: RequestSearch = {
    table: "contacts",
    column: [],
    keyword: queryString,
    limit: "20",
    offset: "1",
    flag: "form",
    sort: null,
  };
  useFetchApi<ResponsePagination<Contact[]>>(
    "/search",
    "contacts",
    "post",
    data
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: Contact[] = response.data?.value?.data ?? [];

        const results = inventories.map((data: Contact) => {
          return { ...data, value: data.name };
        });
        cb(results);
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
};

const handleSelectContact = (record: Record<string, any>) => {
  console.log(record);
  const contact: Contact = record as Contact;

  ruleFormAddress.contact_id = contact.unique_id;
  ruleFormAddress.contact_name = contact.name;
  ruleFormAddress.contact_version = contact.version;
  ruleFormAddress.address_name = contact.name;
};

const onSubmitAddress = async () => {
  console.log(ruleFormAddress);
  const data = {
    contact_id: ruleFormAddress.contact_id,
    contact_name: ruleFormAddress.contact_name,
    contact_version: ruleFormAddress.contact_version,
    address_name: ruleFormAddress.address_name,
    street: ruleFormAddress.street,
    village_id: ruleFormAddress.village_id,
    village: ruleFormAddress.village,
    city: ruleFormAddress.city,
    type: ruleFormAddress.type,
    regency: ruleFormAddress.regency,
    province: ruleFormAddress.province,
    codepos: parseInt(ruleFormAddress.codepos ?? "0"),
    country: "indonesia",
    lat: ruleFormAddress.lat,
    lng: ruleFormAddress.lng,
    unique_id: ruleFormAddress.unique_id,
    flag: "form",
  };

  try {
    const response = await useFetchApi<
      ResponsePagination<BaseResponse<AddressType>>
    >("/address-create", "address-create", "post", data);
    if (response.status.value == "success") {
      ElMessage.success("Berhasil!");
      const address: AddressType = (
        response.data.value as unknown as BaseResponse<AddressType>
      ).data!;
      resetFormAddress();
      props.onSuccess!(address);
    }
  } catch (error: any) {
    ElMessage.success(error?.response?.messaage ?? error);
  }
};
const resetFormAddress = () => {
  Object.assign(ruleFormAddress, getDefaultForm());
  ruleFormRefAddress.value?.clearValidate();
};
watch(
  () => props.onSetInitital,
  (val) => {
    if (val) {
      Object.assign(ruleFormAddress, getDefaultForm(), val);
      console.log("props initial", props.onSetInitital);
    } else {
      resetFormAddress();
    }
  },
  { immediate: true }
);
</script>
