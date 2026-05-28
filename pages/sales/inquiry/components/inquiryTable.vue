<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-read",
});
import { ref, onMounted } from "vue";
import {
  Filter,
  Setting,
  SetUp,
  Eleme,
  Plus,
  Refresh,
  Delete,
  Search,
} from "@element-plus/icons-vue";
import { InquiryStatus, TypeInquiry, type Inquiry } from "~/types/inquiry";
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
  type DrawerProps,
  type FormProps,
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
import type { ColumnTable } from "~/types/ColumnTable";
import CustomLinkButton from "~/components/trums/CustomLinkButton.vue";
const { isMobile } = useDevice();

const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "date",
  "request_by.name",
  "request_to.name",
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
  limit: "20",
  offset: "1",
  table: "inquiries",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const labelPositionFormDrawer = ref<FormProps["labelPosition"]>("top");
const filterDrawer = reactive<{
  status: string[];
  date: string[];
  show_data: number;
}>({
  status: [],
  date: [],
  show_data: 20,
});

const { data, refresh } = await useAsyncData("fetch-inquiries", async () => {
  const res = await useFetchApi<ResponsePagination<Inquiry[]>>(
    `/search`,
    "fetch-inquiries",
    "post",
    request_search.value
  );
  return res.data.value;
});

const refreshTable = () => refresh();

const tmpInquiries = ref<Inquiry[]>([]);
const dialogConfirmDelete = ref<boolean>(false);

const bottomSheetState = ref<boolean>(false);
const direction = ref<DrawerProps["direction"]>("btt");

const loading = ref<boolean>(false);
const search = ref("");

const availableColumn: ColumnTable<Inquiry>[] = [
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
    title: "Perusahaan/Perorangan",
    dataKey: "request_to.name",
    key: "request_to.name",
    sortable: true,
    width: isMobile ? 250 : 0,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <p>{rowData.request_to?.name ?? "Tidak Ada"}</p>
    ),
  },
  {
    title: "INQ.NO",
    dataKey: "unique_code",
    key: "unique_code",
    width: isMobile ? 100 : 0,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink
        href={`/sales/inquiry/${row.unique_id}`}
        class={"text-blue-600"}
      >
        {isMobile ? wrapUniqueCode(row.unique_code) : row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "PIC",
    dataKey: "request_by.name",
    key: "request_by.name",
    width: isMobile ? 200 : 0,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => (
      <p>{rowData.request_by?.name ?? ""}</p>
    ),
  },
  {
    title: "Tanggal",
    dataKey: "date",
    key: "date",
    width: isMobile ? 150 : 0,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.date == null ? "-" : formatLocalDate(row.date)}</p>
    ),
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
    width: isMobile ? 130 : 0,
    align: "center",
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
                    <ElCheckbox value={"canvassing"}>Canvassing</ElCheckbox>
                    <ElCheckbox value={"rab"}>RAB</ElCheckbox>
                    <ElCheckbox value={"quotation"}>QUOTATION</ElCheckbox>
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
    width: 100,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: Inquiry }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = "/sales/inquiry/add?id=" + rowData.unique_id;
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
  },
  // {
  //   title: "",
  //   key: "setup",
  //   width: 50,
  //   fixed: TableV2FixedDir.RIGHT,
  // },
];

