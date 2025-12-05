<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ mode }} Contact </span>
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
        <el-form-item label="Name" prop="name">
          <el-input v-model="ruleForm.name" placeholder="Nama" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="ruleForm.email" placeholder="Email" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="ruleForm.phone" placeholder="Phone" />
        </el-form-item>
        <el-form-item label="NPWP" prop="tax_id">
          <el-input v-model="ruleForm.tax_id" placeholder="NPWP" />
        </el-form-item>
        <el-form-item label="Website" prop="website">
          <el-input v-model="ruleForm.website" placeholder="Website" />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="ruleForm.title" placeholder="Title" />
        </el-form-item>
        <el-form-item label="Tipe">
          <el-checkbox v-model="ruleForm.is_personal" label="Personal" border />
          <el-checkbox
            v-model="ruleForm.is_company!"
            label="Perusahaan"
            border
          />
        </el-form-item>
        <el-form-item label="Ownership?">
          <el-switch v-model="ruleForm.ownership" />
        </el-form-item>
        <el-form-item label="Tags" prop="tags">
          <el-input-tag
            v-model="ruleForm.tags"
            :max="3"
            clearable
            placeholder="enter up to 3 tags"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-start align-center">
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            Simpan
          </el-button>
          <el-button type="info" plain @click="resetForm(ruleFormRef)"
            >Reset</el-button
          >
        </div>
      </template>
    </el-card>

    <el-card shadow="never" class="mt-3">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <span>Alamat</span> 
          <el-button type="primary" @click="() => dialogNewAddress = true" :icon="Plus">Buat Alamat Baru</el-button>
        </div>
      </template>
      <el-table :data="ruleForm?.address ?? []" border>
        <el-table-column prop="address_name" label="Nama Alamat" />
        <el-table-column prop="street" label="Jalan" />
        <el-table-column prop="city" label="Kecamatan" />
        <el-table-column prop="regency" label="Kota" />
        <el-table-column prop="province" label="Provinsi" />
        <el-table-column prop="codepos" label="Kode Pos" />
        <el-table-column prop="country" label="Negara" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogNewAddress" title="Buat Alamat Baru" width="500">
      <el-form 
      :model="ruleFormAddress" 
      ref="ruleFormRefAddress"
      :rules="rulesAddress"
      label-width="auto">
      
          <el-form-item label="Nama/Label Alamat" prop="address_name">
              <el-input v-model="ruleFormAddress.address_name" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="Alamat" prop="address">
              <el-autocomplete
                  v-model="ruleFormAddress.address"
                  :fetch-suggestions="querySearchGeolocation"
                  :trigger-on-focus="false"
                  clearable
                  class="inline-input w-50"
                  placeholder="Cari Kelurahan/Desa, Kecamatan, Kabupaten/Kota atau provinsi"
                  @select="handleSelectGeoLocation"
              />
          </el-form-item>
          <el-form-item label="Detail Alamat" prop="street">
              <el-input v-model="ruleFormAddress.street" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="Kode Pos" prop="codepos">
              <el-input v-model="ruleFormAddress.codepos" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="Latitude" prop="lat">
              <el-input v-model="ruleFormAddress.lat" autocomplete="off"/>
          </el-form-item>
          <el-form-item label="Longitude" prop="lng">
              <el-input v-model="ruleFormAddress.lng" autocomplete="off"/>
          </el-form-item>
          
      </el-form>
      <template #footer>
          <div class="dialog-footer">
              <el-button @click="dialogNewAddress = false">Batal</el-button>
              <el-button type="primary" @click="() => submitFormAddress(ruleFormRefAddress)">
              Simpan
              </el-button>
          </div>
      </template>
  </el-dialog>
  </TrumsWrapper>
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
import type { AddressSearch } from "~/types/address";
import type { ResponsePagination } from "~/types/response_pagination";
import { Search, Plus } from "@element-plus/icons-vue";
import { useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const dialogNewAddress = ref<boolean>(false);

const mode = toPascalCase(`${route.query.mode}`);

const goBack = () => router.back();
const unique_id = route.query.unique_id;
const is_company = route.query.company != undefined ? Boolean(route.query.company) : false;
const ownership = route.query.ownership != undefined ? Boolean(route.query.ownership) : false;

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
  address: formAddress[]
}

interface formAddress {
    unique_id?: string,
    contact_id?: string,
    contact_name?: string,
    contact_version?: number,
    address_id?: string,
    address_name?: string,
    address?: string,
    street?: string,
    village_id?: string,
    village?: string,
    city?: string,
    regency?: string,
    codepos?: string,
    province?: string,
    country?: string,
    lat?: string,
    lng?: string,
    
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
});

