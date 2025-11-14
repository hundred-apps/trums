<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          RAB - {{ canvassingData?.unique_code || 'Loading...' }}
        </span>
      </template>
    </el-page-header>

    <CanvassingDetail v-if="canvassingData" :canvassingData="canvassingData" />
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { CanvassingStatus, CanvassingVendorStatus } from '~/types/scm/canvasing'
import type { Canvassing, CanvassingItemForm } from '~/types/scm/canvasing'
import type { BaseResponse } from '~/types/response';
import type { ElTable, FormProps } from 'element-plus';
import { FeeType, PartyType, ReferenceAdjustment, type AdjustmentTransaction, type ReferenceTransactionAdjustment } from '~/types/attribute_adjustment';
import { type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import CanvassingDetail from './components/CanvassingDetail.vue';

// ========== PAGE META & ROUTING ==========
definePageMeta({
  middleware: ["auth", "app"],
  name: "Quotation Detail",
});

// ========== COMPOSABLES ==========
const router = useRouter()
const route = useRoute()

// ========== STATE MANAGEMENT ==========
// UI State
const loading = ref(false)
const visibleApproveDialog = ref<boolean>(false)
const drawerFeeVisible = ref(false)

// Data State
const canvassingData = ref<Canvassing | null>(null)
const selectedVendors = ref<Record<string, string>>({})
const item_canvassing = ref<CanvassingItemForm[]>([])
const contactsFee = ref<ReferenceTransactionAdjustment[]>([])
const contactsFeeToEdit = ref<ReferenceTransactionAdjustment[]>([])
const selectedChildren = ref<CanvassingItemForm[]>([])

// Form State
const feeState = ref<string>('minus')
const unitFee = ref<FeeType>(FeeType.PERCENT)
const itemIndex = ref<string>('')

const selectedItemDrawer = ref<{index: string,name: string, vendor_name: string}>({
  index: '',
  name: '',
  vendor_name: '',
})

// ========== REFS ==========
const tableRef = ref<InstanceType<typeof ElTable>>()
const formApproveLabel = ref<FormProps['labelPosition']>('top')

// ========== API REQUESTS ==========
const request_search_contact = ref<RequestSearch>({
  column: [],
  keyword: '',
  limit: '10',
  offset: '1',
  sort: null,
  table: 'contacts',
})

const querySearchAdjustmentTransaction = ref<RequestSearch>({
  keyword: "",
  table: "adjustments_transaction",
  column: [],
  sort: null,
  limit: "10",
  offset: "1"
})

const adjustmentTransactions = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>(
  '/search', 
  'search-adjustment', 
  'post', 
  querySearchAdjustmentTransaction
)

// ========== COMPUTED PROPERTIES ==========
const adjustmentContact = computed(() => {
  const data = adjustmentTransactions.data.value?.data || []
  return data.find((value: AdjustmentTransaction) => 
    value.name?.toLowerCase().includes('fee') && value.operator === feeState.value
  )
})

const adjustmentOngkir = computed(() => {
  const data = adjustmentTransactions.data.value?.data || []
  return data.find((value: AdjustmentTransaction) => 
    value.name?.toLowerCase().includes('ongkos kirim') && value.operator === feeState.value
  )
})

const adjustmentTransactionOngkirTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: '',
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: '',
  adjustment_id: `${adjustmentOngkir.value?.unique_id}`,
  adjustment: adjustmentOngkir.value,
  value: null,
  type: FeeType.AMOUNT,
  amount: 0,
  created_at: 0,
  changeType: false,
})

const adjustmentTransactionFeeTotal = ref<ReferenceTransactionAdjustment>({
  unique_id: '',
  reference: ReferenceAdjustment.CANVASSING,
  reference_id: '',
  adjustment_id: `${adjustmentContact.value?.unique_id}`,
  adjustment: adjustmentContact.value,
  adjustments_transaction: adjustmentContact.value,
  value: null,
  type: unitFee.value,
  amount: 0,
  created_at: 0,
})

const disableButtonApprove = computed(() => Object.values(selectedVendors.value).every(v => v !== ""))

// ========== UTILITY FUNCTIONS ==========
const goBack = () => router.back()

