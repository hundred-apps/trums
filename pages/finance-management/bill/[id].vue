<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Bill - {{ invoiceData?.unique_code }}
        </span>
      </template>
    </el-page-header>

    <el-card class="my-3" 
      v-loading="loading"
      element-loading-text="Loading..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(122, 122, 122, 0.8)"
    >
      <template #header>
        <div class="card-header flex justify-end">
          <el-button type="danger" :icon="Delete" @click="confirmDelete">Hapus</el-button>
          <NuxtLink :href="`/finance-management/bill/add/`" @click="() => {
            const cookie = useCookie('unique_id');
            cookie.value = invoiceData?.unique_id;
          }" class="el-button el-button--primary">
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button 
            type="success" 
            v-if="invoiceData?.status === PaymentStatus.UNPAID"
            @click="markAsPaid"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Mark as Paid
          </el-button>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Customer">
              {{ invoiceData?.customer_name ?? '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="Tanggal Invoice">
              {{ invoiceData?.invoice_date == null ? '-' : formatLocalDate(invoiceData?.invoice_date) }}
            </el-descriptions-item>
            <el-descriptions-item label="Tenggat Waktu">
              {{ invoiceData?.due_date == null ? '-' :formatLocalDate(invoiceData?.due_date) }}
            </el-descriptions-item>
            <el-descriptions-item label="Reference">
              {{ invoiceData?.data_reference?.unique_code ?? '-' }}
            </el-descriptions-item>
            
            
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title=""  :column="1" size="large" border>
            <el-descriptions-item label="Status">
              {{ formatStatus(invoiceData?.status ?? null) }}
            </el-descriptions-item>
            <el-descriptions-item label="Pembayaran">
              <p v-if="invoiceData?.payment_term == PaymentTerm.TEMPO">{{ invoiceData?.payment_term_value ?? '-' }} ({{ invoiceData?.payment_term_unit }})</p>
              <p v-else>{{ (invoiceData?.payment_term ?? '-').toUpperCase() }}</p>
            </el-descriptions-item>
            <el-descriptions-item label="Metode Pembayaran">
              <el-tag :type="getPaymentMethodTagType(invoiceData?.payment_method ?? PaymentMethod.BankTransfer)">
                {{ formatPaymentMethod(invoiceData?.payment_method ?? PaymentMethod.BankTransfer) }}
              </el-tag>
            </el-descriptions-item>
            
            <el-descriptions-item class="text-right" label="Total Harus Dibayar">
              <div class="flex justify-end">
                <span class="font-bold text-end">{{ formatCurrency(invoiceData?.total_amount ?? 0) }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      

      

      <el-descriptions title="Alamat Penagihan" v-if="invoiceData?.billing_address">
        <el-descriptions-item label="">{{ invoiceData?.billing_address ? generateAddressView(invoiceData?.billing_address).name : '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="Catatan" v-if="invoiceData?.notes">
        <el-descriptions-item label="">{{ invoiceData.notes }}</el-descriptions-item>
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
        <el-table-column prop="price" label="Harga Satuan" width="200" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="Total" width="200" align="right">
          <template #default="scope">
            <span class="font-medium">{{ formatCurrency(scope.row.total_amount) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-card class="mb-3">
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
          <span>Rincian Pembayaran</span>
        </div>
      </template>
      
      <el-descriptions :column="1" border >
        <el-descriptions-item :width="100" label="Subtotal">{{ formatCurrency(invoiceData?.subtotal || 0) }}</el-descriptions-item>
        <el-descriptions-item :width="100" v-for="ref in invoiceData?.reference_transaction ?? []" :key="ref.adjustment_id" :label="ref.adjustments_transaction?.name ?? ''">{{ formatCurrency(ref.type == "amount" ? ref.amount : displayAmount(ref, (invoiceData?.subtotal || 0)) ) }}</el-descriptions-item>
        <el-descriptions-item :width="100" label="Grand Total">{{ formatCurrency(invoiceData?.total_amount || 0) }}</el-descriptions-item>
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
            {{ scope.row.transaction.unique_code }}
          </template>

        </el-table-column>
        
      </el-table>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, CircleCheck, ArrowDown } from '@element-plus/icons-vue'
import { twCookie } from 'nuxt-twemoji/emojis';
import type { AddressType } from '~/types/address';
import { PaymentStatus, PaymentMethod } from '~/types/finance/bill'
import type { Invoice, InvoiceItem } from '~/types/finance/invoice'
import type { BaseResponse } from '~/types/response';
import { PaymentTerm } from '~/types/scm/canvasing';

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "invoices-read",
  name: "Bill Detail",
});

const router = useRouter()
const route = useRoute()
const invoiceId = ref<string>(route.params.id as string)

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
`

const loading = ref(false)
const invoiceData = ref<Invoice | null>(null)
const payments = ref<any[]>([])

const availableStatuses = [
  PaymentStatus.DRAFT,
  PaymentStatus.UNPAID,
  PaymentStatus.PAID
]

const goBack = () => router.back()

// Fetch invoice data
const fetchInvoice = async () => {
  loading.value = true
  try {

    const response = await useFetchApi<BaseResponse<Invoice>>(`/invoice-read/${route.params.id}`, 'detail-invoice', 'get', null);


    if(response.status.value == 'success'){
      invoiceData.value = response.data.value?.data ?? null;
    }
  } catch (error) {
    ElMessage.error('Failed to fetch invoice data')
    goBack();
  } finally {
    loading.value = false
  }
}

// Calculation functions
const calculateSubtotal = () => {
  if (!invoiceData.value?.invoice_item) return 0
  return invoiceData.value.invoice_item.reduce((sum, item) => sum + (item.total_amount || 0), 0)
}

const calculateTax = () => {
  return calculateSubtotal() * 0.1 // Example 10% tax
}

const calculateTotalAmount = () => {
  return calculateSubtotal() + calculateTax()
}


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

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
    }
}

const formatPaymentMethod = (method: PaymentMethod | null) => {
  if (!method) return '-'
  return method.charAt(0).toUpperCase() + method.slice(1)
}

const formatStatus = (status: PaymentStatus | null) => {
  if (!status) return '-'
  return status.toUpperCase()
}

const getStatusTagType = (status: PaymentStatus | null): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case PaymentStatus.DRAFT: return 'info'
    case PaymentStatus.UNPAID: return 'danger'
    case PaymentStatus.PAID: return 'success'
    default: return 'primary'
  }
}

const getPaymentMethodTagType = (method: PaymentMethod | null): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (method) {
    case PaymentMethod.Cash: return 'primary'
    case PaymentMethod.BankTransfer: return 'success'
    case PaymentMethod.Giro: return 'warning'
    default: return 'info'
  }
}

// Actions
const updateStatus = async (status: PaymentStatus) => {
  if (!invoiceData.value) return
  
  loading.value = true
  try {
    const formData = new FormData()

    formData.append("unique_id", invoiceData.value.unique_id);
    formData.append("status", status);
    const response = await useFetchApi<BaseResponse<Invoice>>('/invoice-create', 'update-status', 'post', formData);
    if(response.status.value == 'success'){
      invoiceData.value.status = status;
      ElMessage.success('Invoice status updated')
    }  
    
  } catch (error) {
    ElMessage.error('Failed to update status')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const markAsPaid = async () => {
  loading.value = true
  try {
    const formData = new FormData()

    formData.append("unique_id", invoiceData.value!.unique_id);
    formData.append("status", PaymentStatus.PAID);
    const response = await useFetchApi<BaseResponse<Invoice>>('/invoice-create', 'update-status', 'post', formData);
    if(response.status.value == 'success'){
      invoiceData.value!.status = PaymentStatus.PAID;
      ElMessage.success('Invoice marked as paid')
    }  
    await fetchInvoice() // Refresh data
  } catch (error) {
    ElMessage.error('Failed to mark invoice as paid')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    'This will permanently delete the invoice. Continue?',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    await deleteInvoice()
  }).catch(() => {
    // Cancel
  })
}

const deleteInvoice = async () => {
  loading.value = true
  try {
    // await $fetch(`/api/invoices/${invoiceId.value}`, {
    //   method: 'DELETE'
    // })
    ElMessage.success('Invoice deleted')
    router.push('/finance-management/invoices')
  } catch (error) {
    ElMessage.error('Failed to delete invoice')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInvoice()
})
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