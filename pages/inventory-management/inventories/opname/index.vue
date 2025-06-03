<template>
  <TrumsWrapper>
    <div class="flex justify-between items-start">
      <el-page-header @back="goBack" :title="`${t('menu.back')}`">
        <template #content>
          <span class="text-large font-600 mr-3">
            {{ t("menu.submenu.stockOpname") }}
          </span>
        </template>
      </el-page-header>
      <el-button @click="navigateToHistoryOpname()" size="large">
        {{ t("buttons.history") }}
      </el-button>
    </div>
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
          <div class="lg:flex lg:gap-2 lg:justify-between lg:items-center">
            <el-form-item
              :label="`${t('form.label.location')}`"
              prop="location_name"
              class="w-full"
            >
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncLocation"
                v-model="ruleForm.location_name"
                :placeholder="`${t('form.placeholder.location')}`"
                :disabled="locationOpname?.onOpname"
                @select="(item: Record<string, any>) => handleSelectLocation(item)"
                clearable
              />
            </el-form-item>
            <el-form-item
              :label="`${t('form.label.date')}`"
              prop="date"
              class="w-full"
            >
              <el-date-picker
                v-model="ruleForm.date!"
                type="date"
                :placeholder="`${t('form.placeholder.date', {
                  date: formattedDate,
                })}`"
                :disabled-date="disableFutureDates"
                :disabled="locationOpname?.onOpname"
                style="width: 100% !important"
                clearable
              />
            </el-form-item>
          </div>
          <template #footer>
            <div class="card-footer">
              <div
                class="flex justify-end align-center"
                v-if="!locationOpname?.onOpname"
              >
                <div
                  class="timer mr-4 flex items-center"
                  v-if="ruleForm.location_id"
                >
                  <span class="text-gray-600 text-xs">
                    {{
                      t("text.lastStockOpname", {
                        date:
                          lastStokOpname === null || undefined
                            ? "-"
                            : formatLocalDate(lastStokOpname),
                      })
                    }}
                  </span>
                </div>
                <el-button @click="resetForm(ruleFormRef)">{{
                  t("buttons.reset")
                }}</el-button>
                <el-button type="primary" @click="submitOpname(ruleFormRef)">{{
                  t("buttons.start")
                }}</el-button>
              </div>
              <div class="flex justify-end align-center" v-else>
                <div class="timer mr-4 flex items-center">
                  <span class="text-gray-600">{{ formatTime(timer) }}</span>
                </div>
                <el-button type="danger" @click="endOpname(ruleFormRef)">{{
                  t("buttons.end")
                }}</el-button>
              </div>
            </div>
          </template>
        </el-card>
      </el-form>
    </div>
    <div class="w-auto my-3">
      <el-form
        ref="ruleFormRefItem"
        :model="ruleFormItem"
        :rules="rulesItem"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
      >
        <el-card class="my-3">
          <div class="lg:flex lg:gap-2 lg:justify-between lg:items-start">
            <el-form-item
              :label="`${t('form.label.itemName')}`"
              prop="inventories"
              class="w-full"
            >
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncInventories"
                v-model="ruleFormItem.inventories"
                :placeholder="`${t('form.placeholder.item')}`"
                @select="(item: Record<string, any>) => handleSelectInventories(item)"
                clearable
              />
            </el-form-item>
            <el-button
              type="primary"
              @click="showScanner = true"
              class="ml-2"
              plain
            >
              <Icon name="material-symbols:qr-code-scanner"></Icon>
            </el-button>
          </div>
          <div class="my-3">
            <CustomTable
              :column-sort="onSort"
              :columns="itemColumn"
              :data="dataItem ?? []"
            />
          </div>
        </el-card>
      </el-form>
      <el-dialog
        v-model="showScanner"
        title="Scan QR Code"
        width="90%"
        :close-on-click-modal="false"
        class="max-w-md"
      >
        <div class="flex flex-col items-center">
          <div
            class="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden"
          >
            <QrcodeStream
              v-if="showScanner"
              :constraints="{ facingMode: 'environment' }"
              @detect="onQrDetected"
              class="absolute inset-0 w-full h-full object-cover"
            />

            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="border-4 border-blue-500 rounded-lg w-64 h-64 relative"
              >
                <div
                  class="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500"
                ></div>
                <div
                  class="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500"
                ></div>
                <div
                  class="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500"
                ></div>
                <div
                  class="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500"
                ></div>
              </div>
            </div>
          </div>
          <div class="mt-4 flex gap-4">
            <el-button circle @click="toggleTorch">
              <Icon
                :name="torchActive ? 'carbon:flash-filled' : 'carbon:flash'"
              ></Icon
            ></el-button>
            <el-button circle @click="switchCamera"
              ><Icon name="material-symbols:refresh"></Icon
            ></el-button>
          </div>
        </div>
        <template #footer>
          <el-button @click="showScanner = false">Tutup</el-button>
        </template>
      </el-dialog>
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ref, onMounted } from "vue";
import type { Catalogue } from "~/types/catalogue";
import { type Inventory } from "~/types/inventory";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import {
  ElButton,
  ElCheckbox,
  ElIcon,
  ElInputNumber,
  ElPopconfirm,
  ElPopover,
  ElTag,
  ElTooltip,
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
import { NuxtLink, Icon } from "#components";
import type { StokOpname } from "~/types/stok_opname";
import type { StokOpnameItemScan } from "~/types/stok_opname_item_scan";
import type { DetectedBarcode } from "vue-qrcode-reader";

definePageMeta({
  middleware: ["auth", "app"],
});

const popoverRef = ref();
const dateNow = Date();
const date = new Date(dateNow);
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, "0");
const day = date.getDate().toString().padStart(2, "0");
const formattedDate = `${year}-${month}-${day}`;
const router = useRouter();
const route = useRoute();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);
const { t } = useI18n();
const onOpname = ref<boolean>(false);
const locationOpname = useCookie<{
  name: string;
  id: string;
  date: string;
  onOpname: boolean;
} | null>("location-opname");
const goBack = () => router.back();
const ruleFormRef = ref<FormInstance>();
const formSize = ref<ComponentSize>("default");
const api = useApi();
const loading = ref<boolean>(false);
const timer = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);
const startTime = ref<Date | null>(null);
const opnameId = ref("");
const lastStokOpname = ref<number | null | undefined>();
const lastStokOpnameLocation = ref("");
const showScanner = ref(false);
const torchActive = ref(false);
const cameraType = ref<"environment" | "user">("environment");

const navigateToHistoryOpname = () => {
  const path = localePath("/inventory-management/inventories/opname/history");
  navigateTo(path);
};

interface RuleForm {
  id?: number;
  location_id?: string;
  location_name?: string;
  date?: string;
  status?: string;
}

interface RuleFormItem {
  inventories?: any;
  real_stock?: number;
}

const ruleForm = reactive<RuleForm>({
  status: "Progress",
  location_id: locationOpname.value?.id ?? "",
  location_name: locationOpname.value?.name ?? "",
  date: locationOpname.value?.date ?? "",
});

const ruleFormItem = reactive<RuleFormItem>({
  real_stock: 0,
});

const rules = reactive<FormRules<RuleForm>>({
  location_name: [
    {
      required: true,
      message: `${t("form.validate.required")}`,
    },
  ],
  date: [
    {
      type: "date",
      required: true,
      message: `${t("form.validate.required")}`,
      trigger: "change",
    },
  ],
});

const rulesItem = reactive<FormRules<RuleFormItem>>({});

const request_search = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "stok_opname",
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
});

const request_search_location = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  limit: "100",
  offset: "1",
  sort: null,
});

const request_search_item = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: null,
  limit: "100",
  offset: "1",
  sort: null,
});

const { data } = await useFetchApi<ResponsePagination<Inventory[]>>(
  `/search`,
  "inventories",
  "post",
  request_search.value
);

const dataItem = ref<StokOpnameItemScan[]>([]);

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
  api
    .post("/search", request_search_location.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Catalogue[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          ElMessage.error(`${t("message.locationNotFound")}`);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  request_search_item.value.keyword = queryString;
  request_search_item.value.table = "inventories";
  request_search_item.value.column = [
    {
      location_id: [ruleForm.location_id ?? locationOpname.value?.id],
    },
  ];
  api
    .post("/search", request_search_item.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Inventory[] = response.data.data;

        if (resultApi.length > 0) {
          cb(
            resultApi.map((value) => ({
              ...value,
              value: value.catalogue.name + " ( " + value.sn + " )",
            }))
          );
        } else {
          ElMessage.error(`${t("message.itemNotFound")}`);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const disableFutureDates = (time: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return time.getTime() > today.getTime();
};

// Mulai timer
const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value); // Hindari duplikasi
  startTime.value = new Date();
  saveTimerToCookie();
  timerInterval.value = setInterval(() => {
    timer.value += 1;
    saveTimerToCookie();
  }, 1000);
};

// Hentikan timer
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  removeTimerCookie();
};

// Simpan ke cookie
const saveTimerToCookie = () => {
  const cookieTimer = useCookie("opname_timer", {
    maxAge: 60 * 60 * 24 * 7, // 1 minggu
  });
  cookieTimer.value = JSON.stringify({
    startTime: startTime.value?.toISOString(),
    elapsed: timer.value,
  });
};

// Load dari cookie
const loadTimerFromCookie = () => {
  const cookieTimer = useCookie("opname_timer");
  if (cookieTimer.value) {
    const data = JSON.parse(cookieTimer.value);
    startTime.value = new Date(data.startTime);
    const elapsedSeconds = Math.floor(
      (new Date().getTime() - startTime.value.getTime()) / 1000
    );
    timer.value = data.elapsed + elapsedSeconds;
    startTimer(); // Lanjutkan timer
  }
};

// Hapus cookie
const removeTimerCookie = () => {
  useCookie("opname_timer").value = null;
};

// Format waktu (HH:MM:SS)
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const onQrDetected = async (detectedCodes: DetectedBarcode[]) => {
  if (locationOpname.value?.id === "") {
    ElMessage.error("belum isi lokasi");
  } else {
    if (detectedCodes.length > 0) {
      const qrData = JSON.parse(detectedCodes[0].rawValue);
      if (locationOpname.value?.id !== qrData.location_id) {
        ElMessage.error("salah lokasi");
      } else {
        try {
          dataItem.value.push(qrData as StokOpnameItemScan);
          showScanner.value = false;
          ElMessage.success("Item ditemukan!");
        } catch (error) {
          ElMessage.error("Item tidak dikenali");
        }
      }
    }
  }
};

const toggleTorch = () => {
  torchActive.value = !torchActive.value;
};

const switchCamera = () => {
  cameraType.value =
    cameraType.value === "environment" ? "user" : "environment";
};

const column_selected = ref<string[]>([
  "selection",
  "sn",
  "catalogue.name",
  "location.name",
  "quantity",
  "setup",
]);

const filteredColumn = computed(() => {
  return availableColumn.filter((col) =>
    column_selected.value.includes(col.key!.toString())
  );
});

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
];

const itemColumn: Column<Inventory>[] = [
  {
    title: "Serial Number",
    key: "sn",
    dataKey: "sn",
    width: 200,
  },
  {
    title: "Item",
    key: "name",
    dataKey: "name",
    width: 200,
  },
  {
    title: "Satuan",
    key: "unit",
    dataKey: "unit",
    sortable: false,
    width: 100,
  },
  {
    title: "Stock",
    key: "real_stock",
    dataKey: "real_stock",
    width: 250,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElInputNumber
          min={0}
          max={999999}
          v-model={row.real_stock}
          onChange={(value) => (row.real_stock = value)}
        ></ElInputNumber>
      </>
    ),
  },
  {
    title: "Operasi",
    key: "operasi",
    dataKey: "operasi",
    width: 100,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData: row }) => (
      <>
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
];

const handleEdit = (row: Inventory) => {
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

const handleSelectLocation = async (item: Record<string, any>) => {
  try {
    ruleForm.location_name = item.name;
    ruleForm.location_id = item.unique_id;
    lastStokOpnameLocation.value = item.unique_id;
    const request_search_last_stock_opname = ref<RequestSearch>({
      keyword: "",
      column: [
        {
          location_id: [lastStokOpnameLocation.value], // Pastikan field name sesuai dengan backend
        },
      ],
      limit: "1",
      offset: "1",
      table: "stok_opname",
      sort: {
        column: "created_at",
        order: "DESC", // Pastikan format order sesuai kebutuhan backend
      },
    });

    const { data: dataStokOpname } = await useFetchApi<
      ResponsePagination<StokOpname[]>
    >(`/search`, "stok_opname", "post", request_search_last_stock_opname.value);

    // Tambahkan validasi response
    if (dataStokOpname.value?.data.length > 0) {
      lastStokOpname.value = dataStokOpname.value?.data[0].date;
    } else {
      lastStokOpname.value = null;
      console.log("Data:", dataStokOpname.value);
      console.log("Tidak ada data stok opname ditemukan");
    }
  } catch (error) {
    console.error("Error saat mencari stok opname:", error);
    ElMessage.error("Gagal memuat data stok opname terakhir");
  }
};

const handleSelectInventories = (item: Record<string, any>) => {
  const dataSelected = {
    inventory_id: item.unique_id,
    location_id: item.location_id,
    name: item.catalogue?.name,
    sn: item.sn,
    qty: item.quantity,
    unit: item.unit?.name,
  };
  dataItem.value.push(dataSelected as StokOpnameItemScan);
  console.log("select_item:", dataItem.value);
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

const paginationClick = (val: number) => {
  const data: RequestSearch = { ...request_search.value };
  data.offset = val.toString();
  request_search.value = data;
};

const startOpname = async (formEl: FormInstance | undefined) => {
  ElMessageBox.confirm(
    `${t("message.box.startStockOpname", {
      date:
        lastStokOpname.value === null
          ? "-"
          : formatLocalDate(lastStokOpname.value),
    })}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.start")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
    }
  )
    .then(async () => {
      onOpname.value = true;
      locationOpname.value = {
        id: ruleForm.location_id?.toString() ?? "",
        name: ruleForm.location_name?.toString() ?? "",
        date: ruleForm.date?.toString() ?? "",
        onOpname: onOpname.value,
      };
      ElMessage.info(`Opname Start`);
    })
    .catch(() => {
      ElMessage.info(`${t("message.cancelStockOpname")}`);
    });
};

