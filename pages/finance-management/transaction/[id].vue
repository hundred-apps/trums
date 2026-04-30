<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Transaction - {{ transactionData?.unique_code }}
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
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete"
            >Hapus</el-button
          >
          <NuxtLink
            :to="`/finance-management/transaction/add?id=${transactionData?.unique_id}`"
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Tipe">
              <el-tag
                :type="
                  transactionData?.type === 'income' ? 'success' : 'danger'
                "
              >
                {{ transactionData?.type?.toUpperCase() }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="CoA">
              {{ transactionData?.account?.name || "-" }}
              <span v-if="transactionData?.account">
                ({{ transactionData.account?.code }})
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="Tanggal">
              {{
                transactionData?.date
                  ? formatLocalDate(transactionData?.date)
                  : "-"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Dibuat Pada">
              {{
                transactionData?.created_at
                  ? formatLocalDate(transactionData?.created_at)
                  : "-"
              }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Total">
              <span
                :class="
                  transactionData?.type === 'income'
                    ? 'text-green-500'
                    : 'text-red-500'
                "
                class="font-bold"
              >
                {{ currency(transactionData?.amount || 0) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="Metode Pembayaran">
              {{
                getPaymentMethodLabel(transactionData?.payment_method!) || "-"
              }}
            </el-descriptions-item>
            <el-descriptions-item label="Dibuat Oleh">
              {{ transactionData?.people?.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item
              label="Lampiran"
              v-if="transactionData?.files?.length"
            >
              <div class="flex flex-wrap gap-2">
                <el-tag
                  v-for="(file, index) in transactionData.files"
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

      <el-descriptions title="Description">
        <el-descriptions-item label="">
          {{ transactionData?.description || "-" }}
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions title="Informasi Bank" :column="1" class="mt-5">
        <el-descriptions-item label="Bank">
          {{ transactionData?.bank_account?.bank_name || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="Nama">
          {{ transactionData?.bank_account?.account_name || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="Nomor Rekening">
          {{ transactionData?.bank_account?.account_number || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Transaction Items -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Transaction Items</span>
        </div>
      </template>
      <el-table :data="transactionData?.transaction_items" border>
        <el-table-column
          prop="reference_value"
          label="Item/Reference"
          width="300"
        >
          <template #default="scope">
            <div v-if="scope.row.reference_id">
              <p class="font-medium" v-if="scope.row.reference === 'bill'">
                <NuxtLink
                  class="text-blue-600"
                  :href="`/finance-management/bill/${scope.row.reference_id}`"
                  >{{ scope.row.reference_value }}</NuxtLink
                >
              </p>
              <p
                class="font-medium"
                v-else-if="scope.row.reference === 'invoice'"
              >
                <NuxtLink
                  class="text-blue-600"
                  :href="`/finance-management/invoice/${scope.row.reference_id}`"
                  >{{ scope.row.reference_value }}</NuxtLink
                >
              </p>
              <p class="font-medium" v-else>{{ scope.row.reference_value }}</p>
            </div>
            <span v-else>{{ scope.row.reference_value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" />
        <!-- <el-table-column prop="quantity" label="Qty" align="right" width="120">
          <template #default="scope">
            <p
              v-if="
                scope.row.reference == 'invoice' ||
                scope.row.reference == 'bill'
              "
            >
              {{ "-" }}
            </p>
            <p v-else>{{ scope.row.quantity || "-" }}</p>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="price_per_unit"
          label="Total Price"
          align="right"
          width="180"
        >
          <template #default="scope">
            <p>{{ formatCurrency(scope.row.price_per_unit || 0) }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" align="right" width="180">
          <template #default="scope">
            <span class="font-medium">
              {{ formatCurrency(scope.row.amount || 0) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-descriptions :column="1" border class="w-80">
          <el-descriptions-item label="Subtotal" align="right">
            {{ formatCurrency(calculateSubtotal()) }}
          </el-descriptions-item>
          <el-descriptions-item
            label="Total Amount"
            align="right"
            class="font-bold text-lg"
          >
            {{ formatCurrency(transactionData?.amount || 0) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit } from "@element-plus/icons-vue";
import type { Transaction, TransactionItem } from "~/types/finance/transaction";
import type { BaseResponse } from "~/types/response";
import { formatLocalDate, currency } from "#imports";
import { useCookie } from "#imports";
import { getPaymentMethodLabel, PaymentMethod } from "~/types/finance/bill";

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
const transactionData = ref<Transaction | null>(null);

const goBack = () => router.back();

const fetchTransaction = async () => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<Transaction>>(
      `/transaction-read/${transactionId.value}`,
      "get-transaction",
      "get",
      null
    );

    if (response.status.value == "success") {
      if (response.data.value?.data != null) {
        transactionData.value = response.data.value?.data as Transaction;
      } else {
        goBack();
      }
    }
  } catch (error) {
    ElMessage.error("Failed to fetch transaction data");
    goBack();
  } finally {
    loading.value = false;
  }
};

const calculateSubtotal = () => {
  if (!transactionData.value?.transaction_items) return 0;
  return transactionData.value.transaction_items.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
};

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

// Computed properties for related documents
const hasRelatedDocuments = computed(() => {
  return transactionData.value?.transaction_items?.some(
    (item) => item.reference_id && item.reference
  );
});

const relatedDocuments = computed(() => {
  if (!transactionData.value?.transaction_items) return [];

  return transactionData.value.transaction_items
    .filter((item) => item.reference_id && item.reference)
    .map((item) => ({
      type: item.reference,
      reference: item.reference_value,
      reference_id: item.reference_id,
      amount: item.amount,
    }));
});

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

onMounted(() => {
  fetchTransaction();
});
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
