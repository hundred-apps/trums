<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Transaction - {{ data?.data?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <div v-loading="status == 'pending'" v-if="data?.data">
      <el-card
        class="my-3"
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
              :to="`/finance-management/transaction/add?id=${data?.data?.unique_id}`"
              class="el-button el-button--primary"
            >
              <el-icon class="me-2"><Edit /></el-icon> Edit
            </NuxtLink>
          </div>
        </template>

        <div class="flex gap-3 my-3">
          <div class="flex-1">
            <el-descriptions title="" :column="1" size="small" border>
              <el-descriptions-item label="Tipe">
                <el-tag :type="getTagColor(data?.data?.type!)">
                  {{ getTagValue(data?.data?.type!) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Tanggal">
                {{ data?.data?.date ? formatLocalDate(data?.data?.date) : "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Dibuat Pada">
                {{
                  data?.data?.created_at
                    ? formatLocalDate(data?.data?.created_at)
                    : "-"
                }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="flex-1">
            <el-descriptions title="" :column="1" size="small" border>
              <el-descriptions-item label="Total">
                <span
                  :class="
                    data?.data?.type === 'income'
                      ? 'text-green-500'
                      : 'text-red-500'
                  "
                  class="font-bold"
                >
                  {{ currency(data?.data?.amount || 0) }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="Metode Pembayaran">
                {{ getPaymentMethodLabel(data?.data?.payment_method!) || "-" }}
              </el-descriptions-item>
              <el-descriptions-item label="Dibuat Oleh">
                {{ data?.data?.people?.name || "-" }}
              </el-descriptions-item>
              <el-descriptions-item
                label="Lampiran"
                v-if="data?.data?.files?.length"
              >
                <div class="flex flex-wrap gap-2">
                  <el-tag
                    v-for="(file, index) in data.data.files"
                    :key="index"
                    @click="
                      openFile(
                        `${imageApiUrl}${file.image_path}/${file.filename}`
                      )
                    "
                    class="cursor-pointer"
                  >
                    {{ file.filename_original }}
                  </el-tag>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <div class="flex gap-3 my-3">
          <div class="flex-1">
            <h3 class="mb-2 font-boldw">Informasi Bank Sumber</h3>
            <el-descriptions title="" :column="1" size="small" border>
              <el-descriptions-item label="Bank">
                {{ data?.data?.bank_account?.bank_name }}
              </el-descriptions-item>
              <el-descriptions-item label="Nama">
                {{ data?.data?.account_bank_name }}
              </el-descriptions-item>
              <el-descriptions-item label="Nomor">
                {{ data?.data?.account_bank_number }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="flex-1">
            <h3 class="mb-2 font-bold">Informasi Bank Tujuan</h3>
            <el-descriptions title="" :column="1" size="small" border>
              <el-descriptions-item label="Bank">
                {{ data?.data?.bank_account_to?.bank_name }}
              </el-descriptions-item>
              <el-descriptions-item label="Nama">
                {{ data?.data?.account_bank_to_name }}
              </el-descriptions-item>
              <el-descriptions-item label="Nomor">
                {{ data?.data?.account_bank_to_number }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <h3 v-if="data?.data?.description" class="mb-2 font-bold mt-3">
          Deskripsi
        </h3>
        <div
          class="text-sm"
          v-if="data?.data?.description"
          v-html="extractDescription(data?.data?.description)"
        ></div>
      </el-card>

      <!-- Transaction Items -->
      <el-card class="mb-3">
        <template #header>
          <div class="card-header">
            <span>Transaction Items</span>
          </div>
        </template>
        <TransactionItemTable
          v-if="data.data"
          :transaction_id="data.data.unique_id"
        />
      </el-card>
    </div>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit } from "@element-plus/icons-vue";
import type { Transaction, TransactionItem } from "~/types/finance/transaction";
import type { BaseResponse } from "~/types/response";
import { formatLocalDate, currency } from "#imports";
import { useCookie } from "#imports";
import { getPaymentMethodLabel, PaymentMethod } from "~/types/finance/bill";
import { getTagColor, getTagValue } from "~/types/finance/transaction";
import { extractDescription } from "#imports";
import TransactionItemTable from "./components/TransactionItemTable.vue";

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "transactions-read",
  name: "Transaction Detail",
});

const config = useRuntimeConfig();
const imageApiUrl = config.public.baseImageURL;
const router = useRouter();
const route = useRoute();
const transactionId = ref<string>(route.params.id as string);

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
const { data, status, refresh } = await useAsyncData(
  "get-transaction",
  async () => {
    const res = await useFetchApi<BaseResponse<Transaction>>(
      `/transaction-read/${transactionId.value}`,
      "get-transaction",
      "get",
      null
    );
    return res.data.value;
  }
);

const goBack = () => router.back();

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const openFile = (fileUrl: string) => {
  console.log(fileUrl);
  window.open(fileUrl, "_blank");
};

const confirmDelete = () => {
  ElMessageBox.confirm("Yakin Ingin Menghapus Data ini?", "Warning", {
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    type: "warning",
  })
    .then(async () => {
      await deleteTransaction();
    })
    .catch(() => {
      // Cancel
    });
};

const deleteTransaction = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/transaction-delete/`,
      "delete-transaction",
      "post",
      [transactionId.value]
    );
    if (response.status.value == "success") {
      ElMessage.success("Transaction deleted");
      goBack();
    }
  } catch (error) {
    ElMessage.error("Failed to delete transaction");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const getDocumentLink = (doc: any) => {
  switch (doc.type) {
    case "invoice":
      return `/invoices/${doc.reference_id}`;
    case "bill":
      return `/bills/${doc.reference_id}`;
    default:
      return "#";
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__body) {
  background-color: transparent;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

.text-green-500 {
  color: var(--el-color-success);
}

.text-red-500 {
  color: var(--el-color-danger);
}
</style>
