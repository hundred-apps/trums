<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Detail Barang {{ checkData?.type == "out" ? "Keluar" : "Masuk" }} |
          {{ checkData?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <movementDetail
      v-if="!pending"
      :check-data="checkData!"
      :inquiry-data="inquiryData"
      :privilages="data?.privilege || []"
      :mode="'edit'"
      :purchase-order-data="purchaseOrderData"
    />
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Download, Eleme, Tickets } from "@element-plus/icons-vue";
import { InquiryReference, TypeInquiry, type Inquiry } from "~/types/inquiry";
import {
  AddressMovementType,
  CategoryMovement,
  type InventoryMovement,
  type InventoryMovementItem,
} from "~/types/inventory_movement";
import type { BaseResponse } from "~/types/response";
import { formatLocalDate, currencyWithoutSymbol, canAccess } from "#imports";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ElLoading } from "element-plus";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import { load } from "@fingerprintjs/fingerprintjs";
import { extractDescription, generateAddressViewName } from "#imports";
import { DocRef, getDocRefLink, type TrumDoc } from "~/types/document";
import type { ItemRequest } from "~/types/item_request";
import movementDetail from "./components/movementDetail.vue";
const showPreviewPDF = ref(false);
const loading = ref(false);
const loadingPO = ref<boolean>(false);
const pdfUrl = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);

const loadingPage = ElLoading.service({
  lock: true,
  text: "Loading",
  background: "rgba(0, 0, 0, 0.7)",
});

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "inventory-movements-read",
  name: "Detail Of Inventory Movement",
});
const router = useRouter();

const goBack = () => router.back();

const id = ref<string>((router.currentRoute.value.params.id as string) ?? "");
const { data, pending } = await useFetchApi<BaseResponse<InventoryMovement>>(
  `/inventory-movement-read/${id.value}`,
  "movement",
  "get",
  null
);
const checkData = (data as Ref<BaseResponse<InventoryMovement> | null>).value
  ?.data;
const privilages =
  (data as Ref<BaseResponse<InventoryMovement> | null>).value?.privilege ?? [];

watch(
  () => pending.value,
  (val) => {
    console.log("val loading", val);
    if (!val) {
      loadingPage.close();
    }
  },
  {
    immediate: true,
  }
);

const onChangeStatus = (val: any) => {
  const formData = new FormData();

  formData.append("unique_id", `${checkData!.unique_id}`);
  formData.append("status", val);

  onSubmit(formData);
};

const inquiryData = ref<Inquiry | null>(null);
const purchaseOrderData = ref<PurchaseOrder | null>(null);

const formInline = reactive({
  user: "",
  region: "",
  date: "",
});

const onSubmit = async (formData: FormData) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/inventory-movement-create",
      "inventory-movement-update",
      "post",
      formData
    );

    if (response.status.value == "success") {
      ElMessage.success("Berhasil Mengubah Status!");
    }
  } catch (error: any) {
    ElMessage.error(`${error.response?.data?.message ?? error}`);
  } finally {
    loading.value = false;
  }
};

const getStatusTagType = (
  status: string
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case "draft":
      return "info";
    case "waiting":
      return "warning";
    case "delivery":
      return "primary";
    case "ready":
      return "primary";
    case "done":
      return "success";
    default:
      return "primary";
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "draft":
      return "DRAFT";
    case "waiting":
      return "WAITING";
    case "delivery":
      return "ON DELIVERY";
    case "ready":
      return "READY";
    case "done":
      return "DONE";
    default:
      return status;
  }
};

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

