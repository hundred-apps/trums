<template>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          style="width: 240px"
          class="my-5"
          placeholder="Cari Permintaan"
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
      </el-col>
    </el-row>
    
    <el-table :data="data?.data ?? []" :preserve-expanded-content="true" style="width: 100%" @selection-change="handleSelectionChangePriceTagItem" border>
        <el-table-column type="selection" width="55" /> 
        <el-table-column label="Nomor Permintaan" >
            <template #default="scope">
                <p>{{scope.row.inquiry?.unique_code ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="Item" >
            <template #default="scope">
                <p>{{scope.row.catalogue_name ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="SN" >
            <template #default="scope">
                <p>{{scope.row.sn ?? '-'}}</p>
            </template>
        </el-table-column>
        <el-table-column label="QTY" width="100" prop="request_qty"/>
        <el-table-column label="unit_name" prop="unit_name"></el-table-column>
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
import type { ItemRequest } from '~/types/item_request';
import type { RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';

const props = defineProps<{
    onSubmitSelected?: (value: ItemRequest[]) => void,
}>();

const request_search = ref<RequestSearch>({
    keyword: '',
    table: 'item_request',
    column: [],
    sort: null,
    offset: '1',
    limit: '10'
});

const {data} = await useFetchApi<ResponsePagination<ItemRequest[]>>('/search', 'get-inquiry-item-request', 'post',request_search);

const handleSelectionChangePriceTagItem = (val: ItemRequest[]) => {
    
  (data.value?.data ?? []).forEach((value) => {
    if(val.find((data) => data.unique_id == value.unique_id)?.unique_id == value.unique_id){
        value.checked = true;
    }else{
        value.checked = false;
    }
  })
}

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
  
}

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
}

watchDebounced(
  request_search.value,
  () => {
    refreshNuxtData('get-inquiry-item-request')
  },
  { debounce: 500 }
)

</script>