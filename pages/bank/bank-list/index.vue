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

definePageMeta({
  middleware: ["auth", "app"],
})

// Data state
const {data} = await useFetchApi<DefaultResponsePagination<Bank[]>>('/banks-read', 'get-banks', 'get', null);
const loading = ref(false)
const drawerVisible = ref(false)
const currentBank = ref<Bank | null>(null)
const isEditing = ref(false)

const search = ref('')

const selectedBank = ref<Bank[]>([])

// Filter data based on search
const filterTableData = computed(() =>
  data.value?.data.query.filter(
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
        <DeleteButton  onConfirm={() => handleDelete(row.unique_id)} onCancel={() => {}} />
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
    const _data = unref(data.value?.data.query)
    const onChange = (value: CheckboxValueType) =>
      (data.value!.data.query = _data!.map((row: any) => {
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
const handleDelete = async (id: string) => {
  try {
    // await axios.delete(`/banks/${id}`)
    await useFetchApi<any>(`/banks-delete/${id}`, 'delete-bank', 'delete', null);
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

const checkSelect = () => data?.value?.data.query.some((row) => row.checked);
const countSelect = () => {
  return data!.value!.data.query.reduce((count, row) => {
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
    
    // const ids = selectedBank.value.map((invoice) => invoice.unique_id)
    // await axios.post('/invoices/batch-delete', { ids })
    ElMessage.success(`${selectedBank.value.length} invoice berhasil dihapus`)
    // selectedInvoices.value = []
    refreshNuxtData('get-banks')
  } catch (error) {
    // User canceled or error occurred
  }
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
        @click="() => {}"
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
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data?.data.total_data"
        :page-size="10"
        :current-page="data?.data.currentPage"
        @current-change="(page) => {}"
      />
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