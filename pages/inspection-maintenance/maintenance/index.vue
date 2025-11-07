<script lang="tsx" setup>
  import { ref, onMounted, type FunctionalComponent } from 'vue';
  import { type Column, type CheckboxValueType, type InputInstance, type MainInstance, ElButton, ElTag, ElText, ElCheckbox, paginationEmits, type SortBy, TableV2SortOrder, type SortState, ElPopover, type HeaderCellSlotProps, ElIcon, TableV2FixedDir, ElMessage, ElCheckboxGroup } from 'element-plus';
  import type { Maintenance } from '~/types/maintenance';
  import type { Pagination } from '~/types/pagination';
  import { CircleCheckFilled, CircleClose, Eleme, Filter, SetUp } from '@element-plus/icons-vue'
  import CustomTable from '~/components/trums/table/customTable.vue';
  import type { SelectionCellProps } from '~/types/selection_cell_prop';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import { NuxtLink } from '#components';
  definePageMeta({
        middleware: ["auth", "app"],
  });

const sortState = ref<SortState>({
  maintenance_date: TableV2SortOrder.DESC,
});
const paginations = ref<Pagination<Maintenance[]>>();
const maintenanceSelect = ref<Maintenance[]>([]);
const loading = ref<boolean>(false);
const search = ref("");

const shouldFilter = ref(false);
const filters = ref<[]>([]);
const filterMaintenanceType = ref<[]>([]);
const popoverRef = ref();
const dataPerPage = ref(10);

const request_search = ref<RequestSearch>({
  keyword: '',
  column: [],
  limit: "10",
  offset: "1",
  table: 'maintenances',
  sort: {
    column: 'created_at',
    order: OrderColumn.ASC,
  }
});

