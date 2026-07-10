<template>
  <TrumsWrapper>
    <div v-if="!props.dataInterface.pending && props.dataInterface.data">
      <el-card class="my-3" shadow="never">
        <template #header>
          <div class="flex justify-end items-center" v-if="isMobile">
            <el-dropdown @command="handleMenuCommand">
              <span class="el-dropdown-link">
                <el-icon><MoreFilled /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="'edit'">Edit</el-dropdown-item>
                  <el-dropdown-item :command="'canvassing'"
                    >Canvassing</el-dropdown-item
                  >
                  <el-dropdown-item
                    :command="'delete'"
                    class="delete-menu-dropdown"
                    >Hapus</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <!-- <div v-if="isMobile" class="flex justify-end"> -->

          <!-- <TrumsCustomButton
              :loading="loading"
              :type="'default'"
              :disabled="loading"
              :is-circle="true"
              @click="fetchInquiry"
            >
              <el-icon><Eleme /></el-icon>
            </TrumsCustomButton>
            <TrumsCustomButton
              :loading="loading"
              :type="'danger'"
              :disabled="loading"
              :is-circle="true"
              @click="confirmDelete"
            >
              <el-icon><Delete /></el-icon>
            </TrumsCustomButton>

            <TrumsCustomLinkButton
              :is-circle="true"
              :url="`/sales/inquiry/add?id=${inquiryData?.unique_id}`"
              :type="'warning'"
            >
              <el-icon><Edit /></el-icon>
            </TrumsCustomLinkButton>
            <TrumsCustomLinkButton
              :is-circle="true"
              :url="`/sales/canvassing/add?inquiry_id=${inquiryData?.unique_id}`"
              :type="'primary'"
            >
              <el-icon><List /></el-icon>
            </TrumsCustomLinkButton>

            <el-button
              type="primary"
              :disabled="loading"
              :loading="loading"
              v-if="inquiryData?.status === InquiryStatus.APPROVE"
              @click="markAsCompleted"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Completed
            </el-button> -->
          <!-- </div> -->
          <div v-else class="flex justify-end">
            <el-button
              type="default"
              :icon="Refresh"
              :disabled="loading"
              :loading="loading"
              @click="fetchInquiry"
              >Reload</el-button
            >
            <el-button
              type="danger"
              :disabled="loading"
              :loading="loading"
              :icon="Delete"
              @click="confirmDelete"
              >Hapus</el-button
            >
            <NuxtLink
              :disabled="loading"
              :loading="loading"
              :to="`/sales/inquiry/add?id=${inquiryData?.unique_id}`"
              class="el-button el-button--warning"
            >
              <el-icon class="me-2"><Edit /></el-icon> Edit
            </NuxtLink>

            <el-button
              type="primary"
              :loading="loading"
              :disabled="loading"
              @click="canvassingClick"
            >
              Canvassing
            </el-button>

            <el-button
              type="primary"
              :disabled="loading"
              :loading="loading"
              v-if="inquiryData?.status === InquiryStatus.APPROVE"
              @click="markAsCompleted"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Completed
            </el-button>
          </div>
        </template>
        <div :class="`flex ${isMobile ? 'flex-col' : ''} gap-3 my-3`">
          <div class="flex-1">
            <el-descriptions
              title=""
              :column="1"
              size="small"
              :label-width="isMobile ? 100 : 0"
              :border="isMobile ? false : true"
            >
              <el-descriptions-item
                label="Prioritas"
                :label-width="isMobile ? 100 : 0"
                >{{ inquiryData?.priority.toUpperCase() }}</el-descriptions-item
              >
              <el-descriptions-item
                label="Tanggal"
                :label-width="isMobile ? 100 : 0"
                >{{ formatLocalDate(inquiryData!.date!) }}</el-descriptions-item
              >
            </el-descriptions>
          </div>
          <div class="flex-1">
            <el-descriptions
              title=""
              :column="1"
              size="small"
              :border="isMobile ? false : true"
            >
              <el-descriptions-item
                label="Diminta Oleh"
                :label-width="isMobile ? 100 : 0"
                >{{ inquiryData?.request_to?.name ?? "-" }}
              </el-descriptions-item>
              <el-descriptions-item
                label="PIC"
                :label-width="isMobile ? 100 : 0"
                >{{
                  inquiryData?.request_by?.name ?? "-"
                }}</el-descriptions-item
              >
            </el-descriptions>
          </div>
        </div>

        <el-descriptions title="Alamat" size="small">
          <el-descriptions-item label="">{{
            generateResultSearchAddress(inquiryData?.address ?? null).street
          }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="Note" size="small">
          <el-descriptions-item label="">
            <span
              v-html="`${formattedText(inquiryData?.description ?? '')}`"
            ></span>
          </el-descriptions-item>
        </el-descriptions>
        <h5 class="font-bold text-black text-1xl mt-6">Lampiran</h5>
        <div v-for="(file, key) in dataInterface?.data?.files" :key="key">
          <NuxtLink
            class="text-blue-600 text-sm"
            :href="`${imageUrl}/${file.image_path}/${file.filename}`"
            target="_blank"
            >{{ file.filename_original }}</NuxtLink
          >
        </div>
      </el-card>
      <el-card shadow="never">
        <h1 class="mb-4">Item Permintaan</h1>
        <el-row :gutter="20" class="mb-3">
          <el-col :sm="24" :md="4">
            <el-input
              v-model="request_sugestion_item.keyword"
              size="default"
              placeholder="Type to search"
              ><template #prefix>
                <el-icon class="el-input__icon"><Search /></el-icon> </template
            ></el-input>
          </el-col>
        </el-row>
        <customTable
          @sort-change="onSort"
          :columns="availableColumn"
          :data="data?.data ?? []"
          :table-props="{
            lazy: true,
            load: onLoadVendors,
            rowKey: 'item_request_id',
            treeProps: {
              children: 'children',
              hasChildren: 'hasChildren',
            },
          }"
        />
        <div class="flex justify-end mt-5">
          <div class="flex justify-end mt-3">
            <el-pagination
              background
              :layout="`prev, pager, next, ${isMobile ? '' : 'sizes, total'}`"
              :total="data?.total_data"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              :size="isMobile ? 'small' : 'default'"
            />
          </div>
        </div>
      </el-card>
    </div>
  </TrumsWrapper>

  <el-image-viewer
    v-if="previewImage"
    show-progress
    :url-list="fileList"
    @close="previewImage = false"
  >
    <template #viewer-error="{ activeIndex, src }">
      <div class="image-slot viewer-error">
        <el-icon><icon-picture /></el-icon>
        <span>
          this is viewer-error slot. current index: {{ activeIndex }}. src:
          {{ src }}
        </span>
      </div>
    </template>
  </el-image-viewer>

  <el-dialog
    v-model="visibleApproveDialog"
    title="Approve Inquiry!"
    width="500"
  >
    <el-form :model="approveForm" :label-position="formApproveLabel">
      <el-form-item label="Catatan" prop="note">
        <el-input v-model="approveForm.note" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleApproveDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitApproval"> Approve </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="visibleRejectDialog" title="Reject Inquiry!" width="500">
    <el-form :model="approveForm" :label-position="formApproveLabel">
      <el-form-item label="Catatan" prop="note">
        <el-input v-model="approveForm.note" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visibleApproveDialog = false">Cancel</el-button>
        <el-button type="danger" @click="rejectApproval"> Submit </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import { NuxtLink } from "#components";
