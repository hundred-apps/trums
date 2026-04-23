<template>
  <TrumsWrapper>
    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari alamat..."
          clearable
        />
      </el-col>

      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/master/address/add"
      >
        Tambah Alamat Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => onRefresh()"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="batchDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <!-- Table -->
    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="status == 'pending'"
      :column-sort="onSort"
      @selection-change="handleSelectionChange"
    />

    <!-- Pagination -->
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes"
        :total="data?.total_data ?? 0"
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp, Filter, Setting } from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElCheckboxGroup,
  ElTag,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
} from "element-plus";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { AddressType } from "~/types/address";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "address-read",
  name: "List Of Address",
});

const address_type = ref<string>("all");

// Search request
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "address",
  flag: "list",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

// Data state
const { data, status, refresh } = await useAsyncData(
  "get-addresses",
  async () => {
    const res = await useFetchApi<ResponsePagination<AddressType[]>>(
      `/search`,
      "get-addresses",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const selectedAddresses = ref<AddressType[]>([]);
const loading = ref<boolean>(false);
const columnsSelected = ref<string[]>([
  "selection",
  "contact_name",
  "address_name",
  "codepos",
  "street",
  "village",
  "city",
  "province",
  "operations",
  "setup",
]);

// Computed
const totalProvinces = computed(() => {
  const provinces = new Set(
    (data.value?.data ?? []).map((address) => address.province)
  );
  return provinces.size;
});

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

// Columns
const columns: ColumnTable<AddressType>[] = [
  {
    key: "contact_name",
    title: "Nama Kontak",
    dataKey: "contact_name",
    fixed: true,

    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <div class="flex items-center">
        <span class="font-medium">{rowData.contact_name || "-"}</span>
        {!rowData.contact_id && (
          <ElTag size="small" type="warning" class="ml-2">
            Mandiri
          </ElTag>
        )}
      </div>
    ),
  },
  {
    key: "address_name",
    title: "Nama Alamat",
    dataKey: "address_name",
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span class="text-gray-600">{rowData.address_name}</span>
    ),
  },
  {
    key: "codepos",
    title: "Kode Pos",
    dataKey: "codepos",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <el-text class="w-150px mb-2" truncated>
        {rowData.codepos || "-"}
      </el-text>
    ),
  },
  {
    key: "street",
    title: "Jalan",
    dataKey: "street",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <el-text class="w-150px mb-2" truncated>
        {rowData.street || "-"}
      </el-text>
    ),
  },
  {
    key: "village",
    title: "Desa/Kelurahan",
    dataKey: "village",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span>{rowData.village}</span>
    ),
  },
  {
    key: "city",
    title: "Kota",
    dataKey: "city",
    width: 120,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span>{rowData.city}</span>
    ),
  },
  {
    key: "province",
    title: "Provinsi",
    dataKey: "province",
    width: 120,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span>{rowData.province}</span>
    ),
  },
  {
    key: "created_at",
    title: "Dibuat Pada",
    dataKey: "created_at",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span>{formatLocalDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "updated_at",
    title: "Diupdate Pada",
    dataKey: "updated_at",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <span>{formatLocalDate(rowData.updated_at)}</span>
    ),
  },
  {
    key: "version",
    title: "Versi",
    dataKey: "version",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: AddressType }) => (
      <ElTag size="small">{rowData.version}</ElTag>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: AddressType }) => {
    //   const _data = unref(data);

    //   return (
    //     <div class="flex gap-2">
    //       <NuxtLink
    //         class="el-button el-button--small el-button--primary"
    //         href={`/master/address/add?id=${rowData.unique_id}`}
    //       >
    //         Edit
    //       </NuxtLink>
    //       <el-button
    //         size="small"
    //         type="danger"
    //         onClick={() => onDelete([rowData.unique_id])}
    //       >
    //         Hapus
    //       </el-button>
    //     </div>
    //   );
    // },
    // width: 200,
    // align: "center",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: AddressType }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/master/address/add?id=${rowData.unique_id}`;
        }
        if (command === "delete") {
          onDelete([rowData.unique_id]);
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
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

// Add selection column
columns.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
  fixed: true,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const _data = unref(data);
    const onChange = (value: CheckboxValueType) => {
      if (_data?.data) {
        _data.data.forEach((item) => {
          item.checked = value as boolean;
        });
      }
    };
    const allSelected = _data?.data?.every((row) => row.checked) || false;
    const containsChecked = _data?.data?.some((row) => row.checked) || false;

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

// Setup column configuration
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover trigger="click" width={200}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={columnsSelected.value}>
                  {columns
                    .filter(
                      (col) => col.key !== "selection" && col.key !== "setup"
                    )
                    .map((col) => (
                      <ElCheckbox
                        key={col.key}
                        value={col.key!.toString()}
                        label={col.title}
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

// Computed
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const handleSelectionChange = (selection: AddressType[]) => {
  selectedAddresses.value = selection;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  onRefresh();
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
  onRefresh();
};

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      "Apakah Anda yakin ingin menghapus alamat yang dipilih?",
      "Konfirmasi Hapus",
      {
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    if (confirmed) {
      await useFetchApi<BaseResponse<any>>(
        "/address-delete",
        "delete-addresses",
        "post",
        uniques
      );

      ElMessage.success("Alamat berhasil dihapus");
      onRefresh();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Gagal menghapus alamat");
    }
  }
};

const batchDelete = async () => {
  const ids =
    data.value?.data
      ?.filter((item) => item.checked)
      .map((item) => item.unique_id) || [];

  if (ids.length > 0) {
    await onDelete(ids);
  }
};

const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order === OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  onRefresh();
};

const onChangeAddressFilter = (val: any) => {
  if (val === "with_contact") {
    request_search.value.column = [
      {
        contact_id: ["not null"],
      },
    ];
  } else if (val === "standalone") {
    request_search.value.column = [
      {
        contact_id: ["null"],
      },
    ];
  } else {
    request_search.value.column = [];
  }
  onRefresh();
};

// Watch search query
watchDebounced(request_search, () => onRefresh(), {
  debounce: 500,
  deep: true,
});

const onRefresh = () => refresh();
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

:deep(.ml-2) {
  margin-left: 0.5rem;
}

:deep(.font-medium) {
  font-weight: 500;
}

:deep(.text-gray-600) {
  color: #6b7280;
}

:deep(.street-cell) {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
