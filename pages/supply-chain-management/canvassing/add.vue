<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> New Canvassing </span>
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
        <!-- Canvassing Header Information -->
        <el-form-item label="Nomor Referensi" prop="source_document">
          <el-input v-model="ruleForm.source_document" placeholder="Masukkan nomor referensi" />
        </el-form-item>
        
        <el-form-item label="Deskripsi" prop="description">
          <el-input v-model="ruleForm.description" type="textarea" placeholder="Masukkan deskripsi" />
        </el-form-item>
        
        <el-form-item label="Status" prop="status">
          <el-select v-model="ruleForm.status" style="width: 100%">
            <el-option 
              v-for="status in canvassingStatusOptions" 
              :key="status.value" 
              :label="status.label" 
              :value="status.value" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="File Lampiran" prop="files">
          <TrumsUploadFile v-model:file-list="fileList"  />
        </el-form-item>
        
      </el-form>
    </el-card>
    
    <!-- Canvassing Items Section -->
    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Items</span>
        </div>
      </template>
      
      <el-table 
      :data="ruleForm.canvassing_item" 
      border 
      >
        <el-table-column prop="catalogue_name" label="Item"/>
        <el-table-column prop="sn" label="Serial/Part Number"/>

        <el-table-column prop="data_reference.unique_code" label="Nomor Permintaan" width="200"/>
        <el-table-column prop="quantity" label="Qty" width="50" />
        <el-table-column prop="unit_name" label="UOM" />
        
        <el-table-column label="Actions" width="100">
          <template #default="scope">
            <div class="flex">
                <el-button 
                    type="danger" 
                    :icon="Delete" 
                    circle 
                    @click="removeItem(scope.$index)"
                    :disabled="ruleForm.canvassing_item.length <= 1"
                />
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <el-button class="mt-4" style="width: 100%" @click="visibleModalRequest = true">
        Tambah Item
      </el-button>
    </el-card>
    
    <el-button type="primary" :icon="Plus" @click="() => visibleModalContact = true">Tambah Vendor</el-button>
    
    <!-- Vendor Offers Section -->
    <el-card class="my-3" v-for="(item, itemIndex) in vendors" :key="itemIndex">
      <template #header>
        <div class="card-header flex items-center justify-between">
          <span>Penawaran Dari Vendor {{ item.vendor_name }}</span>
        </div>
      </template>
      
      <el-table :data="item.items" border row-key="index">
        <el-table-column fixed prop="catalogue_name" label="Item" />

        
        <el-table-column prop="quantity" label="Qty" width="80" align="center"/>
        <el-table-column prop="unit_name" label="UOM"  align="center">
          <template #default="scope">
            <el-autocomplete
                v-if="scope.row.type == 'child'"
                v-model="scope.row.unit_name"
                :fetch-suggestions="querySearchUnit"
                :trigger-on-focus="false"
                clearable
                class="inline-input w-50"
                placeholder="Pilih Unit"
                @select="(item) => handleSelectUnit(item, itemIndex, scope.row.index)"
              />
              <span v-else>{{ scope.row.unit_name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="unit_price" label="Harga Satuan"  align="right">
          <template #default="scope">
            <el-input-number
            v-if="scope.row.editing"
              v-model="scope.row.unit_price"
              :min="0"
              :precision="2"
              style="width: 100%"
              :disabled="true"
            />
            <p v-else>{{ currencyWithoutSymbol(scope.row.unit_price) }}</p>
          </template>
        </el-table-column>
        
        <el-table-column prop="total_price" label="Total Harga"  align="right">
          <template #default="scope">
            <el-input-number
            v-if="scope.row.editing"
              v-model="scope.row.total_price"
              :min="0"
              :precision="2"
              style="width: 100%"
              :disabled="true"
            />
            <p v-else>{{ currencyWithoutSymbol(scope.row.total_price) }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="Catatan" width="200">
          <template #default="scope">
            <el-input
              v-model="scope.row.additional_information"
              placeholder="Catatan"
            />
          </template>
        </el-table-column>
        
        
        <el-table-column fixed="right" label="Actions" width="150" align="center">
          <template #default="scope">
            <el-button 
            v-if="scope.row.type == 'child'"
              type="danger" 
              :icon="Delete" 
              circle 
              @click="removeVendorOffer(itemIndex, scope.row.index)"
             
            />
            <el-button 
            v-if="scope.row.type == 'parent'"
              type="primary" 
              :icon="Search" 
              circle 
              @click="() => openModalPrice(itemIndex, scope.row.index, 'search')"
             
            />
            <el-button 
            v-if="scope.row.type == 'parent'"
              type="primary" 
              :icon="Plus" 
              circle 
              @click="() => openModalPrice(itemIndex, scope.row.index, 'create')"
             
            />
            
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 border-t pt-4 space-y-3">
        <!-- Discount Row -->
        <div class="flex items-center gap-3">
          <span class="w-24 font-semibold">Discount</span>
          <el-input
            v-model="summeries[itemIndex].discount_value"
            style="max-width: 600px"
            placeholder="Please input"
            class="input-with-select"
          >
          
            <template #append>
              <el-select v-model="summeries[itemIndex].discount_unit" placeholder="Select" style="width: 115px">
                <el-option label="%" value="percent" />
                <el-option label="Nominal" value="nominal" />
              </el-select>
            </template>
          </el-input>
        </div>

        <!-- Note Row -->
        <div class="flex items-start gap-3">
          <span class="w-24 font-semibold">Note</span>
          <el-input
            v-model="summeries[itemIndex].note"
            type="textarea"
            placeholder="Tambahkan catatan..."
            :rows="3"
            class="flex-1"
          />
        </div>
      </div>
      
    </el-card>

    <el-dialog v-model="visibleModalRequest" title="Cari Permintaan" width="1000">
        <el-row :gutter="20" class="mb-3">
            <el-col :span="6"
                ><el-input
                v-model="request_search_inquiry.keyword"
                size="default"
                placeholder="Type to search"
            /></el-col>
            <el-button size="default" type="primary" @click="addToForm((itemRequest?.data ?? []).filter((i: ItemRequestTrail) => i.checked))" :disabled="(itemRequest?.data ?? []).filter((i: ItemRequestTrail) => i.checked).length == 0"
                >Tambahkan ({{ itemRequest?.data.filter((i: ItemRequestTrail) => i.checked).length }})</el-button
            >
        </el-row>
        <el-table :data="itemRequest?.data ?? []" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="Nama Item" width="180">
                <template #default="scope">
                    <NuxtLink class="text-blue-500" :href="`/supply-chain-management/purchase/request/${scope.row.unique_id}`">{{ scope.row.item_request?.catalogue_name ?? '-' }}</NuxtLink>
                </template>
            </el-table-column>
            <el-table-column label="Nomor PR" >
                <template #default="scope">
                    <p>{{scope.row.reference_code ?? '-'}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Serial Number" >
                <template #default="scope">
                    <p>{{scope.row.item_request?.sn ?? '-'}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Quantity" >
                <template #default="scope">
                    <p>{{scope.row.quantity}} {{scope.row.item_request?.unit_name ?? ''}}</p>
                </template>
            </el-table-column>
            
            
        </el-table>
        <div class="flex justify-end mt-3">
            <el-pagination background layout="prev, pager, next" :total="itemRequest?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick" />
        </div>
    </el-dialog>
    <el-dialog v-model="visibleModalPricetagItem" title="Cari Penawaran" width="1000">
        <el-row :gutter="20" class="mb-3">
            <el-col :span="6"
                ><el-input
                v-model="request_search_inquiry.keyword"
                size="default"
                placeholder="Type to search"
            /></el-col>
            <el-button size="default" type="primary" @click="() => addToOfferVendor((priceTagItem ?? []).filter((i: Pricetag_item) => i.checked))" :disabled="(priceTagItem ?? []).filter((i: Pricetag_item) => i.checked).length == 0"
                >Tambahkan ({{ priceTagItem?.filter((i: Pricetag_item) => i.checked).length }})</el-button
            >
        </el-row>
        <el-table :data="priceTagItem" :preserve-expanded-content="true" style="width: 100%" @selection-change="handleSelectionChangePriceTagItem">
            
            <el-table-column type="selection" width="55" /> 
            <el-table-column label="Vendor" >
                <template #default="scope">
                    <p>{{scope.row.pricetag.owner_id == null ? "-" : scope.row.pricetag.owner?.name ?? '-'}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Nama Item" width="180">
                <template #default="scope">
                    <NuxtLink class="text-blue-500" :href="`/catalogue/${scope.row.unique_id}`">{{ scope.row.catalogue.name ?? '' }}</NuxtLink>
                </template>
            </el-table-column>
            
            <el-table-column label="Harga" >
                <template #default="scope">
                    <p>{{currency(scope.row.price)}}</p>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
    <el-dialog v-model="visibleModalContact" title="Cari Vendor" width="1000">
        <el-row :gutter="20" class="mb-3">
            <el-col :span="6"
                ><el-input
                v-model="request_search_inquiry.keyword"
                size="default"
                placeholder="Type to search"
            /></el-col>
            <el-button size="default" type="primary" @click="() => addVendor((contacts?.data ?? []).filter((i: Contact) => i.checked))" :disabled="(contacts?.data ?? []).filter((i: Contact) => i.checked).length == 0"
                >Tambahkan ({{ contacts?.data.filter((i: Contact) => i.checked).length }})</el-button
            >
        </el-row>
        <el-table :data="contacts?.data ?? []" style="width: 100%" @selection-change="handleSelectionChangeContact">
            <el-table-column type="selection" width="55" />
            <el-table-column label="Vendor" >
                <template #default="scope">
                    <p>{{scope.row.name ?? '-'}}</p>
                </template>
            </el-table-column>
            <el-table-column label="Telepone" width="180">
                <template #default="scope">
                    {{ scope.row.phone }}
                </template>
            </el-table-column>
            
            <el-table-column label="Email" >
                <template #default="scope">
                    <p>{{scope.row.email}}</p>
                </template>
            </el-table-column>
            
        </el-table>
        <div class="flex justify-end mt-3">
            <el-pagination background layout="prev, pager, next" :total="itemRequest?.total_data" @next-click="paginationClickContact" @prev-click="paginationClickContact" @change="paginationClickContact" />
        </div>
    </el-dialog>
    <el-dialog v-model="visibleModalPricetagNewItem" title="Buat Penawaran Baru" width="1000">
        <AddPriceTagComponent v-on:submit="() => {
          visibleModalPricetagNewItem = false;
          openModalPrice(offerIndex, rowKey, 'search');
          fetchPriceTag();
        }" />
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Delete, Filter, Plus, Search, SetUp } from '@element-plus/icons-vue'
import { ElAutocomplete, ElButton, ElCheckbox, ElCheckboxGroup, ElIcon, ElInput, ElInputNumber, ElPopover, ElTag, TableV2FixedDir, type CheckboxValueType, type Column, type FormInstance, type FormItemRule, type FormRules, type InputInstance, type InputNumberInstance, type SortBy, type TableColumnCtx, type UploadUserFile } from 'element-plus'
import { CanvassingStatus, CanvassingVendorStatus } from '~/types/scm/canvasing'
import type { CanvasingVendorView, Canvassing, CanvassingForm, CanvassingItem, CanvassingItemForm, CanvassingItemVendorSummery, CanvassingVendor } from '~/types/scm/canvasing'
import type { Catalogue } from '~/types/catalogue'
import type { Contact } from '~/types/contact'
import AddPriceTagComponent from '~/components/trums/AddPriceTagComponent.vue'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'
import { WarrantyUnit } from '~/types/scm/offers'
import type { Inquiry } from '~/types/inquiry'
import SelectionCell from '~/components/trums/table/SelectionCell.vue'
import { NuxtLink } from '#components'
import type { Maintenance } from '~/types/maintenance'
import customTable from '~/components/trums/table/customTable.vue'
import { ItemRequestTrailStatus, type ItemRequest, type ItemRequestTrail } from '~/types/item_request'
import type { FunctionalComponent } from 'vue'
import type { BaseResponse } from '~/types/response'
import type { Pricetag, Pricetag_item } from '~/types/pricetag'
import { warrantyUnitOption } from '~/types/scm/offers'
import { getVariableName, getValue } from '~/types/pricetag'
import TrumsUploadFile from '~/components/trums/form/TrumsUploadFile.vue'
import type { PurchaseRequestItem } from '~/types/purchase_request'
import type { Unit } from '~/types/unit'

const router = useRouter()
const route = useRoute()
const ruleFormRef = ref<FormInstance>()
const loading = ref(false)
const visibleModalRequest = ref(false)
const visibleModalPricetagItem = ref(false)
const visibleModalPricetagNewItem = ref(false)
const visibleModalContact = ref(false)
const offerIndex = ref<number>(0);
const offerItemIndex = ref<number>(0);
const rowKey = ref<string>('');
const popoverRef = ref();
const column_selected = ref<string[]>(['selection', 'unique_code', 'date', 'reference', 'reference_view', 'setup']);

const id = computed(() => route.query.id as string);

// Status options
const canvassingStatusOptions = [
  { value: CanvassingStatus.DRAFT, label: 'Draft' },
  { value: CanvassingStatus.PENDING_APPROVAL, label: 'Pending Approval' },
  { value: CanvassingStatus.CANCEL, label: 'Cancel' }
]

const vendorStatusOptions = [
  { value: CanvassingVendorStatus.SUBMITTED, label: 'Submitted' },
  { value: CanvassingVendorStatus.SELECTED, label: 'Selected' },
  { value: CanvassingVendorStatus.REJECTED, label: 'Rejected' }
]

const fileList = ref<UploadUserFile[]>([])

// Form data structure
const ruleForm = reactive<CanvassingForm>({
  unique_id: '',
  source_document: '',
  description: '',
  status: CanvassingStatus.DRAFT,
  canvassing_item: []
})

const vendors = ref<CanvasingVendorView[]>([]);
const summeries = ref<CanvassingItemVendorSummery[]>([]);

const priceTagItem = ref<Pricetag_item[]>([]);
const contacts = ref<ResponsePagination<Contact[]>>({
  currentPage: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 1,
});

const request_search_inquiry = ref<RequestSearch>({
    column: [
      {
        "status": [ItemRequestTrailStatus.DONE]
      }
    ],
    keyword: '',
    limit: '10',
    offset: '1',
    sort: {
        column: "created_at",
        order: OrderColumn.ASC,
    },
    table: 'item_request_trail',

});
const request_search_pricetag_item = ref<{
  catalogue_id: string,
  location: string[],
  contact: string[],
  quantity: number,
  owner_id: string,
  type: "single"|"multi",
}>({
  catalogue_id: '',
  location: [],
  contact: [],
  quantity: 0,
  owner_id: '',
  type: "multi"
});
const request_search_contact = ref<RequestSearch>({
    column: [],
    keyword: '',
    limit: '10',
    offset: '1',
    sort: null,
    table: 'contacts',

});

const requestSearchUnit = ref<RequestSearch>({
  keyword: "",
  table: "units",
  column: [],
  sort: {
    column: 'created_at',
    order: OrderColumn.ASC,
  },
  limit: "50",
  offset: "1",
});

const itemRequest = ref<ResponsePagination<ItemRequestTrail[]>>();

const validateChildren: FormItemRule['validator'] = (
  _rule: any,
  value: CanvassingItemForm[],
  callback: (error?: Error) => void
) => {
  if (!value || value.length < 1) {
    callback(new Error('Minimal harus ada 1 children'))
  } else {
    callback()
  }
}

// Form validation rules
const rules: FormRules<Omit<CanvassingForm, 'canvassing_item'>> = reactive({
  source_document: [
    { required: true, message: 'Nomor referensi wajib diisi', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Status wajib dipilih', trigger: 'change' }
  ],
  canvassing_item: [
    { validator: validateChildren, trigger: 'change' }
  ]
  
})

interface AutocompleteCellProps {
  value: string
  onChange?: (val: string) => void
  onBlur?: () => void
  onKeydownEnter?: (e: KeyboardEvent) => void
  forwardRef?: any,
  sugestion: (queryString: string, cb: (results: any[]) => void) => void,
}
const AutocompleteCell: FunctionalComponent<AutocompleteCellProps> = ({
  value,
  onChange,
  onBlur,
  onKeydownEnter,
  forwardRef,
  sugestion
}) => {
  // callback untuk fetch server-side
  

  return (
    <ElAutocomplete
      {...({
        ref: forwardRef,
        fetchSuggestions: sugestion,
        modelValue: value,
        'onUpdate:modelValue': onChange,
        onBlur,
        placeholder: 'Search...',
        clearable: true,
        onKeydown: withKeys(onKeydownEnter ?? (() => {}), ['enter']),
      } as any)}
    />
  )
}

type SelectionCellProps = {
  value: string
  intermediate?: boolean
  onChange: (value: string) => void
  onBlur: () => void
  onKeydownEnter: () => void
  forwardRef: (el: InputInstance) => void
}

const InputCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  onChange,
  onBlur,
  onKeydownEnter,
  forwardRef,
}) => {
  return (
    <ElInput
      ref={forwardRef as any}
      onInput={onChange}
      onBlur={onBlur}
      onKeydown={withKeys(onKeydownEnter, ['enter'])}
      modelValue={value}
    />
  )
}
const InputCellNumber: FunctionalComponent<{
  value: number
  intermediate?: boolean
  onChange: (value: number | undefined) => void
  onBlur: () => void
  onKeydownEnter: () => void
  forwardRef: (el: InputNumberInstance) => void
}> = ({
  value,
  onChange,
  onBlur,
  onKeydownEnter,
  forwardRef,
}) => {
  return (
    <ElInputNumber
      ref={forwardRef as any}
      onUpdate:modelValue={onChange}
      onBlur={onBlur}
      modelValue={value}
    />
  )
}



const querySearchCatalogue = (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString) return cb([])
  try {
  
    const item_request_catalogue: RequestSearch = {
      column: [],
      keyword: queryString,
      limit: '50',
      offset: '1',
      sort: {
        column: 'created_at',
        order: OrderColumn.ASC,
      },
      table: 'catalogues',
    }
    useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'search-catalogues', 'post', item_request_catalogue).then((response) => {
      if(response.status.value == 'success'){
        const catalogues: Catalogue[] = (response.data.value?.data ?? []) as Catalogue[];
        if(catalogues.length > 0){
          cb(catalogues.map((value) => ({
          value: value.name,
          unique_id: value.unique_id,
          data: value,
        })));
        }else{
          cb([{
            value: queryString,
            isNew: true,
            keyword: queryString,
          }])
        }
      }
    });
    
  } catch (err) {
    cb([])
  }
}

const fetchPriceTag = async () => {
    loading.value = true;
    try {
      
      
      const response = await useFetchApi<BaseResponse<Pricetag_item[]>>(`/pricetag-item-read`, 'pricetag-search-items', 'post', request_search_pricetag_item);
      // console.log(response.status.value);
      if(response.status.value == 'success'){
        priceTagItem.value = response.data.value?.data ?? []
      }else{
        priceTagItem.value = []
      }
        
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);  
    } finally {
      loading.value = false;
    }
}
const fetchContact = async () => {
    loading.value = true;
    try {
      
        
        const response = await useFetchApi<ResponsePagination<Contact[]>>(`/search`, 'contact-search', 'post', request_search_contact);
        
        if(response.status.value == 'success'){
            contacts.value = response.data.value ?? {
              currentPage: 0,
              data: [],
              success: true,
              total_data: 0,
              total_page: 0
            }
        }
        
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);  
    } finally {
      loading.value = false;
    }
}



