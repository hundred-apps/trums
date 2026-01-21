<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inquiries-create",
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
import { TypeInquiry, type Inquiry } from "~/types/inquiry";
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
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadStatus,
  UploadUserFile,
} from "element-plus";
import {
  Search,
  Timer,
  Plus,
  Operation,
  User,
  Warning,
  Delete,
  Edit,
  Picture
} from "@element-plus/icons-vue";
import type { Maintenance } from "~/types/maintenance";
import type { Contact } from "~/types/contact";
import type { Catalogue } from "~/types/catalogue";
import type { Unit } from "~/types/unit";
import type { RequestSearch } from "~/types/request_search";
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
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";
import ItemImageUpload from "./components/ItemImageUpload.vue";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";
import { generateAddressView, getFirstFileUrl } from "#imports";

const fileList = ref<UploadUserFile[]>([]);

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const axios = useApi();

const router = useRouter();
const route = useRoute();
const id = computed(() => route.query.id as string);

const goBack = () => router.back();
const loading = ref<boolean>(false);
const dialogContacts = ref<boolean>(false);
const dialogRepair = ref<boolean>(false);
const dialogSalesOrder = ref<boolean>(false);
const dialogContact = ref<boolean>(false);
const dialogNewAddress = ref<boolean>(false);
type ItemImageUploadInstance = InstanceType<typeof ItemImageUpload>


// Gunakan array dengan tipe yang tepat
const itemImageUploadRefs = ref<(ItemImageUploadInstance | null)[]>([])

const drawerCatalogue = ref<boolean>(false);
const itemActive = ref<number>(-1);

const formFieldsRefContact = ref();
const picContact = ref<Contact>();
const toContact = ref<Contact>();

const showImageModal = ref(false)
const activeItemIndex = ref(-1)
const activeItemData = ref<ItemInterface | null>(null)
const modalImageFiles = ref<UploadUserFile[]>([])
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>()
const uploadAction = computed(() => `${config.public.apiBaseURL}/upload-item-image`)

const typeContactActive = ref<"to" | "pic">("to");

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
  sort: null,
});

interface ItemInterface {
  image?: string;
  imageFile?: UploadUserFile;
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
  catalogue: Catalogue | null;
  files?: UploadUserFile[]
}
const dataTable = ref<ItemInterface[]>([]);

const address = ref<AddressType | null>(null);

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

const tmpCatalogue = ref<Catalogue | null>(null);

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


