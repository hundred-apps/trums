<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventory-movements-read",
  name: "List Of Inventory Movement",
});
import { ref, onMounted } from "vue";
import { InfoFilled, SetUp } from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  TableV2FixedDir,
  ElCheckbox,
  ElIcon,
  ElPopover,
  ElTag,
  type CheckboxValueType,
  type Column,
  type HeaderCellSlotProps,
  type SortBy,
  ElCheckboxGroup,
} from "element-plus";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import { NuxtLink } from "#components";
import type { InventoryMovement } from "~/types/inventory_movement";
import { Filter } from "@element-plus/icons-vue";

interface FormFilter {
  date_range: string[];
}

const ruleFormFilter = reactive<FormFilter>({
  date_range: ["", ""],
});

const loading = ref<boolean>(false);
const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "type",
  "from_name",
  "to_name",
  "setup",
]);
const search = ref("");
const router = useRouter();
const popoverRef = ref();
const availableColumn: Column<InventoryMovement>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
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
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`checkin/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Tipe",
    dataKey: "type",
    key: "type",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Type</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].type}
                  >
                    <ElCheckbox value="in">In</ElCheckbox>
                    <ElCheckbox value="out">Out</ElCheckbox>
                  </ElCheckboxGroup>
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
    title: "Sumber",
    dataKey: "from_name",
    key: "from_name",
    width: 200,
  },
  {
    title: "Tujuan",
    dataKey: "to_name",
    key: "to_name",
    width: 200,
  },
  {
    title: "Status",
    dataKey: "status",
    key: "status",
    width: 200,
    cellRenderer: ({ rowData: row }) => getStatus(row),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].status}
                  >
                    <ElCheckbox value="draft">Draft</ElCheckbox>
                    <ElCheckbox value="waiting">Waiting</ElCheckbox>
                    <ElCheckbox value="ready">Ready</ElCheckbox>
                    <ElCheckbox value="delivery">Delivery</ElCheckbox>
                    <ElCheckbox value="done">Done</ElCheckbox>
                  </ElCheckboxGroup>
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
    title: "Tgl Dibuat",
    dataKey: "created_at",
    key: "created_at",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
  {
    title: "Operasi",
    key: "",
    width: 250,

    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => handleEdit(row)}>
          Edit
        </ElButton>
        <DeleteButton
          size="small"
          onConfirm={() => handleDelete([row.unique_id])}
          onCancel={() => {}}
        />
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

availableColumn[8].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={column_selected.value}>
                  {availableColumn
                    .filter((c) => c.key !== "selection" && c.key !== "setup")
                    .map((c) => (
                      <ElCheckbox
                        key={c.key}
                        value={c.key!.toString()}
                        label={c.title}
                      />
                    ))}
                </ElCheckboxGroup>
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

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inventory_movement",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

// const getColumnSetup = () => {
//   return  ()
// }

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<InventoryMovement[]>>(
      `/search`,
      "inventory_movement",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<
        InventoryMovement[]
      >;
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

const { data } = await useFetchApi<ResponsePagination<InventoryMovement[]>>(
  `/search`,
  "inventory_movement",
  "post",
  request_search.value
);

const checkSelect = () => data?.value?.data.some((row) => row.checked);

const getStatus = (data: InventoryMovement) => {
  // 'draft','waiting','approve','done','cancelled','repair'

  if (data.status == "draft") {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "waiting") {
    return <ElTag type="warning">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "approve") {
    return <ElTag type="success">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "done") {
    return <ElTag type="primary">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "cancelled") {
    return <ElTag type="danger">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  }
};

const handleEdit = (row: any) => {
  console.log("Editing:", row);
};

const handleDelete = async (row: string[]) => {
  console.log("Editing:", row);
  try {
    const response = await useFetchApi(
      "/inventory-movement-delete",
      "inventory_movement",
      "post",
      row
    );
    console.log("response", response.status);
    if (response.status.value == "success") {
      ElMessage.success(`Berhasil`);
      await refreshNuxtData("inventory_movement");
    }
  } catch (e: any) {
    ElMessage.error(`${e.response?.data?.message ?? e}`);
  }
};

const deleteBulk = async () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  const ids = (checkeds ?? []).map((value) => value.unique_id);
  if (ids.length > 0) {
    handleDelete(ids);
  }
};

const onSort = async (sortBy: SortBy) => {
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

const add = (typecheck: string) => {
  const type = useCookie("type");
  type.value = typecheck;
  router.push("checkin/add");
};

watch(request_search, fetchData, { immediate: true });

const onSearch = (value: string) => {
  const request = { ...request_search.value };
  request.keyword = value;
  request_search.value = request;
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const shortcutsDate = [
  {
    text: "Last week",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const consigment = () => {
  const start = new Date(ruleFormFilter.date_range[0]).getTime() / 1000;
  const end = new Date(ruleFormFilter.date_range[1]).getTime() / 1000;
  console.log(start);
  console.log(end);
  const start_date = useCookie("start_date_consigment");
  const end_date = useCookie("end_date_consigment");
  start_date.value = start.toString();
  end_date.value = end.toString();
  router.push("consigment");
};

onMounted(() => {
  // loading.value = true;
  // setTimeout(() => {
  //   fetchData();
  //   loading.value = false;
  // }, 2000);
});
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
      <el-button size="default" @click="() => add('in')">CheckIn</el-button>
      <el-button size="default" @click="() => add('out')">CheckOut</el-button>
      <el-button size="default" @click="consigment">Consignment</el-button>
      <el-form
        :model="ruleFormFilter"
        class="ml-3"
        label-width="auto"
        style="max-width: 600px"
      >
        <el-form-item label="">
          <el-date-picker
            v-model="ruleFormFilter.date_range"
            type="daterange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcutsDate"
            size="default"
          />
        </el-form-item>
      </el-form>
      <el-popconfirm
        v-if="checkSelect()"
        width="220"
        :icon="InfoFilled"
        icon-color="#626AEF"
        title="Apakah Anda Yakin Ingin Menghapus Data ini?"
        @cancel="() => {}"
      >
        <template #reference>
          <el-button size="default" class="ml-3" type="danger"
            >Delete</el-button
          >
        </template>
        <template #actions="{ confirm, cancel }">
          <el-button size="small" @click="cancel">Batal</el-button>
          <el-button type="danger" size="small" @click="deleteBulk">
            Hapus
          </el-button>
        </template>
      </el-popconfirm>
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
        @next-click="paginationClick"
        @prev-click="paginationClick"
        @change="paginationClick"
      />
    </div>
  </TrumsWrapper>
</template>