const querySearchContact = (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString) return cb([])
  try {
  
    const item_request_catalogue: RequestSearch = {
      column: [],
      keyword: queryString,
      limit: '50',
      offset: '1',
      sort: {
        column: 'created_at',
        order: OrderColumn.ASC,
      },
      table: 'contacts',
    }
    useFetchApi<ResponsePagination<Contact[]>>('/search', 'search-contact', 'post', item_request_catalogue).then((response) => {
      if(response.status.value == 'success'){
        const contacs: Contact[] = (response.data.value?.data ?? []) as Contact[];
        if(contacs.length > 0){
          cb(contacs.map((value) => ({
          value: value.name,
          unique_id: value.unique_id,
          data: value,
        })));
        }else{
          cb([{
            value: queryString,
            isNew: true,
            keyword: queryString,
          }])
        }
      }
    });
    
  } catch (err) {
    cb([])
  }
}

const openModalPrice = (vendorIndex: number, index: string, type: "search" | "create") => {
  if(type == 'search'){
    visibleModalPricetagItem.value = true;
    
  }else{
    visibleModalPricetagNewItem.value = true;
  }
  offerIndex.value = vendorIndex;
  rowKey.value = index;

  const findItems = (list: any[], indexKey: string) => {
    const dataIndex = list.findIndex(item => item.index === indexKey);
    if (dataIndex !== -1) {
      offerItemIndex.value = dataIndex;
      const item = vendors.value[offerIndex.value].items[dataIndex];
      request_search_pricetag_item.value.quantity = item.quantity;
      request_search_pricetag_item.value.owner_id = vendors.value[vendorIndex].vendor_id;
      return true;
    }
    // kalau ga ketemu di level ini, cek children
    for (const item of list) {
      if (item.children && item.children.length) {
        const removed = findItems(item.children, index);
        if (removed) return true;
      }
    }
    return false;
  };

  findItems(vendors.value[vendorIndex].items, index);
}

