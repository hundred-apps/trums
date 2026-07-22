<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventory-movements-read",
  name: "List Of Inventory Movement",
});
import { ref, onMounted } from "vue";
import { InfoFilled, Setting, SetUp, Eleme } from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  TableV2FixedDir,
  ElCheckbox,
  ElIcon,
  ElPopover,
  ElTag,
  type CheckboxValueType,
  type Column,
  type HeaderCellSlotProps,
  type SortBy,
  ElCheckboxGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import DeleteButton from "~/components/trums/DeleteButton.vue";
import { NuxtLink } from "#components";
import type { InventoryMovement } from "~/types/inventory_movement";
import { Filter } from "@element-plus/icons-vue";
import type { ColumnTable } from "~/types/ColumnTable";

interface FormFilter {
  date_range: string[];
}

const ruleFormFilter = reactive<FormFilter>({
  date_range: ["", ""],
});

const loading = ref<boolean>(false);
const column_selected = ref<string[]>([
  "selection",
  "unique_code",
  "type",
  "from_name",
  "to_name",
  "status",
  "created_at",
  "operation",
  "setup",
]);
const search = ref("");
const router = useRouter();
const popoverRef = ref();
const availableColumn: ColumnTable<InventoryMovement>[] = [
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
    title: "Unique Code",
    dataKey: "unique_code",
    key: "unique_code",
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`checkin/${row.unique_id}`} class={"text-blue-600"}>
        {row.unique_code}
      </NuxtLink>
    ),
  },
  {
    title: "Tipe",
    dataKey: "type",
    key: "type",
    width: 150,
    align: "center",
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Type</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup
                    v-model={request_search.value.column[0].type}
                  >
                    <ElCheckbox value="in">Barang Masuk</ElCheckbox>
                    <ElCheckbox value="out">Barang Keluar</ElCheckbox>
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
    cellRenderer: ({ rowData }: { rowData: InventoryMovement }) => (
      <>
        {rowData.type == "in" ? (
          <el-tag type="danger">Barang Masuk</el-tag>
        ) : (
          <el-tag type="success">Barang Keluar</el-tag>
        )}
      </>
    ),
  },
  {
    title: "Sumber",
    dataKey: "from_name",
    key: "from_name",
  },
  {
    title: "Tujuan",
    dataKey: "to_name",
    key: "to_name",
  },
  {
    title: "Status",
    dataKey: "status",
    key: "status",
    width: 100,
    align: "center",
    cellRenderer: ({ rowData: row }) => getStatus(row),
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
                    <ElCheckbox value="draft">Draft</ElCheckbox>
                    <ElCheckbox value="waiting">Waiting</ElCheckbox>
                    <ElCheckbox value="ready">Ready</ElCheckbox>
                    <ElCheckbox value="delivery">Delivery</ElCheckbox>
                    <ElCheckbox value="done">Done</ElCheckbox>
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
    title: "Tgl Dibuat",
    dataKey: "created_at",
    key: "created_at",
    width: 200,
    sortable: true,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
  {
    title: "Operasi",
    key: "operation",
    width: 100,
    align: "center",
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <ElButton size="small" onClick={() => handleEdit(row)}>
    //       Edit
    //     </ElButton>
    //     <DeleteButton
    //       size="small"
    //       onConfirm={() => handleDelete([row.unique_id])}
    //       onCancel={() => {}}
    //     />
    //   </>
    // ),
    cellRenderer: ({ rowData }: { rowData: InventoryMovement }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href = `/inventory-management/checkin/add?id=${rowData.unique_id}`;
        }
        if (command === "delete") {
          handleDelete([rowData.unique_id]);
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

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      type: [],
      status: [],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inventory_movement",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const { data, status, refresh } = await useAsyncData(
  "inventory_movement",
  async () => {
    const res = await useFetchApi<ResponsePagination<InventoryMovement[]>>(
      `/search`,
      "inventory_movement",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const checkSelect = () =>
  (data?.value?.data ?? []).some((row) => row.checked) ?? [];

const getStatus = (data: InventoryMovement) => {
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
    return <ElTag type="info">{(data?.status ?? "").toUpperCase()}</ElTag>;
  }
};

const handleEdit = (row: any) => {
  console.log("Editing:", row);
};

const handleDelete = async (row: string[]) => {
  console.log("Editing:", row);
  try {
    ElMessageBox.confirm(
      "Data akan dihapus secara permanen. Lanjutkan?",
      "Warning",
      {
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        type: "warning",
      }
    )
      .then(async () => {
        const response = await useFetchApi(
          "/inventory-movement-delete",
          "inventory_movement",
          "post",
          row
        );
        console.log("response", response.status);
        if (response.status.value == "success") {
          ElMessage.success(`Berhasil`);
          await refreshNuxtData("inventory_movement");
        }
      })
      .catch(() => {
        // Cancel
      });
  } catch (e: any) {
    ElMessage.error(`${e.response?.data?.message ?? e}`);
  }
};

const testNew = () => {
  const payload = {
    catalogue_id: 1,
    new: [
      {
        catalogue_id: 3,
        name: "new name",
      },
      {
        catalogue_id: 6,
        name: "new name 1",
      },
    ],
  };

  const catalogue_id = payload.catalogue_id;

  payload.new.forEach((element) => {
    const subtitution_id = Math.random();
    fungsiInsert({
      catalogue_id: element.catalogue_id,
      subtitution_id: subtitution_id,
    });
    fungsiInsert({
      catalogue_id: catalogue_id,
      subtitution_id: subtitution_id,
    });

    // insert subtitution_name
  });
};

const fungsiInsert = (data: {
  catalogue_id: number;
  subtitution_id: number;
}) => {};

const deleteBulk = async () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  const ids = (checkeds ?? []).map((value) => value.unique_id);
  if (ids.length > 0) {
    handleDelete(ids);
  }
};

const onSort = async (sortBy: { prop: string; order: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

const add = (typecheck: string) => {
  const type = useCookie("type");
  type.value = typecheck;
  router.push("checkin/add");
};

watch(
  () => request_search.value,
  () => onRefresh(),
  {
    deep: true,
  }
);

watch(
  ruleFormFilter,
  (newValue) => {
    const start = new Date(newValue.date_range[0]).getTime() / 1000;
    const end = new Date(newValue.date_range[1]).getTime() / 1000;
    request_search.value.filter = {
      created_at: {
        min: start,
        max: end,
      },
    };
  },
  { deep: true }
);

const onSearch = (value: string) => {
  const request = { ...request_search.value };
  request.keyword = value;
  request_search.value = request;
};

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
  request_search.value.offset = "1";
};

const shortcutsDate = [
  {
    text: "Last week",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

const consigment = () => {
  const start = new Date(ruleFormFilter.date_range[0]).getTime() / 1000;
  const end = new Date(ruleFormFilter.date_range[1]).getTime() / 1000;
  console.log(start);
  console.log(end);
  const start_date = useCookie("start_date_consigment");
  const end_date = useCookie("end_date_consigment");
  start_date.value = start.toString();
  end_date.value = end.toString();
  router.push("consigment");
};

const onRefresh = () => refresh();

onMounted(() => {
  // loading.value = true;
  // setTimeout(() => {
  //   fetchData();
  //   loading.value = false;
  // }, 2000);
});
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
      <el-button
        size="default"
        type="default"
        :loading="status === 'pending'"
        :icon="Eleme"
        @click="onRefresh"
        >Reload</el-button
      >

      <NuxtLink
        class="el-button el-button--primary"
        href="/inventory-management/checkin/add?type=in"
        >CheckIn</NuxtLink
      >
      <NuxtLink
        class="el-button el-button--primary"
        href="/inventory-management/checkin/add?type=out"
        >CheckOut</NuxtLink
      >
      <!-- <el-button size="default" @click="consigment">Consignment</el-button> -->
      <el-form
        :model="ruleFormFilter"
        class="ml-3"
        label-width="auto"
        style="max-width: 600px"
      >
        <el-form-item label="">
          <el-date-picker
            v-model="ruleFormFilter.date_range"
            type="daterange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcutsDate"
            size="default"
          />
        </el-form-item>
      </el-form>
      <el-popconfirm
        v-if="checkSelect()"
        width="220"
        :icon="InfoFilled"
        icon-color="#626AEF"
        title="Apakah Anda Yakin Ingin Menghapus Data ini?"
        @cancel="() => {}"
      >
        <template #reference>
          <el-button size="default" class="ml-3" type="danger"
            >Delete</el-button
          >
        </template>
        <template #actions="{ confirm, cancel }">
          <el-button size="small" @click="cancel">Batal</el-button>
          <el-button type="danger" size="small" @click="deleteBulk">
            Hapus
          </el-button>
        </template>
      </el-popconfirm>
    </el-row>
    <CustomTable
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
