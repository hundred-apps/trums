<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> Detail - {{ catalogueData?.unique_code || catalogueData?.name }} </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3">
      <div class="flex gap-3 my-3">
        <div class="flex-1">
          <el-descriptions
            title=""
            :column="1"
            size="large"
            border
          >
            <el-descriptions-item label="Nama Item">{{ catalogueData?.name }}</el-descriptions-item>
            <el-descriptions-item label="Brand">{{ catalogueData?.brand_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Tahun">{{ catalogueData?.year || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Jenis Item">{{ catalogueData?.is_asset ? 'Asset' : 'Non-Asset' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="flex-1">
          <el-descriptions
            title=""
            :column="1"
            size="large"
            border
          >
            <el-descriptions-item label="Serial Number">{{ catalogueData?.sn || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Dibuat Pada">{{ formatLocalDate(catalogueData?.created_at ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="Terakhir Diupdate">{{ formatLocalDate(catalogueData?.updated_at ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="Versi">{{ catalogueData?.version || '1' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <div class="mb-5">
        <h1 class="text-lg font-bold">Deskripsi</h1>
        <p>{{ catalogueData?.description || 'Tidak ada deskripsi' }}</p>
      </div>
      
      <div class="mb-5">
        <h1 class="text-lg font-bold">Dimensi</h1>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="Panjang">{{ catalogueData?.length ? `${catalogueData.length} cm` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="Lebar">{{ catalogueData?.width ? `${catalogueData.width} cm` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="Tinggi">{{ catalogueData?.height ? `${catalogueData.height} cm` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="Berat">{{ catalogueData?.berat ? `${catalogueData.berat} gram` : '-' }}</el-descriptions-item>
          <el-descriptions-item label="Volume">{{ catalogueData?.volume ? `${catalogueData.volume} cm³` : '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="mb-5">
        <h1 class="text-lg font-bold">Lampiran</h1>
        <div class="flex flex-wrap gap-4">
          <el-image
            v-for="(file, index) in catalogueData?.file_catalogues"
            :key="index"
            :src="file.url"
            :preview-src-list="previewImageList"
            :initial-index="index"
            fit="cover"
            class="w-32 h-32 rounded-md border"
          >
            <template #error>
              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                <el-icon :size="30"><Document /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </el-card>
    
    <el-card class="mt-3">
      <h1 class="mb-4">Informasi Inventory</h1>
      
      <CustomTable :column-sort="onSort" :columns="filteredColumn" :data="inventoryData?.data ?? []"  />
      <div class="flex justify-end mt-3">
        <el-pagination background layout="prev, pager, next" :total="inventoryData?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick" />
      </div>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { NuxtLink } from '#components';
import { Download, Document, Filter, SetUp } from '@element-plus/icons-vue'
import { ElCheckbox, ElIcon, ElPopover, ElTag, TableV2FixedDir, type CheckboxValueType, type Column, type SortBy } from 'element-plus';
import type { Catalogue } from '~/types/catalogue';
import type { Inventory } from '~/types/inventory';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { BaseResponse } from '~/types/response';
import type { ResponsePagination } from '~/types/response_pagination';
import type { Unit } from '~/types/unit';
import CustomTable from '~/components/trums/table/customTable.vue';
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
definePageMeta({
    middleware: ["auth", "check-access"],
    requiredPermission: "catalogues-read",
    name: "Detail Of Catalogues"
})

const router = useRouter();
const route = useRoute();
const goBack = () => router.back();

const popoverRef = ref();
const loading = ref(false);
const loadingInventory = ref(false);
const catalogueData = ref<Catalogue | null>(null);
const inventoryData = ref<ResponsePagination<Inventory[]>>({
    currentPage: 0,
    data: [],
    success: true,
    total_data: 0,
    total_page: 0,
});

const locations = ref<Catalogue[]>([]);
const units = ref<Unit[]>([]);

const column_selected = ref<string[]>(['selection', 'sn', 'catalogue.name', 'location.name', 'quantity', 'setup']);

const requestSearch = ref<RequestSearch>({
    column: [
        {
            catalogue_id: '',
        }
    ],
    keyword: '',
    table: 'inventories',
    sort: {
        column: 'created_at',
        order: OrderColumn.DESC,
    },
    offset: '1',
    limit: '10'
});

const availableColumn: Column<Inventory>[] = [
    {
      title: 'Serial Number',
      key: 'sn',
      dataKey: 'sn',
      width: 200,
    },
    {
      title: 'Item', 
      key: 'catalogue.name',
      dataKey: 'catalogue.name',
      width: 200,
    },
    {
      title: 'Location', 
      key: 'location.name',
      dataKey: 'location.name',
      width: 200,
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Location</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <el-checkbox-group v-model={requestSearch.value.column![0].location_id}>
                    {
                      locations.value.map((location: Catalogue, index: number) => (
                        <ElCheckbox 
                          key={location.unique_id ?? index} 
                          value={location.unique_id ?? index} 
                        >
                          {location.name}
                        </ElCheckbox>
                      ))
                    }
                  </el-checkbox-group>
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
      cellRenderer: ({rowData: row}) => (<>
        <NuxtLink class={`text-blue-600`} href={`/inventory-management/location/${row.location.unique_id ?? ''}`}>{row.location.name}</NuxtLink>
      </>)
    },
    {
      title: 'Quantity', 
      key: 'quantity',
      dataKey: 'quantity',
      sortable: true,
      width: 100,
      cellRenderer: ({rowData: row}) => (<>
        <p>{row.quantity}</p>
      </>)
    },
    {
      title: 'Satuan', 
      key: 'unit_name',
      dataKey: 'unit_name',
      sortable: false,
      width: 100,
      cellRenderer: ({rowData: row}) => (<>
        <p>{row.unit_name}</p>
      </>),
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Satuan</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <el-checkbox-group v-model={requestSearch.value.column![0].unit_id}>
                    {
                      units.value.map((unit: Unit) => (
                        <ElCheckbox 
                          key={unit.unique_id!} 
                          value={unit.unique_id!} 
                        >
                          {unit.name}
                        </ElCheckbox>
                      ))
                    }
                  </el-checkbox-group>
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
      title: 'Cost', 
      key: 'cost',
      dataKey: 'cost',
      sortable: true,
      width: 100,
      cellRenderer: ({rowData: row}) => (<>
        <p>{currency(row.cost)}</p>
      </>)
    }, 
    {
      title: 'Traceable',
      key: 'is_traceable',
      dataKey: 'is_traceable',
      width: 100,
      cellRenderer: ({rowData: row}) => (
        row.is_traceable ? 
          <ElTag type="primary">{'Traceable'}</ElTag> : 
          <ElTag type="info">{'Non-Traceable'}</ElTag>
      ),
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Traceable</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <ElCheckbox value={true} v-model={requestSearch.value.column![0].is_traceable}>
                      Traceable
                    </ElCheckbox>
                    <ElCheckbox value={false} v-model={requestSearch.value.column![0].is_traceable}>
                      Not Traceable
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
      title: '',
      key: 'setup',
      width: 50,
      fixed: TableV2FixedDir.RIGHT,
      
    }
  ]

  availableColumn[availableColumn.length - 1].headerCellRenderer = () => {
    const filters = availableColumn.filter((value) => value.key != 'selection' && value.key != 'setup');
    return (<div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <el-checkbox-group v-model={column_selected.value}>
                  {
                    filters.map((value) => (
                      <ElCheckbox onChange={() => console.log("ok")} value={value.key!.toString()} >
                        {value.title}
                      </ElCheckbox>
                  ))
                  }
                </el-checkbox-group>
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

  availableColumn.unshift({
    key: 'selection',
    width: 50,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },

    headerCellRenderer: () => {
      const _data = unref(inventoryData)
      const onChange = (value: CheckboxValueType) =>
        (inventoryData.value = {success: true, currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, data: _data?.data?.map((row: any) => {
          row.checked = value
          return row
        })!})
      const allSelected = _data!.data.every((row) => row.checked)
      const containsChecked = _data?.data.some((row) => row.checked)

      return (
        <SelectionCell
          value={allSelected}
          interminate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })

const fetchLocation = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Catalogue[]>>(`/search`, 'location', 'post', {
        keyword: '',
        column: [
          {
            type: ["place"],
          }
        ],
        limit: "10",
        offset: "1",
        table: 'catalogues',
        sort: {
          column: 'created_at',
          order: OrderColumn.ASC,
        }
      });

      
      if(response.status.value == 'success'){
        
        locations.value = (response.data.value as ResponsePagination<Catalogue[]>).data;
        console.log(locations.value);
      }
    } catch (error: any) {
      
      ElMessage.error(error.response?.data?.message ?? error);
      return [];
    } finally {
      loading.value = false;
    }
    
}

const filteredColumn = computed(() => {
    return availableColumn.filter(col => column_selected.value.includes(col.key!.toString()));
});

const paginationClick = (val: number) => {
    const data:RequestSearch = {...requestSearch.value};
    data.offset = val.toString();
    requestSearch.value = data;
}

const fetchUnits = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Unit[]>>(`/search`, 'units', 'post', {
        keyword: '',
        column: [],
        limit: "50",
        offset: "1",
        table: 'units',
        sort: {
          column: 'created_at',
          order: OrderColumn.ASC,
        }
      });

      
      if(response.status.value == 'success'){
        
        units.value = (response.data.value as ResponsePagination<Unit[]>).data;
      }
    } catch (error: any) {
      
      ElMessage.error(error.response?.data?.message ?? error);
      return [];
    } finally {
      loading.value = false;
    }
    
  }


  const onSort = (sortBy: SortBy) => {
    
    const data:RequestSearch = {...requestSearch.value};
    data.sort = {
      column: sortBy.key.toString(),
      order: requestSearch.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
    };
    requestSearch.value = data;

  }

  

// Format tanggal lokal
const formatLocalDate = (timestamp: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format currency
const formatCurrency = (value: number) => {
  if (!value) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// List gambar untuk preview
const previewImageList = computed(() => {
  return catalogueData.value?.file_catalogues
    ?.filter(file => file.type === 'image')
    ?.map(file => file.url) || [];
});

// Fetch data catalogue
const fetchCatalogueDetail = async () => {
  loading.value = true;
  try {
    const { data } = await useFetchApi<BaseResponse<Catalogue>>(
      `/catalogues-read/${route.params.id}`, 
      'catalogue-detail', 
      'get',
      null,
    );
    
    if (data.value?.data) {
      catalogueData.value = data.value.data;
    }
  } catch (error) {
    console.error('Failed to fetch catalogue detail:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch data inventory terkait
const fetchInventoryData = async () => {
  if (!catalogueData.value?.unique_id) return;
  
  loadingInventory.value = true;
  try {

    const request_search = {...requestSearch.value};
    request_search.column = [
        {
            catalogue_id: catalogueData.value.unique_id,
        }
    ]
    
    const response = await useFetchApi<ResponsePagination<Inventory[]>>(
      `/search`, 
      'catalogue-inventories', 
      'post',
      request_search,
    );
    
    if (response.status.value === 'success') {
      inventoryData.value = response.data.value!;
    }
  } catch (error) {
    console.error('Failed to fetch inventory data:', error);
  } finally {
    loadingInventory.value = false;
  }
};

watch(requestSearch, fetchInventoryData, {immediate: true});

onMounted(async () => {
  await fetchCatalogueDetail();
  await fetchInventoryData();
  await fetchLocation();
  await fetchUnits();
});
</script>

<style scoped>
.el-image {
  transition: all 0.3s ease;
}

.el-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>