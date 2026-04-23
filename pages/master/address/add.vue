<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">Buat Alamat baru</span>
      </template>
    </el-page-header>
    <!-- <el-card shadow="never" class="mt-6"> -->
    <FormAddress
      @set-initital="dataAddress"
      @success="submitAddress"
      class="mt-6"
    />
    <!-- <el-form 
                :disabled="loading"
                :model="ruleFormAddress" 
                ref="ruleFormRefAddress"
                :rules="rulesAddress"
                label-width="auto">
                <el-form-item label="Kontak" prop="contact_name">
                    <el-autocomplete
                        v-model="ruleFormAddress.contact_name"
                        :fetch-suggestions="querySearchContact"
                        :trigger-on-focus="false"
                        clearable
                        class="inline-input w-50"
                        placeholder="Cari Nama Kontak"
                        @select="handleSelectContact"
                    />
                </el-form-item>
                <el-form-item label="Nama/Label Alamat" prop="address_name">
                    <el-input v-model="ruleFormAddress.address_name" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="Alamat" prop="village">
                    <el-autocomplete
                        v-model="ruleFormAddress.address_view"
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
                
            </el-form>
            <template #footer>
                <div class="flex">
                    <el-button :disabled="loading" @click="() => {}">Batal</el-button>
                    <el-button :disabled="loading" type="primary" @click="() => submitFormAddress(ruleFormRefAddress)">
                    Simpan
                    </el-button>
                </div>
            </template> -->
    <!-- </el-card> -->
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import type { FormInstance, FormRules } from "element-plus";
import type { AddressSearch, AddressType } from "~/types/address";
import type { Contact } from "~/types/contact";
import type { RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import FormAddress from "~/components/trums/FormAddress.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "address-read",
  name: "Add New Address",
});

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);

const goBack = () => router.back();

const loading = ref<boolean>(false);
const dataAddress = ref<AddressType>({
  unique_id: "",
  contact_id: null,
  contact_version: 0,
  contact_name: "",
  address_name: "",
  street: "",
  village_id: 0,
  village: "",
  city: "",
  regency: "",
  province: "",
  country: "",
  created_at: 0,
  created_by: 0,
  updated_at: 0,
  version: 0,
});

// const onSubmitAddress = async (add) => {
//   console.log(ruleFormAddress);
//   const data = {
//     unique_id: ruleFormAddress.unique_id,
//     contact_id: ruleFormAddress.contact_id,
//     contact_name: ruleFormAddress.contact_name,
//     contact_version: ruleFormAddress.contact_version,
//     address_name: ruleFormAddress.address_name,
//     street: ruleFormAddress.street,
//     village_id: ruleFormAddress.village_id,
//     village: ruleFormAddress.village,
//     city: ruleFormAddress.city,
//     regency: ruleFormAddress.regency,
//     province: ruleFormAddress.province,
//     country: "indonesia",
//     lat: ruleFormAddress.lat,
//     lng: ruleFormAddress.lng,
//     codepos: parseInt(ruleFormAddress.codepos),
//   };

//   try {
//     const response = await useFetchApi<
//       ResponsePagination<BaseResponse<AddressType>>
//     >("/address-create", "address-create", "post", data);
//     if (response.status.value == "success") {
//       ElMessage.success("Berhasil!");
//       const address: AddressType | undefined = (
//         response.data.value?.data as unknown as BaseResponse<AddressType>
//       ).data;
//       // ruleFormRefAddress.value?.resetFields();
//       // ruleFormAddress.address_view = '';
//     }
//   } catch (error: any) {
//     ElMessage.success(error?.response?.messaage ?? error);
//   }
// };

const submitAddress = (address: AddressType) => {
  goBack();
};

const getDetail = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<AddressType>>(
      `/address-read/${id.value}`,
      "get-data-to-edit",
      "get",
      null
    );

    if (response.status.value === "success") {
      if (response.data.value?.data) {
        dataAddress.value = response.data.value.data;
      }
      //   Object.assign(ruleFormAddress, response.data);
      //   ruleFormAddress.address_view = `${addressType.village}, ${addressType.city}, ${addressType.regency}, ${addressType.province}`;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (id.value) {
    getDetail();
  }
});
</script>
