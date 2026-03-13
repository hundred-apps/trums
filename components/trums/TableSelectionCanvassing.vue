<template>
  <customTable
    :columns="columns"
    :data="data?.data ?? []"
    :loading="pending"
    :column-sort="onSort"
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
import { Filter } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElPopover,
  TableV2FixedDir,
  type Column,
  type SortBy,
} from "element-plus";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { CanvassingStatus, type Canvassing } from "~/types/scm/canvasing";
import customTable from "./table/customTable.vue";
import type { ResponsePagination } from "~/types/response_pagination";

interface Emits {
  (e: "select-canvassing", item: Canvassing): void;
}

const props = defineProps<{
  // onSubmit: (catalogue: Catalogue) => void,
  // onCancel: () => void,
  request_search: RequestSearch;
  fetchKey: string;
  type: "RAB" | "CANASSING";
  refreshTrigger: number;
}>();
const emit = defineEmits<Emits>();

const request_search_canvassing = ref<RequestSearch>(props.request_search);

const { data, pending } = await useFetchApi<ResponsePagination<Canvassing[]>>(
  "/search",
  props.fetchKey,
  "post",
  request_search_canvassing.value
);

watch(
  () => request_search_canvassing.value,
  (newValue) => refreshNuxtData(props.fetchKey),
  { immediate: true }
);
watch(
  () => props.refreshTrigger,
  (newValue) => refreshNuxtData(props.fetchKey),
  { immediate: true }
);

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
    width: 170,
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
                    v-model={request_search_canvassing.value.column[0].status}
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
    width: 170,
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
        <ElButton
          size="small"
          type="primary"
          onClick={() => handleSelect(rowData)}
        >
          Pilih
        </ElButton>
      </>
    ),
    width: 150,
    align: "center",
  },
];

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

const handleSelect = (item: Canvassing) => {
  emit("select-canvassing", item);
};

const onSort = (sortBy: SortBy) => {
  request_search_canvassing.value.sort = {
    column: sortBy.key.toString(),
    order:
      request_search_canvassing.value.sort?.order === OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

const handlePageChange = (page: number) => {
  request_search_canvassing.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_canvassing.value.limit = `${size}`;
};
</script>
