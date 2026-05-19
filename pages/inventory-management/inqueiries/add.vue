<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-create",
  name: "Add New Inquiries",
});
interface RuleForm {
  unique_id: string;
  date: number;
  reference: string;
  reference_id: string;
  reference_view: string;
  status: string;
  priority: string;
  description: string | null;
  location_id: string;
  request_by: string | null;
  request_by_version: number;
  request_by_name: string;
  to_name: string;
  to_unique_id: string | null;
  to_version: number;
  location_view: string;
  address_id: string;
  address_version: number;
  address_view: string;
}

import { reactive, ref, onMounted } from "vue";
import {
  InquiryReference,
  referenceView,
  TypeInquiry,
  type Inquiry,
} from "~/types/inquiry";
import {
  type ComponentSize,
  ElButton,
  ElText,
  ElTag,
  type FormInstance,
  type FormRules,
  ElMessage,
  TableV2FixedDir,
  ElTooltip,
  ElIcon,
} from "element-plus";
import type {
  Column,
  InputInstance,
  MainInstance,
  UploadUserFile,
} from "element-plus";
import {
  Search,
  Timer,
  Plus,
  Operation,
  User,
  Delete,
  Eleme,
} from "@element-plus/icons-vue";
import type { Maintenance } from "~/types/maintenance";
import type { Contact } from "~/types/contact";
import type { Catalogue } from "~/types/catalogue";
import type { Unit } from "~/types/unit";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Pagination } from "~/types/pagination";
import type { BaseResponse } from "~/types/response";
import { TrumsDeleteButton } from "#components";
import { ItemRequestTrailStatus, type ItemRequest } from "~/types/item_request";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import type { ItemSearch } from "~/types/item_search";
import { getPaymentMethodLabel } from "~/types/finance/bill";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import AddContact from "~/components/trums/AddContact.vue";
import type { AddressType } from "~/types/address";
import FormAddress from "~/components/trums/FormAddress.vue";
import { currency, formatLocalDate } from "#imports";

const fileList = ref<UploadUserFile[]>([]);

const axios = useApi();

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);
const sales_order_id = computed(() => route.query.sales_id as string);

const goBack = () => router.back();
const loading = ref<boolean>(false);
const dialogContacts = ref<boolean>(false);
const dialogRepair = ref<boolean>(false);
const dialogSalesOrder = ref<boolean>(false);
const dialogContact = ref<boolean>(false);
const dialogNewAddress = ref<boolean>(false);

const formFieldsRefContact = ref();
const picContact = ref<Contact>();
const toContact = ref<Contact>();

const typeContactActive = ref<"to" | "pic">("to");
const address = ref<AddressType>();

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const contacts = ref<Pagination<Contact[]>>();
const request_search = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  limit: "100",
  offset: "1",
  sort: null,
});

const request_search_maintenance = ref<RequestSearch>({
  keyword: "",
  table: "maintenances",
  column: [],
  limit: "10",
  offset: "1",
  sort: null,
});
const request_search_sales_order = ref<RequestSearch>({
  keyword: "",
  table: "purchase_order",
  column: [
    {
      type: ["so"],
    },
  ],
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
});

const maintenances = await useFetchApi<ResponsePagination<Maintenance[]>>(
  "/search",
  "get-maintenance",
  "post",
  request_search_maintenance.value
);
const sales_order = await useAsyncData("get-sales-order", async () => {
  const res = await useFetchApi<ResponsePagination<PurchaseOrder[]>>(
    `/search`,
    "get-sales-order",
    "post",
    request_search_sales_order.value
  );
  return res.data.value;
});

const dataTable = ref<
  {
    unique_id: string | null;
    id: string | null;
    item: string;
    item_id: string | null;
    quantity: number;
    sn: string | null;
    unit_id: string;
    unit_name: string;
    is_traceable: boolean;
    catalogue_name: string;
    inventory_id: string;
    inventory_version: number;
    catalogue_version: number;
  }[]
>([]);

const ruleForm = reactive<RuleForm>({
  date: Date.now(),
  unique_id: "",
  reference: "",
  reference_id: "",
  reference_view: "",
  status: "",
  priority: "low",
  location_id: "",
  location_view: "",
  request_by: "",
  request_by_name: "",
  request_by_version: 0,
  description: null,
  to_name: "",
  to_unique_id: null,
  to_version: 0,
  address_id: "",
  address_version: 0,
  address_view: "",
});

const rules = reactive<FormRules<RuleForm>>({
  date: [
    {
      type: "date",
      required: true,
      message: "Pilih Tanggal",
      trigger: "change",
    },
  ],
  reference: [
    {
      required: true,
      message: "Masukan Referensi Pembuatan Permintaan",
      trigger: "change",
    },
  ],
  reference_id: [
    {
      required: ruleForm.reference == "maintenance" ? true : false,
      message: "Pilih Referensi Sumber Permintaan",
      trigger: "change",
    },
  ],
  to_name: [
    {
      required: true,
      message: "Field ini tidak boleh kosong!",
      trigger: "change",
    },
  ],
  reference_view: [
    {
      required: ruleForm.reference == "maintenance" ? true : false,
      message: "Pilih Referensi Sumber Permintaan",
      trigger: "change",
    },
  ],
  address_view: [
    {
      required: true,
      message: "Permintaan akan di kirim kemana?",
      trigger: "change",
    },
  ],
});

