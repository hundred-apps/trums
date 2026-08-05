<template>
  <el-card class="my-3">
    <template #header>
      <div class="card-header flex justify-between">
        <div class="flex flex-1">
          <el-form-item label="Status" prop="status">
            <el-radio-group
              v-model="checkData!.status"
              aria-label="status"
              size="small"
              @change="onChangeStatus"
            >
              <el-radio-button value="draft">Draft</el-radio-button>
              <el-radio-button value="waiting">Waiting</el-radio-button>
              <el-radio-button value="ready">Book</el-radio-button>
              <el-radio-button value="delivery">Delivery</el-radio-button>
              <el-radio-button value="done">Done</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>
        <NuxtLink
          v-if="canAccess('inventory_movement-update', privilages)"
          :href="`/inventory-management/checkin/add?id=${checkData?.unique_id}`"
          class="el-button el-button--defult"
        >
          Edit
        </NuxtLink>
        <el-button
          type="primary"
          :loading-icon="Eleme"
          :loading="loading || loadingPO"
          @click="generatePDF"
        >
          Cetak DO
        </el-button>
        <NuxtLink
          class="el-button el-button--success"
          :href="`/finance-management/invoice/add?movement_id=${checkData?.unique_id}`"
          ><el-icon class="mr-2"><Tickets /></el-icon> Buat Faktur</NuxtLink
        >
        <el-button
          type="danger"
          :loading="loading || loadingPO"
          @click="handleDelete"
        >
          Hapus
        </el-button>
      </div>
    </template>
    <!-- <el-button type="primary" @click="onCheckout" :loading="loading">Proses</el-button> -->
    <div class="flex gap-3 my-3">
      <div class="flex-1">
        <el-descriptions title="" :column="1" size="large" border>
          <el-descriptions-item label="Lokasi Awal">{{
            checkData?.from_name
          }}</el-descriptions-item>
          <el-descriptions-item label="Tanggal">{{
            formatLocalDate(checkData?.created_at ?? 0)
          }}</el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="getStatusTagType(checkData!.status)">
              {{ formatStatus(checkData!.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="checkData!.reference == 'inquiry'"
            label="Nomor Permintaan"
          >
            <NuxtLink
              :href="`/inventory-management/inqueiries/${checkData?.reference_id}`"
              class="text-blue-600"
              >{{ checkData?.data_reference != null ? (checkData?.data_reference as Inquiry).unique_code ?? '-' : 'N/A'}}</NuxtLink
            >
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="flex-1">
        <el-descriptions title="" :column="1" size="large" border>
          <el-descriptions-item
            v-if="checkData!.reference == 'so' || checkData!.reference == 'po'"
            label="Nomor SO/PO"
            >{{
              checkData?.data_reference?.unique_code ?? "-"
            }}</el-descriptions-item
          >
          <el-descriptions-item label="Nomor Dokumen">{{
            checkData?.source_document ?? "-"
          }}</el-descriptions-item>
          <!-- <el-descriptions-item label="Alamat">
                            -
                        </el-descriptions-item> -->
          <el-descriptions-item label="Tujuan">{{
            checkData?.to_name
          }}</el-descriptions-item>
          <el-descriptions-item
            v-for="(pic, index) in checkData?.inventory_movement_pic"
            :key="index"
            :label="index == 0 ? 'PIC' : ''"
            >{{ pic.pic?.name }}
            {{
              pic.pic?.phone ? `(${pic.pic?.phone})` : ""
            }}</el-descriptions-item
          >
        </el-descriptions>
      </div>
    </div>
    <div class="mb-5">
      <h1 class="text-lg font-bold">Alamat Pengiriman</h1>
      <div class="text-sm mt-2" v-if="checkData?.address">
        <span class="font-italic"
          >({{ checkData?.address?.address_name }}) |
          {{ checkData?.pic?.name }}
          {{ checkData?.pic?.phone ? `(${checkData?.pic?.phone})` : "" }}</span
        >
        <div class="flex flex-col">
          <span class="text-gray-500">{{ checkData?.address?.street }}</span>
          <span
            class="text-gray-500"
            >{{ generateAddressViewName(checkData?.address!) }}</span
          >
        </div>
      </div>
    </div>
    <div
      class="mb-5"
      v-if="
        checkData?.inventory_movement_address &&
        checkData.inventory_movement_address.length > 0 &&
        checkData.inventory_movement_address[0].type ==
          AddressMovementType.WAREHOUSE
      "
    >
      <h1 class="text-lg font-bold">Alamat Gudang</h1>
      <div
        class="text-sm mt-2"
        v-if="checkData?.inventory_movement_address[0].address"
      >
        <span class="font-italic"
          >({{ checkData?.inventory_movement_address[0].address.address_name }})
          |
          {{ checkData?.inventory_movement_address[0].address.address_name }}
          {{
            checkData?.inventory_movement_address[0].address.contact_name
          }}</span
        >
        <div class="flex flex-col">
          <span class="text-gray-500">{{
            checkData?.inventory_movement_address[0].address?.street
          }}</span>
          <span class="text-gray-500">{{
            generateAddressViewName(
              checkData?.inventory_movement_address[0].address
            )
          }}</span>
        </div>
      </div>
    </div>
    <div class="mb-5">
      <h1 class="text-lg font-bold">Lampiran</h1>
      <div
        class="flex gap-3 items-center"
        v-if="(checkData?.files || []).length > 0"
        v-for="file in checkData?.files"
      >
        <NuxtLink
          class="text-blue-600 text-sm"
          :href="`${baseImageURL}/${file.image_path}/${file.filename}`"
          target="_blank"
          >{{ file.filename_original }}</NuxtLink
        >
      </div>
      <div v-else class="text-sm">Tidak Ada Lampiran</div>
    </div>
    <div class="mb-5">
      <h1 class="text-lg font-bold">Catatan</h1>
      <div class="flex gap-3 items-center" v-if="checkData?.note">
        <span v-html="`${extractDescription(checkData?.note ?? '')}`"></span>
      </div>
      <div v-else class="text-sm">Tidak Ada Catatan</div>
    </div>
  </el-card>
  <el-card>
    <h1 class="mb-4">Daftar Item</h1>
    <el-table
      :data="checkData?.inventory_movement_item"
      style="width: 100%"
      border
    >
      <el-table-column prop="inventory.catalogue.name" label="Nama Item">
        <template #default="scope">
          {{
            scope.row.inventory?.catalogue?.name ??
            scope.row.reference_data?.catalogue_name ??
            "-"
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkData?.category == CategoryMovement.DOCUMENTS"
        prop=""
        label="REF"
        width="100"
      >
        <template #default="{ row }">
          <NuxtLink
            class="text-blue-600"
            :target="'_blank'"
            :href="getDocRefLink((row.reference_data as ItemRequest|undefined)?.catalogue?.document)"
            >{{ (row.reference_data as ItemRequest|undefined)?.catalogue?.document?.reference?.toUpperCase() }}</NuxtLink
          >
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkData?.category == CategoryMovement.GOODS"
        prop="sn"
        label="Serial/Part Number"
        width="180"
      />
      <el-table-column prop="quantity" label="QTY" width="100" />

      <el-table-column
        v-if="checkData?.category == CategoryMovement.GOODS"
        prop="unit_name"
        label="UOM"
        width="100"
      />
      <el-table-column prop="" label="Keterangan">
        <template #default="{ row }">
          <div
            class="text-sm"
            v-html="extractDescription(row?.note ?? '')"
          ></div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

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
      <el-button type="success" @click="() => downloadPdf('DO')"
        >Download PDF</el-button
      >
    </template>
  </el-dialog>
</template>

<script lang="tsx" setup>
import {
  AddressMovementType,
  CategoryMovement,
  type InventoryMovement,
} from "~/types/inventory_movement";
import type { Permission } from "~/types/menu";
import {
  canAccess,
  extractDescription,
  generateAddressViewName,
  formatLocalDate,
} from "#imports";
import { Eleme } from "@element-plus/icons-vue";
import { InquiryReference, TypeInquiry, type Inquiry } from "~/types/inquiry";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import type { BaseResponse } from "~/types/response";
import type { TrumDoc } from "~/types/document";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { getDocRefLink } from "~/types/document";
import type { ItemRequest } from "~/types/item_request";

type Props = {
  checkData: InventoryMovement;
  privilages: Permission[];
  inquiryData: Inquiry | null;
  purchaseOrderData: PurchaseOrder | null;
  mode: "view" | "edit";
};

const props = defineProps<Props>();

const loading = ref<boolean>(false);
const loadingPO = ref<boolean>(false);

const showPreviewPDF = ref(false);
const pdfUrl = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);

const config = useRuntimeConfig();
const baseImageURL = config.public.baseImageURL;

const onChangeStatus = (val: any) => {
  const formData = new FormData();

  formData.append("unique_id", `${props.checkData!.unique_id}`);
  formData.append("status", val);

  onSubmit(formData);
};

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
const generatePDF = async () => {
  loading.value = true;
  try {
    const req_doc = {
      reference: "do",
      reference_id: props.checkData?.unique_id,
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
  doc.text(props.inquiryData?.request_to?.name ?? "-", leftX + 25, y);

  y += 5;

  doc.setFont("helvetica", "bold");

  (props.checkData?.inventory_movement_pic || []).forEach((element, index) => {
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
    props.inquiryData?.type == TypeInquiry.INTERNAL &&
    props.inquiryData?.reference == InquiryReference.SALES_ORDER
  ) {
    const salesOrder = props.inquiryData?.reference_data as
      | PurchaseOrder
      | undefined;

    if (salesOrder) {
      rightInfo.push(["No. PO", salesOrder.sourcing_document || "-"]);
    }
  }

  rightInfo.push([
    "Tanggal",
    props.checkData.created_at
      ? formatLocalDate(props.checkData.created_at)
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

  const noteText = props.checkData?.note
    ? [
        ...`${props.checkData.note}`.split("\n").filter((v) => v.trim() !== ""),
        "Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)",
      ]
        .map((v) => `• ${v}`)
        .join("\n")
    : "• Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)";

  // Barang yang telah diterima dan dinyatakan sesuai tidak dapat dikembalikan atau ditukar (non-retur)

  // ================= TABLE =================

  let itemTable: any[] = [];

  (props.checkData?.inventory_movement_item ?? []).forEach((item, i) => {
    if (props.checkData?.category == CategoryMovement.DOCUMENTS) {
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

  if (props.checkData?.category == CategoryMovement.DOCUMENTS) {
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
        cellWidth:
          props.checkData?.category == CategoryMovement.GOODS ? 15 : 50,
        halign:
          props.checkData?.category == CategoryMovement.GOODS
            ? "center"
            : "left",
      },
      4: { cellWidth: 70, halign: "left" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ================= ADDRESS =================

  const addressWarehouse =
    props.checkData?.inventory_movement_address?.findLast(
      (find) => find.type == AddressMovementType.WAREHOUSE
    );

  const addressLeft = `${props.checkData?.address?.street ?? ""} ${
    props.checkData?.address ? generateAddressView(props.checkData.address) : ""
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

const downloadPdf = (type: "DO") => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `DO-${props.checkData?.to_name || "document"}.pdf`;

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
      handleSubmitDelete([props.checkData?.unique_id ?? ""]);
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
</script>
