<script lang="tsx" setup>
import { ref, onMounted, type FunctionalComponent } from "vue";
import {
  type Column,
  type CheckboxValueType,
  type InputInstance,
  type MainInstance,
  ElButton,
  ElTag,
  ElText,
  ElCheckbox,
  paginationEmits,
  type SortBy,
  TableV2SortOrder,
  type SortState,
  ElPopover,
  type HeaderCellSlotProps,
  ElIcon,
  TableV2FixedDir,
  ElMessage,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import type { Maintenance } from "~/types/maintenance";
import type { Pagination } from "~/types/pagination";
import {
  CircleCheckFilled,
  CircleClose,
  Eleme,
  Filter,
  Setting,
  SetUp,
} from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { SelectionCellProps } from "~/types/selection_cell_prop";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import { NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "maintenances-read",
  name: "List Of Maintenances",
});

const sortState = ref<SortState>({
  maintenance_date: TableV2SortOrder.DESC,
});
const paginations = ref<Pagination<Maintenance[]>>();
const maintenanceSelect = ref<Maintenance[]>([]);
const loading = ref<boolean>(false);
const search = ref("");

const shouldFilter = ref(false);
const filters = ref<[]>([]);
const filterMaintenanceType = ref<[]>([]);
const popoverRef = ref();
const dataPerPage = ref(10);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "maintenances",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const axios = useApi();

const { data, pending } = await useFetchApi<ResponsePagination<Maintenance[]>>(
  `/search`,
  "maintenances",
  "post",
  request_search.value
);

const onRefresh = () => refreshNuxtData("maintenances");

const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "inventory",
  "responsible",
  "maintenance_date",
  "start_date",
  "end_date",
  "priority",
  "status",
  "action",
  "setup",
]);

