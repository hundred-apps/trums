<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.DRAFT).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Draft Sales Order
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.PENDING_APPROVAL).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Pending Approval
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: PurchaseOrder) => item.status === PurchaseOrderStatus.CANCELLED).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Cancelled
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="data?.total_data ?? 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Sales Order
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3 mt-4">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari sales order..."
          clearable 
        />
      </el-col>
      <el-col :span="18" class="text-right space-x-2">
        <NuxtLink 
          class="el-button el-button--primary el-button--default" 
          href="/sales/order/add"
        >
          Buat Sales Order Baru
        </NuxtLink>
        <el-button
          size="default"
          :loading-icon="Eleme"
          :loading="loading"
          @click="fetchData"
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
      </el-col>
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
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.total_data ?? 0"
        :current-page="Number(request_search.offset)"
        :page-size="Number(request_search.limit)"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp, Filter } from '@element-plus/icons-vue'
import { type Column, type CheckboxValueType, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy, ElCheckboxGroup, ElMessage } from 'element-plus'
import { PurchaseOrderStatus, type PurchaseOrder } from '~/types/scm/purchase_order'
import type { Pagination } from '~/types/pagination'
import { NuxtLink } from '#components';
import CustomTable from '~/components/trums/table/customTable.vue'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import SelectionCell from '~/components/trums/table/SelectionCell.vue';

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "purchase-order-read",
})



// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [
    {
      type: ["so"],
      status: [],
    }
  ],
  limit: "10",
  offset: "1",
  table: 'purchase_order',
  sort: {
    column: 'created_at',
    order: OrderColumn.DESC,
  }
});

// Data state
const {data} = await useFetchApi<ResponsePagination<PurchaseOrder[]>>('/search', 'search-purchase-order', 'post', request_search);
const selectedPurchaseOrders = ref<PurchaseOrder[]>([])
const loading = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'unique_code', 'vendor_name', 'total_price', 'expected_arrival', 'status', 'created_at', 'operations', 'setup'])

// Columns
const columns: Column<PurchaseOrder>[] = [
  {
    key: 'unique_code',
    title: 'Nomor PO',
    dataKey: 'unique_code',
    width: 150,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`/sales/order/${row.unique_id}`} class="text-blue-500">
        {row.unique_code}
      </NuxtLink>
    )
  },
  {
    key: 'vendor_name',
    title: 'Vendor',
    dataKey: 'vendor_name',
    width: 200,
  },
  {
    key: 'total_price',
    title: 'Total Harga',
    dataKey: 'total_price',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{formatCurrency(rowData.total_price)}</span>
    )
  },
  {
    key: 'expected_arrival',
    title: 'Estimasi Tiba',
    dataKey: 'expected_arrival',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{rowData.expected_arrival ? formatDate(rowData.expected_arrival) : '-'}</span>
    )
  },
  {
    key: 'status',
    title: 'Status',
    dataKey: 'status',
    width: 150,
    cellRenderer: ({ rowData: row }) => renderStatusTag(row.status),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover trigger="click" width={200}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckboxGroup v-model={request_search.value.column[0].status}>
                    <ElCheckbox 
                      key={PurchaseOrderStatus.DRAFT} 
                      value={PurchaseOrderStatus.DRAFT} 
                      label="Draft" 
                    />
                    <ElCheckbox 
                      key={PurchaseOrderStatus.PENDING_APPROVAL} 
                      value={PurchaseOrderStatus.PENDING_APPROVAL} 
                      label="Pending Approval" 
                    />
                    <ElCheckbox 
                      key={PurchaseOrderStatus.APPROVED} 
                      value={PurchaseOrderStatus.APPROVED} 
                      label="Approved" 
                    />
                    <ElCheckbox 
                      key={PurchaseOrderStatus.CANCELLED} 
                      value={PurchaseOrderStatus.CANCELLED} 
                      label="Cancelled" 
                    />
                    <ElCheckbox 
                      key={PurchaseOrderStatus.COMPLETED} 
                      value={PurchaseOrderStatus.COMPLETED} 
                      label="Completed" 
                    />
                  </ElCheckboxGroup>
                </div>
              </div>
            ),
            reference: () => (
              <ElIcon class="cursor-pointer">
                <Filter />
              </ElIcon>
            ),
          }}
        </ElPopover>
      </div>
    ),
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: PurchaseOrder }) => (
      <>
         <NuxtLink class="el-button el-button--small" href={`/supply-chain-management/purchase/order/add?id=${rowData.unique_id}`} >Edit</NuxtLink>
        <el-button size="small" type="danger" onClick={() => onDelete([rowData.unique_id!])}>
          Hapus
        </el-button>
      </>
    ),
    width: 150,
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

const hasSelected = computed(() => {
  return data.value?.data?.some(item => item.checked) || false
})

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const renderStatusTag = (status: PurchaseOrderStatus) => {
  if (!status) return <></>
  
  switch (status) {
    case PurchaseOrderStatus.DRAFT:
      return <el-tag type="info">DRAFT</el-tag>
    case PurchaseOrderStatus.PENDING_APPROVAL:
      return <el-tag type="warning">PENDING APPROVAL</el-tag>
    case PurchaseOrderStatus.APPROVED:
      return <el-tag type="success">APPROVED</el-tag>
    case PurchaseOrderStatus.CANCELLED:
      return <el-tag type="danger">CANCELLED</el-tag>
    case PurchaseOrderStatus.COMPLETED:
      return <el-tag type="success">COMPLETED</el-tag>
    default:
      return <el-tag>{status}</el-tag>
  }
}

const handleSelectionChange = (selection: PurchaseOrder[]) => {
  selectedPurchaseOrders.value = selection
}

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
  fetchData()
}

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
  fetchData()
}

const onDelete = async (uniques: string[]) => {
  try {
    // Implement delete functionality here
    ElMessage.success(`Berhasil menghapus ${uniques.length} purchase order`)
    await fetchData()
  } catch (error) {
    ElMessage.error('Gagal menghapus purchase order')
  }
}

const batchDelete = async () => {
  const ids = data.value?.data
    ?.filter(item => item.checked)
    .map(item => item.unique_id!) || []
  
  if (ids.length > 0) {
    await onDelete(ids)
  }
}

const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order === OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  }
  fetchData()
}

// Fetch data
const fetchData = async () => {
  refreshNuxtData('search-purchase-order');
}

// Watch search query
watchDebounced(
  request_search,
  () => {
    fetchData()
  },
  { debounce: 500, deep: true }
)

onMounted(() => {
  
})
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

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}
</style>