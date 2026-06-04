<template>
  <el-card :class="`my-3 ${isMobile ? '' : 'w-1/2'}`" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="text-lg font-bold">Pengaturan Default</span>
      </div>
    </template>

    <el-card class="my-3" shadow="never" v-if="currentSettings.company">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-bold">Pengaturan Saat Ini</span>
        </div>
      </template>

      <div class="flex flex-col">
        <div>
          <h4 class="el-text font-bold">Default Company</h4>
          <div class="flex items-center">
            <el-icon class="mr-2 text-blue-500"><OfficeBuilding /></el-icon>
            <span class="text-md">{{
              currentSettings.company?.name || "-"
            }}</span>
          </div>
        </div>

        <div>
          <h4 class="el-text font-bold">Default Alamat</h4>
          <div class="flex items-start">
            <el-icon class="mr-2 text-green-500 mt-1"><Location /></el-icon>
            <div>
              <div class="el-text el-text--large font-bold">
                {{ currentSettings.address?.address_name || "-" }}
              </div>
              <div
                class="el-text el-text--default"
                v-if="currentSettings.address"
              >
                {{ generateAddressText(currentSettings.address!) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="space-y-6">
      <!-- Default Company Selection -->
      <div class="setting-item el-card el-card__body">
        <div class="flex items-center justify-between mb-4">
          <div class="">
            <div class="el-text el-text--large font-bold">Default Company</div>
            <div class="el-text">
              Pilih perusahaan default yang akan digunakan dalam transaksi
            </div>
          </div>
          <el-button type="primary" size="default" @click="drawerContact = true"
            >Tambah Perusahaan</el-button
          >
        </div>

        <el-autocomplete
          :fetch-suggestions="querySearchContact"
          v-model="selectedCompany"
          placeholder="Cari Kontak"
          @select="(item: Record<string, any>) => handleSelectCompany(item)"
        />

        <!-- <el-select
            v-model="selectedCompany"
            placeholder="Pilih perusahaan"
            size="default"
            class="w-full"
            filterable
            clearable
          >
            <el-option
              v-for="company in companies"
              :key="company.unique_id"
              :label="company.name"
              :value="company.unique_id"
            >
              <div class="flex items-center">
                <span class="mr-2">{{ company.name }}</span>
                <el-tag v-if="company.is_default" size="small" type="success" effect="plain">
                  Default
                </el-tag>
              </div>
            </el-option>
          </el-select> -->
      </div>

      <!-- Default Address Selection -->
      <div class="setting-item el-card el-card__body">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="el-text el-text--large font-bold">Default Alamat</div>
            <p class="el-text el-text--default">
              Pilih alamat default untuk pengiriman dan penagihan
            </p>
          </div>
          <el-button
            type="primary"
            size="default"
            :disabled="currentSettings.company === null"
            @click="dialogAddAddress = true"
            >Tambah Alamat</el-button
          >
        </div>

        <el-autocomplete
          v-model="selectedAddress"
          :fetch-suggestions="querySearchAddress"
          clearable
          class="w-50"
          placeholder="Please Input"
          @select="handleSelectAddress"
          :disabled="currentSettings.company === null"
        >
          <template #default="{ item }">
            <div class="value">{{ item.name }}</div>
            <span class="link">{{ item.value }}</span>
          </template>
        </el-autocomplete>

        <div v-if="!selectedCompany" class="mt-2">
          <el-alert
            title="Pilih perusahaan terlebih dahulu"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4">
        <el-button
          type="primary"
          @click="saveSetting"
          :loading="loading"
          :disabled="!selectedCompany"
        >
          Simpan Pengaturan
        </el-button>
        <el-button @click="resetForm"> Reset </el-button>
      </div>
    </div>
  </el-card>

  <!-- Current Settings Summary -->

  <!-- Success Dialog -->
  <el-dialog
    v-model="showSuccessDialog"
    title="Berhasil"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="text-center">
      <el-icon size="48" color="#67C23A" class="mb-3">
        <CircleCheck />
      </el-icon>
      <p class="text-lg font-medium mb-2">Pengaturan berhasil disimpan</p>
      <p class="text-gray-500">
        Pengaturan default company dan alamat telah diperbarui.
      </p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSuccessClose"> Oke </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="dialogAddAddress"
    title="Tambah Alamat"
    width="800"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <FormAddress
      v-on:success="onAddressAdded"
      :onSetInitital="{
        contact_id: currentSettings.company?.unique_id ?? '',
        contaact_name: currentSettings.company?.name ?? '',
      }"
      v-on:back="() => (dialogAddAddress = false)"
    />
  </el-dialog>

  <el-drawer
    v-model="drawerContact"
    title="Tambah Perusahaan"
    :with-header="false"
    :direction="drawerDirection"
  >
    <AddContact
      :data="tempCompany"
      :loading="loading"
      v-on:submit="(data) => onAddCompany(data!)"
    />
  </el-drawer>

  <el-dialog v-model="dialogReset" title="Warning" width="500" center>
    <span> Apakah Anda Yakin Ingin Reset Pengaturan Awal? </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogReset = false">Cancel</el-button>
        <el-button type="primary" @click="resetSetting"> Reset </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { CircleCheck, OfficeBuilding, Location } from "@element-plus/icons-vue";
import type { AddressType } from "~/types/address";
import type { Contact } from "~/types/contact";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import AddContact from "~/components/trums/AddContact.vue";
import type { BaseResponse } from "~/types/response";
import FormAddress from "~/components/trums/FormAddress.vue";
import { unique } from "element-plus/es/utils/arrays.mjs";
import type { DrawerProps } from "element-plus";

const router = useRouter();
const { isMobile } = useDevice();

const loading = ref<boolean>(false);
const showSuccessDialog = ref<boolean>(false);
const drawerContact = ref<boolean>(false);
const dialogAddAddress = ref<boolean>(false);
const dialogReset = ref<boolean>(false);

const drawerDirection = ref<DrawerProps["direction"]>(isMobile ? "btt" : "rtl");

// Data states
const selectedCompany = ref<string>("");
const selectedAddress = ref<string>("");
const companies = ref<Contact[]>([]);
const addresses = ref<AddressType[]>([]);
const currentSettings = ref<{
  company: Contact | null;
  address: AddressType | null;
}>({
  company: null,
  address: null,
});

const props = defineProps<{
  onSaveSetting: () => void;
}>();

const tempCompany = ref<Contact>({
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

const request_search_companies = ref<RequestSearch>({
  keyword: "",
  table: "contacts",
  column: [
    {
      is_company: true,
      ownership: true,
    },
  ],
  flag: "form",
  limit: "10",
  offset: "1",
  sort: null,
});

const request_search_address = ref<RequestSearch>({
  keyword: "",
  table: "address",
  column: [
    {
      is_company: [1],
    },
  ],
  limit: "10",
  offset: "1",
  sort: null,
});

// Methods
const goBack = () => router.back();

const generateAddressLabel = (address: AddressType) => {
  return `${address.contact_name || address.address_name} - ${
    address.village
  }, ${address.city}`;
};

const generateAddressText = (address: AddressType) => {
  console.log("address", address.codepos);
  return `${address.street}, ${address.village}, ${address.city}, ${address.regency}, ${address.codepos}`;
};

const resetSetting = () => {
  currentSettings.value.address = null;
  currentSettings.value.company = null;

  selectedAddress.value = "";
  selectedCompany.value = "";
  localStorage.removeItem("setting");
  ElMessage.success("Pengaturan Telah Di Reset!");
  dialogReset.value = false;
};

const onAddCompany = async (data: Contact) => {
  loading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<Contact>>(
      "/contact-create",
      {
        method: "POST",
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          tax_id: data.tax_id,
          website: data.website,
          title: data.title,
          is_personal: data.is_personal,
          is_company: data.is_company,
          tags: data.tags?.toString(),
          unique_id: data.unique_id,
          ownership: data.ownership,
        },
      }
    );

    if (response.success) {
      const company: Contact = response.data as Contact;
      selectedCompany.value = company.name;
      currentSettings.value.company = company;
      drawerContact.value = false;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const onAddressAdded = (data: AddressType) => {
  const address: AddressType = data as AddressType;
  selectedAddress.value = address.address_name;
  currentSettings.value.address = address;
  dialogAddAddress.value = false;
};

const handleSelectCompany = (item: Record<string, any>) => {
  const company: Contact = item as Contact;
  selectedCompany.value = company.name;
  currentSettings.value.company = company;
};

const handleSelectAddress = (item: any) => {
  const address: AddressType = item.address as AddressType;
  selectedAddress.value = address.address_name;
  currentSettings.value.address = address;
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  request_search_companies.value.keyword = queryString;
  useApiFetch<ResponsePagination<Contact[]>>("/search", {
    method: "post",
    body: request_search_companies.value,
  }).then((response) => {
    if (response.success) {
      const resultApi: Contact[] = response.data ?? [];
      if (resultApi.length > 0) {
        const results = resultApi.map((data: Contact) => {
          return { ...data, value: `${data.name}` };
        });
        cb(results);
      } else {
        cb([
          {
            value: `Tambahkan ${queryString}`,
            isNew: true,
            query: queryString,
            label: `Tambahkan ${queryString}`,
          },
        ]);
      }
    }
  });
};

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
  const newSearch: RequestSearch = {
    keyword: queryString,
    table: "address",
    column: [
      {
        contact_id: [currentSettings?.value?.company?.unique_id],
      },
    ],
    limit: "10",
    offset: "1",
    flag: "form",
    sort: null,
  };

  useFetchApi<ResponsePagination<AddressType[]>>(
    "/search",
    "address",
    "post",
    newSearch
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressType[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb(
          resultApi.map((value) => {
            const result = generateResultSearchAddress(value);
            console.log("result", result);
            return result;
          })
        );
      } else {
        cb([
          {
            value: `Buat Alamat Baru`,
            new: true,
            name: `Buat Alamat Baru`,
            street: "",
          },
        ]);
      }
    }
  });
};
const generateResultSearchAddress = (address: AddressType | null) => {
  console.log("address", address);
  if (address) {
    const name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.province}, ${address.codepos}`;
    const street = `${address.street}`;
    const address_id = address.unique_id;
    const address_version = address.version;
    return {
      value: generateAddressView(address),
      name: address.address_name,
      street: street,
      address_id: address_id,
      address_version: address.version,
      address: address,
    };
  } else {
    return {
      value: "",
      name: "",
      street: "",
      address_id: "",
      address_version: 0,
      address: null,
    };
  }
};
const createFilter = (queryString: string) => {
  return (restaurant: AddressType) => {
    console.log("data", restaurant);
    return (
      restaurant.address_name
        .toLowerCase()
        .indexOf(queryString.toLowerCase()) === 0
    );
  };
};

// const loadCurrentSettings = async () => {
//   try {
//     const { data } = await useFetchApi<BaseResponse<{
//       company: Company
//       address: Address
//     }>>('/settings/defaults', 'get-settings', 'get', null)

//     if (data.value?.data) {
//       currentSettings.value = data.value.data
//       selectedCompany.value = data.value.data.company?.unique_id || ''
//       selectedAddress.value = data.value.data.address?.unique_id || ''

//       // Load addresses if company is selected
//       if (selectedCompany.value) {
//         await loadAddresses(selectedCompany.value)
//       }
//     }
//   } catch (error) {
//     console.error('Gagal memuat pengaturan saat ini')
//   }
// }

// const saveSettings = async () => {
//   if (!selectedCompany.value) {
//     ElMessage.warning('Pilih perusahaan terlebih dahulu')
//     return
//   }

//   loading.value = true
//   try {
//     const settingsData = {
//       default_company_id: selectedCompany.value,
//       default_address_id: selectedAddress.value
//     }

//     await useFetchApi<BaseResponse<any>>('/settings/defaults', 'save-settings', 'post', settingsData)

//     // Update current settings
//     const selectedCompanyObj = companies.value.find(c => c.unique_id === selectedCompany.value)
//     const selectedAddressObj = addresses.value.find(a => a.unique_id === selectedAddress.value)

//     currentSettings.value = {
//       company: selectedCompanyObj || null,
//       address: selectedAddressObj || null
//     }

//     showSuccessDialog.value = true

//   } catch (error: any) {
//     ElMessage.error('Gagal menyimpan pengaturan: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'))
//   } finally {
//     loading.value = false
//   }
// }

const saveSetting = () => {
  loading.value = true;
  try {
    localStorage.setItem("setting", JSON.stringify(currentSettings.value));
    ElMessage.success("Berhasil Menyimpan Pengaturan");
    props.onSaveSetting();
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  dialogReset.value = true;
};

const handleSuccessClose = () => {
  showSuccessDialog.value = false;
};

const getCompanyDetail = async (unique_id: string) => {
  loading.value = false;
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      `/contact-read/${unique_id}?flag=form`,
      "detail-contact",
      "get",
      null
    );
    if (response.status.value == "success") {
      const company: Contact | null = response.data.value?.data ?? null;
      currentSettings.value.company = company;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

// Load initial data
onMounted(async () => {
  const storage = localStorage.getItem("setting");
  if (storage) {
    const currentSetting = JSON.parse(storage);
    const company: Contact = currentSetting.company as Contact;

    await getCompanyDetail(company.unique_id);

    const address: AddressType = currentSetting.address as AddressType;
    currentSettings.value.address = address;

    selectedCompany.value = company.name;
    selectedAddress.value = address.address_name;

    console.log("setting", currentSetting);
  }
});
</script>

<style scoped>
.setting-item {
  padding: 20px;
  /* border: 1px solid #e4e7ed; */
  border-radius: 6px;
  /* background-color: #fafafa; */
}

:deep(.el-select .el-select__tags) {
  max-width: 100%;
}
</style>
