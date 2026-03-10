<template>
  <!-- FORM PENAWARAN -->
  <el-divider>Informasi Penawaran</el-divider>

  <!-- 🔽 FORM YANG KAMU KIRIM (TIDAK DIUBAH) -->
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="modelForm"
    :rules="rulesForm"
    label-width="auto"
    class="demo-ruleForm"
    :size="formSize"
    status-icon
    :disabled="onLoading"
  >
    <el-form-item
      prop="owner_name"
      v-if="modelForm.type == 'in'"
      label="Vendor"
    >
      <div class="flex items-center gap-3">
        <el-autocomplete
          v-model="modelForm.owner_name"
          :fetch-suggestions="querySearchVendors"
          placeholder="Cari vendor"
          @select="(item) => onHandleSelectVendor(item, 'vendor')"
          style="width: 100%"
        >
          <template #default="{ item }">
            <div v-if="item.isNew" class="flex items-center text-blue-500">
              <el-icon><Plus /></el-icon>
              <span class="ml-2">Tambahkan "{{ item.value }}"</span>
            </div>
            <div v-else>
              {{ item.value }}
            </div>
          </template>
        </el-autocomplete>
        <el-button
          type="primary"
          v-if="modelForm.owner_id"
          @click="() => openModalContact('vendor')"
          :icon="ElUserIcon"
        />
      </div>
    </el-form-item>
    <el-form-item label="Subject" prop="subject">
      <el-input v-model="modelForm.subject" placeholder="Masukan Subject" />
    </el-form-item>
    <el-form-item prop="to_name" label="Kepada" v-if="modelForm.type == 'out'">
      <div class="flex items-center gap-3">
        <el-autocomplete
          v-model="modelForm.to_name"
          :fetch-suggestions="querySearchVendors"
          placeholder="Cari Kontak"
          @select="(item) => onHandleSelectVendor(item, 'to')"
          style="width: 100%"
        >
          <template #default="{ item }">
            <div v-if="item.isNew" class="flex items-center text-blue-500">
              <el-icon><Plus /></el-icon>
              <span class="ml-2">Tambahkan "{{ item.value }}"</span>
            </div>
            <div v-else>
              {{ item.value }}
            </div>
          </template>
        </el-autocomplete>
        <el-button
          type="primary"
          v-if="modelForm.to_id"
          @click="() => openModalContact('customer')"
          :icon="ElUserIcon"
        />
      </div>
    </el-form-item>

    <el-form-item prop="pic_name" label="PIC">
      <div class="flex items-center gap-3">
        <el-autocomplete
          v-model="modelForm.pic_name"
          :fetch-suggestions="querySearchPIC"
          placeholder="Cari Kontak"
          @select="(item) => onHandleSelectVendor(item, 'pic')"
          style="width: 100%"
        >
          <template #default="{ item }">
            <div v-if="item.isNew" class="flex items-center text-blue-500">
              <el-icon><Plus /></el-icon>
              <span class="ml-2">Tambahkan "{{ item.value }}"</span>
            </div>
            <div v-else>
              {{ item.value }}
            </div>
          </template>
        </el-autocomplete>
        <el-button
          type="primary"
          v-if="modelForm.pic_id"
          @click="() => openModalContact('pic')"
          :icon="ElUserIcon"
        />
      </div>
    </el-form-item>

    <el-form-item prop="start_date" label="Tanggal Mulai Berlaku">
      <el-date-picker
        v-model="modelForm.start_date"
        type="date"
        aria-label="Pilih Tanggal"
        placeholder="Pilih Tanggal"
        style="width: 100%"
        ,
      />
    </el-form-item>
    <el-form-item prop="end_date" label="Tanggal Akhir Berlaku">
      <el-date-picker
        v-model="modelForm.end_date"
        type="date"
        aria-label="Pilih Tanggal"
        placeholder="Pilih Tanggal"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="File Lampiran" prop="files">
      <TrumsUploadFile v-model:file-list="modelForm.fileUploads!" />
    </el-form-item>
    <el-form-item label="Catatan" prop="note">
      <el-input
        v-model="modelForm.note"
        type="textarea"
        placeholder="Masukkan deskripsi"
      />
    </el-form-item>

    <!-- SECTION IMPORT EXCEL -->
    <el-divider>Import Penawaran dari Excel</el-divider>

    <el-form-item label="File Excel" required>
      <el-upload
        class="w-full"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xls,.xlsx"
        :on-change="onExcelChange"
        :on-remove="onExcelRemove"
      >
        <el-icon><UploadFilled /></el-icon>
        <div class="el-upload__text">
          Drop file Excel di sini atau <em>klik untuk upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-red-500">Hanya file .xls / .xlsx</div>
        </template>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script lang="tsx" setup>
