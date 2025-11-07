<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Tambah Transaksi Baru </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Simpan</el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
          </el-form-item>
        </div>
      </template>
      
      <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        status-icon
      >
        <!-- Transaction Type -->
        <el-form-item label="Jenis Transaksi" prop="type">
          <el-radio-group v-model="ruleForm.type">
            <el-radio-button label="income">Pemasukan</el-radio-button>
            <el-radio-button label="expense">Pengeluaran</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- Transaction Date -->
        <el-form-item label="Tanggal Transaksi" prop="date">
          <el-date-picker
            v-model="ruleForm.date"
            type="date"
            placeholder="Pilih Tanggal"
            format="DD/MM/YYYY"
            value-format="x"
          />
        </el-form-item>
        
        <!-- Amount -->
        <el-form-item label="Nominal" prop="amount">
          <el-input-number
            v-model="ruleForm.amount"
            :min="1"
            :step="1"
            :controls-position="'right'"
            class="w-full"
          />
        </el-form-item>
        
        <!-- Account -->
        <el-form-item label="Akun" prop="account_id">
          <el-select
            v-model="ruleForm.account_id"
            filterable
            placeholder="Pilih Akun"
            class="w-full"
            @change="handleAccountChange"
          >
            <el-option
              v-for="account in accounts"
              :key="account.unique_id"
              :label="account.name"
              :value="account.unique_id"
            />
          </el-select>
        </el-form-item>
        
        <!-- Description -->
        <el-form-item label="Deskripsi" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="Deskripsi transaksi"
          />
        </el-form-item>
        
        <!-- Reference Section -->
        <el-divider />
        <h3 class="text-lg font-medium mb-4">Informasi Referensi</h3>
        
        <el-form-item label="Tipe Referensi" prop="reference">
          <el-select
            v-model="ruleForm.reference"
            placeholder="Pilih Tipe"
            clearable
            class="w-full"
          >
            <el-option label="Invoice" value="invoice" />
            <el-option label="Bill" value="bill" />
            <el-option label="Lainya" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Nomor Referensi" prop="reference_number">
          <el-autocomplete
            :fetch-suggestions="querySearchReference"
            v-model="ruleForm.reference_number"
            placeholder="Cari Nomor Referensi"
            @select="onHandleSelectReference"
            :disabled="ruleForm.reference === ''"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.value }} <span class="text-gray-400 ml-2">{{ item.additionalInfo }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        
        
        
        <el-divider />
        <h3 class="text-lg font-medium mb-4">Informasi Bank</h3>
        
        <el-form-item :label="`Bank ${ruleForm.type === 'income' ? 'Penerima' : 'Tujuan'}`" prop="bank_view">
          <el-autocomplete
            :fetch-suggestions="querySearchBanks"
            v-model="ruleForm.bank_view"
            placeholder="Cari Rekening"
            @select="onHandleSelectedBank"
          >
            <template #default="{ item }">
              <div v-if="item.isNew" class="flex items-center text-blue-500">
                <el-icon><Plus /></el-icon>
                <span class="ml-2">Tambahkan "{{ item.value }}"</span>
              </div>
              <div v-else>
                {{ item.value }}
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { BankAccount } from '~/types/bank_account'
import { PaymentMethod, PaymentStatus, type Bill } from '~/types/finance/bill'
import type { Invoice } from '~/types/finance/invoice'

definePageMeta({
  middleware: ["auth", "app"],
})

const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const loading = ref(false)

// Sample data for dropdowns
const accounts = ref([
  { unique_id: 'acc_001', name: 'Kas Utama' },
  { unique_id: 'acc_002', name: 'Bank BCA' },
  { unique_id: 'acc_003', name: 'Bank Mandiri' },
])

const bankAccounts = ref<BankAccount[]>([
  {
    unique_id: '1',
    account_name: 'PT Tiyasa Makmur Pekasa',
    account_number: '1234567890',
    id: 1,
    bank_name: '',
    created_at: 0,
    created_by: 0,
    updated_at: 0
  },
  {
    unique_id: '2',
    account_name: 'PT Lobunta Mandiri Perkasa',
    account_number: '1234567890',
    id: 1,
    bank_name: '',
    created_at: 0,
    created_by: 0,
    updated_at: 0
  },
])

const invoices = ref<Invoice[]>([{
    unique_id: 'inv_0001',
    order_id: 1001,
    source_document: 'SO/202507/001',
    unique_code: 'INV/20250725/0001',

    customer_id: "101",
    customer_name: 'PT. Sumber Rejeki',
    customer_version: 1,

    billing_address_id: "201",
    billing_address_version: 1,

    invoice_date: Date.now(),
    due_date: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari dari sekarang

    is_tempo: true,
    payment_term_id: 1,
    payment_term_value: 7,
    payment_term_unit: 'days',

    payment_method: PaymentMethod.BankTransfer,
    recipient_bank: 301,
    account_bank_name: 'Bank Mandiri',
    account_bank_number: '1234567890',

    status: PaymentStatus.DRAFT,

    items: [{
      unique_id: 'item_001',
      unique_code: 'INV/ITEM/001',
      movement_id: 'mov_001',
      purchase_order_id: 'po_001',
      catalogue_id: 'cat_001',
      inventory_id: 'inv_001',
      item_version: 1,
      item_name: 'Produk A',
      uom: 'pcs',
      quantity: 10,
      price: 150000,
      total_amount: 1500000,
      created_at: Date.now(),
      created_by: 999,
      updated_at: Date.now()
    }],
    account_id: null,
    account_name: "",
    created_at: Date.now(),
    created_by: 999,
    updated_at: Date.now(),
    billing_address_view: '',
    note: null
}]);

const bills = ref<Bill[]>([{
    id: 1,
    unique_id: 'bill_0001',
    unique_code: 'BILL/INV/20250725/0001',
    bill_date: Date.now(),
    posted_date: null,
    due_date: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 hari dari sekarang

    to: "101",
    to_name: 'PT. Sumber Rejeki',
    to_version: 1,
    to_address_id: "201",
    to_address_version: 1,

    order_reference: 'PO/202507/003',

    recipient_bank: "301",
    accont_bank_name: 'Bank Mandiri',
    account_bank_number: '1234567890',

    tempo: true,

    payment_term_id: 1,
    payment_term_value: 7,
    payment_term_unit: 'days',

    payment_method: PaymentMethod.BankTransfer,

    total_amount: 1500000,
    status: PaymentStatus.DRAFT,

    account_id: 'acc_1101',
    account_name: 'Kas di Bank',

    created_at: Date.now(),
    created_by: 999,
    updated_at: Date.now(),
    note: null,
    items: [],
  }]);
// Form data structure
const ruleForm = reactive({
  unique_id: '',
  unique_code: '',
  type: 'income' as 'income' | 'expense',
  date: Date.now(),
  amount: 0,
  description: '',
  account_id: '',
  account_name: '',
  reference: '',
  reference_id: '',
  reference_number: '',
  bank_id: null as string | null,
  bank_view: '',
  account_bank_name: '',
  account_bank_number: '',
  created_at: Date.now(),
  created_by: 'current_user_id'
})

// Form validation rules
const rules = reactive<FormRules>({
  type: [{ required: true, message: 'Jenis transaksi wajib dipilih', trigger: 'blur' }],
  date: [{ required: true, message: 'Tanggal wajib diisi', trigger: 'blur' }],
  amount: [
    { required: true, message: 'Nominal wajib diisi', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Minimal nominal Rp 1', trigger: 'blur' }
  ],
  account_id: [{ required: true, message: 'Akun wajib dipilih', trigger: 'blur' }],
  description: [{ required: true, message: 'Deskripsi wajib diisi', trigger: 'blur' }],
  recipient_bank: [
    { 
      validator: (rule, value, callback) => {
        if (ruleForm.type === 'income' && !value && !ruleForm.account_bank_name) {
          callback(new Error('Pilih bank atau isi manual nama bank'))
        } else {
          callback()
        }
      },
      trigger: 'blur' 
    }
  ]
})

// Methods
const goBack = () => router.back()

const handleAccountChange = (accountId: string) => {
  const selectedAccount = accounts.value.find(acc => acc.unique_id === accountId)
  if (selectedAccount) {
    ruleForm.account_name = selectedAccount.name
  }
}

const querySearchReference =  (query: string, cb: (arg: any) => void) => {
  try {

      if(ruleForm.reference == 'invoice'){
          const invoiceFilter = invoices.value.filter(col => (col.unique_code ?? '').includes(query));
          console.log(query);

        if(invoiceFilter.length > 0){
            cb(invoiceFilter.map((value) => ({
                value: value.unique_code,
                unique_id: value.unique_id,
                reference: 'invoice',
            })));
        }else{
            cb([{
                value: query,
                isNew: true,
                keyword: query,
                reference: 'invoice',
            }]);
        }

    }else if(ruleForm.reference == 'bill'){
        const billFilter = bills.value.filter(col => query.includes(col.unique_code!.toString()));

        if(billFilter.length > 0){
            cb(billFilter.map((value) => ({
                value: value.unique_code,
                unique_id: value.unique_id,
                reference: 'invoice',
            })));
        }else{
            cb([{
                value: query,
                isNew: true,
                keyword: query,
                reference: 'invoice',
            }]);
        }
    }else {
        if(query != ''){
            cb([{
                value: query,
                isNew: true,
                keyword: query,
                reference: 'other',
            }]);
        }
    }

    
    
  } catch (error) {
    console.error('Failed to fetch customers', error)
    cb([])
  }
}
const querySearchBanks =  (query: string, cb: (arg: any) => void) => {
  try {

    const banks = bankAccounts.value.filter(col => (col.account_name ?? '').includes(query) || (col.account_number ?? '').includes(query));
          console.log(query);

    if(banks.length > 0){
        cb(banks.map((value) => ({
            value: `${value.account_name} (${value.account_number})`,
            unique_id: value.unique_id,
            data: value,
        })));
    }else{
        cb([{
            value: query,
            isNew: true,
            keyword: query,
        }]);
    }
    
  } catch (error) {
    console.error('Failed to fetch customers', error)
    cb([])
  }
}

const onHandleSelectedBank = (item: any) => {
  if (item.isNew) {
    ruleForm.reference_number = item.value;
  } else {
    const bank: BankAccount = item.data as BankAccount;
    ruleForm.bank_id = bank.unique_id;
    ruleForm.account_bank_name = bank.account_name;
    ruleForm.account_bank_number = bank.account_number;
    ruleForm.bank_view = item.value;
  }
}

const onHandleSelectReference = (item: any) => {
  console.log(item);
  if(item.reference != 'other'){
    if (item.isNew) {
      ruleForm.reference_number = item.value;
    } else {
      ruleForm.reference_number = item.value;
      ruleForm.reference = item.reference;
      ruleForm.reference_id = item.unique_id;
    }
  }else{
    ruleForm.reference_number = item.value;
  }
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // Generate transaction code
        // const transactionCode = `TRX/${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        
        const payload = ruleForm;

        // Simpan ke API
        // const response = await $fetch('/api/transactions', {
        //   method: 'POST',
        //   body: payload
        // })
        
        // Simulasi success
        console.log('Payload:', payload)
        ElMessage.success('Transaksi berhasil disimpan (simulasi)')
        // router.push('/finance-management/transaction')
        
      } catch (error) {
        console.error('Error saving transaction:', error)
        ElMessage.error('Gagal menyimpan transaksi')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  formEl.resetFields()
  Object.assign(ruleForm, {
    unique_id: '',
    unique_code: '',
    type: 'income',
    date: Date.now(),
    amount: 0,
    description: '',
    account_id: '',
    account_name: '',
    reference: '',
    reference_id: '',
    reference_number: '',
    recipient_bank: null,
    account_bank_name: '',
    account_bank_number: '',
    created_at: Date.now(),
    created_by: 'current_user_id'
  })
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-divider {
  margin: 20px 0;
}
</style>