// Methods
const goBack = () => router.back()

const addNewItem = () => {
  ruleForm.canvassing_item.push({
    index: `${ruleForm.canvassing_item.length + 1}`,
    unique_id: '',
    offer_item_id: '',
    vendor_id: '',
    vendor_name: '',
    offer_item_version: 0,
    catalogue_id: '',
    catalogue_name: '',
    quantity: 1,
    unit_price: 0,
    unit_id: '',
    unit_name: '',
    total_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    additional_information: '',
    taxes: [],
    editing: false,
    type: "child",
    canvaasing_version: null,
    canvassing_id: null,
    children: [],
    item_request_trail_id: null,
    item_request_trail_version: 0,
    sn: '',
    unit_version: 0,
    pricetag_item_id: '',
    pricetag_item_version: 0,
    selling_price: 0,
    profit: 0,
    profit_unit: 'percent',
    fee: 0,
    fee_unit: 'percent',
    ongkir: 0,
    ongkir_unit: 'percent',
    contacts_fee: [],
    type_item: 'request',
    equivalent_id: null
  })
}

const removeItem = async (index: number) => {
  const item = ruleForm.canvassing_item[index];
  if(item.unique_id !== '' && item.unique_id !== null){
    const deleted = await removeItemCanvassing([item.unique_id]);
    if(deleted){
      ruleForm.canvassing_item.splice(index, 1)
      vendors.value.forEach(vendor => {
        vendor.items = vendor.items.filter((value) => value.item_request_trail_id !== item.item_request_trail_id);
      })
    }
  }else{
    ruleForm.canvassing_item.splice(index, 1)
      vendors.value.forEach(vendor => {
        vendor.items = vendor.items.filter((value) => value.item_request_trail_id !== item.item_request_trail_id);
      })
  }
}

