<template>
  <div>
    <el-card
      class="my-3"
      shadow="hover"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete"
            >Hapus</el-button
          >
          <NuxtLink
            v-if="purchaseOrderData?.status === PurchaseOrderStatus.DRAFT"
            :to="`/sales/order/add?id=${purchaseOrderData?.unique_id}`"
            class="el-button el-button--default"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <NuxtLink
            :to="`/inventory-management/inqueiries/add?sales_id=${purchaseOrderData?.unique_id}`"
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Buat Inquiry
          </NuxtLink>
          <el-button
            type="success"
            v-if="
              purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
            "
            @click="approvePurchaseOrder"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Setujui
          </el-button>
          <el-button
            type="danger"
            v-if="
              purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
            "
            @click="rejectPurchaseOrder"
          >
            <el-icon class="me-2"><CircleClose /></el-icon> Tolak
          </el-button>
          <el-button
            type="warning"
            v-if="purchaseOrderData?.status === PurchaseOrderStatus.DRAFT"
            @click="submitForApproval"
          >
            <el-icon class="me-2"><Upload /></el-icon> Ajukan Approval
          </el-button>
          <el-button
            type="primary"
            v-if="purchaseOrderData?.status === PurchaseOrderStatus.APPROVED"
            @click="markAsCompleted"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Tandai Sebagai
            Selesai
          </el-button>
          <el-button type="default" :icon="Printer" @click="generatePDF">
            Cetak SO
          </el-button>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Referensi">
              {{ purchaseOrderData?.sourcing_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Nomor SO">
              {{ purchaseOrderData?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Kontak">
              {{ purchaseOrderData?.vendor?.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="PIC">
              {{ purchaseOrderData?.pic_name || "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Tanggal PO">
              {{
                purchaseOrderData?.date != null
                  ? formatLocalDate(purchaseOrderData?.date)
                  : "-"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag
                :type="
                  getStatusTagType(
                    purchaseOrderData?.status || PurchaseOrderStatus.DRAFT
                  )
                "
              >
                {{
                  formatStatus(
                    purchaseOrderData?.status || PurchaseOrderStatus.DRAFT
                  )
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Estimasi Sampai">
              {{
                purchaseOrderData?.expected_arrival != null
                  ? formatLocalDate(purchaseOrderData?.expected_arrival)
                  : "-"
              }}
            </el-descriptions-item>

            <el-descriptions-item label="Tanggal Dibuat">
              {{
                purchaseOrderData?.created_at != null
                  ? formatLocalDate(purchaseOrderData?.created_at)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <h1 class="font-bold">Informasi Tambahan</h1>
      <div
        class="text-sm mt-1"
        v-if="purchaseOrderData?.additional_information"
        v-html="
          `${extractDescription(purchaseOrderData?.additional_information)}`
        "
      ></div>
      <span v-else class="text-sm text-gray-400"
        >Tidak ada informasi tambahan</span
      >
      <!-- <el-descriptions title="Informasi Tambahan">
        <el-descriptions-item label="Tidak ada informasi tambahan">
          <div
            v-if="purchaseOrderData?.additional_information"
            v-html="
              `${formattedText(purchaseOrderData?.additional_information)}`
            "
          ></div>
          <div v-else>Tidak ada informasi tambahan</div>
        </el-descriptions-item>
      </el-descriptions> -->
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Purchase Order Items</span>
        </div>
      </template>
      <el-table :data="purchaseOrderItemsView ?? []" row-key="unique_id" border>
        <el-table-column prop="item_name" label="Item" />
        <el-table-column
          prop="quantity"
          label="QTY"
          align="right"
          :width="70"
        />
        <el-table-column
          prop="unit_name"
          label="UOM"
          align="center"
          width="100"
        />
        <el-table-column
          prop="quo_number"
          label="No.QUO"
          align="center"
          width="200"
        />
        <el-table-column
          prop="harga_quo"
          label="Harga QUO"
          align="right"
          width="150"
        >
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.harga_quo, 0) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="harga_po"
          label="Harga PO"
          align="right"
          width="150"
        >
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.harga_po, 0) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total"
          label="Total Harga"
          align="right"
          width="150"
        >
          <template #default="{ row }">
            {{ currencyWithoutSymbol(row.total, 0) }}
          </template></el-table-column
        >
        <!-- <el-table-column label="Garansi" width="150">
          <template #default="scope">
            {{
              scope.row.is_warranty
                ? `${scope.row.warranty} ${scope.row.warranty_unit}`
                : "Tidak ada"
            }}
          </template>
        </el-table-column>
        <el-table-column label="Diskon" width="150">
          <template #default="scope">
            {{
              scope.row.is_discount
                ? `${scope.row.discount}${
                    scope.row.discount_unit === "percent" ? "%" : ""
                  }`
                : "Tidak ada"
            }}
          </template>
        </el-table-column> -->

        <!-- <el-table-column
          label="Aksi"
          align="center"
          width="300"
          v-if="
            purchaseOrderData?.status === PurchaseOrderStatus.PENDING_APPROVAL
          "
        >
          <template #default="scope">
            <el-button
              type="success"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  purchaseOrderData?.status ===
                    PurchaseOrderStatus.PENDING_APPROVAL)
              "
              @click="() => approveItem(scope.$index)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Approve
            </el-button>
            <el-button
              type="danger"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  purchaseOrderData?.status ===
                    PurchaseOrderStatus.PENDING_APPROVAL)
              "
              @click="() => rejectItem(scope.$index)"
            >
              <el-icon class="me-2"><Close /></el-icon> Reject
            </el-button>
            <el-tag
              v-if="
                scope.row.status !== PurchaseOrderItemStatus.PENDING_APPROVAL
              "
              :type="getItemStatusTagType(scope.row.status)"
            >
              {{ formatStatusItem(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column> -->
      </el-table>

      <div class="flex justify-end mt-3">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="purchaseOrderItem?.data.value?.total_data"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-card class="mb-3" v-if="relatedDocuments.length > 0" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Dokumen Terkait</span>
        </div>
      </template>
      <el-table :data="relatedDocuments" border>
        <el-table-column prop="document_type" label="Jenis Dokumen" />
        <el-table-column prop="document_number" label="Nomor Dokumen" />
        <el-table-column prop="status" label="Status" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <NuxtLink
              :to="scope.row.link"
              class="el-button el-button--primary el-button--small"
            >
              View
            </NuxtLink>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <CustomPaymentTerm
      type="view"
      :data="purchaseOrderData?.payment_terms ?? []"
    />

    <el-card class="mb-3" shadow="hover">
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" width="300">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="value" align="right" />
      </el-table>
    </el-card>

    <el-dialog
      v-model="visibleApproveDialog"
      title="Approve Purchase Order!"
      width="500"
    >
      <!-- <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form> -->
      Data Yang Sudah Di Setujui Atau Ditolak Tidak Dapat Diubah!
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApproval">
            Approve
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="visibleRejectDialog"
      title="Reject Purchase Order!"
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
          <el-button type="danger" @click="rejectApproval"> Reject </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showPreviewPDF"
      title="Preview PDF"
      width="80%"
      destroy-on-close
    >
      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        width="100%"
        height="600px"
        style="border: none"
      ></iframe>

      <template #footer>
        <el-button @click="showPreviewPDF = false">Tutup</el-button>
        <el-button type="success" @click="downloadPdf">Download PDF</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  Delete,
  Edit,
  CircleCheck,
  Upload,
  Close,
  CircleClose,
  Printer,
} from "@element-plus/icons-vue";
import type { FormProps } from "element-plus";
import {
  PurchaseOrderStatus,
  PurchaseOrderItemStatus,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import type { BaseResponse } from "~/types/response";
import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { formatLocalDate, currency, formattedText } from "#imports";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import {
  CanvassingVendorStatus,
  type Canvassing,
  type CanvassingItem,
} from "~/types/scm/canvasing";
import { OrderColumn, type RequestSearch } from "~/types/request_search";
import type { ResponsePagination } from "~/types/response_pagination";
import { currencyWithoutSymbol } from "#imports";
import type { Permission } from "~/types/menu";
import { extractDescription } from "#imports";
import type { TrumDoc } from "~/types/document";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

definePageMeta({
  middleware: ["auth", "app"],
});

const props = defineProps<{
  purchaseOrder: PurchaseOrder;
  privillage?: Permission[];
}>();

const visibleApproveDialog = ref<boolean>(false);
const visibleRejectDialog = ref<boolean>(false);
const router = useRouter();
const route = useRoute();
const purchaseOrderId = ref<string>(route.params.id as string);

const formApproveLabel = ref<FormProps["labelPosition"]>("top");
const svg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`;

type PurchasOrderViewTree = {
  unique_id: string;
  item_name: string;
  item_id: string;
  quo_id: string;
  canvassing_id: string;
  canvassing_code: string;
  quantity: number;
  unit_name: string;
  quo_number: string;
  harga_quo: number;
  harga_po: number;
  total: number;
  children: PurchasOrderViewTree[];
};

const request_search_po_item = ref<RequestSearch>({
  keyword: "",
  column: [],
  limit: "10",
  offset: "1",
  table: "purchase_order_item",
  sort: {
    column: "created_at",
    order: OrderColumn.DESC,
  },
  flag: "list",
});

const loadingDocument = ref<boolean>(false);
const showPreviewPDF = ref(false);
const pdfUrl = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);
const loading = ref(false);
const purchaseOrderData = ref<PurchaseOrder | null>(props.purchaseOrder);

const purchaseOrderItem = await useAsyncData("fetch-inquiries", async () => {
  let res: ResponsePagination<PurchaseOrderItem[]> = {
    success: false,
    current_page: 0,
    total_page: 0,
    total_data: 0,
    data: [],
  };
  console.log("fetch ", request_search_po_item.value.column);
  if (request_search_po_item.value.column.length > 0) {
    const response = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      "fetch-order-item",
      "post",
      request_search_po_item.value
    );

    res = response.data.value ?? {
      success: false,
      current_page: 0,
      total_page: 0,
      total_data: 0,
      data: [],
    };
  }

  return res;
});

watch(
  () => request_search_po_item.value,
  () => purchaseOrderItem.refresh(),
  { deep: true }
);
watch(
  () => purchaseOrderData.value,
  (newValue) => {
    request_search_po_item.value.column = [
      {
        order_id: [newValue?.unique_id],
      },
    ];
  },
  { immediate: true }
);

const handlePageChange = (page: number) => {
  request_search_po_item.value.offset = `${page}`;
};

const handleSizeChange = (size: number) => {
  request_search_po_item.value.limit = `${size}`;
};

const purchaseOrderItemsView = ref<PurchasOrderViewTree[]>([]);
const relatedDocuments = ref<any[]>([]);
const approveForm = reactive({
  note: "",
});

const goBack = () => router.back();

// Fetch purchase order data
const fetchPurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderData.value = response.data.value!.data!;
      //   await fetchPurchaseOrderItems()
      //   await fetchRelatedDocuments()
    }
  } catch (error) {
    ElMessage.error("Gagal mengambil data purchase order");
    goBack();
  } finally {
    loading.value = false;
  }
};

const formatStatusItem = (status: PurchaseOrderItemStatus) => {
  if (status === PurchaseOrderItemStatus.DRAFT) {
    return "DRAFT";
  } else if (status === PurchaseOrderItemStatus.DONE) {
    return "APPROVE";
  } else if (status === PurchaseOrderItemStatus.CANCELLED) {
    return "REJECTED";
  } else {
    return status;
  }
};

const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      (ref.adjustment ?? ref.adjustments_transaction!).category == "tax" &&
      (ref.adjustment ?? ref.adjustments_transaction!).name.toLowerCase() ===
        "ppn"
    ) {
      const dpp: ReferenceTransactionAdjustment | undefined = (
        purchaseOrderData.value?.reference_transaction ?? []
      ).find(
        (value) =>
          (value.adjustment ?? value.adjustments_transaction!).unique_code ==
          "DPPL"
      );
      if (dpp) {
        const dppValue = getDPPFormula(dpp, subtotal.value || 0);
        return getPPNFormula(ref, dppValue || subtotal.value);
      } else {
        return getPPNFormula(ref, subtotal.value);
      }
    } else {
      if (
        (ref.adjustment ?? ref.adjustments_transaction!).operator == "minus"
      ) {
        console.log("");
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, totalPrice.value || 0);
      } else if (
        (ref.adjustment ?? ref.adjustments_transaction!).operator == "plus"
      ) {
        return ref.type == "amount"
          ? ref.amount
          : displayAmount(ref, subtotal.value || 0);
      }
    }
  }
};

// Fetch related documents
const fetchRelatedDocuments = async () => {
  if (!purchaseOrderData.value) return;

  try {
    const response = await useFetchApi<BaseResponse<any[]>>(
      `/related-documents/${purchaseOrderData.value.unique_id}`,
      "related-documents",
      "get",
      null
    );

    if (response.status.value === "success") {
      relatedDocuments.value = response.data.value?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch related documents", error);
  }
};

const formatStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [PurchaseOrderStatus.DRAFT]: "Baru",
    [PurchaseOrderStatus.PENDING_APPROVAL]: "Menunggu Persetujuan",
    [PurchaseOrderStatus.APPROVED]: "Disetujui",
    [PurchaseOrderStatus.CANCELLED]: "Dibatalkan",
    [PurchaseOrderStatus.COMPLETED]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const formatItemStatus = (status: string | undefined) => {
  if (!status) return "-";

  const statusMap: Record<string, string> = {
    [PurchaseOrderItemStatus.DRAFT]: "Draft",
    [PurchaseOrderItemStatus.PENDING_APPROVAL]: "Menunggu Persetujuan",
    [PurchaseOrderItemStatus.CANCELLED]: "Dibatalkan",
    [PurchaseOrderItemStatus.DONE]: "Selesai",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return "primary";
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return "warning";
    case PurchaseOrderStatus.APPROVED:
      return "success";
    case PurchaseOrderStatus.CANCELLED:
      return "danger";
    case PurchaseOrderStatus.COMPLETED:
      return "primary";
    default:
      return "primary";
  }
};

const getItemStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PurchaseOrderItemStatus.DRAFT:
      return "info";
    case PurchaseOrderItemStatus.PENDING_APPROVAL:
      return "warning";
    case PurchaseOrderItemStatus.DONE:
      return "success";
    case PurchaseOrderItemStatus.CANCELLED:
      return "danger";
    default:
      return "primary";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Actions
const updateStatus = async (status: PurchaseOrderStatus, note: string = "") => {
  if (!purchaseOrderData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", purchaseOrderData.value.unique_id);
    formData.append("status", status);
    // if (note) {
    //   formData.append('additional_', note)
    // }

    (purchaseOrderData.value.purchase_order_item ?? []).forEach(
      (item: PurchaseOrderItem, index: number) => {
        formData.append(`item[${index}][item_id]`, `${item.catalogue_id}`);
        formData.append(`item[${index}][unique_id]`, item.unique_id);
        formData.append(`item[${index}][quantity]`, `${item.quantity}`);
        formData.append(
          `item[${index}][item_request_trail_id]`,
          `${item.item_request_trail_id}`
        );

        if (status == PurchaseOrderStatus.PENDING_APPROVAL) {
          formData.append(
            `item[${index}][status]`,
            `${PurchaseOrderItemStatus.PENDING_APPROVAL}`
          );
        } else {
          formData.append(`item[${index}][status]`, `${item.status}`);
        }
      }
    );

    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      "/purchase-order-create",
      "update-status",
      "post",
      formData
    );

    if (response.status.value === "success") {
      purchaseOrderData.value.status = status;
      ElMessage.success("Status berhasil diupdate");
      await fetchPurchaseOrder(); // Refresh data
    }
  } catch (error) {
    ElMessage.error("Gagal mengupdate status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const approvePurchaseOrder = () => {
  visibleApproveDialog.value = true;
};
const rejectPurchaseOrder = () => {
  visibleRejectDialog.value = true;
};

const submitForApproval = async () => {
  await updateStatus(PurchaseOrderStatus.PENDING_APPROVAL);
};

const submitApproval = async () => {
  await updateStatus(PurchaseOrderStatus.APPROVED, approveForm.note);
  visibleApproveDialog.value = false;
  approveForm.note = "";
};
const rejectApproval = async () => {
  purchaseOrderData.value?.purchase_order_item.forEach((value) => {
    value.quantity = 0;
    value.status = PurchaseOrderItemStatus.DONE;
  });

  await updateStatus(PurchaseOrderStatus.CANCELLED, approveForm.note);
  visibleRejectDialog.value = false;
  approveForm.note = "";
};

const markAsCompleted = async () => {
  await updateStatus(PurchaseOrderStatus.COMPLETED);
};

const approveItem = async (itemIndex: number) => {
  purchaseOrderData.value!.purchase_order_item[itemIndex].status =
    PurchaseOrderItemStatus.DONE;
};

const rejectItem = async (itemIndex: number) => {
  purchaseOrderData.value!.purchase_order_item[itemIndex].status =
    PurchaseOrderItemStatus.CANCELLED;
};

const confirmDelete = () => {
  ElMessageBox.confirm(
    "Purchase order akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      await deletePurchaseOrder();
    })
    .catch(() => {
      // Cancel
    });
};

const deletePurchaseOrder = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/purchase-order-delete/`,
      "delete-purchase-order",
      "post",
      [purchaseOrderData.value?.unique_id]
    );

    if (response.status.value === "success") {
      ElMessage.success("Purchase order berhasil dihapus");
      router.push("/sales/order");
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getMinus = computed(() => {
  var minus = 0;
  (purchaseOrderData?.value?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator == "minus"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        minus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, totalPrice.value);
      }
    });

  return minus;
});
const getPlus = computed(() => {
  var plus = 0;

  (purchaseOrderData?.value?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment ?? value.adjustments_transaction!).category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, subtotal.value);
      }
    });

  return plus;
});

const ppnComponent = computed(() => {
  const ppnComponentRef = getPPNComponent(
    purchaseOrderData.value?.reference_transaction ?? []
  );
  const dppComponent = getDppComponent(
    purchaseOrderData.value?.reference_transaction ?? []
  );
  if (ppnComponentRef) {
    return getPPNFormula(ppnComponentRef!, getDPPNilaiLain.value || 0);
  } else {
    return 0;
  }
});

const grandTotal = computed(() => {
  return subtotal.value + ppnComponent.value;
});

const totalPrice = computed(() => {
  return (purchaseOrderData.value?.purchase_order_item ?? []).reduce(
    (accumulator, currentValue) => {
      return (
        accumulator + (currentValue.po_unit_price ?? 0) * currentValue.quantity
      );
    },
    0
  );
});
const subtotal = computed(() => {
  const sum = totalPrice.value;
  console.log("get minus", getMinus.value);
  return sum + getPlus.value - (getMinus.value || 0);
});

const getDPPNilaiLain = computed(() => {
  let dpp = 0;
  (purchaseOrderData.value?.reference_transaction ?? []).forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction.name.toLowerCase() === "ppn"
    ) {
      console.log("type", element.type);
      if (element.type != "amount" && element.amount == 12) {
        dpp = (subtotal.value * 11) / 12;
        console.log("dpp 12", dpp);
      } else {
        dpp = subtotal.value;
        console.log("dpp 11", dpp);
      }
    }
  });

  return dpp;
});
const getDPPNilaiLainView = computed(() => {
  let dpp = (subtotal.value * 11) / 12;
  // (purchaseOrderData.value?.reference_transaction ?? []).forEach((element) => {
  //   if (
  //     element.adjustments_transaction?.category == "tax" &&
  //     element.adjustments_transaction.name.toLowerCase() === "ppn"
  //   ) {
  //     console.log("type", element.type);
  //     if (element.type != "amount" && element.amount == 12) {
  //       dpp = (subtotal.value * 11) / 12;
  //       console.log("dpp 12", dpp);
  //     } else {
  //       dpp = subtotal.value;
  //       console.log("dpp 11", dpp);
  //     }
  //   }
  // });

  return dpp;
});

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Total Price",
      value: currency(totalPrice.value),
    },
  ];
  (purchaseOrderData.value?.reference_transaction ?? []).forEach((element) => {
    if (element.adjustments_transaction?.category != "tax") {
      tableData.push({
        label: element.adjustments_transaction?.name
          ? `${element.adjustments_transaction?.name}`
          : "-",
        value: currency(displayAmount(element, subtotal.value)),
      });
    }
  });
  tableData.push({
    label: "Subtotal",
    value: currency(subtotal.value),
  });
  if (getDPPNilaiLain.value > 0) {
    tableData.push({
      label: "DPP Nilai Lain",
      value: currency(getDPPNilaiLainView.value),
    });
  }
  (purchaseOrderData.value?.reference_transaction ?? []).forEach((element) => {
    if (
      element.adjustments_transaction?.category == "tax" &&
      element.adjustments_transaction.name.toLowerCase() === "ppn"
    ) {
      tableData.push({
        label: element.adjustments_transaction?.name
          ? `${element.adjustments_transaction?.name}`
          : "-",
        value: currency(displayAmount(element, getDPPNilaiLain.value)),
      });
    }
  });

  tableData.push({
    label: "Grand Total",
    value: currency(grandTotal.value || 0),
  });

  return tableData;
});

