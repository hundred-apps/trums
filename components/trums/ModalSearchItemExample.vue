<template>
  <el-dialog v-model="visible" :title="`Cari Item ${currentItemName}`" width="1000">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="searchParams.keyword"
          size="default"
          placeholder="Type to search"
        />
      </el-col>
      <el-button 
        size="default" 
        type="primary" 
        @click="handleSelect"
        :disabled="selectedItems.length === 0"
      >
        Tambahkan {{ selectedItems.length }}
      </el-button>
      <el-button 
        type="default" 
        size="default"
        :icon="Plus"
        @click="$emit('create-new')"
      >
        Buat Baru
      </el-button>
    </el-row>
    
    <el-table 
      :data="data" 
      style="width: 100%" 
      ref="tableRef"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" /> 
      <el-table-column label="Vendor" width="180">
        <template #default="scope">
          <p>{{ scope.row.pricetag?.owner?.name ?? '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Nama Item">
        <template #default="scope">
          <NuxtLink class="text-blue-500" :to="`/catalogue/${scope.row.unique_id}`">
            {{ scope.row.catalogue?.name ?? '' }}
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="Harga" width="120" align="right">
        <template #default="scope">
          <p>{{ currency(scope.row.price) }}</p>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="flex justify-end mt-3">
      <el-pagination 
        background 
        layout="prev, pager, next" 
        :total="totalData" 
        @current-change="handlePagination"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import type { Pricetag_item } from '~/types/pricetag'

interface Props {
  visible: boolean
  data: Pricetag_item[]
  searchParams: any
  totalData: number
  selectedItems: any[]
  currentItemName: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select-items', items: any[]): void
  (e: 'create-new'): void
  (e: 'pagination-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectedItems = ref<Pricetag_item[]>([])
const tableRef = ref()

// Watcher untuk reset selection ketika modal dibuka
watch(visible, (newVal) => {
  if (newVal) {
    // Reset selection ketika modal dibuka
    selectedItems.value = []
    nextTick(() => {
      if (tableRef.value) {
        tableRef.value.clearSelection()
      }
    })
  }
})

const handleSelectionChange = (val: Pricetag_item[]) => {
  selectedItems.value = val;
//   selectedItems.value = val.map((value) => ({
//     catalogue_id: value.catalogue_id,
//     catalogue_name: value.catalogue?.name ?? '',
//     price: value.price,
//     sn: value.catalogue?.sn ?? '',
//     unique_id: '',
//     vendor_id: value.pricetag?.owner?.unique_id ?? '',
//     vendor_name: value.pricetag?.owner?.name ?? '',
//   }))
}

const handleSelect = () => {
  emit('select-items', selectedItems.value)
  visible.value = false
}

const handlePagination = (page: number) => {
  emit('pagination-change', page)
}

// Currency formatter (salin dari komponen utama)
const currency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(value)
}
</script>