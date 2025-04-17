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
const router = useRouter();
const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);
const token = useCookie("token");
const api = useApi();
// const contact = ref<Pagination<Contact[]>>();
const limit = ref(10);
const currentPage = ref(1);

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? `/contact-management/contacts/form/${name}`
    : "/contact-management/contacts/form/add";
  router.push({ path, query: { mode, unique_id } });
};

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns: Column<Contact>[] = [
  {
    title: "Name",
    key: "name",
    dataKey: "name",
    sortable: true,
    width: 200,
    fixed: true,
  },
  {
    title: "Phone",
    key: "phone",
    dataKey: "phone",
    width: 150,
  },
  {
    title: "Email",
    key: "email",
    dataKey: "email",
    width: 150,
  },
  {
    title: "NPWP",
    key: "tax_id",
    dataKey: "tax_id",
    width: 150,
  },
  {
    title: "Website",
    key: "website",
    dataKey: "website",
    width: 150,
  },
  {
    title: "Title",
    key: "title",
    dataKey: "title",
    width: 100,
  },
  {
    title: "Personal",
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
    title: "Company",
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
    title: "Tags",
    key: "tags",
    dataKey: "tags",
    width: 200,
  },
  {
    title: "People Contact",
    key: "internal_id",
    dataKey: "internal_id",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.internal_id}</p>
      </>
    ),
  },
  {
    title: "Operation",
    key: "",
    dataKey: "",
    width: 100,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElTooltip placement="top" content="Edit">
          <ElButton
            type="warning"
            circle
            onClick={() => navigateToForm("update", row.name, row.unique_id)}
            plain
          >
            <Icon name="material-symbols:edit-square-outline-rounded" />
          </ElButton>
        </ElTooltip>
        <ElTooltip placement="top" content="Delete">
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
    "Data Contact ini akan dihapus. Lanjutkan?",
    "Peringatan!!!",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetch(
        `${config.public.baseURL}/contact-delete`,
        {
          method: "post",
          body: [row.unique_id],
          lazy: true,
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
        }
      );
      if (response.status.value == "success") {
        await refreshNuxtData();
        ElMessage.success("Data Berhasil Dihapus");
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Delete canceled",
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
  ElMessage.success("Data Berhasil DiReload");
};

const handleSizeChange = (val: number) => {
  loading.value = true;
  try {
    refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.success("Data Berhasil Diubah");
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
            placeholder="Type to search"
        /></el-col>
        <el-button
          size="large"
          @click="
            () => {
              navigateToForm('add');
            }
          "
          >New Contact</el-button
        >
      </div>
      <el-tooltip content="Reload Data" placement="top">
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
          <span :hidden="!loading">Load</span></el-button
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
