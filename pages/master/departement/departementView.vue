<script lang="tsx" setup>
import { ref, onMounted, computed } from 'vue'
import { Eleme, Plus, Delete } from '@element-plus/icons-vue'
import { 
  ElDrawer, 
  ElButton, 
  ElTable, 
  ElTableColumn, 
  ElTag, 
  ElMessage, 
  ElMessageBox,
  type Column, 
  type CheckboxValueType, 
  type TabsPaneContext
} from 'element-plus'
import type { Departement } from '~/types/departement'
import DepartementForm from '~/components/trums/DepartementForm.vue'
import PositionForm from '~/components/trums/PositionForm.vue'
import type { DefaultResponse, DefaultResponsePagination, Pagination } from '~/types/pagination'
import CustomTable from '~/components/trums/table/customTable.vue'
import SelectionCell from '~/components/trums/table/SelectionCell.vue'
import DeleteButton from '~/components/trums/DeleteButton.vue'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'
import type { Position } from '~/types/position'

definePageMeta({
  middleware: ["auth", "app"],
})


// Search request for departement
const request_search_departement = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'departements',
  sort: {
    column: 'name',
    order: OrderColumn.ASC,
  }
});



// Data state
const { data: departementData } = await useFetchApi<ResponsePagination<Departement[]>>(
  '/search', 
  'get-departements', 
  'post', 
  request_search_departement.value
);


const loading = ref(false)
const drawerVisible = ref(false)
const currentDepartement = ref<Departement | null>(null)
const currentPosition = ref<Position | null>(null)
const isEditing = ref(false)

const search = ref('')

const selectedDepartements = ref<Departement[]>([])
const selectedPositions = ref<Position[]>([])

// Filter data based on search
const filteredDepartements = computed(() => {
  const data = departementData.value?.data ?? []
  if (!search.value) return data
  
  return data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase()) ||
      item.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
      formatLocalDate(item.created_at).toLowerCase().includes(search.value.toLowerCase())
  )
})

const handleSelectionChange = (selection: any[]) => {
  selectedDepartements.value = selection;
}

// Columns for Departement
const departementColumns: Column<Departement>[] = [
  
  {
    key: 'name',
    dataKey: 'name',
    title: 'Nama Departemen',
    width: 250,
  },
  {
    key: 'created_at',
    dataKey: 'created_at',
    title: 'Dibuat Pada',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Departement }) => (
      <>{formatLocalDate(row.created_at)}</>
    ),
  },
  {
    key: 'created_by',
    dataKey: 'created_by',
    title: 'Dibuat Oleh',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Departement }) => (
      <span class="text-gray-600">
        {row.people?.name || '-'}
      </span>
    ),
  },
  {
    key: 'actions',
    dataKey: 'actions',
    title: 'Aksi',
    width: 150,
    cellRenderer: ({rowData: row}) => (
      <div class="flex gap-1">
        <ElButton size="small" type="primary" onClick={() => openEditDepartement(row)}>
          Edit
        </ElButton>
        <DeleteButton size="small" onCancel={() => {}} onConfirm={() => handleDeleteDepartement([row.unique_id])} />
      </div>
    ),
  }
]

