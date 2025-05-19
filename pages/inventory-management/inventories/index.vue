<template>
  <TrumsWrapper>
    <div class="flex justify-between items-center mb-3">
      <div class="flex gap-2">
        <div class="w-auto">
          <el-input
            v-model="request_search.keyword"
            size="large"
            style="width: 350px"
            :placeholder="`${t('form.placeholder.search')}`"
          >
            <template #prefix>
              <Icon name="lineicons:magnifier" />
            </template>
          </el-input>
        </div>
        <div class="w-auto">
          <el-button
            size="large"
            @click="
              () => {
                navigateToForm('add');
              }
            "
            >{{ t("buttons.newInventory") }}</el-button
          >
        </div>
        <div class="w-auto">
          <el-button
            size="large"
            @click="
              () => {
                navigateToOpname();
              }
            "
            >{{ t("buttons.stockOpname") }}</el-button
          >
        </div>
        <div class="w-auto">
          <el-button
            v-if="checkSelect()"
            size="large"
            @click="deleteBulk()"
            type="danger"
            >{{ t("buttons.delete") }}</el-button
          >
        </div>
      </div>
      <el-tooltip :content="`${t('tooltip.reloadData')}`" placement="top">
        <el-button
          size="large"
          @click="fetchData"
          :loading-icon="RefreshRight"
          :loading="loading"
          ><Icon
            name="material-symbols:refresh"
            size="1.5em"
            :hidden="loading"
          />
          <span :hidden="!loading">{{ t("buttons.load") }}</span></el-button
        >
      </el-tooltip>
    </div>
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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import { SetUp, RefreshRight } from "@element-plus/icons-vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElLink,
  ElPopover,
  ElTooltip,
  ElTag,
  TableV2FixedDir,
  type CheckboxValueType,
  type Column,
  type SortBy,
} from "element-plus";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import { Filter } from "@element-plus/icons-vue";
import type { Unit } from "~/types/unit";

definePageMeta({
  middleware: ["auth", "app"],
});

const popoverRef = ref();
const { t } = useI18n();
const config = useRuntimeConfig();
const loading = ref<boolean>(false);
const router = useRouter();
const unique_id = useCookie("unique_id");
const localePath = useLocalePath();
const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);
const checkSelect = () => data?.value?.data.some((row) => row.checked);

const navigateToForm = (mode = "", name = "", unique_id = null) => {
  const path = name
    ? localePath(`/inventory-management/inventories/form/${name}`)
    : localePath("/inventory-management/inventories/form/add");
  navigateTo({ path, query: { mode, unique_id } });
};

const navigateToOpname = () => {
  const path = localePath(`/inventory-management/inventories/opname`);
  navigateTo(path);
};

const navigateToLocation = (name = "", unique_id = null) => {
  const path = localePath(`/inventory-management/location/${unique_id}`);
  navigateTo({ path, query: { name } });
};

const column_selected = ref<string[]>([
  "selection",
  "catalogue.name",
  "sn",
  "location.name",
  "quantity",
  "unit_name",
  "cost",
  "is_traceable",
  "operation",
  "setup",
]);

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

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

const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(
  `/search`,
  "inventories",
  "post",
  request_search.value
);