import {
  ElIcon,
  ElImage,
  ElText,
  type CheckboxValueType,
  type Column,
  type FormProps,
  type SortBy,
} from "element-plus";
import { ref, onMounted } from "vue";
import SelectionCell from "~/components/trums/table/SelectionCell.vue";
import type { Contact } from "~/types/contact";
import { InquiryStatus, type Inquiry } from "~/types/inquiry";
import {
  ItemRequestTrailStatus,
  type ItemRequest,
  type ItemRequestTrail,
} from "~/types/item_request";
import type { Maintenance } from "~/types/maintenance";
import type { BaseResponse, DataInterface } from "~/types/response";
import ErrorPage from "~/components/trums/ErrorPage.vue";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import type { Inventory } from "~/types/inventory";
import {
  Delete,
  Upload,
  CircleClose,
  CircleCheck,
  Edit,
  Refresh,
  PictureFilled,
  List,
  Eleme,
  ArrowDown,
  MoreFilled,
  Search,
} from "@element-plus/icons-vue";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import type { AddressType } from "~/types/address";
import { formatLocalDate } from "#imports";
import ItemImageUpload from "./ItemImageUpload.vue";
import { getFirstFileUrl } from "#imports";
import type { ColumnTable } from "~/types/ColumnTable";
import type { CanvassingVendor } from "~/types/scm/canvasing";
import customTable from "~/components/trums/table/customTable.vue";
import type { AppFile } from "~/types/file";
const { isMobile } = useDevice();

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

