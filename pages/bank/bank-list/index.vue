<script lang="tsx" setup>
import { ref, onMounted } from 'vue'
import { Eleme } from '@element-plus/icons-vue'
import { ElDrawer, ElButton, ElTable, ElTableColumn, ElTag, ElMessage, type Column, type CheckboxValueType } from 'element-plus'
import type { Bank } from '~/types/bank_account'
import BankForm from '~/components/BankForm.vue'
import type { DefaultResponse, DefaultResponsePagination, Pagination } from '~/types/pagination'
import CustomTable from '~/components/trums/table/customTable.vue'
import SelectionCell from '~/components/trums/table/SelectionCell.vue'
import DeleteButton from '~/components/trums/DeleteButton.vue'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { ResponsePagination } from '~/types/response_pagination'

definePageMeta({
  middleware: ["auth", "app"],
})

const request_search = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'banks',
  sort: {
    column: 'bank_name',
    order: OrderColumn.ASC,
  }
});

// Data state
const {data} = await useFetchApi<ResponsePagination<Bank[]>>('/search', 'get-banks', 'post', request_search.value);
const loading = ref(false)
const drawerVisible = ref(false)
const currentBank = ref<Bank | null>(null)
const isEditing = ref(false)

const search = ref('')

const selectedBank = ref<Bank[]>([])

// Filter data based on search
const filterTableData = computed(() =>
  (data.value?.data ?? []).filter(
    (data) =>
      !search.value ||
      data.bank_name.toLowerCase().includes(search.value.toLowerCase()) ||
      formatLocalDate(data.created_at).toLowerCase().includes(search.value.toLowerCase())
  )
)

const handleSelectionChange = (selection: Bank[]) => {
  console.log(selection);
  selectedBank.value = selection
}


// Columns definition
const columns: Column<Bank>[] = [
  {

    key: 'bank_name',
    dataKey: 'bank_name',
    title: 'Nama Bank',
    width: 250,
  },
  {
    key: 'created_at',
    dataKey: 'created_at',
    title: 'Dibuat Pada',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Bank }) => <>{formatLocalDate(row.created_at)}</>,
  },
  {
    key: 'created_by',
    dataKey: 'created_by',
    title: 'Dibuat Oleh',
    width: 180,
    cellRenderer: ({ rowData: row }: { rowData: Bank }) => (
      <>
        {row.people?.name ?? '-'}
      </>
    ),
  },
  {
    dataKey: 'actions',
    title: 'Aksi',
    width: 150,
    cellRenderer: ({rowData: row}) => (
      <>
        <ElButton size="small" onClick={() => openEditDrawer(row)}>
          Edit
        </ElButton>
        <DeleteButton size="small" onConfirm={() => handleDelete([row.unique_id])} onCancel={() => {}} />
      </>
    ),
  }
]

columns.unshift({
  key: 'selection',
  width: 50,
  maxWidth: 50,
  align: 'center',
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value)
    return <SelectionCell value={rowData.checked} onChange={onChange} />
  },
  headerCellRenderer: () => {
    const _data = unref(data.value?.data)
    const onChange = (value: CheckboxValueType) =>
      (data.value!.data = _data!.map((row: any) => {
        row.checked = value
        return row
      }))
    const allSelected = _data!.every((row: any) => row.checked)
    const containsChecked = _data!.some((row: any) => row.checked)

    return (
      <SelectionCell
        value={allSelected}
        interminate={containsChecked && !allSelected}
        onChange={onChange}
      />
    )
  },
})

// Handle delete
const handleDelete = async (id: string[]) => {
  try {
    // await axios.delete(`/banks/${id}`)
    await useFetchApi<any>(`/banks-delete`, 'delete-bank', 'post', id);
    ElMessage.success('Bank berhasil dihapus')
    refreshNuxtData('get-banks');
  } catch (error) {
    ElMessage.error('Gagal menghapus bank')
  }
}

// Open drawer for editing
const openEditDrawer = (bank: Bank) => {
  currentBank.value = bank

  console.log(currentBank.value);

  isEditing.value = true
  drawerVisible.value = true
}

// Open drawer for creating
const openCreateDrawer = () => {
  currentBank.value = null
  isEditing.value = false
  drawerVisible.value = true
}

const checkSelect = () => data?.value?.data.some((row) => row.checked);
const countSelect = () => {
  return data!.value!.data.reduce((count, row) => {
    return row.checked ? count + 1 : count
  }, 0)
}

// Handle drawer submit
const handleDrawerSubmit = () => {
  drawerVisible.value = false
  refreshNuxtData('get-banks');
}

// Format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('id-ID')
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `Apakah Anda yakin ingin menghapus ${countSelect()} Bank?`,
      'Konfirmasi Hapus',
      { type: 'warning' }
    )
    
    const ids: string[] = (data?.value?.data ?? []).filter((value) => value.checked).map((row) => row.unique_id) ?? [];

    if(ids.length > 0){
      handleDelete(ids);
    }
  } catch (error) {
    // User canceled or error occurred
  }
}

const paginationClick = (val: number) => {
  
  request_search.value.offset = val.toString();
}

onMounted(() => {
  // fetchBanks()
})
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input v-model="search" size="default" placeholder="Cari bank..." />
      </el-col>
      <el-button size="default" type="primary" @click="openCreateDrawer">
        Tambah Bank/E-Wallet Baru
      </el-button>
      <el-button
        size="default"
        @click="() => refreshNuxtData('get-banks')"
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
          Hapus yang Dipilih ({{ countSelect() }})
      </el-button>
    </el-row>

    <CustomTable 
      :columns="columns" 
      :data="filterTableData ?? []" 
      :loading="loading"
      @selection-change="handleSelectionChange"
    />
    
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next, size" :total="data?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick"/>
    </div>

    <ElDrawer
      v-model="drawerVisible"
      :title="isEditing ? 'Edit Bank/E-Wallet' : 'Tambah Bank/E-Wallet Baru'"
      direction="rtl"
      size="50%"
    >
      <BankForm 
        :bank="currentBank"
        :isEditing="isEditing"
        @submitted="handleDrawerSubmit"
        @cancel="drawerVisible = false"
      />
      
    </ElDrawer>
  </TrumsWrapper>
</template>