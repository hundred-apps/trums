<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_rab || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total RAB
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_waiting_approve || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Pending Approval
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_cancel || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Cancelled
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_done || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Done
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
          placeholder="Cari canvassing..."
          clearable
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="quotation/add"
      >
        Buat RAB Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="pending"
        @click="onRefresh"
      >
        Muat Ulang
      </el-button>
      <el-button type="danger" :disabled="!hasSelected" @click="bulkDelete">
        Hapus yang Dipilih
      </el-button>
    </el-row>

    <!-- Table -->
    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      @sort-change="onSort"
    />

    <!-- Pagination -->
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data ?? 0"
        :current-page="Number(request_search.offset)"
        :page-size="Number(request_search.limit)"
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
  ElButton,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import {
  CanvassingStatus,
  type Canvassing,
  type StatisticRAB,
} from "~/types/scm/canvasing";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { TypeInquiry } from "~/types/inquiry";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "canvassing-read",
});

// Search request
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      inquiries: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
      status: [
        CanvassingStatus.DRAFT,
        CanvassingStatus.RAB,
        CanvassingStatus.PENDING_APPROVAL,
        CanvassingStatus.PENDING_APPROVAL_RAB,
        CanvassingStatus.DONE,
      ],
    },
  ],
  limit: "10",
  offset: "1",
  table: "canvassing",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const request_statistic = ref<RequestStatistic>({
  table: StatisticTable.rab,
});

// Data state
const { data, pending, refresh } = await useAsyncData(
  "get-canvasing",
  async () => {
    const res = await useFetchApi<ResponsePagination<Canvassing[]>>(
      `/search`,
      "get-canvasing",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const statistic = await useFetchApi<BaseResponse<StatisticRAB>>(
  "/statistic",
  "statistic-rab",
  "post",
  request_statistic.value
);

const selectedCanvassing = ref<Canvassing[]>([]);
const loading = ref<boolean>(false);
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "source_document",
  "customer",
  "description",
  "status",
  "created_at",
  "operations",
  "setup",
]);

// Columns
const columns: ColumnTable<Canvassing>[] = [
  {
    key: "unique_code",
    title: "Nomor Canvassing",
    dataKey: "unique_code",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/sales/quotation/${row.unique_id}`}
        class="text-blue-500"
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "source_document",
    title: "Dokumen Sumber",
    dataKey: "source_document",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{rowData.source_document || "-"}</span>
    ),
  },
  {
    key: "customer",
    title: "Customer",
    dataKey: "customer",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{rowData.source?.request_to?.name || "-"}</span>
    ),
  },
  {
    key: "description",
    title: "Deskripsi",
    dataKey: "description",
    width: 250,
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 250,
    cellRenderer: ({ rowData: row }) => renderStatusTag(row.status),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover trigger="click" width={200}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].status}
                  >
                    <ElCheckbox
                      key={CanvassingStatus.DRAFT}
                      value={CanvassingStatus.DRAFT}
                      label="Draft"
                    />
                    <ElCheckbox
                      key={CanvassingStatus.PENDING_APPROVAL}
                      value={CanvassingStatus.PENDING_APPROVAL}
                      label="Pending Approval"
                    />
                    <ElCheckbox
                      key={CanvassingStatus.CANCEL}
                      value={CanvassingStatus.CANCEL}
                      label="Cancel"
                    />
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
    key: "created_at",
    title: "Tanggal Dibuat",
    dataKey: "created_at",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{formatDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "",
    title: "Dibuat Oleh",
    dataKey: "",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{rowData.people?.name ?? "N/A"}</span>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    // cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
    //   <>
    //     <NuxtLink
    //       class="el-button el-button--small"
    //       href={`/sales/quotation/add?id=${rowData.unique_id}`}
    //     >
    //       Edit
    //     </NuxtLink>
    //     <ElButton
    //       size="small"
    //       type="danger"
    //       onClick={() => onDelete([rowData.unique_id!])}
    //     >
    //       Hapus
    //     </ElButton>
    //   </>
    // ),
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/sales/quotation/add?id=${rowData.unique_id}`;
        }
        if (command === "delete") {
          onDelete([rowData.unique_id!]);
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
                      (col) =>
                        col.key !== "selection" &&
                        col.key !== "unique_code" &&
                        col.key !== "customer" &&
                        col.key !== "setup"
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

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("id-ID");
};

const renderStatusTag = (status: CanvassingStatus) => {
  if (!status) return <></>;

  switch (status) {
    case CanvassingStatus.DRAFT:
      return <ElTag type="info">DRAFT</ElTag>;
    case CanvassingStatus.PENDING_APPROVAL:
      return <ElTag type="warning">PENDING APPROVAL RAB</ElTag>;
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return <ElTag type="warning">PENDING APPROVAL CANVASSING</ElTag>;
    case CanvassingStatus.RAB:
      return <ElTag type="success">RAB</ElTag>;
    case CanvassingStatus.CANCEL:
      return <ElTag type="danger">CANCELED</ElTag>;
    case CanvassingStatus.DONE:
      return <ElTag type="primary">DONE</ElTag>;
    default:
      return <ElTag>{status}</ElTag>;
  }
};

const handleSelectionChange = (selection: Canvassing[]) => {
  selectedCanvassing.value = selection;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshNuxtData("get-canvassing");
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refreshNuxtData("get-canvassing");
};

const onEdit = (canvassing: Canvassing) => {
  navigateTo(
    `/supply-chain-management/canvassing/edit/${canvassing.unique_id}`
  );
};

const onDelete = async (uniques: string[]) => {
  loading.value = true;
  try {
    await ElMessageBox.confirm("Yakin ingin menghapus data RAB?", "Warning", {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    });

    await submitToDelete(uniques);
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => refresh();

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm("Yakin ingin menghapus data RAB?", "Warning", {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    });

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
      `/canvassing-delete`,
      "canvassing-delete",
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

const onSort = (sortBy: { order: string; prop: string }) => {
  console.log("short", sortBy);
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
  refreshNuxtData("get-canvassing");
};

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData("get-canvassing");
  },
  { debounce: 500, deep: true }
);

onMounted(() => {
  refreshNuxtData("get-canvassing");
});
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
</style>
