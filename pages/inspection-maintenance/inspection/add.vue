<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Inspection </span>
      </template>
    </el-page-header>
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
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        :disabled="loading"
        status-icon
      >
        <el-form-item label="Nama Inspeksi" prop="inspection_name">
          <el-input
            v-model="ruleForm.inspection_name"
            placeholder="Nama Inspeksi"
          />
        </el-form-item>
        <el-form-item label="Unit" prop="inventory_name">
          <el-autocomplete
            v-model="ruleForm.inventory_name"
            :fetch-suggestions="querySearchAsyncInventories"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari Unit Yang Akan Diinspeksi"
            @select="(record) => handleSelectInventoryInspection(record)"
          >
            <template #default="{ item }">
              <div
                class="name el-text el-text--primary"
                style="line-height: normal"
              >
                {{
                  (item.data as Inventory).name ??
                  (item.data as Inventory).catalogue?.name ??
                  ""
                }}
              </div>
              <span class="text-sm"
                >Lokasi:
                {{ (item.data as Inventory).location?.name ?? "-" }}</span
              >
              <span class="text-sm" style="line-height: normal"
                >SN:
                {{
                  (item.data as Inventory).sn ??
                  (item.data as Inventory).catalogue?.sn ??
                  "N/A"
                }}</span
              >
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Penanggung Jawab" prop="responsible_name">
          <div class="flex items-center gap-3">
            <el-autocomplete
              :fetch-suggestions="querySearchAsyncPic"
              v-model="ruleForm.responsible_name"
              placeholder="Cari Kontak"
              @select="(item: Record<string, any>) => onHandleSelectResponsible(item)"
            >
              <template #default="{ item }">
                <div v-if="item.isNew" class="flex items-center text-blue-500">
                  <el-icon><Search /></el-icon>
                  <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                </div>
                <div v-else class="flex flex-col items-start py-1 gap-1">
                  <div style="line-height: normal" class="">
                    {{ item.value || "-" }}
                  </div>
                  <span style="line-height: normal">
                    {{ item.data.email || "-" }}
                  </span>
                </div>
              </template>
            </el-autocomplete>
            <el-button
              type="primary"
              v-if="ruleForm.responsible"
              @click="openDialogResponsible"
              :icon="User"
            />
          </div>
        </el-form-item>
        <el-form-item label="Tanggal Inspeksi" prop="inspection_date">
          <el-date-picker
            v-model="ruleForm.inspection_date"
            type="date"
            placeholder="Tanggal Inspeksi"
          />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" placeholder="Pilih Status">
            <el-option label="DRAFT" value="draft" />
            <el-option label="PROGRESS" value="progress" />
            <el-option label="REPAIR" value="repair" />
            <el-option label="DONE" value="done" />
            <el-option label="CANCEL" value="cancel" />
          </el-select>
        </el-form-item>
        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>
        <el-form-item label="Kondisi" prop="condition">
          <el-input v-model="ruleForm.condition" type="textarea" />
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mb-3">
      <el-table :data="dataTable" border>
        <el-table-column prop="name" label="item">
          <template #default="scope">
            <el-autocomplete
              :disabled="loading"
              :fetch-suggestions="querySearchAsyncInventories"
              v-model="scope.row.name"
              placeholder="Please input"
              @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="pic" label="PIC">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <el-autocomplete
                :disabled="loading"
                :fetch-suggestions="querySearchAsyncPic"
                v-model="scope.row.pic_name"
                placeholder="Input PIC"
                popper-class="my-autocomplete"
                @select="(item: Record<string, any>) => onHandleSelectPICAutocomplete(item, scope)"
              >
                <template #default="{ item }">
                  <div
                    v-if="item.isNew"
                    class="flex items-center text-blue-500"
                  >
                    <el-icon><Search /></el-icon>
                    <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                  </div>
                  <div v-else class="flex flex-col items-start py-1 gap-1">
                    <div style="line-height: normal" class="">
                      {{ item.value || "-" }}
                    </div>
                    <span style="line-height: normal">
                      {{ item.data.email || "-" }}
                    </span>
                  </div>
                </template>
              </el-autocomplete>
              <el-button
                :icon="Edit"
                size="small"
                circle
                @click="() => editPic(scope.$index)"
              />
              <el-button
                :icon="Delete"
                type="danger"
                @click="() => deletePIC(scope.$index)"
                style="margin-left: 0px"
                size="small"
                circle
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Kondisi">
          <template #default="scope">
            <el-input
              :disabled="loading"
              :step="0.01"
              :min="0"
              v-model="scope.row.condition"
              placeholder="Masukan Kondisi"
            />
          </template>
        </el-table-column>
        <el-table-column label="Hapus" width="70">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="() => deleteItem(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLine">
        Tambahkan Baris Baru
      </el-button>
    </el-card>

    <el-dialog v-model="dialogContact" title="Detail Kontak">
      <AddContact
        ref="formFieldsRefContact"
        :contact-data="
          formContactState === 'responsible'
            ? ruleForm.responsible!
            : dataTable[indexFormContactActive].pic!
        "
        :loading="loading"
        @submit="handleSubmitContact"
        @reset="handleResetContact"
      />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inspection-create",
  name: "Create New Inspection",
});
interface RuleForm {
  unique_id: string;
  inspection_name: string;
  inspection_date: number;
  inspection_date_display: string;
  condition: string;
  status: string;
  inventory_name: string;
  inventory_id: string;
  inventory_version: number;
  responsible_id: string;
  responsible_version: number;
  responsible_name: string;
  responsible: Contact | null;
}

