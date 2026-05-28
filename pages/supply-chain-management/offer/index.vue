<script lang="tsx" setup>
import {
  ElButton,
  ElCheckbox,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type FormRules,
  type SortBy,
  type UploadUserFile,
} from "element-plus";
import type { FunctionalComponent } from "vue";
import type { Pricelist } from "~/types/pricelist";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Catalogue } from "~/types/catalogue";
import {
  Filter,
  Eleme,
  ArrowDown,
  Setting as IconSetting,
} from "@element-plus/icons-vue";
import { NuxtLink } from "#components";
import { InfoFilled, SetUp } from "@element-plus/icons-vue";
import type { Pricetag, StatisticPricetag } from "~/types/pricetag";
import type { Contact } from "~/types/contact";
import type { AddressType } from "~/types/address";
import { canAccess, useCookie } from "#imports";
import ImportCreateOffer from "~/pages/sales/offer/components/ImportCreateOffer.vue";
import OfferTable from "~/pages/sales/offer/components/OfferTable.vue";
import CustomTableElement from "~/components/trums/table/CustomTableElement.vue";
import Setting from "~/pages/initial/setting.vue";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Penawaran Dari vendor",
});

const router = useRouter();
const loading = ref<boolean>(false);
const importModalVisible = ref(false);

const ruleForm = reactive<Pricetag>({
  code: "",
  unique_id: "",
  name: "",
  location_id: "",
  start_date: Date.now(),
  end_date: Date.now(),
  start_date_view: "",
  end_date_view: "",
  owner_id: "",
  created_at: 0,
  created_by: "",
  updated_at: 0,
  version: 0,
  type: "in",
  note: "",
  subject: "",
  pricetag_item: [
    {
      catalogue: {
        id: null,
        unique_id: null,
        unique_code: null,
        name: "",

        brand_id: null,
        brand_name: null,
        year: null,
        sn: null,
        description: null,
        berat: null,
        volume: null,
        length: null,
        width: null,
        height: null,
        is_asset: null,
        tmp_asset: null,
        version: null,
        type: "",
        created_at: null,
        created_by: null,
        updated_at: null,
        file_catalogues: [],
      },
      unique_id: null,
      tag_id: null,
      catalogue_id: "",
      inventory_id: "",
      inventory: null,
      price: 0,
      is_new: true,
      unit_id: "",
      unit_name: "",
      unit_version: 0,
      checked: false,
      quantity: 1,
      fileUploads: [],
    },
  ],

  location: {
    id: null,
    unique_id: null,
    unique_code: null,
    name: "",
    brand_id: null,
    brand_name: null,
    year: null,
    sn: null,
    description: null,
    berat: null,
    volume: null,
    length: null,
    width: null,
    height: null,
    is_asset: null,
    tmp_asset: null,
    version: null,
    type: "",
    created_at: null,
    created_by: null,
    updated_at: null,
    file_catalogues: [],
    checked: undefined,
  },
  pricetag_condition: [],
  reference: null,
  reference_version: null,
  reference_id: null,
  to_id: "",
  to_name: "",
  files: [],
  pic_id: "",
  pic_name: "",
  pic_version: 0,
  fileUploads: [],
});

const excelFile = ref<UploadUserFile | null>(null);

const rules = reactive<FormRules>({
  code: [
    {
      required: true,
      message: "Nomor Penawaran Tidak Boleh Kosong!",
      trigger: "blur",
    },
  ],
  owner_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],
  to_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],

  start_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Mulai Tidak Boleh Kosong!",
      trigger: "change",
    },
  ],

  pricetag_item: {
    type: "array",
    required: true,
    min: 1,
    message: "Item Tidak Boleh Kosong!",
    trigger: "change",
  },
});

const popoverRef = ref();
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: ["in"],
      category: ["penawaran"],
    },
  ],
  limit: "10",
  offset: "1",
  table: "pricetag",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.pricetag,
  type: "in",
});

const statistic = await useFetchApi<ResponsePagination<StatisticPricetag>>(
  `/statistic`,
  "get-pricetag-statistic",
  "post",
  request_statistic.value
);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Pricetag[]>>(
      `/search`,
      "Pricetag-to-vendor",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<Pricetag[]>;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

const locations = ref<Catalogue[]>([]);
const idsSelected = ref<string[]>([]);

const { data } = await useFetchApi<ResponsePagination<Pricetag[]>>(
  `/search`,
  "Pricetag-to-vendor",
  "post",
  request_search.value
);

const fetchLocation = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      "location",
      "post",
      {
        keyword: "",
        column: [
          {
            type: ["place"],
          },
        ],
        limit: "10",
        offset: "1",
        table: "catalogues",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      locations.value = (
        response.data.value as ResponsePagination<Catalogue[]>
      ).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => request_search.value,
  () => refereshTrigger.value++,
  { deep: true }
);
type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <ElCheckbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  );
};

