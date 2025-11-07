<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3">
          Sales Order - {{ purchaseOrderData?.unique_code }}
        </span>
      </template>
    </el-page-header>
    <SalesOrderDetail v-if="!loading" :purchase-order="purchaseOrderData!" />
  </TrumsWrapper>
</template>

<script lang="ts" setup>

import { type PurchaseOrder } from '~/types/scm/purchase_order'
import type { BaseResponse } from '~/types/response'
import SalesOrderDetail from './components/SalesOrderDetail.vue';

definePageMeta({
  middleware: ["auth", "app"],
  name: "Sales Order Detail",
});


const router = useRouter()
const route = useRoute()
const purchaseOrderId = ref<string>(route.params.id as string)



const loading = ref(false)
const purchaseOrderData = ref<PurchaseOrder | null>(null)


const goBack = () => router.back();

// Fetch purchase order data
const fetchPurchaseOrder = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<BaseResponse<PurchaseOrder>>(
      `/purchase-order-read/${purchaseOrderId.value}`, 
      'detail-purchase-order', 
      'get', 
      null
    )

    if (response.status.value === 'success') {
      purchaseOrderData.value = response.data.value!.data
    //   await fetchPurchaseOrderItems()
    //   await fetchRelatedDocuments()
    }
  } catch (error) {
    ElMessage.error('Gagal mengambil data purchase order')
    goBack()
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  fetchPurchaseOrder()
})
</script>