const props = defineProps<{ dataInterface: DataInterface<Inquiry> }>();

const emit = defineEmits(["onCanvassingClick"]);

definePageMeta({
  middleware: ["auth", "app"],
});
const router = useRouter();
const errorPage = ref<boolean>(false);
const previewImage = ref<boolean>(false);
const initialIndexImage = ref<number>(0);
const activeCollapse = ref<string[]>(["RAB", "SO"]);
const activeNameTab = ref("inquiry");

const visibleApproveDialog = ref<boolean>(false);
const visibleRejectDialog = ref<boolean>(false);
const formApproveLabel = ref<FormProps["labelPosition"]>("top");
const approveForm = reactive({
  note: "",
});

const goBack = () => router.back();

const request_sugestion_item = ref<RequestSearch>({
  table: "inventories",
  keyword: "",
  column: [],
  sort: null,
  offset: "1",
  limit: "10",
});

const releatedItemRequest = ref<ResponsePagination<Inventory[]>>({
  current_page: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 0,
  privilege: [],
});

const currentPage = ref(1);
const pageSize = ref(10);

const inquiryData = ref<Inquiry>(props.dataInterface.data!);
const loading = ref<boolean>(false);
const loadingBook = ref<boolean>(false);

const paginatedItems = computed(() => {
  const items = inquiryData.value?.item_request ?? [];

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return items.slice(start, end);
});

const fileList = ref<string[]>([]);

const query_search_item_request = ref<RequestSearch>({
  column: [
    {
      inquiry_id: [props.dataInterface.data?.unique_id],
    },
  ],
  keyword: "",
  limit: "10",
  offset: "1",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  table: "item_request",
  flag: "form",
});

// const item_request = await useAsyncData("fetch-item-request", async () => {
//   const res = await useFetchApi<ResponsePagination<ItemRequest[]>>(
//     `/search`,
//     "fetch-item-request",
//     "post",
//     query_search_item_request.value
//   );
//   return res.data.value;
// });

interface CanvassingVendorFetch {
  total_canvassing_vendor: number;
  data_canvassing_vendor: CanvassingVendor[];
}
interface DataRequestItem {
  item_request_id: string;
  inquiry_id: string;
  inquiry_code: string;
  item_name: string;
  request_by: string;
  contact: string;
  pic: string;
  sn: string;
  qty: number;
  unit_name: string;
  vendor: string;
  vendor_name: string;
  children: DataRequestItem[];
  checked?: boolean;
  description: string;
  files: AppFile[];
  hasChildren?: boolean;
}

