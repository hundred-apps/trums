<template>
  <TrumsWrapper>
    <el-page-header @back="goBack" :title="`${t('menu.back')}`">
      <template #content>
        <span class="text-large font-600 mr-3 font-bold">
          {{ detail?.name }}
        </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      <!-- <el-button type="primary" @click="() => {}" :loading="loading">Proses</el-button> -->
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item :label="`${t('form.label.uniqueCode')}`">{{
              detail?.unique_code
            }}</el-descriptions-item>
            <el-descriptions-item :label="`${t('form.label.name')}`">{{
              detail?.name
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item :label="`${t('form.label.asset')}`">{{
              detail?.is_asset ? `${t("buttons.yes")}` : `${t("buttons.no")}`
            }}</el-descriptions-item>
            <el-descriptions-item :label="`${t('form.label.serialNumber')}`">{{
              detail?.sn ?? "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-descriptions :title="`${t('form.label.description')}`">
        <el-descriptions-item label="">{{
          detail?.description ?? ""
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card>
      <el-tabs v-model="activeTabs" type="card">
        <el-tab-pane :label="`${t('form.label.listInventory')}`" name="list">
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
                <el-button size="large" @click="() => handleAddNewItem()">{{
                  t("buttons.addItem")
                }}</el-button>
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
                <span :hidden="!loading">{{
                  t("buttons.load")
                }}</span></el-button
              >
            </el-tooltip>
          </div>
          <CustomTable
            :column-sort="onSort"
            :columns="filteredColumn"
            :data="data?.data ?? []"
          />
          <div class="flex justify-end">
            <el-pagination
              class="my-3"
              background
              layout="prev, pager, next"
              :total="data?.total_page"
            />
          </div>
          <el-dialog
            v-model="dialogFormVisible"
            :title="`${t('buttons.newItem')}`"
            width="500"
            @close="resetFormAll(ruleFormRef)"
            @close-auto-focus="resetFormAll(ruleFormRef)"
            @closed="resetFormAll(ruleFormRef)"
          >
            <el-form
              ref="ruleFormRef"
              style="max-width: 600px"
              :model="ruleForm"
              :rules="rules"
              label-width="auto"
              class="demo-ruleForm"
              :size="formSize"
              status-icon
              :disabled="loading"
            >
              <el-form-item
                :label="`${t('form.label.itemName')}`"
                prop="catalogue"
              >
                <el-autocomplete
                  v-model="ruleForm.catalogue"
                  :fetch-suggestions="querySearchAsync"
                  :trigger-on-focus="false"
                  clearable
                  class="inline-input w-50"
                  :placeholder="`${t('form.placeholder.item')}`"
                  @select="handleSelect"
                />
              </el-form-item>
              <el-form-item :label="`${t('form.label.cost')}`" prop="tmp_cost">
                <el-input
                  v-model="ruleForm.tmp_cost"
                  :placeholder="`${t('form.placeholder.cost')}`"
                  :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                  :parser="(value: any) => value.replace(/[^0-9]/g, '')"
                >
                  <template #prefix>
                    <el-text>Rp</el-text>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item
                v-if="ruleForm.traceable == '0'"
                :label="`${t('form.label.quantity')}`"
                prop="qty"
              >
                <el-input
                  v-model="ruleForm.qty"
                  :parser="(value: any) => value.replace(/[^0-9]/g, '')"
                  :placeholder="`${t('form.placeholder.quantity')}`"
                />
              </el-form-item>
              <el-form-item :label="`${t('form.label.unit')}`" prop="unit_name">
                <el-autocomplete
                  v-model="ruleForm.unit_name"
                  :fetch-suggestions="querySearchUnit"
                  :trigger-on-focus="false"
                  clearable
                  class="inline-input w-50"
                  :placeholder="`${t('form.placeholder.unit')}`"
                  @select="handleSelectUnit"
                />
              </el-form-item>
              <el-form-item
                :label="`${t('form.label.trackInventory')}`"
                prop="is_traceable"
              >
                <el-radio-group v-model="ruleForm.traceable">
                  <el-radio value="1">{{ t("buttons.yes") }}</el-radio>
                  <el-radio value="0">{{ t("buttons.no") }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                v-if="ruleForm.traceable == '1'"
                :label="`${t('form.label.serialNumber')}`"
                prop="sn"
              >
                <el-input
                  v-model="ruleForm.sn"
                  :placeholder="`${t('form.placeholder.serialNumber')}`"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <div class="flex justify-end align-center">
                <el-button type="info" plain @click="resetForm(ruleFormRef)">{{
                  t("buttons.reset")
                }}</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                  {{ t("buttons.save") }}
                </el-button>
              </div>
            </template>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane
          :label="`${t('form.label.warehouseHistory')}`"
          name="history"
        >
          <el-tabs v-model="activeTabsHistory">
            <div class="flex gap-2 mb-3">
              <el-input
                v-model="request_searchHistory.keyword"
                size="large"
                style="width: 350px"
                :placeholder="`${t('form.placeholder.search')}`"
              >
                <template #prefix>
                  <Icon name="lineicons:magnifier" />
                </template>
              </el-input>
              <el-date-picker
                v-model="valueDate"
                @change="changeFilterDate()"
                type="daterange"
                unlink-panels
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                :shortcuts="shortcutsDate"
                size="large"
              />
            </div>
            <el-tab-pane :label="`${t('form.label.all')}`" name="all">
              <CustomTable
                :column-sort="onSort"
                :columns="columnHistory"
                :data="dataHistory?.data ?? []"
              />
              <div class="flex justify-end">
                <el-pagination
                  class="my-3"
                  background
                  layout="prev, pager, next"
                  :total="dataHistory?.total_page"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane :label="`${t('form.label.in')}`" name="in">
              <CustomTable
                :column-sort="onSort"
                :columns="columnHistoryIn"
                :data="filteredDataIn ?? []"
              />
              <div class="flex justify-end">
                <el-pagination
                  class="my-3"
                  background
                  layout="prev, pager, next"
                  :total="filteredDataIn?.length"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane :label="`${t('form.label.out')}`" name="out">
              <CustomTable
                :column-sort="onSort"
                :columns="columnHistoryOut"
                :data="filteredDataOut ?? []"
              />
              <div class="flex justify-end">
                <el-pagination
                  class="my-3"
                  background
                  layout="prev, pager, next"
                  :total="filteredDataOut?.length"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import {
  ElButton,
  ElTooltip,
  ElCheckbox,
  ElIcon,
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
import type { Catalogue } from "~/types/catalogue";
import type { Inventory } from "~/types/inventory";
import type { InventoryMovement } from "~/types/inventory_movement";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { BaseResponse } from "~/types/response";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Unit } from "~/types/unit";
import { Filter, SetUp, RefreshRight } from "@element-plus/icons-vue";
import CustomTable from "~/components/trums/table/customTable.vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Detail Request",
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const api = useApi();
const goBack = () => router.back();
const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");
const locationNow = route.query.name;
const loading = ref<boolean>(false);
const popoverRef = ref(null);
const editingUniqueId = ref<string | null>(null);
const detail = ref<Catalogue | null>(null);
const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);
const disable = ref<boolean>(false);
const activeTabs = ref("list");
const activeTabsHistory = ref("all");
const dialogFormVisible = ref(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const checkSelect = () => data?.value?.data.some((row) => row.checked);
const valueDate = ref("");
const startDateFilter = ref<number>(0);
const endDateFilter = ref<number>(0);

const changeFilterDate = () => {
  const [start, end] = valueDate.value;
  const startDate = new Date(start).getTime() / 1000;
  const endDate = new Date(end).getTime() / 1000;
  startDateFilter.value = startDate;
  endDateFilter.value = endDate;
};

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      location_id: [id.value],
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

const request_searchHistory = ref<RequestSearch>({
  keyword: "",
  column: [
    {
      to: [id.value],
    },
    {
      from: [id.value],
    },
  ],
  limit: "10",
  offset: "1",
  table: "inventory_movement",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const rules = reactive<FormRules<RuleForm>>({
  catalogue: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  quantity: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  cost: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  unit_name: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
  sn: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "blur",
    },
  ],
});

interface RuleForm {
  id: number;
  catalogue: string;
  catalogue_id: string | null;
  location_id: string | null;
  location_name: string;
  is_traceable: boolean;
  traceable: string;
  sn: string;
  unit_id: number | null;
  unit_name: string;
  qty: string;
  quantity: number;
  cost: number;
  tmp_cost: string;
  unique_id?: string;
}

const ruleForm = reactive<RuleForm>({
  id: 1,
  catalogue: "",
  location_name: "",
  catalogue_id: "",
  location_id: "",
  is_traceable: false,
  sn: "",
  unit_id: 0,
  unit_name: "",
  quantity: 0,
  cost: 0,
  qty: "0",
  tmp_cost: "0",
  traceable: "0",
});

const requestSearch = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  sort: null,
  limit: "50",
  offset: "1",
});

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  requestSearch.value.keyword = queryString;
  requestSearch.value.table = "catalogues";
  requestSearch.value.column = [{ type: ["item"] }];
  api
    .post("/search", requestSearch.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;
        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `${t("form.dropdown.addItem", {
                name: queryString,
              })}`,
              id: `${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...requestSearch.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  api
    .post("/search", params)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Unit[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([
            {
              value: `${t("form.dropdown.addUnit", {
                name: queryString,
              })}`,
              id: `${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const handleSelect = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleForm.catalogue = item.id;
    ruleForm.catalogue_id = null;
  } else {
    ruleForm.catalogue = item.value;
    ruleForm.catalogue_id = item.unique_id;
  }
};

const handleSelectUnit = (item: Record<string, any>) => {
  if (item.unique_id == undefined) {
    ruleForm.unit_name = item.id;
    ruleForm.unit_id = null;
  } else {
    ruleForm.unit_name = item.value;
    ruleForm.unit_id = item.unique_id;
  }
};

const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(
  `/search`,
  "inventories",
  "post",
  request_search.value
);

const { data: dataHistory } = await useFetchApi<
  ResponsePagination<InventoryMovement[]>
>(`/search`, "inventory_movement", "post", request_searchHistory.value);

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
  "setup",
  "is_traceable",
  "unit_name",
  "cost",
  "operation",
]);

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

const filteredDataIn = computed(() => {
  return dataHistory.value.data.filter((col) => col.to === id.value);
});

const filteredDataOut = computed(() => {
  return dataHistory.value.data.filter((col) => col.from === id.value);
});

const availableColumn: Column<Inventory>[] = [
  {
    title: "",
    dataKey: "",
    key: "selection",
    width: 40,
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
    title: `${t("form.label.serialNumber")}`,
    key: "sn",
    dataKey: "sn",
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.itemName")}`,
    key: "catalogue.name",
    dataKey: "catalogue.name",
    width: 200,
  },
  //   {
  //     title: "Location",
  //     key: "location.name",
  //     dataKey: "location.name",
  //     width: 200,
  //     headerCellRenderer: () => (
  //       <div class="flex items-center justify-center">
  //         <span class="mr-2">Location</span>
  //         <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
  //           {{
  //             default: () => (
  //               <div class="filter-wrapper">
  //                 <div class="filter-group flex flex-col">
  //                   <el-checkbox-group
  //                     v-model={request_search.value.column[0].location_id}
  //                   >
  //                     {locations.value.map((location: Catalogue) => (
  //                       <ElCheckbox
  //                         key={location.unique_id!}
  //                         value={location.unique_id!}
  //                       >
  //                         {location.name}
  //                       </ElCheckbox>
  //                     ))}
  //                   </el-checkbox-group>
  //                 </div>
  //               </div>
  //             ),
  //             reference: () => (
  //               <ElIcon class="cursor-pointer">
  //                 <Filter />
  //               </ElIcon>
  //             ),
  //           }}
  //         </ElPopover>
  //       </div>
  //     ),
  //   },
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
        <span class="mr-2">Satuan</span>
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
    width: 150,
    cellRenderer: ({ rowData: row }) =>
      row.is_traceable ? (
        <ElTag type="primary" class="text-center">
          {"Yes"}
        </ElTag>
      ) : (
        <ElTag type="info">{"No"}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2">Traceable</span>
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
    title: `${t("form.label.operation")}`,
    key: "operation",
    dataKey: "",
    width: 100,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElTooltip placement="top" content={t("tooltip.edit")}>
          <ElButton type="warning" circle onClick={() => handleEdit(row)} plain>
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
                          key={value.key}
                          value={value.key!.toString()}
                          onChange={() => {
                            // Bisa tambahkan logika update kolom di sini
                            console.log(`${value} toggled`);
                          }}
                        >
                          {value.title || value.key}
                        </ElCheckbox>
                      ))}
                    </el-checkbox-group>
                  </div>
                </div>
              ),
              reference: () => (
                <ElTooltip placement="top" content="Hide/See Column">
                  <ElIcon class="cursor-pointer">
                    <SetUp />
                  </ElIcon>
                </ElTooltip>
              ),
            }}
          </ElPopover>
        </div>
      );
    },
  },
];

// availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
//   const filters = availableColumn.filter(
//     (value) => value.key != "selection" && value.key != "setup"
//   );
//   return (
//     <div class="flex items-center justify-center">
//       <span class="mr-2"></span>
//       <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
//         {{
//           default: () => (
//             <div class="filter-wrapper">
//               <div class="filter-group flex flex-col">
//                 <el-checkbox-group v-model={column_selected.value}>
//                   {filters.map((value) => (
//                     <ElCheckbox
//                       onChange={() => console.log("ok")}
//                       value={value.key!.toString()}
//                     >
//                       {value.title}
//                     </ElCheckbox>
//                   ))}
//                 </el-checkbox-group>
//               </div>
//             </div>
//           ),
//           reference: () => (
//             <ElTooltip placement="top" content="Hide/See Column">
//               <ElIcon class="cursor-pointer">
//                 <SetUp />
//               </ElIcon>
//             </ElTooltip>
//           ),
//         }}
//       </ElPopover>
//     </div>
//   );
// };

const columnHistory: Column<InventoryMovement>[] = [
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
    title: `${t("form.label.uniqueCode")}`,
    key: "unique_id",
    dataKey: "unique_id",
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.from")}`,
    key: "from_name",
    dataKey: "from_name",
    width: 150,
  },
  {
    title: `${t("form.label.to")}`,
    key: "to_name",
    dataKey: "to_name",
    width: 150,
  },
  {
    title: `${t("form.label.date")}`,
    key: "created_at",
    dataKey: "created_at",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
];

