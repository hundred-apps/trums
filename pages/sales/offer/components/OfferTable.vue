<template>
  <CustomTable
    :column-sort="onSort"
    :columns="availableColumn"
    :data="data?.data ?? []"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      layout="prev, pager, next, sizes"
      :total="data?.total_data"
      @next-click="paginationClick"
      @prev-click="paginationClick"
      @change="paginationClick"
    />
  </div>
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import { Filter } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Pricetag } from "~/types/pricetag";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";

const props = defineProps<{
  // onSubmit: (catalogue: Catalogue) => void,
  // onCancel: () => void,
  request_search: RequestSearch;
  refresh_trigger: number;
  key: string;
}>();

const emit = defineEmits<{
  (e: "has-bulk", value: string[]): void;
}>();

const loading = ref<boolean>(false);
const popoverRef = ref();
const request_search = ref<RequestSearch>(props.request_search);
const locations = ref<Catalogue[]>([]);
const selected = ref<string[]>([]);

const { data } = await useFetchApi<ResponsePagination<Pricetag[]>>(
  `/search`,
  props.key,
  "post",
  request_search.value
);

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const availableColumn: Column<Pricetag>[] = [
  {
    title: "No",
    key: "no",
    dataKey: "no",
    width: 80,
    cellRenderer: ({ rowIndex }) => <span>{rowIndex + 1}</span>,
  },
  {
    title: "Unique Code",
    key: "name",
    dataKey: "name",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Pricetag }) => (
      <NuxtLink
        class={"text-blue-600"}
        href={`/sales/offer/${rowData.unique_id}`}
      >
        {rowData.unique_code || "-"}
      </NuxtLink>
    ),
  },
  {
    title: "Kepada",
    key: "",
    dataKey: "",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Pricetag }) => (
      <span>{rowData.to?.name || "-"}</span>
    ),
  },
  {
    title: "Tanggal Berlaku",
    key: "reference",
    dataKey: "reference",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>{row.start_date ? formatLocalDate(row.start_date) : "-"}</>
    ),
  },
  {
    title: "Operasi",
    key: "operasi",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          href={`/sales/offer/${row.unique_id}`}
          class="el-button el-button--small"
        >
          Detail
        </NuxtLink>
        <NuxtLink
          href={`/sales/offer/add?id=${row.unique_id}&type=${row.type}`}
          class="el-button el-button--small"
        >
          Edit
        </NuxtLink>

        <ElPopconfirm
          title="Yakin ingin menghapus?"
          confirmButtonText="Ya"
          cancelButtonText="Tidak"
          onConfirm={() => handleDelete([row.unique_id])}
        >
          {{
            reference: () => (
              <ElButton size="small" type="danger">
                Delete
              </ElButton>
            ),
          }}
        </ElPopconfirm>
        {/* <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton> */}
      </>
    ),
  },
];

availableColumn.unshift({
  key: "selection",
  width: 50,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },

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
      });
    const allSelected = _data!.data.every((row) => row.checked);
    const containsChecked = _data?.data.some((row) => row.checked);
    selected.value = (_data?.data ?? [])
      .filter((value) => value.checked)
      .map((check) => check.unique_id);
    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const onSort = (sortBy: SortBy) => {
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

const handleDelete = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      `/pricetag-delete`,
      "pricelist",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("Pricetag");
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const fetchLocation = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Catalogue[]>>(
      `/search`,
      "location",
      "post",
      {
        keyword: "",
        column: [
          {
            type: ["place"],
          },
        ],
        limit: "10",
        offset: "1",
        table: "catalogues",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      locations.value = (
        response.data.value as ResponsePagination<Catalogue[]>
      ).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

watch(
  selected,
  (val) => {
    emit("has-bulk", val);
  },
  { deep: true }
);

watch(
  () => props.refresh_trigger,
  async () => {
    selected.value = [];
    await refreshNuxtData(props.key);
  }
);

onMounted(() => {
  fetchLocation();
});
</script>