const showDialog = () => {
  if (ruleForm.reference == "maintenance") {
    dialogRepair.value = true;
  } else if (ruleForm.reference == "non_maintenance") {
    // dialogContacts.value = true;
  } else if (ruleForm.reference == "so") {
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
    catalogue: null,
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
          imageFile: element.imageFile,
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
      type: TypeInquiry.SALES_INQUIRY,
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
    formData.append("type", `${TypeInquiry.SALES_INQUIRY}`);
    formData.append("request_to_id", `${ruleForm.to_unique_id}`);
    formData.append("request_to_version", `${ruleForm.to_version}`);
    formData.append("address_id", `${ruleForm.address_id}`);
    formData.append("address_version", `${ruleForm.address_version}`);

    // Append item_request (nested)
    dataTable.value.forEach((item, index) => {
      formData.append(`item_request[${index}][unique_id]`, `${item.unique_id}`);
      formData.append(
        `item_request[${index}][catalogue_id]`,
        `${item.item_id}`
      );
      formData.append(
        `item_request[${index}][catalogue_name]`,
        `${item.item}`
      );
      formData.append(`item_request[${index}][unit_id]`, `${item.unit_id}`);
      formData.append(`item_request[${index}][unit_name]`, `${item.unit_name}`);
      formData.append(
        `item_request[${index}][request_qty]`,
        `${parseInt(item.quantity.toString())}`
      );
      formData.append(
        `item_request[${index}][approved_qty]`,
        `${0}`
      );
      formData.append(
        `item_request[${index}][rejected_qty]`,
        `${0}`
      );
      formData.append(
        `item_request[${index}][remaining_qty]`,
        `${parseInt(item.quantity.toString())}`
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

      if (item.files) {
        (item.files ?? []).forEach((file, indexFile) => {
          if(file.raw){
            formData.append(
              `item_request[${index}][files]`,
              file.raw as Blob
            );
          }
        });
      
      }
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
        router.push(`/sales/inquiry/${inquiry.unique_id}`);
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

const getContacts = async () => {
  try {
    const response = await axios.get("/contact-read");
    if (response.status == 200) {
      contacts.value = response.data.data;
    }
  } catch (error: any) {
    console.log(`Gagal Mengambil Data Kontak ${error.response.data.message}`);
  }
};

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

const onSelectReference_id = async (data: any) => {
  console.log(data);
  if (ruleForm.reference == "non-maintenance") {
    const contact = data as Contact;
    ruleForm.reference_id = contact.unique_id;
    ruleForm.reference_view = contact.name;
  } else if (ruleForm.reference == "so") {
    const sales_order = data as PurchaseOrder;
    ruleForm.reference_id = sales_order.unique_id;
    ruleForm.reference_view = sales_order.unique_code;
    ruleForm.request_by = sales_order.vendor_id;
    ruleForm.request_by_name = sales_order.vendor_name;

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
      catalogue: value.catalogue ?? null,
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
      catalogue: value.catalogue,
    }));
  }

  dialogContacts.value = false;
  dialogRepair.value = false;
  dialogSalesOrder.value = false;
};

const create_catalogue = async (catalogue: Catalogue) => {
  loading.value = true;
  try {
    console.log('catalogue', catalogue);
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

    catalogue.file_catalogues.forEach((file) => {
      if (file.raw) {
        formData.append('files[]', file.raw);
      }
    });

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );

    console.log(response.status);
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

  useFetchApi<ResponsePagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "fetch-catalogues-inventory",
    "post",
    {
      keyword: queryString,
      flag: "form",
    }
  )
    .then((response) => {
      if (response.status.value === "success") {
        const resultApi: ItemSearch[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          const results = resultApi.map((data: ItemSearch) => {
            return {
              ...data,
              value: `${data.catalogue_name} ${
                data.sn_number ? " - " + data.sn_number : ""
              }`,
            };
          });
          cb([...results, {
              value: `${queryString}`,
              label: `Tambahkan ${queryString}`,
              isNew: true,
            }]);
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
        ElMessage.error(
          response.error.value?.data?.message ?? "Gagal mengambil data!"
        );
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response.data.message);
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

const querySearchContact = (queryString: string, cb: (arg: any) => void, type: "to"|"pic") => {
  (request_search.value.keyword = queryString),
  (request_search.value.table = "contacts");
  request_search.value.column = type == "to" ? [] : [
    {
      parent_id: ruleForm.to_unique_id,
    },
  ];
  request_search.value.flag = "form";

  axios
    .post("/search", request_search.value)
    .then((response) => {
      
      if (response.status == 200) {
        const resultApi: ResponsePagination<Contact[]> = response.data;
        if (resultApi.data.length > 0) {
          const results = resultApi.data.map((data: Contact) => {
            return { ...data, value: `${data.name}` };
          });

          const options = [...results, {
              value: `Tambahkan ${queryString}`,
              isNew: true,
              query: queryString,
              label: `Tambahkan ${queryString}`,
            }];
            
          cb(options);
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

const openCatalogueDetail = (cat: ItemInterface, index: number) => {
  if (cat.catalogue == null) {
    tmpCatalogue.value = {
      name: "",
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
  } else {
    tmpCatalogue.value = cat.catalogue;
  }
  itemActive.value = index;
  drawerCatalogue.value = true;
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
          const callback = resultApi.map((value) => ({
            ...value,
            value: value.name,
          }));
          cb([
            ...callback,
            { value: queryString, label: `${queryString}`, isNew: true },
          ]);
        } else {
          cb([
            { value: `${queryString}`, label: `${queryString}`, isNew: true },
          ]);
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


    itemActive.value = scope.$index;
    tmpCatalogue.value = catalogueInsert;
    drawerCatalogue.value = true;
    // const selected: Catalogue | null =
    //   (await create_catalogue(catalogueInsert)) ?? null;

    // if (selected != null) {
    //   dataTable.value[scope.$index].item = selected.name ?? item.value;
    //   dataTable.value[scope.$index].item_id = selected.unique_id ?? "";
    //   dataTable.value[scope.$index].sn = selected.sn ?? "";
    //   dataTable.value[scope.$index].catalogue = selected;
    //   dataTable.value[scope.$index].files = mapApiFilesToUpload(selected.files ?? []);
    //   dataTable.value[scope.$index].image = getFirstFileUrl(selected.files ?? []);
      
      
    // } else {
    //   ElMessage.error(`Ops, Something wrong!!`);
    // }
  } else {
    const selected: ItemSearch = item as ItemSearch;
    dataTable.value[scope.$index].item = selected.catalogue_name;
    dataTable.value[scope.$index].item_id = selected.catalogue_id ?? "";
    dataTable.value[scope.$index].sn = selected.sn_number ?? "";
    dataTable.value[scope.$index].unit_id = selected.unit_id ?? "";
    dataTable.value[scope.$index].unit_name = selected.unit_name ?? "";
    dataTable.value[scope.$index].inventory_id = selected.inventory_id ?? "";
    dataTable.value[scope.$index].files = mapApiFilesToUpload(selected.files ?? []);
    dataTable.value[scope.$index].image = getFirstFileUrl(selected.files ?? []);

    const catalogue: Catalogue | undefined = await fetchCatalogueDetail(
      selected.catalogue_id ?? ""
    );

    if (catalogue) {
      dataTable.value[scope.$index].catalogue = catalogue;
    }
  }
};

const fetchCatalogueDetail = async (
  unique_id: string
): Promise<Catalogue | undefined> => {
  loading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<Catalogue>>(
      `/catalogues-read/${unique_id}?flag=form`,
      {
        method: "GET",
      }
    );

    if (response.success) {
      return response.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
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
  console.log("type", type);
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
        parent_id: ruleForm.to_unique_id ?? "",
        parent_version: ruleForm.to_version,
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
  console.log(scope.$index);
  console.log("item", item);
  if (item.isNew) {
    const unit: Unit | null = await handleNewUnit(item.label ?? "");
    if (unit != null) {
      dataTable.value[scope.$index].unit_name = unit.name;
      dataTable.value[scope.$index].unit_id = unit.unique_id;
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

const getFile = (itemRequest: ItemRequest) => {
  if (itemRequest.files != null && itemRequest.files!.length > 0) {
    return `${imageUrl}/${itemRequest.files![0].image_path}/${
      itemRequest.files![0].filename
    }`;
  } else {
    return "";
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

      address.value = inquiryData.address ?? null;

      toContact.value = inquiryData.request_to;

      inquiryData.item_request.forEach((element) => {
        return dataTable.value.push({
          id: null,
          image: getFile(element),
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
          catalogue: element.catalogue,
          files: mapApiFilesToUpload(element.files ?? []),
        });
      });
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};
const mapApiFilesToUpload = (files: any[]) => {
  const baseUrl = useRuntimeConfig().public.baseImageURL; 
  // sesuaikan dengan config kamu

  return files.map((file) => ({
    uid: file.unique_id,
    name: file.filename_original || file.filename,
    url: `${baseUrl}${file.image_path}/${file.filename}`,
    status: 'success' as UploadStatus,
  }));
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
    const name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
    const street = `${address.street}`;
    const address_id = address.unique_id;
    const address_version = address.version;
    return {
      value: name,
      name: name,
      street: street,
      address_id: address_id,
      address_version: address.version,
      address: address,
    };
  } else {
    return {
      value: "",
      name: "",
      street: "",
      address_id: "",
      address_version: 0,
      address: null,
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
  // newSearch.sort = [];
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
    console.log('selected',record);
    // const address: AddressType = record as AddressType;
    ruleForm.address_id = record.address_id;
    ruleForm.address_version = record.address_version;
    ruleForm.address_view = record.name;
    address.value = record.address;
  }
};

const onAddNewAddress = (addressType: AddressType) => {
  ruleForm.address_id = addressType.unique_id;
  ruleForm.address_view = addressType.address_name;
  ruleForm.address_version = addressType.version || 1;
  address.value = addressType;
  dialogNewAddress.value = false;
};

const handleSubmit = async (catalogue: Catalogue) => {
  loading.value = true;

  try {
    const catalogueInsert = (await create_catalogue(catalogue)) ?? undefined;
    if (catalogueInsert != undefined) {
      dataTable.value[itemActive.value].item = catalogueInsert.name ?? "";
      dataTable.value[itemActive.value].item_id = catalogueInsert.unique_id ?? "";
      dataTable.value[itemActive.value].sn = catalogueInsert.sn ?? "";
      dataTable.value[itemActive.value].catalogue = catalogueInsert;
      dataTable.value[itemActive.value].files = mapApiFilesToUpload(catalogueInsert.files ?? []);
      dataTable.value[itemActive.value].image = getFirstFileUrl(catalogueInsert.files ?? []);
    } else {
      ElMessage.error("Kesalahan saat menyimpan data catalogue!");
    }
  } catch (error: any) {
    console.log(error);
    ElMessage.error(`Gagal menyimpan catalogue`);
  } finally {
    loading.value = false;
    drawerCatalogue.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  // Reset form atau navigasi kembali
  console.log("Form cancelled");
  resetFormCatalogue();
  drawerCatalogue.value = false;
  // atau navigate back
};

// Fungsi untuk reset form
const resetFormCatalogue = () => {
  tmpCatalogue.value = null;
};

const delete_item = async (index: number) => {
  try {
    const data: ItemInterface = dataTable.value[index];
    if (data.unique_id) {
      const response = await useApiFetch<BaseResponse<any>>(
        "/item-request-delete",
        {
          method: "POST",
          body: [data.unique_id],
        }
      );

      if (response.success) {
        dataTable.value.splice(index, 1);
      }
    } else {
      dataTable.value.splice(index, 1);
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const handleAvatarSuccess = (
  response: any,
  uploadFile: UploadFile,
  index: number
) => {
  dataTable.value[index].image = URL.createObjectURL(uploadFile.raw!);
  dataTable.value[index].imageFile = uploadFile;
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  console.log("row file", rawFile);
  if (rawFile.type !== "image/jpeg" && rawFile.type !== "image/png" && rawFile.type !== "image/jpg") {
    ElMessage.error("Avatar picture must be IMAGE format!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("Avatar picture size can not exceed 2MB!");
    return false;
  }
  return true;
};

onMounted(() => {
  // getContacts();
  // getMaintenance();

  if (id.value) {
    fetchInquiry();
  }
});

// Fungsi untuk handle perubahan gambar di item table
const onItemImageChange = (files: UploadUserFile[], index: number) => {
  console.log(`Item ${index} image changed:`, files);
  
  // Update dataTable dengan files baru
  dataTable.value[index].files = files;
  
  // Set image URL untuk preview di tabel (mengambil gambar pertama)
  if (files.length > 0) {
    const firstFile = files[0];
    if (firstFile.url) {
      dataTable.value[index].image = firstFile.url;
    } else if (firstFile.raw) {
      // Buat blob URL untuk preview
      dataTable.value[index].image = URL.createObjectURL(firstFile.raw);
    }
  } else {
    dataTable.value[index].image = '';
  }
  
  // Optional: Tambahkan loading state atau feedback
  ElMessage.success(`Gambar untuk item ${index + 1} diperbarui`);
};

const setItemImageUploadRef = (
  el: Element | ComponentPublicInstance | null, 
  index: number
) => {
  // Type assertion ke komponen yang benar
  itemImageUploadRefs.value[index] = el as ItemImageUploadInstance
}

const openImageModal = (index: number, itemData: ItemInterface) => {
  activeItemIndex.value = index
  activeItemData.value = itemData
  
  // Reset photoWallRef jika perlu (clear selection)
  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.()
  }
  
  // Load files dengan memastikan URL valid
  modalImageFiles.value = (itemData.files || []).map(file => {
    // Clone file object
    const fileCopy = { ...file }
    
    // Jika file punya raw tapi URL invalid/expired, buat URL baru
    if (fileCopy.raw && (!fileCopy.url || !isValidUrl(fileCopy.url))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw)
    }
    
    return fileCopy
  })

  console.log('modal file ', modalImageFiles.value);
  
  showImageModal.value = true
}

const isValidUrl = (urlString: string): boolean => {
  console.log('url string', urlString);
  if (!urlString.startsWith('blob:')) return true // Non-blob URLs valid
  
  try {
    // Coba fetch URL untuk test validity
    fetch(urlString, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch {
    return false
  } finally {
    return false;
  }
}



const handleImageModalClose = () => {
  // Optional: Clear temporary blob URLs
  modalImageFiles.value.forEach(file => {
    if (file.url?.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
  modalImageFiles.value = []
  activeItemIndex.value = -1
  activeItemData.value = null
}


const handleModalImagesChange = (files: UploadUserFile[]) => {
  console.log('images', files);
  modalImageFiles.value = files
}

// Fungsi untuk mendapatkan URL gambar
const getImageUrl = (file: UploadUserFile): string => {
  if (file.url) return file.url
  if (file.raw) return URL.createObjectURL(file.raw)
  return ''
}

// Fungsi untuk mendapatkan gambar pertama
const getFirstImageUrl = (): string => {
  if (modalImageFiles.value.length === 0) return ''
  return getImageUrl(modalImageFiles.value[0])
}

const getFirstFileName = (): string => {
  if (modalImageFiles.value.length === 0) return ''
  return modalImageFiles.value[0].name || 'Unnamed file'
}

const getFirstFileSize = (): string => {
  if (modalImageFiles.value.length === 0) return ''
  
  const firstFile = modalImageFiles.value[0]
  if (firstFile.size) {
    const sizeInMB = firstFile.size / (1024 * 1024)
    return sizeInMB < 1 
      ? `${(firstFile.size / 1024).toFixed(2)} KB` 
      : `${sizeInMB.toFixed(2)} MB`
  }
  return 'Unknown size'
}

const getFirstFileType = (): string => {
  if (modalImageFiles.value.length === 0) return ''
  
  const firstFile = modalImageFiles.value[0]
  if (firstFile.raw?.type) {
    return firstFile.raw.type.split('/')[1]?.toUpperCase() || 'Unknown'
  }
  return 'Unknown'
}

// Fungsi untuk set gambar sebagai utama
const setAsFirstImage = (index: number) => {
  if (index === 0) return // Already first
  
  // Pindahkan gambar ke posisi pertama
  const [selectedImage] = modalImageFiles.value.splice(index, 1)
  modalImageFiles.value.unshift(selectedImage)
}

// Fungsi untuk menghapus gambar
const removeImage = (index: number) => {
  modalImageFiles.value.splice(index, 1)
}

// Fungsi untuk menyimpan gambar
const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {
    // Update dataTable dengan files baru
    dataTable.value[activeItemIndex.value].files = [...modalImageFiles.value]
    
    // Set image URL untuk preview di tabel (mengambil gambar pertama)
    if (modalImageFiles.value.length > 0) {
      const firstFile = modalImageFiles.value[0]
      if (firstFile.url) {
        dataTable.value[activeItemIndex.value].image = firstFile.url
      } else if (firstFile.raw) {
        dataTable.value[activeItemIndex.value].image = URL.createObjectURL(firstFile.raw)
      }
    } else {
      dataTable.value[activeItemIndex.value].image = ''
    }
    
    ElMessage.success(`Gambar untuk item ${activeItemIndex.value + 1} disimpan`)
  }
  
  showImageModal.value = false
}

// Fungsi untuk cancel upload
const cancelImageUpload = () => {
  showImageModal.value = false
}


const handleRemoveImageList = async (file: UploadUserFile, files: UploadUserFile[]) => {
  if(file.raw){
    console.log('file baru upload');
  }else{
    console.log('file lama', file.uid);
    try {
      const response = await useApiFetch<BaseResponse<any>>('/file-delete', {
        method: 'POST',
        body: [file.uid]
      })

      if(response.success){
        ElMessage.success(`Image Berhasil Di Hapus!`);
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.message ?? error}`);
    }
  }
}

const handleEditAddress = (address: AddressType) => {
  
  dialogNewAddress.value = true;
}



</script>
<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Buat Inquiri Baru </span>
      </template>
    </el-page-header>
    <el-card class="my-3">
      
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      style="max-width: 600px"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      
        

        <el-form-item label="Diminta oleh?" prop="to_name">
          <div class="flex items-center gap-3">
            <el-autocomplete
              :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchContact(queryString, cb, 'to')"
              v-model="ruleForm.to_name"
              placeholder="Cari Kontak"
              @select="(item: Record<string, any>) => onHandleSelectContact(item, 'to')"
            >
            
              <template #default="{ item }">
                <div v-if="!item.isNew">{{ item.name }}</div>
                <div v-else class="text-blue-600">{{ item.value }}</div>
              </template>
            
            </el-autocomplete>
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
              :fetch-suggestions="(queryString: string, cb: (arg: any) => void) => querySearchContact(queryString, cb, 'pic')"
              v-model="ruleForm.request_by_name"
              placeholder="Cari Kontak"
              @select="(item: Record<string, any>) => onHandleSelectContact(item, 'pic')"
            >
            <template #default="{ item }">
                <div v-if="!item.isNew">{{ item.name }}</div>
                <div v-else class="text-blue-600">{{ item.value }}</div>
              </template>
            </el-autocomplete>
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

        <el-form-item v-if="address" label=" ">
          <div>
            <div class="flex items-center gap-2">
              <p>{{ address.address_name }}</p>
              <el-icon 
                class="cursor-pointer text-blue-500 hover:text-blue-600"
                @click="handleEditAddress(address)"
              ><Edit /></el-icon> 
            </div>
            <div>{{ address.street }}, {{ generateResultSearchAddress(address).name }}</div>
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
      

    </el-form>
    </el-card>
    <el-card class="mb-3">
      <el-table :data="dataTable" border>
        <el-table-column label="Image" width="75">
          <template #default="scope">
            <ItemImageUpload
              v-model="scope.row.files"
              :image-url="scope.row.image"
              :show-text="false"
              @open-modal="() => openImageModal(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="item" label="item" >
          <template #default="scope">
            <div class="flex justify-center">
              <el-button
              @click="() => openCatalogueDetail(scope.row, scope.$index)"
              text
              ><el-icon><Warning /></el-icon
            ></el-button>
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
                <div v-else class="flex items-center gap-2">
                  <!-- Thumbnail file pertama -->
                  <div class="flex-shrink-0 mt-1">
                    <div 
                      v-if="item.files && item.files.length > 0"
                      class="w-10 h-10 rounded overflow-hidden border"
                    >
                      <img 
                        :src="getFirstFileUrl(item.files)"
                        :alt="item.catalogue_name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div 
                      v-else
                      class="w-10 h-10 rounded border flex items-center justify-center text-gray-400"
                    >
                      <el-icon><Picture /></el-icon>
                    </div>
                  </div>
                  
                  <!-- Informasi produk -->
                  <div class="flex-1 min-w-0">
                    <p style="line-height: 15px" class="font-bold truncate">
                      {{ item.catalogue_name || item.value }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      PN/SN: {{ item.sn_number || "Tidak Ada" }} | 
                      Brand: {{ item.brand_name || "N/A" }}
                    </p>
                    
                  </div>
                </div>
              </template>
            </el-autocomplete>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sn" label="Serial Number" />
        <el-table-column prop="quantity" label="Quantity" width="100">
          <template #default="scope">
            <el-input
              :step="0.01"
              :min="0"
              v-model="scope.row.quantity"
              @input="(value: string) => validateDecimal(value, scope)"
              placeholder="Masukkan item"
            />
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="Unit" width="100">
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchUnit"
              v-model="scope.row.unit_name"
              placeholder="Input Units"
              @select="(item: Record<string, any>) => onHandleSelectItemAutocompleteUnit(item, scope)"
            >
              <template #default="{ item }">
                <div
                  v-if="item.isNew"
                  class="flex items-center text-blue-500"
                >
                  <el-icon><Plus /></el-icon>
                  <span class="ml-2">Tambahkan "{{ item.label }}"</span>
                </div>
                <div v-else>
                  <p class="font-bold">{{ item.name }}</p>
                </div>
              </template>
            </el-autocomplete>
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="100">
          <template #default="scope">
            <el-button
              :icon="Delete"
              type="danger"
              @click="() => delete_item(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-button class="mt-4" style="width: 100%" @click="addNewLine">
        Tambahkan Baris Baru
      </el-button>
    </el-card>

    <el-card>
      <div class="card-header flex justify-end items-center">
        <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)"
              >Simpan</el-button
            >
        </div>
    </el-card>

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
          contact_id: ruleForm.to_unique_id,
          contact_name: ruleForm.to_name,
          address_name: address?.address_name,
          unique_id: address?.unique_id,
          street: address?.street,
          codepos: address?.codepos,
          village: address?.village,
          village_id: address?.village_id,
          city: address?.city,
          regency: address?.regency,
          province: address?.province,
          address_view: generateAddressView(address!)
        }"
        :onSuccess="onAddNewAddress"
      />
    </el-dialog>
    <el-drawer
      v-model="drawerCatalogue"
      title="Detail Item"
      :with-header="true"
    >
      <CatalogueAdd :catalogue_form="tmpCatalogue!" :loading="loading" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="handleCancel">Batal</el-button>
          <el-button type="primary" @click="() => handleSubmit(tmpCatalogue!)"
            >Simpan</el-button
          >
        </div>
      </template>
    </el-drawer>


    <el-dialog
      v-model="showImageModal"
      :title="`Upload Gambar untuk Item ${activeItemIndex + 1}`"
      width="900px"
      :close-on-click-modal="false"
      @close="handleImageModalClose"
    >
      <div class="image-upload-modal">
        <!-- Photo Wall Upload -->
        <PhotoWallUploads
          ref="photoWallRef"
          v-model="modalImageFiles"
          :action="uploadAction"
          :multiple="true"
          :limit="10"
          :max-size="5"
          accept="image/*"
          @change="handleModalImagesChange"
          @remove="handleRemoveImageList"
        />
        
        <!-- Preview Section -->
        <div v-if="modalImageFiles.length > 0" class="preview-section">
          
          
        </div>
        
        <!-- Empty State -->
        <div v-else class="empty-state-modal">
          <el-empty description="Belum ada gambar" :image-size="100">
            <template #description>
              <p>Upload gambar untuk item ini</p>
              <p class="hint">Gambar pertama akan ditampilkan di tabel</p>
            </template>
          </el-empty>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelImageUpload">Batal</el-button>
          <el-button 
            type="primary" 
            @click="saveItemImages"
            :disabled="modalImageFiles.length === 0"
          >
            Simpan ({{ modalImageFiles.length }} gambar)
          </el-button>
        </span>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>
<style scoped>
:deep(.avatar-uploader) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
}

:deep(.avatar-uploader .avatar-uploader-icon) {
  width: 50px;
  height: 50px;
}
</style>