import { reactive, ref, onMounted } from "vue";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type UploadUserFile,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Catalogue } from "~/types/catalogue";
import type { People } from "~/types/people";
import type { Inventory } from "~/types/inventory";
import type { RequestSearch } from "~/types/request_search";
import type { Inspection, InspectionItem } from "~/types/inspection";
import type { AppFile } from "~/types/file";
import { Delete, UserFilled, Edit, User } from "@element-plus/icons-vue";
import type { BaseResponse } from "~/types/response";
import type { DefaultResponse } from "~/types/pagination";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Contact } from "~/types/contact";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import AddContact from "~/components/trums/AddContact.vue";

const router = useRouter();
const route = useRoute();

const goBack = () => router.back();

const id = computed(() => route.query.id as string);

const inspection = ref<Inspection>({
  id: 0,
  unique_id: "",
  unique_code: "",
  inspection_name: "",
  inspection_date: 0,
  condition: null,
  status: "draft",
  created_at: null,
  created_by: null,
  updated_at: null,
  inspection_item: [],
  inventory_id: "",
  inventory_version: 0,
  responsible_id: "",
  responsible_version: 0,
});
const loading = ref<boolean>();
const dialogContact = ref<boolean>(false);
const indexFormContactActive = ref<number>(-1);
const formFieldsRefContact = ref();
const formContactState = ref<"item" | "responsible">("responsible");

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
  column: [],
  sort: null,
  limit: "50",
  offset: "1",
});
const requestSearchContact = ref<RequestSearch>({
  keyword: "",
  table: "contacts",
  column: [],
  sort: null,
  limit: "50",
  offset: "1",
});

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  unique_id: "",
  inspection_name: "",
  inspection_date: 0,
  condition: "",
  status: "draft",
  inspection_date_display: "",
  inventory_name: "",
  inventory_id: "",
  inventory_version: 0,
  responsible_id: "",
  responsible_version: 0,
  responsible_name: "",
  responsible: null,
});

const fileList = ref<UploadUserFile[]>([]);

const dataTable = ref<
  {
    id: number;
    inventory_id: string;
    name: string;
    pic_id: string;
    pic: Contact | null;
    pic_name: string;
    condition: string;
    unique_id: string;
  }[]
>(
  Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    inventory_id: "",
    name: "",
    pic_id: "",
    pic_name: "",
    condition: "",
    unique_id: "",
    pic: null,
  }))
);

const addNewLine = () => {
  dataTable.value.push({
    id: dataTable.value.length + 1,
    inventory_id: "",
    name: "",
    pic: null,
    pic_id: "",
    pic_name: "",
    condition: "",
    unique_id: "",
  });
};