const getOrderItem = async () => {};

watch(
  () => purchaseOrderItem.data.value?.data,
  () => {
    purchaseOrderItemsView.value = [];
    (purchaseOrderItem.data.value?.data || []).forEach((element) => {
      let childs: PurchasOrderViewTree[] = [];
      if (canAccess("purchase-order-approve", props.privillage || [], 1)) {
        console.log("pricetag item", element.pricetag_item?.data_reference);
        childs =
          element.pricetag_item?.data_reference == undefined
            ? []
            : (
                (element.pricetag_item?.data_reference as CanvassingItem)
                  .canvassing_vendor ?? []
              )
                .filter(
                  (vendor) => vendor.catalogue_id === element.catalogue_id
                )
                .map((vendor) => ({
                  unique_id: vendor.unique_id || "",
                  item_name: vendor.vendor?.name || "N/A",
                  item_id: vendor.catalogue_id || "",
                  quantity: vendor.quantity || 0,
                  unit_name: vendor.unit_name || "N/A",
                  harga_quo: vendor.selling_price || 0,
                  harga_po: 0,
                  total: vendor.selling_price! * vendor.quantity,
                  quo_number: "",
                  canvassing_code:
                    vendor.canvassing_item?.canvassing?.unique_code ?? "",
                  canvassing_id:
                    vendor.canvassing_item?.canvassing?.unique_code ?? "",
                  quo_id: "",
                  children: [],
                }));

        console.log("children", childs);
      }

      purchaseOrderItemsView.value.push({
        unique_id: element.unique_id,
        item_name: displayCatalogueName(element.catalogue!),
        item_id: element.catalogue_id || "",
        quantity: element.quantity,
        unit_name: element.unit_name || "N/A",
        harga_quo: element.pricetag_item?.price || 0,
        harga_po: element.po_unit_price || 0,
        total: element.total_price || 0,
        quo_number: element.pricetag_item?.pricetag?.unique_code || "",
        canvassing_code:
          (element.pricetag_item?.pricetag?.reference_data as Canvassing)
            .unique_code ?? "",
        canvassing_id:
          (element.pricetag_item?.pricetag?.reference_data as Canvassing)
            .unique_id ?? "",
        quo_id: element.pricetag_item?.pricetag?.unique_id ?? "",
        children: childs,
      });
    });
  },
  {
    immediate: true,
  }
);

