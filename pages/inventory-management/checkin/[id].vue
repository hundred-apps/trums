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
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
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
          </el-descriptions>
        </div>
      </div>
      <div class="mb-5">
        <h1 class="text-lg font-bold">Alamat Pengiriman</h1>
        <div class="text-sm mt-2" v-if="checkData?.address">
          <span class="font-bold"
            >({{ checkData?.address?.address_name }}) |
            {{ checkData?.pic?.name }}
            {{
              checkData?.pic?.phone ? `(${checkData?.pic?.phone})` : ""
            }}</span
          >
          <div class="flex flex-col">
            <span>{{ checkData?.address?.street }}</span>
            <span>{{ generateAddressViewName(checkData?.address!) }}</span>
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
          <p>{{ file.filename }}</p>
          <el-button @click="() => {}"
            ><el-icon><Download /></el-icon> Download</el-button
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
      <h1 class="mb-4">Item Permintaan</h1>
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
        <el-table-column prop="sn" label="Serial/Part Number" width="180" />
        <el-table-column prop="quantity" label="QTY" width="100" />

        <el-table-column prop="unit_name" label="UOM" width="100" />
        <el-table-column prop="" label="Keterangan" width="100">
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
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Download, Eleme } from "@element-plus/icons-vue";
import type { Inquiry } from "~/types/inquiry";
import type {
  InventoryMovement,
  InventoryMovementItem,
} from "~/types/inventory_movement";
import type { BaseResponse } from "~/types/response";
import { formatLocalDate, currencyWithoutSymbol, canAccess } from "#imports";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ElLoading } from "element-plus";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import { load } from "@fingerprintjs/fingerprintjs";
import { extractDescription, generateAddressViewName } from "#imports";
import type { TrumDoc } from "~/types/document";

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

  const leftColX = margin;
  const leftColWidth = 90;
  const leftColCenterX = leftColX + leftColWidth / 2;

  const logoWidth = 30;
  const logoX = leftColCenterX - logoWidth / 2;
  // ================= LOGO & HEADER =================
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png");
  doc.addImage(imgLogo, "PNG", margin, y, 30, 10);

  //   doc.setFontSize(10);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("TruMecs.com", margin, y + 5);

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

  // Title kanan
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY\nORDER", pageWidth - margin, y + 8, {
    align: "right",
  });

  y += 25;
  doc.setDrawColor(0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ================= INFO SECTION =================
  const leftX = margin;
  const rightX = pageWidth / 2 + 10;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("To", leftX, y);
  doc.text(":", leftX + 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(inquiryData.value?.request_to?.name ?? "-", leftX + 25, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("PIC", leftX, y);
  doc.text(":", leftX + 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(checkData?.pic?.name ?? "-", leftX + 25, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Address", leftX, y);
  doc.text(":", leftX + 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${checkData?.address?.street} ${generateAddressView(checkData!.address!)}`,
    leftX + 25,
    y,
    {
      maxWidth: 70,
    }
  );

  // Right info (grid 2x2)
  let ry = y - 10;

  const rightInfo = [
    [
      "No Invoice",
      `${purchaseOrderData?.value?.reference_data[0]?.unique_code ?? ""}`,
    ],
    ["No. DO", unique_code],
    [
      "Tanggal",
      `${
        data.value?.data?.created_at != null &&
        data.value?.data?.created_at != undefined
          ? formatLocalDate(data.value?.data?.created_at)
          : ""
      }`,
    ],
    ["Expedisi", ""],
  ];

  rightInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightX, ry);
    doc.text(":", rightX + 30, ry);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", rightX + 35, ry);
    ry += 5;
  });

  y += 18;

  const noteText = checkData?.note
    ? `${checkData.note}`
        .split("\n")
        .filter((v) => v.trim() !== "")
        .map((v) => `• ${v}`)
        .join("\n")
    : "-";
  // ================= ITEMS TABLE =================
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Nama Barang", "Qty", "UoM", "Keterangan"]],
    body: [
      ...(checkData?.inventory_movement_item ?? []).map(
        (item: InventoryMovementItem, i: number) => [
          i + 1,
          item.inventory?.catalogue?.name ?? "-",
          item.quantity,
          item.unit_name,
          item.note ?? "",
        ]
      ),

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
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 70, halign: "left" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // doc.setFontSize(8);
  // doc.text("Notes:", margin, y);

  // y += 8;

  // doc.setFontSize(8);
  // const writeWrappedText = (text: string, x = 20, lineHeight = 5) => {
  //   const lines = doc.splitTextToSize(text, pageWidth - 30);

  //   // ensureSpace(lines.length * lineHeight);

  //   doc.text(lines, x, y);

  //   y += lines.length * lineHeight;
  // };

  // if (checkData?.note) {
  //   const splits = `${checkData?.note}`.split("\n");

  //   console.log("note lines", splits);
  //   splits.forEach((value) => {
  //     if (value !== "\r") {
  //       writeWrappedText(`\u2022 ${value ?? "-"}`);
  //     }
  //     // yFinal = yFinal + Number(5);
  //     // console.log("final Y", yFinal);
  //     // doc.text(`\u2022 ${value ?? "-"}`, 20, yFinal);
  //   });
  // }

  y += 20;

  // ================= SIGNATURE =================
  const signY = y;
  const colWidth = (pageWidth - margin * 2) / 3;

  const col1X = margin;
  const col2X = margin + colWidth;
  const col3X = margin + colWidth * 2;

  // Judul tanda tangan
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text("Penerima / Pembeli", col1X + colWidth / 2, signY, {
    align: "center",
  });
  doc.text("Bagian Pengiriman", col2X + colWidth / 2, signY, {
    align: "center",
  });
  doc.text("Petugas Gudang", col3X + colWidth / 2, signY, { align: "center" });

  // Garis tanda tangan
  const lineY = signY + 35;

  doc.line(col1X + 10, lineY, col1X + colWidth - 10, lineY);
  doc.line(col2X + 10, lineY, col2X + colWidth - 10, lineY);
  doc.line(col3X + 10, lineY, col3X + colWidth - 10, lineY);

  // Update posisi y setelah tanda tangan
  y = lineY + 10;
  // ================= FOOTER =================
  doc.setFontSize(8);
  doc.text(
    "PT Tiyasa Makmur Perkasa\nJl. Jend. Sudirman KM 31, Kayuringin Jaya, Kota Bekasi, Jawa Barat 17144 | Tel: 021-8849319",
    pageWidth / 2,
    285,
    { align: "center" }
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