const deleteItem = async (index: number) => {
  try {
    const data = dataTable.value[index];
    if (data.unique_id) {
      const response = await useApiFetch<BaseResponse<any>>(
        "/inspection-item-delete",
        {
          method: "POST",
          body: [data.unique_id],
        }
      );

      if (response.success) {
        dataTable.value.splice(index, 1);
      }
    } else {
      dataTable.value.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};
const querySearchAsyncPic = (queryString: string, cb: (arg: any) => void) => {
  if (queryString != "") {
    requestSearchContact.value.keyword = queryString;
    useFetchApi<ResponsePagination<Contact[]>>(
      "/search",
      "search-contact",
      "post",
      requestSearchContact
    ).then((response) => {
      if (response.status.value === "success") {
        const resultApi: Contact[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: Contact) => {
            return { data: data, value: `${data.name}`, isNew: false };
          });
          cb([
            ...results,
            {
              value: queryString,
              isNew: true,
              query: queryString,
              label: queryString,
            },
          ]);
        } else {
          cb([
            {
              value: queryString,
              isNew: true,
              query: queryString,
              label: queryString,
            },
          ]);
        }
      }
    });
  }
};

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  try {
    requestSearch.value.keyword = queryString;
    useFetchApi<ResponsePagination<Inventory[]>>(
      "/search",
      "search-inspection-item",
      "post",
      requestSearch.value
    )
      .then((response) => {
        if (response.status.value === "success") {
          // console.log(response.data.data.q);
          const inventories: Inventory[] = response.data.value?.data ?? [];

          const results = inventories.map((data: Inventory) => {
            return {
              value: `${data.catalogue.name}-${data.location?.name}`,
              unique_id: data.unique_id,
              data: data,
            };
          });
          cb(results);
        } else {
          ElMessage.error(
            response.data.value?.message || "Gagal Mendapatkan Hasil Pencarian"
          );
        }
      })
      .catch((error: any) => {
        ElMessage.error(
          error.response?.message ??
            (error || "Gagal Mendapatkan Hasil Pencarian")
        );
      });
  } catch (error: any) {
    ElMessage.error(
      error.response?.message ?? (error || "Gagal Mendapatkan Hasil Pencarian")
    );
  }
};

const getAvatar = (file: AppFile | null): string | null => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  if (file != null) {
    return `${imageUrl}/${file.image_path}/${file.filename}`;
  } else {
    return null;
  }
};

const openDialogResponsible = () => {
  formContactState.value = "responsible";
  dialogContact.value = true;
};

const handleSubmitContact = async (formData: Contact) => {
  try {
    const contact: Contact | null = await createNewContact({
      parent_id: formData.parent_id,
      parent_version: formData.parent_version,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tax_id: formData.tax_id,
      website: formData.website,
      title: formData.title,
      is_personal: formData.is_personal,
      is_company: formData.is_company,
      tags: formData.tags?.toString(),
      unique_id: formData.unique_id,
      ownership: formData.ownership,
    });

    if (contact !== null) {
      if (formContactState.value == "item") {
        dataTable.value[indexFormContactActive.value].pic_id =
          formData.unique_id;
        dataTable.value[indexFormContactActive.value].pic = formData;
        dataTable.value[indexFormContactActive.value].pic_name = formData.name;
      } else {
        ruleForm.responsible = formData;
        ruleForm.responsible_id = formData.unique_id;
        ruleForm.responsible_name = formData.name;
        ruleForm.responsible_version = formData.version;
      }
    }
    dialogContact.value = false;
    indexFormContactActive.value = -1;
  } catch (error) {
    console.log("eror", error);
  }
};

const handleResetContact = () => {
  formFieldsRefContact.value?.resetForm();
  dialogContact.value = false;
};

const createNewContact = async (data: any): Promise<Contact | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
};

const onHandleSelectItemAutocomplete = (
  item: Record<string, any>,
  scope: any
) => {
  console.log(item);
  dataTable.value[scope.$index].name = item.value;
  dataTable.value[scope.$index].inventory_id = item.unique_id;
};

const handleSelectInventoryInspection = (item: Record<string, any>) => {
  const inventory: Inventory = item.data as Inventory;
  ruleForm.inventory_id = inventory.unique_id;
  ruleForm.inventory_name = (inventory.name || inventory.catalogue.name) ?? "";
  ruleForm.inventory_version = inventory.version;
};

const onHandleSelectPICAutocomplete = (
  item: Record<string, any>,
  scope: any
) => {
  if (item.isNew) {
    dataTable.value[scope.$index].pic = {
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: false,
      internal_id: "",
      name: item.query,
      email: "",
      phone: "",
      tax_id: "",
      website: "",
      title: "",
      tmp_tags: [],
      tags: "",
      ownership: false,
      address: [],
      id: 0,
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
    };
    indexFormContactActive.value = scope.$index;
    dialogContact.value = true;
    formContactState.value = "item";
  } else {
    if (item.data) {
      const people = item.data as Contact;
      dataTable.value[scope.$index].pic_name = people.name ?? "";
      dataTable.value[scope.$index].pic_id = people.unique_id;
      dataTable.value[scope.$index].pic = people;
    }
  }
};

const editPic = (index: number) => {
  if (dataTable.value[index].pic) {
    formContactState.value = "item";
    indexFormContactActive.value = index;
    dialogContact.value = true;
  }
};
const deletePIC = (index: number) => {
  dataTable.value[index].pic = null;
  dataTable.value[index].pic_id = "";
  dataTable.value[index].pic_name = "";
};

