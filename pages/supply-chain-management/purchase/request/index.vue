<template>
  <TrumsWrapper>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic
            :value="statistic.data.value?.data?.total_purchase_request || 0"
          >
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Data
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
                Waiting Approval
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_approve || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Approved
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="statistic.data.value?.data?.total_reject || 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Rejected
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari purchase request..."
          clearable
        />
      </el-col>
      <NuxtLink
        class="el-button el-button--primary el-button--default"
        href="/supply-chain-management/purchase/request/add"
      >
        Buat Purchase Request Baru
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

    <div class="grid grid-cols-6 gap-4 my-3">
      <el-button
        size="default"
        class="button-new-tag"
        :icon="Plus"
        @click="visibleFilter = true"
        >Filter</el-button
      >
      <template v-for="(tag, i) in request_search.column" :key="i">
        <el-tag
          size="large"
          @close="handleClose(key, 'column')"
          v-for="[key, value] in Object.entries(tag).filter(
            ([k, v]) => k !== 'type' && !filterIsEmpty(v)
          )"
          closable
          type="info"
        >
          {{ columns.find((value) => value.dataKey == key)?.title }}
        </el-tag>
      </template>
      <el-tag
        size="large"
        @close="handleClose(key, 'filter')"
        v-if="request_search.filter != null"
        v-for="[key, value] in Object.entries(request_search.filter).filter(
          ([k, v]) => k !== 'type' && !filterIsEmpty(v)
        )"
        closable
        type="info"
      >
        {{ columns.find((value) => value.dataKey == key)?.title }}
      </el-tag>
    </div>

    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      @sort-change="onSort"
      @selection-change="handleSelectionChange"
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

    <el-drawer v-model="visibleFilter" :show-close="false">
      <template #header="{ close, titleId, titleClass }">
        <h4 :id="titleId" :class="titleClass">Filter Purchase Request</h4>
        <el-button type="danger" @click="close">
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          Close
        </el-button>
      </template>
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleFormFilter"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        status-icon
        :label-position="labelPositionFormFilter"
      >
        <el-form-item label="Tanggal Dibuat" prop="createdDate">
          <el-date-picker
            v-model="ruleFormFilter.createdDate"
            type="daterange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcutDate"
          />
        </el-form-item>
        <el-form-item label="Requester" prop="requester_id">
          <el-select
            v-model="ruleFormFilter.requester_id"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="Cari Requester"
            :remote-method="remoteSearchRequester"
            :loading="loadingFilter"
            style="width: 100%"
          >
            <el-option
              v-for="item in optionsRequester"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select
            v-model="ruleFormFilter.status"
            multiple
            collapse-tags
            placeholder="Select Status"
            style="width: 100%"
            :loading="loadingFilter"
          >
            <el-option
              v-for="item in purchaseRequestStatuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="cancelFilter">Batal</el-button>
        <el-button type="primary" :loading="loading" @click="onFilter">
          {{ loading ? "Loading ..." : "Terapkan" }}
        </el-button>
      </div>
    </el-drawer>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  Eleme,
  SetUp,
  Filter,
  Plus,
  CircleCloseFilled,
  Setting,
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
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import type {
  PurchaseRequest,
  PurchaseRequestStatistic,
  PurchaseRequestStatus,
} from "~/types/purchase_request";
import type { Pagination } from "~/types/pagination";
import { NuxtLink } from "#components";
import CustomTable from "~/components/trums/table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import {
  OrderColumn,
  StatisticTable,
  type RequestSearch,
  type RequestStatistic,
} from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { Contact } from "~/types/contact";
import type { ColumnTable } from "~/types/ColumnTable";

definePageMeta({
  middleware: ["auth", "app"],
});

interface ListItem {
  label: string;
  value: string;
}

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "purchase_request",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});
const request_search_statistic = ref<RequestStatistic>({
  table: StatisticTable.purchase_request,
});

