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
        <el-form-item label="Kondisi" prop="condition">
          <el-input v-model="ruleForm.condition" type="textarea" />
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="mb-3">
      <el-table :data="dataTable">
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
            <el-autocomplete
              :disabled="loading"
              :fetch-suggestions="querySearchAsyncPic"
              v-model="scope.row.pic_name"
              placeholder="Input PIC"
              @select="(item: Record<string, any>) => onHandleSelectPICAutocomplete(item, scope)"
            >
              <template #default="{ item }">
                <div v-if="item.isNew" class="flex items-center text-blue-500">
                  <el-icon><Search /></el-icon>
                  <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                </div>
                <div v-else class="flex items-center gap-2 my-1">
                  <el-avatar
                    v-if="getAvatar(item.data.photo) != null"
                    :src="getAvatar(item.data.photo)!"
                  />
                  <el-avatar v-else :icon="UserFilled" />
                  <div class="el-text el-text--default">
                    {{ item.value || "-" }}
                  </div>
                </div>
              </template>
            </el-autocomplete>
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
}

import { reactive, ref, onMounted } from "vue";
import {
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";
import { useApi } from "#imports";
import { type Catalogue } from "~/types/catalogue";
import type { People } from "~/types/people";
import type { Inventory } from "~/types/inventory";
import type { RequestSearch } from "~/types/request_search";
import type { Inspection, InspectionItem } from "~/types/inspection";
import type { AppFile } from "~/types/file";
import { Delete, UserFilled } from "@element-plus/icons-vue";
import type { BaseResponse } from "~/types/response";
import type { DefaultResponse } from "~/types/pagination";

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
});
const loading = ref<boolean>();

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
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
});

const axios = useApi();

const dataTable = ref(
  Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    inventory_id: "",
    name: "",
    pic: "",
    pic_name: "",
    condition: "",
    unique_id: "",
  }))
);

const addNewLine = () => {
  dataTable.value.push({
    id: dataTable.value.length + 1,
    inventory_id: "",
    name: "",
    pic: "",
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
    axios
      .post("/people-read")
      .then((response) => {
        if (response.status == 200) {
          // console.log(response.data.data.q);
          const peoples: People[] = response.data.data;

          const filters = queryString
            ? peoples.filter(
                (data) =>
                  data.name
                    ?.toLowerCase()
                    .includes(queryString.toLowerCase()) ||
                  data.email
                    ?.toLowerCase()
                    .includes(queryString.toLowerCase()) ||
                  data.position
                    ?.toLowerCase()
                    .includes(queryString.toLowerCase())
              )
            : peoples;

          const results = filters.map((data: People) => {
            return {
              value: `${data.name} | ${data.email || data.phone}`,
              id: data.unique_id,
              data: data,
              isNew: false,
            };
          });
          cb([...results, { value: queryString, isNew: true }]);
        } else {
          ElMessage.error(response.data.message);
        }
      })
      .catch((error: any) => {
        ElMessage.error(error.response.data.message);
      });
  }
};

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  requestSearch.value.keyword = queryString;
  axios
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        // console.log(response.data.data.q);
        const inventories: Inventory[] = response.data.data;

        const results = inventories.map((data: Inventory) => {
          return {
            value: `${data.catalogue.name}-${data.location?.name}`,
            unique_id: data.unique_id,
          };
        });
        cb(results);
      } else {
        ElMessage.error(response.data.message);
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
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

const onHandleSelectItemAutocomplete = (
  item: Record<string, any>,
  scope: any
) => {
  console.log(item);
  dataTable.value[scope.$index].name = item.value;
  dataTable.value[scope.$index].inventory_id = item.unique_id;
};

const onHandleSelectPICAutocomplete = (
  item: Record<string, any>,
  scope: any
) => {
  if (item.data) {
    const people = item.data as People;
    dataTable.value[scope.$index].pic_name = people.name ?? "";
    dataTable.value[scope.$index].pic = people.unique_id;
  }
};

const rules = reactive<FormRules<RuleForm>>({
  inspection_name: [
    { required: true, message: "Nama Inspeksi", trigger: "blur" },
  ],
  inspection_date: [
    { required: true, message: "Masukan tanggal inspeksi", trigger: "blur" },
  ],
});

const submitInspection = async () => {
  const date = new Date(ruleForm.inspection_date);
  const data = {
    unique_id: ruleForm.unique_id,
    inspection_name: ruleForm.inspection_name,
    condition: ruleForm.condition,
    status: ruleForm.status,
    inspection_date: Math.floor(date.getTime() / 1000),
  };

  const inspection_item: {
    condition: string;
    inventory_id: string;
    pic_id: string;
    pic_name: string;
    unique_id: string;
  }[] = [];

  dataTable.value.forEach((element) => {
    if (element.inventory_id != "") {
      inspection_item.push({
        condition: element.condition,
        inventory_id: element.inventory_id,
        pic_id: element.pic,
        pic_name: element.pic_name,
        unique_id: element.unique_id,
      });
    }
  });

  loading.value = true;
  try {
    const response = await axios.post("/inspection-create", {
      ...data,
      inspection_item: inspection_item,
    });

    if (response.status == 201) {
      ElMessage.success("Berhasil Membuat Data Inspeksi");
      fetchDetail();
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
              pic: value.pic?.unique_id ?? "",
              pic_name: value.pic?.name ?? "",
              condition: value.condition ?? "",
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
