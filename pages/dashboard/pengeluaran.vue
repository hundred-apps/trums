<script lang="tsx" setup>
import { ref, computed } from 'vue'
import { Eleme, SetUp, Filter } from '@element-plus/icons-vue'
import { type Column, type CheckboxValueType, ElTag, ElText, ElButton, TableV2FixedDir, ElPopover, ElCheckbox, ElIcon, type SortBy } from 'element-plus'
import type { FunctionalComponent } from 'vue'
import CustomTable from '~/components/trums/table/customTable.vue'
import type { Pagination } from '~/types/pagination'
import { NuxtLink } from '#components'
import type { ResponsePagination } from '~/types/response_pagination'
import { OrderColumn, type RequestSearch } from '~/types/request_search'
import type { HutangPiutang, Pengeluaran } from '~/types/finance/hutangpiutang'

definePageMeta({
  middleware: ["auth", "app"],
})

const router = useRouter();



// Request search
const request_search = ref<RequestSearch>({
  keyword: '',
  column: [{
    type: [],
  }],
  limit: "10",
  offset: "1",
  table: 'hutang_piutang',
  sort: {
    column: 'created_at',
    order: OrderColumn.ASC,
  }
})

// Data state
const {data} = await useFetchApi<Pagination<Pengeluaran[]>>('/laporan-pengeluaran', 'laporan-pengeluaran', 'get', null);

const loading = ref<boolean>(false)
const search = ref('')
const popoverRef = ref()
const column_selected = ref<string[]>(['selection', 'name', 'hutang', 'piutang'])

// Type untuk Selection Cell
type SelectionCellProps = {
  value: boolean
  intermediate?: boolean
  onChange: (value: CheckboxValueType) => void
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

// Format date
const formatLocalDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID')
}

// Kolom yang ditampilkan berdasarkan seleksi
const filteredColumn = computed(() => {
  return columns.filter(col => column_selected.value.includes(col.key!.toString()))
})

// Definisi kolom tabel
const columns: Column<HutangPiutang>[] = [
  {
    key: 'name',
    title: 'Nama Kontak',
    dataKey: 'name',
    width: 250,
    cellRenderer: ({rowData: row}) => (<NuxtLink href={`/finance-management/hutang-piutang/${row.contact_id}`} class={"text-blue-500"}>{row.name}</NuxtLink>)
  },
  {
    key: 'hutang',
    title: 'Hutang',
    dataKey: 'hutang',
    width: 150,
    cellRenderer: ({rowData: row}) => (
      <ElTag type="danger">{formatCurrency(row.hutang)}</ElTag>
    ),
    sortable: true
  },
  {
    key: 'piutang',
    title: 'Piutang',
    dataKey: 'piutang',
    width: 150,
    cellRenderer: ({rowData: row}) => (
      <ElTag type="success">{formatCurrency(row.piutang)}</ElTag>
    ),
    sortable: true
  },
  {
    key: 'balance',
    title: 'Saldo',
    width: 150,
    cellRenderer: ({rowData: row}) => {
      const balance = row.piutang - row.hutang
      return (
        <ElTag type={balance >= 0 ? 'success' : 'danger'}>
          {formatCurrency(balance)}
        </ElTag>
      )
    }
  },
  {
    key: 'created_at',
    title: 'Tanggal Dibuat',
    dataKey: 'created_at',
    width: 200,
    sortable: true,
    cellRenderer: ({rowData: row}) => (<ElText>{formatLocalDate(row.created_at)}</ElText>)
  },
  {
    key: 'operations',
    title: 'Aksi',
    cellRenderer: ({rowData: row}) => (
      <>
        <ElButton size="small" onClick={() => onEdit(row)}>Edit</ElButton>
        <ElButton size="small" type="danger" onClick={() => onDelete(row)}>Hapus</ElButton>
      </>
    ),
    width: 150,
    align: 'center',
  },
  {
    title: '',
    key: 'setup',
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
  }
]

// Tambahkan kolom seleksi di awal
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
    const _data = unref(data.value)
    const onChange = (value: CheckboxValueType) =>
      (data.value!.query = (_data?.query ?? []).map((row: any) => {
        row.checked = value
        return row
      }))
    const allSelected = _data?.query.every((row: any) => row.checked) ?? false;
    const containsChecked = _data?.query.some((row: any) => row.checked) ?? false;

    return (
      <SelectionCell
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    )
  },
})

// Tambahkan setup kolom di akhir
columns[columns.length - 1].headerCellRenderer = () => {
  return (
    <div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                {columns.map((value) => (
                  value.key != 'selection' && value.key != 'setup' ? 
                  <ElCheckbox 
                    onChange={() => console.log("ok")} 
                    value={value.key!.toString()} 
                    v-model={column_selected.value}
                  >
                    {value.title}
                  </ElCheckbox> : 
                  <></>
                ))}
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

// Komponen Selection Cell
const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <ElCheckbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  )
}

// Handler untuk delete
const onDelete = async (value: HutangPiutang) => {
  try {
    // Ganti dengan API call sebenarnya
    // await axios.delete(`/hutang-piutang/${value.contact_id}`)
    ElMessage.success('Data berhasil dihapus')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Gagal menghapus data')
  }
}

// Handler untuk edit
const onEdit = async (value: HutangPiutang) => {
  router.push(`/finance-management/hutang-piutang/edit/${value.contact_id}`)
}

// Handle page change
const handlePageChange = (page: number) => {
  request_search.value.offset = `${page}`
}

// Handle page size change
const handleSizeChange = (size: number) => {
  request_search.value.limit = `${size}`
}

const onSort = async (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
  }
}


// Watch search query
watchDebounced(
  request_search.value,
  () => {
    // Ganti dengan API call sebenarnya
    // refreshNuxtData('hutang-piutang')
  },
  { debounce: 500 }
)

// const piutang = computed(() => {
//   const piutang = (data.value?.query ?? []).reduce((sum, item) => sum + (item.piutang || 0), 0) ?? 0;
//   return piutang;
// })
// const hutang = computed(() => {
//     const hutang = (data.value?.query ?? []).reduce((sum, item) => sum + (item.hutang || 0), 0) ?? 0;
//     console.log(data.value?.query);
//   return hutang;
// })
// const outputValuePiutang = useTransition(piutang, {
//   duration: 1500,
// })
// const outputValueHutang= useTransition(hutang, {
//   duration: 1500,
// })

onMounted(() => {
    
})

</script>

<template>
    
     <el-row>
        <el-col :span="24">
            <el-card shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>Pengeluaran</span>
                    </div>
                </template>
                <el-table :data="(data?.query ?? [])" >
                    <el-table-column prop="name" label="Kategori" >
                        <template #default="{ row }">
                            <span class="text-blue-500 font-bold">
                            {{ row.reference }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="total_amount" label="Total" align="right" aria-sort="true" >
                        <template #default="{ row }">
                            <span class="">
                            {{ currency(row.total_amount) }}
                            </span>
                        </template>
                    </el-table-column>
                    
                </el-table>
            </el-card>
        </el-col>
        
    </el-row>
</template>

<style scoped>


.el-col {
  text-align: center;
}
</style>