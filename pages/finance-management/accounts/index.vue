<script lang="tsx" setup>
import { ref, onMounted, computed } from "vue";
import { Eleme, SetUp, Filter, Setting } from "@element-plus/icons-vue";
import {
  type Column,
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
} from "element-plus";
import { sampleAccount, type Account } from "~/types/finance/account";
import { formatDate } from "@vueuse/core";
import type { FunctionalComponent } from "vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "app"],
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "accounts",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

// Data state
const { data, refresh, status } = await useAsyncData(
  "fetch-account",
  async () => {
    const res = await useFetchApi<ResponsePagination<Account[]>>(
      `/search`,
      "fetch-account",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const loading = ref<boolean>(false);
const search = ref("");
const popoverRef = ref();
const axios = useApi();
const router = useRouter();
const column_selected = ref<string[]>([
  "selection",
  "code",
  "name",
  "type",
  "created_at",
  "operations",
  "setup",
]);

// Type untuk Selection Cell
type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

// Kolom yang ditampilkan berdasarkan seleksi
const filteredColumn = computed(() => {
  return columnAccount.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

// Definisi kolom tabel
const columnAccount: ColumnTable<Account>[] = [
  {
    key: "code",
    title: "Kode Akun",
    dataKey: "code",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/finance-management/accounts/${row.unique_id}`}
        class={"text-blue-500"}
      >
        {row.code}
      </NuxtLink>
    ),
  },
  {
    key: "name",
    title: "Nama Akun",
    dataKey: "name",
  },
  {
    key: "type",
    title: "Tipe Akun",
    dataKey: "type",
    width: 150,
    align: "center",
    cellRenderer: ({ rowData: row }) =>
      row.type === "asset" ? (
        <ElTag type="success">{row.type.toUpperCase()}</ElTag>
      ) : row.type === "liability" ? (
        <ElTag type="danger">{row.type.toUpperCase()}</ElTag>
      ) : row.type === "revenue" ? (
        <ElTag type="warning">{row.type.toUpperCase()}</ElTag>
      ) : row.type === "expense" ? (
        <ElTag type="info">{row.type.toUpperCase()}</ElTag>
      ) : (
        <ElTag type="primary">{row.type.toUpperCase()}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox
                    value="asset"
                    v-model={request_search.value.column[0].type}
                  >
                    Asset
                  </ElCheckbox>
                  <ElCheckbox
                    value="liability"
                    v-model={request_search.value.column[0].type}
                  >
                    Liability
                  </ElCheckbox>
                  <ElCheckbox
                    value="revenue"
                    v-model={request_search.value.column[0].type}
                  >
                    Revenue
                  </ElCheckbox>
                  <ElCheckbox
                    value="expense"
                    v-model={request_search.value.column[0].type}
                  >
                    Expense
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
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <NuxtLink
    //       class="el-button el-button--small"
    //       href={`/finance-management/accounts/add?id=${row.unique_id}`}
    //     >
    //       Edit
    //     </NuxtLink>
    //     <ElButton size="small" type="danger" onClick={() => onDelete(row)}>
    //       Hapus
    //     </ElButton>
    //   </>
    // ),
    cellRenderer: ({ rowData }: { rowData: Account }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/finance-management/accounts/add?id=${rowData.unique_id}`;
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

// Tambahkan kolom seleksi di awal
columnAccount.unshift({
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

// Tambahkan setup kolom di akhir
columnAccount[columnAccount.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                {columnAccount.map((value) =>
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

// Komponen Selection Cell
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

// Handler untuk delete
const onDelete = async (value: Account) => {
  try {
    const response = await axios.delete(`/account/${value.unique_id}`);
    ElMessage.success("Account berhasil dihapus");
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "Gagal menghapus account");
  }
};

// Handler untuk edit
const onEdit = async (value: Account) => {
  router.push(`account/edit/${value.unique_id}`);
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onSort = async (sortBy: SortBy) => {
  // console.log('sort', sortBy.key);
  // console.log(request_search.value);
  // const data:RequestSearch = {...request_search.value};
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

// Watch search query
watchDebounced(request_search.value, () => onRefresh(), { debounce: 500 });

const onRefresh = () => {
  refresh();
};
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input v-model="search" size="default" placeholder="Cari akun..." />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="accounts/add"
      >
        Tambah Akun Baru
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
    </el-row>

    <CustomTable
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :loading="status == 'pending'"
      :column-sort="onSort"
    />

    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data"
        :current-page="data?.currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>
