<script lang="ts" setup>
definePageMeta({
  middleware: ["auth", "app"],
});
import { ref, onMounted } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import { InfoFilled } from "@element-plus/icons-vue";
import type { RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
const config = useRuntimeConfig();

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetch<ResponsePagination<Inventory[]>>(
      `${config.public.baseURL}/search`,
      {
        key: "inventories",
        method: "post",
        body: request_search.value,
      }
    );

    if (response.status.value == "success") {
      data.value = response.data.value;
    }
  } catch (error: any) {
    ElMessage.error(
      `${error.response?.data?.message ?? "Gagal Mengambil Data!"}`
    );
    return [];
  } finally {
    loading.value = false;
  }
};

const loading = ref<boolean>(false);
const request_search = ref<RequestSearch>({
  keyword: "",
  column: null,
  sort: null,
  limit: "10",
  offset: "1",
  table: "inventories",
});
const search = ref("");
const axios = useApi();
const limit = ref(10);
const offset = ref(1);

const router = useRouter();

// const filterTableData = computed(() =>
// (data.value ?? []).filter(
//   (value) =>
//     !search.value ||
//     value.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
//     value.unique_id.toLowerCase().includes(search.value.toLowerCase()) ||
//     value.catalogue.name?.toLowerCase().includes(search.value.toLowerCase())
// )
// )

// const { data } = await useAsyncData('inventories', fetchData);
const { data } = await useFetch<ResponsePagination<Inventory[]>>(
  `${config.public.baseURL}/search`,
  {
    key: "inventories",
    method: "post",
    body: request_search.value,
  }
);

const columns = [
  {
    label: "Serial Number",
    prop: "sn",
    sortable: true,
  },
  {
    label: "Item",
    prop: "catalogue.name",
  },
  {
    label: "Location",
    prop: "location.name",
  },
  {
    label: "Quantity",
    prop: "quantity",
  },
  {
    label: "Traceable",
    prop: "is_traceable",
  },
];

const handleEdit = (row: Inventory) => {
  console.log("Editing:", row);
  const id = useCookie("unique_id");
  id.value = row.unique_id;
  router.push("inventories/add");
};

const handleDelete = async (row: Inventory) => {
  loading.value = true;
  try {
    const response = await useFetch(
      `${config.public.baseURL}/inventories-delete`,
      {
        method: "delete",
        body: [row.unique_id],
        lazy: true,
      }
    );
    if (response.status.value == "success") {
      await refreshNuxtData("inventories");
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

const onSearch = async (value: string) => {
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.keyword = value;
  request_search.value = data;
};

watch(
  request_search,
  async (newValue) => {
    console.log(newValue);
  },
  { immediate: true }
);

onMounted(() => {
  // fetchData();
});
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
            const unique_id = useCookie('unique_id');
            unique_id.value = null;
            $router.push('inventories/add');
          }
        "
        >New Inventory</el-button
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
      >
      </el-table-column>
      <el-table-column label="Operations">
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
  </TrumsWrapper>
</template>
