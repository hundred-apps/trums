<template>
  <CustomTable
    :columns="filteredColumns"
    :data="data?.data ?? []"
    :loading="loading"
    :column-sort="onSort"
    @selection-change="handleSelectionChange"
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
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import { Filter, SetUp } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElPopover,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { Canvassing } from "~/types/scm/canvasing";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import { CanvassingStatus } from "~/types/scm/canvasing";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";

const props = defineProps<{
  // onSubmit: (catalogue: Catalogue) => void,
  // onCancel: () => void,
  request_search: RequestSearch;
  fetchKey: string;
  type: "RAB" | "CANASSING";
}>();

const selectedCanvassing = ref<Canvassing[]>([]);
const loading = computed(() => pending.value);
const columnsSelected = ref<string[]>([
  "selection",
  "unique_code",
  "source_document",
  "description",
  "status",
  "created_at",
  "operations",
  "setup",
]);

const request_search = ref<RequestSearch>(props.request_search);

const { data, pending } = await useFetchApi<ResponsePagination<Canvassing[]>>(
  "/search",
  props.fetchKey,
  "post",
  request_search.value
);

// Columns
const columns: Column<Canvassing>[] = [
  {
    key: "unique_code",
    title: "Nomor Canvassing",
    dataKey: "unique_code",
    width: 300,
    cellRenderer: ({ rowData: row }) =>
      props.type == "RAB" ? (
        <NuxtLink
          href={`/sales/quotation/${row.unique_id}`}
          class="text-blue-500"
        >
          {row.unique_code}
        </NuxtLink>
      ) : (
        <NuxtLink
          href={`/sales/canvassing/${row.unique_id}`}
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
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{rowData.source_document || "-"}</span>
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
    width: 150,
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
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{formatLocalDate(rowData.created_at!)}</span>
    ),
  },
  {
    key: "operations",
    title: "Aksi",
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <>
        <NuxtLink
          class="el-button el-button--small"
          href={`/supply-chain-management/canvassing/add?id=${rowData.unique_id}`}
        >
          Edit
        </NuxtLink>
        <ElButton
          size="small"
          type="danger"
          onClick={() => handleSubmitDelete([rowData.unique_id!])}
        >
          Hapus
        </ElButton>
      </>
    ),
    width: 150,
    align: "center",
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

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
// Computed
const filteredColumns = computed(() => {
  return columns.filter((col) =>
    columnsSelected.value.includes(col.key!.toString())
  );
});

const renderStatusTag = (status: CanvassingStatus) => {
  if (!status) return <></>;

  switch (status) {
    case CanvassingStatus.DRAFT:
      return <el-tag type="info">DRAFT</el-tag>;
    case CanvassingStatus.CANVASSING:
      return <el-tag type="primary">ON CANVASSING</el-tag>;
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return <el-tag type="warning">PENDING APPROVAL</el-tag>;
    case CanvassingStatus.CANCEL:
      return <el-tag type="danger">CANCELED</el-tag>;
    default:
      return <el-tag>{status}</el-tag>;
  }
};

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Canvassing?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    );

    const ids =
      data.value?.data
        ?.filter((item) => item.checked)
        .map((item) => item.unique_id!) || [];

    // Jika sampai sini, user klik Delete
    await handleSubmitDelete(ids);
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log("Delete cancelled");
  }
};

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi(
      "/canvassing-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      await refreshNuxtData(props.fetchKey);
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const handleSelectionChange = (selection: Canvassing[]) => {
  selectedCanvassing.value = selection;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onEdit = (canvassing: Canvassing) => {
  navigateTo(
    `/supply-chain-management/canvassing/edit/${canvassing.unique_id}`
  );
};

const onSort = (sortBy: SortBy) => {
  props.request_search.sort = {
    column: sortBy.key.toString(),
    order:
      props.request_search.sort?.order === OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

watch(
  request_search.value,
  () => {
    console.log("watch");
    refreshNuxtData(props.fetchKey);
  },
  { immediate: true }
);
watch(
  () => data,
  (newValue) => {
    console.log("watch canv value", newValue.value);
  },
  { immediate: true }
);

const reloadData = async () => {
  await refreshNuxtData(props.fetchKey);
};

defineExpose({
  reloadData,
});
</script>
