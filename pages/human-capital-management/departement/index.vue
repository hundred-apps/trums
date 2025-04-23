<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3 w-full flex justify-between items-center">
      <div class="flex gap-3">
        <el-col
          ><el-input
            v-model="request_search.keyword"
            size="large"
            :placeholder="`${t('form.placeholder.search')}`"
          >
            <template #prefix>
              <Icon name="lineicons:magnifier" />
            </template>
          </el-input>
        </el-col>
        <el-button size="large" @click="() => (dialogFormVisible = true)">{{
          t("buttons.newDepartement")
        }}</el-button>
      </div>
      <el-tooltip :content="`${t('tooltip.reloadData')}`" placement="top">
        <el-button
          size="large"
          @click="fetchData"
          :loading-icon="RefreshRight"
          :loading="loading"
          ><Icon
            name="material-symbols:refresh"
            size="1.5em"
            :hidden="loading"
          />
          <span :hidden="!loading">{{ t("buttons.load") }}</span></el-button
        >
      </el-tooltip>
    </el-row>
    <CustomTable :data="data?.data ?? []" :columns="columns" />
    <div class="flex justify-end mt-3">
      <el-pagination
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="data?.total_data"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog v-model="dialogFormVisible" title="Departemen Baru" width="500">
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
          <el-button @click="dialogFormVisible = false" :loading="disable"
            >Cancel</el-button
          >
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

<script lang="tsx" setup>
import { ref, watch } from "vue";
import { RefreshRight } from "@element-plus/icons-vue";
import { useApi } from "#imports";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";
import type { Departement } from "~/types/departement";
import CustomTable from "~/components/trums/table/customTable.vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  ElTooltip,
  ElButton,
  TableV2FixedDir,
  ElLink,
} from "element-plus";

const { t } = useI18n();
const config = useRuntimeConfig();
const localePath = useLocalePath();
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
  table: "departements",
});

const navigateToList = (name = "", unique_id = null) => {
  const path = localePath(`/human-capital-management/departement/list/${name}`);
  navigateTo({ path, query: { unique_id } });
};

interface RuleForm {
  unique_id: string;
  name: string;
}

const ruleForm = reactive<RuleForm>({
  unique_id: "",
  name: "",
});

const { data } = await useFetchApi<ResponsePagination<Departement[]>>(
  "/search",
  "departements",
  "post",
  request_search.value
);

const fetchData = async () => {
  loading.value = true;
  try {
    await refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.success(`${t("message.reloadData")}`);
};

const disable = ref<boolean>(false);
const search = ref("");
const dialogFormVisible = ref(false);

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: "Masukan Nama Departemen",
      trigger: ["blur", "change"],
    },
  ],
});

const columns: Column<Departement>[] = [
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElLink onClick={() => navigateToList(row.name, row.unique_id)}>
          {row.name}
        </ElLink>
      </>
    ),
  },
  {
    title: `${t("form.label.operation")}`,
    key: "",
    dataKey: "",
    width: 100,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElTooltip placement="top" content={t("tooltip.edit")}>
          <ElButton type="warning" circle onClick={() => handleEdit(row)} plain>
            <Icon name="material-symbols:edit-square-outline-rounded" />
          </ElButton>
        </ElTooltip>
        <ElTooltip placement="top" content={t("tooltip.delete")}>
          <ElButton
            type="danger"
            circle
            plain
            onClick={() => handleDelete(row)}
          >
            <Icon name="material-symbols:delete-outline" />
          </ElButton>
        </ElTooltip>
      </>
    ),
  },
];

const submit = async (formEl: FormInstance | undefined) => {
  disable.value = true;
  try {
    let response;
    if (editingUniqueId.value) {
      response = await api.post(`/departement-create`, {
        name: ruleForm.name,
        unique_id: editingUniqueId.value,
      });
      ElMessage.success(`Berhasil Mengedit departemen`);
    } else {
      // Mode tambah baru
      response = await api.post("/departement-create", {
        name: ruleForm.name,
        unique_id: ruleForm.unique_id,
      });
      ElMessage.success(`Berhasil Menambahkan departemen`);
    }

    if (response.status === 201 || response.status === 200) {
      await fetchData(); // Memuat ulang data setelah berhasil
      dialogFormVisible.value = false; // Tutup dialog
      editingUniqueId.value = null;
      resetForm(formEl);
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

const handleEdit = (row: Departement) => {
  editingUniqueId.value = row.unique_id;
  ruleForm.name = row.name;
  dialogFormVisible.value = true;
};

const handleDelete = async (row: Departement) => {
  loading.value = true;
  try {
    const response = await useFetch(
      `${config.public.baseURL}/departement-delete`,
      {
        method: "delete",
        body: [row.unique_id],
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
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

const handleSizeChange = (val: number) => {
  loading.value = true;
  try {
    refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.info(`${t("message.handleSizeChange")}`);
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

watch(search, async (newSearch) => {
  request_search.value.keyword = newSearch;
  await fetchData(); // Memuat ulang data saat pencarian berubah
});

watch(
  request_search,
  async (newValue) => {
    console.log("new", newValue);
  },
  { immediate: true }
);
</script>
