<template>
  <div>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Invoice - {{ data?.data?.unique_code }}
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
              :href="`/finance-management/invoice/add?id=${data?.data?.unique_id}`"
              class="el-button el-button--primary"
            >
              <el-icon class="me-2"><Edit /></el-icon> Edit
            </NuxtLink>
            <el-button
              type="success"
              v-if="data?.data?.status === PaymentStatus.UNPAID"
              @click="markAsPaid"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Paid
            </el-button>
            <!-- <el-dropdown @command="handleStatus">
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
            </el-dropdown> -->
            <el-button
              type="primary"
              style="margin-left: 0px"
              @click="generateInvoicePDF"
            >
              Cetak Invoice
            </el-button>
            <el-button
              type="success"
              style="margin-left: 0px"
              @click="() => (dialogFakturPajak = true)"
              :icon="Upload"
            >
              Upload Faktur Pajak
            </el-button>
            <el-button
              type="success"
              style="margin-left: 0px"
              v-if="data?.data?.status === PaymentStatus.DRAFT"
              @click="sendApproval"
            >
              Ajukan Approval
            </el-button>
            <el-button
              style="margin-left: 0px"
              type="default"
              v-if="data?.data?.status === PaymentStatus.WAITING"
              @click="cancelSendApproval"
            >
              Batalkan Pengajuan Approval
            </el-button>
            <el-button
              style="margin-left: 0px"
              type="success"
              v-if="data?.data?.status === PaymentStatus.WAITING"
              @click="() => decision(PaymentStatus.APPROVED)"
            >
              Approve
            </el-button>
            <el-button
              style="margin-left: 0px"
              type="danger"
              v-if="data?.data?.status === PaymentStatus.WAITING"
              @click="() => decision(PaymentStatus.REJECTED)"
            >
              Reject
            </el-button>
          </div>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Customer">
              {{ data?.data?.customer_name ?? "-" }}
            </el-descriptions-item>

            <el-descriptions-item label="Tanggal Invoice">
              {{
                data?.data?.invoice_date == null
                  ? "-"
                  : formatLocalDate(data?.data?.invoice_date)
              }}
            </el-descriptions-item>
            <!-- <el-descriptions-item label="Tenggat Waktu">
              {{
                data?.data?.due_date != null &&
                data.data.due_date > 0 &&
                data.data.due_date != undefined
                  ? formatLocalDate(data?.data?.due_date)
                  : "-"
              }}
            </el-descriptions-item> -->
            <el-descriptions-item label="Reference">
              {{ data?.data?.data_reference?.unique_code ?? "-" }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Penerbit">
              {{ data?.data?.vendor?.name ?? "" }}
            </el-descriptions-item>
            <!-- <el-descriptions-item label="Status">
              <el-tag
                :type="
                  getStatusTagType(data?.data?.status ?? PaymentStatus.DRAFT)
                "
                >{{ formatStatus(data?.data?.status ?? null) }}</el-tag
              >
            </el-descriptions-item> -->
            <el-descriptions-item
              label="Pembayaran"
              v-if="data?.data?.payment_term_id"
            >
              <p>{{ data?.data?.payment_terms?.name }}</p>
            </el-descriptions-item>
            <el-descriptions-item label="Metode Pembayaran">
              <el-tag
                :type="
                  getPaymentMethodTagType(
                    data?.data?.payment_method ?? PaymentMethod.BankTransfer
                  )
                "
              >
                {{
                  formatPaymentMethod(
                    data?.data?.payment_method ?? PaymentMethod.BankTransfer
                  )
                }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item
              label="Status"
              v-if="data?.data?.status == PaymentStatus.PAID"
            >
              <el-tag :type="getStatusTagType(data?.data?.status)">
                {{ data?.data?.status.toUpperCase() }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- <el-descriptions
        title="Alamat Penagihan"
        v-if="data?.data?.billing_address"
      >
        <el-descriptions-item label="">{{
          data?.data?.billing_address
            ? generateAddressView(data?.data?.billing_address) +
              `, ${data.data.billing_address?.codepos}`
            : "-"
        }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="Catatan" v-if="data?.data?.notes">
        <el-descriptions-item label="">{{
          data.data.notes
        }}</el-descriptions-item>
      </el-descriptions> -->

      <h5 class="font-bold text-black text-1xl mt-6">Alamat Penagihan</h5>
      <span class="text-sm text-gray-500 pl-5">{{
        data?.data?.billing_address
          ? generateAddressView(data?.data?.billing_address) +
            `, ${data.data.billing_address?.codepos}`
          : "-"
      }}</span>
      <h5 class="font-bold text-black text-1xl mt-6">Catatan</h5>
      <span
        class="text-sm text-gray-500 flex flex-col p-2"
        v-html="`${formattedText(data?.data?.notes ?? '')}`"
      ></span>
      <h5 class="font-bold text-black text-1xl mt-6">Lampiran</h5>
      <el-descriptions title="" :column="1" size="small" border>
        <el-descriptions-item
          :label="`[${getDisplayFileType(file.type)}]`"
          v-for="(file, key) in data?.data?.files"
          :key="key"
        >
          <NuxtLink
            class="text-blue-600 text-sm pl-5"
            :href="`${imageUrl}/${file.image_path}/${file.filename}`"
            target="_blank"
            >{{ file.filename_original }}</NuxtLink
          >
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Invoice Items</span>
        </div>
      </template>
      <el-table :data="data?.data?.invoice_item" border>
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
      <el-table :data="data?.data?.purchase_order_bank ?? []" border>
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
        <el-descriptions-item :width="100" label="Total Price" align="right">{{
          currency(totalAmount || 0, 0)
        }}</el-descriptions-item>
        <el-descriptions-item
          :width="100"
          v-if="data?.data?.payment_terms"
          :label="data?.data?.payment_terms?.name"
          align="right"
          >{{ currency(data?.data?.subtotal || 0, 0) }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (data?.data?.reference_transaction ?? []).filter(
            (value) =>
              value.adjustments_transaction?.operator == 'plus' &&
              value.adjustments_transaction?.category == 'adjustment'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustments_transaction?.name ?? ''"
          >{{
            currency(showTransactionAdjustmentValue(ref), 0)
          }}</el-descriptions-item
        >

        <!-- <el-descriptions-item
          :width="100"
          v-if="
            (data?.data?.reference_transaction ?? []).filter(
              (value) =>
                value.adjustments_transaction?.operator == 'plus' &&
                value.adjustments_transaction?.category == 'adjustment'
            ).length > 0
          "
          label="Subtotal"
          align="right"
          >{{ currency(totalPlus) }}</el-descriptions-item
        > -->
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (data?.data?.reference_transaction ?? []).filter(
            (value) => value.adjustments_transaction?.operator == 'minus'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustments_transaction?.name ?? ''"
          >{{
            currency(showTransactionAdjustmentValue(ref), 0)
          }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          align="right"
          v-for="ref in (data?.data?.reference_transaction ?? []).filter(
            (value) =>
              value.adjustments_transaction?.category == 'transform' ||
              value.adjustments_transaction?.category == 'tax'
          )"
          :key="ref.adjustment_id"
          :label="ref.adjustments_transaction?.name ?? ''"
          >{{
            currency(showTransactionAdjustmentValue(ref), 0)
          }}</el-descriptions-item
        >
        <!-- <el-descriptions-item
          :width="100"
          v-if="data?.data?.payment_terms"
          :label="data?.data?.payment_terms.name"
          align="right"
          >{{ currency(paidAmount) }}</el-descriptions-item
        >
        <el-descriptions-item
          :width="100"
          v-if="!data?.data?.payment_terms"
          label="Grand Total"
          align="right"
          >{{ currency(paidAmount) }}</el-descriptions-item
        > -->
        <el-descriptions-item :width="100" label="Grand Total" align="right">{{
          currency(data?.data?.total_amount || 0)
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Histori Pembayaran</span>
        </div>
      </template>
      <el-table :data="data?.data?.history_payment ?? []" border>
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

    <el-dialog v-model="dialogDecision" title="Approval Invoice" width="500">
      <el-form
        :model="ruleFormDecision"
        :rules="rulesDecision"
        :label-position="'top'"
        ref="ruleFormRef"
      >
        <el-form-item label="Reason">
          <el-input v-model="ruleFormDecision.decision_note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeModalDecision">Cancel</el-button>
          <el-button type="primary" @click="() => submitDecision(ruleFormRef)">
            Kirim
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="dialogFakturPajak"
      title="Upload Faktu Pajak"
      width="800"
    >
      <el-upload
        class="upload-demo"
        drag
        :file-list="internalFileList"
        :on-change="handleChangeUploadFile"
        :auto-upload="false"
        :disabled="loading || status == 'pending'"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop directory here or <em>click to upload</em>
        </div>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFakturPajak = false">Cancel</el-button>
          <el-button type="primary" @click="submitFakturPajak">
            Simpan
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="tsx" setup>
import {
  Delete,
  Edit,
  CircleCheck,
  ArrowDown,
  Upload,
  UploadFilled,
} from "@element-plus/icons-vue";
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
import { generateAddressView, currency } from "#imports";
import type { FormInstance, UploadProps, UploadUserFile } from "element-plus";
import {
  AppFileReference,
  AppFileType,
  getDisplayFileType,
} from "~/types/file";
import { formattedText } from "#imports";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Invoice Detail",
});

const router = useRouter();
const route = useRoute();
const invoiceId = ref<string>(route.params.id as string);

const config = useRuntimeConfig();
const imageUrl = config.public.baseImageURL;

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
const dialogDecision = ref(false);
const dialogFakturPajak = ref<boolean>(false);
// const invoiceData = ref<Invoice | null>(null);

const internalFileList = ref<UploadUserFile[]>([]);

const ruleFormRef = ref<FormInstance>();
const ruleFormDecision = reactive<{
  unique_id: string;
  status: PaymentStatus;
  decision_note: string;
}>({
  unique_id: "",
  status: PaymentStatus.APPROVED,
  decision_note: "",
});

const rulesDecision = reactive({
  unique_id: [
    { required: true, message: "Unique ID is Required", trigger: "blur" },
  ],
  status: [{ required: true, message: "Status is Required", trigger: "blur" }],
  decision_note: [
    { required: true, message: "Note is Required", trigger: "blur" },
  ],
});

const { data, refresh, status } = await useAsyncData(
  "detail-invoice",
  async () => {
    const res = await useFetchApi<BaseResponse<Invoice>>(
      `/invoice-read/${route.params.id}`,
      "detail-invoice",
      "get",
      null
    );
    return res.data.value;
  }
);

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

const handleChangeUploadFile: UploadProps["onChange"] = (
  uploadFile,
  uploadFiles
) => {
  console.log("file upload", uploadFiles);
  internalFileList.value = uploadFiles; // Memicu watch dan emit ke parent
};

// Calculation functions
const calculateSubtotal = () => {
  if (!data?.value?.data?.invoice_item) return 0;
  return data?.value?.data?.invoice_item.reduce(
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

    formData.append("unique_id", `${data?.value?.data?.unique_id}`);
    formData.append("status", `${command}`);

    if (
      command == PaymentStatus.APPROVED ||
      command == PaymentStatus.REJECTED
    ) {
      formData.append("decision_note", ruleFormDecision.decision_note);
    }

    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "invoice-out-create",
      "post",
      formData
    );

    if (response.status.value == "success") {
      const invoiceData: Invoice | null = response.data.value?.data ?? null;
      if (invoiceData) {
        refresh();
        dialogDecision.value = false;
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

const closeModalDecision = async () => {
  ruleFormRef.value?.resetFields();
  dialogDecision.value = false;
};
const decision = async (status: PaymentStatus) => {
  ruleFormDecision.status = status;
  ruleFormDecision.unique_id = data.value?.data?.unique_id ?? "";
  ruleFormDecision.decision_note = "";
  dialogDecision.value = true;
};
const submitDecision = async (formEl: FormInstance | undefined) => {
  console.log("formEl", formEl);
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      handleStatus(ruleFormDecision.status);
    }
  });
};

const submitFakturPajak = async () => {
  loading.value = true;

  if (internalFileList.value.length == 0) {
    loading.value = false;
    ElMessage.error("Upload Faktur Pajak Terlebih Dahulu!");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("unique_id", `${data.value?.data?.unique_id}`);
    formData.append("status", `${PaymentStatus.RECEIVED}`);

    formData.append("files[0][reference]", AppFileReference.INVOICES);
    formData.append(
      "files[0][reference_id]",
      data.value?.data?.unique_id ?? ""
    );
    formData.append("files[0][type]", AppFileType.FAKTUR_PAJAK);
    formData.append("files[0]", internalFileList.value[0].raw as Blob);

    const response = await useFetchApi(
      "/invoice-create",
      "upload-file-faktur",
      "post",
      formData
    );
    if (response.status.value === "success") {
      ElMessage.success("Berhasil Upload Faktur Pajak!");
      dialogFakturPajak.value = false;
      refresh();
    }
  } catch (error: any) {
    ElMessage.error("Gagal Upload Faktu Pajak");
  } finally {
    loading.value = false;
  }
};

const sendApproval = async () => {
  await ElMessageBox.confirm("Yakin ingin mengajukan invoice?", "Warning", {
    confirmButtonText: "Ajukan Sekarang",
    cancelButtonText: "Batal",
    type: "warning",
  });

  try {
    handleStatus(PaymentStatus.WAITING);
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};
const cancelSendApproval = async () => {
  await ElMessageBox.confirm(
    "Yakin ingin membatalkan pengajuan invoice?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  );

  try {
    handleStatus(PaymentStatus.DRAFT);
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};
const declineApproval = async () => {
  await ElMessageBox.confirm(
    "Yakin ingin membatalkan pengajuan invoice?",
    "Warning",
    {
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      type: "warning",
    }
  );

  try {
    handleStatus(PaymentStatus.DRAFT);
  } catch (error: any) {
    ElMessage.error(error?.response?.message ?? error);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatPaymentMethod = (method: PaymentMethod | null) => {
  if (!method) return "-";
  return method.charAt(0).toUpperCase() + method.slice(1);
};

const paidAmount = computed(() => {
  let amount: number = Number(grandTotal.value);
  console.log("payment term", data.value?.data?.payment_terms);
  // if (data.value?.data?.payment_terms) {
  //   amount =
  //     Number(grandTotal.value) *
  //     (Number(data.value?.data?.payment_terms?.value) / 100);
  // }

  return amount;
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
    (data?.value?.data?.subtotal || 0) -
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
          reference_id: [data?.value?.data?.reference_id],
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
  if (!data?.value?.data) return;

  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("unique_id", data?.value?.data?.unique_id);
    formData.append("status", status);
    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "update-status",
      "post",
      formData
    );
    if (response.status.value == "success") {
      data.value!.data!.status = status;
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

    formData.append("unique_id", `${data?.value?.data?.unique_id}`);
    formData.append("status", PaymentStatus.PAID);
    const response = await useFetchApi<BaseResponse<Invoice>>(
      "/invoice-create",
      "update-status",
      "post",
      formData
    );
    if (response.status.value == "success") {
      data.value!.data!.status = PaymentStatus.PAID;
      ElMessage.success("Invoice marked as paid");
    }
    refresh();
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
    //   method: "DELETE",
    // });

    const response = await useFetchApi<BaseResponse<any>>(
      "/invoice-delete",
      "delete-invoice",
      "post",
      [invoiceId.value]
    );

    if (response.status.value == "success") {
      ElMessage.success("Invoice deleted");
      router.push("/finance-management/invoice");
    }
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

  const formatted = formatLocalDate(data.value?.data?.invoice_date!);

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
  doc.text(
    `${data.value?.data?.is_performa ? "PERFORMA INVOICE" : "INVOICE"}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );

  // ================= INFO =================

  const labelX = marginX;
  const colonX = marginX + 28;
  const valueX = marginX + 32;

  doc.setFontSize(9);
  doc.text("Number", labelX, 60);
  doc.text(":", colonX, 60);
  doc.text(`${data?.value?.data?.unique_code}`, valueX, 60);
  doc.text(`Jakarta, ${formatted}`, pageWidth - marginX, 60, {
    align: "right",
  });

  doc.text("Subject", labelX, 66);
  doc.text(":", colonX, 66);
  doc.text(`${data?.value?.data?.subject ?? "-"}`, valueX, 66);
  // doc.text("Quotation", labelX, 72);
  // doc.text(":", colonX, 72);
  // doc.text(`${"-"}`, valueX, 72);
  doc.text("PO Number/Ref", labelX, 72);
  doc.text(":", colonX, 72);
  doc.text(
    `${
      ((data?.value?.data?.data_reference as PurchaseOrder) || null)
        ?.unique_code ||
      data?.value?.data?.reference_number ||
      ""
    }`,
    valueX,
    72
  );

  doc.text("To", labelX, 87);
  doc.text(":", colonX, 87);
  doc.text(
    `${
      data?.value?.data?.type == "in"
        ? data?.value?.data?.vendor_name
        : data?.value?.data?.customer_name ?? "-"
    }`,
    valueX,
    87
  );
  doc.text("PIC", labelX, 93);
  doc.text(":", colonX, 93);
  doc.text(`${data?.value?.data?.pic_name ?? "-"}`, valueX, 93);
  doc.text("Address", labelX, 99);
  doc.text(":", colonX, 99);
  doc.text(
    `${generateAddressView(data?.value?.data?.billing_address!)}`,
    valueX,
    99
  );

  let rowData: RowInput[] = (data?.value?.data?.invoice_item ?? []).map(
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

  let summeryNumber = (data?.value?.data?.invoice_item ?? []).length + 1;

  summeryNumber++;
  rowData.push([
    {
      content: `Total Price`,
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
      content: `${currencyWithoutSymbol(totalAmount.value)}`,
      styles: {
        halign: "right",
        cellWidth: 0.0,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fillColor: [255, 255, 255],
      },
    },
  ]);

  (data?.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        value.adjustments_transaction?.operator == "plus" &&
        value.adjustments_transaction?.category == "adjustment"
    )
    .forEach((element) => {
      if (
        (
          element.adjustment || element.adjustments_transaction
        )?.name.toLowerCase() !== "pembulatan ke atas"
      ) {
        rowData.push([
          {
            content: `${element.adjustments_transaction?.name}`,
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
            content: `${currencyWithoutSymbol(
              showTransactionAdjustmentValue(element)
            )}`,
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
    });

  if (data.value?.data?.payment_terms && data.value.data.is_termin) {
    rowData.push([
      {
        content: `${data.value?.data?.payment_terms?.name}`,
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
        content: `${currencyWithoutSymbol(data.value.data.subtotal || 0)}`,
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

  // if (
  //   (data?.value?.data?.reference_transaction ?? []).filter(
  //     (value) =>
  //       value.adjustments_transaction?.operator == "plus" &&
  //       value.adjustments_transaction?.category == "adjustment"
  //   ).length > 0
  // ) {
  //   rowData.push([
  //     {
  //       content: `Subtotal`,
  //       colSpan: 5,
  //       styles: {
  //         halign: "right",
  //         fontStyle: "bold",
  //         cellWidth: 0.0,
  //         lineWidth: 0.1,
  //         lineColor: [0, 0, 0],
  //         fillColor: [255, 255, 255],
  //       },
  //     },
  //     {
  //       content: `${currencyWithoutSymbol(totalPlus.value)}`,
  //       styles: {
  //         halign: "right",
  //         cellWidth: 0.0,
  //         lineWidth: 0.1,
  //         lineColor: [0, 0, 0],
  //         fillColor: [255, 255, 255],
  //       },
  //     },
  //   ]);
  // }

  (data?.value?.data?.reference_transaction ?? [])
    .filter((value) => value.adjustments_transaction?.operator == "minus")
    .forEach((element) => {
      if (
        (
          element.adjustment || element.adjustments_transaction
        )?.name.toLowerCase() != "pembulatan ke bawah"
      ) {
        rowData.push([
          {
            content: `${element.adjustments_transaction?.name}`,
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
            content: `${currencyWithoutSymbol(
              data.value?.data?.subtotal || 0
            )}`,
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
    });
  (data?.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        value.adjustments_transaction?.category == "transform" ||
        value.adjustments_transaction?.category == "tax"
    )
    .forEach((element) => {
      rowData.push([
        {
          content: `${element.adjustments_transaction?.name}`,
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
          content: `${currencyWithoutSymbol(
            showTransactionAdjustmentValue(element)
          )}`,
          styles: {
            halign: "right",
            cellWidth: 0.0,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
          },
        },
      ]);
    });
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
      content: `${currencyWithoutSymbol(data.value?.data?.total_amount || 0)}`,
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
    head: [["No", "Item", "Qty", "UoM", "Price", "Total Price"]],
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

  const checkPageBreak = (doc: jsPDF, y: number, marginBottom = 20) => {
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y > pageHeight - marginBottom) {
      doc.addPage();
      return 20; // reset ke atas
    }

    return y;
  };

  let finalY = checkPageBreak(doc, (doc as any).lastAutoTable.finalY + 10);

  let yNotes = finalY + 5;
  yNotes = checkPageBreak(doc, yNotes);
  doc.text("Notes:", 10, yNotes);

  if (data?.value?.data?.notes && data?.value?.data?.notes != "-") {
    const splits = `${data?.value?.data?.notes}`.split("\n");

    let yFinal = yNotes + 5;
    splits.forEach((value) => {
      yFinal += 5;
      yFinal = checkPageBreak(doc, yFinal);
      doc.text(`\u2022 ${value ?? "-"}`, 20, yFinal);
    });
  }

  // Signature
  // doc.text("Approved By,", 10, finalY + 50);

  // if (data?.value?.data?.type === "in") {
  //   doc.text(data?.value?.data?.vendor_name ?? "", 10, finalY + 80);
  // } else {
  //   doc.text("Stanislaus Adrian Pratama,", 10, finalY + 80);
  //   doc.text("Operation Manager", 10, finalY + 85);
  // }

  const labelXBank = marginX;

  const leftX = pageWidth * 0.25;
  const rightX = pageWidth * 0.75;

  const bankInfoDetailX = leftX - 30;
  const colonXBank = bankInfoDetailX + 15;
  const valueXBank = bankInfoDetailX + 20;

  // let startY = 150;

  let valueY = finalY + 50;
  valueY = checkPageBreak(doc, valueY);

  const signY = valueY;

  doc.setFontSize(8);

  doc.setFont("helvetica", "bold");
  doc.text("Payment Information".toUpperCase(), leftX, valueY, {});
  // let valueY = finalY + 50;

  doc.setFont("helvetica", "normal");
  (data.value?.data?.purchase_order_bank ?? []).forEach((element) => {
    valueY += 10;
    valueY = checkPageBreak(doc, valueY);

    doc.text("Bank", bankInfoDetailX, valueY);
    doc.text(":", colonXBank, valueY);
    doc.text(`${element.bank?.bank_name}`, valueXBank, valueY);

    valueY += 5;
    valueY = checkPageBreak(doc, valueY);

    doc.text("Name", bankInfoDetailX, valueY);
    doc.text(":", colonXBank, valueY);
    doc.text(`${element.bank?.account_name}`, valueXBank, valueY);

    valueY += 5;
    valueY = checkPageBreak(doc, valueY);

    doc.text("Number", bankInfoDetailX, valueY);
    doc.text(":", colonXBank, valueY);
    doc.text(`${element.bank?.account_number}`, valueXBank, valueY);
  });

  // let signY = finalY + 50;
  // signY = checkPageBreak(doc, signY);

  doc.setFont("helvetica", "bold");
  doc.text(`Approved By`.toUpperCase(), rightX, signY, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  if (data?.value?.data?.type === "in") {
    doc.text(data?.value?.data?.vendor_name ?? "", rightX, signY + 40, {
      align: "center",
    });
  } else {
    doc.text(
      `${data.value?.data?.approved?.name || "-"},`,
      rightX,
      signY + 34,
      {
        align: "center",
      }
    );
    doc.text(
      `${data.value?.data?.approved?.departement_name || ""}`,
      rightX,
      signY + 40,
      {
        align: "center",
      }
    );
  }

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

const downloadPdf = () => {
  if (!pdfBlob.value) {
    ElMessage.warning("Tidak ada PDF untuk di-download");
    return;
  }

  const filename = `INV-${data?.value?.data?.unique_code || "document"}.pdf`;

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
        data?.value?.data?.reference_transaction ?? []
      ).find((value) => value.adjustments_transaction?.unique_code == "DPPL");
      if (dpp) {
        const dppValue = getDPPFormula(dpp, data.value?.data?.subtotal || 0);
        return getPPNFormula(ref, dppValue || data.value?.data?.subtotal);
      } else {
        return getPPNFormula(ref, data.value?.data?.subtotal || 0);
      }
    } else {
      return ref.type == "amount"
        ? ref.amount
        : displayAmount(ref, data.value?.data?.subtotal || 0);
    }
  }
};

const getPlus = computed(() => {
  var plus = 0;

  (data?.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        value.adjustments_transaction?.operator == "plus" &&
        value.adjustments_transaction?.category === "adjustment"
    )
    .forEach((ref) => {
      if (ref.include == false) {
        plus += showTransactionAdjustmentValue(ref);
      }
    });

  console.log("get plus", plus);

  return plus;
});

const dppComponent = computed(() => {
  return (data?.value?.data?.reference_transaction ?? []).find(
    (value) =>
      value.adjustments_transaction?.category == "transform" &&
      value.adjustments_transaction?.unique_code == "DPPL"
  );
});

const ppnComponent = computed(() => {
  const ppnComponentRef = (data?.value?.data?.reference_transaction ?? []).find(
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

// const getPaymentTerms = () => {
//   let amount: number = Number(grandTotal.value);
//   if (data.value?.data?.payment_terms) {
//     amount =
//       Number(grandTotal.value) * (Number(ruleForm.payment_terms?.value) / 100);
//   }
// }

const totalAmount = computed(() => {
  return (data?.value?.data?.invoice_item || []).reduce((total, ref) => {
    return total + Number(ref.total_amount || 0);
  }, 0);
});

const grandTotal = computed(() => {
  let total = totalPlus.value || 0;
  (data?.value?.data?.reference_transaction ?? [])
    .filter((value) => value.adjustments_transaction?.operator == "minus")
    .forEach((element) => {
      total = (totalPlus.value || 0) - showTransactionAdjustmentValue(element);
    });
  (data?.value?.data?.reference_transaction ?? [])
    .filter(
      (value) =>
        value.adjustments_transaction?.category == "transform" ||
        value.adjustments_transaction?.category == "tax"
    )
    .forEach((element) => {
      if (element.include == false) {
        console.log("total plus", totalPlus.value);
        console.log("adjustment", element);
        total =
          (totalPlus.value || 0) + showTransactionAdjustmentValue(element);
      }
    });

  console.log("total plus", totalPlus.value);

  return total;
});

const getMinus = computed(() => {
  var minus = 0;
  (data?.value?.data?.reference_transaction ?? [])
    .filter((value) => value.adjustments_transaction?.operator == "minus")
    .forEach((ref) => {
      if (ref.include == false) {
        minus += Number(ref.amount);
      }
    });

  return minus;
});

const subtotal = computed(() => {
  return data.value?.data?.subtotal || 0;
});
const totalPlus = computed(() => {
  console.log("subtotal", subtotal.value);
  return Number(subtotal.value) + Number(getPlus.value);
});
const totalMinus = computed(() => {
  return Number(totalPlus.value) - Number(getMinus.value);
});

const onRefresh = () => {
  refresh();
};
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
