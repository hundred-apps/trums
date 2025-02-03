<script lang="tsx" setup>

  definePageMeta({
    middleware: ['auth', 'app'],
    name: 'Purchase Request'
  })

  import { ElButton, ElCheckbox, ElIcon, ElPopover, ElTag, ElText, type CheckboxValueType, type Column } from 'element-plus';
  import { ref, onMounted, type FunctionalComponent } from 'vue';
  import type { Pagination } from '~/types/pagination';
  import type { PurchaseRequest } from '~/types/purchase_request';
  import type { SelectionCellProps } from '~/types/selection_cell_prop';
  import { CircleCheckFilled, CircleClose, Eleme, Filter } from '@element-plus/icons-vue';
  import CustomTable from '~/components/trums/table/customTable.vue';

  const request = ref<Pagination<PurchaseRequest[]>>();
  const search = ref('');
  const filterPriority = ref<[]>([])
  const popoverRef = ref()
  const dataPerPage = ref(10);

  const columnRequest: Column<any>[] = [
    {
      key: 'unique_code',
      title: 'Unique Code',
      dataKey: 'unique_code',
      width: 250,
    },
    {
      key: 'order_deadline',
      title: 'Order Deadline',
      dataKey: 'order_deadline',
      width: 250,
      cellRenderer: ({rowData: row}) => (<ElText>{row.order_deadline == null ? '-' :formatLocalDate(row.order_deadline)}</ElText>)
    },
    {
      key: 'priority',
      title: 'Piroritas',
      dataKey: 'priority',
      width: 250,
      cellRenderer: ({rowData: row}) => (
          
          row.priority == 'low' ? 
          <ElTag type="info">{row.priority.toUpperCase()}</ElTag> : 
          row.priority == 'medium' ? 
          <ElTag type="warning">{row.priority.toUpperCase()}</ElTag> : 
          row.status == 'hight' ?
          <ElTag type="danger">{row.priority.toUpperCase()}</ElTag> :
          <ElTag type="primary">{row.status.toUpperCase()}</ElTag>

        ),
      headerCellRenderer: () => (<div class="flex items-center justify-center">
        <span class="mr-2 text-xs">Status</span>
        <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
          {{
            default: () => (
              <div class="filter-wrapper">
                <el-checkbox-group v-model={filterPriority.value}>
                  <el-checkbox value="low" name="filterPriority">
                    Low
                  </el-checkbox>
                  <el-checkbox value="medium" name="filterPriority">
                    Medium
                  </el-checkbox>
                  <el-checkbox value="hight" name="filterPriority">
                    Hight
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
      key: 'source_document',
      title: 'Sumber Document Lain',
      dataKey: 'source_document',
      width: 250,
      sortable: true,
      
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

  columnRequest.unshift({
    key: 'selection',
    width: 5,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },
    headerCellRenderer: () => {
      const _data = unref(request);
      const onChange = (value: CheckboxValueType) =>
        (request.value = {currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, query: _data?.query?.map((row: any) => {
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
    console.log(filterPriority.value);
  }

  const onReset = () => {
    
    onFilter()
  }

  const onDelete = async (value: PurchaseRequest) => {
    console.log('deleted',value);
  }  
  const onEdit = async (value: PurchaseRequest) => {
    console.log('edited',value);
  }  



  onMounted(() => {

  })


</script>
<template>
  <div class="w-auto">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"><el-input v-model="search" size="large" placeholder="Type to search" /></el-col>
      <el-button size="large" @click="$router.push('request/add')">New Request</el-button>
    </el-row>
    <CustomTable :columns="columnRequest" :data="request?.query ?? []" />
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next" :total="request?.total_page" />
    </div>
  </div>
</template>
