<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "app"],
});
import { ref, onMounted, type FunctionalComponent } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import { InfoFilled, SetUp } from "@element-plus/icons-vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import { Filter } from "@element-plus/icons-vue";

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
]);

const popoverRef = ref();
const config = useRuntimeConfig();

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Inventory[]>>(
      `/search`,
      "inventories",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<Inventory[]>;
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

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const loading = ref<boolean>(false);
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      is_traceable: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inventories",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

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
const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(
  `/search`,
  "inventories",
  "post",
  request_search.value
);

const availableColumn: Column<Inventory>[] = [
  {
    title: "Serial Number",
    key: "sn",
    dataKey: "sn",
    width: 200,
  },
  {
    title: "Item",
    key: "catalogue.name",
    dataKey: "catalogue.name",
    width: 200,
  },
  {
    title: "Location",
    key: "location.name",
    dataKey: "location.name",
    width: 200,
  },
  {
    title: "Quantity",
    key: "quantity",
    dataKey: "quantity",
    sortable: true,
    width: 100,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>
          {row.quantity} {row.unit_name}
        </p>
      </>
    ),
  },
  {
    title: "Traceable",
    key: "is_traceable",
    dataKey: "is_traceable",
    width: 100,
    cellRenderer: ({ rowData: row }) =>
      row.is_traceable ? (
        <ElTag type="primary">{"Yes"}</ElTag>
      ) : (
        <ElTag type="info">{"No"}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Traceable</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox
                    value={true}
                    v-model={request_search.value.column[0].is_traceable}
                  >
                    Traceable
                  </ElCheckbox>
                  <ElCheckbox
                    value={false}
                    v-model={request_search.value.column[0].is_traceable}
                  >
                    Not Traceable
                  </ElCheckbox>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    title: "Operasi",
    key: "operasi",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => handleEdit(row)}>
          Edit
        </ElButton>
        <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>
          Delete
        </ElButton>
      </>
    ),
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

availableColumn[6].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                {availableColumn.map((value) =>
                  value.key != "selection" && value.key != "setup" ? (
                    <ElCheckbox
                      onChange={() => console.log("ok")}
                      value={value.key!.toString()}
                      v-model={column_selected.value}
                    >
                      {value.title}
                    </ElCheckbox>
                  ) : (
                    <></>
                  )
                )}
              </div>
            </div>
          ),
          reference: () => (
            <ElIcon class="cursor-pointer">
              <SetUp />
            </ElIcon>
          ),
        }}
      </ElPopover>
    </div>
  );
};

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

availableColumn.unshift({
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

watch(request_search, fetchData, { immediate: true });

onMounted(() => {
  // fetchData();
});
</script>
<template>
  <div class="w-auto">
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
    <CustomTable
      :column-sort="onSort"
      :columns="filteredColumn"
      :data="data?.data ?? []"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data?.total_data"
      />
    </div>
  </div>
</template>
