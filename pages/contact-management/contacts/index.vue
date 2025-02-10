<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { type Contact } from "~/types/contact";
import { useApi } from "~/composables/useApi";
import type { RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { InfoFilled } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Pagination } from "~/types/pagination";
const config = useRuntimeConfig();

definePageMeta({
  middleware: ["auth", "app"],
});

const router = useRouter();

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? `/contact-management/contacts/form/${name}`
    : "/contact-management/contacts/form/add";
  router.push({ path, query: { mode, unique_id } });
};

const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns = [
  {
    label: "Name",
    prop: "name",
    sortable: true,
    fixed: true,
    width: 200,
  },
  {
    label: "Phone",
    prop: "phone",
    width: 150,
  },
  {
    label: "Email",
    prop: "email",
    width: 150,
  },
  {
    label: "NPWP",
    prop: "tax_id",
    width: 150,
  },
  {
    label: "Website",
    prop: "website",
    width: 150,
  },
  {
    label: "Title",
    prop: "title",
    width: 100,
  },
  {
    label: "Personal",
    prop: `is_personal`,
    width: 100,
    align: "center",
  },
  {
    label: "Company",
    prop: `is_company`,
    width: 100,
    align: "center",
  },
  {
    label: "Tags",
    prop: "tags",
    width: 200,
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
  column: null,
  sort: null,
  limit: limit,
  offset: currentPage,
  table: "contacts",
});

const { data } = await useFetch<ResponsePagination<Contact[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "contacts",
    method: "post",
    body: request_search.value,
  }
);

const handleDelete = async (row: Contact) => {
  loading.value = true;
  try {
    const response = await useFetch(`${config.public.baseURL}/contact-delete`, {
      method: "delete",
      body: [row.unique_id],
      lazy: true,
    });
    if (response.status.value == "success") {
      await refreshNuxtData("contacts");
      ElMessage.success("Data Berhasil Dihapus");
    }
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
const handleSizeChange = (val: number) => {
  loading.value = true;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// onMounted(async () => {
//   await fetchData();
// });

console.log("data:", data);
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
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
    </el-row>
    <el-table
      class="w-screen"
      @selection-change="handleSelectionChange"
      :data="data?.data"
      :loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in columns"
        :key="col.prop || col.label"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
        :fixed="col.fixed"
        :width="col.width"
        :align="col.align"
      >
        <template #default="scope">
          <Icon
            v-if="col.prop === 'is_personal' || col.prop === 'is_company'"
            :name="
              scope.row[col.prop] ? 'mdi:check-circle' : 'mdi:close-circle'
            "
            :style="scope.row[col.prop] ? 'color: green' : 'color: red'"
          />
          <!-- Untuk kolom lainnya -->
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="150">
        <template #default="scope">
          <el-button
            size="small"
            @click="
              navigateToForm('update', scope.row.name, scope.row.unique_id)
            "
          >
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
