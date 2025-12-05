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

// Active tab
const activeTab = ref('departement')

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

// Search request for position
const request_search_position = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'positions',
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

const { data: positionData } = await useFetchApi<ResponsePagination<Position[]>>(
  '/search', 
  'get-positions', 
  'post', 
  request_search_position.value
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

const filteredPositions = computed(() => {
  const data = positionData.value?.data ?? []
  if (!search.value) return data
  
  return data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase()) ||
      item.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
      formatLocalDate(item.created_at).toLowerCase().includes(search.value.toLowerCase())
  )
})

const handleSelectionChange = (selection: any[]) => {
  if (activeTab.value === 'departement') {
    selectedDepartements.value = selection
  } else {
    selectedPositions.value = selection
  }
}

// Columns for Departement
const departementColumns: Column<Departement>[] = [
  {
    key: 'unique_code',
    dataKey: 'unique_code',
    title: 'Kode',
    width: 120,
    cellRenderer: ({ rowData: row }: { rowData: Departement }) => (
      <ElTag type="info" size="small">
        {row.unique_code}
      </ElTag>
    ),
  },
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
        {row.created_by || '-'}
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

// Columns for Position
const positionColumns: Column<Position>[] = [
  {
    key: 'unique_code',
    dataKey: 'unique_code',
    title: 'Kode',
    width: 120,
    cellRenderer: ({ rowData: row }: { rowData: Position }) => (
      <ElTag type="success" size="small">
        {row.unique_code}
      </ElTag>
    ),
  },
  {
    key: 'name',
    dataKey: 'name',
    title: 'Nama Posisi',
    width: 250,
  },
  {
    key: 'created_at',
    dataKey: 'created_at',
    title: 'Dibuat Pada',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Position }) => (
      <>{formatLocalDate(row.created_at)}</>
    ),
  },
  {
    key: 'created_by',
    dataKey: 'created_by',
    title: 'Dibuat Oleh',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Position }) => (
      <span class="text-gray-600">
        {row.created_by || '-'}
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
        <ElButton size="small" type="primary" onClick={() => openEditPosition(row)}>
          Edit
        </ElButton>
        <DeleteButton size="small" onCancel={() => {}} onConfirm={() => handleDeletePosition([row.unique_id])} />
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

const positionColumnsWithSelection = computed(() => 
  addSelectionColumn(positionColumns, positionData.value?.data ?? [])
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

// Handle delete position
const handleDeletePosition = async (ids: string[]) => {
  try {
    await useFetchApi<any>(`/positions-delete`, 'delete-position', 'post', ids);
    ElMessage.success('Posisi berhasil dihapus')
    refreshNuxtData('get-positions');
  } catch (error) {
    ElMessage.error('Gagal menghapus posisi')
  }
}

// Open drawer for editing departement
const openEditDepartement = (departement: Departement) => {
  currentDepartement.value = departement
  currentPosition.value = null
  isEditing.value = true
  drawerVisible.value = true
}

// Open drawer for editing position
const openEditPosition = (position: Position) => {
  currentPosition.value = position
  currentDepartement.value = null
  isEditing.value = true
  drawerVisible.value = true
}

// Open drawer for creating
const openCreateDrawer = () => {
  if (activeTab.value === 'departement') {
    currentDepartement.value = null
    currentPosition.value = null
  } else {
    currentPosition.value = null
    currentDepartement.value = null
  }
  isEditing.value = false
  drawerVisible.value = true
}

const checkSelect = () => {
  if (activeTab.value === 'departement') {
    return (departementData.value?.data ?? []).some((row: any) => row.checked)
  } else {
    return (positionData.value?.data ?? []).some((row: any) => row.checked)
  }
}

const countSelect = () => {
  if (activeTab.value === 'departement') {
    return (departementData.value?.data ?? []).reduce((count, row: any) => {
      return row.checked ? count + 1 : count
    }, 0)
  } else {
    return (positionData.value?.data ?? []).reduce((count, row: any) => {
      return row.checked ? count + 1 : count
    }, 0)
  }
}

// Handle drawer submit
const handleDrawerSubmit = () => {
  drawerVisible.value = false
  if (activeTab.value === 'departement') {
    refreshNuxtData('get-departements');
  } else {
    refreshNuxtData('get-positions');
  }
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
    const itemType = activeTab.value === 'departement' ? 'Departemen' : 'Posisi'
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${countSelect()} ${itemType}?`,
      'Konfirmasi Hapus',
      { type: 'warning' }
    )
    
    if (activeTab.value === 'departement') {
      const ids: string[] = (departementData.value?.data ?? [])
        .filter((value: any) => value.checked)
        .map((row: any) => row.unique_id) ?? [];
      if(ids.length > 0){
        handleDeleteDepartement(ids);
      }
    } else {
      const ids: string[] = (positionData.value?.data ?? [])
        .filter((value: any) => value.checked)
        .map((row: any) => row.unique_id) ?? [];
      if(ids.length > 0){
        handleDeletePosition(ids);
      }
    }
  } catch (error) {
    // User canceled or error occurred
  }
}

const paginationClick = (val: number) => {
  if (activeTab.value === 'departement') {
    request_search_departement.value.offset = val.toString();
    refreshNuxtData('get-departements');
  } else {
    request_search_position.value.offset = val.toString();
    refreshNuxtData('get-positions');
  }
}

const handleTabChange = (tab: TabsPaneContext, event: Event) => {
  activeTab.value = tab.paneName as string;
  search.value = '' // Reset search when changing tabs
}

const refreshData = () => {
  if (activeTab.value === 'departement') {
    refreshNuxtData('get-departements');
  } else {
    refreshNuxtData('get-positions');
  }
}

const getCurrentData = () => {
  return activeTab.value === 'departement' ? departementData : positionData
}

const getCurrentColumns = () => {
  return activeTab.value === 'departement' ? departementColumnsWithSelection : positionColumnsWithSelection
}

const getFilteredData = () => {
  return activeTab.value === 'departement' ? filteredDepartements.value : filteredPositions.value
}

onMounted(() => {
  // Initial data fetch is done via useFetchApi
})
</script>

<template>
  <TrumsWrapper>
    <!-- Header with title and stats -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Departemen & Posisi</h1>
      <p class="text-gray-600 mt-1">Kelola data departemen dan posisi perusahaan</p>
    </div>

    <!-- Tabs Navigation -->
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabChange">
      <el-tab-pane name="departement" label="Departement">
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
            :page-size="parseInt(activeTab === 'departement' ? request_search_departement.limit : request_search_position.limit)"
            @current-change="paginationClick"
            @size-change="(val) => {
            if (activeTab === 'departement') {
                request_search_departement.limit = val.toString()
            } else {
                request_search_position.limit = val.toString()
            }
            refreshData()
            }"
        />
        </div>
      </el-tab-pane>
      
      <el-tab-pane name="position">
        <template #label>
          <span class="flex items-center">
            <el-icon class="mr-2"><Briefcase /></el-icon>
            Posisi
            <el-tag size="small" class="ml-2" type="success">
              {{ positionData?.total_data || 0 }}
            </el-tag>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- Action Bar -->
    <el-row :gutter="20" class="my-6">
      <el-col :span="6">
        <el-input 
          v-model="search" 
          size="default" 
          :placeholder="activeTab === 'departement' ? 'Cari departemen...' : 'Cari posisi...'"
          clearable
        />
      </el-col>
      <el-button size="default" type="primary" @click="openCreateDrawer">
        <el-icon class="mr-1"><Plus /></el-icon>
        {{ activeTab === 'departement' ? 'Tambah Departemen Baru' : 'Tambah Posisi Baru' }}
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

    <!-- Data Table -->
    

    <!-- Drawer for forms -->
    <ElDrawer
      v-model="drawerVisible"
      :title="isEditing 
        ? (activeTab === 'departement' ? 'Edit Departemen' : 'Edit Posisi') 
        : (activeTab === 'departement' ? 'Tambah Departemen Baru' : 'Tambah Posisi Baru')"
      direction="rtl"
      size="50%"
      destroy-on-close
    >
      <DepartementForm 
        v-if="activeTab === 'departement'"
        :departement="currentDepartement"
        :isEditing="isEditing"
        @submitted="handleDrawerSubmit"
        @cancel="drawerVisible = false"
      />
      
      <PositionForm 
        v-else
        :position="currentPosition"
        :isEditing="isEditing"
        @submitted="handleDrawerSubmit"
        @cancel="drawerVisible = false"
      />
    </ElDrawer>
  </TrumsWrapper>
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