const filteredColumn = computed(() => {
  return columnMaintenance.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const columnMaintenance: ColumnTable<any>[] = [
  {
    key: "unique_code",
    title: "Unique Code",
    dataKey: "unique_code",
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/inspection-maintenance/maintenance/${row.unique_id}`}
        class={"text-blue-600"}
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "inventory",
    title: "Item",
    dataKey: "inventory",
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.inventory?.catalogue?.name ?? "-"}</p>
    ),
  },
  {
    key: "responsible",
    title: "Penanggung Jawab",
    dataKey: "responsible.name",
    width: 250,
  },
  {
    key: "maintenance_date",
    title: "Tgl Maintenance",
    dataKey: "maintenance_date",
    width: 200,
    align: "center",
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <ElText>
        {row.maintenance_date == null
          ? "-"
          : formatLocalDate(row.maintenance_date)}
      </ElText>
    ),
  },
  {
    key: "duration",
    title: "Durasi",
    dataKey: "duration",
    width: 250,
    sortable: true,
    cellRenderer: ({ rowData: row }) => <ElText>{row.duration}</ElText>,
  },
  {
    key: "priority",
    title: "Prioritas",
    dataKey: "priority",
    width: 120,
    sortable: true,
    align: "center",
    cellRenderer: ({ rowData: row }) => {
      if (row.priority == "low") {
        return (
          <el-tag type="primary">{(row.priority ?? "").toUpperCase()}</el-tag>
        );
      } else if (row.priority == "medium") {
        return (
          <el-tag type="success">{(row.priority ?? "").toUpperCase()}</el-tag>
        );
      } else if (row.priority == "high") {
        return (
          <el-tag type="danger">{(row.priority ?? "").toUpperCase()}</el-tag>
        );
      } else {
        return (
          <el-tag type="primary">{(row.priority ?? "").toUpperCase()}</el-tag>
        );
      }
    },
  },
  {
    key: "start_date",
    title: "Tgl Mulai",
    width: 200,
    align: "center",
    cellRenderer: ({ rowData: row }) => (
      <ElText>
        {row.start_date == null ? "-" : formatLocalDate(row.start_date)}
      </ElText>
    ),
  },
  {
    key: "end_date",
    title: "Tgl Selesai",
    width: 200,
    align: "center",
    cellRenderer: ({ rowData: row }) => (
      <ElText>
        {row.end_date == null ? "-" : formatLocalDate(row.end_date)}
      </ElText>
    ),
  },

  {
    key: "is_repeate",
    title: "Rutin",
    width: 70,
    cellRenderer: ({ rowData: row }) =>
      row.is_repeate ? (
        <el-icon>
          <CircleCheckFilled />
        </el-icon>
      ) : (
        <el-icon>
          <CircleClose />
        </el-icon>
      ),
  },
  {
    key: "type",
    title: "Type Maintenance",
    width: 200,
    align: "center",
    cellRenderer: ({ rowData: row }) =>
      row.type == "corrective" ? (
        <ElTag type="info">{(row.type ?? "").toUpperCase()}</ElTag>
      ) : (
        <ElTag type="warning">{(row.type ?? "").toUpperCase()}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Maintenance</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <el-checkbox-group v-model={filters.value}>
                  <el-checkbox value="corrective" name="filters">
                    Corrective
                  </el-checkbox>
                  <el-checkbox value="preventive" name="filters">
                    Preventive
                  </el-checkbox>
                </el-checkbox-group>
                <div class="el-table-v2__demo-filter">
                  <ElButton text onClick={onFilter}>
                    Confirm
                  </ElButton>
                  <ElButton text onClick={onReset}>
                    Reset
                  </ElButton>
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
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData: row }) =>
      row.status == "waiting" ? (
        <ElTag type="info">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "approve" ? (
        <ElTag type="primary">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "repair" ? (
        <ElTag type="warning">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "cancel" ? (
        <ElTag type="danger">{row.status.toUpperCase()}</ElTag>
      ) : (
        <ElTag type="success">{row.status.toUpperCase()}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <el-checkbox-group v-model={filters.value}>
                  <el-checkbox value="waiting" name="filters">
                    Waiting
                  </el-checkbox>
                  <el-checkbox value="approve" name="filters">
                    Approve
                  </el-checkbox>
                  <el-checkbox value="repair" name="filters">
                    Repair
                  </el-checkbox>
                  <el-checkbox value="cancell" name="filters">
                    Cancell
                  </el-checkbox>
                  <el-checkbox value="done" name="filters">
                    Done
                  </el-checkbox>
                </el-checkbox-group>
                <div class="el-table-v2__demo-filter">
                  <ElButton text onClick={onFilter}>
                    Confirm
                  </ElButton>
                  <ElButton text onClick={onReset}>
                    Reset
                  </ElButton>
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
    // width: 150,
    // align: "center",
    width: 70,
    cellRenderer: ({ rowData }: { rowData: Maintenance }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          // onEdit(rowData);
          window.location.href =
            "/inspection-maintenance/maintenance/add?unique_id=" +
            rowData.unique_id;
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

columnMaintenance.unshift({
  key: "selection",
  width: 50,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const onChange = (value: CheckboxValueType) => {
      data.value?.data?.forEach((item) => {
        item.checked = value as boolean;
      });
    };
    return (
      <SelectionCell
        value={data.value?.data?.every((item) => item.checked) || false}
        onChange={onChange}
      />
    );
  },
});

columnMaintenance[columnMaintenance.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={column_selected.value}>
                  {columnMaintenance
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

const onFilter = () => {
  // popoverRef.value.hide()
  // if (shouldFilter.value) {
  //   data.value = generateData(columns, 100, 'filtered-')
  // } else {
  //   data.value = generateData(columns, 200)
  // }
  console.log(filters.value);
};

const onReset = () => {
  shouldFilter.value = false;
  onFilter();
};

const onDelete = async (value: Maintenance) => {
  console.log("deleted", value);
};
const onEdit = async (value: Maintenance) => {
  window.location.href = "maintenance/add?unique_id=" + value.unique_id;
};

const onSort = ({ key, order }: SortBy) => {
  sortState.value[key] = order;

  const sort: Pagination<Maintenance[]> = paginations.value!;
  sort.query.reverse();
  paginations.value = sort;
};

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Maintenance?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    const ids =
      (data.value?.data ?? [])
        .filter((item) => item.checked)
        .map((item) => item.unique_id!) || [];

    // Jika sampai sini, user klik Delete
    await submitToDelete(ids);
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log("Delete cancelled");
  }
};

const submitToDelete = async (ids: string[]) => {
  loading.value = false;
  try {
    const response = await useFetchApi<ResponsePagination<string[]>>(
      `/maintenances-delete`,
      "maintenances-delete",
      "post",
      ids
    );
    console.log("response", response.status.value);
    if (response.status.value == "success") {
      onRefresh();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // fetchMaintenances();
});
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input v-model="search" size="default" placeholder="Type to search"
      /></el-col>
      <NuxtLink href="maintenance/add" class="el-button el-button--primary"
        >New Maintenance</NuxtLink
      >
      <el-button
        size="default"
        @click="onRefresh"
        :loading-icon="Eleme"
        :loading="pending"
        >Reload Data</el-button
      >
      <el-button type="danger" :disabled="!hasSelected" @click="bulkDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>
    <CustomTable
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :column-sort="onSort"
      :sort-state="sortState"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="paginations?.total_page"
      />
    </div>
  </TrumsWrapper>
</template>
