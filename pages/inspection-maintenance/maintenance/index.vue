<script lang="tsx" setup>
  import { ref, onMounted, type FunctionalComponent } from 'vue';
  import { type Column, type CheckboxValueType, type InputInstance, type MainInstance, ElButton, ElTag, ElText, ElCheckbox, paginationEmits, type SortBy, TableV2SortOrder, type SortState, ElPopover, type HeaderCellSlotProps, ElIcon } from 'element-plus';
  import type { Maintenance } from '~/types/maintenance';
  import type { Pagination } from '~/types/pagination';
  import { CircleCheckFilled, CircleClose, Eleme, Filter } from '@element-plus/icons-vue'
  import CustomTable from '~/components/trums/table/customTable.vue';
import type { SelectionCellProps } from '~/types/selection_cell_prop';
  definePageMeta({
        middleware: ["auth", "app"],
  });

  const sortState = ref<SortState>({
    'maintenance_date': TableV2SortOrder.DESC,
  })
  const paginations = ref<Pagination<Maintenance[]>>();
  const maintenanceSelect = ref<Maintenance[]>([]);
  const loading = ref<boolean>(false);
  const search = ref('');
  
  const shouldFilter = ref(false)
  const filters = ref<[]>([])
  const filterMaintenanceType = ref<[]>([])
  const popoverRef = ref()
  const dataPerPage = ref(10);

  const axios = useApi();

  const columnMaintenance: Column<any>[] = [
    
      {
        key: 'unique_code',
        title: 'Unique Code',
        dataKey: 'unique_code',
        width: 250,
      },
      {
        key: 'catalogue',
        title: 'Item',
        dataKey: 'catalogue.name',
        width: 250,
      },
      {
        key: 'responsible',
        title: 'PIC',
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
        title: 'Tgl Mulai',
        width: 250,
        cellRenderer: ({rowData: row}) => (<ElText>{row.start_date == null ? '-' :formatLocalDate(row.start_date)}</ElText>)
      },
      {
        title: 'Tgl Selesai',
        width: 250,
        cellRenderer: ({rowData: row}) => (<ElText>{row.end_date == null ? '-' : formatLocalDate(row.end_date)}</ElText>)
      },
      
      {
        title: 'Rutin',
        width: 250,
        cellRenderer: ({rowData: row}) => (
          row.is_repeate ? <el-icon><CircleCheckFilled /></el-icon> : <el-icon><CircleClose /></el-icon>
        )
      },
      {
        title: 'Maintenance',
        width: 250,
        cellRenderer: ({rowData: row}) => (
          row.type == 'corrective' ? 
          <ElTag type="info">{row.type.toUpperCase()}</ElTag> : 
          <ElTag type="warning">{row.type.toUpperCase()}</ElTag>
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
        </div>)
      },
      {
        key: 'status',
        title: 'Status',
        dataKey: 'status',
        width: 150,
        cellRenderer: ({rowData: row}) => (
          
          row.status == 'waiting' ? 
          <ElTag type="info">{row.status.toUpperCase()}</ElTag> : 
          row.status == 'approve' ? 
          <ElTag type="primary">{row.status.toUpperCase()}</ElTag> : 
          row.status == 'repair' ?
          <ElTag type="warning">{row.status.toUpperCase()}</ElTag> :
          row.status == 'cancel' ?
          <ElTag type="danger">{row.status.toUpperCase()}</ElTag> :
          <ElTag type="success">{row.status.toUpperCase()}</ElTag>
          

        ),
        headerCellRenderer: () => (<div class="flex items-center justify-center">
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
      )
  }

  columnMaintenance.unshift({
    key: 'selection',
    width: 50,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },
    headerCellRenderer: () => {
      const _data = unref(paginations);
      const onChange = (value: CheckboxValueType) =>
        (paginations.value = {currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, query: _data?.query?.map((row: any) => {
          row.checked = value
          return row
        })!})
      const allSelected = _data?.query.every((row: any) => row.checked)
      const containsChecked = _data?.query.some((row: any) => row.checked)

      return (
        <SelectionCell
          value={allSelected ?? false}
          intermediate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })
  

 

  const onFilter = () => {
    // popoverRef.value.hide()
    // if (shouldFilter.value) {
    //   data.value = generateData(columns, 100, 'filtered-')
    // } else {
    //   data.value = generateData(columns, 200)
    // }
    console.log(filters.value);
  }

  const onReset = () => {
    shouldFilter.value = false
    onFilter()
  }

  const onDelete = async (value: MainInstance) => {
    console.log('deleted',value);
  }  
  const onEdit = async (value: MainInstance) => {
    console.log('edited',value);
  }  

  const fetchMaintenances = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/maintenances-read');
      if(response.status == 200){
        paginations.value = response.data.data;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message}`);
    } finally {
      loading.value = false;
    }
  }

  const onSort = ({ key, order }: SortBy) => {
    sortState.value[key] = order

    const sort: Pagination<Maintenance[]> = paginations.value!;
    sort.query.reverse();
    paginations.value = sort;
  }


  onMounted(() => {
    fetchMaintenances();
  })



</script>
<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6"><el-input v-model="search" size="large" placeholder="Type to search" /></el-col>
    <el-button size="large" @click="$router.push('maintenance/add')">New Maintenance</el-button>
    <el-button size="large" @click="fetchMaintenances" :loading-icon="Eleme" :loading="loading">Reload Data</el-button>
  </el-row>
  <CustomTable :columns="columnMaintenance" :data="paginations?.query ?? []" :column-sort="onSort" :sort-state="sortState" />
  <div class="flex justify-end mt-3">
    <el-pagination background layout="prev, pager, next" :total="paginations?.total_page" />
  </div>
</template>

