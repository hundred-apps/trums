<script lang="tsx" setup>
import { ref, computed } from 'vue'
import { Eleme } from '@element-plus/icons-vue'
import { ElDrawer, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import type { Column, CheckboxValueType } from 'element-plus'
import type { BankAccount } from '~/types/bank_account'
import BankAccountForm from '~/components/BankAccountForm.vue'
import CustomTable from '~/components/trums/table/customTable.vue'
import SelectionCell from '~/components/trums/table/SelectionCell.vue'
import DeleteButton from '~/components/trums/DeleteButton.vue'
import type { DefaultResponsePagination } from '~/types/pagination'

definePageMeta({
  middleware: ["auth", "app"],
})

// Data state
const { data } = await useFetchApi<DefaultResponsePagination<BankAccount[]>>('/bank-accounts-read', 'get-bank-accounts', 'get', null)
const loading = ref(false)
const drawerVisible = ref(false)
const currentAccount = ref<BankAccount | null>(null)
const isEditing = ref(false)
const search = ref('')
const selectedAccounts = ref<BankAccount[]>([])

// Filter data
const filteredData = computed(() => {
  if (!data.value?.data.query) return []
  return data.value.data.query.filter(account => 
    !search.value ||
    account.bank_name.toLowerCase().includes(search.value.toLowerCase()) ||
    account.account_name.toLowerCase().includes(search.value.toLowerCase()) ||
    account.account_number.includes(search.value)
  );
})

// Columns definition
const columns: Column<BankAccount>[] = [
  {
    key: 'bank_name',
    title: 'Nama Bank',
    width: 200,
    cellRenderer: ({ rowData }) => <span>{rowData.bank_name}</span>
  },
  {
    key: 'account_name',
    title: 'Nama Akun',
    width: 200,
    cellRenderer: ({ rowData }) => <span>{rowData.account_name}</span>
  },
  {
    key: 'account_number',
    title: 'Nomor Rekening',
    width: 180,
    cellRenderer: ({ rowData }) => <span>{rowData.account_number}</span>
  },
  {
    key: 'created_at',
    title: 'Dibuat Pada',
    width: 180,
    cellRenderer: ({ rowData }) => <span>{formatLocalDate(rowData.created_at)}</span>
  },
  {
    key: 'actions',
    title: 'Aksi',
    width: 150,
    cellRenderer: ({ rowData }) => (
      <>
        <ElButton size="small" onClick={() => openEditDrawer(rowData)}>
          Edit
        </ElButton>
        <DeleteButton size="small" onConfirm={() => handleDelete(rowData.id)} onCancel={() => {}} />
      </>
    )
  }
]

const checkSelect = () => data?.value?.data.query.some((row) => row.checked);
const countSelect = () => {
  return data!.value!.data.query.reduce((count, row) => {
    return row.checked ? count + 1 : count
  }, 0)
}

// Add selection column
columns.unshift({
  key: 'selection',
  width: 50,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => rowData.checked = value
    return <SelectionCell value={rowData.checked} onChange={onChange} />
  },
  headerCellRenderer: () => {
    const onChange = (value: CheckboxValueType) => {
      data.value!.data.query = data.value!.data.query.map(row => ({
        ...row,
        checked: value as boolean
      }))
    }
    const allSelected = (data.value?.data.query ?? []).every(row => row.checked)
    const someSelected = (data.value?.data.query ?? []).some(row => row.checked)
    
    return (
      <SelectionCell 
        value={allSelected} 
        interminate={someSelected && !allSelected}
        onChange={onChange}
      />
    )
  }
})

// Handlers
const openEditDrawer = (account: BankAccount) => {
  currentAccount.value = { ...account }
  isEditing.value = true
  drawerVisible.value = true
}

const openCreateDrawer = () => {
  currentAccount.value = null
  isEditing.value = false
  drawerVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await useFetchApi(`/bank-accounts/${id}`, 'delete-bank-account', 'delete', null)
    ElMessage.success('Akun bank berhasil dihapus')
    refreshNuxtData('get-bank-accounts')
  } catch {
    ElMessage.error('Gagal menghapus akun bank')
  }
}

const batchDelete = async () => {
  try {
    const count = selectedAccounts.value.length
    await ElMessageBox.confirm(
      `Hapus ${count} akun bank terpilih?`,
      'Konfirmasi Hapus',
      { type: 'warning' }
    )
    
    const ids = selectedAccounts.value.map(acc => acc.id)
    await useFetchApi('/bank-accounts/batch-delete', 'batch-delete-bank-accounts', 'post', { ids })
    
    ElMessage.success(`${count} akun bank berhasil dihapus`)
    refreshNuxtData('get-bank-accounts')
    selectedAccounts.value = []
  } catch {
    // Cancelled
  }
}

const handleSelectionChange = (selection: BankAccount[]) => {
  selectedAccounts.value = selection
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('id-ID')
}

const handleRefresh = () => {
  refreshNuxtData('get-bank-accounts')
  selectedAccounts.value = []
}
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
        <el-col :span="6">
          <el-input
            v-model="search"
            placeholder="Cari bank/akun..."
            size="default"
            clearable
          />
        </el-col>
        
        <el-button type="primary" @click="openCreateDrawer">
          Tambah Akun Bank
        </el-button>
        
        <el-button
          :loading="loading"
          :icon="Eleme"
          @click="handleRefresh"
        >
          Muat Ulang
        </el-button>
        
        <el-button
          type="danger"
          :disabled="!checkSelect()"
          @click="batchDelete"
        >
          Hapus Dipilih ({{ countSelect() }})
        </el-button>
    </el-row>

    <CustomTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      @selection-change="handleSelectionChange"
    />

    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data?.data.total_data || 0"
        :page-size="10"
        :current-page="data?.data.currentPage || 1"
        @current-change="(page) => {}"
      />
    </div>

    <ElDrawer
      v-model="drawerVisible"
      :title="isEditing ? 'Edit Akun Bank' : 'Tambah Akun Bank'"
      direction="rtl"
      size="50%"
      destroy-on-close
    >
      <BankAccountForm
        :account="currentAccount"
        :is-editing="isEditing"
        @submitted="() => {
          drawerVisible = false
          handleRefresh()
        }"
        @cancel="drawerVisible = false"
      />
    </ElDrawer>
  </TrumsWrapper>
</template>