const removeItemCanvassing = async (ids: string[]) => {
  loading.value = true;
  try {
    const response = await useApiFetch<BaseResponse<any>>(`/canvassing-item-delete`, {
      method: 'POST',
      body: ids,
    });
    if(response.success == true){
      ElMessage.success(`Data Berhasil Dihapus!`);
      return true;
    }else{
      return false;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
    return false;
  } finally {
    loading.value = false;
  }
}

const addNewVendorOffer = (itemIndex: number) => {
  console.log(itemIndex);
  ruleForm.canvassing_item[itemIndex].children.push({
    index: `${itemIndex}-${ruleForm.canvassing_item[itemIndex].children.length + 1}`,
    unique_id: '',
    offer_item_id: '',
    vendor_id: '',
    vendor_name: '',
    offer_item_version: 0,
    catalogue_id: '',
    catalogue_name: '',
    quantity: 1,
    unit_id: '',
    unit_name: '',
    unit_price: 0,
    total_price: 0,
    status: CanvassingVendorStatus.SUBMITTED,
    additional_information: '',
    taxes: [],
    editing: false,
    type: "child",
    canvaasing_version: null,
    canvassing_id: null,
    children: [],
    item_request_trail_id: null,
    item_request_trail_version: 0,
    sn: '-',
    unit_version: 0,
    pricetag_item_id: '',
    pricetag_item_version: 0,
    selling_price: 0,
    profit: 0,
    profit_unit: 'percent',
    fee: 0,
    fee_unit: 'percent',
    ongkir: 0,
    ongkir_unit: 'percent',
    contacts_fee: [],
    type_item: 'request',
    equivalent_id: null
  })
//   console.log(ruleForm.canvassing_item[itemIndex - 1].children);
}

const onHandleSelectCatalogue = async (item: any, index: number) => {
  console.log(item);
  
  
}

const addToForm = (val: ItemRequestTrail[]) => {
    for (let index = 0; index < val.length; index++) {
        const element = val[index];
        console.log(element);
        ruleForm.canvassing_item.push({
          index: `${ruleForm.canvassing_item.length + 1}`,
          unique_id: '',
          canvassing_id: '',
          canvaasing_version: 0,
          item_request_trail_id: element.unique_id ?? '',
          request_number: element?.reference_code ?? '-',
          catalogue_name: element.item_request?.catalogue_name ?? '-',
          sn: element.item_request?.sn ?? '-',
          item_request_trail_version: 0,
          unit_id: element.item_request?.unit_id ?? '',
          unit_name: element.item_request?.unit_name ?? '',
          children: [],
          quantity: element.quantity ?? 0,
          editing: false,
          type: "parent",
          vendor_id: null,
          vendor_name: '',
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: '',
          unit_price: 0,
          total_price: 0,
          status: CanvassingVendorStatus.SUBMITTED,
          taxes: [],
          unit_version: 0,
          pricetag_item_id: '',
          pricetag_item_version: 0,
          selling_price: 0,
          profit: 0,
          profit_unit: 'percent',
          fee: 0,
          fee_unit: 'percent',
          ongkir: 0,
          ongkir_unit: 'percent',
          contacts_fee: [],
          type_item: 'request',
          equivalent_id: null
        })
        
    }

    visibleModalRequest.value = false;
}
const addToOfferVendor = (val: Pricetag_item[]) => {
    for (let index = 0; index < val.length; index++) {
        const element = val[index];
        const vendor_items = vendors.value[offerIndex.value].items[offerItemIndex.value];
        vendor_items.children.push({
          index: `${offerIndex.value}-${offerItemIndex.value}-${index}`,
          unique_id: '',
          canvassing_id: '',
          canvaasing_version: 0,
          item_request_trail_id: vendor_items.item_request_trail_id,
          catalogue_name: element.catalogue?.name ?? '-',
          sn: element.catalogue?.sn ?? '-',
          item_request_trail_version: 0,
          unit_id: element.unit_id ?? '',
          unit_name: element.unit_name,
          children: [],
          quantity: vendor_items.quantity,
          editing: false,
          type: "child",
          vendor_id: element.pricetag?.owner?.unique_id ?? null,
          vendor_name: element.pricetag?.owner?.name ?? '',
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: element.catalogue_id,
          unit_price: element.price,
          total_price: Number(element.price) * Number(vendor_items.quantity),

          status: CanvassingVendorStatus.SUBMITTED,
          taxes: [],
          unit_version: 0,
          pricetag_item_id: element.unique_id ?? '',
          pricetag_item_version: element.version ?? 0,
          selling_price: 0,
          profit: 0,
          profit_unit: 'percent',
          fee: 0,
          fee_unit: 'percent',
          ongkir: 0,
          ongkir_unit: 'percent',
          contacts_fee: [],
          type_item: 'request',
          equivalent_id: null
        })
        
    }

    visibleModalPricetagItem.value = false;
}
const addVendor = (val: Contact[]) => {
    for (let index = 0; index < val.length; index++) {
        const element = val[index];
        
        summeries.value.push({
          unique_id: '',
          vendor_id: element.unique_id,
          vendor_version: 0,
          note: '',
          discount_unit: 'percent',
          discount_value: 0,
          canvassing_id: null,
          canvassing_version: 0,
          created_at: 0,
          created_by: null,
          version: 0,
          updated_at:0,
        })

        vendors.value.push({
          vendor_id: element.unique_id,
          vendor_name: element.name ?? '-',
          vendor_version: element.version ?? 1,
          items: ruleForm.canvassing_item.map((value, index) => ({
            index: `${index}`,
            unique_id: '',
            unit_id: value.unit_id,
            unit_name: value.unit_name,
            canvassing_item_id: '', 
            offer_item_id: null, 
            vendor_id: element.unique_id, 
            offer_item_version: 1,
            catalogue_id: value.catalogue_id, 
            catalogue_name: value.catalogue_name,
            quantity: value.quantity,
            unit_price: 0,
            total_price: 0,
            sourcing_document: null,
            status: CanvassingVendorStatus.SUBMITTED,
            additional_information: '', 
            created_at: 0,
            created_by: 0, 
            updated_at: 0,
            notes: '',
            taxes: [],
            canvaasing_version: 0,
            canvassing_id: '',
            children: [],
            editing: false,
            item_request_trail_id: value.item_request_trail_id,
            item_request_trail_version: value.item_request_trail_version,
            sn: value.sn,
            type: 'parent',
            vendor_name: element.name,
            request_number: value.request_number,
            unit_version: value.unit_version,
            pricetag_item_id: '',
            pricetag_item_version: 0,
            selling_price: 0,
            profit: 0,
            profit_unit: 'percent',
            fee: 0,
            fee_unit: 'percent',
            ongkir: 0,
            ongkir_unit: 'percent',
            contacts_fee: []
          })),
        })
        
    }

    visibleModalContact.value = false;
}

const removeCanvasingVendor = async (id: string) => {
  loading.value = true;
  try {
    const response = await useFetchApi<BaseResponse<any>>(`/canvassing-vendor-delete`, 'delete-canv-vendor', 'post', [id]);
    if(response.status.value == 'success'){
      ElMessage.success(`Data Berhasil Dihapus!`);
      return true;
    }else{
      return false;
    }
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error)
    return false;
  } finally {
    loading.value = false;
  }
}