const handleDelete = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      `/pricetag-delete`,
      "pricelist",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("Pricetag");
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const handleEdit = (data: Pricetag) => {
  const cookie = useCookie("tag_id");
  cookie.value = data.unique_id;

  router.push("/sales/offer/add");
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  request_search.value = data;
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const checkSelect = () => {
  console.log("check");
  return data?.value?.data.some((row) => row.checked);
};

const deleteBulk = () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  handleDelete(checkeds?.map((value) => value.unique_id) ?? []);
};

const openImportModal = () => {
  importModalVisible.value = true;
};

const closeImportModal = () => {
  importModalVisible.value = false;
};
const submitImport = async () => {
  console.log(excelFile.value);

  if (!excelFile.value) {
    ElMessage.warning("File Excel wajib diupload");
    return;
  }
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", `${ruleForm.unique_id}`);
    formData.append("name", `${ruleForm.code}`);
    formData.append("location_id", `${ruleForm.location_id}`);
    formData.append("start_date", `${ruleForm.start_date / 1000}`);
    formData.append("end_date", `${ruleForm.end_date / 1000}`);
    formData.append("owner_id", `${ruleForm.owner_id}`);
    formData.append("reference", `${ruleForm.reference}`);
    formData.append("reference_id", `${ruleForm.reference_id}`);
    formData.append("reference_version", `${ruleForm.reference_version}`);
    formData.append("type", `${ruleForm.type}`);
    formData.append("subject", `${ruleForm.subject}`);
    formData.append("note", `${ruleForm.note}`);
    formData.append("to_id", `${ruleForm.to_id}`);
    formData.append("to_version", `${ruleForm.to_version}`);
    formData.append("category", `penawaran`);
    formData.append("pic_id", `${ruleForm.pic_id}`);
    formData.append("pic_name", `${ruleForm.pic_name}`);
    formData.append("pic_version", `${ruleForm.pic_version}`);

    formData.append("excel", excelFile.value.raw as Blob);

    (ruleForm.fileUploads ?? []).forEach((file, index) => {
      if (file.raw) {
        formData.append(`files[${index}]`, file.raw);
      }
    });

    const response = await useFetchApi(
      "/import-penawaran",
      "import-penawaran",
      "post",
      formData
    );
    if (response.status.value == "success") {
      refreshNuxtData("Pricetag-to-vendor");
      importModalVisible.value = false;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const refereshTrigger = ref<number>(0);
const onReferesh = () => refereshTrigger.value++;

onMounted(() => {
  fetchLocation();
});
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="16">
      <el-col :span="12">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_pricetag || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Data
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_vendor || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Vendor
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mb-3 gap-2">
      <el-col :xs="24" :sm="12" :md="12">
        <TrumsCustomGrid class="">
          <TrumsCustomLinkButton
            v-if="canAccess('pricetag-create', data?.privilege ?? [])"
            url="/supply-chain-management/offer/add"
            @click="
              () => {
                const cookie = useCookie('tag_id');
                cookie.value = null;
              }
            "
            type="primary"
            >Buat Penawaran</TrumsCustomLinkButton
          >
          <TrumsCustomButton
            :icon="Eleme"
            :loading="loading"
            :disabled="loading"
            type="default"
            v-on:click="onReferesh"
            >Reload</TrumsCustomButton
          >
          <TrumsCustomButton
            :loading="loading"
            :disabled="loading"
            type="success"
            v-on:click="openImportModal"
            >Import</TrumsCustomButton
          >
          <el-popconfirm
            width="220"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Apakah Anda Yakin Ingin Menghapus Data ini?"
            @cancel="() => {}"
          >
            <template #reference>
              <TrumsCustomButton
                :loading="loading"
                :disabled="idsSelected.length == 0"
                type="danger"
                v-on:click="openImportModal"
                >Hapus</TrumsCustomButton
              >
            </template>
            <template #actions="{ confirm, cancel }">
              <el-button size="small" @click="cancel">Batal</el-button>
              <el-button type="danger" size="small" @click="deleteBulk">
                Hapus
              </el-button>
            </template>
          </el-popconfirm>
        </TrumsCustomGrid>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6"
        ><el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Type to search"
      /></el-col>
    </el-row>
    <OfferTable
      ref="childRef"
      :request_search="request_search"
      :refresh_trigger="refereshTrigger"
      :fetch-key="'get-offer-from-vendor'"
      v-on:has-bulk="(value) => (idsSelected = value)"
      type="in"
    />

    <el-dialog
      v-model="importModalVisible"
      title="Import Penawaran"
      width="700px"
      destroy-on-close
    >
      <ImportCreateOffer
        ref="importModalRef"
        :onLoading="loading"
        :model-form="ruleForm"
        :rules-form="rules"
        :excel-file="excelFile"
        @update:form="(val) => Object.assign(ruleForm, val)"
        @update:excel="(file) => (excelFile = file)"
      />

      <template #footer>
        <NuxtLink
          :href="`http://tools.trumecs.com/template-penawaran.xlsx`"
          class="el-button el-button--success el-button--default"
        >
          Download Template
        </NuxtLink>
        <el-button @click="closeImportModal">Batal</el-button>
        <el-button type="primary" :loading="loading" @click="submitImport">
          Import
        </el-button>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}
</style>
