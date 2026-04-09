<template>
  <TrumsWrapper>
    <div class="w-auto">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> Buat Penawaran </span>
        </template>
      </el-page-header>
      <AddPriceTagComponent @submit="onSubmit" :data="ruleForm" />
    </div>
  </TrumsWrapper>
</template>
<script lang="tsx" setup>
import { Filter, InfoFilled, Delete, Picture } from "@element-plus/icons-vue";
import {
  ElCheckbox,
  ElIcon,
  ElPopover,
  type CheckboxValueType,
  type Column,
  type ComponentSize,
  type FormInstance,
  type FormRules,
  type SortBy,
  type UploadUserFile,
} from "element-plus";
import type { Catalogue } from "~/types/catalogue";
import type { Inventory } from "~/types/inventory";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Unit } from "~/types/unit";
import CustomTable from "~/components/trums/table/customTable.vue";
import SkeletonPage from "~/components/trums/SkeletonPage.vue";
import Collapse from "~/components/trums/Collapse.vue";
import type { Contact } from "~/types/contact";
import type { FunctionalComponent } from "vue";
import type { Quotation } from "~/types/quotation";
import {
  OperationPriceTag,
  ReferencePriceTag,
  VariablePriceTag,
  type Pricetag,
  type Pricetag_condition,
  type Pricetag_item,
} from "~/types/pricetag";
import type { User } from "~/types/user";
import Special_price_kontak_componen from "../pricelist/special_price_kontak_componen.vue";
import Special_price_quantity_componen from "../pricelist/special_price_quantity_componen.vue";
import type { BaseResponse } from "~/types/response";
import type { Pricelist_item } from "~/types/pricelist";
import type { ItemSearch } from "~/types/item_search";
import type { Pagination } from "~/types/pagination";
import { CanvassingVendorStatus, type Canvassing } from "~/types/scm/canvasing";
import TrumsUploadFile from "~/components/trums/form/TrumsUploadFile.vue";
import type { AppFile } from "~/types/file";
import type { AddressType } from "~/types/address";
import PhotoWallUploads from "~/components/trums/PhotoWallUploads.vue";
import ItemImageUpload from "../inquiry/components/ItemImageUpload.vue";
import CatalogueAdd from "~/components/trums/CatalogueAdd.vue";
import { getFirstFileUrl } from "#imports";
import { currency, displayAmount } from "#imports";
import {
  ReferenceAdjustment,
  type AdjustmentTransaction,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import ModalAdjustmentTransaction from "~/components/trums/ModalAdjustmentTransaction.vue";
import AddAdjustment from "~/components/trums/AddAdjustment.vue";
import AdjustmentTransactionComponent from "~/components/trums/AdjustmentTransactionComponent.vue";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import {
  TermOfPaymentReference,
  type TermOfPayment,
} from "~/types/payment_term";
import AddPriceTagComponent from "~/components/trums/AddPriceTagComponent.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "pricetag-create",
});
const loadingGetEditData = ref<boolean>(true);
const loading = ref<boolean>(false);
const drawerCatalogue = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false);
const visibleModalNewAdjustment = ref(false);
const itemActive = ref<number>(-1);
const router = useRouter();
const api = useApi();

const goBack = () => router.back();
const popoverRef = ref();
const route = useRoute();
const canvassing_id = computed(() => route.query.canvassing_id as string);
const id = computed(() => route.query.id as string);
const type = computed(() => (route.query.type as "in" | "out") || "in");
const fileList = ref<UploadUserFile[]>([]);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<Pricetag>({
  code: "",
  unique_id: "",
  name: "",
  location_id: "",
  start_date: Date.now(),
  end_date: Date.now(),
  start_date_view: "",
  end_date_view: "",
  owner_id: "",
  created_at: 0,
  created_by: "",
  updated_at: 0,
  version: 0,
  type: type.value,
  note: "",
  subject: "",
  pricetag_item: [
    {
      catalogue: {
        id: null,
        unique_id: null,
        unique_code: null,
        name: "",

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
        type: "",
        created_at: null,
        created_by: null,
        updated_at: null,
        file_catalogues: [],
      },
      unique_id: null,
      tag_id: null,
      catalogue_id: "",
      inventory_id: "",
      inventory: null,
      price: 0,
      is_new: true,
      unit_id: "",
      unit_name: "",
      unit_version: 0,
      checked: false,
      quantity: 1,
      fileUploads: [],
    },
  ],

  location: {
    id: null,
    unique_id: null,
    unique_code: null,
    name: "",
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
    type: "",
    created_at: null,
    created_by: null,
    updated_at: null,
    file_catalogues: [],
    checked: undefined,
  },
  pricetag_condition: [],
  reference: null,
  reference_version: null,
  reference_id: null,
  to_id: "",
  to_name: "",
  files: [],
  pic_id: "",
  pic_name: "",
  pic_version: 0,
});