const columnsContact: Column<any>[] = [
  {
    key: "name",
    title: "Nama",
    dataKey: "name",
    width: 150,
  },
  {
    key: "name",
    title: "Name",
    dataKey: "name",
    width: 150,
    align: "center",
  },
  {
    key: "email",
    title: "Email",
    dataKey: "email",
    width: 150,
  },
  {
    key: "operations",
    title: "Operations",
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => onSelectReference_id(row)}>
          Pilih
        </ElButton>
      </>
    ),
    width: 150,
    align: "center",
  },
];

const columnMaintenance: Column<any>[] = [
  {
    key: "unique_code",
    title: "Nomor Maintenance",
    dataKey: "unique_code",
    width: 150,
  },
  {
    key: "inventory",
    title: "Item",
    dataKey: "inventory",
    width: 250,
    cellRenderer: ({ rowData: row }) => (
      <p>{row.inventory?.catalogue?.name ?? "-"}</p>
    ),
  },
  {
    key: "maintenance_date",
    title: "Tanggal",
    dataKey: "maintenance_date",
    width: 150,
    cellRenderer: ({ cellData: maintenance_date }) => (
      <ElTooltip content={formatLocalDate(maintenance_date)}>
        {
          <span class="flex items-center">
            <ElIcon class="mr-3">
              <Timer />
            </ElIcon>
            {formatLocalDate(maintenance_date)}
          </span>
        }
      </ElTooltip>
    ),
  },
  {
    key: "priority",
    title: "Prioritas",
    dataKey: "priority",
    width: 150,
    align: "center",
    cellRenderer: ({ cellData: priority }) =>
      priority === "low" ? (
        <ElTag type="danger">{priority}</ElTag>
      ) : priority === "medium" ? (
        <ElTag type="warning">{priority}</ElTag>
      ) : (
        <ElTag type="primary">{priority}</ElTag>
      ),
  },
  {
    key: "type",
    title: "Type",
    dataKey: "type",
    width: 150,
    cellRenderer: ({ cellData: type }) =>
      type === "corrective" ? (
        <ElTag type="danger">{type}</ElTag>
      ) : (
        <ElTag type="primary">{type}</ElTag>
      ),
  },
  {
    key: "operations",
    title: "Operations",
    cellRenderer: ({ rowData: row }) => (
      <>
        <ElButton size="small" onClick={() => onSelectReference_id(row)}>
          Pilih
        </ElButton>
      </>
    ),
    width: 150,
    align: "center",
  },
];

const units = ref<Unit[]>([
  {
    id: 1,
    name: "unit",
    slug: "unit",
    unique_id: "",
    created_at: 0,
    created_by: "",
    updated_at: 0,
    version: 0,
  },
  {
    id: 2,
    name: "box",
    slug: "box",
    unique_id: "",
    created_at: 0,
    created_by: "",
    updated_at: 0,
    version: 0,
  },
  {
    id: 3,
    name: "container",
    slug: "container",
    unique_id: "",
    created_at: 0,
    created_by: "",
    updated_at: 0,
    version: 0,
  },
]);

const showDialog = () => {
  if (ruleForm.reference == "maintenance") {
    dialogRepair.value = true;
  } else if (ruleForm.reference == "po") {
    request_search_sales_order.value.column = [
      {
        type: ["po"],
      },
    ];
    dialogSalesOrder.value = true;
  } else if (ruleForm.reference == "so") {
    request_search_sales_order.value.column = [
      {
        type: ["so"],
      },
    ];
    dialogSalesOrder.value = true;
  } else {
    ElMessage.warning("Pilih Referensi Terlebih Dahulu");
  }
};

const addNewLine = () => {
  dataTable.value.push({
    unique_id: null,
    id: null,
    item: "",
    item_id: null,
    quantity: 1,
    sn: null,
    unit_id: "",
    unit_name: "",
    is_traceable: false,
    catalogue_name: "",
    catalogue_version: 0,
    inventory_id: "",
    inventory_version: 0,
  });
};