const columnHistoryIn: Column<InventoryMovement>[] = [
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
    title: `${t("form.label.uniqueCode")}`,
    key: "unique_id",
    dataKey: "unique_id",
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.from")}`,
    key: "from_name",
    dataKey: "from_name",
    width: 150,
  },
  {
    title: `${t("form.label.to")}`,
    key: "to_name",
    dataKey: "to_name",
    width: 150,
  },
  {
    title: `${t("form.label.date")}`,
    key: "created_at",
    dataKey: "created_at",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
];

const columnHistoryOut: Column<InventoryMovement>[] = [
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
    title: `${t("form.label.uniqueCode")}`,
    key: "unique_id",
    dataKey: "unique_id",
    width: 200,
    fixed: true,
  },
  {
    title: `${t("form.label.from")}`,
    key: "from_name",
    dataKey: "from_name",
    width: 150,
  },
  {
    title: `${t("form.label.to")}`,
    key: "to_name",
    dataKey: "to_name",
    width: 150,
  },
  {
    title: `${t("form.label.date")}`,
    key: "created_at",
    dataKey: "created_at",
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <p>{formatLocalDate(row.created_at)}</p>
    ),
  },
];

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

// type SelectionCellProps = {
//   value: boolean;
//   intermediate?: boolean;
//   onChange: (value: CheckboxValueType) => void;
// };

