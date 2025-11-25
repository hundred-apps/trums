<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: Permission) => item.type === PermissionType.PERMISSION).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Basic Permission
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: Permission) => item.type === PermissionType.APPROVAL).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Approval Permission
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="totalApprovalPIC">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total PIC Approval
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
                Total Permission
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>

    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3" align="middle">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari permission..."
          clearable 
        />
      </el-col>
      <el-radio-group v-model="permission_type" class="mr-3" size="default" @change="onChangePermissionFilter">
        <el-radio-button label="Semua" value="" />
        <el-radio-button label="Basic" :value="PermissionType.PERMISSION" />
        <el-radio-button label="Approval" :value="PermissionType.APPROVAL" />
      </el-radio-group>
      <NuxtLink 
        class="el-button el-button--primary el-button--default" 
        href="/master/permission/add"
      >
        Tambah Permission Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-permissions')"
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
      <el-pagination 
        background 
        layout="prev, pager, next, sizes" 
        :total="data?.total_data ?? 0" 
        :page-size="parseInt(request_search.limit)"
        :current-page="parseInt(request_search.offset)"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
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
import type { Permission } from '~/types/menu'
import { PermissionType, ApprovalType } from '~/types/menu'

definePageMeta({
  middleware: ["auth", "app"],
})

// Permission type filter
const permission_type = ref<string>('')

// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'permissions',
  sort: {
    column: 'created_at',
    order: OrderColumn.DESC,
  }
});

// Data state
const { data } = await useFetchApi<ResponsePagination<Permission[]>>('/search', 'get-permissions', 'post', request_search.value);

const selectedPermissions = ref<Permission[]>([])
const loading = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'permission_name', 'menu_id', 'type', 'approval_type', 'approval_length', 'slug', 'created_at', 'operations', 'setup'])

// Computed
const totalApprovalPIC = computed(() => {
  return (data.value?.data ?? []).reduce((total, permission) => {
    return total + (permission.approval_permission_pic?.length || 0)
  }, 0)
})

const hasSelected = computed(() => {
  return data.value?.data?.some(item => item.checked) || false
})

// Columns
const columns: Column<Permission>[] = [
  {
    key: 'permission_name',
    title: 'Nama Permission',
    dataKey: 'permission_name',
    width: 250,
    sortable: true,
  },
  {
    key: 'menu_id',
    title: 'Menu ID',
    dataKey: 'menu_id',
    width: 120,
  },
  {
    key: 'slug',
    title: 'Slug',
    dataKey: 'slug',
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Permission }) => (
      <span class="text-blue-500 font-mono text-sm">{rowData.slug}</span>
    )
  },
  {
    key: 'type',
    title: 'Tipe',
    dataKey: 'type',
    width: 120,
    cellRenderer: ({ rowData }: { rowData: Permission }) => {
      const typeConfig = {
        [PermissionType.PERMISSION]: { type: 'success', text: 'Basic' },
        [PermissionType.APPROVAL]: { type: 'warning', text: 'Approval' }
      }
      const config = typeConfig[rowData.type]
      return <ElTag type={config.type as  "success" | "warning" | "info" | "primary" | "danger" | undefined}>{config.text}</ElTag>
    }
  },
  {
    key: 'approval_type',
    title: 'Tipe Approval',
    dataKey: 'approval_type',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Permission }) => {
      if (rowData.type !== PermissionType.APPROVAL) return <span>-</span>
      
      const typeConfig = {
        [ApprovalType.PARALLEL]: { type: 'info', text: 'Parallel' },
        [ApprovalType.SEQUENTIAL]: { type: 'primary', text: 'Sequential' }
      }
      const config = typeConfig[rowData.approval_type]
      return <ElTag type={config.type as  "success" | "warning" | "info" | "primary" | "danger" | undefined}>{config.text}</ElTag>
    }
  },
  {
    key: 'approval_length',
    title: 'Jumlah Approval',
    dataKey: 'approval_length',
    width: 140,
    cellRenderer: ({ rowData }: { rowData: Permission }) => {
      if (rowData.type !== PermissionType.APPROVAL) return <span>-</span>
      return <span>{rowData.approval_length} PIC</span>
    }
  },
  {
    key: 'approval_pic',
    title: 'PIC Approval',
    dataKey: 'approval_pic',
    width: 180,
    cellRenderer: ({ rowData }: { rowData: Permission }) => {
      if (!rowData.approval_permission_pic?.length) return <span>-</span>
      return <span>{rowData.approval_permission_pic.length} orang</span>
    }
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Permission }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: Permission }) => (
      <div class="flex gap-2">
        <NuxtLink 
          class="el-button el-button--small el-button--primary" 
          href={`/master/permission/add?id=${rowData.unique_id}`}
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

const handleSelectionChange = (selection: Permission[]) => {
  selectedPermissions.value = selection
}

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
  refreshNuxtData('get-permissions')
}

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
  request_search.value.offset = '1'
  refreshNuxtData('get-permissions')
}

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      'Apakah Anda yakin ingin menghapus permission yang dipilih?',
      'Konfirmasi Hapus',
      {
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      await useFetchApi<BaseResponse<any>>('/permission-delete', 'delete-permission', 'post', uniques);
      
      ElMessage.success('Permission berhasil dihapus')
      refreshNuxtData('get-permissions');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Gagal menghapus permission')
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
  refreshNuxtData('get-permissions')
}

const onChangePermissionFilter = (val: string|any) => {
  if (val) {
    request_search.value.column = [
      {
        type: [val]
      }
    ]
  } else {
    request_search.value.column = []
  }
  request_search.value.offset = '1'
  refreshNuxtData('get-permissions')
}

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData('get-permissions')
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

.mb-3 {
  margin-bottom: 1rem;
}

.mr-3 {
  margin-right: 1rem;
}
</style>