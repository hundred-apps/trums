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
          <el-button
            size="large"
            @click="
              () => {
                navigateToForm('add');
              }
            "
            >{{ t("buttons.newPeople") }}</el-button
          >
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
    <CustomTable :data="data?.data ?? []" :columns="columns" />
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="data?.total_data"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, watch } from "vue";
import { type People } from "~/types/people";
import { useApi } from "~/composables/useApi";
import type { RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import type { ResponsePagination } from "~/types/response_pagination";
import { RefreshRight } from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import {
  ElButton,
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElTooltip,
  ElMessage,
  ElMessageBox,
} from "element-plus";

definePageMeta({
  middleware: ["auth", "app"],
});

const config = useRuntimeConfig();
const router = useRouter();
const token = useCookie("token");
const lang = useCookie("language");
const localePath = useLocalePath();
const api = useApi();
// const people = ref<Pagination<People[]>>();
const limit = ref(10);
const currentPage = ref(1);
const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);
const { t } = useI18n();
const checkSelect = () => data?.value?.data.some((row) => row.checked);

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? localePath(`/human-capital-management/people/form/${name}`)
    : localePath("/human-capital-management/people/form/add");
  navigateTo({ path, query: { mode, unique_id } });
};

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns: Column<People>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    maxWidth: 50,
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
          style={{ width: 50 }}
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    sortable: true,
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.departement")}`,
    key: "departement.name",
    dataKey: "departement.name",
    width: 200,
  },
  {
    title: `${t("form.label.position")}`,
    key: "position.name",
    dataKey: "position.name",
    width: 200,
  },
  {
    title: `gid`,
    key: "gid",
    dataKey: "gid",
    width: 200,
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
          <ElButton
            type="warning"
            circle
            onClick={() => navigateToForm("update", row.name, row.unique_id)}
            plain
          >
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

const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "people",
});

const { data } = await useFetchApi<ResponsePagination<People[]>>(
  "/search",
  "people",
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

const messageBoxDelete = async (row: People) => {
  ElMessageBox.confirm(
    `${t("message.box.deletePeople")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      if (row.gid === null) {
        const response = await useFetchApi("/people-delete", "people", "post", [
          row.unique_id,
        ]);
        if (response.status.value == "success") {
          await refreshNuxtData();
          ElMessage.success(`${t("message.successDeleted")}`);
          loading.value = false;
        }
      } else {
        ElMessage.error(`${t("message.cantDeleteOidc")}`);
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
  const gId = checkeds?.map((value) => value.gid);
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
      if (gId === null) {
        const response = await useFetchApi(
          "/people-delete",
          "people",
          "post",
          ids
        );
        if (response.status.value == "success") {
          ElMessage.success(`${t("message.successDeleted")}`);
          await refreshNuxtData();
          loading.value = false;
        }
      } else {
        ElMessage.error(`${t("message.cantDeleteOidc")}`);
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

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

watch(
  request_search,
  async (newValue) => {
    console.log(newValue);
  },
  { immediate: true }
);

// onMounted(async () => {
//   await fetchData();
// });
</script>
