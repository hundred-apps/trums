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
            v-if="canAccess('inventory-movement-update', privilages)"
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
        <h1 class="text-lg font-bold">Lampiran</h1>
        <div class="flex gap-3 items-center" v-for="file in checkData?.files">
          <p>{{ file.filename }}</p>
          <el-button @click="() => {}"
            ><el-icon><Download /></el-icon> Download</el-button
          >
        </div>
      </div>
      <el-descriptions title="Note">
        <el-descriptions-item label="">{{
          `Tidak Ada Catatan`
        }}</el-descriptions-item>
      </el-descriptions>
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
        <el-button type="success" @click="downloadPdf">Download PDF</el-button>
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

const generateDeliveryOrderPdf = async () => {
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
  const rightX = pageWidth / 2 + 5;

  doc.setFontSize(9);
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
  doc.text(inquiryData.value?.request_by?.name ?? "-", leftX + 25, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Address", leftX, y);
  doc.text(":", leftX + 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${inquiryData.value?.address?.street}, ${inquiryData.value?.address?.village}, ${inquiryData.value?.address?.city}, ${inquiryData.value?.address?.regency}, ${inquiryData.value?.address?.codepos}`,
    leftX + 25,
    y,
    { maxWidth: 70 }
  );

  // Right info (grid 2x2)
  let ry = y - 10;

  const rightInfo = [
    [
      "No Invoice",
      `${purchaseOrderData?.value?.reference_data[0]?.unique_code ?? ""}`,
    ],
    ["No. DO", ""],
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

  // ================= ITEMS TABLE =================
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Nama Barang", "Qty", "UoM", "Keterangan"]],
    body: (checkData?.inventory_movement_item ?? []).map(
      (item: InventoryMovementItem, i: number) => [
        i + 1,
        item.inventory?.catalogue?.name ?? "-",
        item.quantity,
        "",
        "",
      ]
    ),
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
      4: { cellWidth: 20, halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ================= NOTES =================
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ["1. Surat Jalan ini merupakan bukti resmi penerimaan barang"],
      ["2. Surat jalan ini bukan bukti penjualan"],
      [
        "3. Surat jalan ini akan dilengkapi dengan invoice sebagai bukti penjualan",
      ],
    ],
    theme: "plain",
    styles: { fontSize: 8 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ================= SIGNATURE =================
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ["Penerima / Pembeli", "Bagian Pengiriman", "Petugas Gudang"],
      ["\n\n\n", "\n\n\n", "\n\n\n"],
    ],
    styles: {
      halign: "center",
      fontSize: 9,
      lineWidth: 0.3,
      lineColor: 0,
    },
  });

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
  const { doc } = await generateDeliveryOrderPdf();
  const blob = doc.output("blob");
  pdfUrl.value = URL.createObjectURL(blob);
  showPreviewPDF.value = true;
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

const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `PO-${checkData?.unique_code || "document"}.pdf`;

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