async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const printDocument = async (code: string) => {
  const doc = new jsPDF();

  // ================= PAGE SETUP =================
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const colWidth = contentWidth / 3;
  const col1X = margin;
  const col2X = margin + colWidth;
  const col3X = margin + colWidth * 2;

  // ================= LOGO =================
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png");
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png");

  doc.addImage(tmsLogo, "PNG", pageWidth - 50, 15, 40, 25);
  doc.addImage(imgLogo, "PNG", margin, 20, 40, 15);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Order", pageWidth / 2, 50, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica");
  doc.text(`${purchaseOrderData.value?.unique_code}`, pageWidth / 2, 55, {
    align: "center",
  });

  // ================= HEADER GRID =================
  let startY = 70;

  doc.setFontSize(8);

  // ===== VENDOR (LEFT) =====
  doc.setFont("helvetica", "bold");
  doc.text("Customer", col1X, startY);

  doc.setFont("helvetica", "normal");
  doc.text(purchaseOrderData?.value?.vendor_name ?? "-", col1X, startY + 6, {
    maxWidth: colWidth - 5,
  });

  // ===== SHIP TO (MIDDLE) =====
  doc.setFont("helvetica", "bold");
  doc.text("SHIP TO", col2X, startY);

  doc.setFont("helvetica", "normal");
  doc.text(
    purchaseOrderData?.value?.address
      ? `${purchaseOrderData.value.address.street}, ${generateAddressView(
          purchaseOrderData?.value?.address!
        )}`
      : "-",
    col2X,
    startY + 6,
    { maxWidth: colWidth - 5 }
  );

  // ===== INFO GRID (RIGHT) =====
  const gridStartY = startY;
  const gridGapY = 14;
  const gridColGap = colWidth / 2;

  const infoGrid = [
    {
      label1: "PO DATE",
      value1:
        purchaseOrderData?.value?.date != null &&
        purchaseOrderData?.value?.date != undefined
          ? formatLocalDate(purchaseOrderData?.value?.date)
          : "-",
      label2: "No Ref",
      value2: purchaseOrderData?.value?.sourcing_document,
    },
    {
      label1: "TERMS",
      value1: `${purchaseOrderData?.value?.term_payment} ${
        purchaseOrderData?.value?.term_payment === "tempo"
          ? purchaseOrderData?.value?.term_payment_value + " Hari"
          : ""
      }`.toUpperCase(),
      label2: "EXPECTED DATE",
      value2:
        purchaseOrderData?.value?.expected_arrival != null &&
        purchaseOrderData?.value?.expected_arrival != undefined
          ? formatLocalDate(purchaseOrderData?.value?.expected_arrival)
          : "-",
    },
  ];

  infoGrid.forEach((row, i) => {
    const y = gridStartY + i * gridGapY;

    // label kiri
    doc.setFont("helvetica", "bold");
    doc.text(row.label1, col3X, y);

    // label kanan
    doc.text(row.label2, col3X + gridColGap, y);

    // value kiri
    doc.setFont("helvetica", "normal");
    doc.text(String(row.value1 ?? "-"), col3X, y + 6, {
      maxWidth: gridColGap - 2,
    });

    // value kanan
    doc.text(String(row.value2 ?? "-"), col3X + gridColGap, y + 6, {
      maxWidth: gridColGap - 2,
    });
  });

  // ================= ITEMS TABLE =================
  const tableStartY = startY + 35;

  // const rows = (purchaseOrderItemsView.value ?? []).map(
  //   (item: PurchasOrderViewTree, i: number) => [
  //     i + 1,
  //     item.item_name,
  //     item.catalogue?.name,
  //     item.quantity,
  //     item.unit_name,
  //     currencyWithoutSymbol(item.unit_price),
  //     currencyWithoutSymbol(item.total_price),
  //   ]
  // );

  autoTable(doc, {
    startY: tableStartY,
    theme: "grid",
    margin: { left: margin, right: margin },
    head: [["No", "Item", "No.RAB", "Qty", "Unit", "Unit Price", "Amount"]],
    // body: rows,
    styles: { fontSize: 10 },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "left", cellWidth: 15 },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    bodyStyles: {
      lineWidth: 0.1, // border
      lineColor: [0, 0, 0], // warna border
    },
    headStyles: {
      fillColor: [248, 248, 248], // background
      textColor: [0, 0, 0], // warna text
      fontStyle: "bold", // bold
      halign: "center", // center text
      valign: "middle", // vertical align
      lineWidth: 0.1, // border
      lineColor: [0, 0, 0], // warna border
    },
  });

  // ================= SUMMARY =================
  let grandTotal = subtotal.value;
  const summaryRows: any[] = [];

  summaryRows.push([
    { content: "Sub Total", colSpan: 5, styles: { halign: "right" } },
    currencyWithoutSymbol(subtotal.value),
  ]);

  (purchaseOrderData?.value?.reference_transaction ?? []).forEach((el) => {
    summaryRows.push([
      {
        content:
          (el.adjustments_transaction?.name ?? "").toLocaleLowerCase() == "ppn"
            ? `PPN`
            : el.adjustments_transaction?.name ?? "",
        colSpan: 5,
        styles: { halign: "right" },
      },
      currencyWithoutSymbol(displayAmount(el, subtotal.value)),
    ]);
    grandTotal += Number(displayAmount(el, subtotal.value) ?? 0);
  });

  summaryRows.push([
    {
      content: "Total Order",
      colSpan: 5,
      styles: { halign: "right", fontStyle: "bold" },
    },
    currencyWithoutSymbol(grandTotal),
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    margin: { left: margin, right: margin }, // full width
    body: summaryRows,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      5: {
        halign: "right",
        cellWidth: 40, // hanya amount yang di-style
      },
    },
    didParseCell(data) {
      // pastikan label (yang colSpan) rata kanan
      if (data.column.index === 0) {
        data.cell.styles.halign = "right";
      }

      // bold Total Order
      if (data.row.index === summaryRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ================= SIGNATURE =================
  const finalY = (doc as any).lastAutoTable.finalY + 30;

  doc.text("Dibuat Oleh,", margin, finalY);
  doc.text("Disetujui Oleh,", pageWidth - 70, finalY);

  doc.text(
    `${capitalizeWords(purchaseOrderData.value?.people?.name ?? "")}`,
    margin,
    finalY + 30
  );
  doc.line(pageWidth - 70, finalY + 30, pageWidth - margin, finalY + 30);

  // ================= OUTPUT =================
  const blob = doc.output("blob");
  pdfBlob.value = blob;
  pdfUrl.value = URL.createObjectURL(blob);

  return { doc, blob };
};

const generatePDF = async () => {
  loadingDocument.value = true;
  try {
    const req_doc = {
      reference: "so",
      reference_id: purchaseOrderData.value?.unique_id,
    };

    const response = await useFetchApi<BaseResponse<TrumDoc>>(
      "/documents-create",
      "document-create",
      "post",
      req_doc
    );

    console.log("generate", response.status.value);
    if (response.status.value == "success") {
      loadingDocument.value = false;
      const { doc } = await printDocument(
        response.data?.value?.data?.unique_code ?? ""
      );
      const blob = doc.output("blob");
      pdfUrl.value = URL.createObjectURL(blob);
      showPreviewPDF.value = true;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loadingDocument.value = false;
  }
};
const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `${purchaseOrderData.value?.unique_code || "document"}.pdf`;

  // Buat URL object untuk blob
  const url = URL.createObjectURL(pdfBlob.value);

  // Buat anchor element untuk download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // ElMessage.success('PDF berhasil di-download')
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 0.75rem;
}

.my-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.text-large {
  font-size: 1.125rem;
}

.font-600 {
  font-weight: 600;
}

.mr-3 {
  margin-right: 0.75rem;
}
</style>