const fetchData = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Maintenance[]>>(`/search`, 'maintenances', 'post', request_search.value);

      if(response.status.value == 'success'){
        console.log(response.data.value?.data);
        data.value = response.data.value as ResponsePagination<Maintenance[]>;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
      return [];
    } finally {
      loading.value = false;
    }
    
  }

  const axios = useApi();

  const {data} = await useFetchApi<ResponsePagination<Maintenance[]>>(`/search`, 'maintenances', 'post', request_search.value);

  const column_selected = ref<string[]>(['selection', 'unique_code', 'inventory', 'responsible', 'priority', 'status', 'operation', 'setup']);

  const filteredColumn = computed(() => {
    return columnMaintenance.filter(col => column_selected.value.includes(col.key!.toString()));
  });

  const columnMaintenance: Column<any>[] = [
      {
        key: 'unique_code',
        title: 'Unique Code',
        dataKey: 'unique_code',
        width: 250,
        cellRenderer: ({rowData: row}) => (<NuxtLink href={`maintenance/${row.unique_id}`}>{row.unique_code}</NuxtLink>)
      },
      {
        key: 'inventory',
        title: 'Item',
        dataKey: 'inventory',
        width: 250,
        cellRenderer: ({rowData: row}) => (<p>{row.inventory?.catalogue?.name ?? '-'}</p>)
      },
      {
        key: 'responsible',
        title: 'Penanggung Jawab',
        dataKey: 'responsible.name',
        width: 250,
      },
      {
        key: 'maintenance_date',
        title: 'Tgl Maintenance',
        dataKey: 'maintenance_date',
        width: 250,
        sortable: true,
        cellRenderer: ({rowData: row}) => (<ElText>{row.maintenance_date == null ? '-' :formatLocalDate(row.maintenance_date)}</ElText>)
      },
      {
        key: 'duration',
        title: 'Durasi',
        dataKey: 'duration',
        width: 250,
        sortable: true,
        cellRenderer: ({rowData: row}) => (<ElText>{row.duration}</ElText>)
      },
      {
        key: 'priority',
        title: 'Prioritas',
        dataKey: 'priority',
        width: 250,
        sortable: true,
        cellRenderer: ({rowData: row}) => {
          if(row.priority == 'low'){
            return <el-tag type="primary">{(row.priority ?? '').toUpperCase()}</el-tag>
          }else if(row.priority == 'medium'){
            return <el-tag type="success">{(row.priority ?? '').toUpperCase()}</el-tag>
          }else if(row.priority == 'high'){
            return <el-tag type="danger">{(row.priority ?? '').toUpperCase()}</el-tag>
          }else {
            return <el-tag type="primary">{(row.priority ?? '').toUpperCase()}</el-tag>
          }
        }
      },
      {
        key: 'start_date',
        title: 'Tgl Mulai',
        width: 250,
        cellRenderer: ({rowData: row}) => (<ElText>{row.start_date == null ? '-' :formatLocalDate(row.start_date)}</ElText>)
      },
      {
        key: 'end_date',
        title: 'Tgl Selesai',
        width: 250,
        cellRenderer: ({rowData: row}) => (<ElText>{row.end_date == null ? '-' : formatLocalDate(row.end_date)}</ElText>)
      },
      
      {
        key: 'is_repeate',
        title: 'Rutin',
        width: 250,
        cellRenderer: ({rowData: row}) => (
          row.is_repeate ? <el-icon><CircleCheckFilled /></el-icon> : <el-icon><CircleClose /></el-icon>
        )
      },
      {
        key: 'type',
        title: 'Type Maintenance',
        width: 250,
        cellRenderer: ({rowData: row}) => (
          row.type == 'corrective' ? 
          <ElTag type="info">{(row.type ?? '').toUpperCase()}</ElTag> : 
          <ElTag type="warning">{(row.type ?? '').toUpperCase()}</ElTag>
        ),
        headerCellRenderer: () => (<div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Maintenance</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <el-checkbox-group v-model={filters.value}>
                    <el-checkbox value="corrective" name="filters">
                      Corrective
                    </el-checkbox>
                    <el-checkbox value="preventive" name="filters">
                      Preventive
                    </el-checkbox>
                </el-checkbox-group>
                <div class="el-table-v2__demo-filter">
                  <ElButton text onClick={onFilter}>
                    Confirm
                  </ElButton>
                  <ElButton text onClick={onReset}>
                    Reset
                  </ElButton>
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
    key: "status",
    title: "Status",
    dataKey: "status",
    width: 150,
    cellRenderer: ({ rowData: row }) =>
      row.status == "waiting" ? (
        <ElTag type="info">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "approve" ? (
        <ElTag type="primary">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "repair" ? (
        <ElTag type="warning">{row.status.toUpperCase()}</ElTag>
      ) : row.status == "cancel" ? (
        <ElTag type="danger">{row.status.toUpperCase()}</ElTag>
      ) : (
        <ElTag type="success">{row.status.toUpperCase()}</ElTag>
      ),
    headerCellRenderer: () => (
      <div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <el-checkbox-group v-model={filters.value}>
                  <el-checkbox value="waiting" name="filters">
                    Waiting
                  </el-checkbox>
                  <el-checkbox value="approve" name="filters">
                    Approve
                  </el-checkbox>
                  <el-checkbox value="repair" name="filters">
                    Repair
                  </el-checkbox>
                  <el-checkbox value="cancell" name="filters">
                    Cancell
                  </el-checkbox>
                  <el-checkbox value="done" name="filters">
                    Done
                  </el-checkbox>
                </el-checkbox-group>
                  <div class="el-table-v2__demo-filter">
                    <ElButton text onClick={onFilter}>
                      Confirm
                    </ElButton>
                    <ElButton text onClick={onReset}>
                      Reset
                    </ElButton>
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
        </div>)
  },
  {
    key: 'operations',
    title: 'Operations',
    cellRenderer: ({rowData: row}) => (
      <>
        <ElButton size="small" onClick={() => onEdit(row)} >Edit</ElButton>
        <ElButton size="small" type='danger' onClick={() => onDelete(row)} >Hapus</ElButton>
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
  );
};

columnMaintenance.unshift({
  key: "selection",
  width: 50,
  align: "center",
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => (rowData.checked = value);
    return <SelectionCell value={rowData.checked} onChange={onChange} />;
  },
  headerCellRenderer: () => {
    const _data = unref(paginations);
    const onChange = (value: CheckboxValueType) =>
      (paginations.value = {
        currentPage: _data?.currentPage ?? 0,
        total_data: _data?.total_data ?? 0,
        total_page: _data?.total_data ?? 0,
        query: _data?.query?.map((row: any) => {
          row.checked = value;
          return row;
        })!,
      });
    const allSelected = _data?.query.every((row: any) => row.checked);
    const containsChecked = _data?.query.some((row: any) => row.checked);

      return (
        <SelectionCell
          value={allSelected ?? false}
          intermediate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })
  
  columnMaintenance[columnMaintenance.length - 1].headerCellRenderer = () => {
    return (<div class="flex items-center justify-center">
      <span class="mr-2 text-xs"></span>
      <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
        {{
          default: () => (
            <div class="filter-wrapper">
              <div class="filter-group flex flex-col">
                <ElCheckboxGroup v-model={column_selected.value}>
                  {
                    columnMaintenance
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
    </div>)
  }
 

const onFilter = () => {
  // popoverRef.value.hide()
  // if (shouldFilter.value) {
  //   data.value = generateData(columns, 100, 'filtered-')
  // } else {
  //   data.value = generateData(columns, 200)
  // }
  console.log(filters.value);
};

const onReset = () => {
  shouldFilter.value = false;
  onFilter();
};

const onDelete = async (value: MainInstance) => {
  console.log("deleted", value);
};
const onEdit = async (value: MainInstance) => {
  console.log("edited", value);
};

const fetchMaintenances = async () => {
  // refreshNuxtData('maintenances');
  fetchData();
};

const onSort = ({ key, order }: SortBy) => {
  sortState.value[key] = order;

  const sort: Pagination<Maintenance[]> = paginations.value!;
  sort.query.reverse();
  paginations.value = sort;
};

onMounted(() => {
  // fetchMaintenances();
});
</script>
<template>
  <TrumsWrapper>
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"><el-input v-model="search" size="large" placeholder="Type to search" /></el-col>
      <el-button size="large" @click="$router.push('maintenance/add')">New Maintenance</el-button>
      <el-button size="large" @click="fetchMaintenances" :loading-icon="Eleme" :loading="loading">Reload Data</el-button>
    </el-row>
    <CustomTable :columns="filteredColumn" :data="data?.data ?? []" :column-sort="onSort" :sort-state="sortState" />
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next" :total="paginations?.total_page" />
    </div>
  </TrumsWrapper>
</template>
