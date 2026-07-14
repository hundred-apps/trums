<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-read",
  name: "List Of Inquiries",
});
import { ref, onMounted } from "vue";
import {
  Filter,
  SetUp,
  Eleme,
  Refresh,
  Setting,
} from "@element-plus/icons-vue";
import { TypeInquiry, type Inquiry } from "~/types/inquiry";
import customTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
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
import { refreshNuxtData } from "#app";
import type { ColumnTable } from "~/types/ColumnTable";

const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "request_to",
  "request_by",
  "date",
  "reference",
  "reference_view",
  "priority",
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
      type: [TypeInquiry.INTERNAL],
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
});

const { data, status, refresh } = await useAsyncData(
  "get-inquiries",
  async () => {
    const res = await useFetchApi<ResponsePagination<Inquiry[]>>(
      `/search`,
      "get-inquiries",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const tmpInquiries = ref<Inquiry[]>([]);
const dialogConfirmDelete = ref<boolean>(false);
const loading = ref<boolean>(false);
const search = ref("");

const availableColumn: ColumnTable<Inquiry>[] = [
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
    fixed: true,
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
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    fixed: true,
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`inqueiries/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Diminta Oleh",
    dataKey: "request_to",
    key: "request_to",
    width: 300,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <>{rowData.request_to?.name ?? "N/A"}</>
    ),
  },
  {
    title: "PIC",
    dataKey: "request_by",
    key: "request_by",
    width: 300,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <>{rowData.request_by?.name ?? "N/A"}</>
    ),
  },
  {
    title: "Tanggal",
    dataKey: "date",
    key: "date",
    sortable: true,
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.date == null ? "-" : formatLocalDate(row.date)}</p>
    ),
  },
  {
    title: "Reference Type",
    dataKey: "reference",
    key: "reference",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <p>{rowData.reference == "so" ? "Sales Order" : "Purchase Order"}</p>
    ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Reference Type</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].reference}
                  >
                    <ElCheckbox value={"so"}>Sales Order</ElCheckbox>
                    <ElCheckbox value={"po"}>Purchase Order</ElCheckbox>
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
    title: "Reference",
    dataKey: "reference_view",
    key: "reference_view",
    width: 200,
    cellRenderer: ({ rowData: row }) => getReference(row),
  },
  {
    title: "Priority",
    dataKey: "priority",
    key: "priority",
    width: 100,
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
                    <ElCheckbox value={"high"}>High</ElCheckbox>
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
    width: 100,
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
    align: "center",
    width: 100,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href =
            "/inventory-management/inqueiries/add?id=" + rowData.unique_id;
        }
        if (command === "delete") {
          handleDelete(rowData);
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
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <NuxtLink
    //       href={"/inventory-management/inqueiries/add?id=" + row.unique_id}
    //       class="el-button el-button--small"
    //     >
    //       Edit
    //     </NuxtLink>
    //     <DeleteButton
    //       size="small"
    //       onConfirm={() => handleDelete(row)}
    //       onCancel={() => {}}
    //     />
    //   </>
    // ),
  },
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
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
                    .filter(
                      (c) =>
                        c.key !== "selection" &&
                        c.key !== "setup" &&
                        c.key !== "operation"
                    )
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
    const response = await useFetchApi(
      "/inquiries-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      await refreshNuxtData("inventories");
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

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

watch(request_search, () => refreshNuxtData("get-inquiries"), {
  immediate: true,
});

watch(request_search, () => refreshNuxtData("get-inquiries"), {
  immediate: true,
});

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

const onRefresh = () => refresh();

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
};

onMounted(() => {});
</script>
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
        class="el-button el-button--primary"
        :href="`/inventory-management/inqueiries/add`"
        >Buat Inquiri</NuxtLink
      >
      <el-button
        size="default"
        type="default"
        :loading="status === 'pending'"
        :loading-icon="Eleme"
        :icon="Refresh"
        @click="onRefresh"
        >Reload</el-button
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
      @sort-change="onSort"
      :columns="filteredColumn"
      :data="data?.data ?? []"
      :loading="status === 'pending'"
    />
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes"
        :total="data?.total_data"
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="paginationClick"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>