const tmpCatalogue = ref<Catalogue | null>(null);

const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

// special price
const contact_condition = ref<Pricetag_condition[]>([]);
const location_condition = ref<Pricetag_condition[]>([]);
const quantity = ref<Pricetag_condition>({
  operation: "greater_then",
  variable: VariablePriceTag.ITEM_QUANTITY,
  unique_id: null,
  tag_id: null,
  value: "0",
  variable_pricetag: {
    unique_id: "",
    name: VariablePriceTag.ITEM_QUANTITY,
    type: "variable",
    slug: "",
  },
  operation_pricetag: {
    unique_id: "",
    name: OperationPriceTag.GREATER_THAN,
    type: "operation",
    slug: "",
  },
});

const showImageModal = ref(false);
const activeItemIndex = ref(-1);
const activeItemData = ref<Pricetag_item | null>(null);
const modalImageFiles = ref<UploadUserFile[]>([]);
const photoWallRef = ref<InstanceType<typeof PhotoWallUploads>>();
const uploadAction = computed(
  () => `${config.public.apiBaseURL}/upload-item-image`
);

// const biayaLain = ref<number>(0);
// const potonganBiaya = ref<number>(0);
// const totalPajak = ref<number>(0);

const references = ref<ReferenceTransactionAdjustment[]>([]);

const collapse_special_price =
  ref<{ title: string; name: string; element: any }[]>();

const requestSearchLocation = ref<RequestSearch>({
  keyword: "",
  table: "",
  column: [],
  sort: null,
  limit: "50",
  offset: "1",
});

const requestSearchInventory = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
  column: [
    {
      location_id: [""],
      unit_id: [],
    },
  ],
  sort: null,
  limit: "50",
  offset: "1",
});

const requestSearchUnit = ref<RequestSearch>({
  keyword: "",
  table: "units",
  column: [],
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  limit: "50",
  offset: "1",
});

const search_default = ref<RequestSearch>({
  keyword: "",
  table: "inventories",
  column: [
    {
      location_id: [""],
      contact_id: [""],
    },
  ],
  sort: {
    column: "created_at",
    order: OrderColumn.ASC,
  },
  limit: "50",
  offset: "1",
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [
    {
      operator: ["plus"],
    },
  ],
  sort: null,
  limit: "10",
  offset: "1",
  flag: "form",
});

const adjustmentTransactions = await useFetchApi<
  ResponsePagination<AdjustmentTransaction[]>
>(
  "/search",
  "search-adjustment",
  "post",
  querySearchAdjustmentTransaction.value
);

const units = ref<Unit[]>([]);
const termOfPayments = ref<TermOfPayment[]>([]);

const rules = reactive<FormRules>({
  code: [
    {
      required: true,
      message: "Nomor Penawaran Tidak Boleh Kosong!",
      trigger: "blur",
    },
  ],
  owner_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],
  to_name: [
    { required: true, message: "Vendor Tidak Boleh Kosong!", trigger: "blur" },
  ],

  start_date: [
    {
      type: "date",
      required: true,
      message: "Tanggal Mulai Tidak Boleh Kosong!",
      trigger: "change",
    },
  ],

  pricetag_item: {
    type: "array",
    required: true,
    min: 1,
    message: "Item Tidak Boleh Kosong!",
    trigger: "change",
  },
});

const onUpdatePaymentTerms = (data: TermOfPayment[]) => {
  termOfPayments.value = data;
};

const totalPrice = computed(() => {
  return ruleForm.pricetag_item.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.price;
  }, 0);
});
const subtotal = computed(() => {
  console.log("get minus", totalPrice.value);
  return Number(totalPrice.value) - Number(getMinus.value);
});

const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      ref.adjustment?.category == "tax" &&
      ref.adjustment.name.toLowerCase() === "ppn"
    ) {
      const dpp: ReferenceTransactionAdjustment | undefined =
        references.value.find(
          (value) => value.adjustment?.unique_code == "DPPL"
        );
      if (dpp) {
        const dppValue = getDPPFormula(dpp, subtotal.value || 0);
        return getPPNFormula(ref, dppValue || subtotal.value);
      } else {
        return getPPNFormula(ref, subtotal.value);
      }
    } else {
      return ref.type == "amount"
        ? ref.amount
        : displayAmount(ref, subtotal.value || 0);
    }
  }
};

const getMinus = computed(() => {
  var minus = 0;
  references.value
    .filter((value) => value.adjustment?.operator == "minus")
    .forEach((ref) => {
      if (ref.include == false) {
        minus += Number(ref.amount);
      }
    });

  return minus;
});
const getPlus = computed(() => {
  var plus = 0;

  references.value
    .filter(
      (value) =>
        value.adjustment?.operator == "plus" &&
        value.adjustment?.category === "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += Number(ref.amount);
      }
    });

  return plus;
});

