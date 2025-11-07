

<script lang="tsx" setup>
import { ref, onMounted, watch } from "vue";
import { type People } from "~/types/people";
import { useApi } from "~/composables/useApi";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { InfoFilled, Delete, Edit } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { ElAvatar, ElButton, ElPopconfirm, ElTooltip, type Column, type SortBy } from "element-plus";
import { NuxtLink } from "#components";
import customTable from "~/components/trums/table/customTable.vue";


definePageMeta({
  middleware: ["auth", "app"],
});

const router = useRouter();
const token = useCookie("token");
const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? `/human-capital-management/people/form/${name}`
    : "/human-capital-management/people/form/add";
  router.push({ path, query: { mode, unique_id } });
};

const showTable = ref<boolean>(true);
const loading = ref<boolean>(false);

const toggleView = () => {
  showTable.value = !showTable.value;
};

const columns: Column<People>[] = [
  {
    title: "Photo",
    key: "photo",
    sortable: true,
    width: 100,
    cellRenderer: ({ rowData }: { rowData: People }) =>
      h(
        'div',
        { class: 'demo-basic--circle flex gap-2' },
        [
          // 🟢 Avatar utama
          h('div', { class: 'block' }, [
            h(ElAvatar, { size: 30, src: `${baseImageURL}/${rowData.photo?.image_path}/${rowData.photo?.filename}` }),
          ]),
        ]
      ),
  },
  {
    title: "Name",
    key: "name",
    sortable: true,
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`/human-capital-management/people/${row.unique_id}`} class={"text-blue-600"}>
        {row.name}
      </NuxtLink>
    ),
  },
  {
    title: "Email",
    key: "email",
    width: 100,
  },
  {
    title: "Phone",
    key: "phone",
    width: 100,
  },
  {
    title: "Departement",
    key: "departement_name",
    width: 100,
  },
  {
    title: "Position",
    key: "position_name",
    width: 100,
    
  },
  {
    title: "Aksi",
    key: "action",
    width: 100,
    cellRenderer: ({ rowData }: any) =>
      h('div', { class: 'flex justify-center gap-2' }, [
        // 🟡 Tombol Edit dengan Tooltip
        h(
          ElTooltip,
          {
            content: 'Edit',
            placement: 'top'
          },
          {
            default: () => 
              h(ElButton, {
                type: 'warning',
                icon: Edit,
                circle: true,
                plain: true,
                onClick: () => navigateToForm('update', rowData.name, rowData.unique_id),
              })
          }
        ),

        // 🔴 Tombol Delete dengan Popconfirm (tanpa nested Tooltip)
        h(
          ElPopconfirm,
          {
            title: 'Are you sure to delete this?',
            'confirm-button-text': 'Yes',
            'cancel-button-text': 'No',
            icon: InfoFilled,
            'icon-color': '#626AEF',
            onConfirm: () => handleDelete(rowData),
          },
          {
            reference: () => 
              h(ElButton, {
                type: 'danger',
                icon: Delete,
                circle: true,
                plain: true,
              })
          }
        ),
      ]),
  }
];

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const api = useApi();

// const people = ref<Pagination<People[]>>();
const limit = ref(10);
const currentPage = ref(1);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  sort: null,
  limit: `${limit.value}`,
  offset: `${currentPage.value}`,
  table: "people",
});

const { data } = await useFetchApi<ResponsePagination<People[]>>('/search', 'search-people', 'post', request_search.value);


watch(request_search.value, () => refreshNuxtData('search-people'), {immediate: true});

const fetchData = async () => {
  const { data: newData } = await useFetch<ResponsePagination<People[]>>(
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

const handleDelete = async (row: People) => {
  loading.value = true;
  if (row.gid === null) {
    try {
      const response = await useFetch(
        `${config.public.baseURL}/people-delete`,
        {
          method: "delete",
          body: [row.unique_id],
          lazy: true,
          headers: token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {},
        }
      );
      if (response.status.value == "success") {
        await refreshNuxtData("people");
        await fetchData();
        ElMessage.success("Data Berhasil Dihapus");
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message}`);
    } finally {
      loading.value = false;
    }
  } else {
    ElMessage.error("Data tidak dapat dihapus karena memiliki oidc");
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
//     const response = await api.get(`/people-read`);
//     people.value = response.data.data;
//   } catch (error) {
//     console.error("Gagal memuat data:", error);
//   }
// };
const handleSizeChange = (val: number) => {
  loading.value = true;
};
const handleCurrentChange = (val: number) => {
  // currentPage.value = val;
  request_search.value.offset = val.toString();
};

const onSort = (sortBy: SortBy) => {
  console.log('sort', sortBy.key);
  console.log(request_search.value);
  const data:RequestSearch = {...request_search.value};
  data.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  };
  request_search.value = data;

}

// onMounted(async () => {
//   await fetchData();
// });
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
        >New People</el-button
      >
    </el-row>
    <customTable
      :column-sort="onSort"
      :columns="columns"
      :data="data?.data ?? []"
    />
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next" :total="data?.total_data" @next-click="handleCurrentChange" @prev-click="handleCurrentChange" @change="handleCurrentChange" />
    </div>
  </TrumsWrapper>
</template>