const tableKey = ref(0);
const items = ref<ResponsePagination<DataRequestItem[]>>({
  success: true,
  current_page: 1,
  total_page: 1,
  total_data: 0,
  data: [],
  privilege: [],
  message: "",
});

const { data, refresh, status } = await useAsyncData<
  ResponsePagination<DataRequestItem[]>
>("fetch-item-request", async () => {
  const res = await useFetchApi<ResponsePagination<ItemRequest[]>>(
    `/search`,
    "fetch-item-request",
    "post",
    query_search_item_request.value
  );
  return {
    success: res.data.value?.success ?? false,
    current_page: res.data.value?.current_page ?? 0,
    total_page: res.data.value?.total_page ?? 0,
    total_data: res.data.value?.total_data ?? 0,
    data: (res.data.value?.data ?? []).map((value) => ({
      item_request_id: `${value.unique_id}___${tableKey.value}`,
      inquiry_id: value.inquiry_id ?? "",
      inquiry_code: value.inquiry?.unique_code ?? "N/A",
      item_name: value.catalogue?.name ?? "",
      request_by: value.inquiry?.request_by?.name ?? "",
      contact: `${value.inquiry?.request_to?.name} ${
        value.inquiry?.request_by?.name
          ? "(" + value.inquiry?.request_by?.name + ")"
          : ""
      }`,
      pic: value.inquiry?.request_to?.name ?? "",
      sn: value.catalogue?.sn ?? "N/A",
      qty: value.request_qty ?? 0,
      unit_name: value.unit_name ?? "",
      vendor: `${value.total_canvassing_vendor ?? 0}`,
      vendor_name: "",
      description: value.description || "",
      files: [...(value.catalogue?.files ?? []), ...(value.files ?? [])],
      hasChildren: (value.total_canvassing_vendor || 0) > 0 ? true : false,
      children: [],
    })),
    privilege: res.data.value?.privilege ?? [],
    message: res.data.value?.message ?? "",
  };
});

const handlePageChange = (page: number) => {
  query_search_item_request.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  query_search_item_request.value.limit = `${size}`;
};

const availableColumn: ColumnTable<DataRequestItem>[] = [
  {
    title: "Nama Item",
    dataKey: "catalogue_name",
    key: "catalogue_name",
    fixed: true,
    sortable: true,
    width: isMobile ? 200 : 0,
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <ElText truncated>{rowData.item_name ?? "Tidak Ada"}</ElText>
    ),
  },
  {
    title: "IMG",
    dataKey: "image",
    key: "image",
    width: isMobile ? 50 : 80,
    align: "center",
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) =>
      getFile(rowData.files) != "" ? (
        <ItemImageUpload
          modelValue={rowData.files!}
          image-url={getFirstFileUrl(rowData.files)}
          show-text={false}
          onOpen-modal={() => {
            fileList.value = getFilesUrl(rowData.files);
            initialIndexImage.value = 0;
            previewImage.value = true;
          }}
        />
      ) : (
        <ElIcon>
          <PictureFilled />
        </ElIcon>
      ),
  },
  {
    title: "PN",
    dataKey: "pn",
    key: "pn",
    width: 200,
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.sn ?? "N/A"}</p>
    ),
  },
  {
    title: "QTY",
    dataKey: "quantity",
    key: "quantity",
    width: 100,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.qty ?? "0"}</p>
    ),
  },

  {
    title: "UoM",
    dataKey: "uom",
    key: "uom",
    width: 100,
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.unit_name ?? "-"}</p>
    ),
  },
  {
    title: "Deskripsi",
    dataKey: "description",
    key: "description",
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.description ?? "N/A"}</p>
    ),
  },
  {
    title: "Vendor",
    dataKey: "",
    key: "",
    align: "center",
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.vendor_name ?? 0}</p>
    ),
  },
  {
    title: "Harga",
    dataKey: "total_canvassing_vendor",
    key: "total_canvassing_vendor",
    align: "center",
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: DataRequestItem }) => (
      <p>{rowData.vendor == "0" ? "Belum ada harga" : ""}</p>
    ),
  },
];