const formatStatus = (status: CanvassingStatus): string => {
  const statusMap: Record<CanvassingStatus, string> = {
    [CanvassingStatus.DRAFT]: 'DRAFT',
    [CanvassingStatus.PENDING_APPROVAL]: 'Menunggu Di Setujui',
    [CanvassingStatus.RAB]: 'DRAFT',
    [CanvassingStatus.PENDING_APPROVAL_RAB]: 'Menunggu Di Setujui',
    [CanvassingStatus.DONE]: 'Di Setujui',
    [CanvassingStatus.CANCEL]: 'Tidak Di Setujui',
    [CanvassingStatus.CANVASSING]: 'Canvassing',
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: CanvassingStatus) => {
  const typeMap: Record<CanvassingStatus, 'success' | 'info' | 'danger' | 'warning' | 'primary'> = {
    [CanvassingStatus.DRAFT]: 'info',
    [CanvassingStatus.RAB]: 'info',
    [CanvassingStatus.CANVASSING]: 'info',
    [CanvassingStatus.PENDING_APPROVAL]: 'warning',
    [CanvassingStatus.PENDING_APPROVAL_RAB]: 'warning',
    [CanvassingStatus.CANCEL]: 'danger',
    [CanvassingStatus.DONE]: 'success'
  }
  return typeMap[status] || 'primary'
}

// ========== BUSINESS LOGIC FUNCTIONS ==========
const openFeeDrawer = (item: CanvassingItemForm) => {
  itemIndex.value = item.index
  contactsFeeToEdit.value = [...item.contacts_fee]
  selectedItemDrawer.value = {
    index: item.index,
    vendor_name: item.vendor_name ?? '',
    name: item.catalogue_name,
  }
  drawerFeeVisible.value = true
}

const handleSaveFee = ({ item, contacts, fee }: {
  item: { index: string; name: string; vendor_name: string };
  contacts: ReferenceTransactionAdjustment[];
  fee?: number
}) => {
  const cleanContacts = JSON.parse(JSON.stringify(contacts))
  updateItemFee(item_canvassing.value, itemIndex.value, cleanContacts, (fee ?? 0))
  syncFeeAcumulation()
  item_canvassing.value.forEach(element => setProfit(element))
}

const updateItemFee = (items: CanvassingItemForm[], index: string, contacts?: ReferenceTransactionAdjustment[], fee?: number) => {
  for (const it of items) {
    if (it.index === index && it.type === 'child') {
      if(contacts){
        it.fee = contacts.reduce((sum, c) => sum + (c.amount || 0), 0)
        it.contacts_fee = contacts
      } else {
        it.fee = fee ?? 0
      }
    } else if(it.type === 'child' && contacts){
      if(it.contacts_fee.length > 0){
        const contactNotExist: ReferenceTransactionAdjustment[] = []
        contacts.forEach(element => {
          const findIndex = (it.contacts_fee ?? []).findIndex((c) => c.party_id == element.party_id)
          if(findIndex < 0){
            contactNotExist.push({...element, amount: 0, value: 0})
          }
        })
        it.contacts_fee = [...it.contacts_fee, ...contactNotExist]
      } else {
        it.contacts_fee = contacts.map((value) => ({...value, amount: 0, value: 0}))
      }
    }
    if(it.children.length > 0) updateItemFee(it.children, index, contacts, fee)
  }
}

const syncFeeAcumulation = () => {
  if(feeState.value != 'plus') return

  contactsFee.value.forEach((value) => value.amount = 0)
  const newContactFee: ReferenceTransactionAdjustment[] = JSON.parse(JSON.stringify(contactsFee.value))
  
  item_canvassing.value.forEach((item) => {
    const selling_price = Number(item.selling_price || 0)
    item.children.forEach((child) => {
      const hargaBeli = Number(child.unit_price || 0)
      const ongkirNominal = child.ongkir
      const selisih = selling_price - hargaBeli - ongkirNominal

      let profit = 100
      let fee = 0

      if(child.fee_unit == 'percent'){
        fee = Number(child.fee)
      } else {
        fee = Number(child.fee) / hargaBeli * 100
      }

      if(child.profit_unit == 'amount'){
        profit = Number(child.profit) / hargaBeli * 100
      }

      const profitAndFee = profit + fee
      child.fee = fee
      child.fee_nominal = (selisih * fee / profitAndFee) < 0 ? 0 : (selisih * fee / profitAndFee)
      child.profit_nominal = (selisih < 0 ? 0 : selisih) * profit / profitAndFee
      child.profit = Number((child.profit_nominal / hargaBeli * 100).toFixed(2))

      const findContactFee = newContactFee.findIndex((fee) => fee.party_id == child.contacts_fee[0]?.party_id)
      if(findContactFee >= 0){
        if(unitFee.value == FeeType.AMOUNT){
          newContactFee[findContactFee].amount += Number(child.contacts_fee[0]?.amount_nominal || 0)
        } else {
          newContactFee[findContactFee].amount += Number(child.fee)
        }
        newContactFee[findContactFee].amount = Math.round(newContactFee[findContactFee].amount)
      }
    })
  })
  contactsFee.value = newContactFee
}

const setProfit = (row: CanvassingItemForm) => {
  const selling_price = Number(row.selling_price || 0)
  
  if(row.type == 'parent'){
    row.children.forEach((child) => {
      const hargaBeli = Number(child.unit_price || 0)
      const ongkirNominal = child.ongkir_unit === 'percent' ? (hargaBeli * child.ongkir) / 100 : Number(child.ongkir) || 0
      const selisih = selling_price - hargaBeli - ongkirNominal

      let profit = 100
      let fee = 0

      if(child.fee_unit == 'percent'){
        fee = Number(child.fee)
      } else {
        fee = Number(child.fee) / hargaBeli * 100
      }

      if(child.profit_unit == 'amount'){
        profit = Number(child.profit) / hargaBeli * 100
      }

      const profitAndFee = profit + fee
      child.fee = fee
      child.fee_nominal = (selisih * fee / profitAndFee) < 0 ? 0 : (selisih * fee / profitAndFee)
      child.profit_nominal = (selisih < 0 ? 0 : selisih) * profit / profitAndFee
      child.profit = Number((child.profit_nominal / hargaBeli * 100).toFixed(2))
    })
  }
}

// ========== TABLE SELECTION FUNCTIONS ==========
const handleSelect = (selection: CanvassingItemForm[], row: CanvassingItemForm): void => {
  const isSelected = selection.some(selected => selected.index === row.index)
  
  if (row.type === 'parent') {
    row.checked = isSelected
    row.children?.forEach(child => child.checked = isSelected)
  } else {
    row.checked = isSelected
    updateParentCheckedState(row)
  }
  
  updateSelectedChildrenFromChecked()
}

const updateParentCheckedState = (changedChild?: CanvassingItemForm): void => {
  item_canvassing.value.forEach(parent => {
    if (parent.children) {
      const checkedChildrenCount = parent.children.filter(child => child.checked).length
      const allChildrenCount = parent.children.length
      
      if (checkedChildrenCount === allChildrenCount) parent.checked = true
      else if (checkedChildrenCount > 0) parent.checked = false
      else parent.checked = false
    }
  })
}

const updateSelectedChildrenFromChecked = (): void => {
  selectedChildren.value = []
  item_canvassing.value.forEach(parent => {
    if (parent.children) {
      parent.children.forEach(child => {
        if (child.checked) selectedChildren.value.push(child)
      })
    }
  })
}

const updateTableSelection = (): void => {
  nextTick(() => {
    if (!tableRef.value) return
    tableRef.value.clearSelection()
    
    item_canvassing.value.forEach(parent => {
      if (parent.checked) tableRef.value!.toggleRowSelection(parent, true)
      parent.children?.forEach(child => {
        if (child.checked) tableRef.value!.toggleRowSelection(child, true)
      })
    })
  })
}

// ========== API CALLS ==========
const fetchCanvassing = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`, 
      'detail-canvassing', 
      'get', 
      null
    )

    if(response.status.value == 'success' && response.data.value?.data){
      initialCanvassing(response.data.value.data)
    }
  } catch (error) {
    ElMessage.error('Failed to fetch canvassing data')
    console.error(error)
    goBack()
  } finally {
    loading.value = false
  }
}

const initialCanvassing = (data: Canvassing) => {
  canvassingData.value = data
  contactsFee.value = []
  
  ;(canvassingData.value.reference_transaction ?? []).forEach(element => {
    if(element.party_type == PartyType.CONTACT){
      contactsFee.value.push(element)
    }
  })

  ;(canvassingData.value.canvassing_item ?? []).forEach(element => {
    item_canvassing.value.push({
      index: `${element.unique_id}`,
      canvassing_id: element.canvassing_id,
      canvaasing_version: element.canvaasing_version,
      item_request_trail_version: element.item_request_trail_version,
      item_request_trail_id: element.item_request_trail_id,
      unique_id: element.unique_id,
      vendor_id: null,
      vendor_name: '',
      unit_id: element.unit_id,
      unit_name: element.unit_name,
      unit_version: null,
      offer_item_id: null,
      offer_item_version: 0,
      catalogue_id: element.catalogue_id ?? '',
      parent_catalogue_id: '',
      catalogue_name: element.catalogue_name ?? '',
      sn: element.catalogue?.sn ?? 'N/A',
      quantity: element.quantity ?? 1,
      unit_price: 0,
      total_price: Number(element.unit_selling_price) * Number(element.quantity),
      status: CanvassingVendorStatus.SUBMITTED,
      taxes: [],
      editing: null,
      type: 'parent',
      type_item: element.type_item,
      equivalent_id: element.equivalent_id,
      children: element.canvassing_vendor.map((child) => ({
        type_item: child.type_item,
        equivalent_id: child.equivalent_id,
        index: `${child.unique_id}`,
        canvassing_id: null,
        canvaasing_version: null,
        item_request_trail_version: null,
        item_request_trail_id: null,
        unique_id: child.unique_id,
        vendor_id: child.vendor_id ?? '',
        vendor_name: child.vendor?.name ?? '',
        unit_id: child.unit_id,
        unit_name: child.unit_name,
        unit_version: null,
        offer_item_id: null,
        offer_item_version: 0,
        catalogue_id: child.catalogue_id ?? '',
        parent_catalogue_id: child.catalogue_id,
        catalogue_name: child.catalogue?.name ?? '',
        sn: child.catalogue?.sn ?? '',
        quantity: child.quantity,
        unit_price: child.unit_price,
        total_price: child.total_price,
        status: child.status,
        checked: child.status == CanvassingVendorStatus.SUBMITTED ? true : false,
        taxes: [],
        editing: null,
        type: 'child',
        children: [],
        selling_price: child.selling_price ?? 0,
        profit: child.profit,
        profit_unit: child.profit_unit,
        fee: child.fee,
        fee_unit: child.fee_unit,
        ongkir: child.ongkir,
        ongkir_unit: child.ongkir_unit,
        pricetag_item_id: child.pricetag_item_id ?? '',
        pricetag_item_version: child.pricetag_item_version ?? 0,
        contacts_fee: child.reference_transaction.filter((value) => value.party_type == PartyType.CONTACT),
      })),
      selling_price: element.unit_selling_price,
      profit: 0,
      profit_unit: 'percent',
      fee: 0,
      fee_unit: 'percent',
      ongkir: 0,
      ongkir_unit: 'percent',
      pricetag_item_id: '',
      pricetag_item_version: 0,
      contacts_fee: [],
    })
  })

  item_canvassing.value.forEach((parent) => setProfit(parent))
}

const updateStatus = async (status: CanvassingStatus) => {
  if (!canvassingData.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append("unique_id", canvassingData.value.unique_id || '')
    formData.append("status", status)
    formData.append("note", canvassingData.value.note ?? '')

    canvassingData.value.canvassing_item.forEach((element, i) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${element.unique_id}`)
      element.canvassing_vendor.forEach((vendor, vI) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][unique_id]`,
          `${vendor.unique_id}`
        )
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][status]`,
          `${vendor.status}`
        )
      })
    })
    
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      '/canvassing-create', 
      'update-canvassing-status', 
      'post', 
      formData
    )
    
    if(response.status.value == 'success'){
      canvassingData.value.status = status
      ElMessage.success('Canvassing status updated')
    }  
  } catch (error) {
    ElMessage.error('Failed to update status')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const approve = async () => visibleApproveDialog.value = true

const submitApprove = async() => {
  canvassingData.value?.canvassing_item.forEach(element => {
    element.canvassing_vendor.forEach(vendor => {
      if(vendor.status === CanvassingVendorStatus.SUBMITTED || vendor.status === CanvassingVendorStatus.SELECTED){
        vendor.status = CanvassingVendorStatus.SELECTED
      } else {
        vendor.status = CanvassingVendorStatus.REJECTED
      }
    })
  })

  await updateStatus(CanvassingStatus.DONE)
  visibleApproveDialog.value = false
}

// ========== WATCHERS ==========
watch(() => item_canvassing.value, () => {
  updateSelectedChildrenFromChecked()
  updateTableSelection()
}, { deep: true })

watch(() => item_canvassing.value, () => {
  item_canvassing.value.forEach((element) => {
    const findCanvassingItem = (canvassingData.value?.canvassing_item ?? []).findIndex((item) => item.unique_id == element.unique_id)
    element.children.forEach(child => {
      if(findCanvassingItem >= 0){
        const vendorIndex = (canvassingData.value?.canvassing_item[findCanvassingItem].canvassing_vendor ?? [])
          .findIndex((v) => v.unique_id == child.unique_id)
        if(vendorIndex >= 0){
          canvassingData.value!.canvassing_item[findCanvassingItem].canvassing_vendor[vendorIndex].status = 
            child.checked ? CanvassingVendorStatus.SELECTED : CanvassingVendorStatus.SUBMITTED
        }
      }
    })
  })
}, { deep: true })

// ========== LIFECYCLE ==========
onMounted(() => {
  if(route.params.id) fetchCanvassing()
})
</script>

<style scoped>
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

.vendor-info {
  line-height: 1.4;
}

:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
:deep(.el-table .success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>