// const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
//   value,
//   intermediate = false,
//   onChange,
// }) => {
//   return (
//     <ElCheckbox
//       onChange={onChange}
//       modelValue={value}
//       indeterminate={intermediate}
//     />
//   );
// };

// availableColumn.unshift({
//   key: "selection",
//   width: 50,
//   cellRenderer: ({ rowData }) => {
//     const onChange = (value: CheckboxValueType) => (rowData.checked = value);
//     return <SelectionCell value={rowData.checked} onChange={onChange} />;
//   },

//   headerCellRenderer: () => {
//     const _data = unref(data);
//     const onChange = (value: CheckboxValueType) =>
//       (data.value = {
//         success: true,
//         currentPage: _data?.currentPage ?? 0,
//         total_data: _data?.total_data ?? 0,
//         total_page: _data?.total_data ?? 0,
//         data: _data?.data?.map((row: any) => {
//           row.checked = value;
//           return row;
//         })!,
//       });
//     const allSelected = _data!.data.every((row) => row.checked);
//     const containsChecked = _data?.data.some((row) => row.checked);

//     return (
//       <SelectionCell
//         value={allSelected}
//         intermediate={containsChecked && !allSelected}
//         onChange={onChange}
//       />
//     );
//   },
// });

const handleAddNewItem = () => {
  dialogFormVisible.value = true;
  editingUniqueId.value = null;
};

