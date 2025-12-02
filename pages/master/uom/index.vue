<template>
  <TrumsWrapper>
    
    <!-- Action Bar -->
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input
          v-model="request_search.keyword"
          size="default"
          placeholder="Cari unit..."
          clearable 
        />
      </el-col>
      <el-button
        v-if="canAccess('units-create', data?.privilege ?? [])"
        size="default"
        type="primary"
        :loading="loading"
        @click="() => dialogNew = true"
      >
        Tambah UOM Baru
      </el-button>
      <el-button
        size="default"
        :loading-icon="Eleme"
        :loading="loading"
        @click="() => refreshNuxtData('get-units')"
      >
        Muat Ulang
      </el-button>
      <el-button
        v-if="canAccess('units-delete', data?.privilege ?? [])"
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


    <el-dialog v-model="dialogNew" title="Tambah UOM" width="500">
        <el-form :model="form" ref="formRef">
            <el-form-item label="Nama UOM" prop="name">
                <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
        <div class="dialog-footer">
            <el-button @click="dialogNew = false">Batal</el-button>
            <el-button type="primary" @click="() => onSubmit(formRef)">
            Simpan
            </el-button>
        </div>
        </template>
    </el-dialog>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { Eleme, SetUp } from '@element-plus/icons-vue'
import { type Column, type CheckboxValueType, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy, ElCheckboxGroup, type FormInstance, type FormRules } from 'element-plus'
import CustomTable from '~/components/trums/table/customTable.vue'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { BaseResponse } from '~/types/response'
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import { NuxtLink } from '#components'
import type { Unit } from '~/types/unit'
import { unique } from 'element-plus/es/utils/arrays.mjs'

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "units-read",
  name: "Daftar Unit"
})

// Search request
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  flag: "list",
  table: 'units',
  sort: {
    column: 'name',
    order: OrderColumn.ASC,
  }
});

// Data state
const {data} = await useFetchApi<ResponsePagination<Unit[]>>('/search', 'get-units', 'post', request_search.value);

const selectedUnits = ref<Unit[]>([])
const loading = ref<boolean>(false)
const dialogNew = ref<boolean>(false)
const columnsSelected = ref<string[]>(['selection', 'name', 'created_at', 'updated_at', 'version', 'operations', 'setup'])

const formRef = ref<FormInstance>()

// Form data
const form = ref({
    unique_id: '',
    name: ''
})

// Validation rules
const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Nama unit wajib diisi', trigger: 'blur' },
    { min: 2, message: 'Nama unit minimal 2 karakter', trigger: 'blur' },
    { max: 100, message: 'Nama unit maksimal 100 karakter', trigger: 'blur' }
  ]
})

// Columns
const columns: Column<Unit>[] = [
  {
    key: 'name',
    title: 'Nama Unit',
    dataKey: 'name',
    width: 250,
    sortable: true,
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Unit }) => (
      <span>{formatDate(rowData.created_at)}</span>
    )
  },
  {
    key: 'updated_at',
    title: 'Terakhir Diupdate',
    dataKey: 'updated_at',
    width: 150,
    sortable: true,
    cellRenderer: ({ rowData }: { rowData: Unit }) => (
      <span>{formatDate(rowData.updated_at)}</span>
    )
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({ rowData }: { rowData: Unit }) =>
    h('div', { class: 'flex gap-2' }, [
      (canAccess('units-update', data.value?.privilege ?? []) && h(
        <el-button
          size="small"
          type="primary"
          onClick={() => {
            form.value.name = rowData.name;
            form.value.unique_id = rowData.unique_id;
            dialogNew.value = true;
          }}
        >
          Edit
        </el-button>
      )),
      (canAccess('units-delete', data.value?.privilege ?? []) && h(
        <el-button 
          size="small" 
          type="danger" 
          onClick={() => onDelete([rowData.unique_id])}
        >
          Hapus
        </el-button>
      ))
    ]),
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

const handleSelectionChange = (selection: Unit[]) => {
  selectedUnits.value = selection
}

const paginationClick = (val: number) => {
  request_search.value.offset = val.toString();
}

const onDelete = async (uniques: string[]) => {
  try {
    const confirmed = await ElMessageBox.confirm(
      'Apakah Anda yakin ingin menghapus unit yang dipilih?',
      'Konfirmasi Hapus',
      {
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      await useFetchApi<BaseResponse<any>>('/unit-delete', 'delete-unit', 'post', uniques);
      ElMessage.success('Unit berhasil dihapus')
      refreshNuxtData('get-units');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Gagal menghapus unit')
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

const onSubmit = async (formEl: FormInstance | undefined) => {
  
  if (!formEl) return

  try {
    const valid = await formEl.validate()
    if (!valid) return

    loading.value = true

    // Prepare data for API
    const submitData = {
      unique_id: form.value.unique_id,  
      name: form.value.name.trim()
    }

    // Call API to create unit
    const response = await useFetchApi<BaseResponse<any>>('/unit-create', 'create-unit', 'post', submitData)
    
    if(response.status.value == 'success'){
        ElMessage.success('Data berhasil di simpan');
        refreshNuxtData('get-units');
        form.value.name = '';
        form.value.unique_id = '';
        dialogNew.value = false;
    }

  } catch (error: any) {
    if (error?.errors) {
      // Validation errors handled by form
      return
    }
    
    ElMessage.error('Gagal menyimpan unit: ' + (error.response?.data?.message || error.message || 'Terjadi kesalahan'))
  } finally {
    loading.value = false
  }
}

// Watch search query
watchDebounced(
  request_search,
  () => {
    refreshNuxtData('get-units')
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