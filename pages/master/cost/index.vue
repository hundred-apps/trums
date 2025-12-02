<template>
  <TrumsWrapper>
    
    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari kode atau nama pajak..."
          clearable 
        />
      </el-col>
      <NuxtLink 
        class="el-button el-button--primary el-button--default" 
        href="/master/cost/add"
      >
        Tambah Cost Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-adjustments_transaction')"
      >
        Muat Ulang
      </el-button>
      <el-button 
        type="danger" 
        :disabled="!hasSelected"
        @click="batchDelete"
      >
        Hapus yang Dipilih 
      </el-button>
    </el-row>
    
    <!-- Table -->
    <CustomTable
      :columns="filteredColumns"
      :data="data?.data ?? []"
      :loading="loading"
      :column-sort="onSort"
      @selection-change="handleSelectionChange"
    />

    <!-- Pagination -->
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next, size" :total="data?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick"/>
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp } from '@element-plus/icons-vue'
import { type Column, type CheckboxValueType, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy, ElCheckboxGroup, ElTag } from 'element-plus'
import type { Pagination } from '~/types/pagination'
import { NuxtLink } from '#components';
import CustomTable from '~/components/trums/table/customTable.vue'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import type { AdjustmentTransaction } from '~/types/attribute_adjustment';



definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "adjustments_transaction-read",
  name: "Daftar Cost"
})

const tax_type = ref<string>('all');

// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'adjustments_transaction',
  sort: {
    column: 'unique_code',
    order: OrderColumn.ASC,
  }
});

// Data state
const { data } = await useFetchApi<ResponsePagination<AdjustmentTransaction[]>>('/search', 'get-adjustments_transaction', 'post', request_search.value);

const selectedTaxes = ref<AdjustmentTransaction[]>([])
const loading = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'unique_code', 'name', 'type', 'default_value', 'operator', 'allow_party', 'version', 'created_at', 'operations', 'setup'])

// Computed
const hasSelected = computed(() => {
  return data.value?.data?.some(item => item.checked) || false
})

// Columns
const columns: Column<AdjustmentTransaction>[] = [
  {
    key: 'unique_code',
    title: 'Kode Pajak',
    dataKey: 'unique_code',
    width: 120,
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <span class="font-mono font-semibold text-blue-600">{rowData.unique_code}</span>
    )
  },
  {
    key: 'name',
    title: 'Nama Pajak',
    dataKey: 'name',
    width: 200,
  },
  {
    key: 'type',
    title: 'Tipe',
    dataKey: 'type',
    width: 120,
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <ElTag 
        type={rowData.type === 'percent' ? 'success' : 'warning'}
        size="small"
      >
        {rowData.type === 'percent' ? 'Persentase' : 'Fixed'}
      </ElTag>
    )
  },
  {
    key: 'default_value',
    title: 'Nilai Default',
    dataKey: 'default_value',
    width: 130,
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <span class="font-mono">
        {rowData.default_value}
        {rowData.type === 'percent' ? '%' : ''}
      </span>
    )
  },
  {
    key: 'allow_party',
    title: 'Allow Party',
    dataKey: 'allow_party',
    width: 120,
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <ElTag 
        type={rowData.allow_party ? 'success' : 'info'}
        size="small"
      >
        {rowData.allow_party ? 'Ya' : 'Tidak'}
      </ElTag>
    )
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: AdjustmentTransaction }) => (
      <div class="flex gap-2">
        <NuxtLink 
          class="el-button el-button--small el-button--primary" 
          href={`/master/cost/add?id=${rowData.unique_id}`}
        >
          Edit
        </NuxtLink>
        <el-button 
          size="small" 
          type="danger" 
          onClick={() => onDelete([rowData.unique_id])}
        >
          Hapus
        </el-button>
      </div>
    ),
    width: 200,
    align: 'center'
  },
  {
    title: '',
    key: 'setup',
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  }
]

// Add selection column
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
    const onChange = (value: CheckboxValueType) => {
      data.value?.data?.forEach(item => {
        item.checked = value as boolean
      })
    }
    return <SelectionCell 
      value={data.value?.data?.every(item => item.checked) || false} 
      onChange={onChange} 
    />
  },
})

// Setup column configuration
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover trigger="click" width={200}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={columnsSelected.value}>
                  {columns.filter(col => col.key !== 'selection' && col.key !== 'setup').map(col => (
                    <ElCheckbox 
                      key={col.key} 
                      value={col.key!.toString()} 
                      label={col.title} 
                    />
                  ))}
                </ElCheckboxGroup>
              </div>
            </div>
          ),
          reference: () => (
            <ElIcon class="cursor-pointer">
              <SetUp />
            </ElIcon>
          ),
        }}
      </ElPopover>
    </div>
  )
}

// Computed
const filteredColumns = computed(() => {
  return columns.filter(col => columnsSelected.value.includes(col.key!.toString()))
})

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSelectionChange = (selection: AdjustmentTransaction[]) => {
  selectedTaxes.value = selection
}

const paginationClick = (val: number) => {
  request_search.value.offset = val.toString();
}

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      'Apakah Anda yakin ingin menghapus setting pajak yang dipilih?',
      'Konfirmasi Hapus',
      {
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      await useFetchApi<BaseResponse<any>>('/adjustments-transaction-delete', 'delete-tax', 'post', uniques);
      
      ElMessage.success('Daftar Biaya Tamabahan berhasil dihapus')
      refreshNuxtData('get-adjustments_transaction');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Gagal menghapus setting pajak')
    }
  }
}

const batchDelete = async () => {
  const ids = data.value?.data
    ?.filter(item => item.checked)
    .map(item => item.unique_id) || []
  
  if (ids.length > 0) {
    await onDelete(ids)
  }
}

const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order === OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  }
}

const onChangeTaxTypeFilter = (val: string) => {
  if (val === 'all') {
    request_search.value.column = []
  } else {
    request_search.value.column = [
      {
        type: [val]
      }
    ]
  }
}

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData('get-adjustments_transaction')
  },
  { debounce: 500, deep: true }
)

</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

:deep(.font-mono) {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
}

:deep(.font-semibold) {
  font-weight: 600;
}
</style>