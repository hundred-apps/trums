<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import { Eleme, Setting, SetUp } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  type InputInstance,
  type MainInstance,
  ElButton,
  ElTag,
  ElText,
  ElCheckbox,
  TableV2FixedDir,
  ElPopover,
  ElIcon,
  ElMessage,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import type { Inspection } from "~/types/inspection";
import { formatDate } from "@vueuse/core";
import type { FunctionalComponent } from "vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inspections-read",
  name: "List Of Inspection",
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "inspections",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data, status, refresh } = await useAsyncData(
  "fetch-inspection",
  async () => {
    const res = await useFetchApi<ResponsePagination<Inspection[]>>(
      `/search`,
      "fetch-inspection",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const inspections = ref<Inspection[]>([]);
const inspectionsPaginate = ref<Pagination<Inspection[]>>();
const tmpInspections = ref<Inspection[]>([]);
const loading = ref<boolean>(false);
const search = ref("");
const popoverRef = ref();
const axios = useApi();
const router = useRouter();
const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "inspection_date",
  "condition",
  "status",
  "action",
  "setup",
]);

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

const filterTableData = computed(() =>
  inspections.value.filter(
    (data) =>
      !search.value ||
      data.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
      data.unique_id.toLowerCase().includes(search.value.toLowerCase()) ||
      data.status.toLowerCase().includes(search.value.toLowerCase()) ||
      data.condition?.toLowerCase().includes(search.value.toLowerCase()) ||
      formatLocalDate(data.inspection_date)
        .toLowerCase()
        .includes(search.value.toLowerCase())
  )
);

const filteredColumn = computed(() => {
  return columnInspection.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const columnInspection: ColumnTable<Inspection>[] = [
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
          privilege: _data?.privilege ?? [],
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
    key: "unique_code",
    title: "Unique Code",
    dataKey: "unique_code",
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`inspection/${row.unique_id}`} class={"text-blue-500"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "inspection_date",
    title: "Tanggal Inspeksi",
    dataKey: "inspection_date",
    width: 250,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <ElText>{formatLocalDate(row.inspection_date)}</ElText>
    ),
  },
  {
    key: "condition",
    title: "Kondisi",
    dataKey: "condition",
    width: 250,
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 150,
    cellRenderer: ({ rowData: row }) =>
      row.status == "draft" ? (
        <ElTag type="info">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "progress" ? (
        <ElTag type="success">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "repair" ? (
        <ElTag type="warning">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "cancel" ? (
        <ElTag type="danger">{row.status.toUpperCase()}</ElTag>
      ) : (
        <ElTag type="primary">{row.status.toUpperCase()}</ElTag>
      ),
  },
  {
    key: "action",
    title: "Action",
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <ElButton size="small" onClick={() => onEdit(row)}>
    //       Edit
    //     </ElButton>
    //     <ElButton size="small" type="danger" onClick={() => onDelete(row)}>
    //       Hapus
    //     </ElButton>
    //   </>
    // ),
    width: 70,
    cellRenderer: ({ rowData }: { rowData: Inspection }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = "inspection/add?id=" + rowData.unique_id;
        }
        if (command === "delete") {
          onDelete(rowData);
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
    align: "center",
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

// columnInspection.unshift({
//   key: "selection",
//   width: 50,
//   maxWidth: 50,
//   align: "center",
//   cellRenderer: ({ rowData }) => {
//     const onChange = (value: CheckboxValueType) => (rowData.checked = value);
//     return <SelectionCell value={rowData.checked} onChange={onChange} />;
//   },
//   headerCellRenderer: () => {
//     const _data = unref(inspections);
//     const onChange = (value: CheckboxValueType) =>
//       (inspections.value = _data.map((row: any) => {
//         row.checked = value;
//         return row;
//       }));
//     const allSelected = _data.every((row: any) => row.checked);
//     const containsChecked = _data.some((row: any) => row.checked);

//     return (
//       <SelectionCell
//         value={allSelected}
//         intermediate={containsChecked && !allSelected}
//         onChange={onChange}
//       />
//     );
//   },
// });

columnInspection[columnInspection.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={column_selected.value}>
                  {columnInspection
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

const onSelection = (event: CheckboxValueType) => {
  console.log(event);
};

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

const onDelete = async (value: Inspection) => {
  console.log("deleted", value);
};
const onEdit = async (value: Inspection) => {
  const unique_id = useCookie("unique_id");
  unique_id.value = value.unique_id;
  router.push(`inspection/add`);
  // console.log('edited',value);
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const onRefreshData = () => refresh();

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

watch(request_search.value, () => onRefreshData(), {
  immediate: true,
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
      <NuxtLink class="el-button el-button--primary" href="inspection/add"
        >New Inspection</NuxtLink
      >
      <el-button
        size="default"
        @click="onRefreshData"
        :icon="Eleme"
        :loading="status === 'pending'"
        >Reload</el-button
      >
    </el-row>
    <CustomTable
      @sort-change="onSort"
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :loading="status === 'pending'"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes"
        :total="data?.total_data"
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>
