<template>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          style="width: 240px"
          class="my-5"
          placeholder="Cari PO"
          :suffix-icon="Search"
        />
        <el-button 
          size="default" 
          type="primary" 
          @click="() => onSubmitSelected!((data?.data ?? []).filter((value) => value.checked))"
          :disabled="(data?.data ?? []).filter((value) => value.checked).length === 0"
        >
          Tambahkan ({{ (data?.data ?? []).filter((value) => value.checked).length }})
        </el-button>
        <el-button size="default" type="default" @click="() => refreshNuxtData('get-purchase-order-item')">
          Reload
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="data?.data ?? []" :preserve-expanded-content="true" style="width: 100%" @selection-change="handleSelectionChangePriceTagItem">
        <el-table-column type="selection" width="55" /> 
        <el-table-column label="Nomor PO" >
            <template #default="scope">
                <p>{{scope.row.purchase_order?.unique_code ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="Item" >
            <template #default="scope">
                <p>{{scope.row.catalogue_name ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="Vendor" >
            <template #default="scope">
                <p>{{scope.row.purchase_order?.vendor_name ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="Quantity" width="100" prop="quantity"/>
        <el-table-column label="unit_name"></el-table-column>
    </el-table>
    <div class="flex justify-end mt-3">
    <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data"
        :current-page="data?.currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        />
    </div>
</template>

<script lang="tsx" setup>
import { Search } from '@element-plus/icons-vue';
import type { RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import type { PurchaseOrderItem } from '~/types/scm/purchase_order';


const props = defineProps<{
    onSubmitSelected?: (value: PurchaseOrderItem[]) => void,
    request_search: RequestSearch,
}>();



const {data} = await useFetchApi<ResponsePagination<PurchaseOrderItem[]>>('/search', 'get-purchase-order-item', 'post', props.request_search);

const handleSelectionChangePriceTagItem = (val: PurchaseOrderItem[]) => {
    
  (data.value?.data ?? []).forEach((value) => {
    if(val.find((data) => data.unique_id == value.unique_id)?.unique_id == value.unique_id){
        value.checked = true;
    }else{
        value.checked = false;
    }
  })
}

const handlePageChange = (page: number) => {
  props.request_search.offset = `${page}`
  
}

// Handle page size change
const handleSizeChange = (size: number) => {
  props.request_search.limit = `${size}`
}

watchDebounced(
  props.request_search,
  () => {
    refreshNuxtData('get-purchase-order-item')
  },
  { debounce: 500 }
)

</script>