const dataEdit = async () => {
  loading.value = true;
  const uniqueId = editingUniqueId.value;
  try {
    const response = await api.get(`/inventories-read/${uniqueId}`);
    if (response.status == 200) {
      const row: Inventory = response.data.data;
      ruleForm.catalogue = row.catalogue?.name ?? "";
      ruleForm.catalogue_id = row.catalogue_id;
      ruleForm.is_traceable = row.is_traceable;
      ruleForm.sn = row.sn;
      ruleForm.unit_id = row.unit_id;
      ruleForm.unit_name = row.unit_name;
      ruleForm.quantity = row.quantity;
      ruleForm.cost = row.cost;
      ruleForm.qty = (row.quantity ?? "").toString();
      ruleForm.tmp_cost = (row.cost ?? "").toString();
      ruleForm.traceable = row.is_traceable ? "1" : "0";
      ruleForm.unique_id = (uniqueId ?? null)?.toString();
      ruleForm.location_id = (id.value ?? null)?.toString();
      ruleForm.location_name = (locationNow ?? "")?.toString();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: Inventory) => {
  dialogFormVisible.value = true;
  editingUniqueId.value = row.unique_id;
  dataEdit();
};

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {
    ruleForm.is_traceable = ruleForm.traceable == "0" ? false : true;
    ruleForm.cost = parseInt(ruleForm.tmp_cost);
    ruleForm.quantity = parseInt(ruleForm.qty);
    ruleForm.location_id = (id.value ?? null)?.toString();
    ruleForm.location_name = (locationNow ?? "")?.toString();
    let response;
    if (editingUniqueId.value) {
      response = await api.post(`/inventories-create`, {
        catalogue_id: ruleForm.catalogue_id,
        catalogue_name: ruleForm.catalogue,
        location_id: ruleForm.location_id,
        location_name: ruleForm.location_name,
        is_traceable: ruleForm.is_traceable,
        sn: ruleForm.sn,
        unit_id: ruleForm.unit_id,
        unit_name: ruleForm.unit_name,
        quantity: ruleForm.quantity,
        cost: ruleForm.cost,
        unique_id: editingUniqueId.value ?? null,
      });
      ElMessage.success(`${t("message.submitUpdateItemInventory")}`);
    } else {
      // Mode tambah baru
      response = await api.post("/inventories-create", {
        catalogue_id: ruleForm.catalogue_id,
        catalogue_name: ruleForm.catalogue,
        location_id: ruleForm.location_id,
        location_name: ruleForm.location_name,
        is_traceable: ruleForm.is_traceable,
        sn: ruleForm.sn,
        unit_id: ruleForm.unit_id,
        unit_name: ruleForm.unit_name,
        quantity: ruleForm.quantity,
        cost: ruleForm.cost,
      });
      ElMessage.success(`${t("message.submitNewItemInventory")}`);
    }
    if (response.status === 201 || response.status === 200) {
      editingUniqueId.value = null;
      resetFormAll(formEl);
      dialogFormVisible.value = false; // Tutup dialog
      await refreshNuxtData(); // Memuat ulang data setelah berhasil
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      submit(formEl);
      console.log("form:", ruleForm);
    } else {
      console.log("form:", ruleForm);
      ElMessage.error(`${fields}`);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  if (editingUniqueId === null) {
    ruleForm.catalogue = "";
    ruleForm.location_name = "";
    ruleForm.catalogue_id = null;
    ruleForm.location_id = "";
    ruleForm.is_traceable = false;
    ruleForm.sn = "";
    ruleForm.unit_id = null;
    ruleForm.unit_name = "";
    ruleForm.quantity = 0;
    ruleForm.cost = 0;
    ruleForm.qty = "0";
    ruleForm.tmp_cost = "0";
    ruleForm.traceable = "0";
  } else {
    dataEdit();
  }
  ElMessage.info(`${t("message.resetForm")}`);
};

const resetFormAll = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  ruleForm.catalogue = "";
  ruleForm.location_name = "";
  ruleForm.catalogue_id = null;
  ruleForm.location_id = "";
  ruleForm.is_traceable = false;
  ruleForm.sn = "";
  ruleForm.unit_id = null;
  ruleForm.unit_name = "";
  ruleForm.quantity = 0;
  ruleForm.cost = 0;
  ruleForm.qty = "0";
  ruleForm.tmp_cost = "0";
  ruleForm.traceable = "0";
  editingUniqueId.value = null;
};

// const handleDelete = (row: Inventory) => {
//   handleSubmitDelete([row.unique_id!]);
// };

// const handleSubmitDelete = async (values: string[]) => {
//   try {
//     const response = await useFetchApi(
//       `/inventories-delete`,
//       "delete_data",
//       "delete",
//       [values]
//     );
//     if (response.status.value == "success") {
//       await refreshNuxtData("inventories");
//     }
//   } catch (error: any) {
//     ElMessage.error(`${error?.response?.data?.message ?? error}`);
//   }
// };

const messageBoxDelete = async (row: Inventory) => {
  ElMessageBox.confirm(
    `${t("message.box.deleteLocationInventory")}`,
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
        "delete_data",
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
        "delete_data",
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

const fetch = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Catalogue>>(
      `/catalogues-read/${id.value}`,
      "catalogue",
      "get",
      null
    );
    if (response.status.value == "success") {
      detail.value = (response.data.value as BaseResponse<Catalogue>).data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
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
  fetch();
  fetchLocation();
  fetchUnits();
});
</script>
