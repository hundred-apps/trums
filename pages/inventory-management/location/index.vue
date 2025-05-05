<template>
  <TrumsWrapper>
    <div class="flex justify-between items-center mb-3">
      <div class="flex gap-2">
        <div class="w-auto">
          <el-input
            v-model="request_search.keyword"
            size="large"
            style="width: 350px"
            :placeholder="`${t('form.placeholder.search')}`"
          >
            <template #prefix>
              <Icon name="lineicons:magnifier" />
            </template>
          </el-input>
        </div>
        <div class="w-auto">
          <el-button size="large" @click="() => handleAddNewLocation()">{{
            t("buttons.newLocation")
          }}</el-button>
        </div>
        <div class="w-auto">
          <el-button
            v-if="checkSelect()"
            size="large"
            @click="deleteBulk()"
            type="danger"
            >{{ t("buttons.delete") }}</el-button
          >
        </div>
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
    </div>
    <CustomTable :columns="columns" :data="data?.data ?? []" />
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        background
        layout="prev, pager, next"
        :total="data?.total_page"
      />
    </div>
    <el-dialog
      v-model="dialogFormVisible"
      :title="form.unique_id ? t('text.editLocation') : t('text.newLocation')"
      width="500"
    >
      <el-form :model="form" :rules="rules">
        <el-form-item :label="`${t('form.label.name')}`">
          <el-input
            v-model="form.name"
            :disabled="disable"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false" :loading="disable">{{
            t("buttons.cancel")
          }}</el-button>
          <el-button type="primary" @click="onSubmit" :loading="disable">
            {{ t("buttons.save") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted, type FunctionalComponent } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { RefreshRight } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElTooltip,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type FormRules,
} from "element-plus";
import { useApi } from "#imports";
import type { Pagination } from "~/types/pagination";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import CustomTable from "~/components/trums/table/customTable.vue";
import { column } from "element-plus/es/components/table-v2/src/common.mjs";
import { NuxtLink } from "#components";

const config = useRuntimeConfig();
const { t } = useI18n();
const loading = ref<boolean>(false);
const disable = ref<boolean>(false);
const search = ref("");
const dialogFormVisible = ref(false);
const formLabelWidth = "140px";
const axios = useApi();
const checkSelect = () => data?.value?.data.some((row) => row.checked);

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

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [{ type: ["place"] }],
  limit: "10",
  offset: "1",
  table: "catalogues",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const { data } = await useFetchApi<ResponsePagination<Catalogue[]>>(
  `/search`,
  "catalogues",
  "post",
  request_search.value
);

interface formInterface {
  name: string;
  unique_id?: string;
}

const form = reactive<formInterface>({
  name: "",
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: "Masukan Nama Lokasi", trigger: "blur" }],
});

const handleAddNewLocation = () => {
  dialogFormVisible.value = true;
  form.name = "";
  form.unique_id = undefined;
};

const columns: Column<Catalogue>[] = [
  {
    title: `${t("form.label.uniqueCode")}`,
    key: "unique_code",
    dataKey: "unique_code",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`location/${row.unique_id}`} class="text-blue-600">
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    width: 250,
  },
  {
    title: `${t("form.label.totalItem")}`,
    key: "quantity",
    dataKey: "quantity",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.inventories_location.length}</p>
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

columns.unshift({
  key: "selection",
  width: 50,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },

  headerCellRenderer: () => {
    const _data = unref(data);
    const onChange = (value: CheckboxValueType) =>
      (data.value = {
        success: true,
        currentPage: _data?.currentPage ?? 0,
        total_data: _data?.total_data ?? 0,
        total_page: _data?.total_data ?? 0,
        data: _data?.data?.map((row: any) => {
          row.checked = value;
          return row;
        })!,
      });
    const allSelected = _data!.data.every((row) => row.checked);
    const containsChecked = _data?.data.some((row) => row.checked);

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const handleEdit = (row: Catalogue) => {
  form.unique_id = row.unique_id!;
  form.name = row.name!;
  dialogFormVisible.value = true;
};

const handleDelete = async (row: Catalogue) => {
  loading.value = false;
  try {
    const response = await useFetchApi<ResponsePagination<string[]>>(
      `/catalogues-delete`,
      "catalogues",
      "post",
      [row.unique_id]
    );
    if (response.status.value == "success") {
      await refreshNuxtData("catalogues");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const messageBoxDelete = async (row: Catalogue) => {
  ElMessageBox.confirm(
    `${t("message.box.deleteLocation")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/catalogues-delete",
        "catalogues",
        "post",
        [row.unique_id]
      );
      if (response.status.value == "success") {
        await refreshNuxtData();
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

const deleteBulk = () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  const ids = checkeds?.map((value) => value.unique_id);
  ElMessageBox.confirm(
    `${t("message.box.deleteSelected")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/catalogues-delete",
        "catalogues",
        "post",
        ids
      );
      if (response.status.value == "success") {
        ElMessage.success(`${t("message.successDeleted")}`);
        await refreshNuxtData();
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

const onSubmit = async () => {
  console.log(form);
  disable.value = true;
  try {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("type", "place");

    if (form.unique_id) {
      formData.append("unique_id", form.unique_id);
    }

    const response = await axios.post("/catalogues-create", formData);
    if (response.status == 201) {
      await refreshNuxtData("catalogues");
      if (form.unique_id) {
        ElMessage.success(`${t("message.submitUpdateLocation")}`);
      } else {
        ElMessage.success(`${t("message.submitNewLocation")}`);
      }
      dialogFormVisible.value = false;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message);
  } finally {
    disable.value = false;
  }
};

// onMounted(() => {

//   fetchData();
// })
</script>