// Add selection column to both tables
const addSelectionColumn = (columns: Column<any>[], data: any) => {
  const columnsWithSelection = [...columns]
  columnsWithSelection.unshift({
    key: 'selection',
    width: 50,
    maxWidth: 50,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },
    headerCellRenderer: () => {
      const _data = unref(data)
      const onChange = (value: CheckboxValueType) => {
        if (data.value) {
          data.value.data = _data.map((row: any) => {
            row.checked = value
            return row
          })
        }
      }
      const allSelected = _data.every((row: any) => row.checked)
      const containsChecked = _data.some((row: any) => row.checked)

      return (
        <SelectionCell
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })
  return columnsWithSelection
}

const departementColumnsWithSelection = computed(() => 
  addSelectionColumn(departementColumns, departementData.value?.data ?? [])
)


// Handle delete departement
const handleDeleteDepartement = async (ids: string[]) => {
  try {
    await useFetchApi<any>(`/departements-delete`, 'delete-departement', 'post', ids);
    ElMessage.success('Departemen berhasil dihapus')
    refreshNuxtData('get-departements');
  } catch (error) {
    ElMessage.error('Gagal menghapus departemen')
  }
}


// Open drawer for editing departement
const openEditDepartement = (departement: Departement) => {
  currentDepartement.value = departement
  currentPosition.value = null
  isEditing.value = true
  drawerVisible.value = true
}


// Open drawer for creating
const openCreateDrawer = () => {
  currentDepartement.value = null
    currentPosition.value = null
  
  isEditing.value = false
  drawerVisible.value = true
}

const checkSelect = () => {
  return (departementData.value?.data ?? []).some((row: any) => row.checked);
}

const countSelect = () => {
   return (departementData.value?.data ?? []).reduce((count, row: any) => {
      return row.checked ? count + 1 : count
    }, 0)
}

// Handle drawer submit
const handleDrawerSubmit = () => {
  drawerVisible.value = false
  refreshNuxtData('get-departements');
}

// Format date helper
const formatLocalDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const batchDelete = async () => {
  try {
    
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${countSelect()} ${'Departemen'}?`,
      'Konfirmasi Hapus',
      { type: 'warning' }
    )
    
    const ids: string[] = (departementData.value?.data ?? [])
        .filter((value: any) => value.checked)
        .map((row: any) => row.unique_id) ?? [];
      if(ids.length > 0){
        handleDeleteDepartement(ids);
      }
  } catch (error) {
    // User canceled or error occurred
  }
}

const paginationClick = (val: number) => {
  request_search_departement.value.offset = val.toString();
  refreshNuxtData('get-departements');
  
}


const refreshData = () => {
  refreshNuxtData('get-departements');
}

onMounted(() => {
  // Initial data fetch is done via useFetchApi
})
</script>

<template>
  <div>
    
    <el-row :gutter="20" class="my-6">
      <el-col :span="6">
        <el-input 
          v-model="search" 
          size="default" 
          :placeholder="'Cari departemen...'"
          clearable
        />
      </el-col>
      <el-button size="default" type="primary" @click="openCreateDrawer">
        <el-icon class="mr-1"><Plus /></el-icon>
        Tambah Departemen Baru
      </el-button>
      <el-button
        size="default"
        @click="refreshData"
        :loading-icon="Eleme"
        :loading="loading"
      >
        Muat Ulang Data
      </el-button>
      <el-button 
        type="danger" 
        :disabled="!checkSelect()"
        @click="batchDelete"
      >
        <el-icon class="mr-1"><Delete /></el-icon>
        Hapus yang Dipilih ({{ countSelect() }})
      </el-button>
    </el-row>

    <CustomTable 
            :columns="departementColumns" 
            :data="departementData?.data ?? []" 
            :loading="loading"
            @selection-change="handleSelectionChange"
            class="mt-4"
        />
        
    <!-- Pagination -->
    <div class="flex justify-end mt-6">
    <el-pagination 
        background 
        layout="prev, pager, next, sizes" 
        :total="departementData?.total_data" 
        :page-size="parseInt(request_search_departement.limit || '0')"
        @current-change="paginationClick"
        @size-change="(val) => {
          request_search_departement.limit = val.toString();
        refreshData()
        }"
    />
    </div>
    

    <!-- Drawer for forms -->
    <ElDrawer
      v-model="drawerVisible"
      :title="isEditing 
        ? 'Edit Departemen'
        : 'Tambah Departemen'"
      direction="rtl"
      size="50%"
      destroy-on-close
    >
      <DepartementForm 
        
        :departement="currentDepartement"
        :isEditing="isEditing"
        @submitted="handleDrawerSubmit"
        @cancel="drawerVisible = false"
      />
      
    </ElDrawer>
  </div>
</template>

<style scoped>
:deep(.el-tabs__item) {
  font-weight: 500;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs--border-card) {
  border: 1px solid var(--el-border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>