const endOpname = async (formEl: FormInstance | undefined) => {
  ElMessageBox.confirm(
    `${t("message.box.endStockOpname")}`,
    `${t("message.box.title.warning")}`,
    {
      confirmButtonText: `${t("buttons.end")}`,
      cancelButtonText: `${t("buttons.cancel")}`,
      type: "warning",
      confirmButtonClass: "el-button--danger",
    }
  )
    .then(async () => {
      onOpname.value = false;
      const payload = dataItem.value.map((item) => ({
        inventory_id: item.inventory_id,
        real_stok: item.real_stock,
        sistem_stok: item.qty,
        difference: item.real_stock - item.qty,
        status: "done",
      }));
      const response = await api.post("/stok-opname-create", {
        date: Math.floor(new Date(ruleForm.date ?? "").getTime() / 1000),
        location_id: ruleForm.location_id,
        location_name: ruleForm.location_name,
        status: "done",
        stok_opname_item: payload,
      });
      locationOpname.value = {
        id: "",
        name: "",
        date: "",
        onOpname: false,
      };
      ElMessage.info(`Opname End`);
      resetForm(formEl);
      opnameId.value = "";
      dataItem.value = [];
      lastStokOpname.value = null;
      stopTimer();
    })
    .catch(() => {
      ElMessage.info(`${t("message.cancelStopStockOpname")}`);
    });
};

const submitOpname = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      startOpname(formEl);
      startTimer();
    } else {
      ElMessage.error(`${fields}`);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

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
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message ?? error);
    return [];
  } finally {
    loading.value = false;
  }
};

watch(request_search, fetchData, { immediate: true });

onMounted(() => {
  fetchLocation();
});
</script>
