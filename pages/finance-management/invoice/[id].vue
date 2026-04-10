<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Invoice - {{ invoiceData?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <el-card
      class="my-3"
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-between">
          <el-button type="danger" :icon="Delete" @click="confirmDelete"
            >Hapus</el-button
          >
          <div class="flex justify-items-end gap-3">
            <NuxtLink
              :href="`/finance-management/invoice/add/`"
              @click="
                () => {
                  const cookie = useCookie('unique_id');
                  cookie.value = invoiceData?.unique_id;
                }
              "
              class="el-button el-button--primary"
            >
              <el-icon class="me-2"><Edit /></el-icon> Edit
            </NuxtLink>
            <el-button
              type="success"
              v-if="invoiceData?.status === PaymentStatus.UNPAID"
              @click="markAsPaid"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Paid
            </el-button>
            <el-dropdown @command="handleStatus">
              <el-button type="default">
                Ubah Status<el-icon class="el-icon--right"
                  ><arrow-down
                /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="PaymentStatus.DRAFT"
                    >Draft</el-dropdown-item
                  >
                  <el-dropdown-item :command="PaymentStatus.RECEIVED"
                    >Diterima</el-dropdown-item
                  >
                  <el-dropdown-item :command="PaymentStatus.PAID"
                    >Lunas</el-dropdown-item
                  >
                  <el-dropdown-item :command="PaymentStatus.UNPAID"
                    >Belum Lunas</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" @click="generateInvoicePDF">
              Cetak Invoice
            </el-button>
          </div>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Customer">
              {{ invoiceData?.customer_name ?? "-" }}
            </el-descriptions-item>

            <el-descriptions-item label="Tanggal Invoice">
              {{
                invoiceData?.invoice_date == null
                  ? "-"
                  : formatLocalDate(invoiceData?.invoice_date)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Tenggat Waktu">
              {{
                invoiceData?.due_date == null
                  ? "-"
                  : formatLocalDate(invoiceData?.due_date)
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Reference">
              {{ invoiceData?.data_reference?.unique_code ?? "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Penerbit">
              {{ invoiceData?.vendor?.name ?? "" }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag
                :type="
                  getStatusTagType(invoiceData?.status ?? PaymentStatus.DRAFT)
                "
                >{{ formatStatus(invoiceData?.status ?? null) }}</el-tag
              >
            </el-descriptions-item>
            <el-descriptions-item
              label="Pembayaran"
              v-if="invoiceData?.payment_term_id"
            >
              <p>{{ invoiceData?.payment_terms?.name }}</p>
            </el-descriptions-item>
            <el-descriptions-item label="Metode Pembayaran">
              <el-tag
                :type="
                  getPaymentMethodTagType(
                    invoiceData?.payment_method ?? PaymentMethod.BankTransfer
                  )
                "
              >
                {{
                  formatPaymentMethod(
                    invoiceData?.payment_method ?? PaymentMethod.BankTransfer
                  )
                }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <el-descriptions
        title="Alamat Penagihan"
        v-if="invoiceData?.billing_address"
      >
        <el-descriptions-item label="">{{
          invoiceData?.billing_address
            ? generateAddressView(invoiceData?.billing_address).name
            : "-"
        }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="Catatan" v-if="invoiceData?.notes">
        <el-descriptions-item label="">{{
          invoiceData.notes
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Invoice Items</span>
        </div>
      </template>
      <el-table :data="invoiceData?.invoice_item" border>
        <el-table-column prop="item_name" label="Item" />
        <el-table-column prop="quantity" label="Qty" width="100" align="right">
          <template #default="scope">
            {{ scope.row.quantity }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="UOM" width="100" align="right">
          <template #default="scope">
            {{ scope.row.unit_name }}
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="Harga Satuan"
          width="200"
          align="right"
        >
          <template #default="scope">
            {{ formatCurrency(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_amount"
          label="Total"
          width="200"
          align="right"
        >
          <template #default="scope">
            <span class="font-medium">{{
              formatCurrency(scope.row.total_amount)
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Rekening Pembayaran</span>
        </div>
      </template>
      <el-table :data="invoiceData?.purchase_order_bank ?? []" border>
        <el-table-column label="Bank">
          <template #default="scope">
            {{ scope.row.bank.bank_name }}
          </template>
        </el-table-column>
        <el-table-column label="Nama Rekening">
          <template #default="scope">
            {{ scope.row.bank.account_name }}
          </template>
        </el-table-column>
        <el-table-column label="Nomor Rekening">
          <template #default="scope">
            {{ scope.row.bank.account_number }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Summary</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item
          :width="100"
          label="Total Tagihan"
          align="right"
          >{{
            formatCurrency(invoiceData?.subtotal || 0)
          }}</el-descriptions-item
        >

        <el-descriptions-item
          :width="100"
          :label="`Telah Dibayar`"
          align="right"
          >{{ formatCurrency(paidHistory) }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          :label="`Harus Dibayar`"
          align="right"
          >{{ formatCurrency(paidAmount) }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (invoiceData?.reference_transaction ?? []).filter(
            (value) => value.adjustments_transaction?.operator == 'minus'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustment?.name ?? ''"
          >{{
            formatCurrency(showTransactionAdjustmentValue(ref))
          }}</el-descriptions-item
        >

        <el-descriptions-item :width="100" label="Subtotal" align="right">{{
          formatCurrency(subtotal)
        }}</el-descriptions-item>
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (invoiceData?.reference_transaction ?? []).filter(
            (value) =>
              value.adjustments_transaction?.operator == 'plus' &&
              value.adjustments_transaction?.category == 'adjustment'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustments_transaction?.name ?? ''"
          >{{
            formatCurrency(showTransactionAdjustmentValue(ref))
          }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (invoiceData?.reference_transaction ?? []).filter(
            (value) =>
              value.adjustments_transaction?.category == 'transform' ||
              value.adjustments_transaction?.category == 'tax'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustments_transaction?.name ?? ''"
          >{{
            formatCurrency(showTransactionAdjustmentValue(ref))
          }}</el-descriptions-item
        >
        <el-descriptions-item :width="100" label="Grand Total" align="right">{{
          formatCurrency(grandTotal)
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Histori Pembayaran</span>
        </div>
      </template>
      <el-table :data="invoiceData?.history_payment ?? []" border>
        <el-table-column prop="payment_date" label="Tanggal">
          <template #default="scope">
            {{ formatLocalDate(scope.row.transaction.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="Methode Pembayaran">
          <template #default="scope">
            {{ formatPaymentMethod(scope.row.method) }}
          </template>
        </el-table-column>
        <el-table-column prop="reference" label="Reference">
          <template #default="scope">
            <NuxtLink
              :href="`/finance-management/transaction/${scope.row.transaction.unique_id}`"
              class="text-blue-600"
              >{{ scope.row.transaction.unique_code }}</NuxtLink
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showPrevInvoice"
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
        <el-button @click="showPrevInvoice = false">Tutup</el-button>
        <el-button type="success" @click="downloadPdf">Download PDF</el-button>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, CircleCheck, ArrowDown } from "@element-plus/icons-vue";
import { twCookie } from "nuxt-twemoji/emojis";
import type { AddressType } from "~/types/address";
import { PaymentStatus, PaymentMethod } from "~/types/finance/bill";
import {
  FinanceReference,
  type Invoice,
  type InvoiceItem,
} from "~/types/finance/invoice";
import type { BaseResponse } from "~/types/response";
import { PaymentTerm } from "~/types/scm/canvasing";
import { displayAmount, formatLocalDate } from "#imports";
import type { ResponsePagination } from "~/types/response_pagination";
import type { RequestSearch } from "~/types/request_search";
import jsPDF from "jspdf";
import type { PurchaseOrder } from "~/types/scm/purchase_order";
import { autoTable, type RowInput } from "jspdf-autotable";
import type { ReferenceTransactionAdjustment } from "~/types/attribute_adjustment";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Invoice Detail",
});

const router = useRouter();
const route = useRoute();
const invoiceId = ref<string>(route.params.id as string);

// Loading animation SVG
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
const invoiceData = ref<Invoice | null>(null);
const payments = ref<any[]>([]);
const invoicesHistory = ref<Invoice[]>([]);
const availableStatuses = [
  PaymentStatus.DRAFT,
  PaymentStatus.UNPAID,
  PaymentStatus.PAID,
];

const pdfUrl = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);
const showPrevInvoice = ref(false);

const goBack = () => router.back();

// Fetch invoice data
const fetchInvoice = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Invoice>>(
      `/invoice-read/${route.params.id}`,
      "detail-invoice",
      "get",
      null
    );

    if (response.status.value == "success") {
      invoiceData.value = response.data.value?.data ?? null;
      getHistoryInvoices();
    }
  } catch (error) {
    ElMessage.error("Failed to fetch invoice data");
    goBack();
  } finally {
    loading.value = false;
  }
};

// Calculation functions
const calculateSubtotal = () => {
  if (!invoiceData.value?.invoice_item) return 0;
  return invoiceData.value.invoice_item.reduce(
    (sum, item) => sum + (item.total_amount || 0),
    0
  );
};

const calculateTax = () => {
  return calculateSubtotal() * 0.1; // Example 10% tax
};

const calculateTotalAmount = () => {
  return calculateSubtotal() + calculateTax();
};

const handleStatus = async (command: PaymentStatus) => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", `${invoiceData.value?.unique_id}`);
    formData.append("status", `${command}`);

    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "invoice-out-create",
      "post",
      formData
    );

    if (response.status.value == "success") {
      const invoiceData: Invoice | null = response.data.value?.data ?? null;
      if (invoiceData) {
        fetchInvoice();
      }
    } else {
      ElMessage.error(response.error.value ?? "Gagal Mengubah Status!");
    }
  } catch (error: any) {
    ElMessage.error(
      error?.response?.message ?? (error || "Gagal Mengubah Status!")
    );
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const generateAddressView = (address: AddressType) => {
  const name = `${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
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
};

const formatPaymentMethod = (method: PaymentMethod | null) => {
  if (!method) return "-";
  return method.charAt(0).toUpperCase() + method.slice(1);
};

const paidAmount = computed(() => {
  let amount: number = invoiceData.value?.paid_amount || 0;
  let referenceTotal: number = 0;

  (invoiceData.value?.reference_transaction ?? []).forEach((element) => {
    if (element.type == "amount") {
      referenceTotal += Number(element.amount);
    } else {
      referenceTotal += displayAmount(element, amount);
    }
  });

  return amount + referenceTotal;
});

const paidHistory = computed(() => {
  var sum = 0;

  invoicesHistory.value.forEach((element) => {
    (element.history_payment ?? []).forEach((history) => {
      sum += history.amount;
    });
  });
  return sum;
});

const remainingBill = computed(() => {
  return (
    (invoiceData.value?.subtotal || 0) -
    (paidHistory.value || 0) -
    (paidAmount.value || 0)
  );
});

const getHistoryInvoices = async () => {
  loading.value = true;
  try {
    const request: RequestSearch = {
      keyword: "",
      table: "invoices",
      column: [
        {
          reference: ["sales"],
          reference_id: [invoiceData.value?.reference_id],
        },
      ],
      sort: null,
      offset: "1",
      limit: "100",
    };
    const response = await useFetchApi<ResponsePagination<Invoice[]>>(
      "/search",
      "fetch-invoices-history",
      "post",
      request
    );
    if (response.status.value === "success") {
      (response.data.value?.data ?? []).forEach((element) => {
        if ((element.history_payment ?? []).length > 0) {
          invoicesHistory.value.push(element);
        }
      });
    }
  } catch (error: any) {
    ElMessage.error(
      error?.response?.message ??
        (error || "Gagal Mengambil History Pembayaran")
    );
  } finally {
    loading.value = false;
  }
};

const formatStatus = (status: PaymentStatus | null) => {
  if (!status) return "-";
  return status.toUpperCase();
};

const getStatusTagType = (
  status: PaymentStatus | null
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (status) {
    case PaymentStatus.DRAFT:
      return "info";
    case PaymentStatus.UNPAID:
      return "danger";
    case PaymentStatus.PAID:
      return "success";
    default:
      return "primary";
  }
};

const getPaymentMethodTagType = (
  method: PaymentMethod | null
): "success" | "info" | "danger" | "warning" | "primary" => {
  switch (method) {
    case PaymentMethod.Cash:
      return "primary";
    case PaymentMethod.BankTransfer:
      return "success";
    case PaymentMethod.Giro:
      return "warning";
    default:
      return "info";
  }
};

// Actions
const updateStatus = async (status: PaymentStatus) => {
  if (!invoiceData.value) return;

  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", invoiceData.value.unique_id);
    formData.append("status", status);
    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "update-status",
      "post",
      formData
    );
    if (response.status.value == "success") {
      invoiceData.value.status = status;
      ElMessage.success("Invoice status updated");
    }
  } catch (error) {
    ElMessage.error("Failed to update status");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const markAsPaid = async () => {
  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", invoiceData.value!.unique_id);
    formData.append("status", PaymentStatus.PAID);
    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "update-status",
      "post",
      formData
    );
    if (response.status.value == "success") {
      invoiceData.value!.status = PaymentStatus.PAID;
      ElMessage.success("Invoice marked as paid");
    }
    await fetchInvoice(); // Refresh data
  } catch (error) {
    ElMessage.error("Failed to mark invoice as paid");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = () => {
  ElMessageBox.confirm(
    "This will permanently delete the invoice. Continue?",
    "Warning",
    {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(async () => {
      await deleteInvoice();
    })
    .catch(() => {
      // Cancel
    });
};

const deleteInvoice = async () => {
  loading.value = true;
  try {
    // await $fetch(`/api/invoices/${invoiceId.value}`, {
    //   method: 'DELETE'
    // })
    ElMessage.success("Invoice deleted");
    router.push("/finance-management/invoices");
  } catch (error) {
    ElMessage.error("Failed to delete invoice");
    console.error(error);
  } finally {
    loading.value = false;
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

const generatePDF = async () => {
  const doc = new jsPDF();
  const today = new Date();

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 10;

  const formatted = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Logo
  const imgLogo = await getBase64ImageFromUrl("/images/trumecs-logo.png"); // path logo (public/logo.png)
  const tmsLogo = await getBase64ImageFromUrl("/images/tms-logo.png"); // path logo (public/logo.png)
  const headerTop = 10;
  const headerHeight = 25;
  const headerCenterY = headerTop + headerHeight / 2;

  const leftLogoWidth = 40;
  const leftLogoHeight = 25;

  const rightLogoWidth = 40;
  const rightLogoHeight = 15;

  // Logo kiri
  doc.addImage(
    tmsLogo,
    "PNG",
    marginX,
    headerCenterY - leftLogoHeight / 2,
    leftLogoWidth,
    leftLogoHeight
  );

  // Logo kanan
  doc.addImage(
    imgLogo,
    "PNG",
    pageWidth - marginX - rightLogoWidth,
    headerCenterY - rightLogoHeight / 2,
    rightLogoWidth,
    rightLogoHeight
  );

  // ================= TITLE =================
  doc.setFontSize(18);
  doc.text("INVOICE", pageWidth / 2, 50, { align: "center" });

  // ================= INFO =================

  const labelX = marginX;
  const colonX = marginX + 28;
  const valueX = marginX + 32;

  doc.setFontSize(9);
  doc.text("Number", labelX, 60);
  doc.text(":", colonX, 60);
  doc.text(`${invoiceData.value?.unique_code}`, valueX, 60);
  doc.text(`Jakarta, ${formatted}`, pageWidth - marginX, 60, {
    align: "right",
  });

  doc.text("Subject", labelX, 66);
  doc.text(":", colonX, 66);
  doc.text(`${invoiceData.value?.subject ?? "-"}`, valueX, 66);
  doc.text("Quotation", labelX, 72);
  doc.text(":", colonX, 72);
  doc.text(`${"-"}`, valueX, 72);
  doc.text("PO Number", labelX, 78);
  doc.text(":", colonX, 78);
  doc.text(
    `${
      ((invoiceData.value?.data_reference as PurchaseOrder) || null)
        ?.unique_code ?? "-"
    }`,
    valueX,
    78
  );

  doc.text("To", labelX, 87);
  doc.text(":", colonX, 87);
  doc.text(
    `${
      invoiceData.value?.type == "in"
        ? invoiceData.value?.vendor_name
        : invoiceData?.value?.customer_name ?? "-"
    }`,
    valueX,
    87
  );
  doc.text("PIC", labelX, 93);
  doc.text(":", colonX, 93);
  doc.text(`${invoiceData?.value?.pic_name ?? "-"}`, valueX, 93);
  doc.text("Address", labelX, 99);
  doc.text(":", colonX, 99);
  doc.text(
    `${generateAddressView(invoiceData.value!.billing_address!).name}`,
    valueX,
    99
  );

  let rowData: RowInput[] = (invoiceData.value?.invoice_item ?? []).map(
    (item: InvoiceItem, i: number) => [
      {
        content: `${i + 1}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${item.item_name}`,
        styles: {
          halign: "left",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${item.quantity}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${item.unit_name}`,
        styles: {
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${currencyWithoutSymbol(item.price)}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${currencyWithoutSymbol(item.quantity * (item.price || 0))}`,
        styles: {
          halign: "right",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
    ]
  );

  // console.log(rowData);
  // rowData.push(['','','','','Total Price',grandTotal])
  // rowData.push(['','','','','PPN','11%'])

  let summeryNumber = (invoiceData.value?.invoice_item ?? []).length + 1;

  summeryNumber++;
  rowData.push([
    {
      content: `Subtotal`,
      colSpan: 5,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(subtotal.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  (invoiceData.value?.reference_transaction ?? []).forEach((element) => {});

  const dppComp = getDppComponent(
    invoiceData?.value?.reference_transaction ?? []
  );
  const ppnComp = getPPNComponent(
    invoiceData?.value?.reference_transaction ?? []
  );

  if (dppComp) {
    const dppValue = getDPPFormula(dppComp, subtotal.value || 0);
    const ppnValue = getPPNFormula(dppComp, dppValue);
    summeryNumber++;
    rowData.push([
      {
        content: `${dppComp.adjustments_transaction?.name}`,
        colSpan: 5,
        styles: {
          halign: "right",
          fontStyle: "bold",
          cellWidth: 0.0,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
      {
        content: `${currencyWithoutSymbol(dppValue || 0)}`,
        styles: {
          halign: "right",
          cellWidth: 0.0,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fillColor: [255, 255, 255],
        },
      },
    ]);
    if (ppnComp) {
      summeryNumber++;
      rowData.push([
        {
          content: `${ppnComp.adjustments_transaction?.name}`,
          colSpan: 5,
          styles: {
            halign: "right",
            fontStyle: "bold",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
        {
          content: `${currencyWithoutSymbol(ppnValue || 0)}`,
          styles: {
            halign: "right",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
      ]);
    }
  }
  summeryNumber++;
  rowData.push([
    {
      content: `Grand Total`,
      colSpan: 5,
      styles: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
    {
      content: `${currencyWithoutSymbol(grandTotal.value || 0)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  // Table
  autoTable(doc, {
    startY: 110,
    head: [
      ["No", "Item", "Qty", "UoM", "Price exc. PPN", "Total Price exc. PPN"],
    ],
    body: rowData,
    styles: {
      fontSize: 9,
    },
    margin: { left: marginX, right: marginX },
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

  // // Summary
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  // doc.text(`Total Price: Rp ${currency(grandTotal)}`, 140, finalY)
  // doc.text(`PPN: Rp ${currency(grandTotal)}`, 140, finalY + 10)

  // finalY += 10
  // doc.text(`Grand Total: Rp ${currency(grandTotal.value)}`, 140, finalY)

  // const canvassing: Canvassing | undefined =
  //   props.dataInterface?.data?.reference_data;

  // Notes
  doc.text("Notes:", 10, finalY + 5);

  // if (canvassing) {
  //   let currentY = finalY + 15;
  //   doc.setFontSize(9);
  //   const writeWrappedText = (text: string) => {
  //     const lines = doc.splitTextToSize(text, pageWidth - 30);
  //     doc.text(lines, 20, currentY);
  //     currentY += lines.length * 5;
  //   };

  //   if (canvassing) {
  //     writeWrappedText(
  //       `\u2022 Dikirim ke ${
  //         generateResultSearchAddress(canvassing?.address ?? null).name
  //       }`
  //     );

  //     // writeWrappedText(
  //     //   `\u2022 ${
  //     //     canvassing.payment_term == PaymentTerm.TEMPO
  //     //       ? `${paymentTermView(canvassing.payment_term)} ${
  //     //           canvassing.tempo_value
  //     //         } Hari`
  //     //       : paymentTermView(canvassing.payment_term)
  //     //   }`
  //     // );

  //     (props.dataInterface.data?.payment_terms ?? []).forEach((element) => {
  //       writeWrappedText(
  //         `\u2022 ${element.name} ${
  //           element.term_of_payment == PaymentTerm.TEMPO
  //             ? `${element.duration}D`
  //             : ""
  //         }`
  //       );
  //     });
  //   }

  //   doc.setFontSize(11);
  // }

  if (invoiceData?.value?.notes) {
    const splits = `${invoiceData?.value?.notes}`.split("\n");

    let yFinal = Number(finalY) + Number(10);
    splits.forEach((value) => {
      yFinal = yFinal + Number(5);
      console.log("final Y", yFinal);
      doc.text(`\u2022 ${value ?? "-"}`, 20, yFinal);
    });
  }

  // Signature
  doc.text("Best Regards,", 10, finalY + 80);

  if (invoiceData?.value?.type === "in") {
    doc.text(invoiceData?.value?.vendor_name ?? "", 10, finalY + 110);
  } else {
    doc.text("Stanislaus Adrian Pratama,", 10, finalY + 110);
    doc.text("Operation Manager", 10, finalY + 120);
  }

  const blob = doc.output("blob");
  pdfBlob.value = blob;
  pdfUrl.value = URL.createObjectURL(blob);

  return { doc, blob };
};

const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `INV-${invoiceData?.value?.unique_code || "document"}.pdf`;

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

const generateInvoicePDF = async () => {
  const { doc } = await generatePDF();
  const blob = doc.output("blob");
  pdfUrl.value = URL.createObjectURL(blob);
  showPrevInvoice.value = true;
};

const showTransactionAdjustmentValue = (
  ref: ReferenceTransactionAdjustment
) => {
  if (ref.include) {
    return 0;
  } else {
    if (
      ref.adjustments_transaction?.category == "tax" &&
      ref.adjustments_transaction.name.toLowerCase() === "ppn"
    ) {
      const dpp: ReferenceTransactionAdjustment | undefined = (
        invoiceData.value?.reference_transaction ?? []
      ).find((value) => value.adjustments_transaction?.unique_code == "DPPL");
      if (dpp) {
        const dppValue = getDPPFormula(dpp, paidAmount.value || 0);
        return getPPNFormula(ref, dppValue || paidAmount.value);
      } else {
        return getPPNFormula(ref, paidAmount.value);
      }
    } else {
      return ref.type == "amount"
        ? ref.amount
        : displayAmount(ref, paidAmount.value || 0);
    }
  }
};

const getPlus = computed(() => {
  var plus = 0;

  (invoiceData.value?.reference_transaction ?? [])
    .filter(
      (value) =>
        value.adjustments_transaction?.operator == "plus" &&
        value.adjustments_transaction?.category === "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += Number(ref.amount);
      }
    });

  return plus;
});

const dppComponent = computed(() => {
  return (invoiceData.value?.reference_transaction ?? []).find(
    (value) =>
      value.adjustments_transaction?.category == "transform" &&
      value.adjustments_transaction?.unique_code == "DPPL"
  );
});

const ppnComponent = computed(() => {
  const ppnComponentRef = (invoiceData.value?.reference_transaction ?? []).find(
    (value) =>
      value.adjustments_transaction?.category == "tax" &&
      value.adjustments_transaction?.name.toLowerCase() === "ppn"
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
  return subtotal.value + getPlus.value + ppnComponent.value;
});

const getMinus = computed(() => {
  var minus = 0;
  (invoiceData.value?.reference_transaction ?? [])
    .filter((value) => value.adjustments_transaction?.operator == "minus")
    .forEach((ref) => {
      if (ref.include == false) {
        minus += Number(ref.amount);
      }
    });

  return minus;
});

const subtotal = computed(() => {
  return Number(paidAmount.value) - Number(getMinus.value);
});

onMounted(() => {
  fetchInvoice();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