// availableColumn[8].headerCellRenderer = () => {
//   return (
//     <div class="flex items-center justify-center">
//       <span class="mr-2 text-xs"></span>
//       <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
//         {{
//           default: () => (
//             <div class="filter-wrapper">
//               <div class="filter-group flex flex-col">
//                 <ElCheckboxGroup v-model={column_selected.value}>
//                   {availableColumn
//                     .filter((c) => c.key !== "selection" && c.key !== "setup")
//                     .map((c) => (
//                       <ElCheckbox
//                         key={c.key}
//                         value={c.key!.toString()}
//                         label={c.title}
//                       />
//                     ))}
//                 </ElCheckboxGroup>
//               </div>
//             </div>
//           ),
//           reference: () => (
//             <ElIcon class="cursor-pointer">
//               <SetUp />
//             </ElIcon>
//           ),
//         }}
//       </ElPopover>
//     </div>
//   );
// };

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

  if (data.status == InquiryStatus.DRAFT) {
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == InquiryStatus.CANVASSING) {
    return <ElTag type="warning">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == InquiryStatus.RAB) {
    return <ElTag type="success">{(data?.status ?? "").toUpperCase()}</ElTag>;
  } else if (data.status == InquiryStatus.PENAWARAN) {
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

const onSort = (sortBy: { order: string; prop: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC
        : OrderColumn.DESC,
  };
};

const handlePageChange = (page: number) => {
  console.log("harusnya referesh");
  request_search.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  console.log("harusnya referesh");
  request_search.value.limit = `${size}`;
};

const hasSelected = computed(() => {
  const hasSelect = data.value?.data?.some((item) => item.checked) || false;
  console.log("has select", hasSelect);
  return hasSelect;
});

const statuses: { label: string; value: string }[] = [
  { label: "DRAFT", value: "draft" },
  { label: "CANVASSING", value: "canvassing" },
  { label: "RAB", value: "rab" },
  { label: "QUOTATION", value: "quotation" },
];

const onFilter = () => {
  request_search.value.column = [
    ...request_search.value.column,
    {
      status: filterDrawer.status,
    },
  ];
  request_search.value.limit = `${filterDrawer.show_data | 20}`;
  request_search.value.filter = {
    date: {
      min: filterDrawer.date[0],
      max: filterDrawer.date[1],
    },
  };
  bottomSheetState.value = false;
};
const onResetFilter = () => {
  request_search.value.column = [
    ...request_search.value.column,
    {
      status: ["ALL"],
    },
  ];
  request_search.value.limit = `20`;
  request_search.value.filter = null;
};

const showFilter = () => {
  bottomSheetState.value = true;
};

watch(
  () => request_search.value,
  () => {
    console.log("harusnya referesh");
    refreshTable();
  },
  {
    deep: true,
  }
);
</script>
<template>
  <el-row :gutter="20" class="mb-3">
    <el-col v-if="isMobile" :xs="24" :sm="12" :md="6">
      <div class="flex gap-3 mb-3 md:mb-0">
        <CustomLinkButton
          :url="'/sales/inquiry/add'"
          :type="'primary'"
          :is-circle="true"
          ><el-icon><Plus /></el-icon
        ></CustomLinkButton>

        <TrumsCustomButton
          type="default"
          :disabled="loading"
          :loading="loading"
          :is-circle="true"
          @click="refreshTable"
          ><el-icon><Eleme /></el-icon
        ></TrumsCustomButton>

        <TrumsCustomButton
          type="danger"
          :disabled="!hasSelected"
          :loading="loading"
          @click="bulkDelete"
          :is-circle="true"
          ><el-icon><Delete /></el-icon
        ></TrumsCustomButton>
        <TrumsCustomButton
          type="default"
          :disabled="false"
          :loading="loading"
          @click="showFilter"
          :is-circle="true"
          ><el-icon><Filter /></el-icon
        ></TrumsCustomButton>
      </div>
    </el-col>
    <el-col v-else :xs="24" :sm="12" :md="6">
      <div class="flex gap-3 mb-3 md:mb-0">
        <CustomLinkButton :url="'/sales/inquiry/add'" :type="'primary'"
          >Buat RFQ</CustomLinkButton
        >

        <TrumsCustomButton
          type="default"
          :disabled="loading"
          :loading="loading"
          :icon="Eleme"
          @click="refreshTable"
          >Refresh</TrumsCustomButton
        >

        <TrumsCustomButton
          type="danger"
          :disabled="!hasSelected"
          :loading="loading"
          @click="bulkDelete"
          >Hapus</TrumsCustomButton
        >
      </div>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6"
      ><el-input
        v-model="request_search.keyword"
        size="default"
        placeholder="Type to search"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><Search /></el-icon> </template
      ></el-input>
    </el-col>
  </el-row>
  <customTable
    @sort-change="onSort"
    :columns="filteredColumn"
    :data="data?.data ?? []"
  />
  <div class="flex justify-end mt-3">
    <el-pagination
      background
      :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
      :total="data?.total_data"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      size="small"
    />
  </div>
  <el-divider v-if="isMobile"
    ><p class="text-xs">Total Data {{ data?.total_data }}</p></el-divider
  >

  <el-drawer v-model="bottomSheetState" :direction="direction" size="50%">
    <template #header class="mb-0">
      <h4>Filter</h4>
    </template>
    <el-form
      class="flex flex-col justify-start"
      v-model="filterDrawer"
      resizable
      :label-position="labelPositionFormDrawer"
    >
      <el-form-item prop="status" label="Status" class="w-full">
        <el-select
          v-model="filterDrawer.status"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Status"
        >
          <el-option
            v-for="item in statuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item prop="show_data" label="Tanggal">
        <el-date-picker
          v-model="filterDrawer.date"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="onResetFilter">Reset</el-button>
        <el-button type="primary" @click="onFilter">Terapkan</el-button>
      </div>
    </template>
  </el-drawer>
</template>
