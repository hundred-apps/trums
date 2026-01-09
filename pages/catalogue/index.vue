<script lang="tsx" setup>
definePageMeta({
    middleware: ["auth", "check-access"],
    requiredPermission: "catalogues-read",
    name: "List Of Catalogues"
})

import { InfoFilled, SetUp, Filter, Refresh } from '@element-plus/icons-vue'
import CustomTable from '~/components/trums/table/customTable.vue';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import { ElButton, TableV2FixedDir, ElCheckbox, ElIcon, ElPopover, ElTag, type CheckboxValueType, type Column, type SortBy, ElCheckboxGroup, ElImage } from 'element-plus';
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import DeleteButton from '~/components/trums/DeleteButton.vue';
import { NuxtLink } from '#components';
import type { Catalogue } from '~/types/catalogue';
import type { AppFile } from '~/types/file';

interface FormFilter {
  date_range: string[],
}

const ruleFormFilter = reactive<FormFilter>({
  date_range: ["", ""],
});

const previewImage = ref<boolean>(false);
const initialIndexImage = ref<number>(0);
const urlFileList = ref<string[]>([]);

const loading = ref<boolean>(false);
const column_selected = ref<string[]>(['selection', 'image', 'unique_code', 'name', 'brand_name', 'type', 'status', 'created_at', 'actions', 'setup']);
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
    key: 'image',
    title: 'Image',
    width: 150,
    cellRenderer: ({ rowData }: { rowData: Catalogue }) => {
      const image = getFileFirst(rowData.files ?? []);

      return (
        <div class="flex items-center py-2 px-2">
          {image ? (
            <div onClick={() => {
              initialIndexImage.value = 0;
              previewImage.value = true;
              urlFileList.value = getFiles(rowData.files ?? []);
            }}>
              <ElImage
                src={image}
                style={{ width: '45px', height: '45px', cursor: 'pointer' }}
                zoomRate={1.2}
                maxScale={7}
                minScale={0.2}
                initialIndex={0}
              />
            </div>
          ) : (
            <div
              class="flex items-center justify-center border rounded py-2 px-2"
              style={{ width: '45px', height: '45px', fontSize: '10px' }}
            >
              No Image
            </div>
          )}
        </div>
      );
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
    cellRenderer: ({rowData: row}) => <p>{row.brand?.name ?? ''}</p>
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
                  <ElCheckboxGroup v-model={request_search.value.column[0].type}>
                    <ElCheckbox key={'place'} value={'place'} label={'Place'} />
                    <ElCheckbox key={'item'} value={'item'} label={'Item'} />
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
        <NuxtLink class="el-button el-button--small" href={`/catalogue/add?unique_id=${row.unique_id}`}>
          Edit
        </NuxtLink>
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
                  <ElCheckboxGroup v-model={column_selected.value}>
                    {
                      availableColumn
                        .filter(c => c.key !== 'selection' && c.key !== 'setup')
                        .map(c => (
                          <ElCheckbox 
                            key={c.key} 
                            value={c.key!.toString()} 
                            label={c.title} 
                          />
                        ))
                    }
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
];

const getFileFirst = (files: AppFile[]) => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  if (files!.length > 0) {
    return `${imageUrl}/${files![0].image_path}/${
      files![0].filename
    }`;
  } else {
    return "";
  }
};
const getFiles = (files: AppFile[]): string[] => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  return files.map((value) => `${imageUrl}/${value.image_path}/${
      value.filename}`);
};

// availableColumn[10].headerCellRenderer = () => {
//     return (<div class="flex items-center justify-center">
//       <span class="mr-2 text-xs"></span>
//       <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
//         {{
//           default: () => (
//             <div class="filter-wrapper">
//               <div class="filter-group flex flex-col">
//                 <ElCheckboxGroup v-model={column_selected.value}>

//                 {
//                   availableColumn.map((value) => (
//                     value.key != 'selection' && value.key != 'setup' ? <ElCheckbox onChange={() => console.log("ok")} value={value.key!.toString()}>
//                       {value.title}
//                     </ElCheckbox> : <></>
//                 ))
//                 }
//                 </ElCheckboxGroup>
//               </div>
//             </div>
//           ),
//           reference: () => (
//             <ElIcon class="cursor-pointer">
//               <SetUp />
//             </ElIcon>
//           ),
//         }}
//       </ElPopover>
//     </div>)
//   }

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
    await useFetchApi('/catalogues-delete', 'delete-catalogue', 'post', ids);
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

      <el-button :icon="Refresh" size="default" type="default" @click="() => refreshNuxtData('get-catalogues')">Reload</el-button>
      
      
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

    <el-image-viewer
      v-if="previewImage"
      show-progress
      :initial-index="initialIndexImage"
      :url-list="urlFileList"
      @close="previewImage = false"
    >
    <template #viewer-error="{ activeIndex, src }">
      <div class="image-slot viewer-error">
        <el-icon><icon-picture /></el-icon>
        <span>
          this is viewer-error slot. current index: {{ activeIndex }}. src:
          {{ src }}
        </span>
      </div>
    </template>
  </el-image-viewer>
  </TrumsWrapper>
</template>