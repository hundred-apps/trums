<script lang="tsx" setup>
definePageMeta({
  middleware: ["auth", "app"],
});

import { InfoFilled, SetUp, Filter } from '@element-plus/icons-vue'
import CustomTable from '~/components/trums/table/customTable.vue';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import { ElButton, TableV2FixedDir, ElCheckbox, ElIcon, ElPopover, ElTag, type CheckboxValueType, type Column, type SortBy } from 'element-plus';
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import DeleteButton from '~/components/trums/DeleteButton.vue';
import { NuxtLink } from '#components';
import type { Catalogue } from '~/types/catalogue';

interface FormFilter {
  date_range: string[],
}

const ruleFormFilter = reactive<FormFilter>({
  date_range: ["", ""],
});

const loading = ref<boolean>(false);
const column_selected = ref<string[]>(['selection', 'unique_code', 'name', 'brand_name', 'type', 'status', 'created_at', 'actions', 'setup']);
const search = ref('')
const router = useRouter();
const popoverRef = ref();

// Columns definition
const availableColumn: Column<Catalogue>[] = [
  {
    key: 'selection',
    width: 50,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },
    headerCellRenderer: () => {
      const _data = unref(data)
      const onChange = (value: CheckboxValueType) =>
        (data.value!.data = _data!.data.map((row: any) => {
          row.checked = value
          return row
        }))
      const allSelected = (_data?.data ?? []).every((row) => row.checked ?? false)
      const containsChecked = (_data?.data ?? []).some((row) => row.checked ?? false)

      return (
        <SelectionCell
          value={allSelected}
          interminate={(containsChecked && !allSelected)}
          onChange={onChange}
        />
      )
    },
  },
  {
    key: 'unique_code',
    title: 'Kode',
    width: 150,
    cellRenderer: ({rowData: row}) => <NuxtLink href={`/catalogue/${row.unique_id}`} class={'text-blue-600'}>{row.unique_code}</NuxtLink>
  },
  {
    dataKey: 'sn',
    key: 'sn',
    title: 'SN',
    width: 120,
  },
  {
    dataKey: 'name',
    key: 'name',
    title: 'Nama',
    width: 200,
  },
  {
    dataKey: 'brand_name',
    key: 'brand_name',
    title: 'Brand',
    width: 150,
  },
  {
    dataKey: 'type',
    key: 'type',
    title: 'Tipe',
    width: 120,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Tipe</span>
        <ElPopover trigger="click" width="200">
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  <ElCheckbox value="place" v-model={request_search.value.column[0].type}>
                    Place
                  </ElCheckbox>
                  <ElCheckbox value="item" v-model={request_search.value.column[0].type}>
                    Item
                  </ElCheckbox>
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
    )
  },
  {
    dataKey: 'is_asset',
    key: 'is_asset',
    title: 'Asset',
    width: 120,
    cellRenderer: ({rowData: row}) =><ElTag type={row.is_asset ? 'success' : 'info'}>
        {row.is_asset ? 'Asset' : 'Non-Asset'}
      </ElTag>
  },
  {
    dataKey: 'year',
    key: 'year',
    title: 'Tahun',
    width: 100,
  },
  {
    dataKey: 'created_at',
    key: 'created_at',
    title: 'Dibuat',
    width: 150,
    sortable: true,
    cellRenderer: ({rowData: row}) => <span>{formatLocalDate(row.created_at * 1000)}</span>
  },
  {
    dataKey: 'actions',
    key: 'actions',
    title: 'Aksi',
    width: 150,
    cellRenderer: ({rowData: row}) => (
      <>
        <ElButton size="small" onClick={() => handleEdit(row)}>
          Edit
        </ElButton>
        <DeleteButton size="small" onConfirm={() => handleDelete([row.unique_id])} onCancel={() => {}} />
      </>
    ),
  },
  {
    dataKey: 'setup',
    key: 'setup',
    title: '',
    width: 50,
    fixed: TableV2FixedDir.RIGHT,
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <ElPopover trigger="click" width="200">
          {{
            default: () => (
              <div class="filter-wrapper">
                <div class="filter-group flex flex-col">
                  {availableColumn.map((col) => (
                    col.key !== 'selection' && col.key !== 'setup' && (
                      <ElCheckbox 
                        v-model={column_selected.value} 
                        value={col.key!.toString()}
                      >
                        {col.title}
                      </ElCheckbox>
                    )
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
];

availableColumn[10].headerCellRenderer = () => {
    return (<div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                {
                  availableColumn.map((value) => (
                    value.key != 'selection' && value.key != 'setup' ? <ElCheckbox onChange={() => console.log("ok")} value={value.key!.toString()} v-model={column_selected.value}>
                      {value.title}
                    </ElCheckbox> : <></>
                ))
                }
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
    </div>)
  }

const filteredColumn = computed(() => {
  return availableColumn.filter(col => column_selected.value.includes(col.key!.toString()));
});

const request_search = ref<RequestSearch>({
  keyword: '',
  column: [{
    type: [],
    status: []
  }],
  limit: "10",
  offset: "1",
  table: 'catalogues',
  sort: {
    column: 'created_at',
    order: OrderColumn.DESC,
  }
});

const { data } = await useFetchApi<ResponsePagination<Catalogue[]>>(
  '/search', 
  'get-catalogues', 
  'post', 
  request_search.value
);



const checkSelect = () => data.value?.data.some((row) => row.checked);

const handleEdit = (row: Catalogue) => {
  const session = useCookie('unique_id');
  session.value = row.unique_id;
  router.push(`/catalogue/add`);
};

const handleDelete = async (ids: string[]) => {
  try {
    await useFetchApi('/catalogues-delete', 'delete-catalogue', 'delete', ids);
    ElMessage.success('Katalog berhasil dihapus');
    refreshNuxtData('get-catalogues');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || 'Gagal menghapus katalog');
  }
};

const deleteBulk = async () => {
  const ids = (data.value?.data ?? [])
    .filter(item => item.checked)
    .map(item => item.unique_id!);
    
  if (ids.length) {
    await handleDelete(ids);
  }
};

const onSort = (sortBy: SortBy) => {
  request_search.value.sort = {
    column: sortBy.key.toString(),
    order: request_search.value.sort?.order === OrderColumn.ASC 
      ? OrderColumn.DESC 
      : OrderColumn.ASC
  };
};

const formatLocalDate = (timestamp: number | null) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('id-ID');
};

const fetchData = async () => {
  loading.value = true;
  try {
    await refreshNuxtData('get-catalogues');
  } catch (error) {
    ElMessage.error('Gagal memuat data katalog');
  } finally {
    loading.value = false;
  }
};

watch(request_search, fetchData, { deep: true });



const shortcutsDate = [
  {
    text: 'Minggu lalu',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: 'Bulan lalu',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  }
];
</script>

<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6">
        <el-input 
          v-model="request_search.keyword" 
          placeholder="Cari katalog..." 
          clearable 
        />
      </el-col>
      <NuxtLink href="/catalogue/add" @click="() => {
        const unique_id = useCookie('unique_id');
        unique_id.value = null;
      }" class="el-button el-button--primary">
        Tambah Katalog
      </NuxtLink>
      
      
      <el-popconfirm
        v-if="checkSelect()"
        title="Hapus item terpilih?"
        @confirm="deleteBulk"
      >
        <template #reference>
          <el-button type="danger">Hapus Terpilih</el-button>
        </template>
      </el-popconfirm>
    </el-row>

    <CustomTable 
      :columns="filteredColumn" 
      :data="data?.data ?? []" 
      :loading="loading"
      @sort="onSort"
    />

    <div class="flex justify-end mt-3">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data?.total_data ?? 0"
        :page-size="10"
        @current-change="(page) => request_search.offset = page.toString()"
      />
    </div>
  </TrumsWrapper>
</template>