const statistic = await useFetchApi<BaseResponse<PurchaseRequestStatistic>>(
  "/statistic",
  "get-pr-statistic",
  "post",
  request_search_statistic.value
);

// Data state
const { data } = await useFetchApi<ResponsePagination<PurchaseRequest[]>>(
  `/search`,
  "purchase-requests",
  "post",
  request_search.value
);
const selectedPurchaseRequests = ref<PurchaseRequest[]>([]);
const loading = ref<boolean>(false);
const loadingFilter = ref<boolean>(false);
const visibleFilter = ref(false);
const optionsRequester = ref<ListItem[]>([]);

const popoverRef = ref();
const router = useRouter();

const purchaseRequestStatuses = [
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Waiting Approval",
    value: "waiting_approval",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Canvassing",
    value: "canvassing",
  },
];

const filterIsEmpty = (val: unknown) => {
  if (val == null) return true;
  if (typeof val === "string") return val.trim() === "";
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

interface formFilter {
  createdDate: string;
  requester_id: string[];
  status: string[];
}

const ruleFormRefFilter = ref<FormInstance>();
const ruleFormFilter = reactive<formFilter>({
  createdDate: "",
  requester_id: [],
  status: [],
});
const labelPositionFormFilter = ref<FormProps["labelPosition"]>("top");

const shortcutDate = [
  {
    text: "This month",
    value: [new Date(), new Date()],
  },
  {
    text: "This year",
    value: () => {
      const end = new Date();
      const start = new Date(new Date().getFullYear(), 0);
      return [start, end];
    },
  },
  {
    text: "Last 6 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return [start, end];
    },
  },
];

const handleClose = (tag: string, type: string) => {
  if (type == "column") {
    for (let index = 0; index < request_search.value.column.length; index++) {
      const element = request_search.value.column[index];
      request_search.value.column[index][tag] = [];
    }
  } else {
    request_search.value.filter[tag] = null;
  }
};

