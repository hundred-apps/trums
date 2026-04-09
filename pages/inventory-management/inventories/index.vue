<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventories-read",
  name: "List Of Inventory",
});
import { ref, onMounted, type FunctionalComponent } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import {
  InfoFilled,
  SetUp,
  RefreshLeft,
  Setting,
  Eleme,
} from "@element-plus/icons-vue";

import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import { Filter } from "@element-plus/icons-vue";
import type { Unit } from "~/types/unit";
import { NuxtLink } from "#components";
import type { ColumnTable } from "~/types/ColumnTable";

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
  "available",
  "request",
  "booking",
  "order",
  "setup",
]);

const popoverRef = ref();
const config = useRuntimeConfig();

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Inventory[]>>(
      `/search`,
      "inventories",
      "post",
      request_search.value
    );

    if (response.status.value == "success") {
      data.value = response.data.value as ResponsePagination<Inventory[]>;
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
      console.log(locations.value);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};
const fetchUnits = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<ResponsePagination<Unit[]>>(
      `/search`,
      "units",
      "post",
      {
        keyword: "",
        column: [],
        limit: "50",
        offset: "1",
        table: "units",
        sort: {
          column: "created_at",
          order: OrderColumn.ASC,
        },
      }
    );

    if (response.status.value == "success") {
      units.value = (response.data.value as ResponsePagination<Unit[]>).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const loading = ref<boolean>(false);

interface FilterModel {
  location_id: string[];
  is_traceable: boolean[];
  unit_id: string[];
}

const filters = ref<FilterModel>({
  is_traceable: [],
  location_id: [],
  unit_id: [],
});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      location_id: [],
      is_traceable: [],
      unit_id: [],
    },
  ],
  filter: {
    quantity: {
      min: 0,
    },
  },
  limit: "10",
  offset: "1",
  table: "inventories",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const router = useRouter();

// const filterTableData = computed(() =>
// (data.value ?? []).filter(
//   (value) =>
//     !search.value ||
//     value.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
//     value.unique_id.toLowerCase().includes(search.value.toLowerCase()) ||
//     value.catalogue.name?.toLowerCase().includes(search.value.toLowerCase())
// )
// )

// const { data } = await useAsyncData('inventories', fetchData);
const { data, refresh, status } = await useAsyncData(
  "inventories",
  async () => {
    const res = await useFetchApi<ResponsePagination<Inventory[]>>(
      `/search`,
      "inventories",
      "post",
      request_search.value
    );
    return res.data.value;
  }
);

const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);

