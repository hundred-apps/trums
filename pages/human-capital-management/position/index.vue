<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="large"
          placeholder="Type to search"
        />
      </el-col>
      <el-button size="large" @click="() => (dialogFormVisible = true)">
        New Position
      </el-button>
    </el-row>
    <el-table
      class="w-screen"
      @selection-change="handleSelectionChange"
      :lazy="true"
      :loading="disable"
      :data="data?.data"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.label"
        :prop="col.prop"
        :label="col.label"
      >
        <template #default="scope">
          <TrumsLink
            v-if="col.prop === 'name'"
            @click="navigateToList(scope.row[col.prop], scope.row['unique_id'])"
            >{{ scope.row[col.prop] }}</TrumsLink
          >
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Operations" width="150">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            Edit
          </el-button>
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @confirm="handleDelete(scope.row)"
            @cancel="() => {}"
          >
            <template #reference>
              <el-button size="small" type="danger">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end mt-3">
      <el-pagination
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="data?.total_data"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      v-model="dialogFormVisible"
      :title="editingUniqueId ? 'Edit Posisi' : 'Posisi Baru'"
      width="500"
    >
      <el-form
        :model="ruleForm"
        ref="ruleFormRef"
        :rules="rules"
        :size="formSize"
        status-icon
      >
        <el-form-item label="Nama" prop="name">
          <el-input
            v-model="ruleForm.name"
            :disabled="disable"
            autocomplete="off"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false" :loading="disable">
            Cancel
          </el-button>
          <el-button
            type="primary"
            @click="submitForm(ruleFormRef)"
            :loading="disable"
          >
            Submit
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import { useApi } from "#imports";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";
import type { Position } from "~/types/position";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
} from "element-plus";

const config = useRuntimeConfig();
const api = useApi();
const token = useCookie("token");
const router = useRouter();

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const limit = ref(10);
const currentPage = ref(1);
const editingUniqueId = ref<string | null>(null);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "positions",
});

const navigateToList = (name = "", unique_id = null) => {
  const path = `/human-capital-management/position/list/${name}`;
  router.push({ path, query: { unique_id } });
};

interface RuleForm {
  unique_id: string;
  name: string;
}
const ruleForm = reactive<RuleForm>({
  unique_id: "",
  name: "",
});

const { data } = await useFetch<ResponsePagination<Position[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "fetchData",
    method: "post",
    body: request_search.value,
    headers: token.value
      ? {
          Authorization: `Bearer ${token.value}`,
        }
      : {},
  }
);

const disable = ref<boolean>(false);
const search = ref("");
const dialogFormVisible = ref(false);

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: "Masukan Nama Posisi",
      trigger: ["blur", "change"],
    },
  ],
});

const columns = [
  {
    label: "Name",
    prop: "name",
  },
];

const fetchData = async () => {
  const { data: newData } = await useFetch<ResponsePagination<Position[]>>(
    `${config.public.baseURL}/search`,
    {
      key: "fetchData",
      method: "post",
      body: request_search.value,
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    }
  );
  data.value = newData.value;
};

const submit = async (formEl: FormInstance | undefined) => {
  disable.value = true;
  try {
    let response;
    if (editingUniqueId.value) {
      // Mode edit
      response = await api.post(
        `/position-create`,
        {
          name: ruleForm.name,
          unique_id: editingUniqueId.value,
        },
        {
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
        }
      );
      ElMessage.success(`Berhasil Mengedit posisi`);
    } else {
      // Mode tambah baru
      response = await api.post("/position-create", {
        name: ruleForm.name,
        unique_id: ruleForm.unique_id,
      });
      ElMessage.success(`Berhasil Menambahkan posisi`);
    }

    if (response.status === 201 || response.status === 200) {
      await fetchData(); // Memuat ulang data setelah berhasil
      dialogFormVisible.value = false; // Tutup dialog
      editingUniqueId.value = null;
      resetForm(formEl); // Reset editingUniqueId
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    disable.value = false;
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
const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.name = "";
};

watch(search, async (newSearch) => {
  request_search.value.keyword = newSearch;
  await fetchData(); // Memuat ulang data saat pencarian berubah
});
watch(dialogFormVisible, (newVisible) => {
  if (!newVisible) {
    editingUniqueId.value = null;
  }
});

watch(currentPage, async (newPage) => {
  request_search.value.offset = newPage;
  await fetchData(); // Memuat ulang data saat halaman berubah
});

watch(limit, async (newLimit) => {
  request_search.value.limit = newLimit;
  await fetchData(); // Memuat ulang data saat limit berubah
});

onMounted(async () => {
  await fetchData();
});

const handleEdit = (row: Position) => {
  editingUniqueId.value = row.unique_id;
  ruleForm.name = row.name;
  dialogFormVisible.value = true;
};

const handleDelete = async (row: Position) => {
  loading.value = true;
  try {
    const response = await useFetch(
      `${config.public.baseURL}/position-delete`,
      {
        method: "delete",
        body: [row.unique_id],
        lazy: true,
      }
    );
    if (response.status.value == "success") {
      await fetchData();
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};
</script>
