<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import { type Contact } from "~/types/contact";
import { useApi } from "~/composables/useApi";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { InfoFilled, Delete, Edit, Setting } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  TableV2FixedDir,
  type Column,
} from "element-plus";
import type { ColumnTable } from "~/types/ColumnTable";
import customTable from "~/components/trums/table/customTable.vue";
import type { BaseResponse } from "~/types/response";
const config = useRuntimeConfig();

definePageMeta({
  middleware: ["auth", "app", "check-access"],
  requiredPermission: "contacts-read",
});

const router = useRouter();

const navigateToForm = (
  mode: string,
  name: string,
  unique_id: string | null
) => {
  const path = name
    ? `/contact-management/contacts/form/${name}`
    : "/contact-management/contacts/form/add";
  router.push({ path, query: { mode, unique_id } });
};

const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);
const token = useCookie("token");

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns: ColumnTable<Contact>[] = [
  {
    title: "Name",
    dataKey: "name",
    key: "name",
    sortable: true,
    fixed: true,
    width: 300,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <NuxtLink
        href={`/contact-management/contacts/${rowData.unique_id}`}
        class="text-blue-500"
      >
        {rowData.name}
      </NuxtLink>
    ),
  },
  {
    title: "Email",
    dataKey: "email",
    key: "email",
    width: 220,
    fixed: true,
  },
  {
    title: "Phone",
    dataKey: "phone",
    key: "phone",
    width: 150,
  },

  {
    title: "NPWP",
    dataKey: "tax_id",
    key: "tax_id",
    width: 170,
  },
  {
    title: "Website",
    dataKey: "website",
    key: "website",
    width: 200,
  },
  {
    title: "Title",
    dataKey: "title",
    key: "title",
    width: 130,
  },
  {
    title: "Personal",
    dataKey: `is_personal`,
    key: `is_personal`,
    width: 100,
  },
  {
    title: "Company",
    dataKey: `is_company`,
    key: `is_company`,
    width: 100,
    align: "center",
  },
  {
    title: "Tags",
    dataKey: "tags",
    key: "tags",
    width: 200,
  },
  {
    title: "Akun User",
    dataKey: "people_internal",
    key: "people_internal",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Contact }) => (
      <p>{rowData.people_internal?.name ?? ""}</p>
    ),
  },
  {
    title: "Aksi",
    dataKey: "",
    key: "",
    width: 70,
    align: "center",
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }: { rowData: Contact }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          navigateToForm("update", rowData.name, rowData.unique_id);
        }
        if (command === "delete") {
          handleDelete(rowData);
        }
      };

      return (
        <ElDropdown onCommand={onCommand} hideOnClick={false}>
          {{
            default: () => (
              <span class="cursor-pointer text-primary">
                <ElIcon>
                  <Setting />
                </ElIcon>
              </span>
            ),
            dropdown: () => (
              <ElDropdownMenu>
                <ElDropdownItem command="edit">Edit</ElDropdownItem>
                <ElDropdownItem class={"text-red-600"} command="delete" divided>
                  Hapus
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
  },
];

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const api = useApi();

// const contact = ref<Pagination<Contact[]>>();
const limit = ref(10);
const currentPage = ref(1);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  sort: null,
  limit: limit.value.toString(),
  offset: currentPage.value.toString(),
  table: "contacts",
});

const { data } = await useFetch<ResponsePagination<Contact[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "contacts",
    method: "post",
    body: request_search.value,
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
  }
);

const handleDelete = async (row: Contact) => {
  loading.value = true;
  try {
    ElMessageBox.confirm(
      "Apakah Anda yakin ingin menghapus data secara permanen?",
      "Konfirmasi Hapus",
      {
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    )
      .then(async () => {
        const response = await useFetchApi<BaseResponse<any>>(
          `contact-delete`,
          "delete-contact",
          "post",
          [row.unique_id]
        );
        if (response.status.value == "success") {
          await refreshNuxtData("contacts");
          ElMessage.success("Data Berhasil Dihapus");
        }
      })
      .catch(() => {
        // User canceled
      });
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};
watch(
  request_search,
  async (newValue) => {
    console.log(newValue);
  },
  { immediate: true }
);
// const fetchData = async () => {
//   try {
//     const response = await api.get(`/contact-read`);
//     contact.value = response.data.data;
//   } catch (error) {
//     console.error("Gagal memuat data:", error);
//   }
// };
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

// onMounted(async () => {
//   await fetchData();
// });

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

console.log("data:", data);
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Type to search"
      /></el-col>
      <NuxtLink
        class="el-button el-button--primary"
        href="/contact-management/contacts/form/add?mode=add"
        >Buat Kontak</NuxtLink
      >
    </el-row>
    <customTable
      :columns="columns"
      :data="data?.data ?? []"
      @sort-change="onSort"
    />
    <div class="flex justify-end">
      <el-pagination
        class="my-3"
        v-model:page-size="limit"
        :page-sizes="[10, 20, 30, 40]"
        background
        layout="total, sizes, prev, pager, next"
        :total="data?.total_data"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>
<style scoped>
:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
