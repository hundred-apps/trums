<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="(data?.data ?? []).filter((item: Brands) => item.parent_id === null).length"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Brand Utama
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="(data?.data ?? []).filter((item: Brands) => item.parent_id !== null).length"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Sub Brand
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="totalSubBrands">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Sub Brand
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="data?.total_data ?? 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Brand
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari brand..."
          clearable
        />
      </el-col>
      <el-radio-group
        v-model="is_main_brand"
        class="mr-3"
        size="default"
        @change="(val) => onChangeBrandFilter(val as string)"
      >
        <el-radio-button label="Brand Utama" value="1" />
        <el-radio-button label="Sub Brand" value="0" />
      </el-radio-group>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/catalogue/brand/add"
      >
        Tambah Brand Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-brands')"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="batchDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <!-- Table -->
    <CustomTable
      :columns="columns"
      :data="data?.data ?? []"
      :loading="loading"
      @sort-change="onSort"
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
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { Brands } from "~/types/brand";
import type { ColumnTable } from "~/types/ColumnTable";
import { refreshNuxtData } from "#app";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "brands-read",
  name: "List Of Brands",
});

const is_main_brand = ref<string>("1");

// Search request
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "brands",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

// Data state
const { data } = await useFetchApi<ResponsePagination<Brands[]>>(
  "/search",
  "get-brands",
  "post",
  request_search.value
);

const selectedBrands = ref<Brands[]>([]);
const loading = ref<boolean>(false);

// Computed
const totalSubBrands = computed(() => {
  return (
    (data.value?.data ?? []).reduce(
      (total, brand) => total + (brand.children?.length || 0),
      0
    ) || 0
  );
});

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

// Columns
const columns: ColumnTable<Brands>[] = [
  {
    key: "name",
    title: "Nama Brand",
    dataKey: "name",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Brands }) => (
      <div class="flex items-center">
        <span class="font-medium">{rowData.name}</span>
        {rowData.parent_id && (
          <ElTag size="small" type="info" class="ml-2">
            Sub Brand
          </ElTag>
        )}
      </div>
    ),
  },
  {
    key: "description",
    title: "Deskripsi",
    dataKey: "description",
    width: 250,
    cellRenderer: ({ rowData }: { rowData: Brands }) => (
      <span class="text-gray-600">{rowData.description || "-"}</span>
    ),
  },
  {
    key: "parent",
    title: "Parent Brand",
    dataKey: "parent",
    cellRenderer: ({ rowData }: { rowData: Brands }) => (
      <span>{rowData.parent?.name || "-"}</span>
    ),
  },
  {
    key: "created_by",
    title: "Dibuat Oleh",
    dataKey: "created_by",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Brands }) => (
      <span>{rowData.people?.name ?? "N/A"}</span>
    ),
  },
  {
    key: "created_at",
    title: "Dibuat Pada",
    dataKey: "created_at",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Brands }) => (
      <span>{formatLocalDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: Brands }) => {
    //   const _data = unref(data);
    //   //   const hasDeletePermission = _data?.privilege?.includes('delete') || false;

    //   return (
    //     <div class="flex gap-2">
    //       <NuxtLink
    //         class="el-button el-button--small el-button--primary"
    //         href={`/catalogue/brand/add?id=${rowData.unique_id}`}
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
    cellRenderer: ({ rowData }: { rowData: Brands }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/catalogue/brand/add?id=${rowData.unique_id}`;
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
    width: 100,
    align: "center",
  },
];

// Add selection column
columns.unshift({
  key: "selection",
  width: 50,
  maxWidth: 50,
  align: "center",
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

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const handleSelectionChange = (selection: Brands[]) => {
  selectedBrands.value = selection;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshNuxtData("get-brands");
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
  refreshNuxtData("get-brands");
};

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      "Apakah Anda yakin ingin menghapus brand yang dipilih?",
      "Konfirmasi Hapus",
      {
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    if (confirmed) {
      await useFetchApi<BaseResponse<any>>(
        "/brands-delete",
        "delete-brands",
        "post",
        uniques
      );

      ElMessage.success("Brand berhasil dihapus");
      refreshNuxtData("get-brands");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Gagal menghapus brand");
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

const onSort = (sortBy: { order: string; prop: string }) => {
  console.log("sort", sortBy);
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
  refreshNuxtData("get-brands");
};

const onChangeBrandFilter = (val: string) => {
  if (val === "1") {
    request_search.value.column = [
      {
        parent_id: ["null"],
      },
    ];
  } else {
    request_search.value.column = [
      {
        parent_id: ["not null"],
      },
    ];
  }
  refreshNuxtData("get-brands");
};

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData("get-brands");
  },
  { debounce: 500, deep: true }
);
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
</style>
