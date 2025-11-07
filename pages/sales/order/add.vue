<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Sales Order </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3">
      <template #header>
        <div class="card-header">
          <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">Simpan</el-button>
            <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            <el-button @click="goBack">Batal</el-button>
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
        <!-- Vendor Selection -->
        <el-form-item label="Kontak" prop="vendor_name">
          <el-autocomplete
            :fetch-suggestions="querySearchCustomer"
            v-model="ruleForm.vendor_name"
            placeholder="Cari Kontak"
            @select="onHandleSelectVendor"
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

        <!-- Purchase Order Information -->
        <el-form-item label="Nomor Referensi" prop="source_document">
          <el-input v-model="ruleForm.sourcing_document" placeholder="Masukkan nomor referensi" />
        </el-form-item>
        
        <el-form-item label="Alamat Pengiriman" prop="delivery_address_id">
          <el-autocomplete
                v-model="ruleForm.delivery_address_view"
                :fetch-suggestions="querySearchAddress"
                :trigger-on-focus="false"
                clearable
                class="inline-input w-50"
                placeholder="Cari Alamat"
                @select="(record) => handleSelectAddress(record)"
            >
            <template #default="{ item }">
                <div class="name">{{ item.name }}</div>
                <span class="street text-sm">{{ item.street }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="Tanggal PO" prop="date">
          <el-date-picker
            v-model="ruleForm.date"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
        </el-form-item>

        <!-- <el-form-item label="Tempo Payment" prop="is_tempo">
          <el-switch v-model="ruleForm.is_tempo" />
        </el-form-item> -->

        <el-form-item label="Pembayaran" prop="payment_term">
          <el-select v-model="ruleForm.payment_term" placeholder="Select" style="width: 240px">
            <el-option
              v-for="item in [{value: PaymentTerm.CASH, label: 'CASH'}, {value: PaymentTerm.COD, label: 'COD'}, {value: PaymentTerm.CBD, label: 'CBD'},{value: PaymentTerm.TEMPO, label: 'TEMPO'}]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Durasi Tempo (Hari)" prop="tempo_value" v-if="ruleForm.payment_term === PaymentTerm.TEMPO">
          <el-input-number v-model="ruleForm.payment_term_value" :min="1"  />
        </el-form-item>

        

        <el-form-item label="Metode Pembayaran" prop="payment_method">
          <el-select 
            v-model="ruleForm.payment_method" 
            placeholder="Select payment method"
          >
            <el-option
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Estimasi Tiba" prop="expected_arrival">
          <el-date-picker
            v-model="ruleForm.expected_arrival!"
            type="date"
            placeholder="Pilih tanggal"
            style="width: 100%"
          />
        </el-form-item>
        

        <!-- Discount Section -->
        <el-form-item label="Diskon" prop="is_discount">
          <el-checkbox v-model="ruleForm.is_discount">Tambahkan diskon</el-checkbox>
        </el-form-item>

        <template v-if="ruleForm.is_discount">
          <el-form-item label="Nilai Diskon" prop="discount">
            <el-input-number
              v-model="ruleForm.discount"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Satuan Diskon" prop="discount_unit">
            <el-select v-model="ruleForm.discount_unit" placeholder="Pilih satuan" style="width: 100%">
              <el-option label="Persen (%)" value="percent" />
              <el-option label="Nominal" value="nominal" />
            </el-select>
          </el-form-item>
        </template>

        
        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option 
              v-for="status in purchaseOrderStatusOptions" 
              :key="status.value" 
              :label="status.label" 
              :value="status.value" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList" />
        </el-form-item>

        <el-form-item label="Informasi Tambahan" prop="additinal_information">
          <el-input v-model="ruleForm.additinal_information" type="textarea" placeholder="Masukkan informasi tambahan" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span>Items</span>
          <div class="flex space-x-2">
            <el-button type="primary" @click="openPricetagModal">
              Tambah item
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="ruleForm.items" border style="width: 100%">
        <el-table-column prop="catalogue_name" label="Item" width="300" />
        <el-table-column prop="quantity" label="Qty" width="200" align="center">
            <template #default="scope">
                <el-input-number v-model="scope.row.quantity" :min="1" />
            </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Satuan" width="100"/>
        <el-table-column prop="unit_price" label="Harga Satuan" align="right" width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_price" label="Total Harga" align="right" width="120">
          <template #default="scope">
            {{ formatCurrency(scope.row.quantity*scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column label="Garansi" width="120">
          <template #default="scope">
            <el-checkbox v-model="scope.row.is_warranty">Garansi</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="Waktu Garansi (Hari)" width="200">
          <template #default="scope">
            <el-input-number v-model="scope.row.warranty" :disabled="!scope.row.is_warranty" :min="1" />
          </template>
        </el-table-column>
        <el-table-column label="Aksi" width="100" fixed="right">
          <template #default="scope">
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              @click="removeItem(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header"><span>Biaya Lainya</span></div>
      </template>
      <div>
        <div class="flex justify-between items-center mb-2" v-for="ref in references">
          <span class="font-bold text-sm">{{ref.adjustment?.name ?? ''}}</span>
          <span class="text-sm flex">
            <el-input
              v-model="ref.amount"
              style="max-width: 300px"
              placeholder="Masukan Nilai"
              
            >
              <template #append>
                <el-select v-model="ref.type" :disabled="ref.changeType == false" style="width: 100px">
                  <el-option label="%" value="percent" />
                  <el-option label="Rp" value="amount" />
                </el-select>
              </template>
            </el-input>
            <el-button link type="danger" @click="() => removeReferenceTransaction(ref)"><el-icon><RemoveFilled /></el-icon></el-button>
          </span>
        </div>
      </div>
      
      <el-button class="mt-4" style="width: 100%" @click="visibleModalAdjustmentTransaction = true">
        Tambah Item
      </el-button>
    </el-card>

    <el-card class="mb-3" shadow="hover">
      <el-table :data="summeryData ?? []" style="width: 100%">
        <el-table-column label="" prop="label" width="300">
          <template #default="{ row }">
            <div class="font-bold">{{ row.label }}</div>
          </template>
        </el-table-column>
        <el-table-column label="" prop="value" align="right"/>
      </el-table>
    </el-card>

    <ModalAdjustmentTransaction 
      v-model:visible="visibleModalAdjustmentTransaction"
      @select-adjustment="handleSelectAdjustment"
      @create-new="visibleModalNewAdjustment = true"
      :data="adjustmentTransactions.data?.value?.data ?? []"
      :search-params="querySearchAdjustmentTransaction"
    />

    <el-dialog v-model="visibleModalNewAdjustment" title="Buat Biaya Lain" width="1000">
      <AddAdjustment @submit="handleAdjustmentSubmit" />
    </el-dialog>

    <el-dialog v-model="visiblePricetagModal" title="Pilih Item dari Pricetag" width="1000">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="12">
          <el-input
            v-model="pricetagSearch.keyword"
            placeholder="Cari item..."
            clearable
          />
        </el-col>
        <el-col :span="12">
          <el-button type="default" :icon="Plus" @click="() => {
            visibleModalPricetagNewItem = true;
          }">Buat Harga Baru</el-button>
        </el-col>
      </el-row>
      
      <el-table 
        :data="filteredPricetagItems.data.value?.data ?? []" 
        style="width: 100%"
        @selection-change="handlePricetagSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="catalogue.name" label="Item">
          <template #default="scope">
            {{ scope.row.catalogue?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="Harga" width="120" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_name" label="Satuan" width="100" />
        <el-table-column prop="pricetag.owner.name" label="Vendor">
          <template #default="scope">
            {{ scope.row.pricetag?.owner?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="min_order_quantity" label="Min. Order" width="100" />
      </el-table>

      <template #footer>
        <el-button @click="visiblePricetagModal = false">Batal</el-button>
        <el-button type="primary" @click="addSelectedPricetagItems">
          Tambahkan Selected ({{ selectedPricetagItems.length }})
        </el-button>
      </template>
    </el-dialog>
  </TrumsWrapper>

  <el-dialog v-model="dialogNewAddress" title="Buat Alamat Baru" width="500">
      <TrumsFormAddress @success="onAddressNew" @back="() => dialogNewAddress = false"  />
  </el-dialog>

  <el-dialog v-model="visibleModalPricetagNewItem" title="Buat Penawaran Baru" width="1000">
        <AddPriceTagComponent v-on:submit="() => {
          visibleModalPricetagNewItem = false;
          refreshNuxtData('search-pricetag-item')
        }" />
  </el-dialog>
</template>

<script lang="ts" setup>
import { Delete, Plus, RemoveFilled } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
import { PurchaseOrderItemStatus, PurchaseOrderStatus, type PurchaseOrder, type PurchaseOrderItem } from '~/types/scm/purchase_order'
import type { Contact } from '~/types/contact'
import { CanvassingVendorStatus, PaymentTerm, type CanvassingItem, type CanvassingVendor } from '~/types/scm/canvasing'
import type { Pricetag_item } from '~/types/pricetag'
import type { RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'
import type { BaseResponse } from '~/types/response'
import type { AddressType } from '~/types/address'
import TrumsUploadFile from '~/components/trums/form/TrumsUploadFile.vue'
import { DiscountUnit } from '~/types/scm/offers'
import { PaymentMethod } from '~/types/finance/bill'
import FormAddress from '~/components/trums/FormAddress.vue'
import AddPriceTagComponent from '~/components/trums/AddPriceTagComponent.vue'
import { ReferenceAdjustment, type AdjustmentTransaction, type ReferenceTransactionAdjustment } from '~/types/attribute_adjustment'
import ModalAdjustmentTransaction from '~/components/trums/ModalAdjustmentTransaction.vue'
import AddAdjustment from '~/components/trums/AddAdjustment.vue'

const fileList = ref<UploadUserFile[]>([])

const router = useRouter()

const ruleFormRef = ref<FormInstance>()
const loading = ref(false)
const dialogNewAddress = ref(false)
const visibleModalPricetagNewItem = ref<boolean>(false);
const visibleModalAdjustmentTransaction = ref(false)
const visibleModalNewAdjustment = ref(false)

const route = useRoute()
const id = computed(() => route.query.id as string);

const setInitialAddress = () => {
  if(ruleForm.vendor_id == ''){
    ElMessage.error(`Pilih Customer Terlebih Dahulu!`);
  }
}

// Status options
const purchaseOrderStatusOptions = [
  { value: PurchaseOrderStatus.DRAFT, label: 'Draft' },
  { value: PurchaseOrderStatus.PENDING_APPROVAL, label: 'Pending Approval' },
  { value: PurchaseOrderStatus.APPROVED, label: 'Approved' }
]

// Form data
const ruleForm = reactive({
  unique_id: '',
  vendor_id: '',
  vendor_parent_id: '',
  vendor_name: '',
  vendor_version: 0,
  sourcing_document: '',
  delivery_address_id: '',
  delivery_address_version: 0,
  delivery_address_view: '',
  expected_arrival: null as number | null,
  date: Date.now(),
  is_discount: false,
  is_tempo: false,
  payment_term: PaymentTerm.CASH,
  payment_term_value: 0,
  payment_term_unit: 'day',
  payment_method: PaymentMethod.Giro,
  discount: 0,
  discount_unit: 'percent' as DiscountUnit,
  delivery_cost: 0,
  total_price: 0,
  additinal_information: '',
  status: PurchaseOrderStatus.DRAFT,
  items: [] as PurchaseOrderItem[]
})

// Vendor data
const vendorOptions = ref<Contact[]>([])
const vendorLoading = ref(false)
const deliveryAddresses = ref<any[]>([])

// Modals
const visibleCanvassingModal = ref(false)
const visiblePricetagModal = ref(false)

// Search data
const canvassingSearch = ref({ keyword: '' })
const pricetagSearch = ref({ keyword: '' })

// Selection data
const selectedCanvassingItems = ref<CanvassingVendor[]>([])
const selectedPricetagItems = ref<Pricetag_item[]>([])

// Sample data (replace with API calls)
const canvassingItems = ref<CanvassingVendor[]>([])

const pricetagItems = ref<Pricetag_item[]>([])

const references = ref<ReferenceTransactionAdjustment[]>([])

const query_search = ref<RequestSearch>({
  column: [],
  keyword: '',
  table: 'contacts',
  sort: null,
  offset: '1',
  limit: '50'
});

const query_search_canvasing_item = ref<RequestSearch>({
  column: [{
    vendor_id: [],
  }],
  keyword: '',
  table: 'canvassing_vendor',
  sort: null,
  offset: '1',
  limit: '50'
});
const request_search_pricetag_item = ref<RequestSearch>({
  column: [],
  keyword: '',
  table: 'pricetag_item',
  sort: null,
  offset: '1',
  limit: '50'
});

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1"
})

const paymentMethods = [
  { value: PaymentMethod.Cash, label: 'Cash' },
  { value: PaymentMethod.BankTransfer, label: 'Bank Transfer' },
  { value: PaymentMethod.Giro, label: 'Giro' }
]

const filteredPricetagItems = await useFetchApi<ResponsePagination<Pricetag_item[]>>('/search', 'search-pricetag-item', 'post', request_search_pricetag_item.value);
const adjustmentTransactions = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>(
  '/search', 
  'search-adjustment', 
  'post', 
  querySearchAdjustmentTransaction.value,
)

const subtotal = computed(() => {
  return ruleForm.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
})
const grand_total = computed(() => {
  const total = subtotal.value;
  let other = 0;

  references.value.forEach((ref) => {
    other += Number(displayAmount(ref, total))
  })

  return Number(total) + Number(other);

})

const calculatedDiscount = computed(() => {
  if (!ruleForm.is_discount) return 0
  if (ruleForm.discount_unit === 'percent') {
    return (subtotal.value * ruleForm.discount) / 100
  }
  return ruleForm.discount
})

function displayAmount(ref: any, multiplier: number){
  if (ref.type === "percent") {
    return (multiplier || 0) * (ref.amount / 100)
  }else{
    return ref.amount;
  }
}

const displayPercentage = (ref: any, multiplier: number): Number => {
  console.log(ref);
  if (ref.type === "amount") {
    return (ref.amount / multiplier)||0 * 100
  }else{
    return ref.amount;
  }
  
}


const removeReferenceTransaction = async (adjustmentTransactions: ReferenceTransactionAdjustment) => {
  if(adjustmentTransactions.unique_id){
    loading.value = true;
    try {
      const response = await useFetchApi<BaseResponse<any>>('/reference-transaction-delete', 'remove-reference-transaction', 'post', [adjustmentTransactions.unique_id]);
      if(response.status.value === 'failed'){
        return;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);
      return;
    } finally {
      loading.value = false;
    }
  }
  
  references.value = references.value.filter((ref) => ref.adjustment_id == adjustmentTransactions.adjustment_id);

}

const summeryData = computed(() => {
  const tableData: any[] = [
      {
        label: "Subtotal",
        value: currency(subtotal.value),
      },
    ];

    references.value.forEach((element) => {
      tableData.push({
        label: element.adjustment?.name ? `${element.adjustment?.name} (${Number((displayPercentage(element, subtotal.value) || 0)).toFixed(2)}%)` : "-",
        value: currency(displayAmount(element, subtotal.value)),
      });
    });

    
    tableData.push(
      {
        label: "Grand Total",
        value: currency(grand_total.value),
      }
  );


  return tableData;


})

// Validation rules
const rules: FormRules = {
  vendor_name: [
    { required: true, message: 'Vendor wajib dipilih', trigger: 'change' }
  ],
  sourcing_document: [
    { required: true, message: 'Nomor referensi wajib diisi', trigger: 'blur' }
  ],
  delivery_address_id: [
    { required: true, message: 'Alamat pengiriman wajib dipilih', trigger: 'change' }
  ],
  status: [
    { required: true, message: 'Status wajib dipilih', trigger: 'change' }
  ]
}

// Methods
const goBack = () => router.back()

const handleAdjustmentSubmit = () => {
  visibleModalNewAdjustment.value = false
  refreshNuxtData('search-adjustment')
}

const handleSelectAdjustment = (items: AdjustmentTransaction[]) => {
  items.forEach(element => {
    const exist = references.value.findIndex((value) => value.adjustment_id == element.unique_id);
    if(exist < 0){
      references.value.push({
        unique_id: '',
        reference: ReferenceAdjustment.PURCHASEORDER,
        reference_id: '',
        adjustment_id: element.unique_id,
        type: element.type,
        amount: element.default_value,
        created_at: 0,
        value: element.default_value,
        adjustment: element,
        changeType: true,
      })
    }
  })
  visibleModalAdjustmentTransaction.value = false
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const querySearchCustomer =  (query: string, cb: (arg: any) => void) => {
  try {
    
    const request_contact = {...query_search.value};
    
    request_contact.table = 'contacts';
    request_contact.keyword = query;

    useFetchApi<ResponsePagination<Contact>>('/search', 'search-vendor', 'post', request_contact).then((response) => {
      if(response.status.value == 'success'){
        const contacts: Contact[] = (response.data.value?.data ?? []) as Contact[];
        if(contacts.length > 0){
          cb(contacts.map((value) => ({
          value: value.name,
          unique_id: value.unique_id,
          data: value,
        })));
        }else{
          cb([{
            value: query,
            isNew: true,
            keyword: query,
          }])
        }
      }
    });
    
    
  } catch (error) {
    console.error('Failed to fetch customers', error)
    cb([])
  }
}

const generateResultSearchAddress = (address: AddressType) => {
    const name = `(${address.contact_name}) - ${address.village}, ${address.city}, ${address.regency}, ${address.province}`;
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

const querySearchAddress = (queryString: string, cb: (arg: any) => void) => {
    const newSearch: RequestSearch = {
      keyword: queryString,
      table: "address",
      column: [
        {
          contact_id: [ruleForm.vendor_id, ruleForm.vendor_parent_id]
        }
      ],
      limit: "100",
      offset: "1",
      sort: null
    };
    

    useFetchApi<ResponsePagination<AddressType[]>>('/search', 'address', 'post', newSearch).then((response) => {
        if(response.status.value == 'success'){
            
            const resultApi: AddressType[]  = response.data.value?.data!;
            
            if(resultApi.length > 0){

                cb(resultApi.map(generateResultSearchAddress));
            }else{
                cb([{value: `Buat Alamat Baru`, new: true, name: `Buat Alamat Baru`, street: ''}]);
            }
            
        }
    })

}


const handleSelectAddress = (record: Record<string, any>) => {
    if(record.new){
        dialogNewAddress.value = true;
    }else{
        console.log(record);
        // const address: AddressType = record as AddressType;
        ruleForm.delivery_address_id = record.address_id;
        ruleForm.delivery_address_version = record.address_version;
        ruleForm.delivery_address_view = record.name;

    }
}

const onAddressNew = (value: AddressType) => {
  const addressView = generateResultSearchAddress(value);
  ruleForm.delivery_address_id = value.unique_id;
  ruleForm.delivery_address_version = value.version;
  ruleForm.delivery_address_view = addressView.name;
}

watchDebounced(
  () => request_search_pricetag_item.value,
  () => {
    refreshNuxtData('search-pricetag-item')
  },
  { debounce: 500 }
)

const createNewVendor = async (data: any) => {
  try {
    const response = await useFetchApi<BaseResponse<Contact>>('/contact-create', 'create-customer', 'post', data);
    if(response.status.value == 'success'){
      return response.data.value?.data;
    }
  } catch (error: any) {
    ElMessage.error(error.response.message ?? error);
  }
}

const onHandleSelectVendor = (item: any) => {
  if (item.isNew) {
    createNewVendor(item.query).then(customer => {
      if (customer) {
        ruleForm.vendor_id = customer.unique_id;
        ruleForm.vendor_name = customer.name;
        ruleForm.vendor_version = customer.version;
        ruleForm.vendor_parent_id = customer.parent_id ?? '';
        request_search_pricetag_item.value.column = [
          {
            pricetag: {
                category: ["penawaran"],
                to_id: [customer.unique_id]
            }
          }
        ];
      }
    })
  } else {
    const customer = item.data as Contact
    ruleForm.vendor_id = customer.unique_id;
    ruleForm.vendor_name = customer.name;
    ruleForm.vendor_version = customer.version || 1;
    ruleForm.vendor_parent_id = customer.parent_id ?? '';
    request_search_pricetag_item.value.column = [
      {
        pricetag: {
            category: ["penawaran"],
            to_id: [customer.unique_id]
        }
      }
    ];
  }
}



const loadVendorAddresses = async (vendorId: string) => {
  // try {
  //   // Replace with actual API call
  //   const response = await $fetch(`/api/vendors/${vendorId}/addresses`)
  //   deliveryAddresses.value = response.data
  // } catch (error) {
  //   ElMessage.error('Gagal memuat alamat vendor')
  // }
}

const loadCanvassingItems = async () => {
  // try {
  //   // Replace with actual API call - filter by approved status and vendor
  //   const response = await useFetch<ResponsePagination<CanvassingVendor[]>>('/search', 'search-canvasing-vendor', 'post', query_search_canvasing_item.value);
  //   if(response)
  // } catch (error) {
  //   ElMessage.error('Gagal memuat item canvassing')
  // }
}

const loadPricetagItems = async (vendorId: string) => {
  
}

const openCanvassingModal = () => {
  if (!ruleForm.vendor_id) {
    ElMessage.warning('Pilih vendor terlebih dahulu')
    return
  }
  visibleCanvassingModal.value = true
}

const openPricetagModal = () => {
  if (!ruleForm.vendor_id) {
    ElMessage.warning('Pilih vendor terlebih dahulu')
    return
  }
  visiblePricetagModal.value = true
}

const handleCanvassingSelectionChange = (selection: CanvassingVendor[]) => {
  selectedCanvassingItems.value = selection
}

const handlePricetagSelectionChange = (selection: Pricetag_item[]) => {
  selectedPricetagItems.value = selection
}

const addSelectedCanvassingItems = () => {
  
  selectedCanvassingItems.value.forEach((value) => {
    ruleForm.items.push({
      id: 0,
      unique_id: '',
      order_id: '',
      vendor_id: value.vendor_id!,
      vendor_version: value.vendor?.version ?? 1,
      catalogue_id: value.catalogue_id ?? '',
      catalogue_name: value.catalogue?.name ?? '',
      catalogue_version: value.catalogue?.version ?? 1,
      quantity: value.quantity,
      unit_price: value.unit_price,
      total_price: value.total_price,
      is_warranty: false,
      warranty: 0,
      warranty_unit: 'hari',
      is_discount: false,
      delivery_cost: 0,
      version: 0,
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      unit_id: value.unit_id,
      unit_name: value.unit_name,
      pr_item_request_trail_id: value.canvassing_item?.item_request_trail_id ?? '',
      pr_item_request_trail_version: value.canvassing_item?.item_request_trail_version ?? 0,
      item_request_trail_id: '',
      item_request_trail_version: 0,
      item_request_trail: value.canvassing_item?.item_request_trail,
      order_version: 1,
      status: PurchaseOrderItemStatus.DRAFT,
    })
  });

  
  visibleCanvassingModal.value = false
  selectedCanvassingItems.value = []
}

const addSelectedPricetagItems = () => {
  
  
  selectedPricetagItems.value.forEach((value) => {
    ruleForm.items.push({
      id: 0,
      unique_id: '',
      order_id: '',
      vendor_id: value.pricetag?.owner_id ?? '',
      vendor_version: value.pricetag?.owner?.version ?? 0,
      catalogue_id: value.catalogue_id ?? '',
      catalogue_name: value.catalogue?.name ?? '',
      catalogue_version: value.catalogue?.version ?? 1,
      quantity: 1,
      unit_price: value.price,
      total_price: value.price,
      is_warranty: false,
      warranty: 0,
      warranty_unit: 'hari',
      is_discount: false,
      delivery_cost: 0,
      version: 0,
      created_at: 0,
      created_by: 0,
      updated_at: 0,
      unit_id: value.unit_id,
      unit_name: value.unit_name,
      pr_item_request_trail_id:  '',
      pr_item_request_trail_version:  0,
      item_request_trail_id: '',
      item_request_trail_version: 0,
      order_version: 1,
      status: PurchaseOrderItemStatus.DRAFT,
    })
  });
  
  visiblePricetagModal.value = false
  selectedPricetagItems.value = []
}

const removeItem = (index: number) => {
  ruleForm.items.splice(index, 1)
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      if (ruleForm.items.length === 0) {
        ElMessage.warning('Tambahkan minimal satu item')
        return
      }
      
      loading.value = true
      try {
        // Calculate total price
        ruleForm.total_price = grand_total.value
        
        const formData = new FormData()

        // Append main fields
        formData.append("unique_id", `${ruleForm.unique_id}`)
        formData.append("vendor_id", `${ruleForm.vendor_id}`)
        formData.append("vendor_name", `${ruleForm.vendor_name}`)
        formData.append("vendor_version", `${ruleForm.vendor_version}`)
        formData.append("sourcing_document", `${ruleForm.sourcing_document}`)
        formData.append("total_price", `${ruleForm.total_price}`)
        formData.append("delivery_address_id", `${ruleForm.delivery_address_id}`)
        formData.append("delivery_address_version", `${ruleForm.delivery_address_version}`)
        formData.append("expected_arrival", `${ruleForm.expected_arrival != null ? ruleForm.expected_arrival / 1000 : null }`)
        formData.append("date", `${ruleForm.date / 1000}`)
        formData.append("is_discount", `${ruleForm.is_discount}`)
        formData.append("discount", `${ruleForm.discount}`)
        formData.append("discount_unit", `${ruleForm.discount_unit}`)
        formData.append("delivery_cost", `${ruleForm.delivery_cost}`)
        formData.append("additional_information", `${ruleForm.additinal_information}`)
        formData.append("status", `done`)
        formData.append("type", `so`)
        formData.append("is_tempo", `${ruleForm.is_tempo}`)
        formData.append("term_payment", `${ruleForm.payment_term}`)
        formData.append("term_payment_unit", `${ruleForm.payment_term_unit}`)
        formData.append("term_payment_value", `${ruleForm.payment_term_value}`)
        formData.append("method_payment", `${ruleForm.payment_method}`)

        // Append items array
        ruleForm.items.forEach((value, index) => {
          formData.append(`item[${index}][unique_id]`, `${value.unique_id}`)
          formData.append(`item[${index}][order_id]`, `${value.order_id}`)
          formData.append(`item[${index}][item_id]`, `${value.catalogue_id}`)
          formData.append(`item[${index}][item_name]`, `${value.catalogue_name}`)
          formData.append(`item[${index}][item_version]`, `${value.catalogue_version}`)
          formData.append(`item[${index}][quantity]`, `${value.quantity}`)
          formData.append(`item[${index}][unit_id]`, `${value.unit_id}`)
          formData.append(`item[${index}][unit_name]`, `${value.unit_name}`)
          formData.append(`item[${index}][unit_price]`, `${value.unit_price}`)
          formData.append(`item[${index}][total_price]`, `${(value.quantity * value.unit_price) || 0}`)
          formData.append(`item[${index}][is_warranty]`, `${value.is_warranty}`)
          formData.append(`item[${index}][warranty]`, `${value.warranty}`)
          formData.append(`item[${index}][warranty_unit]`, `${value.warranty_unit}`)
          formData.append(`item[${index}][is_discount]`, `${value.is_discount ?? false}`)
          formData.append(`item[${index}][discount]`, `${value.discount ?? null}`)
          formData.append(`item[${index}][discount_unit]`, `${value.discount_unit ?? null}`)
          formData.append(`item[${index}][additional_information]`, `${value.additinal_information}`)
          
          formData.append(`item[${index}][version]`, `${value.version}`)
          formData.append(`item[${index}][order_version]`, `${value.order_version}`)
          formData.append(`item[${index}][status]`, `done`)
        });

        references.value.forEach((ref, i) => {
          const refFields = {
            unique_id: ref.unique_id,
            adjustment_id: ref.adjustment_id,
            value: ref.value,
            amount: ref.amount,
            type: ref.type,
            party_type: ref.party_type,
            party_id: ref.party_id,
            reference: ref.reference,
            reference_id: ref.reference_id,
          }

          Object.entries(refFields).forEach(([key, value]) => {
            formData.append(`reference_transaction[${i}][${key}]`, `${value}`)
          })
        })

            // Append files
        fileList.value.forEach((file, index) => {
          if (file.raw) {
            formData.append(`files[${index}]`, file.raw)
          }
        })

        
        const response = await useFetchApi<BaseResponse<PurchaseOrder>>('/purchase-order-create', 'create-purchase-order', 'post', formData);

        if (response.status.value === 'success') {
          const purchaseOrder:PurchaseOrder|undefined = response.data.value?.data;
          ElMessage.success('Purchase Order berhasil dibuat')
          if(purchaseOrder){
            router.push(`/sales/order/${purchaseOrder.unique_id}`);
          }
        }
        
        
        
      } catch (error) {
        ElMessage.error('Gagal membuat Purchase Order')
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  formEl.resetFields()
  ruleForm.items = []
  ruleForm.vendor_id = ''
  ruleForm.vendor_name = ''
  ruleForm.vendor_version = 0
}


const fetchDataEdit = async () => {
    loading.value = true;
    try {
        const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
            `/purchase-order-read/${id.value}`, 
            'detail-purchase-order', 
            'get', 
            null
        );

        if(response.status.value == 'success'){
            const request: PurchaseOrder|null = response.data.value?.data ?? null;
            if(request != null){
                ruleForm.unique_id = request.unique_id;
                ruleForm.vendor_id = request.vendor_id ?? '';
                ruleForm.vendor_name = request.vendor?.name ?? '';
                ruleForm.vendor_version = request.vendor_version;
                ruleForm.sourcing_document = request.sourcing_document ?? '';
                ruleForm.delivery_address_id = request.delivery_address_id ?? '';
                ruleForm.delivery_address_version = request.delivery_address_version;
                ruleForm.delivery_address_view = `(${request.address?.contact_name}) - ${request.address?.village}, ${request.address?.city}, ${request.address?.regency}, ${request.address?.province}`;
                ruleForm.expected_arrival = request.expected_arrival == null ? null : request.expected_arrival * 1000;
                ruleForm.date = request.date == null ? Date.now() : request.date * 1000;
                ruleForm.is_discount = request.is_discount;
                ruleForm.discount = request.discount;
                ruleForm.discount_unit = request.discount_unit ?? DiscountUnit.PERCENT;
                ruleForm.delivery_cost = request.delivery_cost;
                ruleForm.total_price = request.total_price;
                ruleForm.additinal_information = request.additional_information ?? '';
                ruleForm.status = request.status;
                ruleForm.items = request.purchase_order_item;

                references.value = request.reference_transaction.map((value) => ({
                  ...value,
                  adjustment: value.adjustments_transaction,
                }))
                
            }
        }
    } catch (error: any) {
        ElMessage.error(error.response?.message ?? error);
    } finally {
        loading.value = false;
    }
}

// Initial load
onMounted(() => {
    if(id.value){
        fetchDataEdit();
    }
    
    
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>