const generateDeliveryOrderPdf = async (unique_code: string) => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png");
  doc.addImage(imgLogo, "PNG", margin, y, 30, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    [
      "Jl. Jend. Sudirman KM 31, Kayuringin Jaya,",
      "Bekasi Selatan, Kota Bekasi, Jawa Barat 17144",
    ],
    margin,
    y + 15,
    {
      maxWidth: 90,
      align: "left",
    }
  );

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY\nORDER", pageWidth - margin, y + 8, {
    align: "right",
  });

  y += 25;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const leftX = margin;
  const rightX = pageWidth / 2 + 10;

  // ================= INFO =================
  doc.setFontSize(8);

  doc.setFont("helvetica", "bold");
  doc.text("To", leftX, y);
  doc.text(":", leftX + 20, y);

  doc.setFont("helvetica", "normal");
  doc.text(inquiryData.value?.request_to?.name ?? "-", leftX + 25, y);

  y += 5;

  doc.setFont("helvetica", "bold");

  (checkData?.inventory_movement_pic || []).forEach((element, index) => {
    doc.text(index === 0 ? "PIC" : "", leftX, y);
    doc.text(index === 0 ? ":" : "", leftX + 20, y);

    doc.setFont("helvetica", "normal");
    doc.text(
      `${element.pic?.name} ${
        element.pic?.phone ? `(${element.pic.phone})` : ""
      }`,
      leftX + 25,
      y
    );

    y += 5;
  });

  // ================= RIGHT INFO =================

  let ry = 46;

  const rightInfo: string[][] = [["No. DO", unique_code]];

  if (
    inquiryData?.value?.type == TypeInquiry.INTERNAL &&
    inquiryData?.value?.reference == InquiryReference.SALES_ORDER
  ) {
    const salesOrder = inquiryData?.value?.reference_data as
      | PurchaseOrder
      | undefined;

    if (salesOrder) {
      rightInfo.push(["No. PO", salesOrder.sourcing_document || "-"]);
    }
  }

  rightInfo.push([
    "Tanggal",
    data.value?.data?.created_at
      ? formatLocalDate(data.value.data.created_at)
      : "-",
  ]);

  rightInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightX, ry);
    doc.text(":", rightX + 30, ry);

    doc.setFont("helvetica", "normal");
    doc.text(value, rightX + 35, ry);

    ry += 5;
  });

  y += 10;

  // ================= NOTES =================

  const noteText = checkData?.note
    ? [
        ...`${checkData.note}`.split("\n").filter((v) => v.trim() !== ""),
        "Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)",
      ]
        .map((v) => `• ${v}`)
        .join("\n")
    : "• Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)";

  // Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)

  // ================= TABLE =================

  let itemTable: any[] = [];

  (checkData?.inventory_movement_item ?? []).forEach((item, i) => {
    if (checkData?.category == CategoryMovement.DOCUMENTS) {
      itemTable.push([
        i + 1,
        `${item.reference_data?.catalogue_name}`,
        item.quantity,
        item.note ?? "",
      ]);
    } else {
      itemTable.push([
        i + 1,
        item.inventory?.catalogue?.name ?? "",
        item.quantity,
        item.unit_name,
        item.note ?? "",
      ]);
    }
  });

  let headerTable = [["No", "Nama Item", "Qty", "UoM", "Keterangan"]];

  if (checkData?.category == CategoryMovement.DOCUMENTS) {
    headerTable = [["No", "Nama Item", "Qty", "Keterangan"]];
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: headerTable,
    body: [
      ...itemTable,
      [
        {
          content: `Notes:\n${noteText}`,
          colSpan: 5,
          styles: {
            halign: "left",
            valign: "top",
            minCellHeight: 30,
          },
        },
      ],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: 0,
      lineWidth: 0.3,
      lineColor: 0,
      fontStyle: "bold",
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: 0,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 12, halign: "center" },
      3: {
        cellWidth: checkData?.category == CategoryMovement.GOODS ? 15 : 50,
        halign:
          checkData?.category == CategoryMovement.GOODS ? "center" : "left",
      },
      4: { cellWidth: 70, halign: "left" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ================= ADDRESS =================

  const addressWarehouse = checkData?.inventory_movement_address?.findLast(
    (find) => find.type == AddressMovementType.WAREHOUSE
  );

  const addressLeft = `${checkData?.address?.street ?? ""} ${
    checkData?.address ? generateAddressView(checkData.address) : ""
  }`;

  let addressRight = "";
  if (addressWarehouse && addressWarehouse.address) {
    addressRight = `${
      addressWarehouse.address.street ?? ""
    } ${generateAddressView(addressWarehouse.address)}`;
  }

  const leftWidth = 80;
  const rightWidth = 80;

  doc.setFont("helvetica", "bold");
  doc.text("Alamat Pengiriman", margin, y);
  if (addressWarehouse && addressWarehouse.address) {
    doc.text("Alamat Gudang", pageWidth / 2 + 10, y);
  }

  y += 5;

  doc.setFont("helvetica", "normal");

  const leftLines = doc.splitTextToSize(addressLeft, leftWidth);
  const rightLines = doc.splitTextToSize(addressRight, rightWidth);

  doc.text(leftLines, margin, y);
  doc.text(rightLines, pageWidth / 2 + 10, y);

  const addressHeight = Math.max(leftLines.length, rightLines.length) * 4;

  y += addressHeight + 12;

  // ================= SIGNATURE =================

  const signY = y;

  const colWidth = (pageWidth - margin * 2) / 3;

  const col1X = margin;
  const col2X = margin + colWidth;
  const col3X = margin + colWidth * 2;

  doc.setFontSize(9);

  doc.text("Penerima / Pembeli", col1X + colWidth / 2, signY, {
    align: "center",
  });

  doc.text("Bagian Pengiriman", col2X + colWidth / 2, signY, {
    align: "center",
  });

  doc.text("Petugas Gudang", col3X + colWidth / 2, signY, {
    align: "center",
  });

  const lineY = signY + 35;

  doc.line(col1X + 10, lineY, col1X + colWidth - 10, lineY);
  doc.line(col2X + 10, lineY, col2X + colWidth - 10, lineY);
  doc.line(col3X + 10, lineY, col3X + colWidth - 10, lineY);

  doc.setFontSize(8);
  doc.text(
    "PT Tiyasa Makmur Perkasa\nJl. Jend. Sudirman KM 31, Kayuringin Jaya, Kota Bekasi, Jawa Barat 17144 | Tel: 021-8849319",
    pageWidth / 2,
    285,
    {
      align: "center",
    }
  );

  const blob = doc.output("blob");
  pdfBlob.value = blob;
  pdfUrl.value = URL.createObjectURL(blob);

  return { doc, blob };
};

const generatePDF = async () => {
  loading.value = true;
  try {
    const req_doc = {
      reference: "do",
      reference_id: checkData?.unique_id,
    };

    const response = await useFetchApi<BaseResponse<TrumDoc>>(
      "/documents-create",
      "document-create",
      "post",
      req_doc
    );

    console.log("generate", response.status.value);
    if (response.status.value == "success") {
      loading.value = false;
      const { doc } = await generateDeliveryOrderPdf(
        response.data?.value?.data?.unique_code ?? ""
      );
      const blob = doc.output("blob");
      pdfUrl.value = URL.createObjectURL(blob);
      showPreviewPDF.value = true;
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  } finally {
    loading.value = false;
  }
};

const handleDelete = () => {
  ElMessageBox.confirm(
    "Data akan dihapus secara permanen. Lanjutkan?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  )
    .then(async () => {
      handleSubmitDelete([checkData?.unique_id ?? ""]);
    })
    .catch(() => {
      // Cancel
    });
};

const handleSubmitDelete = async (data: string[]) => {
  loading.value = true;
  try {
    const response = await useFetchApi(
      "/inventory-movement-delete",
      "inventory_movement",
      "post",
      data
    );
    console.log("response", response.status);
    if (response.status.value == "success") {
      ElMessage.success(`Berhasil`);
      window.location.href = "/inventory-management/checkin";
    }
  } catch (error) {
    ElMessage.error(`${error}`);
  } finally {
    loading.value = false;
  }
};

const downloadPdf = (type: "DO") => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `DO-${checkData?.to_name || "document"}.pdf`;

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

const fetchInquiry = async () => {
  loading.value = true;
  try {
    // Fetch related purchase orders
    const inquiry = await useFetchApi<BaseResponse<Inquiry>>(
      `/inquiries-read/${data?.value?.data?.reference_id}`,
      "inquiry",
      "get",
      null
    );

    if (inquiry.status.value === "success") {
      if (inquiry.data.value?.data) {
        const inquiryDataValue: Inquiry = inquiry.data.value!.data!;

        inquiryData.value = inquiryDataValue;

        if (
          inquiryDataValue.reference == "so" ||
          inquiryDataValue.reference == "po"
        ) {
          fetchPO();
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch related data", error);
  } finally {
    loading.value = false;
  }
};

const fetchPO = async () => {
  loadingPO.value = true;
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${inquiryData.value?.reference_id}`,
      "detail-purchase-order",
      "get",
      null
    );

    if (response.status.value === "success") {
      purchaseOrderData.value = response.data.value?.data ?? null;
    }
  } catch (error: any) {
    ElMessage.error(error?.respose?.message ?? error);
  } finally {
    loadingPO.value = false;
  }
};

onMounted(() => {
  if (data.value?.data) {
    fetchInquiry();
  }
});
</script>