const rules = reactive<FormRules<RuleForm>>({
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
      min: 11,
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

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const api = useApi();
const loading = ref<boolean>(false);

const ruleFormRefAddress = ref<FormInstance>();
const ruleFormAddress = reactive<formAddress>({});

const rulesAddress = reactive<FormRules<formAddress>>({
    address_name: [{ required: true, message: "Masukan Nama/Label Alamat", trigger: "blur" }],
    street: [{ required: true, message: "Masukan Detail", trigger: "blur" }],
    codepos: [{ required: true, message: "Masukan Kode Pos", trigger: "blur" }],
    address: [{ required: true, message: "Masukan Alamant", trigger: "blur" }],
    village_id: [
        { required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" },
    ],
    village: [{ required: true, message: "Masukan Desa/Kelurahan", trigger: "blur" }],
    city: [{ required: true, message: "Masukan Kecamatan", trigger: "blur" }],
    regency: [{ required: true, message: "Masukan Kota/Kabupaten", trigger: "blur" }],
    province: [{ required: true, message: "Masukan Provinsi", trigger: "blur" }],
    lat: [{ required: true, message: "Masukan Latitude", trigger: "blur" }],
    lng: [{ required: true, message: "Masukan Longitude", trigger: "blur" }],
    
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



const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    const response = await api.post("/contact-create", {
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
      address: ruleForm.address.map((value) => ({
            "address_name": value.address_name,
            "street": value.street,
            "village_id": value.village_id,
            "village": value.village,
            "city": value.city,
            "regency": value.regency,
            "province": value.province,
            "country": "indonesia",
            "codepos": parseInt(value.codepos ?? '0'),
            "lat": value.lat,
            "lng": value.lng
      }))
    });
    if (response.status == 201) {
      if (unique_id == null) {
        ElMessage.success(`Berhasil Menambahkan contact`);
      } else {
        ElMessage.success(`Berhasil Mengedit contact`);
      }
      goBack();
    }
  } catch (error: any) {
    if (unique_id !== null) {
      ElMessage.error(`${error.response?.data?.message}`);
    }
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

const querySearchGeolocation = (queryString: string, cb: (arg: any) => void) => {
        
    useFetchApi<ResponsePagination<AddressSearch[]>>('/search-indonesia', 'address', 'post', {keyword: queryString, limit: 500, offset: 1, flag: "form"}).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: AddressSearch[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                cb(resultApi.map((value) => ({ ...value, value: value.name })));
            }
        }
    })

}

const handleSelectGeoLocation = (record: Record<string, any>) => {
    if(record.new){
        dialogNewAddress.value = true;
    }else{
        console.log(record);
        const address: AddressSearch = record as AddressSearch;
        const names = address.name.split(', ');

        ruleFormAddress.village_id = address.id;
        ruleFormAddress.village = names[1];
        ruleFormAddress.city = names[2];
        ruleFormAddress.regency = names[3];
        ruleFormAddress.province = names[4];
    }
}

const submitFormAddress = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {

            const addressToSign: formAddress = {
              address_name: ruleFormAddress.address_name,
              street: ruleFormAddress.street,
              village_id: ruleFormAddress.village_id,
              village: ruleFormAddress.village,
              city: ruleFormAddress.city,
              regency: ruleFormAddress.regency,
              province: ruleFormAddress.province,
              country: ruleFormAddress.country,
              lat: ruleFormAddress.lat,
              lng: ruleFormAddress.lng,
              codepos: ruleFormAddress.codepos,
            }

            
            console.log(addressToSign);
            
            
            ruleForm.address.push(addressToSign)
            ruleFormRefAddress.value?.resetFields();
        } else {
            console.log('error submit!', fields)
        }
    })
}
const detail = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/contact-read/${unique_id}`);
    if (response.status == 200) {
      const contact: Contact = response.data.data;
      ruleForm.name = contact.name ?? "";
      ruleForm.email = contact.email ?? "";
      ruleForm.phone = contact.phone;
      ruleForm.tax_id = contact.tax_id;
      ruleForm.website = contact.website;
      ruleForm.title = contact.title;
      ruleForm.is_personal = contact.is_personal;
      ruleForm.is_company = contact.is_company;
      if(contact.tags){
        ruleForm.tags = contact.tags.split(",") as string[];
      }
      ruleForm.unique_id = contact.unique_id;
      ruleForm.address = contact.address.map((address) => ({
        unique_id: address.unique_id,
        contact_id: address.contact_id ?? '',
        contact_name: address.contact_name,
        contact_version: address.contact_version,
        address_id: address.unique_id,
        address_name: address.address_name,
        street: address.street,
        village_id: `${address.village_id ?? 0}`,
        village: address.village,
        city: address.city,
        regency: address.regency,
        codepos: `${address.codepos}`,
        province: address.province,
        country: 'indonesia',
      }));
    }
  } catch (error: any) {
    if (unique_id !== null) {
      ElMessage.error(`${error.response?.data?.message}`);
    }
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  
  if (unique_id !== null) {
    detail();
  }
});
</script>