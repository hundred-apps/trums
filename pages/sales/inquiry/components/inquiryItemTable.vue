<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6"
      ><el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Type to search"
    /></el-col>
    <NuxtLink
      v-if="canAccess('inquiries-create', data?.privilege ?? [])"
      class="el-button el-button--default"
      href="/sales/inquiry/add"
      >Buat Inquiri</NuxtLink
    >
    <el-button
      :loading="loading"
      @click="onRefresh"
      size="default"
      type="default"
      :icon="Eleme"
      >Refresh</el-button
    >
    <el-button
      :disabled="!hasSelected"
      @click="bulkDelete"
      size="default"
      type="danger"
      >Hapus</el-button
    >
  </el-row>
  <customTable
    :column-sort="onSort"
    :columns="filteredColumn"
    :data="data?.data ?? []"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="data?.total_data"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>
<script lang="tsx" setup>
import {
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElPopover,
  type CheckboxValueType,
  type Column,
} from "element-plus";
import type { ItemRequest } from "~/types/item_request";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import { TypeInquiry } from "~/types/inquiry";
import type { ResponsePagination } from "~/types/response_pagination";
import { NuxtLink } from "#components";
import type {
  CellRendererParams,
  SortBy,
} from "element-plus/es/components/table-v2/src/types.mjs";
import { Eleme, SetUp } from "@element-plus/icons-vue";
import customTable from "~/components/trums/table/customTable.vue";
import { canAccess } from "#imports";

const popoverRef = ref();

const loading = ref<boolean>(false);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      inquiry: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
    },
  ],
  limit: "10",
  offset: "1",
  table: "item_request",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data } = await useFetchApi<ResponsePagination<ItemRequest[]>>(
  `/search`,
  "fetch-item-request",
  "post",
  request_search.value
);

const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "date",
  "request_by",
  "request_to",
  "catalogue_name",
  "sn",
  "quantity",
  "uom",
  "harga",
]);

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

const availableColumn: Column<ItemRequest>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
    fixed: true,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value);
      return <SelectionCell value={rowData.checked} onChange={onChange} />;
    },
    maxWidth: 50,

    headerCellRenderer: () => {
      const _data = unref(data);
      const onChange = (value: CheckboxValueType) =>
        (data.value = {
          success: true,
          currentPage: _data?.currentPage ?? 0,
          total_data: _data?.total_data ?? 0,
          total_page: _data?.total_data ?? 0,
          data: _data?.data?.map((row: any) => {
            row.checked = value;
            return row;
          })!,
          privilege: _data?.privilege ?? [],
        });
      const allSelected = _data!.data.every((row) => row.checked);
      const containsChecked = _data?.data.some((row) => row.checked);

      return (
        <SelectionCell
          style={{ width: 50 }}
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      );
    },
  },
  {
    title: "Nomor RFQ",
    dataKey: "unique_code",
    key: "unique_code",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <NuxtLink
        href={`inquiry/${rowData.inquiry?.unique_id}`}
        class={"text-blue-600"}
      >
        {rowData.inquiry?.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Diminta oleh",
    dataKey: "request_by",
    key: "request_by",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.inquiry?.request_by?.name ?? ""}</p>
    ),
  },
  {
    title: "Ditujukan Untuk",
    dataKey: "request_to",
    key: "request_to",
    width: 300,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.inquiry?.request_to?.name ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "Nama Item",
    dataKey: "catalogue_name",
    key: "catalogue_name",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.catalogue_name ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "SN/PN Number",
    dataKey: "sn",
    key: "sn",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.catalogue?.sn ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "QTY",
    dataKey: "quantity",
    key: "quantity",
    width: 100,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.request_qty ?? "0"}</p>
    ),
  },
  {
    title: "UoM",
    dataKey: "uom",
    key: "uom",
    width: 100,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.unit_name ?? "-"}</p>
    ),
  },
  {
    title: "Harga",
    dataKey: "harga",
    key: "harga",
    width: 50,
    cellRenderer: ({ rowData }: { rowData: ItemRequest }) => (
      <p>{rowData.total_canvassing_vendor ?? 0}</p>
    ),
  },
];

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Inquiry?",
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
      `/item-request-delete`,
      "item-request-delete",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("fetch-item-request");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      request_search.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  request_search.value = data;
};

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};

const onRefresh = () => refreshNuxtData("fetch-item-request");
</script>
