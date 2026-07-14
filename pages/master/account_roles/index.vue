<script lang="tsx" setup>
import { ref, computed } from "vue";
import { Eleme, SetUp, Filter, Setting, Delete } from "@element-plus/icons-vue";
import {
  type CheckboxValueType,
  ElTag,
  ElText,
  ElButton,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  dayjs,
} from "element-plus";
import { formatDate } from "@vueuse/core";
import type { FunctionalComponent } from "vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import { NuxtLink } from "#components";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ColumnTable } from "~/types/ColumnTable";
import type { AccountRole } from "~/types/finance/account_role";
import type { ResponsePagination } from "~/types/response_pagination";

// ==================== PAGE META ====================
definePageMeta({
  middleware: ["auth", "app"],
});

// ==================== REQUEST SEARCH STATE ====================
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "account_roles",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

// ==================== DATA FETCHING (DUMMY) ====================
const { data, refresh, status } = await useAsyncData(
  "fetch-account-roles",
  async () => {
    const res = await useFetchApi<ResponsePagination<AccountRole[]>>(
      `/search`,
      "fetch-account-roles",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

// ==================== REACTIVE STATE ====================
const loading = ref<boolean>(false);
const popoverRef = ref();
const router = useRouter();
const column_selected = ref<string[]>([
  "selection",
  "code",
  "name",
  "created_at",
  "operations",
  "setup",
]);

// ==================== SELECTION CELL TYPE ====================
type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

// ==================== FILTERED COLUMN ====================
const filteredColumn = computed(() => {
  return columnAccountRole.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

// ==================== COLUMN DEFINITIONS ====================
const columnAccountRole: ColumnTable<AccountRole>[] = [
  {
    key: "code",
    title: "Kode Role",
    dataKey: "code",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/finance-management/account-roles/${row.unique_id}`}
        class={"text-blue-500"}
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "name",
    title: "Nama Role",
    dataKey: "name",
  },
  {
    key: "created_at",
    title: "Tanggal Dibuat",
    dataKey: "created_at",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <ElText>{formatLocalDate(row.created_at)}</ElText>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    cellRenderer: ({ rowData }: { rowData: AccountRole }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          router.push(
            `/master/account_roles/add?unique_id=${rowData.unique_id}`
          );
        }
        if (command === "delete") {
          bulkDelete([rowData.unique_id]);
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
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

// ==================== SELECTION COLUMN (UNSHIFT) ====================
columnAccountRole.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const _data = unref(data.value);
    const onChange = (value: CheckboxValueType) =>
      (data.value!.data = (_data?.data ?? []).map((row: any) => {
        row.checked = value;
        return row;
      }));
    const allSelected = _data?.data.every((row: any) => row.checked) ?? false;
    const containsChecked =
      _data?.data.some((row: any) => row.checked) ?? false;

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

// ==================== SETUP COLUMN HEADER (POPOVER) ====================
columnAccountRole[columnAccountRole.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                {columnAccountRole.map((value) =>
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

// ==================== SELECTION CELL COMPONENT ====================
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

// ==================== DELETE HANDLER (KOSONG) ====================
const onDelete = async (ids: string[]) => {
  // TODO: Implementasi delete
  console.log("Delete role:", ids);
  // ElMessage.success("Role berhasil dihapus");
};

// ==================== PAGINATION HANDLERS ====================
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

// ==================== SORT HANDLER ====================
const onSort = async (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

// ==================== WATCH FOR SEARCH ====================
watchDebounced(
  () => request_search.value,
  () => onRefresh(),
  { debounce: 500, deep: true }
);

// ==================== REFRESH FUNCTION ====================
const onRefresh = () => {
  refresh();
};

const bulkDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Account Role?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    // Jika sampai sini, user klik Delete
    await onDelete(ids);
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log("Delete cancelled");
  }
};

const getSelected = computed(() => {
  const ids =
    (data.value?.data ?? [])
      .filter((item) => item.checked)
      .map((item) => item.unique_id!) || [];
  return ids;
});

const hasSelected = computed(() => {
  const hasSelect = data.value?.data?.some((item) => item.checked) || false;
  return hasSelect;
});
</script>

<template>
  <TrumsWrapper>
    <!-- TOOLBAR -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari role..."
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/master/account_roles/add"
      >
        Tambah Role Baru
      </NuxtLink>
      <el-button
        size="default"
        @click="onRefresh"
        :loading-icon="Eleme"
        :icon="Eleme"
        :loading="loading"
      >
        Muat Ulang Data
      </el-button>
      <el-button
        size="default"
        type="danger"
        :disabled="!hasSelected"
        :loading="loading"
        :icon="Delete"
        @click="() => bulkDelete(getSelected)"
      >
        Hapus
      </el-button>
    </el-row>

    <!-- TABLE -->
    <CustomTable
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :loading="status == 'pending'"
      :column-sort="onSort"
    />

    <!-- PAGINATION -->
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data ?? 0"
        :current-page="data?.current_page ?? 1"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>