const dppComponent = computed(() => {
  return references.value.find(
    (value) =>
      value.adjustment?.category == "transform" &&
      value.adjustment?.unique_code == "DPPL"
  );
});

const ppnComponent = computed(() => {
  const ppnComponentRef = references.value.find(
    (value) =>
      value.adjustment?.category == "tax" &&
      value.adjustment?.name.toLowerCase() === "ppn"
  );

  if (ppnComponentRef) {
    if (dppComponent.value) {
      const dppValue = getDPPFormula(dppComponent.value, subtotal.value || 0);
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, dppValue);
      }
    } else {
      if (ppnComponentRef.include) {
        return 0;
      } else {
        return getPPNFormula(ppnComponentRef, subtotal.value || 0);
      }
    }
  } else {
    return 0;
  }
});

const grandTotal = computed(() => {
  console.log("PPN", ppnComponent.value);
  return subtotal.value + getPlus.value + ppnComponent.value;
});

const getDPP = async (): Promise<AdjustmentTransaction | undefined> => {
  loading.value = true;
  try {
    querySearchAdjustmentTransaction.value.column = [
      {
        category: ["transform"],
        unique_code: ["DPPL"],
      },
    ];
    const response = await useFetchApi<
      ResponsePagination<AdjustmentTransaction[]>
    >("/search", "search-adjustment", "post", querySearchAdjustmentTransaction);

    if (response.status.value === "success") {
      if (
        response.data.value?.data != null &&
        response.data.value?.data != undefined &&
        response.data.value!.data.length > 0
      )
        return response.data.value!.data[0];
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach(async (element) => {
    if (
      element.category == "tax" &&
      element.name.toLocaleLowerCase() === "ppn"
    ) {
      const adj = await getDPP();
      if (adj) {
        references.value.push({
          unique_id: "",
          reference: ReferenceAdjustment.OFFER,
          reference_id: "",
          adjustment_id: adj.unique_id,
          type: adj.type,
          amount: adj.default_value,
          created_at: 0,
          value: adj.default_value,
          adjustment: adj,
          changeType: true,
          inc_tmp: "0",
          include: false,
        });
      }
    }

    references.value.push({
      unique_id: "",
      reference: ReferenceAdjustment.OFFER,
      reference_id: "",
      adjustment_id: element.unique_id,
      type: element.type,
      amount: element.default_value,
      created_at: 0,
      value: element.default_value,
      adjustment: element,
      changeType: true,
      inc_tmp: "0",
      include: false,
    });
  });
  visibleModalAdjustmentTransaction.value = false;
};

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false;
  refreshNuxtData("search-adjustment");
};

const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
  requestSearchLocation.value.keyword = queryString;
  requestSearchLocation.value.table = "catalogues";
  requestSearchLocation.value.column = [
    {
      type: ["place"],
    },
  ];
  requestSearchLocation.value.flag = "form";

  useFetchApi<ResponsePagination<Catalogue[]>>(
    "/search",
    "warehouse",
    "post",
    requestSearchLocation.value
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Catalogue[] = response.data.value?.data ?? [];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    });
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

