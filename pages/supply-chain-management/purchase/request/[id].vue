<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Purchase Request - {{ purchaseRequestData?.unique_code }}
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
          <NuxtLink 
            :to="`/supply-chain-management/purchase/request/add?id=${purchaseRequestData?.unique_id}`" 
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button 
            type="success" 
            v-if="purchaseRequestData?.status === 'waiting_approval'"
            @click="approvePurchaseRequest"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve
          </el-button>
          <el-button 
            type="warning" 
            v-if="purchaseRequestData?.status === 'draft'"
            @click="submitForApproval"
          >
            <el-icon class="me-2"><Upload /></el-icon> Submit for Approval
          </el-button>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Nomor Referensi">
              {{ purchaseRequestData?.source_document || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Nomor PR">
              {{ purchaseRequestData?.unique_code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Diminta Oleh">
              {{ purchaseRequestData?.requester?.name || '-' }}
            </el-descriptions-item>
            
          </el-descriptions>
        </div>
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            
            <el-descriptions-item label="Status">
              <el-tag :type="getStatusTagType(purchaseRequestData?.status || 'draft')">
                    {{ formatStatus(purchaseRequestData?.status || 'draft') }}
                  </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Dibuat Oleh">
              {{ purchaseRequestData?.people?.name || '-' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="Tanggal Dibuat">
              {{ purchaseRequestData?.created_at != null ? formatLocalDate(purchaseRequestData?.created_at) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <el-descriptions title="Catatan" v-if="notes">
        <el-descriptions-item label="">{{ notes }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Purchase Request Items</span>
        </div>
      </template>
      <el-table :data="purchaseRequestData?.items_request_trail" border>
        <el-table-column prop="item_request.catalogue_name" label="Item" width="350"  />
        <el-table-column prop="item_request.inquiry.unique_code" label="Nomor Permintaan" width="190" />
        <el-table-column prop="item_request" label="Qty Diminta" align="right" width="120">
          <template #default="scope">
            {{ scope.row.item_request?.request_qty }}
          </template>
        </el-table-column>
        <el-table-column prop="request_purchase_quantity" label="Qty" align="right" width="200">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="1" v-if="scope.row.status === ItemRequestTrailStatus.WAITING" />
            <p v-else>
              {{ scope.row.quantity }}
            </p>
          </template>
        </el-table-column>
        
        <el-table-column prop="unit_name" label="UOM" align="center">
          <template #default="scope">
            {{ scope.row.item_request?.unit_name }}
          </template>
        </el-table-column>
        <el-table-column label="Aksi" align="center" width="300" v-if="purchaseRequestData?.status === PurchaseRequestStatus.WAITING_APPROVAL">
          <template #default="scope">
            <el-button 
              type="success" 
              v-if="scope.row.status === ItemRequestTrailStatus.WAITING && purchaseRequestData?.status === PurchaseRequestStatus.WAITING_APPROVAL"
              @click="() => itemAction(scope.$index, ItemRequestTrailStatus.DONE)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Approve
            </el-button>
            <el-button 
              type="danger" 
              v-if="scope.row.status === ItemRequestTrailStatus.WAITING && purchaseRequestData?.status === PurchaseRequestStatus.WAITING_APPROVAL"
              @click="() => itemAction(scope.$index, ItemRequestTrailStatus.REJECT)"
            >
              <el-icon class="me-2"><CircleCheck /></el-icon> Reject
            </el-button>
            <el-tag v-if="scope.row.status === ItemRequestTrailStatus.DONE || scope.row.status === ItemRequestTrailStatus.REJECT" :type="getItemStatusTagType(scope.row.status)">
              {{ formatStatusItem(scope.row.status) }}
                
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-3" v-if="purchaseRequestData?.status === 'approved'">
      <template #header>
        <div class="card-header">
          <span>Purchase Orders Terkait</span>
        </div>
      </template>
      <el-table :data="relatedPurchaseOrders.data ?? []" border>
        <el-table-column prop="catalogue_name" label="Item" />
        <el-table-column prop="purchase_order.unique_code" label="Nomor PO" />
        <el-table-column prop="purchase_order.vendor_name" label="Vendor" />
        <el-table-column prop="quantity" label="Quantity" align="right"/>
        <el-table-column prop="unit_price" label="Unit Price" align="right">
          <template #default="scope">
            {{ currency(scope.row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" align="center">
          <template #default="scope">
            <el-tag :type="getPOStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <NuxtLink 
              :to="`/supply-chain-management/purchase/order/${scope.row.purchase_order.unique_id}`"
              class="el-button el-button--primary el-button--small"
            >
              View
            </NuxtLink>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    
    <el-card class="mb-3" v-if="attachments.length > 0">
      <template #header>
        <div class="card-header">
          <span>Lampiran</span>
        </div>
      </template>
      <el-table :data="attachments" border>
        <el-table-column prop="filename" label="Nama File" />
        <el-table-column prop="size" label="Ukuran" />
        <el-table-column prop="uploaded_at" label="Tanggal Upload">
          <template #default="scope">
            {{ formatLocalDate(scope.row.uploaded_at) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" align="center">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small"
              @click="downloadAttachment(scope.row)"
            >
              Download
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="visibleApproveDialog" title="Approve PR!" width="500">
      <el-form :model="purchaseRequestData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="purchaseRequestData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitForApprove">
            Approve
          </el-button>
        </div>
      </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, CircleCheck, ArrowDown, Upload } from '@element-plus/icons-vue'
import type { FormProps } from 'element-plus';
import { ItemRequestTrailStatus, type ItemRequestTrail } from '~/types/item_request';
import { PurchaseRequestStatus, type PurchaseRequest, type PurchaseRequestItem } from '~/types/purchase_request'
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response'
import type { ResponsePagination } from '~/types/response_pagination';
import type { PurchaseOrderItem } from '~/types/scm/purchase_order';

definePageMeta({
  middleware: ["auth", "app"],
  name: "Purchase Request Detail",
});

const visibleApproveDialog = ref<boolean>(false);
const router = useRouter()
const route = useRoute()
const purchaseRequestId = ref<string>(route.params.id as string)

const formApproveLabel = ref<FormProps['labelPosition']>('top')
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
const purchaseRequestData = ref<PurchaseRequest | null>(null)
const notes = ref('')
const relatedPurchaseOrders = ref<ResponsePagination<PurchaseOrderItem[]>>({
  currentPage: 0,
  data: [],
  success: true,
  total_data: 0,
  total_page: 0,
});
const statusHistory = ref<any[]>([])
const attachments = ref<any[]>([])

const purchase_request_order_related = ref<RequestSearch>({
    column: [],
    table: "purchase_order_item",
    keyword: "",
    filter: null,
    offset: "1",
    limit: "10",
    sort: {
      column: "updated_at",
      order: OrderColumn.ASC,
    }
});

const availableStatuses = [
  PurchaseRequestStatus.DRAFT,
  PurchaseRequestStatus.WAITING_APPROVAL,
  PurchaseRequestStatus.APPROVED,
  PurchaseRequestStatus.REJECTED,
  PurchaseRequestStatus.CANVASSING,
]

const goBack = () => router.back();


watchDebounced(
  purchase_request_order_related.value,
  
  () => {
    // invoices.value.currentPage = 1
    fetchRelatedData()
  },
  { debounce: 500 }
)



// Fetch purchase request data
const fetchPurchaseRequest = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      `/purchase-request-read/${purchaseRequestId.value}`, 
      'detail-purchase-request', 
      'get', 
      null
    )

    if (response.status.value === 'success') {
      console.log(response.data.value!.data);
      purchaseRequestData.value = response.data.value!.data


      purchase_request_order_related.value.column = [
        {
          "pr_item_request_trail_id": purchaseRequestData.value.items_request_trail.map((value) => value.unique_id),
          "status": "done",
        }
      ];
      // await fetchRelatedData()
    }
  } catch (error) {
    ElMessage.error('Gagal mengambil data purchase request')
    goBack()
  } finally {
    loading.value = false
  }
}

// Fetch related data
const fetchRelatedData = async () => {
  if (!purchaseRequestData.value) return

  
  try {
    // Fetch related purchase orders
    const poResponse = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>(
      `/search`,
      'related-purchase-order',
      'post',
      purchase_request_order_related.value,
    )
    
    if (poResponse.status.value === 'success') {
      relatedPurchaseOrders.value = poResponse.data.value || {
        currentPage: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0,
      }
    }

    // // Fetch status history
    // const historyResponse = await useFetchApi<BaseResponse<any[]>>(
    //   `/purchase-request-history/${purchaseRequestData.value.unique_id}`,
    //   'status-history',
    //   'get',
    //   null
    // )
    
    // if (historyResponse.status.value === 'success') {
    //   statusHistory.value = historyResponse.data.value?.data || []
    // }

    // // Fetch attachments
    // const attachmentsResponse = await useFetchApi<BaseResponse<any[]>>(
    //   `/purchase-request-attachments/${purchaseRequestData.value.unique_id}`,
    //   'attachments',
    //   'get',
    //   null
    // )
    
    // if (attachmentsResponse.status.value === 'success') {
    //   attachments.value = attachmentsResponse.data.value?.data || []
    // }
  } catch (error) {
    console.error('Failed to fetch related data', error)
  }
}

const itemAction = (index: number, status: ItemRequestTrailStatus) => {
  purchaseRequestData.value!.items_request_trail[index].status = status
}


const formatStatus = (status: string | undefined) => {
  if (!status) return '-'
  
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'waiting_approval': 'Waiting For Approval',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'canvassing': 'Canvassing'
  }
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const formatStatusItem = (status: string | undefined) => {
  if (!status) return '-'
  
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'waiting': 'Waiting For Approval',
    'approved': 'Done',
    'rejected': 'Rejected'
  }
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusTagType = (status: string): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case 'draft': return 'info'
    case 'waiting_approval': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'canvassing': return 'primary'
    default: return 'primary'
  }
}

const getItemStatusTagType = (status: string): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case 'draft': return 'info'
    case 'waiting': return 'warning'
    case 'done': return 'success'
    case 'rejected': return 'danger'
    case 'canvassing': return 'primary'
    default: return 'primary'
  }
}

const getPOStatusTagType = (status: string): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case 'draft': return 'info'
    case 'waiting_approval': return 'warning'
    case 'done': return 'success'
    case 'cancelled': return 'danger'
    default: return 'primary'
  }
}

const getHistoryType = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'waiting_approval': return 'warning'
    default: return 'info'
  }
}

// Actions
const updateStatus = async (status: PurchaseRequestStatus) => {
  if (!purchaseRequestData.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('unique_id', purchaseRequestData.value.unique_id)
    formData.append('status', status)
    formData.append('note', `${purchaseRequestData.value.note}`);

    // Append itemsL
    (purchaseRequestData.value.items_request_trail ?? []).forEach((item: ItemRequestTrail, index: number) => {
      formData.append(`item_request_trail[${index}][unique_id]`, item.unique_id)
      formData.append(`item_request_trail[${index}][item_request_id]`, `${item.item_request_id}`)
      formData.append(`item_request_trail[${index}][reference]`, `${item.reference}`)
      formData.append(`item_request_trail[${index}][reference_id]`, `${item.reference_id}`)
      formData.append(`item_request_trail[${index}][reference_version]`, `${item.reference_version ?? 1}`)
      formData.append(`item_request_trail[${index}][quantity]`, `${item.quantity}`)
      formData.append(`item_request_trail[${index}][status]`, `${item.status}`)
    })

    const response = await useFetchApi<BaseResponse<PurchaseRequest>>(
      '/purchase-request-create',
      'update-status',
      'post',
      formData
    )
    
    

    if (response.status.value === 'success') {
      purchaseRequestData.value.status = status
      ElMessage.success('Status berhasil diupdate')
      await fetchPurchaseRequest() // Refresh data
    }
  } catch (error) {
    ElMessage.error('Gagal mengupdate status')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const approvePurchaseRequest = async () => {
  // await updateStatus(PurchaseRequestStatus.APPROVED)

  const validate = (purchaseRequestData.value?.items_request_trail ?? []).find((value) => value.status === ItemRequestTrailStatus.WAITING);

  if(validate){
    ElMessage.error(`${validate.item_request?.catalogue_name} Masih Menunggu Approval!`);
  }else{
    visibleApproveDialog.value = true;
  }

}

const submitForApproval = async () => {
  await updateStatus(PurchaseRequestStatus.WAITING_APPROVAL)
}
const submitForApprove = async () => {
  await updateStatus(PurchaseRequestStatus.APPROVED);
  visibleApproveDialog.value = false;
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    'Purchase request akan dihapus secara permanen. Lanjutkan?',
    'Warning',
    {
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      type: 'warning',
    }
  ).then(async () => {
    await deletePurchaseRequest()
  }).catch(() => {
    // Cancel
  })
}

const deletePurchaseRequest = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/purchase-request-delete/${purchaseRequestData.value?.unique_id}`,
      'delete-purchase-request',
      'delete',
      null
    )

    if (response.status.value === 'success') {
      ElMessage.success('Purchase request berhasil dihapus')
      router.push('/purchase-management/purchase-requests')
    }
  } catch (error) {
    ElMessage.error('Gagal menghapus purchase request')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const downloadAttachment = async (attachment: any) => {
  try {
    // Implement download logic here
    ElMessage.info('Download functionality would be implemented here')
  } catch (error) {
    ElMessage.error('Gagal mengunduh file')
    console.error(error)
  }
}

onMounted(() => {
  fetchPurchaseRequest()
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

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.gap-3 {
  gap: 0.75rem;
}

.my-3 {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.font-bold {
  font-weight: bold;
}

.text-large {
  font-size: 1.125rem;
}

.font-600 {
  font-weight: 600;
}

.mr-3 {
  margin-right: 0.75rem;
}
</style>