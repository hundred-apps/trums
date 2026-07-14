<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventories-read",
  name: "List Of Stok Opname",
});
import { ref, onMounted, type FunctionalComponent } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import { InfoFilled, SetUp, RefreshLeft } from "@element-plus/icons-vue";

import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElPopconfirm,
  ElPopover,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type SortBy,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import { Filter } from "@element-plus/icons-vue";
import type { Unit } from "~/types/unit";
import { NuxtLink } from "#components";

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
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
const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      is_traceable: [],
    },
  ],
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
const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(
  `/search`,
  "inventories",
  "post",
  request_search.value
);
const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);

const availableColumn: Column<Inventory>[] = [
  {
    title: "Serial Number",
    key: "sn",
    dataKey: "sn",
    width: 200,
  },
  {
    title: "Item",
    key: "catalogue.name",
    dataKey: "catalogue.name",
    width: 200,
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
                    v-model={request_search.value.column[0].location_id}
                  >
                    {locations.value.map((location: Catalogue) => (
                      <ElCheckbox
                        key={location.unique_id!}
                        value={location.unique_id!}
                      >
                        {location.name}
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
    cellRenderer: ({ rowData: row }) => (
      <>
        <NuxtLink
          class={`text-blue-600`}
          href={`/inventory-management/location/${row.location.unique_id}`}
        >
          {row.location.name}
        </NuxtLink>
      </>
    ),
  },
  {
    title: "Stok Saat ini",
    key: "quantity",
    dataKey: "quantity",
    sortable: true,
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.quantity}</p>
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
                    v-model={request_search.value.column[0].unit_id}
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
    width: 100,
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
                    v-model={request_search.value.column[0].is_traceable}
                  >
                    Traceable
                  </ElCheckbox>
                  <ElCheckbox
                    value={false}
                    v-model={request_search.value.column[0].is_traceable}
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
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => handleEdit(row)}>
          Edit
        </ElButton>
        <ElPopconfirm
          title="Yakin ingin menghapus?"
          confirmButtonText="Ya"
          cancelButtonText="Tidak"
          onConfirm={() => handleDelete(row)}
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
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },

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
      await refreshNuxtData("inventories");
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

const handleSelectLocation = (item: Record<string, any>) => {
  ruleForm.location_id = item.unique_id;
  request_search.value.column.push({ location_id: item.unique_id });
};

watch(request_search, fetchData, { immediate: true });

const request_search_location = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  limit: "100",
  offset: "1",
  sort: null,
});

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const goBack = () => router.back();

const ruleFormRef = ref<FormInstance>();

const axios = useApi();

interface RuleForm {
  id?: number;
  location_id?: string;
  date?: string;
  status?: string;
}

const ruleForm = reactive<RuleForm>({
  status: "Progress",
});

const rules = reactive<FormRules<RuleForm>>({
  location_id: [
    {
      required: true,
      message: "Pilih Lokasi Terlebih Dahulu!",
      trigger: "blur",
    },
  ],
  date: [
    {
      type: "date",
      required: true,
      message: "Pilih Tanggal",
      trigger: "change",
    },
  ],
  status: [{ required: true, message: "Pilih Status", trigger: "blur" }],
});

const formSize = ref<ComponentSize>("default");
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log(ruleForm);
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const querySearchAsyncLocation = (
  queryString: string,
  cb: (arg: any) => void
) => {
  request_search_location.value.keyword = queryString;
  request_search_location.value.table = "catalogues";
  request_search_location.value.column = [
    {
      type: ["place"],
    },
  ];
  request_search_location.value.flag = "form";
  axios
    .post("/search", request_search_location.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

onMounted(() => {
  fetchLocation();
  fetchUnits();
});
</script>
<template>
  <el-page-header @back="goBack">
    <template #content>
      <span class="text-large font-600 mr-3"> Stok Opname </span>
    </template>
  </el-page-header>
  <div class="w-auto my-3">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      <el-card class="my-3">
        <template #header>
          <div class="card-header">
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)"
                >Simpan</el-button
              >
              <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
            </el-form-item>
          </div>
        </template>

        <el-form-item label="Lokasi" prop="location_id">
          <el-autocomplete
            :fetch-suggestions="querySearchAsyncLocation"
            v-model="ruleForm.location_id"
            placeholder="Please input"
            @select="(item: Record<string, any>) => handleSelectLocation(item)"
          />
        </el-form-item>
        <el-form-item label="Tanggal" prop="date">
          <el-date-picker
            v-model="ruleForm.date!"
            type="date"
            placeholder="Tanggal Opname"
          />
        </el-form-item>
      </el-card>
    </el-form>
    <CustomTable
      :column-sort="onSort"
      :columns="filteredColumn"
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
  </div>
</template>