import type {
  ComponentSize,
  FormInstance,
  FormRules,
  UploadFile,
  UploadUserFile,
} from "element-plus";
import type { Contact } from "~/types/contact";
import type { Pricetag } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import { User as ElUserIcon } from "@element-plus/icons-vue";
import type { BaseResponse } from "~/types/response";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";

const stateActiveTypeContat = ref<"vendor" | "customer" | "pic">("vendor");
const dialogContact = ref<boolean>(false);

const localLoading = ref<boolean>(false);

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const emit = defineEmits(["update:form", "update:excel", "update:fileList"]);

const excelModel = computed({
  get: () => props.excelFile,
  set: (val) => emit("update:excel", val),
});

const formModel = computed({
  get: () => props.modelForm,
  set: (val) => emit("update:form", val),
});

const props = defineProps<{
  modelForm: Pricetag;
  rulesForm: FormRules;
  excelFile: UploadUserFile | null;
  onLoading: boolean;
}>();

defineExpose({
  validate: async () => {
    if (!ruleFormRef.value) return false;
    return await ruleFormRef.value.validate();
  },
});

const createNewVendor = async (data: any) => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
  }
};

const onHandleSelectVendor = (item: any, type: "to" | "vendor" | "pic") => {
  if (item.isNew) {
    createNewVendor({ name: item.keyword }).then((customer: any) => {
      if (customer) {
        if (type == "vendor") {
          props.modelForm.owner_id = customer.unique_id;
          props.modelForm.owner_name = customer.name;
          props.modelForm.owner = customer;
        } else if (type == "pic") {
          props.modelForm.pic_id = customer.unique_id;
          props.modelForm.pic_name = customer.name;
          props.modelForm.pic_version = customer.version;
        } else {
          props.modelForm.to_id = customer.unique_id;
          props.modelForm.to_name = customer.name;
          props.modelForm.to_version = customer.version;
          props.modelForm.to = customer;
        }
      }
    });
  } else {
    const customer = item.data as Contact;
    if (type == "vendor") {
      props.modelForm.owner_id = customer.unique_id;
      props.modelForm.owner_name = customer.name;
      props.modelForm.owner = customer;
    } else if (type == "pic") {
      props.modelForm.pic_id = customer.unique_id;
      props.modelForm.pic_name = customer.name;
      props.modelForm.pic_version = customer.version;
    } else {
      props.modelForm.to_id = customer.unique_id;
      props.modelForm.to_name = customer.name;
      props.modelForm.to_version = customer.version;
      props.modelForm.to = customer;
    }
  }
};

const querySearchVendors = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            }))
          );
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};
const querySearchPIC = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [
        {
          parent_id: props.modelForm.to_id,
        },
      ],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            }))
          );
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};

const getDetailPIC = async () => {
  localLoading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<Contact | undefined>>(
      `/contact-read/${props.modelForm.pic_id}`,
      {
        method: "get",
      }
    );

    if (response.success) {
      props.modelForm.pic = response.data;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    localLoading.value = false;
  }
};

const openModalContact = async (type: "vendor" | "customer" | "pic") => {
  if (type == "pic") {
    await getDetailPIC();
  }
  stateActiveTypeContat.value = type;
  dialogContact.value = true;
};

const onExcelChange = (file: UploadFile) => {
  if (!file.raw) return;
  emit("update:excel", file);
};

const onExcelRemove = () => {
  emit("update:excel", null);
};
</script>
