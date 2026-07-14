<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari pajak..."
          clearable
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/master/tax/add"
      >
        Tambah Pajak Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="fetchData"
      >
        Muat Ulang
      </el-button>

      <el-button
        v-if="hasSelected"
        type="danger"
        :disabled="!hasSelected"
        @click="batchDelete"
      >
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      :column-sort="onSort"
      @selection-change="handleSelectionChange"
    />

    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data"
        :current-page="data?.current_page"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Eleme,
  SetUp,
  Filter,
  Plus,
  CircleCloseFilled,
} from "@element-plus/icons-vue";
import {
  type Column,
  type CheckboxValueType,
  TableV2FixedDir,
  ElPopover,
  ElCheckbox,
  ElIcon,
  type SortBy,
  ElCheckboxGroup,
  type FormInstance,
  type FormProps,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import { TaxUnit, type Tax } from "~/types/tax";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";

definePageMeta({
  middleware: ["auth", "app"],
});

interface ListItem {
  label: string;
  value: string;
}

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "taxs",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

// Data state
const { data } = await useFetchApi<ResponsePagination<Tax[]>>(
  "/search",
  "tax",
  "post",
  request_search.value
);

const selectedTaxes = ref<Tax[]>([]);
const loading = ref<boolean>(false);
const visibleFilter = ref(false);

const filterIsEmpty = (val: unknown) => {
  if (val == null) return true;
  if (typeof val === "string") return val.trim() === "";
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

interface FormFilter {
  tax_value_min: number | null;
  tax_value_max: number | null;
  created_date: string;
}

const ruleFormRef = ref<FormInstance>();
const ruleFormFilter = reactive<FormFilter>({
  tax_value_min: null,
  tax_value_max: null,
  created_date: "",
});
const labelPositionFormFilter = ref<FormProps["labelPosition"]>("top");

const shortcutDate = [
  {
    text: "Bulan ini",
    value: [new Date(), new Date()],
  },
  {
    text: "Tahun ini",
    value: () => {
      const end = new Date();
      const start = new Date(new Date().getFullYear(), 0);
      return [start, end];
    },
  },
  {
    text: "6 bulan terakhir",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return [start, end];
    },
  },
];

// Columns
const columnsSelected = ref<string[]>([
  "selection",
  "tax_name",
  "tax_value",
  "created_at",
  "operations",
  "setup",
]);
const columns: Column<Tax>[] = [
  {
    key: "tax_name",
    title: "Nama Pajak",
    dataKey: "tax_name",
    width: 200,
    sortable: true,
  },
  {
    key: "tax_value",
    title: "Nilai Pajak",
    dataKey: "tax_value",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Tax }) => (
      <span>{formatTaxValue(rowData.tax_value ?? 0, rowData.unit)}</span>
    ),
  },
  {
    key: "description",
    title: "Deskripsi",
    dataKey: "description",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Tax }) => (
      <span>{rowData.description}</span>
    ),
  },
  {
    key: "created_at",
    title: "Tanggal Dibuat",
    dataKey: "created_at",
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Tax }) => (
      <span>
        {rowData.created_at ? formatLocalDate(rowData.created_at) : "-"}
      </span>
    ),
  },

  {
    key: "operations",
    title: "Aksi",
    cellRenderer: ({ rowData }: { rowData: Tax }) => (
      <>
        <NuxtLink
          class="el-button el-button--small"
          href={`/master/tax/add?id=${rowData.unique_id}`}
        >
          Edit
        </NuxtLink>
        <el-button
          size="small"
          type="danger"
          onClick={() => onDelete([rowData.unique_id!])}
        >
          Hapus
        </el-button>
      </>
    ),
    width: 150,
    align: "center",
  },
  {
    title: "Setup",
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
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

// Add column setup
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={columnsSelected.value}>
                  {columns
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

// Filter columns based on selection
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const hasSelected = computed(() => {
  return data.value?.data.some((item) => item.checked);
});

const formatTaxValue = (value: number, unit: string | null) => {
  if (unit === TaxUnit.PERCENT) {
    return `${value}%`;
  } else if (unit == TaxUnit.NOMINAL) {
    return `${currency(value)}`;
  } else {
    return `${value}`;
  }
};

// Handle selection change
const handleSelectionChange = (selection: Tax[]) => {
  selectedTaxes.value = selection;
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshNuxtData("tax");
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refreshNuxtData("tax");
};

// Edit tax
const onEdit = (tax: Tax) => {
  // Navigate to edit page
  navigateTo(`/tax-management/tax/edit/${tax.id}`);
};

// Delete tax
const onDelete = async (id: string[]) => {
  if (!id) return;

  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus pajak ini?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/taxs-delete",
      "delete-tax",
      "post",
      id
    );
    if (response.status.value == "success") {
      ElMessage.success("Pajak berhasil dihapus");
      refreshNuxtData("tax");
    }
  } catch (error) {
    // User canceled or error occurred
  }
};

// Batch delete
const batchDelete = async () => {
  const ids: string[] = [];
  for (let index = 0; index < (data.value?.data ?? []).length; index++) {
    const element = data.value?.data[index];
    if (element?.checked && element.unique_id) {
      ids.push(element.unique_id);
    }
  }

  if (ids.length === 0) return;

  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${ids.length} pajak yang dipilih?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/taxs-delete",
      "batch-delete-tax",
      "post",
      ids
    );
    if (response.status.value == "success") {
      ElMessage.success("Pajak berhasil dihapus");
      refreshNuxtData("tax");
    }
  } catch (error) {
    // User canceled or error occurred
  }
};

const onSort = async (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  refreshNuxtData("tax");
};

// Watch search query
watchDebounced(
  request_search.value,
  () => {
    refreshNuxtData("tax");
  },
  { debounce: 500 }
);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Tax[]>>(
      "/search",
      "tax",
      "post",
      request_search.value
    );
    if (response.status.value == "success") {
      data.value = response.data.value!;
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const onFilter = () => {
  loading.value = true;
  try {
    // Apply tax value filter
    if (
      ruleFormFilter.tax_value_min !== null ||
      ruleFormFilter.tax_value_max !== null
    ) {
      request_search.value.filter = {
        ...request_search.value.filter,
        tax_value: {
          min: ruleFormFilter.tax_value_min,
          max: ruleFormFilter.tax_value_max,
        },
      };
    }

    // Apply created date filter
    if (
      ruleFormFilter.created_date &&
      ruleFormFilter.created_date.length === 2
    ) {
      request_search.value.filter = {
        ...request_search.value.filter,
        created_at: {
          min: Math.floor(
            new Date(ruleFormFilter.created_date[0]).getTime() / 1000
          ),
          max: Math.floor(
            new Date(ruleFormFilter.created_date[1]).getTime() / 1000
          ),
        },
      };
    }

    refreshNuxtData("tax");
    visibleFilter.value = false;
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const cancelFilter = () => {
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields();
  }
  visibleFilter.value = false;
};

onMounted(() => {
  // Initial data fetch if needed
});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--el-color-success);
}
.red {
  color: var(--el-color-error);
}
</style>