const removeVendorOffer = async (vendorIndex: number,index: string) => {
  const findAndRemove = async (list: any[], indexKey: string) => {
    const dataIndex = list.findIndex(item => item.index === indexKey);
    if (dataIndex !== -1) {
      if(list[dataIndex].unique_id !== '' && list[dataIndex].unique_id !== null){
        const success = await removeCanvasingVendor(list[dataIndex].unique_id);
        if(success){
          list.splice(dataIndex, 1);
        }
      }else{
        list.splice(dataIndex, 1); // hapus row
      }
      return true;
    }
    // kalau ga ketemu di level ini, cek children
    for (const item of list) {
      if (item.children && item.children.length) {
        const removed = findAndRemove(item.children, index);
        if (await removed) return true;
      }
    }
    return false;
  };

  findAndRemove(vendors.value[vendorIndex].items, index);
}

// Search functions
const querySearchItems =  (query: string, cb: (arg: any) => void) => {
  try {
    
    cb([])
  } catch (error) {
    console.error('Failed to fetch items', error)
    cb([])
  }
}

const querySearchVendors =  (query: string, cb: (arg: any) => void) => {
  try {
    const request_search: RequestSearch = {
      column: [],
      keyword: query,
      limit: '50',
      offset: '1',
      sort: {
        column: 'created_at',
        order: OrderColumn.ASC,
      },
      table: 'contacts'
    }

    useFetchApi<ResponsePagination<Contact>>('/search', 'search-customer', 'post', request_search).then((response) => {
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
    console.error('Failed to fetch vendors', error)
    cb([])
  }
}

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

const onHandleSelectVendor = (item: any, request_index:number, vendor_index: number) => {
  if (item.isNew) {
    createNewVendor(item.query).then(customer => {
      if (customer) {
        ruleForm.canvassing_item[request_index].children[vendor_index].vendor_id = customer.unique_id;
        ruleForm.canvassing_item[request_index].children[vendor_index].vendor_name = customer.name;
        
      }
    })
  } else {
    const customer = item.data as Contact
    ruleForm.canvassing_item[request_index].children[vendor_index].vendor_id = customer.unique_id;
    ruleForm.canvassing_item[request_index].children[vendor_index].vendor_name = customer.name;
  }
}

const querySearchCatalogues = (query: string, cb: (arg: any) => void, itemIndex: number, vendorIndex: number) => {
  try {
    const request_contact: RequestSearch = {
        column: [
          {
            "offer": {
              "contact_id": ruleForm.canvassing_item[itemIndex].children[vendorIndex].vendor_id,
            }
          }
        ],
        keyword: query,
        limit: "100",
        offset: "1",
        sort: null,
        table: 'offers_item_vendor',
    }

    const request_contact_company: RequestSearch = {
        column: [
          {
            "is_company": [true],
            "ownership": [true],
          }
        ],
        keyword: query,
        limit: "100",
        offset: "1",
        sort: null,
        table: 'contacts',
    }

    useFetchApi<ResponsePagination<Contact[]>>('/search', 'fetch-is-company', 'post', request_contact_company).then((response) => {
      if(response.status.value === 'success'){
        const contacts: Contact[] = (response.data.value?.data ?? []) as Contact[];
        
      }
    })

    // const data = {
    //     "catalogue_id": null,
    //     "location": null,
    //     "contact": formInline.reference_to == 'contact' ? formInline.to : null,
    //     "quantity": tableItem.value[index].quantity,
    //     "owner_id": null
    // }

    // const response = await useFetchApi<BaseResponse<any>>(`/pricetag-item-read`, 'pricetag-search', 'post', data);
    
    // if(response.status.value == 'success'){
    //     console.log(response.data);
    // }

    // useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'search-offers', 'post', request_contact).then((response) => {
    //   if(response.status.value == 'success'){
    //     const catalogues: Catalogue[] = (response.data.value?.data ?? []) as Catalogue[];
    //     if(catalogues.length > 0){
    //       cb(catalogues.map((value) => ({
    //       value: value.name,
    //       unique_id: value.unique_id,
    //       data: value,
    //     })));
    //     }else{
    //       cb([{
    //         value: query,
    //         isNew: true,
    //         keyword: query,
    //       }])
    //     }
    //   }
    // });
    
    cb([])
  } catch (error) {
    console.error('Failed to fetch catalogues', error)
    cb([])
  }
}

// Selection handlers
const handleSelectItem = (item: any, itemIndex: number) => {
  
    
}


const handleSelectCatalogue = (catalogue: any, itemIndex: number, vendorIndex: number) => {
  const selectedCatalogue = catalogue.data
  ruleForm.canvassing_item[itemIndex].children[vendorIndex].catalogue_name = selectedCatalogue.name
  ruleForm.canvassing_item[itemIndex].children[vendorIndex].catalogue_id = selectedCatalogue.id
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        submit(formEl);
      } catch (error) {
        ElMessage.error('Failed to create canvassing')
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

const submit = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  try {

    const formData = new FormData();

    formData.append("unique_id", ruleForm.unique_id ?? '');
    formData.append("source_document", ruleForm.source_document ?? '');
    formData.append("description", ruleForm.description ?? '');
    formData.append("status", ruleForm.status);

    // looping canvassing_items
    ruleForm.canvassing_item.forEach((value, i) => {
      let vendor_item: CanvassingItemForm[] = [];

      for (let index = 0; index < vendors.value.length; index++) {
        const element = vendors.value[index];
        const itemVendor = element.items.filter(
          (item) => item.item_request_trail_id == value.item_request_trail_id
        );

        for (let indexChild = 0; indexChild < itemVendor.length; indexChild++) {
          const elementItemVendor = itemVendor[indexChild];
          vendor_item = [...vendor_item, ...elementItemVendor.children];
        }
      }

      // append canvassing_item fields
      formData.append(`canvassing_items[${i}][unique_id]`, `${value.unique_id}`);
      formData.append(`canvassing_items[${i}][canvassing_id]`, `${value.canvassing_id}`);
      formData.append(`canvassing_items[${i}][item_request_trail_id]`, `${value.item_request_trail_id}`);
      formData.append(`canvassing_items[${i}][canvassing_version]`, `${value.canvaasing_version}`);
      formData.append(`canvassing_items[${i}][item_request_trail_version]`, `${value.item_request_trail_version}`);
      formData.append(`canvassing_items[${i}][unit_id]`, `${value.unit_id}`);
      formData.append(`canvassing_items[${i}][unit_name]`, `${value.unit_name}`);
      formData.append(`canvassing_items[${i}][unit_version]`, `${value.unit_version}`);

      // looping canvassing_vendor
      vendor_item.forEach((vendorItem, j) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unique_id]`,
          `${vendorItem.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][canvassing_item_id]`,
          `${value.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][vendor_id]`,
          `${vendorItem.vendor_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_id]`,
          `${vendorItem.pricetag_item_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][pricetag_item_version]`,
          `${vendorItem.pricetag_item_version}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_id]`,
          `${vendorItem.catalogue_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][catalogue_name]`,
          `${vendorItem.catalogue_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][quantity]`,
          `${vendorItem.quantity}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_id]`,
          `${vendorItem.unit_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_name]`,
          `${vendorItem.unit_name}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][unit_price]`,
          `${vendorItem.unit_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][total_price]`,
          `${vendorItem.total_price}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][addtional_information]`,
          vendorItem.additional_information ?? ''
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${j}][status]`,
          'submitted'
        );
      });
    });


    summeries.value.forEach((element, index) => {
      formData.append(
        `canvassing_items_vendor_summery[${index}][unique_id]`,
        `${element.unique_id}`
      );
      formData.append(
        `canvassing_items_vendor_summery[${index}][vendor_version]`,
        `${element.vendor_version}`
      );
      formData.append(
        `canvassing_items_vendor_summery[${index}][vendor_id]`,
        `${element.vendor_id}`
      );
      formData.append(
        `canvassing_items_vendor_summery[${index}][note]`,
        `${element.note}`
      );
      formData.append(
        `canvassing_items_vendor_summery[${index}][discount_unit]`,
        `${element.discount_unit}`
      );
      formData.append(
        `canvassing_items_vendor_summery[${index}][discount_value]`,
        `${element.discount_value}`
      );
    })

    fileList.value.forEach((element, index) => {
      formData.append(`files[${index}]`, element.raw as Blob)
    })

    


    const response = await useFetchApi<BaseResponse<any>>('/canvassing-create', 'create-canvasing', 'post', formData);
    if(response.status.value == 'success'){
      ElMessage.success(`Berhasil Membuat Data Canvasing!`);
      formEl?.resetFields();
      vendors.value = [];
      offerIndex.value = 0;
      offerIndex.value = 0;
      rowKey.value = '';
    }  
  } catch (error: any) {
    ElMessage.error(error.response?.message ?? error);
  } finally {
    loading.value = false;
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  formEl.resetFields()
  ruleForm.canvassing_item = [];
  addNewItem();
}