const onHandleSelectResponsible = (item: Record<string, any>) => {
  if (item.isNew) {
    ruleForm.responsible = {
      unique_id: "",
      unique_code: "",
      is_personal: false,
      is_company: false,
      internal_id: "",
      name: item.query,
      email: "",
      phone: "",
      tax_id: "",
      website: "",
      title: "",
      tmp_tags: [],
      tags: "",
      ownership: false,
      address: [],
      id: 0,
      created_at: 0,
      created_by: "",
      updated_at: 0,
      version: 0,
    };
    formContactState.value = "responsible";
    dialogContact.value = true;
    ruleForm.responsible_name = "";
  } else {
    if (item.data) {
      const people = item.data as Contact;
      ruleForm.responsible = people;
      ruleForm.responsible_id = people.unique_id;
      ruleForm.responsible_name = people.name;
      ruleForm.responsible_version = people.version;
    }
  }
};

const rules = reactive<FormRules<RuleForm>>({
  inspection_name: [
    { required: true, message: "Nama Inspeksi", trigger: "blur" },
  ],
  inventory_name: [
    {
      required: true,
      message: "Masukan unit yang akan di inspeksi",
      trigger: "blur",
    },
  ],
  responsible_name: [
    {
      required: true,
      message: "Masukan Penanggung Jawab Inspeksi",
      trigger: "blur",
    },
  ],
  inspection_date: [
    { required: true, message: "Masukan tanggal inspeksi", trigger: "blur" },
  ],
});

const submitInspection = async () => {
  const date = new Date(ruleForm.inspection_date);

  const formData = new FormData();

  // append data utama
  formData.append("unique_id", ruleForm.unique_id);
  formData.append("inspection_name", ruleForm.inspection_name);
  formData.append("condition", ruleForm.condition);
  formData.append("status", ruleForm.status);
  formData.append(
    "inspection_date",
    Math.floor(date.getTime() / 1000).toString()
  );
  formData.append("inventory_id", ruleForm.inventory_id);
  formData.append("inventory_version", `${ruleForm.inventory_version}`);
  formData.append("responsible_id", `${ruleForm.responsible_id}`);
  formData.append("responsible_version", `${ruleForm.responsible_version}`);

  // append array inspection_item
  dataTable.value.forEach((element, index) => {
    if (element.inventory_id !== "") {
      formData.append(
        `inspection_item[${index}][condition]`,
        element.condition
      );
      formData.append(
        `inspection_item[${index}][inventory_id]`,
        element.inventory_id
      );
      formData.append(`inspection_item[${index}][pic_id]`, element.pic_id);
      formData.append(`inspection_item[${index}][pic_name]`, element.pic_name);
      formData.append(
        `inspection_item[${index}][unique_id]`,
        element.unique_id
      );
    }
  });

  fileList.value.forEach((file, index) => {
    if (file.raw) {
      formData.append(`files[${index}]`, file.raw);
    }
  });

  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Inspection>>(
      "/inspection-create",
      "inspection-create",
      "post",
      formData
    );

    if (response.status.value === "success") {
      ElMessage.success("Berhasil Membuat Data Inspeksi");
      window.location.href =
        "/inspection-maintenance/" + response.data.value?.data?.unique_id;
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
      submitInspection();
    } else {
      console.log("error submit!", fields);
    }
  });
};

const fetchDetail = async () => {
  loading.value;
  try {
    const response = await useFetchApi<BaseResponse<Inspection>>(
      `/inspection-read/${id.value}`,
      "get-inspection",
      "get",
      null
    );
    console.log("response", response.status.value);
    if (response.status.value === "success") {
      const inspectionResponse: Inspection | undefined =
        response.data.value?.data;
      if (inspectionResponse) {
        inspection.value = inspectionResponse;
        ruleForm.unique_id = inspectionResponse.unique_id;
        ruleForm.inspection_name = inspectionResponse.inspection_name;
        ruleForm.inspection_date =
          inspectionResponse.inspection_date != null
            ? inspectionResponse.inspection_date! * 1000
            : Date.now();
        ruleForm.condition = inspectionResponse.condition ?? "";
        ruleForm.inspection_date_display = formatLocalDate(
          inspectionResponse.inspection_date * 1000
        );
        dataTable.value = inspectionResponse.inspection_item.map(
          (value: InspectionItem, index: number) => {
            return {
              unique_id: value.unique_id,
              id: index,
              inventory_id: value.inventory_id ?? "",
              name: `${value.inventories?.catalogue.name} - ${value.inventories?.location?.name}`,
              pic_id: value.pic?.unique_id ?? "",
              pic_name: value.pic?.name ?? "",
              condition: value.condition ?? "",
              pic: value.pic,
            };
          }
        );
      }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value;
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

onMounted(() => {
  if (id.value) {
    fetchDetail();
  }
});
</script>
