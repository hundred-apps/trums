<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-read",
});
import { ref, onMounted } from "vue";
import { Filter, SetUp } from "@element-plus/icons-vue";
import { TypeInquiry, type Inquiry } from "~/types/inquiry";
import customTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElIcon,
  ElMessage,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type MainInstance,
  type SortBy,
} from "element-plus";
import type { Contact } from "~/types/contact";
import type { Maintenance } from "~/types/maintenance";
import type { CellRendererParams } from "element-plus/es/components/table-v2/src/types.mjs";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import { NuxtLink } from "#components";
import type { BaseResponse } from "~/types/response";
import { canAccess } from "#imports";
const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "date",
  "request_by",
  "request_to",
  "status",
  "operation",
  "setup",
]);
const popoverRef = ref();
const config = useRuntimeConfig();

const axios = useApi();

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [TypeInquiry.SALES_INQUIRY],
      reference: [],
      priority: [],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inquiries",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const { data } = await useFetchApi<ResponsePagination<Inquiry[]>>(
  `/search`,
  "fetch-inquiries",
  "post",
  request_search.value
);
const tmpInquiries = ref<Inquiry[]>([]);
const dialogConfirmDelete = ref<boolean>(false);
const loading = ref<boolean>(false);
const search = ref("");

const availableColumn: Column<Inquiry>[] = [
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
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`inquiry/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Tanggal",
    dataKey: "date",
    key: "date",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.date == null ? "-" : formatLocalDate(row.date)}</p>
    ),
  },
  {
    title: "Diminta oleh",
    dataKey: "request_by",
    key: "request_by",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <p>{rowData.request_by?.name ?? ""}</p>
    ),
  },
  {
    title: "Ditujukan Untuk",
    dataKey: "request_to",
    key: "request_to",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <p>{rowData.request_to?.name ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "Priority",
    dataKey: "priority",
    key: "priority",
    width: 200,
    cellRenderer: ({ rowData: row }) =>
      row.priority == "low" ? (
        <ElTag type="info">{"Low"}</ElTag>
      ) : row.priority == "medium" ? (
        <ElTag type="warning">{"Medium"}</ElTag>
      ) : (
        <ElTag type="danger">{"Hight"}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Priority</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].priority}
                  >
                    <ElCheckbox value={"low"}>Low</ElCheckbox>
                    <ElCheckbox value={"medium"}>Medium</ElCheckbox>
                    <ElCheckbox value={"height"}>Height</ElCheckbox>
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
    title: "Status",
    dataKey: "status",
    key: "status",
    width: 200,

    cellRenderer: ({ rowData: row }: CellRendererParams<Inquiry>) =>
      getStatus(row),
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
                    <ElCheckbox value={"draft"}>Draft</ElCheckbox>
                    <ElCheckbox value={"waiting"}>Waiting</ElCheckbox>
                    <ElCheckbox value={"approve"}>Approve</ElCheckbox>
                    <ElCheckbox value={"done"}>Done</ElCheckbox>
                    <ElCheckbox value={"cancelled"}>Cancelled</ElCheckbox>
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
    title: "Operasi",
    key: "operation",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          href={"/sales/inquiry/add?id=" + row.unique_id}
          class="el-button el-button--small"
        >
          Edit
        </NuxtLink>
        {/* {
          can('inquiries-delete', data.value?.privilege ?? []) && ()
        } */}
        <DeleteButton
          onConfirm={() => handleDelete(row)}
          size="small"
          onCancel={() => {}}
        />
      </>
    ),
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

availableColumn[8].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={column_selected.value}>
                  {availableColumn
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

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const getReference = (data: Inquiry) => {
  if (data.reference == "internal") {
    const contact: Contact | null = data.reference_data as Contact;
    return <div>{contact?.name}</div>;
  } else {
    const maintenance: Maintenance | null = data.reference_data as Maintenance;
    return <div>{maintenance?.unique_code}</div>;
  }
};
const getStatus = (data: Inquiry) => {
  // 'draft','waiting','approve','done','cancelled','repair'

  if (data.status == "draft") {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "waiting") {
    return <ElTag type="warning">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "approve") {
    return <ElTag type="success">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "done") {
    return <ElTag type="primary">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == "cancelled") {
    return <ElTag type="danger">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else {
    return <ElTag type="info">{data?.status ?? ""}</ElTag>;
  }
};

const filterPriority = (value: string, row: Inquiry) => {
  return row.priority === value;
};

const handleEdit = (row: any) => {
  console.log("Editing:", row);
};

const handleDelete = (row: Inquiry) => {
  handleSubmitDelete([row.unique_id!]);
};

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      "/inquiries-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      await refreshNuxtData("inventories");
    }

    console.log(response);

    if (response.code != 200) {
      ElMessage.error(`${response.data.value?.message}`);
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const handleSelectionChange = (selection: Inquiry[]) => {
  tmpInquiries.value = selection;
};

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
      `/inquiries-delete`,
      "inventories-delete",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refreshNuxtData("get-inquiries");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
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

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

watch(request_search.value, () => refreshNuxtData("fetch-inquiries"), {
  immediate: true,
});
</script>
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
      layout="prev, pager, next, sizes, total"
      :total="data?.total_data"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>
