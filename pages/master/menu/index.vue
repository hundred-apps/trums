<template>
  <TrumsWrapper>
    <!-- Statistic Cards -->
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: Menu) => item.parent_id === null).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Menu Utama
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="(data?.data ?? []).filter((item: Menu) => item.parent_id !== null).length">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Submenu
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="statistic-card">
          <el-statistic :value="totalSubmenus">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                Total Submenu
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
                Total Menu
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
          placeholder="Cari menu..."
          clearable 
        />
      </el-col>
      <el-radio-group v-model="is_menu" class="mr-3" size="default" @change="(val) => onChangeMenuFilter(val as string)">
        <el-radio-button label="Menu" value="1" />
        <el-radio-button label="SubMenu" value="0" />
      </el-radio-group>
      <NuxtLink 
        v-if="canAccess('menus-create', data?.privilege ?? [])"
        class="el-button el-button--primary el-button--default" 
        href="/master/menu/add"
      >
        Tambah Menu Baru
      </NuxtLink>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-menus')"
      >
        Muat Ulang
      </el-button>
      <el-button
        v-if="canAccess('menus-delete', data?.privilege ?? [])"
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
import { Eleme, SetUp, Filter } from '@element-plus/icons-vue'
import { type Column, type CheckboxValueType, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy, ElCheckboxGroup } from 'element-plus'
import type { Pagination } from '~/types/pagination'
import { NuxtLink } from '#components';
import CustomTable from '~/components/trums/table/customTable.vue'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import type { Menu } from '~/types/menu';

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "menus-read",
  name: "Daftar Menu"
})


const is_menu = ref<string>('1');

const hasCreate = await checkPermission('menus-create');
const hasUpdate = await checkPermission('menus-update');
const hasDelete = await checkPermission('menus-delete');


// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [
    {
      parent_id: ['null'],
    }
  ],
  limit: "10",
  offset: "1",
  table: 'menus',
  sort: {
    column: 'name',
    order: OrderColumn.ASC,
  }
});

// Data state
const {data} = await useFetchApi<ResponsePagination<Menu[]>>('/search', 'get-menus', 'post', request_search.value);

const selectedMenus = ref<Menu[]>([])
const loading = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'name', 'type', 'route', 'order', 'submenus', 'created_at', 'operations', 'setup'])

// Computed
const totalSubmenus = computed(() => {
  return (data.value?.data ?? []).reduce((total, menu) => total + (menu.menus?.length || 0), 0) || 0
})

// Columns
const columns: Column<Menu>[] = [
  {
    key: 'name',
    title: 'Nama Menu',
    dataKey: 'name',
    width: 250,
    
  },
  {
    key: 'icon',
    title: 'Icon',
    dataKey: 'icon',
    width: 120,
  },
  {
    key: 'route',
    title: 'Route',
    dataKey: 'route',
    width: 200,
    cellRenderer: ({ rowData }: { rowData: Menu }) => (
      <span class="text-blue-500 font-mono text-sm">{rowData.route}</span>
    )
  },
  {
    key: 'order',
    title: 'Urutan',
    dataKey: 'order',
    width: 100,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Menu }) => (
      <span>{rowData.order || '-'}</span>
    ),
    
  },
  {
    key: 'parent',
    title: 'Parent Menu',
    dataKey: 'parent',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Menu }) => (
      <span>{rowData.parent?.name || ''}</span>
    )
  },
  {
    key: 'submenus',
    title: 'Jumlah Submenu',
    dataKey: 'submenus',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Menu }) => (
      <span>{rowData.menus?.length || 0}</span>
    )
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Menu }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: Menu }) =>
    
    h('div', { class: 'flex gap-2' }, [
      (canAccess('menus-update', data.value?.privilege ?? []) && h(
        <NuxtLink 
          
          class="el-button el-button--small el-button--primary" 
          href={`/master/menu/add?id=${rowData.unique_id}`}
        >
          Edit
        </NuxtLink>
      )),
      // (canAccess('menus-update', data.value?.privilege ?? []) && h(
      //   <NuxtLink 
          
      //     class="el-button el-button--small el-button--primary" 
      //     href={`/master/menu/add?id=${rowData.unique_id}`}
      //   >
      //     Edit
      //   </NuxtLink>
      // )),
      (canAccess('menus-delete', data.value?.privilege ?? []) && h(
        <el-button 
          size="small" 
          type="danger" 
          onClick={() => onDelete([rowData.unique_id])}
        >
          Hapus
        </el-button>
      ))
    ]),
    
    // (
    //   <div class="flex gap-2">
        
        // <el-button 
        //   size="small" 
        //   type="danger" 
        //   onClick={() => onDelete([rowData.unique_id])}
        // >
        //   Hapus
        // </el-button>
    //   </div>
    // ),
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

const hasSelected = computed(() => {
  return data.value?.data?.some(item => item.checked) || false
})

// Methods
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSelectionChange = (selection: Menu[]) => {
  selectedMenus.value = selection
}

const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
  // fetchData()
}

const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
  // fetchData()
}

const paginationClick = (val: number) => {
  
  request_search.value.offset = val.toString();
}

const onEdit = (menu: Menu) => {
  navigateTo(`/menu/edit/${menu.unique_id}`)
}

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      'Apakah Anda yakin ingin menghapus menu yang dipilih?',
      'Konfirmasi Hapus',
      {
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      // Implement delete API call here
      await useFetchApi<BaseResponse<any>>('/menu-delete', 'delete-menu', 'post', uniques);
      
      
      ElMessage.success('Menu berhasil dihapus')
      refreshNuxtData('get-menus');
    }
  } catch (error) {
    // User canceled or error occurred
    if (error !== 'cancel') {
      ElMessage.error('Gagal menghapus menu')
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
  console.log('sort column ', sortBy.key.toString());
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order === OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  }
  
}

// Fetch data
const fetchData = async () => {
  loading.value = true
  try {
    const response = await useFetchApi<ResponsePagination<Menu[]>>('/menus', 'get-menus', 'get', request_search);
    if(response.status.value == 'success'){
      data.value = response.data.value ?? {
        currentPage: 0,
        data: [],
        success: true,
        total_data: 0,
        total_page: 0
      }
    }
  } catch (error) {
    ElMessage.error('Gagal memuat data menu')
  } finally {
    loading.value = false
  }
}

const onChangeMenuFilter = (val: string) => {
  if(val === '1'){
    request_search.value.column = [
      {
        parent_id: ['null']
      }
    ]
  }else{
    request_search.value.column = [
      {
        parent_id: ['not null']
      }
    ];
  }
}

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData('get-menus')
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

:deep(.ml-4) {
  margin-left: 1rem;
}

:deep(.font-semibold) {
  font-weight: 600;
}

:deep(.font-mono) {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
}
</style>