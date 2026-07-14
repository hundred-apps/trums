<script lang="tsx" setup>
import { ref, onMounted, watch } from "vue";
import { type People } from "~/types/people";
import { useApi } from "~/composables/useApi";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { useRouter } from "vue-router";
import { InfoFilled, Delete, Edit, Setting } from "@element-plus/icons-vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { canAccess } from "#imports";
import {
  ElAvatar,
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopconfirm,
  ElTooltip,
  type Column,
  type SortBy,
} from "element-plus";
import { NuxtLink } from "#components";
import customTable from "~/components/trums/table/customTable.vue";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "peoples-read",
  name: "List Of Peoples",
});

const router = useRouter();
const token = useCookie("token");
const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const { isMobile } = useDevice();

const navigateToForm = (
  mode: string,
  name?: string,
  unique_id?: string | null
) => {
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

const columns: ColumnTable<People>[] = [
  {
    title: "Photo",
    key: "photo",
    sortable: true,
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: People }) =>
      h(
        "div",
        { class: "demo-basic--circle flex items-center justify-center gap-2" },
        [
          // 🟢 Avatar utama
          h(ElAvatar, {
            size: 30,
            src: `${baseImageURL}/${rowData.photo?.image_path}/${rowData.photo?.filename}`,
          }),
        ]
      ),
  },
  {
    title: "Name",
    key: "name",
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/human-capital-management/people/${row.unique_id}`}
        class={"text-blue-600"}
      >
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
    width: 150,
  },
  {
    title: "Position",
    key: "position_name",
    width: 100,
  },
  {
    title: "Aksi",
    key: "action",
    // cellRenderer: ({ rowData }: any) =>
    //   h("div", { class: "flex justify-center gap-2" }, [
    //     // 🟡 Tombol Edit dengan Tooltip

    //     canAccess("update_people", data?.value?.privilege ?? []) &&
    //       h(
    //         ElTooltip,
    //         {
    //           content: "Edit",
    //           placement: "top",
    //         },
    //         {
    //           default: () =>
    //             h(ElButton, {
    //               type: "warning",
    //               icon: Edit,
    //               circle: true,
    //               plain: true,
    //               onClick: () =>
    //                 navigateToForm("update", rowData.name, rowData.unique_id),
    //             }),
    //         }
    //       ),
    //     // 🔴 Tombol Delete dengan Popconfirm (tanpa nested Tooltip)
    //     canAccess("delete_people", data?.value?.privilege ?? []) &&
    //       h(
    //         ElPopconfirm,
    //         {
    //           title: "Are you sure to delete this?",
    //           "confirm-button-text": "Yes",
    //           "cancel-button-text": "No",
    //           icon: InfoFilled,
    //           "icon-color": "#626AEF",
    //           onConfirm: () => handleDelete(rowData),
    //         },
    //         {
    //           reference: () =>
    //             h(ElButton, {
    //               type: "danger",
    //               icon: Delete,
    //               circle: true,
    //               plain: true,
    //             }),
    //         }
    //       ),
    //   ]),
    cellRenderer: ({ rowData }: { rowData: People }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          // window.location.href = `/sales/quotation/add?id=${rowData.unique_id}`;
          navigateToForm("update", rowData.name ?? "", rowData.unique_id ?? "");
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
                  Delete
                </ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      );
    },
    width: 70,
    align: "center",
  },
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

const { data, refresh } = await useAsyncData("search-people", async () => {
  const res = await useFetchApi<ResponsePagination<People[]>>(
    `/search`,
    "search-people",
    "post",
    request_search.value
  );
  return res.data.value;
});

const onRefreshData = () => refresh();

watch(
  () => request_search.value,
  () => onRefreshData(),
  {
    deep: true,
  }
);

const handleDelete = async (row: People) => {
  loading.value = true;

  if (row.unique_id !== null) {
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
          console.log("masuk confirm");
          const response = await useFetch(
            `${config.public.baseURL}/people-delete`,
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
            refreshNuxtData("search-people");
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
  } else {
    ElMessage.error("Kesalahan saat menghapus data!");
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
  request_search.value.limit = `${val}`;
};
const handlePageChange = (val: number) => {
  request_search.value.offset = `${val}`;
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  request_search.value = data;
};

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
          size="default"
          placeholder="Type to search"
      /></el-col>
      <el-button
        v-if="canAccess('create_people', data?.privilege ?? [])"
        size="default"
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
      <el-pagination
        background
        :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
        :total="data?.total_data"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        size="small"
      />
    </div>
  </TrumsWrapper>
</template>

<style scoped>
:deep(.el-table__cell) {
  padding: 5px !important;
}
</style>
