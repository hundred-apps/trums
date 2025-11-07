<template>
  <el-dialog v-model="visible" title="Cari Permintaan" width="1000">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="searchParams.keyword"
          size="default"
          placeholder="Type to search"
        />
      </el-col>
    </el-row>
    
    <el-table :data="data" style="width: 100%">
      <el-table-column label="Nomor Referensi" width="300">
        <template #default="scope">
          <NuxtLink class="text-blue-500" :to="`/inventory-management/inqueiries/${scope.row.unique_id}`">
            {{ scope.row.unique_code ?? '-' }}
          </NuxtLink>
        </template>
      </el-table-column>
      <el-table-column label="Customer">
        <template #default="scope">
          <p>{{ scope.row.request_by?.name ?? '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Jumlah Item">
        <template #default="scope">
          <p>{{ scope.row.item_request?.length ?? '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Aksi">
        <template #default="scope">
          <el-button size="default" type="primary" @click="handleSelect(scope.row)">
            Tambahkan
          </el-button>
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
import type { Inquiry } from '~/types/inquiry'

interface Props {
  visible: boolean
  data: Inquiry[]
  searchParams: any
  totalData: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select-request', item: Inquiry): void
  (e: 'pagination-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const handleSelect = (item: Inquiry) => {
  emit('select-request', item)
  visible.value = false
}

const handlePagination = (page: number) => {
  emit('pagination-change', page)
}
</script>