watch(
  () => query_search_item_request.value,
  () => refresh(),
  { deep: true, immediate: true }
);

const confirmDelete = () => {
  ElMessageBox.confirm(
    "Inquiry akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      handleSubmitDelete([inquiryData.value?.unique_id ?? ""]);
    })
    .catch(() => {
      // Cancel
    });
};

const generateResultSearchAddress = (address: AddressType | null) => {
  if (address) {
    const name = `(${address.contact_name})`;
    const street = `${address.street}, ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
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

const handleMenuCommand = (command: string) => {
  switch (command) {
    case "canvassing":
      window.location.href = `/sales/canvassing/add?inquiry_id=${inquiryData?.value?.unique_id}`;
    case "edit":
      window.location.href = `/sales/inquiry/add?id=${inquiryData?.value?.unique_id}`;
    case "delete":
      confirmDelete();
    default:
      return;
  }
};

const getFile = (files: AppFile[]) => {
  if (files != null && files!.length > 0) {
    return `${imageUrl}/${files![0].image_path}/${files![0].filename}`;
  } else {
    return "";
  }
};
const getFilesUrl = (files: AppFile[]): string[] => {
  if (files != null && files!.length > 0) {
    return files.map(
      (file) => `${imageUrl}/${file.image_path}/${file.filename}`
    );
  } else {
    return [""];
  }
};

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi(
      "/inquiries-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      goBack();
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const onSort = (sortBy: { order: string; prop: string }) => {
  query_search_item_request.value.sort = {
    column: sortBy.prop,
    order:
      sortBy.order === OrderColumn.ASCENDING
        ? OrderColumn.ASC.toLowerCase()
        : OrderColumn.DESC.toLowerCase(),
  };
};

const onLoadVendors = async (
  row: DataRequestItem,
  treeNode: unknown,
  resolve: (data: DataRequestItem[]) => void
) => {
  try {
    console.log();
    const item_request_id = row.item_request_id.split("___")[0];

    const response = await useFetchApi<BaseResponse<CanvassingVendorFetch>>(
      `/canvassing-vendor/${item_request_id}`,
      "fetch-vendor-list",
      "post",
      {
        sort: {
          column: "total_price",
          order: (
            query_search_item_request.value.sort?.order || "DESC"
          ).toLocaleLowerCase(),
        },
      }
    );
    if (response.status.value == "success") {
      const data: DataRequestItem[] = (
        response.data.value?.data?.data_canvassing_vendor ?? []
      ).map((value) => ({
        item_request_id: "",
        inquiry_id: "",
        inquiry_code: "",
        item_name: value.catalogue?.name ?? "",
        request_by: value.vendor?.name ?? "",
        contact: value.vendor?.name ?? "N/A",
        pic: "",
        sn: "",
        qty: value.quantity ?? 0,
        unit_name: value.unit_name ?? "",
        vendor: currency(value.total_price),
        vendor_name: value.vendor?.name ?? "",
        description: value.notes,
        files: [],
        children: [],
      }));
      resolve(data);
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  }
};

const findRelatedByRequest = (catalogue_id: string): Inventory[] => {
  console.log("catalogue : ", catalogue_id);
  return releatedItemRequest.value.data.filter(
    (value) => value.catalogue_id === catalogue_id
  );
};

watchDebounced(
  request_sugestion_item.value,
  () => {
    // invoices.value.currentPage = 1
    fetchRelatedData();
  },
  { debounce: 500 }
);

const approveInquiry = () => {
  visibleApproveDialog.value = true;
};
const cancelInquiry = () => {
  visibleRejectDialog.value = true;
};

const submitForApproval = async () => {
  await updateStatus(InquiryStatus.WAITING);
};

const submitApproval = async () => {
  await updateStatus(InquiryStatus.APPROVE, approveForm.note);
  visibleApproveDialog.value = false;
  approveForm.note = "";
};
const rejectApproval = async () => {
  await updateStatus(InquiryStatus.CANCEL, approveForm.note);
  visibleRejectDialog.value = false;
  approveForm.note = "";
};

const markAsCompleted = async () => {
  await updateStatus(InquiryStatus.DONE);
};

const updateStatus = async (status: InquiryStatus, note: string = "") => {
  if (!inquiryData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", `${inquiryData.value.unique_id}`);
    formData.append("status", status);
    // if (note) {
    //   formData.append('additional_', note)
    // }

    // (inquiryData.value.purchase_order_item ?? []).forEach((item: PurchaseOrderItem, index: number) => {
    // formData.append(`item[${index}][unique_id]`, item.unique_id)
    // formData.append(`item[${index}][quantity]`, `${item.quantity}`)
    // formData.append(`item[${index}][item_request_trail_id]`, `${item.item_request_trail_id}`)

    // if(status == PurchaseOrderStatus.PENDING_APPROVAL){
    //     formData.append(`item[${index}][status]`, `${PurchaseOrderItemStatus.PENDING_APPROVAL}`)
    // }else{
    //     formData.append(`item[${index}][status]`, `${item.status}`)
    // }

    // })

    const response = await useFetchApi<BaseResponse<Inquiry>>(
      "/inquiries-create",
      "update-status",
      "post",
      formData
    );

    if (response.status.value === "success") {
      inquiryData.value.status = status;
      ElMessage.success("Status berhasil diupdate");
      // await fetchInquiry() // Refresh data
    }
  } catch (error) {
    ElMessage.error("Gagal mengupdate status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const formattedText = (text: string) => {
  return text.replace(/\n/g, "<br>");
};

const fetchRelatedData = async () => {
  console.log("call");
  if (!inquiryData) return;

  try {
    // Fetch related purchase orders
    const inventoriesResponse = await useFetchApi<
      ResponsePagination<Inventory[]>
    >(`/search`, "related-item-request", "post", request_sugestion_item.value);

    if (inventoriesResponse.status.value === "success") {
      releatedItemRequest.value = inventoriesResponse.data.value || {
        current_page: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
      };
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  }
};

const fetchInquiry = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${inquiryData.value.unique_id}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        inquiryData.value = inquiry.data.value!.data;

        request_sugestion_item.value.column = [
          {
            catalogue_id: (inquiryData.value?.item_request ?? []).map(
              (value) => value.catalogue_id
            ),
          },
        ];
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const onCheckout = async () => {
  loading.value = true;
  try {
    const to: { name: string; version: number; unique_id: string } = {
      name: "",
      unique_id: "",
      version: 1,
    };
    if (inquiryData.value!.reference == "non_maintenance") {
      to.name = (inquiryData.value!.reference_data as Contact).name;
      to.version = (inquiryData.value!.reference_data as Contact).version;
      to.unique_id = (inquiryData.value!.reference_data as Contact).unique_id;
    } else if (inquiryData.value!.reference == "maintenance") {
      to.name =
        (inquiryData.value!.reference_data as Maintenance).inspection_item
          ?.inventories?.catalogue?.name ?? "";
      to.version = (inquiryData.value!.reference_data as Maintenance).version;
      to.unique_id = (
        inquiryData.value!.reference_data as Maintenance
      ).unique_id;
    }
    const data = {
      type: "out",
      reference: "inquiry",
      reference_id: inquiryData.value!.unique_id,
      from: inquiryData.value!.location_id,
      from_name: inquiryData.value!.location?.name,
      from_version: inquiryData.value!.location?.version,
      to: to.unique_id,
      to_name: to.name,
      to_version: to.version,
      status: "waiting",
      // "address_id": "",
      // "address_version": 0,
      // "delivery_id": "",
      // "schedule_date": 0,
      // "source_document": "",
      movement_item: inquiryData.value!.item_request.map((value) => {
        return {
          inventory_id: value.inventory_id,
          quantity: value.request_qty,
        };
      }),
    };

    console.log(data);

    // const response = await useFetchApi('/inventory-movement-create', 'inquiry_create', 'post', data);

    const response = await useFetchApi(
      "/inventory-movement-create",
      "inquiry_create",
      "post",
      data
    );

    if (response.status.value == "success") {
      ElMessage.success("Berhasil!");
      await refreshNuxtData("inquiry");
    }
  } catch (error: any) {
    ElMessage.error(`${error.respose?.data?.message}`);
  } finally {
    loading.value = false;
  }
};

const formatItemStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [ItemRequestTrailStatus.WAITING]: "Menunggu Persetujuan",
    [ItemRequestTrailStatus.REJECT]: "Dibatalkan",
    [ItemRequestTrailStatus.DONE]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const getItemStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case ItemRequestTrailStatus.WAITING:
      return "warning";
    case ItemRequestTrailStatus.WAITING:
      return "warning";
    case ItemRequestTrailStatus.DONE:
      return "success";
    case ItemRequestTrailStatus.REJECT:
      return "danger";
    default:
      return "primary";
  }
};

const toBooking = async (
  inventory: Inventory,
  quantity: number,
  item_request_id: string
) => {
  loadingBook.value = true;
  try {
    const response = await useFetchApi<BaseResponse<ItemRequestTrail>>(
      "/item-request-trail-create",
      "item-request-trail-create",
      "post",
      {
        item_request_id: item_request_id,
        reference: "inventory",
        reference_id: inventory.unique_id,
        quantity: quantity,
        status: "done",
      }
    );

    if (response.status.value === "success") {
      ElMessage.error(`Item Berhasil Di Booking!`);
      fetchRelatedData();
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.message ?? error}`);
  } finally {
    loadingBook.value = false;
  }
};