const availableColumn: ColumnTable<Inventory>[] = [
  {
    title: "Unique Code",
    key: "",
    dataKey: "",
    width: 200,
    fixed: true,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <NuxtLink
        class={`text-blue-600`}
        href={`/catalogue/${rowData.unique_id}`}
      >
        {rowData.unique_code ?? "N/A"}
      </NuxtLink>
    ),
  },
  {
    title: "Item",
    key: "catalogue.name",
    dataKey: "catalogue.name",
    width: 500,
    fixed: true,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <NuxtLink
        class={`text-blue-600`}
        href={`/inventory-management/inventories/${rowData.unique_id}`}
      >
        {rowData.catalogue?.name ?? "N/A"}
      </NuxtLink>
    ),
  },
  {
    title: "Location",
    key: "location.name",
    dataKey: "location.name",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Location</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <el-checkbox-group
                    v-model={request_search.value.column![0].location_id}
                  >
                    {locations.value.map(
                      (location: Catalogue, index: number) => (
                        <ElCheckbox
                          key={location.unique_id ?? index}
                          value={location.unique_id ?? index}
                        >
                          {location.name}
                        </ElCheckbox>
                      )
                    )}
                  </el-checkbox-group>
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
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          class={`text-blue-600`}
          href={`/inventory-management/location/${
            row.location?.unique_id ?? ""
          }`}
        >
          {row.location?.name}
        </NuxtLink>
      </>
    ),
  },
  {
    title: "Serial Number",
    key: "sn",
    dataKey: "sn",
    width: 200,
  },

  {
    title: "Quantity",
    key: "quantity",
    dataKey: "quantity",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>
        <p>{rowData.quantity}</p>
      </>
    ),
  },
  {
    title: "Available",
    key: "available",
    dataKey: "available",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>
        <p class={"text-green-500"}>{rowData.available}</p>
      </>
    ),
  },
  {
    title: "Booking",
    key: "booking",
    dataKey: "booking",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>
        <p class={"text-yellow-500"}>{rowData.booking}</p>
      </>
    ),
  },
  {
    title: "Request",
    key: "request",
    dataKey: "request",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>
        <p class={"text-red-500"}>{rowData.request}</p>
      </>
    ),
  },
  {
    title: "Order",
    key: "order",
    dataKey: "order",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Inventory }) => (
      <>
        <p class={"text-blue-500"}>{rowData.order}</p>
      </>
    ),
  },
  {
    title: "Satuan",
    key: "unit_name",
    dataKey: "unit_name",
    sortable: false,
    width: 100,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.unit_name}</p>
      </>
    ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Satuan</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <el-checkbox-group
                    v-model={request_search.value.column![0].unit_id}
                  >
                    {units.value.map((unit: Unit) => (
                      <ElCheckbox key={unit.unique_id!} value={unit.unique_id!}>
                        {unit.name}
                      </ElCheckbox>
                    ))}
                  </el-checkbox-group>
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
    title: "Cost",
    key: "cost",
    dataKey: "cost",
    sortable: true,
    width: 120,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{currency(row.cost)}</p>
      </>
    ),
  },
  {
    title: "Traceable",
    key: "is_traceable",
    dataKey: "is_traceable",
    width: 100,
    cellRenderer: ({ rowData: row }) =>
      row.is_traceable ? (
        <ElTag type="primary">{"Yes"}</ElTag>
      ) : (
        <ElTag type="info">{"No"}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Traceable</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox
                    value={true}
                    v-model={request_search.value.column![0].is_traceable}
                  >
                    Traceable
                  </ElCheckbox>
                  <ElCheckbox
                    value={false}
                    v-model={request_search.value.column![0].is_traceable}
                  >
                    Not Traceable
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
    key: "operasi",
    width: 100,
    align: "center",
    // cellRenderer: ({ rowData: row }) => (
    //   <>
    //     <ElButton size="small" onClick={() => handleEdit(row)}>
    //       Edit
    //     </ElButton>
    //     <ElPopconfirm
    //       title="Yakin ingin menghapus?"
    //       confirmButtonText="Ya"
    //       cancelButtonText="Tidak"
    //       onConfirm={() => handleDelete(row)}
    //     >
    //       {{
    //         reference: () => (
    //           <ElButton size="small" type="danger">
    //             Delete
    //           </ElButton>
    //         ),
    //       }}
    //     </ElPopconfirm>
    //     {/* <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton> */}
    //   </>
    // ),
    cellRenderer: ({ rowData }: { rowData: Inventory }) => {
      const onCommand = (command: string) => {
        if (command === "edit") {
          window.location.href =
            "/inventory-movement/inventories/add?id=" + rowData.unique_id;
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
  {
    title: "",
    key: "setup",
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  },
];

availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
  const filters = availableColumn.filter(
    (value) => value.key != "selection" && value.key != "setup"
  );
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <el-checkbox-group v-model={column_selected.value}>
                  {filters.map((value) => (
                    <ElCheckbox
                      onChange={() => console.log("ok")}
                      value={value.key!.toString()}
                    >
                      {value.title}
                    </ElCheckbox>
                  ))}
                </el-checkbox-group>
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

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <ElCheckbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  );
};

availableColumn.unshift({
  key: "selection",
  width: 50,
  fixed: true,
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

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  },
});

const handleEdit = (row: Inventory) => {
  console.log("Editing:", row);
  const id = useCookie("unique_id");
  id.value = row.unique_id;
  router.push("inventories/add");
};

const handleDelete = async (row: Inventory) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      `/inventories-delete`,
      "delete_data",
      "post",
      [row.unique_id]
    );
    if (response.status.value == "success") {
      await refresh();
      ElMessage.success("Data Berhasil Dihapus");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected Rows:", selection);
};

const onSearch = async (value: string) => {
  console.log(request_search.value);
  const data: RequestSearch = { ...request_search.value };
  data.keyword = value;
  request_search.value = data;
};

const onSort = (sortBy: { prop: string; order: string }) => {
  request_search.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
};

watch(
  request_search,
  () => {
    refresh();
  },
  { immediate: true }
);

const paginationClick = (val: number) => {
  request_search.value.offset = val.toString();
};

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`;
};
const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "Yakin ingin menghapus data Inventory?",
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
      `/inventories-delete`,
      "inventories-delete",
      "post",
      ids
    );
    if (response.status.value == "success") {
      await refresh();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const hasSelected = computed(() => {
  return data.value?.data?.some((item) => item.checked) || false;
});

const onRefresh = () => {
  refresh();
};

const newInventory = () => {
  const unique_id = useCookie("unique_id");
  unique_id.value = null;
  // $router.push("inventories/add");
  window.location.href = "/inventory-management/inventories/add";
};

onMounted(() => {
  fetchLocation();
  fetchUnits();
});
</script>
<template>
  <TrumsWrapper>
    <div class="w-auto">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"
          ><el-input
            v-model="request_search.keyword"
            placeholder="Type to search"
        /></el-col>
        <el-button @click="newInventory">New Inventory</el-button>
        <el-button
          @click="onRefresh"
          :icon="Eleme"
          :loading="status === 'pending'"
        >
          Muat Ulang</el-button
        >
        <NuxtLink
          class="el-button el-button--default"
          href="/inventory-management/inventories/opname"
          >Stok Opname</NuxtLink
        >
        <el-button type="danger" :disabled="!hasSelected" @click="bulkDelete">
          Hapus yang Dipilih
        </el-button>
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
    </div>
  </TrumsWrapper>
</template>