const handleSubmit = async (catalogue: Catalogue) => {
  loading.value = true;
  console.log("on submit");
  try {
    const catalogueInsert = (await create_catalogue(catalogue)) ?? undefined;

    if (catalogueInsert != undefined) {
      // dataTable.value[itemActive.value].item = catalogueInsert?.name ?? '';
      // dataTable.value[itemActive.value].item_id = catalogueInsert?.unique_id ?? '';
      ruleForm.pricetag_item[itemActive.value].sn = catalogueInsert?.sn ?? "";
      ruleForm.pricetag_item[itemActive.value].catalogue = catalogueInsert;
      ruleForm.pricetag_item[itemActive.value].catalogue_id =
        catalogueInsert.unique_id;
      ruleForm.pricetag_item[itemActive.value].fileUploads = mapApiFilesView(
        catalogueInsert.files ?? []
      );
      ruleForm.pricetag_item[itemActive.value].image = getFirstFileUrl(
        catalogueInsert.files ?? []
      );
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

const querySearchQuotation = (queryString: string, cb: (arg: any) => void) => {
  requestSearchLocation.value.keyword = queryString;
  requestSearchLocation.value.table = "offers";
  requestSearchLocation.value.column = [];
  requestSearchLocation.value.flag = "form";

  useFetchApi<ResponsePagination<Quotation[]>>(
    "/search",
    "offers",
    "post",
    requestSearchLocation.value
  )
    .then((response) => {
      if (response.status.value == "success") {
        const resultApi: Quotation[] = response.data.value?.data ?? [];
        if (resultApi.length > 0) {
          cb(
            resultApi.map((value) => ({
              ...value,
              value: value.sourcing_number,
            }))
          );
        }
      }
    })
    .then((error: any) => {
      ElMessage.error(error.response?.data?.message ?? error);
    });
};

const openImageModal = (index: number, itemData: Pricetag_item) => {
  activeItemIndex.value = index;
  activeItemData.value = itemData;

  // Reset photoWallRef jika perlu (clear selection)
  if (photoWallRef.value) {
    photoWallRef.value.clearFiles?.();
  }

  // Load files dengan memastikan URL valid
  modalImageFiles.value = (itemData.fileUploads || []).map((file) => {
    // Clone file object
    const fileCopy = { ...file };

    // Jika file punya raw tapi URL invalid/expired, buat URL baru
    if (fileCopy.raw && (!fileCopy.url || !isValidUrl(fileCopy.url))) {
      fileCopy.url = URL.createObjectURL(fileCopy.raw);
    }

    return fileCopy;
  });

  console.log("modal file ", modalImageFiles.value);

  showImageModal.value = true;
};

const handleImageModalClose = () => {
  // Optional: Clear temporary blob URLs
  modalImageFiles.value.forEach((file) => {
    if (file.url?.startsWith("blob:")) {
      URL.revokeObjectURL(file.url);
    }
  });
  modalImageFiles.value = [];
  activeItemIndex.value = -1;
  activeItemData.value = null;
};

const handleModalImagesChange = (files: UploadUserFile[]) => {
  console.log("images", files);
  modalImageFiles.value = files;
};

const handleRemoveImageList = async (
  file: UploadUserFile,
  files: UploadUserFile[]
) => {
  if (file.raw) {
    console.log("file baru upload");
  } else {
    console.log("file lama", file.uid);
    try {
      const response = await useApiFetch<BaseResponse<any>>("/file-delete", {
        method: "POST",
        body: [file.uid],
      });

      if (response.success) {
        ElMessage.success(`Image Berhasil Di Hapus!`);
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.message ?? error}`);
    }
  }
};

const cancelImageUpload = () => {
  showImageModal.value = false;
};

const saveItemImages = () => {
  if (activeItemIndex.value >= 0) {
    // Update dataTable dengan files baru
    ruleForm.pricetag_item[activeItemIndex.value].fileUploads = [
      ...modalImageFiles.value,
    ];

    // Set image URL untuk preview di tabel (mengambil gambar pertama)
    if (modalImageFiles.value.length > 0) {
      const firstFile = modalImageFiles.value[0];
      if (firstFile.url) {
        ruleForm.pricetag_item[activeItemIndex.value].image = firstFile.url;
      } else if (firstFile.raw) {
        ruleForm.pricetag_item[activeItemIndex.value].image =
          URL.createObjectURL(firstFile.raw);
      }
    } else {
      ruleForm.pricetag_item[activeItemIndex.value].image = "";
    }

    ElMessage.success(
      `Gambar untuk item ${activeItemIndex.value + 1} disimpan`
    );
  }

  showImageModal.value = false;
};

const querySearchVendors = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            }))
          );
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};
const querySearchPIC = (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [
        {
          parent_id: ruleForm.to_id,
        },
      ],
      keyword: query,
      limit: "50",
      offset: "1",
      sort: {
        column: "created_at",
        order: OrderColumn.ASC,
      },
      flag: "form",
      table: "contacts",
    };

    useFetchApi<ResponsePagination<Contact>>(
      "/search",
      "search-customer",
      "post",
      request_search
    ).then((response) => {
      if (response.status.value == "success") {
        const contacts: Contact[] = (response.data.value?.data ??
          []) as Contact[];
        if (contacts.length > 0) {
          cb(
            contacts.map((value) => ({
              value: value.name,
              unique_id: value.unique_id,
              data: value,
            }))
          );
        } else {
          cb([
            {
              value: query,
              isNew: true,
              keyword: query,
            },
          ]);
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch vendors", error);
    cb([]);
  }
};

const submitRemoveCost = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/reference-transaction-delete",
      "remove-cost",
      "post",
      ids
    );
    if (response.status.value == "success") {
      ElMessage.success("Biaya Lainya Berhasil Dihapus!");
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const removeAnotherCost = async (adj_id: string) => {
  const findIndex = references.value.findIndex(
    (ref) => ref.adjustment_id === adj_id
  );
  const unique_id = references.value[findIndex].unique_id;
  if (unique_id != "") {
    await submitRemoveCost([unique_id]);
  }

  references.value.splice(findIndex, 1);
};

const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {
  var params = { ...requestSearchUnit.value };
  params.keyword = queryString;
  params.table = "units";
  params.column = [];
  params.flag = "form";
  useFetchApi<ResponsePagination<Unit[]>>(
    "/search",
    "search-unit",
    "post",
    params
  )
    .then((response) => {
      if (response.status.value === "success") {
        const resultApi: Unit[] = response.data.value?.data ?? [];

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

const createNewVendor = async (data: any) => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>(
      "/contact-create",
      "create-customer",
      "post",
      data
    );
    if (response.status.value == "success") {
      return response.data.value?.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
  }
};

const onHandleSelectVendor = (item: any, type: "to" | "vendor" | "pic") => {
  if (item.isNew) {
    createNewVendor({ name: item.keyword }).then((customer) => {
      if (customer) {
        if (type == "vendor") {
          ruleForm.owner_id = customer.unique_id;
          ruleForm.owner_name = customer.name;
        } else if (type == "pic") {
          ruleForm.pic_id = customer.unique_id;
          ruleForm.pic_name = customer.name;
          ruleForm.pic_version = customer.version;
        } else {
          ruleForm.to_id = customer.unique_id;
          ruleForm.to_name = customer.name;
          ruleForm.to_version = customer.version;
        }
      }
    });
  } else {
    const customer = item.data as Contact;
    if (type == "vendor") {
      ruleForm.owner_id = customer.unique_id;
      ruleForm.owner_name = customer.name;
    } else if (type == "pic") {
      ruleForm.pic_id = customer.unique_id;
      ruleForm.pic_name = customer.name;
      ruleForm.pic_version = customer.version;
    } else {
      ruleForm.to_id = customer.unique_id;
      ruleForm.to_name = customer.name;
      ruleForm.to_version = customer.version;
    }
  }
};

const handleSelectLocation = (item: Record<string, any>) => {
  const catalogue: Catalogue = item as Catalogue;

  ruleForm.location = catalogue;
  ruleForm.location_id = catalogue.unique_id!;
};

const addNewLine = () => {
  const newItem: {
    unique_id: string | null;
    tag_id: string | null;
    catalogue_id: string | null;
    catalogue: Catalogue | null;
    inventory_id: string;
    inventory: Inventory | null;
    price: number;
    is_new?: boolean;
    unit_id: string | null;
    unit_name: string | null;
    unit_version: number | null;
    quantity: number;
    fileUploads: UploadUserFile[];
  }[] = [
    ...ruleForm.pricetag_item,
    {
      catalogue: {
        id: null,
        unique_id: null,
        unique_code: null,
        name: "",
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
        type: "",
        created_at: null,
        created_by: null,
        updated_at: null,
        file_catalogues: [],
      },
      unique_id: null,
      tag_id: null,
      catalogue_id: "",
      inventory_id: "",
      inventory: null,
      price: 0,
      is_new: true,
      unit_id: "",
      unit_name: "",
      unit_version: 0,
      quantity: 1,
      fileUploads: [],
    },
  ];

  ruleForm.pricetag_item = newItem;
};

type SelectionCellProps = {
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

// const checkSelect = () => da?.value?.data.some((row) => row.checked);

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

const querySearchAsyncInventories = (
  queryString: string,
  cb: (arg: any) => void
) => {
  const data = {
    location_id: ruleForm.location_id,
    keyword: queryString,
    limit: 50,
    flag: "form",
  };
  useFetchApi<ResponsePagination<ItemSearch[]>>(
    "/catalogues-inventory",
    "catalogues-inventory",
    "post",
    data
  )
    .then((response) => {
      if (response.status.value == "success") {
        const inventories: ItemSearch[] = response.data?.value?.data ?? [];

        if (inventories.length > 0) {
          const results = inventories.map((data: ItemSearch) => {
            return { isNew: false, value: `${data.catalogue_name}`, ...data };
          });
          cb(results);
        } else {
          cb([
            {
              isNew: true,
              value: `${queryString}`,
              name: `Tambahkan ${queryString}`,
            },
          ]);
        }
      }
    })
    .catch((error: any) => {
      ElMessage.error(`${error.response?.data?.message ?? error}`);
    });
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

    // Tambahkan file foto
    catalogue.file_catalogues.forEach((file) => {
      if (file.raw) {
        formData.append("files[]", file.raw);
      }
    });

    const response = await useFetchApi<BaseResponse<Catalogue>>(
      "/catalogues-create",
      "catalogue-create",
      "post",
      formData
    );
    if (response.status.value == "success") {
      const catalogue_result: Catalogue | null =
        response.data.value?.data ?? null;
      return catalogue_result;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const onHandleSelectItemAutocomplete = async (
  record: Record<string, any>,
  scope: any
) => {
  if (record.isNew) {
    const catalogueInsert: Catalogue = {
      name: record.value,
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

    tmpCatalogue.value = catalogueInsert;
    itemActive.value = scope.$index;
    drawerCatalogue.value = true;

    // const selected: Catalogue|null = await create_catalogue(catalogueInsert) ?? null;

    // if(selected != null){
    //   ruleForm.pricetag_item[scope.$index].item_name = selected.name!;
    //   ruleForm.pricetag_item[scope.$index].catalogue_id = selected.unique_id!;
    //   ruleForm.pricetag_item[scope.$index].sn = selected.sn ?? 'Tidak Ada SN/PN';
    //   ruleForm.pricetag_item[scope.$index].quantity = 1;
    // }else{
    //   ElMessage.error(`Ops, Something wrong!!`);
    // }
  } else {
    const selected: ItemSearch = record as ItemSearch;
    ruleForm.pricetag_item[scope.$index].item_name = selected.catalogue_name!;
    ruleForm.pricetag_item[scope.$index].catalogue_id = selected.catalogue_id!;
    ruleForm.pricetag_item[scope.$index].sn =
      selected.sn_number ?? "Tidak Ada SN/PN";
    ruleForm.pricetag_item[scope.$index].inventory_id =
      selected.inventory_id ?? "";
    ruleForm.pricetag_item[scope.$index].unit_id = selected.unit_id ?? "";
    ruleForm.pricetag_item[scope.$index].unit_name = selected.unit_name ?? "";
    ruleForm.pricetag_item[scope.$index].quantity = 1;
    ruleForm.pricetag_item[scope.$index].catalogue_id = selected.catalogue_id;
    ruleForm.pricetag_item[scope.$index].fileUploads = mapApiFilesView(
      selected.files ?? []
    );
    ruleForm.pricetag_item[scope.$index].image = getFirstFileUrl(
      selected.files ?? []
    );
    // ruleForm.pricetag_item[scope.$index].catalogue = catalogue;
    ruleForm.pricetag_item[scope.$index].price = 0;
  }
};

const onHandleSelectItemAutocompleteUnit = (
  item: Record<string, any>,
  scope: any
) => {
  if (item.unique_id == undefined) {
    ruleForm.pricetag_item[scope.$index].unit_name = item.label;
    ruleForm.pricetag_item[scope.$index].unit_id = "";
  } else {
    ruleForm.pricetag_item[scope.$index].unit_name = item.value;
    ruleForm.pricetag_item[scope.$index].unit_id = `${item.id}`;
  }
};

const deleteItemInServer = (string: string[]) => {
  loading.value = false;
  try {
    useFetchApi<BaseResponse<any>>(
      "/pricetag-item-delete",
      "pricetag-item-delete",
      "post",
      string
    ).then((response) => {
      if (response.status.value == "success") {
        ElMessage.success(`Data Berhasil Di Hapus`);
        fetchInitialData();
      }
    });
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const onDeleteList = (data: any) => {
  const price_list_item: Pricetag_item = data.row;
  // console.log(data);
  if (!price_list_item!.is_new) {
    deleteItemInServer([price_list_item.unique_id!]);
  } else {
    ruleForm.pricetag_item.splice(data.$index, 1);
  }
};

const onSort = (sortBy: SortBy) => {
  console.log("sort", sortBy.key);
  console.log(requestSearchInventory.value);
  const data: RequestSearch = { ...requestSearchInventory.value };
  data.sort = {
    column: sortBy.key.toString(),
    order:
      requestSearchInventory.value.sort?.order == OrderColumn.ASC
        ? OrderColumn.DESC
        : OrderColumn.ASC,
  };
  requestSearchInventory.value = data;
};

const onSubmit = async (pricetag: Pricetag | undefined) => {
  if (id.value) {
    fetchInitialData();
  } else {
    if (pricetag) {
      window.location.href = `/sales/offer/${pricetag.unique_id}`;
    } else {
      window.location.href = `/sales/offer/${pricetag!.unique_id}`;
    }
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// watch(requestSearchInventory, fetchData, {immediate: true});

const formatCurrencyID = (value: number | null) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const parseCurrencyID = (val: string): number => {
  if (!val) return 0;

  // hapus ribuan
  let clean = val.replace(/\./g, "");
  // ubah koma ke titik
  clean = clean.replace(",", ".");
  // hanya angka & titik
  clean = clean.replace(/[^0-9.]/g, "");

  return Number(clean) || 0;
};

const initialSpecialPrice = () => {
  collapse_special_price.value = [
    {
      element: (
        <Special_price_kontak_componen
          type="kontak"
          conditions={contact_condition.value}
        />
      ),
      name: "Contacts",
      title: "Contacts",
    },
    {
      element: (
        <Special_price_kontak_componen
          type="location"
          conditions={location_condition.value}
        />
      ),
      name: "Location",
      title: "Location",
    },
    {
      element: (
        <Special_price_quantity_componen
          initaial_value={parseInt(quantity.value.value)}
          onChange={(value) => (quantity.value!.value = value.toString())}
        />
      ),
      name: "Minimum Quantity",
      title: "Minimum Quantity",
    },
  ];
};

const fetchInitialData = async () => {
  loadingGetEditData.value = true;

  try {
    const response = await useFetchApi<BaseResponse<Pricetag>>(
      `/pricetag-read/${id.value}`,
      "pricetag-detail",
      "get",
      null
    );

    if (response.status.value == "success") {
      const pricetagEdit = response.data.value?.data as Pricetag;

      const dateViewStart = new Date(pricetagEdit.start_date * 1000);
      const dateViewEnd =
        pricetagEdit.end_date > 0
          ? new Date(pricetagEdit.end_date * 1000)
          : null;

      ruleForm.unique_id = pricetagEdit.unique_id;
      ruleForm.name = pricetagEdit.name;
      ruleForm.code = pricetagEdit.name;
      ruleForm.owner_id = pricetagEdit.owner_id;
      ruleForm.owner_name = pricetagEdit.owner?.name ?? "";
      ruleForm.to_id = pricetagEdit.to_id;
      ruleForm.to_name = pricetagEdit.to?.name;
      ruleForm.location_id = pricetagEdit.location_id;
      ruleForm.start_date = dateViewStart.getTime();
      ruleForm.reference = pricetagEdit.reference;
      ruleForm.reference_id = pricetagEdit.reference_id;
      if (dateViewEnd != null) {
        ruleForm.end_date = dateViewEnd.getTime();
      }
      // ruleForm.start_date_view = dateViewStart.toString();
      // if(pricetagEdit.end_date > 0){
      //   ruleForm.end_date_view = dateViewEnd!.toString();
      // }
      ruleForm.owner_id = pricetagEdit.owner_id;
      ruleForm.owner_name = pricetagEdit.owner?.name ?? "";
      ruleForm.created_at = pricetagEdit.created_at;
      ruleForm.created_by = pricetagEdit.created_by;
      ruleForm.updated_at = pricetagEdit.updated_at;
      ruleForm.version = pricetagEdit.version;

      ruleForm.pricetag_item = pricetagEdit.pricetag_item.map((value) => {
        const parsed = parseCurrencyID(`${value.price}`);
        return {
          ...value,
          price: parsed,
          displayPrice: formatCurrencyID(parsed),
          item_name: value.catalogue?.name ?? "",
          sn: value.catalogue?.sn ?? "N/A",
          is_new: false,
        };
      });

      console.log("pricetag item", ruleForm.pricetag_item);
      ruleForm.pricetag_condition = pricetagEdit.pricetag_condition;
      ruleForm.location = pricetagEdit.location;
      ruleForm.pic_id = pricetagEdit.pic_id;
      ruleForm.pic_name = pricetagEdit.pic_name;
      ruleForm.pic_version = pricetagEdit.pic_version;
      ruleForm.subject = pricetagEdit.subject;

      pricetagEdit.pricetag_condition.forEach((value) => {
        if (value.variable_pricetag?.name == VariablePriceTag.KONTAK) {
          console.log(value.value_data);
          contact_condition.value.push({
            ...value,
            value_display: value.value_data?.name ?? "",
            is_new: false,
          });
        } else if (value.variable_pricetag?.name == VariablePriceTag.LOCATION) {
          location_condition.value.push({
            ...value,
            ...value,
            value_display: value.value_data?.name ?? "",
            is_new: false,
          });
        } else if (
          value.variable_pricetag?.name == VariablePriceTag.ITEM_QUANTITY
        ) {
          quantity.value = value;
          quantity.value.is_new = false;
        }

        // initialSpecialPrice();
      });

      fileList.value = pricetagEdit.files.map((file: AppFile) => ({
        name: file.filename_original || "",
        url: `${baseImageURL}${file.image_path}/${file.filename}`,
        // status: 'success', // status penting untuk menunjukkan file sudah terupload
        // response: file, // simpan response original jika diperlukan
      }));

      references.value = (
        pricetagEdit.reference_transaction_adjustment ?? []
      ).map((ref) => ({
        ...ref,
        adjustment: ref.adjustments_transaction,
      }));
      console.log("reference", references.value);
      termOfPayments.value = pricetagEdit.payment_terms ?? [];

      initialSpecialPrice();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loadingGetEditData.value = false;
  }
};

const fetchCanvassing = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${canvassing_id.value}`,
      "detail-canvassing",
      "get",
      null
    );

    if (response.status.value == "success") {
      const canvassing: Canvassing | null = response.data.value?.data ?? null;
      console.log("data RAB", canvassing);
      if (canvassing) {
        ruleForm.reference = ReferencePriceTag.CANVASSING;
        ruleForm.reference_id = canvassing.unique_id;
        ruleForm.reference_version = canvassing.version;
        ruleForm.start_date_view = (Date.now() / 1000).toString();
        ruleForm.type = "out";
        ruleForm.to_id = canvassing.source?.request_to?.unique_id;
        ruleForm.to_name = canvassing.source?.request_to?.name;
        ruleForm.to_version = canvassing.source?.request_to?.version;
        ruleForm.to = canvassing.source?.request_to;

        if (canvassing.source) {
          ruleForm.pic_id = canvassing.source?.request_by?.unique_id;
          ruleForm.pic_name = canvassing.source?.request_by?.name;
          ruleForm.pic_version = canvassing.source?.request_by?.version;
        }
        ruleForm.pricetag_item = [];
        canvassing.canvassing_item.forEach((element) => {
          element.canvassing_vendor.forEach((cvendor) => {
            if (cvendor.status == CanvassingVendorStatus.SELECTED) {
              // console.log(
              //   "canvassing vendor selected",
              //   cvendor.catalogue?.name
              // );

              ruleForm.pricetag_item.push({
                unique_id: null,
                tag_id: null,
                catalogue: cvendor.catalogue ?? null,
                catalogue_id: cvendor.catalogue_id,
                inventory_id: "",
                inventory: null,
                price: element.unit_selling_price,
                displayPrice: formatCurrencyID(element.unit_selling_price),
                is_new: true,
                unit_id: cvendor.unit_id,
                unit_name: cvendor.unit_name,
                unit_version: cvendor.unit_version,
                sn: cvendor.catalogue?.sn ?? "N/A",
                checked: false,
                item_name: cvendor.catalogue?.name ?? "",
                quantity: 1,
                fileUploads: [],
              });
            }
          });
        });

        references.value = (canvassing.reference_transaction ?? []).map(
          (ref) => ({
            ...ref,
            unique_id: "",
            reference: ReferenceAdjustment.OFFER,
            adjustment: ref.adjustments_transaction,
          })
        );

        termOfPayments.value = (canvassing.payment_terms ?? []).map((ref) => ({
          ...ref,
          unique_id: "",
          reference: TermOfPaymentReference.OFFER,
          unique_code: "",
        }));
        console.log("payment terms", termOfPayments.value);
        // console.log("references", canvassing.reference_transaction);

        // ruleForm.pricetag_item = canvassing.canvassing_item.map((item) => ({
        //   unique_id: null,
        //   tag_id: null,
        //   catalogue: item.catalogue ?? null,
        //   catalogue_id: item.catalogue_id,
        //   inventory_id: "",
        //   inventory: null,
        //   price: item.unit_selling_price,
        //   displayPrice: formatCurrencyID(item.unit_selling_price),
        //   is_new: true,
        //   unit_id: item.unit_id,
        //   unit_name: item.unit_name,
        //   unit_version: item.unit_version,
        //   sn: item.catalogue?.sn ?? "N/A",
        //   checked: false,
        //   item_name: item.catalogue?.name ?? "",
        //   quantity: 1,
        //   fileUploads: [],
        // }));

        contact_condition.value.push({
          operation: "is_equal",
          variable: VariablePriceTag.KONTAK,
          unique_id: null,
          tag_id: null,
          value: `${canvassing.source?.request_by?.unique_id}`,
          value_display: `${canvassing.source?.request_by?.name}`,
          variable_pricetag: {
            unique_id: "",
            name: VariablePriceTag.KONTAK,
            type: "variable",
            slug: "",
          },
          operation_pricetag: {
            unique_id: "",
            name: OperationPriceTag.IS_EQUAL,
            type: "operation",
            slug: "",
          },
        });
      }
    }
  } catch (error) {
    ElMessage.error("Failed to fetch canvassing data");
    console.error(error);
    goBack();
  } finally {
    loading.value = false;
  }
};

const initialSetting = () => {
  const store = localStorage.getItem("setting");
  if (store) {
    const setting: {
      company: Contact;
      address: AddressType;
    } = JSON.parse(store);
    console.log("type", ruleForm.type);
    if (ruleForm.type == "in") {
      ruleForm.to = setting.company;
      ruleForm.to_id = setting.company.unique_id;
      ruleForm.to_version = setting.company.version;
      ruleForm.to_name = setting.company.name;
    } else {
      ruleForm.owner = setting.company;
      ruleForm.owner_id = setting.company.unique_id;
      ruleForm.owner_name = setting.company.name;
    }

    console.log("rule form", ruleForm);
  }
};

onMounted(() => {
  loadingGetEditData.value = false;
  if (canvassing_id.value) {
    fetchCanvassing();
  }

  if (id.value) {
    fetchInitialData();
  } else {
    initialSpecialPrice();
    initialSetting();
  }
});
</script>
