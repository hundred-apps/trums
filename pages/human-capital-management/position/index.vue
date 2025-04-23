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
          t("buttons.newPosition")
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
    <el-dialog
      v-model="dialogFormVisible"
      :title="editingUniqueId ? t('text.editPosition') : t('text.newPosition')"
      width="500"
    >
      <el-form
        :model="ruleForm"
        ref="ruleFormRef"
        :rules="rules"
        :size="formSize"
        status-icon
      >
        <el-form-item :label="`${t('form.label.name')}`" prop="name">
          <el-input
            v-model="ruleForm.name"
            :disabled="disable"
            :placeholder="`${t('form.placeholder.position')}`"
            autocomplete="off"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false" :loading="disable">
            {{ t("buttons.cancel") }}
          </el-button>
          <el-button
            type="primary"
            @click="submitForm(ruleFormRef)"
            :loading="disable"
          >
            {{ t("buttons.save") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref } from "vue";
import { RefreshRight } from "@element-plus/icons-vue";
import { useApi } from "#imports";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";
import type { Position } from "~/types/position";
import CustomTable from "~/components/trums/table/customTable.vue";
import {
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  ElMessage,
  ElLink,
  TableV2FixedDir,
  ElTooltip,
  ElButton,
} from "element-plus";

const api = useApi();
const token = useCookie("token");
const { t } = useI18n();
const localePath = useLocalePath();
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const loading = ref<boolean>(false);
const limit = ref(10);
const currentPage = ref(1);
const editingUniqueId = ref<string | null>(null);
const disable = ref<boolean>(false);
const search = ref("");
const dialogFormVisible = ref(false);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "positions",
});

const navigateToList = (name = "", unique_id = null) => {
  const path = localePath(`/human-capital-management/position/list/${name}`);
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

const { data } = await useFetchApi<ResponsePagination<Position[]>>(
  "/search",
  "position",
  "post",
  request_search.value
);

const rules = reactive<FormRules<RuleForm>>({
  name: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: ["blur", "change"],
    },
  ],
});

const columns: Column<Position>[] = [
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElLink
          underline={false}
          onClick={() => navigateToList(row.name, row.unique_id)}
        >
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
            onClick={() => messageBoxDelete(row)}
          >
            <Icon name="material-symbols:delete-outline" />
          </ElButton>
        </ElTooltip>
      </>
    ),
  },
];

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
      ElMessage.success(`${t("message.submitUpdatePosition")}`);
    } else {
      // Mode tambah baru
      response = await api.post("/position-create", {
        name: ruleForm.name,
        unique_id: ruleForm.unique_id,
      });
      ElMessage.success(`${t("message.submitNewPosition")}`);
    }

    if (response.status === 201 || response.status === 200) {
      refreshNuxtData(); // Memuat ulang data setelah berhasil
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
  ElMessage.info(`${t("message.resetForm")}`);
};

const handleEdit = (row: Position) => {
  editingUniqueId.value = row.unique_id;
  ruleForm.name = row.name;
  dialogFormVisible.value = true;
};

const messageBoxDelete = async (row: Position) => {
  ElMessageBox.confirm(
    `${t("message.box.deletePosition")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/position-delete",
        "positions",
        "post",
        [row.unique_id]
      );
      if (response.status.value == "success") {
        refreshNuxtData();
        ElMessage.success(`${t("message.successDeleted")}`);
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `${t("message.cancelDelete")}`,
      });
    });
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
</script>