const getSourceRequestLabel = () => {
  if (inquiryData.value!.reference == "non_maintenance") {
    return "Non-maintenance";
  } else if (inquiryData.value!.reference == "maintenance") {
    return "Maintenance";
  } else if (inquiryData.value!.reference == "so") {
    return "Sales Order";
  }
};
const getSourceRequestLink = () => {
  if (inquiryData.value!.reference == "non-maintenance") {
    return `/contact/${
      (inquiryData.value!.reference_data as Contact).unique_id
    }`;
  } else if (inquiryData.value!.reference == "maintenance") {
    return `/maintenance/${
      (inquiryData.value!.reference_data as Maintenance).unique_id
    }`;
  } else if (inquiryData.value!.reference == "so") {
    return `/sales/order/${
      (inquiryData.value!.reference_data as PurchaseOrder).unique_id
    }`;
  }
};
const getSourceRequestNumber = () => {
  if (inquiryData.value!.reference == "non-maintenance") {
    return (inquiryData.value!.reference_data as Contact).unique_code;
  } else if (inquiryData.value!.reference == "maintenance") {
    return (inquiryData.value!.reference_data as Maintenance).unique_code;
  } else if (inquiryData.value!.reference == "so") {
    return (inquiryData.value!.reference_data as PurchaseOrder).unique_code;
  }
};

const canvassingClick = () => {
  emit("onCanvassingClick");
};
</script>

<style scoped>
:deep(.image-viewer-slot) {
  height: 30px !important;
}
:deep(.delete-menu-dropdown) {
  color: #dc2626 !important;
}
:deep(.el-table__cell) {
  padding: 5px !important;
}
/* :deep(.el-table__row--level-0 .cell) {
  padding: 10px;
} */
:deep(.el-table__row--level-0 .cell) {
  display: flex;
  align-items: center;
}
:deep(.el-table__row--level-0 .cell span) {
  display: flex;
  align-items: center;
}
</style>