// Columns
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "source_document",
  "requester_name",
  "created_at",
  "status",
  "operations",
  "setup",
]);
const columns: ColumnTable<PurchaseRequest>[] = [
  {
    key: "unique_code",
    title: "Nomor PR",
    dataKey: "unique_code",
    fixed: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/supply-chain-management/purchase/request/${row.unique_id}`}
        class="text-blue-500"
      >
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    key: "requester_name",
    title: "Requester",
    dataKey: "requester_id",
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseRequest }) => (
      <span>{rowData.requester?.name || "-"}</span>
    ),
  },
  {
    key: "source_document",
    title: "Dokumen Sumber",
    dataKey: "source_document",
    width: 150,
    cellRenderer: ({ rowData }: { rowData: PurchaseRequest }) => (
      <span>{rowData.source_document || "-"}</span>
    ),
  },

  {
    key: "created_at",
    title: "Tanggal Dibuat",
    dataKey: "created_at",
    width: 160,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseRequest }) => (
      <span>{formatLocalDate(rowData.created_at)}</span>
    ),
  },
  {
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 150,
    align: "center",
    cellRenderer: ({ rowData: row }) => renderStatusTag(row.status),
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
                    <ElCheckbox key="draft" value="draft" label="Draft" />
                    <ElCheckbox
                      key="waiting_approval"
                      value="waiting_approval"
                      label="Waiting Approval"
                    />
                    <ElCheckbox
                      key="approved"
                      value="approved"
                      label="Approved"
                    />
                    <ElCheckbox
                      key="rejected"
                      value="rejected"
                      label="Rejected"
                    />
                    <ElCheckbox
                      key="canvassing"
                      value="canvassing"
                      label="Canvassing"
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
    key: "operations",
    title: "Operasi",
    // cellRenderer: ({ rowData }: { rowData: PurchaseRequest }) => (
    //   <>
    //     <NuxtLink
    //       class="el-button el-button--small"
    //       href={`/supply-chain-management/purchase/request/add?id=${rowData.unique_id}`}
    //     >
    //       Edit
    //     </NuxtLink>
    //     <el-button
    //       size="small"
    //       type="danger"
    //       onClick={() => onDelete([rowData.unique_id])}
    //     >
    //       Hapus
    //     </el-button>
    //   </>
    // ),
    width: 100,
    cellRenderer: ({ rowData }: { rowData: PurchaseRequest }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/supply-chain-management/purchase/request/add?id=${rowData.unique_id}`;
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
  fixed: true,
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
    // console.log("row data", rowData);
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
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
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

// Render status tag
const renderStatusTag = (status: string) => {
  if (!status) return <></>;

  switch (status.toLowerCase()) {
    case "draft":
      return <el-tag type="info">{status.toUpperCase()}</el-tag>;
    case "waiting_approval":
      return <el-tag type="warning">{status.toUpperCase()}</el-tag>;
    case "approved":
      return <el-tag type="success">{status.toUpperCase()}</el-tag>;
    case "rejected":
      return <el-tag type="danger">{status.toUpperCase()}</el-tag>;
    case "canvassing":
      return <el-tag type="primary">{status.toUpperCase()}</el-tag>;
    default:
      return <el-tag>{status.toUpperCase()}</el-tag>;
  }
};

// Handle selection change
const handleSelectionChange = (selection: PurchaseRequest[]) => {
  selectedPurchaseRequests.value = selection;
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
  refreshNuxtData("purchase-requests");
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  refreshNuxtData("purchase-requests");
};

// Edit purchase request
const onEdit = (purchaseRequest: PurchaseRequest) => {
  router.push(
    `/supply-chain/purchase-request/edit/${purchaseRequest.unique_id}`
  );
};

// Delete purchase request
const onDelete = async (uniques: string[]) => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus purchase request?`,
      "Konfirmasi Hapus",
      { type: "warning" }
    );

    const response = await useFetchApi<BaseResponse<any>>(
      "/purchase-request-delete",
      "delete-purchase-request",
      "post",
      uniques
    );
    if (response.status.value == "success") {
      ElMessage.success("Purchase request berhasil dihapus");
      refreshNuxtData("purchase-requests");
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
    if (element?.checked) {
      ids.push(element.unique_id);
    }
  }
  onDelete(ids);
};

const remoteSearchRequester = (query: string) => {
  if (!query) return;
  loadingFilter.value = true;
  try {
    const request_contact = { ...request_search.value };
    request_contact.column = [];
    request_contact.table = "contacts";
    request_contact.keyword = query;

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-requester",
      "post",
      request_contact
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          optionsRequester.value = contacts.map((value) => ({
            value: value.unique_id,
            label: value.name,
          }));
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch requesters", error);
  } finally {
    loadingFilter.value = false;
  }
};

const onSort = async (sortBy: { prop: string; order: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order == OrderColumn.DESCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

// Watch search query
watchDebounced(
  request_search.value,
  () => {
    refreshNuxtData("purchase-requests");
  },
  { debounce: 500 }
);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<PurchaseRequest[]>>(
      `/search`,
      "purchase-requests",
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
    if (ruleFormFilter.createdDate != "") {
      request_search.value.filter = {
        ...request_search.value.filter,
        created_at: {
          min: new Date(ruleFormFilter.createdDate[0]).getTime() / 1000,
          max: new Date(ruleFormFilter.createdDate[1]).getTime() / 1000,
        },
      };
    }

    request_search.value.column = [
      {
        status: ruleFormFilter.status,
        requester_id: ruleFormFilter.requester_id,
      },
    ];

    refreshNuxtData("purchase-requests");
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
    visibleFilter.value = false;
  }
};

const cancelFilter = () => {
  ruleFormRefFilter.value?.resetFields();
  visibleFilter.value = false;
};

onMounted(() => {});
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
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
