<template>
  <el-dialog v-model="visible" title="Cari Vendor" width="1000">
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
        Tambahkan ({{ selectedItems.length }})
      </el-button>
    </el-row>
    
    <el-table 
      :data="data" 
      style="width: 100%" 
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="Vendor">
        <template #default="scope">
          <p>{{ scope.row.name ?? '-' }}</p>
        </template>
      </el-table-column>
      <el-table-column label="Telepon" width="180">
        <template #default="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column label="Email">
        <template #default="scope">
          <p>{{ scope.row.email }}</p>
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
import type { Contact } from '~/types/contact'

interface Props {
  visible: boolean
  data: Contact[]
  searchParams: any
  totalData: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select-contacts', items: Contact[]): void
  (e: 'pagination-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectedItems = ref<Contact[]>([])

const handleSelectionChange = (val: Contact[]) => {
  selectedItems.value = val
}

const handleSelect = () => {
  emit('select-contacts', selectedItems.value)
  visible.value = false
}

const handlePagination = (page: number) => {
  emit('pagination-change', page)
}
</script>