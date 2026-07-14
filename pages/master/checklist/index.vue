<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"
        ><el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Type to search"
      /></el-col>
      <NuxtLink
        href="checklist/add"
        @click="
          () => {
            const checklist_id = useCookie('checklist_id');
            checklist_id.value = null;
          }
        "
        class="el-button el-button--default"
        >Buat Checklist</NuxtLink
      >
      <el-button
        size="default"
        @click="fetchData"
        :loading-icon="Eleme"
        :loading="loading"
        >Reload Data</el-button
      >
    </el-row>
    <customTable
      :height="500"
      :column-sort="onSort"
      :columns="availableColumn"
      :data="data?.data ?? []"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data?.total_data"
        @next-click="paginationClick"
        @prev-click="paginationClick"
        @change="paginationClick"
      />
    </div>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import type { ChecklistAttribute } from "~/types/checklist";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import { Eleme, Filter } from "@element-plus/icons-vue";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { NuxtLink } from "#components";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import customTable from "~/components/trums/table/customTable.vue";
import type { BaseResponse } from "~/types/response";
definePageMeta({
  middleware: ["auth", "app"],
});

const router = useRouter();
const loading = ref<boolean>(false);
const popoverRef = ref();
const drawer_checklist = ref<boolean>(false);

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      value_type: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "maintenance_checklist",
  sort: {
    column: "name",
    order: OrderColumn.ASC,
  },
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<
      ResponsePagination<ChecklistAttribute[]>
    >(`/search`, "maintenance_checklist", "post", request_search.value);

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<
        ChecklistAttribute[]
      >;
    }
  } catch (error: any) {
    ElMessage.error(
      `${error.response?.data?.message ?? "Gagal Mengambil Data!"}`
    );
    return [];
  } finally {
    loading.value = false;
  }
};

const { data } = await useFetchApi<ResponsePagination<ChecklistAttribute[]>>(
  `/search`,
  "maintenance_checklist",
  "post",
  request_search.value
);

const availableColumn: Column<ChecklistAttribute>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 50,
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
          current_page: _data?.current_page ?? 0,
          total_data: _data?.total_data ?? 0,
          total_page: _data?.total_data ?? 0,
          data: _data?.data?.map((row: any) => {
            row.checked = value;
            return row;
          })!,
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
    title: "Nama",
    dataKey: "name",
    key: "name",
    width: 300,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`checkin/${row.unique_id}`} class={"text-blue-600"}>
        {row.name}
      </NuxtLink>
    ),
  },
  {
    title: "Tipe",
    dataKey: "value_type",
    key: "value_type",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Type</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox
                    value="text"
                    v-model={request_search.value.column![0].value}
                  >
                    Text
                  </ElCheckbox>
                  <ElCheckbox
                    value="option"
                    v-model={request_search.value.column![0].value}
                  >
                    Option
                  </ElCheckbox>
                  <ElCheckbox
                    value="select"
                    v-model={request_search.value.column![0].value}
                  >
                    Select
                  </ElCheckbox>
                  <ElCheckbox
                    value="multi_select"
                    v-model={request_search.value.column![0].value}
                  >
                    Multi Select
                  </ElCheckbox>
                  <ElCheckbox
                    value="file"
                    v-model={request_search.value.column![0].value}
                  >
                    File
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
    title: "Operasi",
    key: "",
    width: 250,

    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => handleEdit(row)}>
          Edit
        </ElButton>
        <DeleteButton
          onConfirm={() => handleDelete([row.unique_id])}
          onCancel={() => {}}
        />
      </>
    ),
  },
];

const onSort = async (sortBy: SortBy) => {
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

const handleEdit = (data: ChecklistAttribute) => {
  const checklist_id = useCookie("checklist_id");
  checklist_id.value = data.unique_id;

  router.push("checklist/add");
};

const handleDelete = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/maintenance-checklist-delete`,
      "maintenance-checklist-delete",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("maintenance_checklist");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};
</script>
