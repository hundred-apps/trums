<script lang="tsx" setup>
import { ref } from "vue";
import { type Contact } from "~/types/contact";
import { useApi } from "~/composables/useApi";
import type { RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { RefreshRight } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import {
  ElButton,
  type Column,
  TableV2FixedDir,
  ElTooltip,
  ElMessage,
  ElMessageBox,
} from "element-plus";

definePageMeta({
  middleware: ["auth", "app"],
});

const config = useRuntimeConfig();
const localePath = useLocalePath();
const router = useRouter();
const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);
const token = useCookie("token");
const api = useApi();
// const contact = ref<Pagination<Contact[]>>();
const limit = ref(10);
const currentPage = ref(1);
const { t } = useI18n();

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? localePath(`/contact-management/contacts/form/${name}`)
    : localePath("/contact-management/contacts/form/add");
  navigateTo({ path, query: { mode, unique_id } });
};

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns: Column<Contact>[] = [
  {
    title: `${t("form.label.name")}`,
    key: "name",
    dataKey: "name",
    sortable: true,
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.phoneNumber")}`,
    key: "phone",
    dataKey: "phone",
    width: 150,
  },
  {
    title: `${t("form.label.email")}`,
    key: "email",
    dataKey: "email",
    width: 150,
  },
  {
    title: `${t("form.label.taxId")}`,
    key: "tax_id",
    dataKey: "tax_id",
    width: 150,
  },
  {
    title: `${t("form.label.website")}`,
    key: "website",
    dataKey: "website",
    width: 150,
  },
  {
    title: `${t("form.label.title")}`,
    key: "title",
    dataKey: "title",
    width: 100,
  },
  {
    title: `${t("form.label.personal")}`,
    key: "is_personal",
    dataKey: "is_personal",
    width: 100,
    cellRenderer: ({ rowData: row }) =>
      row.is_personal === true ? (
        <Icon name="mdi:check-circle" style="color: #67c23a" />
      ) : (
        <Icon name="mdi:close-circle" style="color: #f56c6c" />
      ),
    align: "center",
  },
  {
    title: `${t("form.label.company")}`,
    key: "is_company",
    dataKey: "is_company",
    width: 100,
    cellRenderer: ({ rowData: row }) =>
      row.is_company === true ? (
        <Icon name="mdi:check-circle" style="color: #67c23a" />
      ) : (
        <Icon name="mdi:close-circle" style="color: #f56c6c" />
      ),
    align: "center",
  },
  {
    title: `${t("form.label.tags")}`,
    key: "tags",
    dataKey: "tags",
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

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "contacts",
});

const { data } = await useFetchApi<ResponsePagination<Contact[]>>(
  "/search",
  "contacts",
  "post",
  request_search.value
);

const messageBoxDelete = async (row: Contact) => {
  ElMessageBox.confirm(
    `${t("message.box.deleteContact")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/contact-delete",
        "contacts",
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

// const handleDelete = async (row: Contact) => {
//   loading.value = true;
//   try {
//     const response = await useFetch(`${config.public.baseURL}/contact-delete`, {
//       method: "delete",
//       body: [row.unique_id],
//       lazy: true,
//     });
//     if (response.status.value == "success") {
//       await refreshNuxtData("contacts");
//       ElMessage.success("Data Berhasil Dihapus");
//     }
//   } catch (error: any) {
//     ElMessage.error(`${error.response?.data?.message}`);
//   } finally {
//     loading.value = false;
//   }
// };

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
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="w-full flex justify-between items-center mb-3">
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
        <el-button
          size="large"
          @click="
            () => {
              navigateToForm('add');
            }
          "
          >{{ t("buttons.newContact") }}</el-button
        >
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