const onSubmit = async () => {
  loading.value = true;
  try {
    const dateObject = new Date(ruleForm.date);

    const item_request: ItemRequest[] = [];

    dataTable.value.forEach((element) => {
      if (element.item != "") {
        item_request.push({
          unique_id: element.unique_id ?? "",
          catalogue_id: element.item_id ?? "",
          catalogue_name: element.item ?? "",
          unit_id: element.unit_id ?? "",
          unit_name: element.unit_name ?? "",
          request_qty: parseInt(element.quantity.toString()),
          sn: element.sn ?? "",
          catalogue: null,
          inventory_id: element.inventory_id,
          inventory: null,
          catalogue_version: element.catalogue_version,
          description: null,
          inquiry_id: null,
          inquiry: null,
          created_at: null,
          created_by: null,
          updated_at: null,
          checked: false,
          item_request_trail: [],
          quantity: 0,
        });
      }
    });

    const data = {
      date: dateObject.getTime() / 1000,
      type: TypeInquiry.INTERNAL,
      reference: ruleForm.reference,
      reference_id: ruleForm.reference_id,
      status: "draft",
      location_id: ruleForm.location_id,
      priority: ruleForm.priority,
      description: ruleForm.description,
      request_by_id: ruleForm.request_by,
      request_by_version: ruleForm.request_by_version,
      request_to: ruleForm.to_unique_id,
      request_to_version: ruleForm.to_version,
      item_request: item_request,
    };

    console.log("data", data);

    // --- buat FormData ---
    const formData = new FormData();

    // Append field utama
    formData.append("unique_id", `${ruleForm.unique_id}`);
    formData.append("date", `${dateObject.getTime() / 1000}`);
    formData.append("reference", ruleForm.reference || "");
    formData.append("reference_id", ruleForm.reference_id || "");
    formData.append("status", "draft");
    formData.append("location_id", `${ruleForm.location_id}`);
    formData.append("priority", ruleForm.priority || "");
    formData.append("description", ruleForm.description || "");
    formData.append("request_by_id", `${ruleForm.request_by}`);
    formData.append("request_by_version", `${ruleForm.request_by_version}`);
    formData.append("type", `${TypeInquiry.INTERNAL}`);
    formData.append("request_to_id", `${ruleForm.to_unique_id}`);
    formData.append("request_to_version", `${ruleForm.to_version}`);
    formData.append("address_id", `${ruleForm.address_id}`);
    formData.append("address_version", `${ruleForm.address_version}`);

    // Append item_request (nested)
    item_request.forEach((item, index) => {
      formData.append(`item_request[${index}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `item_request[${index}][catalogue_id]`,
        `${item.catalogue_id}`
      );
      formData.append(
        `item_request[${index}][catalogue_name]`,
        `${item.catalogue_name}`
      );
      formData.append(`item_request[${index}][unit_id]`, `${item.unit_id}`);
      formData.append(`item_request[${index}][unit_name]`, `${item.unit_name}`);
      formData.append(
        `item_request[${index}][request_qty]`,
        `${item.request_qty}`
      );
      formData.append(
        `item_request[${index}][approved_qty]`,
        `${item.approved_qty ?? 0}`
      );
      formData.append(
        `item_request[${index}][rejected_qty]`,
        `${item.rejected_qty ?? 0}`
      );
      formData.append(
        `item_request[${index}][remaining_qty]`,
        `${item.request_qty ?? 0}`
      );
      formData.append(`item_request[${index}][sn]`, `${item.sn}`);
      formData.append(
        `item_request[${index}][inventory_id]`,
        `${item.inventory_id}`
      );
      formData.append(
        `item_request[${index}][catalogue_version]`,
        `${item.catalogue_version}`
      );
    });

    // Append files
    fileList.value.forEach((file, index) => {
      if (file.raw) {
        formData.append(`files[${index}]`, file.raw);
      }
    });

    console.log(data);

    const response = await useFetchApi<BaseResponse<Inquiry>>(
      "/inquiries-create",
      "create-inquiry",
      "post",
      formData
    );

    if (response.status.value === "success") {
      const inquiry: Inquiry | undefined = response.data.value?.data;
      ElMessage.success("Permintaan berhasil dibuat");
      if (inquiry) {
        router.push(`/inventory-management/inqueiries/${inquiry.unique_id}`);
      }
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log(dataTable.value);
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      onSubmit();
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// join purchase_order_item poi on poi.pricetag_item_id = pi.unique_id
// join inquiries i on i.reference = 'so' and i.reference_id = poi.order_id
// join item_request ir on ir.inquiry_id = i.unique_id
// join item_request_trail irt on irt.item_request_id = ir.unique_id and irt.reference = 'pr'
// join purchase_request pr on pr.unique_id = irt.reference_id

watch(
  request_search_maintenance,
  () => {
    refreshNuxtData("get-maintenance");
  },
  { immediate: true }
);
watch(
  request_search_sales_order,
  () => {
    refreshNuxtData("get-sales-order");
  },
  { immediate: true }
);
watch(
  () => ruleForm.reference,
  () => {
    request_search_sales_order.value.column = [
      {
        type: ["po"],
      },
    ];
  },
  { deep: true }
);
watch(
  () => request_search_sales_order.value,
  () => sales_order.refresh(),
  { deep: true }
);

const onSelectReference_id = async (data: any) => {
  console.log("po data", data);
  if (ruleForm.reference == "po") {
    const sales_order = data as PurchaseOrder;
    ruleForm.reference_id = sales_order.unique_id;
    ruleForm.reference_view = sales_order.unique_code;
    // ruleForm.to_unique_id = sales_order.vendor_id;
    // ruleForm.to_name = sales_order.vendor_name;
    // ruleForm.to_version = sales_order.vendor_version ?? 0;
    ruleForm.address_id = sales_order.delivery_address_id;
    ruleForm.address_version = sales_order.delivery_address_version;
    ruleForm.address_view = generateResultSearchAddress(
      sales_order.address ?? null
    ).name;
    if (sales_order.address) {
      address.value = sales_order.address;
    }

    dataTable.value = (sales_order.purchase_order_item ?? []).map((value) => ({
      unique_id: null,
      id: null,
      item: value.catalogue_name ?? "",
      item_id: value.catalogue_id ?? "",
      quantity: value.quantity ?? 1,
      sn: value.catalogue?.sn ?? "",
      unit_id: value.unit_id ?? "",
      unit_name: value.unit_name ?? "",
      is_traceable: false,
      catalogue_name: value.catalogue_name ?? "",
      catalogue_version: value.catalogue_version,
      inventory_id: "",
      inventory_version: 0,
    }));
  } else if (ruleForm.reference == "so") {
    const sales_order = data as PurchaseOrder;
    ruleForm.reference_id = sales_order.unique_id;
    ruleForm.reference_view = sales_order.unique_code;
    ruleForm.to_unique_id = sales_order.vendor_id;
    ruleForm.to_name = sales_order.vendor_name;
    ruleForm.to_version = sales_order.vendor_version ?? 0;
    ruleForm.address_id = sales_order.delivery_address_id;
    ruleForm.address_version = sales_order.delivery_address_version;
    ruleForm.address_view = generateResultSearchAddress(
      sales_order.address ?? null
    ).name;
    toContact.value = sales_order.vendor;
    if (sales_order.address) {
      address.value = sales_order.address;
    }

    // ruleForm.request_by = sales_order

    dataTable.value = (sales_order.purchase_order_item ?? []).map((value) => ({
      unique_id: null,
      id: null,
      item: value.catalogue_name ?? "",
      item_id: value.catalogue_id ?? "",
      quantity: value.quantity ?? 1,
      sn: value.catalogue?.sn ?? "",
      unit_id: value.unit_id ?? "",
      unit_name: value.unit_name ?? "",
      is_traceable: false,
      catalogue_name: value.catalogue_name ?? "",
      catalogue_version: value.catalogue_version,
      inventory_id: "",
      inventory_version: 0,
    }));
  } else if (ruleForm.reference == "maintenance") {
    const maintenance = data as Maintenance;
    ruleForm.reference_id = maintenance.unique_id;
    ruleForm.reference_view = maintenance.unique_code;
    ruleForm.location_id = maintenance.location_id ?? "";
    ruleForm.location_view = maintenance.location?.name ?? "";
    console.log(maintenance);

    dataTable.value = (maintenance.maintenance_item ?? []).map((value) => ({
      unique_id: null,
      id: null,
      item: value.catalogue_name ?? "",
      item_id: value.inventory?.catalogue_id ?? "",
      quantity: value.quantity ?? 1,
      sn: value.inventory?.sn ?? "",
      unit_id: value.unit_id ?? "",
      unit_name: value.unit_name ?? "",
      is_traceable: false,
      catalogue_name: value.catalogue_name ?? "",
      catalogue_version: value.catalogue_version,
      inventory_id: value.inventory_id ?? "",
      inventory_version: value.inventory_version,
    }));
  }

  dialogContacts.value = false;
  dialogRepair.value = false;
  dialogSalesOrder.value = false;
};

const create_catalogue = async (catalogue: Catalogue) => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", catalogue.unique_id ?? "");
    formData.append("name", catalogue.name ?? "");
    formData.append("brand_id", catalogue.brand_id ?? "");
    formData.append("year", catalogue.year ?? "");
    formData.append("sn", catalogue.sn ?? "");
    formData.append("description", catalogue.description ?? "");
    formData.append("berat", (catalogue.berat ?? 0).toString());
    formData.append(
      "volume",
      `${catalogue.length}x${catalogue.width}x${catalogue.height}`
    );
    formData.append(
      "is_asset",
      (catalogue.tmp_asset == "1" ? true : false).toString()
    );
    formData.append("type", catalogue.type);

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | undefined = response.data.value?.data;
      return catalogue_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
  (request_search.value.keyword = queryString),
    (request_search.value.table = "catalogues");
  request_search.value.column = [
    {
      type: ["item"],
      inventories_catalogue: {
        location_id: ruleForm.location_id,
      },
    },
  ];
  request_search.value.flag = "form";

  useApiFetch<ResponsePagination<ItemSearch[]>>("/catalogues-inventory", {
    method: "post",
    body: { keyword: queryString },
  })
    .then((response) => {
      if (response.success) {
        const resultApi: ItemSearch[] = response.data;
        if (resultApi.length > 0) {
          const results = resultApi.map((data: ItemSearch) => {
            return {
              ...data,
              value: `${data.catalogue_name} ${
                data.sn_number ? " - " + data.sn_number : ""
              }`,
            };
          });
          cb(results);
        } else {
          cb([
            {
              value: `${queryString}`,
              label: `Tambahkan ${queryString}`,
              isNew: true,
            },
          ]);
        }
      } else {
        ElMessage.error(response.message ?? "");
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.message ?? error);
    });
};

const querySearchAsyncLocation = (
  queryString: string,
  cb: (arg: any) => void
) => {
  (request_search.value.keyword = queryString),
    (request_search.value.table = "catalogues");
  request_search.value.column = [
    {
      type: ["place"],
    },
  ];
  request_search.value.flag = "form";

  axios
    .post("/search", request_search.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: ResponsePagination<Catalogue[]> = response.data;
        if (resultApi.data.length > 0) {
          const results = response.data.data.map((data: Catalogue) => {
            return {
              ...data,
              value: `${data.name}${data.sn ? " - " + data.sn : ""}`,
            };
          });
          cb(results);
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              unique_id: queryString,
              label: `Tambahkan ${queryString}`,
            },
          ]);
        }
      } else {
        ElMessage.error(response.data.message);
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
  (request_search.value.keyword = queryString),
    (request_search.value.table = "contacts");
  request_search.value.column = [];
  request_search.value.flag = "form";

  axios
    .post("/search", request_search.value)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: ResponsePagination<Contact[]> = response.data;
        if (resultApi.data.length > 0) {
          const results = response.data.data.map((data: Contact) => {
            return { ...data, value: `${data.name}` };
          });
          cb(results);
        } else {
          cb([
            {
              value: `Tambahkan ${queryString}`,
              isNew: true,
              query: queryString,
              label: `Tambahkan ${queryString}`,
            },
          ]);
        }
      } else {
        ElMessage.error(response.data.message);
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
    });
};

const createFilter = (queryString: string) => {
  return (restaurant: Unit) => {
    return (
      restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

let timeout: ReturnType<typeof setTimeout>;

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...request_search.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  axios
    .post("/search", params)
    .then((response) => {
      if (response.status == 200) {
        const resultApi: Unit[] = response.data.data;

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, label: `${queryString}` }]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message);
    });
};

const onHandleSelectItemAutocomplete = async (
  item: Record<string, any>,
  scope: any
) => {
  if (item.isNew) {
    const catalogueInsert: Catalogue = {
      name: item.value,
      id: null,
      unique_id: null,
      unique_code: null,
      brand_id: null,
      brand_name: null,
      year: null,
      sn: null,
      description: null,
      berat: null,
      volume: null,
      length: null,
      width: null,
      height: null,
      is_asset: null,
      tmp_asset: null,
      version: null,
      type: "item",
      created_at: null,
      created_by: null,
      updated_at: null,
      file_catalogues: [],
    };
    const selected: Catalogue | null =
      (await create_catalogue(catalogueInsert)) ?? null;

    if (selected != null) {
      dataTable.value[scope.$index].item = selected.name ?? item.value;
      dataTable.value[scope.$index].item_id = selected.unique_id ?? "";
      dataTable.value[scope.$index].sn = selected.sn ?? "";
    } else {
      ElMessage.error(`Ops, Something wrong!!`);
    }
  } else {
    const selected: ItemSearch = item as ItemSearch;
    dataTable.value[scope.$index].item = selected.catalogue_name;
    dataTable.value[scope.$index].item_id = selected.catalogue_id ?? "";
    dataTable.value[scope.$index].sn = selected.sn_number ?? "";
    dataTable.value[scope.$index].unit_id = selected.unit_id ?? "";
    dataTable.value[scope.$index].unit_name = selected.unit_name ?? "";
    dataTable.value[scope.$index].inventory_id = selected.inventory_id ?? "";
  }
};

const onHandleSelectLocationAutocomplete = (item: Record<string, any>) => {
  console.log(item);
  if (item.unique_id == undefined) {
    ruleForm.location_view = item.unique_id;
    ruleForm.location_id = "";
  } else {
    ruleForm.location_view = item.name;
    ruleForm.location_id = item.unique_id;
  }
};

const createNewContact = async (data: any): Promise<Contact | null> => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    } else {
      return null;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
    return null;
  }
};

const onHandleSelectContact = async (
  item: Record<string, any>,
  type: "to" | "pic"
) => {
  console.log(item);
  if (item.isNew) {
    if (type == "to") {
      toContact.value = {
        unique_id: "",
        unique_code: "",
        is_personal: false,
        is_company: false,
        internal_id: "",
        name: item.query,
        email: "",
        phone: "",
        tax_id: "",
        website: "",
        title: "",
        tmp_tags: [],
        tags: "",
        ownership: false,
        address: [],
        id: 0,
        created_at: 0,
        created_by: "",
        updated_at: 0,
        version: 0,
      };
    } else {
      picContact.value = {
        unique_id: "",
        unique_code: "",
        is_personal: false,
        is_company: false,
        internal_id: "",
        name: item.query,
        email: "",
        phone: "",
        tax_id: "",
        website: "",
        title: "",
        tmp_tags: [],
        tags: "",
        ownership: false,
        address: [],
        id: 0,
        created_at: 0,
        created_by: "",
        updated_at: 0,
        version: 0,
      };
    }
    typeContactActive.value = type;
    dialogContact.value = true;
  } else {
    const contact: Contact = item as Contact;

    if (type == "to") {
      toContact.value = contact;
      ruleForm.to_unique_id = contact.unique_id;
      ruleForm.to_version = contact.version;
      ruleForm.to_name = contact.name ?? "";
    } else {
      picContact.value = contact;
      ruleForm.request_by = contact.unique_id;
      ruleForm.request_by_version = contact.version;
      ruleForm.request_by_name = contact.name ?? "";
    }
  }
};

const handleNewUnit = async (name: string): Promise<Unit | null> => {
  loading.value = true;
  try {
    // Call API to create unit
    const response = await useFetchApi<BaseResponse<Unit>>(
      "/unit-create",
      "create-unit",
      "post",
      { name: name }
    );

    if (response.status.value == "success") {
      return response.data.value?.data ?? null;
    }
  } catch (error: any) {
    ElMessage.error(
      "Gagal menyimpan unit: " +
        (error.response?.data?.message || error.message || "Terjadi kesalahan")
    );
    return null;
  } finally {
    loading.value = false;
    return null;
  }
};

const onHandleSelectItemAutocompleteUnit = async (
  item: Record<string, any>,
  scope: any
) => {
  if (item.unique_id == undefined) {
    const unit: Unit | null = await handleNewUnit(item.label ?? "");

    if (unit != null) {
      dataTable.value[scope.$index].unit_name = unit.name;
      dataTable.value[scope.$index].unit_id = unit.unique_id;
    } else {
      dataTable.value[scope.$index].unit_name = item.label;
      dataTable.value[scope.$index].unit_id = "";
    }
  } else {
    dataTable.value[scope.$index].unit_name = item.value;
    dataTable.value[scope.$index].unit_id = `${item.id}`;
  }
};

const validateDecimal = (value: string, scope: any) => {
  const decimalRegex = /^[0-9]*\.?[0-9]*$/;
  if (!decimalRegex.test(value)) {
    const quantity = value.replace(/[^0-9.]/g, ""); // Hilangkan karakter non-angka atau titik
    dataTable.value[scope.$index].quantity = parseInt(quantity);
  }
};

// Handle page change
const handlePageChange = (page: number) => {
  request_search_maintenance.value.offset = `${page}`;
  refreshNuxtData("get-maintenance");
};
const handlePageChangeSO = (page: number) => {
  request_search_maintenance.value.offset = `${page}`;
  refreshNuxtData("get-sales-order");
};
const handleSizeChangeSO = (size: number) => {
  request_search_maintenance.value.limit = `${size}`;
  refreshNuxtData("get-sales-order");
};

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search_maintenance.value.limit = `${size}`;
  refreshNuxtData("get-maintenance");
};

const onChangeReference = (value: string) => {
  if (value == "non_maintenance") {
    ruleForm.reference_id = "";
    ruleForm.reference_view = "";
  }
};

const fetchInquiry = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${id.value}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      const inquiryData: Inquiry = inquiry.data.value!.data as Inquiry;

      ruleForm.unique_id = inquiryData.unique_id ?? "";
      ruleForm.date =
        inquiryData.date != null ? inquiryData.date! * 1000 : Date.now();
      ruleForm.reference = inquiryData.reference;
      ruleForm.description = inquiryData.description;
      ruleForm.reference_id = inquiryData.reference_id;
      ruleForm.reference_view = inquiryData.reference_view;
      ruleForm.status = inquiryData.status;
      ruleForm.priority = inquiryData.priority;
      ruleForm.location_id = inquiryData.location_id;
      ruleForm.location_view = inquiryData.location?.name ?? "";
      ruleForm.request_by = inquiryData.request_by?.unique_id ?? "";
      ruleForm.request_by_name = inquiryData.request_by?.name ?? "";
      ruleForm.request_by_version = inquiryData.request_by?.version ?? 0;
      ruleForm.to_name = inquiryData.request_to?.name ?? "";
      ruleForm.to_unique_id = inquiryData.request_to?.unique_id ?? "";
      ruleForm.to_version = inquiryData.request_to?.version ?? 0;
      ruleForm.address_id = inquiryData.address_id ?? "";
      ruleForm.address_version = inquiryData.address_version ?? 0;
      ruleForm.address_view = generateResultSearchAddress(
        inquiryData.address || null
      ).name;

      toContact.value = inquiryData.request_to;

      inquiryData.item_request.forEach((element) => {
        return dataTable.value.push({
          id: null,
          unique_id: element.unique_id,
          item: element.catalogue_name ?? "",
          item_id: element.catalogue_id,
          quantity: element.request_qty,
          sn: element.sn,
          unit_id: element.unit_id ?? "",
          unit_name: element.unit_name ?? "",
          is_traceable: false,
          catalogue_name: element.catalogue_name ?? "",
          inventory_id: element.inventory_id ?? "",
          inventory_version: element.inventory?.version ?? 0,
          catalogue_version: element.catalogue_version,
        });
      });
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const fetchSalesOrder = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const so = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${sales_order_id.value}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (so.status.value === "success") {
      ruleForm.reference = InquiryReference.SALES_ORDER;
      onSelectReference_id(so.data.value?.data);
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const handleSubmitContact = async (formData: Contact) => {
  try {
    console.log("contact active", typeContactActive.value);
    console.log("form data", formData);
    const contact: Contact | null = await createNewContact({
      parent_id: formData.parent_id,
      parent_version: formData.parent_version,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tax_id: formData.tax_id,
      website: formData.website,
      title: formData.title,
      is_personal: formData.is_personal,
      is_company: formData.is_company,
      tags: formData.tags?.toString(),
      unique_id: formData.unique_id,
      ownership: formData.ownership,
    });
    if (contact !== null) {
      if (typeContactActive.value == "to") {
        toContact.value = contact;
        ruleForm.to_unique_id = contact.unique_id;
        ruleForm.to_version = contact.version;
        ruleForm.to_name = contact.name ?? "";
      } else {
        picContact.value = contact;
        ruleForm.request_by = contact.unique_id;
        ruleForm.request_by_version = contact.version;
        ruleForm.request_by_name = contact.name ?? "";
      }
    }
    dialogContact.value = false;
  } catch (error) {
    console.log("eror", error);
  }
};

const handleResetContact = () => {
  formFieldsRefContact.value?.resetForm();
  dialogContact.value = false;
};

const openDialogTo = () => {
  typeContactActive.value = "to";
  dialogContact.value = true;
};

const openDialogPIC = () => {
  typeContactActive.value = "pic";

  if (toContact.value && picContact.value) {
    picContact.value.parent_id = toContact.value.unique_id;
    picContact.value.parent_name = toContact.value.name;
    picContact.value.parent_version = toContact.value.version;
  }

  dialogContact.value = true;
};

const generateResultSearchAddress = (address: AddressType | null) => {
  if (address) {
    const name = `(${address.contact_name}) - ${address.village}, ${
      address.city
    }, ${address.regency || address.province}`;
    const street = `${address.street}`;
    const address_id = address.unique_id;
    const address_version = address.version;
    return {
      value: name,
      name: name,
      street: street,
      address_id: address_id,
      address_version: address.version,
    };
  } else {
    return {
      value: "",
      name: "",
      street: "",
      address_id: "",
      address_version: 0,
    };
  }
};

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
  const newSearch = unref(request_search);
  newSearch.keyword = queryString;
  newSearch.table = "address";
  newSearch.column = [
    // {
    //   contact_id: [ruleForm.request_by, ruleForm.to_unique_id]
    // }
  ];
  newSearch.limit = "10";
  newSearch.offset = "1";
  newSearch.flag = "form";

  useFetchApi<ResponsePagination<AddressType[]>>(
    "/search",
    "address",
    "post",
    newSearch
  ).then((response) => {
    if (response.status.value == "success") {
      const resultApi: AddressType[] = response.data.value?.data!;

      if (resultApi.length > 0) {
        cb(resultApi.map(generateResultSearchAddress));
      } else {
        cb([
          {
            value: `Buat Alamat Baru`,
            new: true,
            name: `Buat Alamat Baru`,
            street: "",
          },
        ]);
      }
    }
  });
};

const handleSelectAddress = (record: Record<string, any>) => {
  if (record.new) {
    dialogNewAddress.value = true;
  } else {
    console.log(record);
    // const address: AddressType = record as AddressType;
    ruleForm.address_id = record.address_id;
    ruleForm.address_version = record.address_version;
    ruleForm.address_view = record.name;
  }
};

const onAddNewAddress = (address: AddressType) => {
  ruleForm.address_id = address.unique_id;
  ruleForm.address_view = address.address_name;
  ruleForm.address_version = address.version || 1;
  dialogNewAddress.value = false;
};

const paginationClickSalesOrderClick = (val: number) => {
  const data: RequestSearch = { ...request_search_sales_order.value };
  data.offset = val.toString();
  request_search_sales_order.value = data;
};

const submitRemoveItem = async (index: number) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/item-request-delete",
      "delete-item-request",
      "post",
      [dataTable.value[index].unique_id]
    );
    if (response.status.value == "success") {
      ElMessage.success("Data Berhasil Dihapus!");
      dataTable.value.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const removeItem = async (index: number) => {
  await ElMessageBox.confirm("Yakin ingin menghapus Item ini?", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  });
  if (dataTable.value[index].unique_id) {
    submitRemoveItem(index);
  } else {
    dataTable.value.splice(index, 1);
  }
};

onMounted(() => {
  // getContacts();
  // getMaintenance();

  if (id.value) {
    fetchInquiry();
  }
  if (sales_order_id.value) {
    fetchSalesOrder();
  }
});
</script>
<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Buat Inquiri Baru </span>
      </template>
    </el-page-header>
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
              <el-button
                type="primary"
                :loading-icon="Eleme"
                :loading="loading"
                @click="submitForm(ruleFormRef)"
                >Simpan</el-button
              >
              <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
            </el-form-item>
          </div>
        </template>

        <el-form-item label="reference" prop="reference">
          <el-select
            v-model="ruleForm.reference"
            placeholder="Pilih Referensi"
            style="width: 240px"
          >
            <el-option
              v-for="item in [
                {
                  value: InquiryReference.MAINTENANCE,
                  label: referenceView(InquiryReference.MAINTENANCE),
                },
                {
                  value: InquiryReference.NON_MAINTENANCE,
                  label: referenceView(InquiryReference.NON_MAINTENANCE),
                },
                {
                  value: InquiryReference.PURCHASE_ORDER,
                  label: referenceView(InquiryReference.PURCHASE_ORDER),
                },
                {
                  value: InquiryReference.SALES_ORDER,
                  label: referenceView(InquiryReference.SALES_ORDER),
                },
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="
            ruleForm.reference == InquiryReference.PURCHASE_ORDER ||
            ruleForm.reference == InquiryReference.SALES_ORDER
          "
          label="Nomor Reference"
          prop="reference_id"
        >
          <div class="flex gap-2">
            <el-input
              v-model="ruleForm.reference_view"
              placeholder="Pilih Nomor Referensi"
              :disabled="true"
            />
            <el-button
              :icon="Search"
              type="primary"
              size="default"
              @click="showDialog"
            />
          </div>
        </el-form-item>

        <el-form-item label="Diminta oleh?" prop="to_name">
          <div class="flex items-center gap-3">
            <el-autocomplete
              :fetch-suggestions="querySearchContact"
              v-model="ruleForm.to_name"
              placeholder="Cari Kontak"
              @select="(item: Record<string, any>) => onHandleSelectContact(item, 'to')"
            />
            <el-button
              type="primary"
              v-if="toContact"
              @click="openDialogTo"
              :icon="User"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-if="toContact && toContact.is_company"
          label="PIC"
          prop="request_by_name"
        >
          <div class="flex items-center gap-3">
            <el-autocomplete
              :fetch-suggestions="querySearchContact"
              v-model="ruleForm.request_by_name"
              placeholder="Cari Kontak"
              @select="(item: Record<string, any>) => onHandleSelectContact(item, 'pic')"
            />
            <el-button
              type="primary"
              v-if="picContact"
              @click="openDialogPIC"
              :icon="User"
            />
          </div>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>

        <el-form-item label="Alamat" prop="address_view">
          <el-autocomplete
            v-model="ruleForm.address_view"
            :fetch-suggestions="querySearchAddress"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            placeholder="Cari Alamat/Buat Baru"
            @select="(record) => handleSelectAddress(record)"
          >
            <template #default="{ item }">
              <div class="name">{{ item.name }}</div>
              <span class="street text-sm">{{ item.street }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item v-if="address" label="Dikirim ke">
          <div>
            <div>{{ address.address_name }}</div>
            <div>
              {{ address.street }},
              {{ generateResultSearchAddress(address).name }}
            </div>
          </div>
        </el-form-item>

        <!-- <el-form-item label="Lokasi" prop="location_view">
          <el-autocomplete
                :fetch-suggestions="querySearchAsyncLocation"
                v-model="ruleForm.location_view"
                placeholder="Please input"
                @select="(item: Record<string, any>) => onHandleSelectLocationAutocomplete(item)"
              />
        </el-form-item>   -->

        <el-form-item label="Tanggal Permintaan" prop="date">
          <el-date-picker
            v-model="ruleForm.date!"
            type="date"
            placeholder="Tanggal Inquiri"
          />
        </el-form-item>

        <el-form-item label="Prioritas" label-position="right">
          <el-radio-group v-model="ruleForm.priority" aria-label="Prioritas">
            <el-radio-button value="low">Low</el-radio-button>
            <el-radio-button value="medium">Medium</el-radio-button>
            <el-radio-button value="high">Hight</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Note">
          <el-input v-model="ruleForm.description" type="textarea" />
        </el-form-item>
      </el-card>

      <el-card class="mb-3">
        <el-table :data="dataTable" border>
          <el-table-column prop="item" label="item">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsync"
                v-model="scope.row.item"
                placeholder="Please input"
                @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
              >
                <template #default="{ item }">
                  <div
                    v-if="item.isNew"
                    class="flex items-center text-blue-500"
                  >
                    <el-icon><Plus /></el-icon>
                    <span class="ml-2">Tambahkan "{{ item.value }}"</span>
                  </div>
                  <div v-else>
                    <p style="line-height: 15px" class="font-bold">
                      {{ item.value }}
                    </p>
                    <p v-if="item.type === 'inventory'">
                      PN/SN: {{ item.sn_number ?? "Tidak Ada" }} | Lokasi:
                      {{ item.location_name ?? "Tidak Ada" }} | Available Stok:
                      {{ item.available }}
                    </p>
                    <p v-if="item.type === 'catalogue'">
                      PN/SN: {{ item.sn_number ?? "Tidak Ada" }}
                    </p>
                  </div>
                </template>
              </el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column prop="sn" label="Serial Number" width="200">
            <template #default="scope">
              <el-input v-model="scope.row.sn" placeholder="Serial Number" />
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="Quantity" width="200">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="0.01"
                @input="(value: number | null | undefined) => validateDecimal(`${value}`, scope)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="unit_name" label="Unit" width="100">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchUnit"
                v-model="scope.row.unit_name"
                placeholder="Input Units"
                @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
              />
            </template>
          </el-table-column>
          <el-table-column label="Aksi" width="60" fixed="right">
            <template #default="scope">
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="removeItem(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 100%" @click="addNewLine">
          Tambahkan Baris Baru
        </el-button>
      </el-card>
    </el-form>

    <el-dialog v-model="dialogContact" title="Detail Kontak">
      <AddContact
        ref="formFieldsRefContact"
        :contact-data="typeContactActive == 'to' ? toContact! : picContact!"
        :loading="loading"
        @submit="handleSubmitContact"
        @reset="handleResetContact"
      />
    </el-dialog>
    <el-dialog
      v-model="dialogNewAddress"
      title="Create New Address"
      width="500"
    >
      <FormAddress
        :onSetInitital="{
          contact_id: ruleForm.request_by,
          contact_name: ruleForm.request_by_name,
        }"
        :onSuccess="onAddNewAddress"
      />
    </el-dialog>
    <el-dialog v-model="dialogSalesOrder" title="Daftar SO" width="1200">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="request_search_sales_order.keyword"
            class="responsive-input"
            placeholder="Cari Sales Order"
            width="50%"
            :prefix-icon="Search"
          />
        </el-col>
      </el-row>

      <el-table :data="sales_order.data.value?.data ?? []" border>
        <el-table-column label="Unique Code" width="200">
          <template #default="scope">
            <NuxtLink
              :href="
                scope.row.type == 'so'
                  ? `/sales/order/${scope.row.unique_id}`
                  : `/supply-chain-management/purchase/order/${scope.row.unique_id}`
              "
              class="text-blue-600"
              >{{ scope.row.unique_code }}</NuxtLink
            >
          </template>
        </el-table-column>
        <el-table-column label="Customer">
          <template #default="scope">
            {{ scope.row.vendor_name }}
          </template>
        </el-table-column>
        <el-table-column label="Tanggal">
          <template #default="scope">
            {{ formatLocalDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="Total" align="right">
          <template #default="scope">
            {{ currency(scope.row.total_price) }}
          </template>
        </el-table-column>
        <el-table-column label="Aksi" align="right" width="100">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="() => onSelectReference_id(scope.row)"
              >pilih</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="sales_order?.data.value?.total_data"
          @next-click="paginationClickSalesOrderClick"
          @prev-click="paginationClickSalesOrderClick"
          @change="paginationClickSalesOrderClick"
        />
      </div>
    </el-dialog>
  </TrumsWrapper>
</template>
