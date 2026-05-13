<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Purchase Order - {{ data?.data?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <el-card
      shadow="hover"
      class="my-3"
      v-if="status === 'success'"
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
            :to="`/supply-chain-management/purchase/order/add?id=${data?.data?.unique_id}`"
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button
            type="success"
            v-if="data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL"
            @click="approvePurchaseOrder"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve
          </el-button>
          <el-button
            type="danger"
            v-if="data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL"
            @click="rejectPurchaseOrder"
          >
            <el-icon class="me-2"><CircleClose /></el-icon> REJECT
          </el-button>
          <el-button
            type="warning"
            v-if="data?.data?.status === PurchaseOrderStatus.DRAFT"
            @click="submitForApproval"
          >
            <el-icon class="me-2"><Upload /></el-icon> Submit for Approval
          </el-button>
          <el-button
            type="primary"
            v-if="data?.data?.status === PurchaseOrderStatus.APPROVED"
            @click="markAsCompleted"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Completed
          </el-button>
          <el-button
            type="primary"
            :loading="loadingDocument"
            :loading-icon="Eleme"
            @click="generatePDF"
          >
            <el-icon class="me-2"><Printer /></el-icon> Cetak PO
          </el-button>
        </div>
      </template>

      <h1>Informasi Purchase Order</h1>
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Referensi">
              {{ data?.data?.sourcing_document || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Nomor PO">
              {{ data?.data?.unique_code || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Vendor">
              {{ data?.data?.vendor?.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="Total Harga">
              {{ formatCurrency(grandTotal || 0) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Diskon">
              {{
                data?.data?.is_discount
                  ? `${data?.data?.discount}${
                      data?.data?.discount_unit === "percent" ? "%" : ""
                    }`
                  : "Tidak ada"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag
                :type="
                  getStatusTagType(
                    data?.data?.status || PurchaseOrderStatus.DRAFT
                  )
                "
              >
                {{
                  formatStatus(data?.data?.status || PurchaseOrderStatus.DRAFT)
                }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="Tanggal Dibuat">
              {{
                data?.data?.created_at != null
                  ? formatLocalDate(data?.data?.created_at)
                  : "-"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Informasi Tambahan">
              {{ data?.data?.additional_information ?? "Tidak Ada" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <h1>Informasi Pengiriman</h1>
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Estimasi Tiba">
              {{
                data?.data?.expected_arrival != null
                  ? formatLocalDate(data?.data?.expected_arrival)
                  : "-"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Alamat Pengiriman">
              ({{ data?.data?.address?.address_name }})
              <div class="flex flex-col">
                <span>{{ data?.data?.address?.street }}</span>
                <span>{{ generateAddressViewName(data?.data?.address!) }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Purchase Order Items</span>
        </div>
      </template>
      <el-table :data="data?.data?.purchase_order_item ?? []" border>
        <el-table-column prop="catalogue_name" label="Item" />
        <el-table-column
          prop="quantity"
          label="QTY"
          align="right"
          :width="
            data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL
              ? 200
              : 70
          "
        >
          <template #default="scope">
            <el-input-number
              v-model="scope.row.quantity"
              width="100"
              :min="1"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL)
              "
            />
            <p v-else>
              {{ scope.row.quantity }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          prop="unit_name"
          label="UOM"
          align="center"
          width="100"
        />
        <el-table-column
          prop="unit_price"
          label="Harga Satuan"
          align="right"
          width="150"
        >
          <template #default="scope">
            {{ currency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_price"
          label="Total Harga"
          align="right"
          width="150"
        >
          <template #default="scope">
            {{ currency(scope.row.total_price) }}
          </template>
        </el-table-column>

        <el-table-column
          label="Status"
          align="center"
          width="150"
          v-if="
            data?.data?.status !== PurchaseOrderStatus.PENDING_APPROVAL &&
            data?.data?.status !== PurchaseOrderStatus.DONE
          "
        >
          <template #default="scope">
            <el-tag :type="getItemStatusTagType(scope.row.status)">
              {{ formatItemStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="Aksi"
          align="center"
          width="300"
          v-if="data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL"
        >
          <template #default="scope">
            <el-button
              type="success"
              v-if="
                scope.row.status === PurchaseOrderItemStatus.PENDING_APPROVAL ||
                (scope.row.status === PurchaseOrderItemStatus.DRAFT &&
                  data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL)
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
                  data?.data?.status === PurchaseOrderStatus.PENDING_APPROVAL)
              "
              @click="() => rejectItem(scope.$index)"
            >
              <el-icon class="me-2"><Close /></el-icon> Reject
            </el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </el-card>

    <el-card shadow="hover" class="mb-3" v-if="relatedDocuments.length > 0">
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
      :data="data?.data?.payment_terms ?? []"
      v-if="!loading"
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
      <el-form :model="approveForm" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="approveForm.note" type="textarea" />
        </el-form-item>
      </el-form>
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
  </TrumsWrapper>
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
  Eleme,
} from "@element-plus/icons-vue";
import type { FormProps } from "element-plus";
import {
  PurchaseOrderStatus,
  PurchaseOrderItemStatus,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "~/types/scm/purchase_order";
import type { BaseResponse } from "~/types/response";
import jsPDF from "jspdf";
import type { AddressType } from "~/types/address";
import autoTable from "jspdf-autotable";
import {
  FeeType,
  type ReferenceTransactionAdjustment,
} from "~/types/attribute_adjustment";
import { currency, formatLocalDate } from "#imports";
import type { TrumDoc } from "~/types/document";
import CustomPaymentTerm from "~/components/trums/CustomPaymentTerm.vue";
import { generateAddressViewName } from "#imports";

definePageMeta({
  middleware: ["auth", "app"],
  name: "Purchase Order Detail",
});

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

const loading = ref(false);
const loadingDocument = ref<boolean>(false);
const showPreviewPDF = ref(false);
const pdfUrl = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);
const { data, status, refresh } = await useAsyncData(
  "detail-purchase-order",
  async () => {
    const res = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`,
      "detail-purchase-order",
      "get",
      null
    );
    return res.data.value;
  }
);
const purchaseOrderItems = ref<PurchaseOrderItem[]>([]);
const relatedDocuments = ref<any[]>([]);
const approveForm = reactive({
  note: "",
});

const goBack = () => router.back();

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

// Fetch purchase order items
const fetchPurchaseOrderItems = async () => {
  if (!data.value?.data) return;

  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrderItem[]>>(
      `/purchase-order-items/${data.value?.data.unique_id}`,
      "purchase-order-items",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderItems.value = response.data.value?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch purchase order items", error);
  }
};

// Fetch related documents
const fetchRelatedDocuments = async () => {
  if (!data.value?.data) return;

  try {
    const response = await useFetchApi<BaseResponse<any[]>>(
      `/related-documents/${data.value?.data.unique_id}`,
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
    [PurchaseOrderStatus.DRAFT]: "Draft",
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
      return "info";
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
  if (!data.value?.data) return;

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("unique_id", data.value?.data.unique_id);
    formData.append("status", status);
    // if (note) {
    //   formData.append('additional_', note)
    // }

    (data.value?.data.purchase_order_item ?? []).forEach(
      (item: PurchaseOrderItem, index: number) => {
        formData.append(`item[${index}][unique_id]`, item.unique_id);
        formData.append(`item[${index}][quantity]`, `${item.quantity}`);
        // formData.append(
        //   `item[${index}][item_request_trail_id]`,
        //   `${item.item_request_trail_id}`
        // );

        // if (status == PurchaseOrderStatus.PENDING_APPROVAL) {
        //   formData.append(
        //     `item[${index}][status]`,
        //     `${PurchaseOrderItemStatus.PENDING_APPROVAL}`
        //   );
        // } else {
        //   formData.append(`item[${index}][status]`, `${item.status}`);
        // }
        formData.append(
          `item[${index}][status]`,
          `${PurchaseOrderStatus.DONE}`
        );
      }
    );

    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      "/purchase-order-create",
      "update-status",
      "post",
      formData
    );

    if (response.status.value === "success") {
      data!.value!.data.status = status;
      ElMessage.success("Status berhasil diupdate");
      await refresh(); // Refresh data
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
  data.value?.data?.purchase_order_item.forEach((value) => {
    value.quantity = 0;
    value.status = PurchaseOrderItemStatus.DONE;
  });

  await updateStatus(PurchaseOrderStatus.CANCELLED, approveForm.note);
  visibleRejectDialog.value = false;
  approveForm.note = "";
};

const markAsCompleted = async () => {
  await updateStatus(PurchaseOrderStatus.DONE);
};

const displayPDFAddress = (address: AddressType) =>
  `${address.street}, ${address.village}, ${address.city}, ${address.regency}, ${address.codepos}`;

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
  doc.text("Purchase Order", pageWidth / 2, 50, { align: "center" });

  // ================= HEADER GRID =================
  let startY = 65;

  doc.setFontSize(8);

  // ===== VENDOR (LEFT) =====
  doc.setFont("helvetica", "bold");
  doc.text("VENDOR", col1X, startY);

  doc.setFont("helvetica", "normal");
  doc.text(data.value?.data?.vendor_name ?? "-", col1X, startY + 6, {
    maxWidth: colWidth - 5,
  });

  // ===== SHIP TO (MIDDLE) =====
  doc.setFont("helvetica", "bold");
  doc.text("SHIP TO", col2X, startY);

  doc.setFont("helvetica", "normal");
  doc.text(
    data.value?.data?.address
      ? displayPDFAddress(data.value?.data.address)
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
        data.value?.data?.date != null && data.value?.data?.date != undefined
          ? formatLocalDate(data.value?.data?.date)
          : "-",
      label2: "PO NUMBER",
      value2: data.value?.data?.unique_code,
    },
    {
      label1: "TERMS",
      value1: `${data.value?.data?.term_payment} ${
        data.value?.data?.term_payment === "tempo"
          ? data.value?.data?.term_payment_value + " Hari"
          : ""
      }`.toUpperCase(),
      label2: "EXPECTED DATE",
      value2:
        data.value?.data?.expected_arrival != null &&
        data.value?.data?.expected_arrival != undefined
          ? formatLocalDate(data.value?.data?.expected_arrival)
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

  const rows = (data.value?.data?.purchase_order_item ?? []).map(
    (item: any, i: number) => [
      i + 1,
      item.catalogue?.name,
      item.quantity,
      item.unit_name,
      currency(item.unit_price),
      currency(item.total_price),
    ]
  );

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [["No", "Item", "Qty", "Unit", "Unit Price", "Amount"]],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [220, 220, 220] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "right", cellWidth: 15 },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });

  // ================= SUMMARY =================
  let grandTotal = subtotal.value;
  const summaryRows: any[] = [];

  summaryRows.push([
    { content: "Sub Total", colSpan: 5, styles: { halign: "right" } },
    currency(subtotal.value),
  ]);

  (data.value?.data?.reference_transaction ?? []).forEach((el) => {
    summaryRows.push([
      {
        content:
          (el.adjustments_transaction?.name ?? "").toLocaleLowerCase() == "ppn"
            ? `PPN (${Number(
                displayPercentage(el, subtotal.value) || 0
              ).toFixed(2)}%)`
            : el.adjustments_transaction?.name ?? "",
        colSpan: 5,
        styles: { halign: "right" },
      },
      currency(displayAmount(el, subtotal.value)),
    ]);
    grandTotal += Number(displayAmount(el, subtotal.value) ?? 0);
  });

  summaryRows.push([
    {
      content: "Total Order",
      colSpan: 5,
      styles: { halign: "right", fontStyle: "bold" },
    },
    currency(grandTotal),
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

  doc.text("Prepared By,", margin, finalY);
  doc.text("Approved By,", pageWidth - 70, finalY);

  doc.line(margin, finalY + 20, margin + 60, finalY + 20);
  doc.line(pageWidth - 70, finalY + 20, pageWidth - margin, finalY + 20);

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
      reference: "po",
      reference_id: data.value?.data?.unique_id,
    };

    const response = await useFetchApi<BaseResponse<TrumDoc>>(
      "/documents-create",
      "document-create",
      "post",
      req_doc
    );

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

  const filename = `PO-${data.value?.data?.unique_code || "document"}.pdf`;

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
const subtotal = computed(() => {
  return (data.value?.data?.purchase_order_item ?? []).reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
});

const getPlus = computed(() => {
  var plus = 0;

  (data.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator ==
          "plus" &&
        (value.adjustment ?? value.adjustments_transaction!).category ===
          "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += Number(ref.amount);
      }
    });

  return plus;
});
const dppComponent = computed(() => {
  return (data.value?.data?.reference_transaction ?? []).find(
    (value) =>
      (value.adjustment ?? value.adjustments_transaction!).category ==
        "transform" &&
      (value.adjustment ?? value.adjustments_transaction!).unique_code == "DPPL"
  );
});
const ppnComponent = computed(() => {
  const ppnComponentRef = (data.value?.data?.reference_transaction ?? []).find(
    (value) =>
      (value.adjustment ?? value.adjustments_transaction!).category == "tax" &&
      (
        value.adjustment ?? value.adjustments_transaction!
      ).name.toLowerCase() === "ppn"
  );

  if (ppnComponentRef) {
    return getPPNFormula(ppnComponentRef!, getDPPNilaiLain.value || 0);
  } else {
    return 0;
  }
});

const getMinus = computed(() => {
  var minus = 0;
  (data.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        (value.adjustment ?? value.adjustments_transaction!).operator == "minus"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        console.log("get minus ", ref.type);
        minus +=
          ref.type == FeeType.AMOUNT
            ? Number(ref.amount)
            : displayAmount(ref, subtotal.value);
      }
    });

  return minus;
});
const grandTotal = computed(() => {
  return subtotal.value + getPlus.value + ppnComponent.value - getMinus.value;
});

const getDPPNilaiLain = computed(() => {
  let dpp = 0;
  (data.value?.data?.reference_transaction || []).forEach((element) => {
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

const summeryData = computed(() => {
  const tableData: any[] = [
    {
      label: "Subtotal",
      value: currency(subtotal.value),
    },
  ];

  if (getDPPNilaiLain.value > 0) {
    tableData.push({
      label: "DPP Nilai Lain",
      value: currency(getDPPNilaiLain.value),
    });
  }

  (data.value?.data?.reference_transaction ?? []).forEach((element) => {
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
    } else {
      tableData.push({
        label: element.adjustments_transaction?.name
          ? `${element.adjustments_transaction?.name}`
          : "-",
        value: currency(displayAmount(element, subtotal.value)),
      });
    }
  });

  tableData.push({
    label: "Grand Total",
    value: currency(grandTotal.value || 0),
  });

  return tableData;
});

const approveItem = async (itemIndex: number) => {
  data.value!.data!.purchase_order_item[itemIndex].status =
    PurchaseOrderItemStatus.DONE;
};

const rejectItem = async (itemIndex: number) => {
  data.value!.data!.purchase_order_item[itemIndex].status =
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
      `/purchase-order-delete`,
      "delete-purchase-order",
      "post",
      [data.value?.data?.unique_id]
    );

    if (response.status.value === "success") {
      ElMessage.success("Purchase order berhasil dihapus");
      router.push("/purchase-management/purchase-orders");
    }
  } catch (error) {
    ElMessage.error("Gagal menghapus purchase order");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => refresh();

onMounted(() => {});
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