// Watch search query
watchDebounced(
  request_search_inquiry.value,
  
  () => {
    // invoices.value.currentPage = 1
    fetchInquiry()
  },
  { debounce: 500 }
)
watchDebounced(
  request_search_contact.value,
  () => {
    fetchContact()
  },
  { debounce: 500}
)
watchDebounced(
  request_search_pricetag_item.value,
  () => {
    fetchPriceTag()
  },
  { debounce: 500}
)


const getReference = (data: Inquiry) => {
    console.log(data);
  if (data.reference == "internal") {
    const contact: Contact | null = (data?.reference_data ?? null) as Contact | null;
    return (contact == null ? <div>-</div> : <div>{contact?.name}</div>);
  } else {
    const maintenance: Maintenance | null = (data?.reference_data ?? null) as Maintenance | null;
    return (maintenance == null ? <div>-</div>: <div>{maintenance?.unique_code}</div>);
  }

};


const onSort = (sortBy: SortBy) => {
    const data:RequestSearch = {...request_search_inquiry.value};
    data.sort = {
        column: sortBy.key.toString(),
        order: request_search_inquiry.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
    };
    request_search_inquiry.value = data;

}

const handleSelectionChange = (val: ItemRequestTrail[]) => {
    
  (itemRequest.value?.data ?? []).forEach((value) => {
    if(val.find((data) => data.unique_id == value.unique_id)?.unique_id == value.unique_id){
        value.checked = true;
    }else{
        value.checked = false;
    }
  })
}

