<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Canvassing - {{ canvassingData?.unique_code || 'Loading...' }}
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
            :to="`/supply-chain-management/canvassing/add?id=${canvassingData?.unique_id}`" 
            class="el-button el-button--primary"
          >
            <el-icon class="me-2"><Edit /></el-icon> Edit
          </NuxtLink>
          <el-button 
            type="success" 
            v-if="canvassingData?.status === CanvassingStatus.DRAFT"
            @click="submitForApproval"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Submit for Approval
          </el-button>
          <el-button 
            type="success" 
            v-if="canvassingData?.status === CanvassingStatus.PENDING_APPROVAL"
            :disabled="!disableButtonApprove"
            @click="approve"
          >
            <el-icon class="me-2"><CircleCheck /></el-icon> Approve
          </el-button>
        </div>
      </template>

      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions title="" :column="1" size="large" border>
            <el-descriptions-item label="Canvassing Code">
              {{ canvassingData?.unique_code || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Source Document">
              {{ canvassingData?.source_document || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Description">
              {{ canvassingData?.description || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-dropdown v-if="canvassingData">
                <span class="el-dropdown-link">
                  <el-tag :type="getStatusTagType(canvassingData.status)">
                    {{ formatStatus(canvassingData.status) }}
                  </el-tag>
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      v-for="status in availableStatuses" 
                      :key="status"
                      @click="updateStatus(status)"
                      :disabled="!canUpdateStatus(status)"
                    >
                      {{ formatStatus(status) }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
      </div>
    </el-card>

    <el-card class="mb-3">
      <template #header>
        <div class="card-header">
          <span>Canvassing Items</span>
        </div>
      </template>
      <el-table :data="flattenedData" border style="width: 100%">
        
        

        <el-table-column label="Item Name" width="300" fixed="left">
          <template #default="scope">
            <div v-if="scope.row._first">
              {{ scope.row.item.item_request_trail?.item_request?.catalogue_name }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Qty" width="50">
          <template #default="scope">
            <div v-if="scope.row._first">
              {{ scope.row.item.item_request_trail?.quantity }}
            </div>
          </template>
        </el-table-column>

        <!-- Kolom vendor -->
        <el-table-column label="Vendor" width="150">
          <template #default="scope">
            {{ scope.row.vendor?.vendor?.name }}
          </template>
        </el-table-column>

        <el-table-column label="Catalogue" width="300">
          <template #default="scope">
            {{ scope.row.vendor?.catalogue?.name }}
          </template>
        </el-table-column>

        <el-table-column prop="vendor.unit_price" label="Unit Price" width="150">
          <template #default="scope">

            {{ currency(scope.row.vendor.unit_price ?? 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="vendor.total_price" label="Total Price" width="150">
          <template #default="scope">
            {{ currency(scope.row.vendor.total_price ?? 0) }}

          </template>
        </el-table-column>
        <el-table-column label="Discount" width="100">
          <template #default="scope">
            {{ changeDiscount(canvassingData?.canvasing_item_vendor_summery?.find((value) => value.vendor_id == scope.row.vendor?.vendor?.unique_id) ?? null, scope.row.vendor.total_price) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Select" width="80" align="center">
          <template #default="scope">
              <el-radio v-if="canvassingData?.status == CanvassingStatus.PENDING_APPROVAL || canvassingData?.status == CanvassingStatus.DONE"
                v-model="selectedVendors[scope.row.item.unique_id]"
                :value="scope.row.vendor.unique_id"
                :disabled="canvassingData?.status == CanvassingStatus.DONE"
                @change="(value) => console.log(value)"
              >

              </el-radio>
              <el-tag v-else-if="canvassingData?.status == CanvassingStatus.DRAFT" type="warning">Menunggu Di Ajukan</el-tag>
          </template>
        </el-table-column>
        
        
      </el-table>
    </el-card>

    <el-dialog v-model="visibleApproveDialog" title="Approve Canvasing!" width="500">
      <el-form :model="canvassingData!" :label-position="formApproveLabel">
        <el-form-item label="Catatan" prop="note">
          <el-input v-model="canvassingData!.note" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visibleApproveDialog = false">Cancel</el-button>
          <el-button type="primary" @click="submitApprove">
            Approve
          </el-button>
        </div>
      </template>
    </el-dialog>

    
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import { Delete, Edit, CircleCheck, ArrowDown } from '@element-plus/icons-vue'
import { CanvassingStatus, CanvassingVendorStatus } from '~/types/scm/canvasing'
import type { Canvassing, CanvassingItem, CanvassingItemVendorSummery, CanvassingVendor } from '~/types/scm/canvasing'
import type { BaseResponse } from '~/types/response';
import type { ItemRequest, ItemRequestTrail } from '~/types/item_request';
import type { FormProps } from 'element-plus';

definePageMeta({
  middleware: ["auth", "app"],
  name: "Canvassing Detail",
});

const router = useRouter()
const route = useRoute()
const canvassingId = ref<string>(route.params.id as string)

const selectedVendors = ref<Record<string, string>>({})

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
const canvassingData = ref<Canvassing | null>(null)
const itemDialogVisible = ref(false)
const selectedItem = ref<CanvassingItem | null>(null)
const visibleApproveDialog = ref<boolean>(false);
const formApproveLabel = ref<FormProps['labelPosition']>('top')


const availableStatuses = [
  CanvassingStatus.DRAFT,
  CanvassingStatus.PENDING_APPROVAL,
  CanvassingStatus.CANCEL
]

interface VendorGroup {
  vendor_id: string;
  vendor_name: string;
  items: CanvassingVendor[];
}

const changeDiscount = (vendor: CanvassingItemVendorSummery|null, price: number) => {
  if(vendor){
    if(vendor.discount_unit == 'percent'){
      return `${vendor.discount_value}%`;
    }else{
      return `${(vendor.discount_value / price) * 100}%`;
    }
  }else{
    return 0;
  }
}


const goBack = () => router.back()

// Fetch canvassing data
const fetchCanvassing = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<Canvassing>>(
      `/canvassing-read/${route.params.id}`, 
      'detail-canvassing', 
      'get', 
      null
    );

    if(response.status.value == 'success'){
      canvassingData.value = response.data.value!.data;
      initializeSelectedVendors();
      console.log(`selected vendor`, selectedVendors.value);
    }
  } catch (error) {
    ElMessage.error('Failed to fetch canvassing data')
    console.error(error)
    goBack();
  } finally {
    loading.value = false
  }
}

const disableButtonApprove = computed(() => {
  return Object.values(selectedVendors.value).every(v => v !== "")
})
const getSelectedVendorId = (itemId: string) => {
  return selectedVendors.value[itemId] || ''
}


const vendorGrouped = computed<VendorGroup[]>(() => {
  if (!canvassingData.value) return [];
  return groupByVendor(canvassingData.value);
});

const flattenedData = computed(() => {
  if (!canvassingData.value) return [];
  const rows: any[] = []
  canvassingData.value.canvassing_item.forEach(item => {
    if (item.canvassing_vendor && item.canvassing_vendor.length > 0) {
      item.canvassing_vendor.forEach((vendor, index) => {
        rows.push({
          item,
          vendor,
          _first: index === 0 // tanda baris pertama untuk rowspan
        })
      })
    } else {
      // kalau tidak ada vendor, tetap push row dummy
      rows.push({
        item,
        vendor: null,
        _first: true
      })
    }
  })
  console.log(rows);
  return rows
})

const groupByVendor = (data: Canvassing): VendorGroup[] => {
  const vendorMap: Record<string, VendorGroup> = {};

  console.log(data);
  data.canvassing_item.forEach((item: CanvassingItem) => {
    const itemReq: ItemRequestTrail = item.item_request_trail!;

    item.canvassing_vendor.forEach((vendor: CanvassingVendor) => {
      const vendorItem: CanvassingVendor = vendor;

      if (!vendorMap[vendor.vendor_id!]) {
        vendorMap[vendor.vendor_id!] = {
          vendor_id: vendor.vendor_id ?? '',
          vendor_name: vendor.vendor?.name ?? '',
          items: [],
        };
      }

      vendorMap[vendor.vendor_id!].items.push(vendorItem);
    });
  });

  return Object.values(vendorMap);
};



const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatStatus = (status: CanvassingStatus) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatVendorStatus = (status: CanvassingVendorStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function handleSelect(unique_id: string, index: number) {
  // const vendorActive = vendorGrouped.value[index];
  // tableData.value = vendorActive.items.map(item => ({
  //   ...item,
  //   status: item.id === id ? 'selected' : 'rejected'
  // }))
}

const getStatusTagType = (status: CanvassingStatus): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case CanvassingStatus.DRAFT: return 'info'
    case CanvassingStatus.PENDING_APPROVAL: return 'warning'
    case CanvassingStatus.CANCEL: return 'danger'
    default: return 'primary'
  }
}

const getVendorStatusTagType = (status: CanvassingVendorStatus): 'success' | 'info' | 'danger' | 'warning' | 'primary' => {
  switch (status) {
    case CanvassingVendorStatus.SUBMITTED: return 'info'
    case CanvassingVendorStatus.SELECTED: return 'success'
    case CanvassingVendorStatus.REJECTED: return 'danger'
    default: return 'primary'
  }
}

const initializeSelectedVendors = () => {
  if (!canvassingData.value) return


  canvassingData.value.canvassing_item.forEach(item => {
    selectedVendors.value[item.unique_id] = '';
  })
  
  
  
  canvassingData.value.canvassing_item.forEach(item => {
    if (item.canvassing_vendor) {
      const selectedVendor = item.canvassing_vendor.find(
        vendor => vendor.status === CanvassingVendorStatus.SELECTED
      )
      
      if (selectedVendor) {
        selectedVendors.value[item.unique_id] = selectedVendor.unique_id!;
      }
    }
  })
}

const canUpdateStatus = (newStatus: CanvassingStatus): boolean => {
  if (!canvassingData.value) return false
  
  const currentStatus = canvassingData.value.status
  
  // Define allowed status transitions
  const allowedTransitions: any = {
    [CanvassingStatus.DRAFT]: [CanvassingStatus.PENDING_APPROVAL, CanvassingStatus.CANCEL],
    [CanvassingStatus.PENDING_APPROVAL]: [CanvassingStatus.CANCEL],
    [CanvassingStatus.CANCEL]: [CanvassingStatus.DRAFT]
  }
  
  return allowedTransitions[currentStatus]?.includes(newStatus) || false
}

// Actions
const updateStatus = async (status: CanvassingStatus) => {
  if (!canvassingData.value) return
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append("unique_id", canvassingData.value.unique_id || '')
    formData.append("status", status)
    formData.append("note", canvassingData.value.note ?? '')

    canvassingData.value.canvassing_item.forEach((element, i) => {
      formData.append(`canvassing_items[${i}][unique_id]`, `${element.unique_id}`);

      element.canvassing_vendor.forEach((vendor, vI) => {
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][unique_id]`,
          `${vendor.unique_id}`
        );
        formData.append(
          `canvassing_items[${i}][canvassing_vendor][${vI}][status]`,
          `${vendor.status}`
        );
      });

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

const submitForApproval = async () => {
  await updateStatus(CanvassingStatus.PENDING_APPROVAL)
}
const approve = async () => {
  
  visibleApproveDialog.value = true;
}

const submitApprove = async() => {

  canvassingData.value?.canvassing_item.forEach(element => {
    const valueSelected = selectedVendors.value[element.unique_id];
    
    element.canvassing_vendor.forEach(element => {
      if(element.unique_id === valueSelected){
        element.status = CanvassingVendorStatus.SELECTED;
      }
    });
  });

  await updateStatus(CanvassingStatus.DONE);
  visibleApproveDialog.value = false;
}

const viewItemDetails = (item: CanvassingItem) => {
  selectedItem.value = item
  itemDialogVisible.value = true
}

const selectVendor = async (item: CanvassingItem, vendor: CanvassingVendor) => {
  if (!selectedItem.value) return
  
  try {

    console.log(vendor);
    // const formData = new FormData()
    // formData.append("canvassing_vendor_id", vendor.unique_id || '')
    // formData.append("status", CanvassingVendorStatus.SELECTED)
    
    // const response = await useFetchApi<BaseResponse<any>>(
    //   '/canvassing/select-vendor', 
    //   'select-vendor', 
    //   'post', 
    //   formData
    // )
    
    // if(response.status.value == 'success'){
    //   ElMessage.success('Vendor selected')
    //   // Update local data
    //   if (selectedItem.value.canvassing_vendor) {
    //     selectedItem.value.canvassing_vendor = selectedItem.value.canvassing_vendor.map((v: any) => {
    //       if (v.unique_id === vendor.unique_id) {
    //         return { ...v, status: CanvassingVendorStatus.SELECTED }
    //       } else if (v.status === CanvassingVendorStatus.SELECTED) {
    //         return { ...v, status: CanvassingVendorStatus.SUBMITTED }
    //       }
    //       return v
    //     })
    //   }
    // }  
  } catch (error) {
    ElMessage.error('Failed to select vendor')
    console.error(error)
  }
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    'This will permanently delete the canvassing. Continue?',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    await deleteCanvassing()
  }).catch(() => {
    // Cancel
  })
}

const deleteCanvassing = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<any>>(
      `/canvassing/${canvassingId.value}`, 
      'delete-canvassing', 
      'delete', 
      null
    )
    
    if(response.status.value == 'success'){
      ElMessage.success('Canvassing deleted')
      router.push('/purchasing/canvassing')
    }  
  } catch (error) {
    ElMessage.error('Failed to delete canvassing')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCanvassing()
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

.vendor-info {
  line-height: 1.4;
}
</style>