const availableColumn: Column<Inventory>[] = [
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
    title: `${t("form.label.itemName")}`,
    key: "catalogue.name",
    dataKey: "catalogue.name",
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.serialNumber")}`,
    key: "sn",
    dataKey: "sn",
    width: 200,
  },
  {
    title: `${t("form.label.location")}`,
    key: "location.name",
    dataKey: "location.name",
    width: 200,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2">{t("form.label.location")}</span>
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
                <ElTooltip placement="top" content="Filter">
                  <Filter />
                </ElTooltip>
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElLink
          underline={false}
          onClick={() =>
            navigateToLocation(row.location.name, row.location.unique_id)
          }
        >
          {row.location.name}
        </ElLink>
      </>
    ),
  },
  {
    title: `${t("form.label.quantity")}`,
    key: "quantity",
    dataKey: "quantity",
    sortable: true,
    width: 100,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{row.quantity}</p>
      </>
    ),
  },
  {
    title: `${t("form.label.unit")}`,
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
        <span class="mr-2">{t("form.label.unit")}</span>
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
                <ElTooltip placement="top" content="Filter">
                  <Filter />
                </ElTooltip>
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    title: `${t("form.label.cost")}`,
    key: "cost",
    dataKey: "cost",
    sortable: true,
    width: 200,
    cellRenderer: ({ rowData: row }) => (
      <>
        <p>{currency(row.cost)}</p>
      </>
    ),
  },
  {
    title: `${t("form.label.traceable")}`,
    key: "is_traceable",
    dataKey: "is_traceable",
    width: 200,
    cellRenderer: ({ rowData: row }) =>
      row.is_traceable ? (
        <ElTag type="primary" class="text-center">
          {t("buttons.yes")}
        </ElTag>
      ) : (
        <ElTag type="info">{t("buttons.no")}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2">{t("form.label.traceable")}</span>
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
                <ElTooltip placement="top" content="Filter">
                  <Filter />
                </ElTooltip>
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    title: `${t("form.label.operation")}`,
    key: "operation",
    dataKey: "",
    width: 100,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElTooltip placement="top" content={t("tooltip.edit")}>
          <ElButton
            type="warning"
            circle
            onClick={() => navigateToForm("update", row.name, row.unique_id)}
            plain
          >
            <Icon name="material-symbols:edit-square-outline-rounded" />
          </ElButton>
        </ElTooltip>
        <ElTooltip placement="top" content={t("tooltip.delete")}>
          <ElButton
            type="danger"
            circle
            plain
            onClick={() => messageBoxDelete(row)}
          >
            <Icon name="material-symbols:delete-outline" />
          </ElButton>
        </ElTooltip>
      </>
    ),
  },
  {
    title: "",
    key: "setup",
    width: 40,
    fixed: TableV2FixedDir.RIGHT,
    headerCellRenderer: () => {
      const filters = availableColumn.filter(
        (value) => value.key !== "selection" && value.key !== "setup"
      );
      return (
        <div class="flex items-center justify-center">
          <span class="mr-2"></span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <el-checkbox-group v-model={column_selected.value}>
                      {filters.map((value) => (
                        <ElCheckbox
                          value={value.key!.toString()}
                          onChange={() => {
                            console.log(`${value} toggled`);
                          }}
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
                  <ElTooltip
                    placement="top"
                    content={t("tooltip.hideOrSeeColumn")}
                  >
                    <SetUp />
                  </ElTooltip>
                </ElIcon>
              ),
            }}
          </ElPopover>
        </div>
      );
    },
  },
];

const messageBoxDelete = async (row: Catalogue) => {
  ElMessageBox.confirm(
    `${t("message.box.deleteInventory")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/inventories-delete",
        "inventories",
        "post",
        [row.unique_id]
      );
      if (response.status.value == "success") {
        await refreshNuxtData();
        ElMessage.success(`${t("message.successDeleted")}`);
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `${t("message.cancelDelete")}`,
      });
    });
};

const deleteBulk = () => {
  const checkeds = data.value?.data.filter((value) => value.checked);
  const ids = checkeds?.map((value) => value.unique_id);
  ElMessageBox.confirm(
    `${t("message.box.deleteSelected")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.delete")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      const response = await useFetchApi(
        "/inventories-delete",
        "inventories",
        "post",
        ids
      );
      if (response.status.value == "success") {
        ElMessage.success(`${t("message.successDeleted")}`);
        await refreshNuxtData();
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: `${t("message.cancelDelete")}`,
      });
    });
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

// watch(request_search, fetchData, { immediate: true });

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const fetchData = async () => {
  loading.value = true;
  try {
    await refreshNuxtData();
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
  loading.value = false;
  ElMessage.success(`${t("message.reloadData")}`);
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

onMounted(() => {
  fetchLocation();
  fetchUnits();
});
</script>
