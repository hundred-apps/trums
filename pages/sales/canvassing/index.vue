<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data.value?.data ?? []).filter((item: Canvassing) => item.status === CanvassingStatus.DRAFT).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Draft Canvassing
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data.value?.data ?? []).filter((item: Canvassing) => item.status === CanvassingStatus.PENDING_APPROVAL).length">
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
          <el-statistic :value="(data?.data.value?.data ?? []).filter((item: Canvassing) => item.status === CanvassingStatus.CANCEL).length">
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
          <el-statistic :value="data?.data.value?.total_data ?? 0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Canvassing
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari canvassing..."
          clearable 
        />
      </el-col>
      <NuxtLink 
        class="el-button el-button--primary el-button--default" 
        href="/sales/canvassing/add"
      >
        Buat Canvassing Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-canvasing')"
      >
        Muat Ulang
      </el-button>
      <el-button 
        type="danger" 
        :disabled="!hasSelected"
        @click="bulkDelete"
      >
        Hapus yang Dipilih 
      </el-button>
    </el-row>
    
    <!-- Table -->
    <CustomTable
      :columns="filteredColumns"
      :data="data?.data.value?.data ?? []"
      :loading="loading"
      :column-sort="onSort"
      @selection-change="handleSelectionChange"
    />

    <!-- Pagination -->
    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="data?.data.value?.total_data ?? 0"
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
import { type Column, type CheckboxValueType, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy, ElCheckboxGroup } from 'element-plus'
import { CanvassingStatus, type Canvassing } from '~/types/scm/canvasing'
import type { Pagination } from '~/types/pagination'
import { NuxtLink } from '#components';
import CustomTable from '~/components/trums/table/customTable.vue'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import { TypeInquiry } from '~/types/inquiry';

definePageMeta({
  middleware: ["auth", "app", "check-access"],
  requiredPermission: "canvassing-read",
})



// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [
    {
      inquiries: {
        type: [TypeInquiry.SALES_INQUIRY],
      },
      status: [CanvassingStatus.DRAFT, CanvassingStatus.CANVASSING, CanvassingStatus.PENDING_APPROVAL_RAB, CanvassingStatus.DONE]
    }
  ],
  limit: "10",
  offset: "1",
  table: 'canvassing',
  sort: {
    column: 'created_at',
    order: OrderColumn.DESC,
  }
});

// Data state
const data = await useFetchApi<ResponsePagination<Canvassing[]>>('/search', 'get-canvasing', 'post', request_search);
const selectedCanvassing = ref<Canvassing[]>([])
const loading = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'unique_code', 'source_document', 'description', 'status', 'created_at', 'operations', 'setup'])

// Columns
const columns: Column<Canvassing>[] = [
  {
    key: 'unique_code',
    title: 'Nomor Canvassing',
    dataKey: 'unique_code',
    width: 300,
    cellRenderer: ({ rowData: row }) => (
      <NuxtLink href={`/sales/canvassing/${row.unique_id}`} class="text-blue-500">
        {row.unique_code}
      </NuxtLink>
    )
  },
  {
    key: 'source_document',
    title: 'Dokumen Sumber',
    dataKey: 'source_document',
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{rowData.source_document || '-'}</span>
    )
  },
  {
    key: 'description',
    title: 'Deskripsi',
    dataKey: 'description',
    width: 250
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
                      key={CanvassingStatus.DRAFT} 
                      value={CanvassingStatus.DRAFT} 
                      label="Draft" 
                    />
                    <ElCheckbox 
                      key={CanvassingStatus.PENDING_APPROVAL} 
                      value={CanvassingStatus.PENDING_APPROVAL} 
                      label="Pending Approval" 
                    />
                    <ElCheckbox 
                      key={CanvassingStatus.CANCEL} 
                      value={CanvassingStatus.CANCEL} 
                      label="Cancel" 
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
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: Canvassing }) => (
      <>
        <NuxtLink class="el-button el-button--small" href={`/supply-chain-management/canvassing/add?id=${rowData.unique_id}`} >Edit</NuxtLink>
        <el-button size="small" type="danger" onClick={() => handleSubmitDelete([rowData.unique_id!])}>
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
      data.data.value?.data?.forEach(item => {
        item.checked = value as boolean
      })
    }
    return <SelectionCell 
      value={data.data.value?.data?.every(item => item.checked) || false} 
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
  return data.data.value?.data?.some(item => item.checked) || false
})

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID')
}

const renderStatusTag = (status: CanvassingStatus) => {
  if (!status) return <></>
  
  switch (status) {
    case CanvassingStatus.DRAFT:
      return <el-tag type="info">DRAFT</el-tag>
    case CanvassingStatus.CANVASSING:
      return <el-tag type="primary">ON CANVASSING</el-tag>
    case CanvassingStatus.PENDING_APPROVAL_RAB:
      return <el-tag type="warning">PENDING APPROVAL</el-tag>
    case CanvassingStatus.CANCEL:
      return <el-tag type="danger">CANCELED</el-tag>
    default:
      return <el-tag>{status}</el-tag>
  }
}

const bulkDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Yakin ingin menghapus data Canvassing?',
      'Warning',
      {
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    const ids = data.data.value?.data
    ?.filter(item => item.checked)
    .map(item => item.unique_id!) || []

    // Jika sampai sini, user klik Delete
    await handleSubmitDelete(ids)
    
  } catch (error) {
    // User klik Cancel atau close dialog
    console.log('Delete cancelled')
  }
}

const handleSubmitDelete = async (values: string[]) => {
  try {
    const response = await useFetchApi(
      "/canvassing-delete",
      "delete_data",
      "post",
      values
    );
    if (response.status.value == "success") {
      await refreshNuxtData("get-canvasing");
    }
  } catch (error: any) {
    ElMessage.error(`${error?.response?.data?.message ?? error}`);
  }
};

const handleSelectionChange = (selection: Canvassing[]) => {
  selectedCanvassing.value = selection
}

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
}

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
}

const onEdit = (canvassing: Canvassing) => {
  navigateTo(`/supply-chain-management/canvassing/edit/${canvassing.unique_id}`)
}




const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order === OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  }
  
}



// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData('get-canvassing');
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