const handleSelectionChangePriceTagItem = (val: Pricetag_item[]) => {
    
  (priceTagItem.value ?? []).forEach((value) => {
    if(val.find((data) => data.unique_id == value.unique_id)?.unique_id == value.unique_id){
        value.checked = true;
    }else{
        value.checked = false;
    }
  })
}

const handleSelectionChangeContact = (val: Pricetag_item[]) => {
    
  (contacts.value?.data ?? []).forEach((value) => {
    if(val.find((data) => data.unique_id == value.unique_id)?.unique_id == value.unique_id){
        value.checked = true;
    }else{
        value.checked = false;
    }
  })
}

const paginationClick = (val: number) => {
    request_search_inquiry.value.offset = val.toString();;
}

const paginationClickContact = (val: number) => {
    const data:RequestSearch = {...request_search_contact.value};
    data.offset = val.toString();
    request_search_contact.value = data;
}

const fetchInquiry = async () => {
    loading.value = true;
    try {
        const response = await useFetchApi<ResponsePagination<ItemRequestTrail[]>>('/search', 'search-request', 'post', request_search_inquiry.value);
        if(response.status.value == 'success'){
            itemRequest.value = response.data.value!;
        }
    } catch (error: any) {
        ElMessage.error(`${error}`);
    } finally {
        loading.value = false;
    }
}

const fetchDataEdit = async () => {
   
  loading.value = true;
  try {
     const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${id.value}`, 
      'detail-canvassing', 
      'get', 
      null
    );

    if(response.status.value == 'success'){
      const canvasing: Canvassing|null = response.data.value?.data ?? null;
      if(canvasing != null){
        ruleForm.unique_id = canvasing.unique_id;
        ruleForm.description = canvasing.description;
        ruleForm.status = canvasing.status;
        ruleForm.source_document = canvasing.source_document;
        ruleForm.canvassing_item = canvasing.canvassing_item.map((value) => ({
          index: `${ruleForm.canvassing_item.length + 1}`,
          item_request_trail_version: value.item_request_trail_version,
          canvassing_id: value.canvassing_id,
          canvaasing_version: value.canvaasing_version, 
          item_request_trail_id: value.item_request_trail_id, 
          request_number: value.item_request_trail?.reference_code ?? '-',
          unique_id: value.unique_id,
          vendor_id: '',
          vendor_name: '',
          unit_id: value.unit_id ?? '',
          unit_name: value.unit_name ?? '',
          unit_version: 0,
          offer_item_id: '',
          offer_item_version: 0, 
          catalogue_name: value.item_request_trail?.item_request?.catalogue_name ?? '',
          catalogue_id: value.item_request_trail?.item_request?.catalogue_id ?? '',
          sn: value.item_request_trail?.item_request?.sn ?? '',
          quantity: value.item_request_trail?.item_request?.request_qty ?? 1,
          unit_price: 0,
          total_price: 0,
          status: CanvassingVendorStatus.SUBMITTED,
          additional_information: '',
          taxes: [],
          editing: false,
          type: "parent",
          children: [],
          pricetag_item_id: '',
          pricetag_item_version: 0,
          selling_price: value.unit_selling_price,
          profit: 0,
          profit_unit: 'percent',
          fee: 0,
          fee_unit: 'percent',
          ongkir: 0,
          ongkir_unit: 'percent',
          contacts_fee: []
        }));
        
        vendors.value = groupByVendor(canvasing.canvassing_item);
        summeries.value = (canvasing.canvasing_item_vendor_summery ?? []);
      }
    }
  } catch (error: any) {
    console.log(error);
    ElMessage.error(error);
    // router.back();
  } finally {
    loading.value = false;
  }
}


const querySearchUnit = (queryString: string, cb: (arg: any) => void) => {

  requestSearchUnit.value.keyword = queryString;
  
  useFetchApi<ResponsePagination<Unit[]>>('/search', 'units', 'post', requestSearchUnit).then((response) => {
    if (response.status.value == 'success') {
        const resultApi: Unit[] = response.data.value?.data as Unit[];

        if (resultApi.length > 0) {
          cb(resultApi.map((value) => ({ ...value, value: value.name })));
        } else {
          cb([{ value: `Tambahkan ${queryString}`, id: `${queryString}` }]);
        }
      }
  })
  
};

const handleSelectUnit = (item: Record<string, any>, vendorIndex: number, index: string) => {
  const unit: Unit = item as Unit;

  const itemExist = vendors.value[vendorIndex].items.find((value) => value.index === index);

  if(itemExist){
    itemExist.unit_id = unit.unique_id;
    itemExist.unit_name = unit.name ?? '';
  }

};

function groupByVendor(canvassingItems: CanvassingItem[]): CanvasingVendorView[] {
  const map = new Map<string, CanvasingVendorView>()

  canvassingItems.forEach((item: CanvassingItem, itemIndex: number) => {
    // cek semua vendor unik dalam 1 item
    const vendorIds = [...new Set(item.canvassing_vendor.map(v => v.vendor_id))]

    vendorIds.forEach(vendorId => {
      const vendorObj = item.canvassing_vendor.find(v => v.vendor_id === vendorId)
      if (!vendorObj) return

      if (!map.has(vendorId!)) {
        map.set(vendorId!, {
          vendor_id: vendorId!,
          vendor_name: vendorObj.vendor?.name ?? '',
          vendor_version: vendorObj.vendor?.version ?? 0,
          items: []
        })
      }

      const groupedVendor = map.get(vendorId!)!
      // cek apakah item ini sudah ada untuk vendor ini
      const alreadyExists = groupedVendor.items.some(i => i.unique_id === item.unique_id)

      if (!alreadyExists) {
        const itemFind = item.canvassing_vendor.filter(v => v.vendor_id === vendorId);

        groupedVendor.items.push({
          index: `${vendorId}-${itemIndex}`,
          item_request_trail_version: 0,
          canvassing_id: null,
          canvaasing_version: null,
          item_request_trail_id: item.item_request_trail_id,
          unique_id: item.unique_id,
          vendor_id: '',
          vendor_name: '',
          unit_id: item.item_request_trail?.item_request?.unit_id ?? '',
          unit_name: item.item_request_trail?.item_request?.unit_name ?? '',
          unit_version: 0,
          offer_item_id: null,
          offer_item_version: 0,
          catalogue_id: item.item_request_trail?.item_request?.catalogue_id ?? '',
          catalogue_name: item.item_request_trail?.item_request?.catalogue_name ?? '',
          sn: item.item_request_trail?.item_request?.sn ?? '',
          quantity: item.item_request_trail?.item_request?.request_qty ?? 1,
          unit_price: 0,
          total_price: 0,
          status: CanvassingVendorStatus.SUBMITTED,
          additional_information: '',
          taxes: [],
          editing: false,
          type: "parent",
          pricetag_item_id: '',
          pricetag_item_version: 0,
          children: itemFind.map((value, index) => ({
            index: `${vendorId}-${itemIndex}-${index}`,
            canvassing_id: null,
            canvaasing_version: null,
            item_request_trail_id: item.item_request_trail_id,
            item_request_trail_version: item.item_request_trail_version,
            unique_id: value.unique_id,
            vendor_id: value.vendor_id,
            vendor_name: value.vendor?.name ?? '',
            unit_id: value.unit_id,
            unit_name: value.unit_name,
            unit_version: 0,
            offer_item_id: null,
            offer_item_version: 0,
            catalogue_id: value.catalogue_id,
            catalogue_name: value.catalogue?.name ?? '',
            sn: value.catalogue?.sn ?? '',
            quantity: item.item_request_trail?.item_request?.request_qty ?? 1,
            unit_price: value.unit_price,
            total_price: value.total_price,
            status: value.status,
            additional_information: value.additional_information,
            taxes: [],
            editing: false,
            type: "child",
            children: [],
            pricetag_item_id: value.pricetag_item_id ?? '',
            pricetag_item_version: value.pricetag_item_version ?? 0,
            selling_price: value.selling_price ?? 0,
            profit: value.profit,
            profit_unit: value.profit_unit,
            fee: value.fee,
            fee_unit: value.fee_unit,
            ongkir: value.ongkir,
            ongkir_unit: value.ongkir_unit,
            contacts_fee: []
          })),
          selling_price: 0,
          profit: 0,
          profit_unit: 'percent',
          fee: 0,
          fee_unit: 'percent',
          ongkir: 0,
          ongkir_unit: 'percent',
          contacts_fee: []
        })
      }
    })
  })

  return Array.from(map.values())
}
onMounted(() => {
  if(id.value){
    fetchDataEdit();
  }
  
  
  fetchInquiry();
  fetchContact();
})

</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>