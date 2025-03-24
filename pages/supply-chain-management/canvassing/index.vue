<script lang="tsx" setup>
import { dataCanvasingExample, type Canvassing } from '~/types/canvassing';
import type { ResponsePagination } from '~/types/response_pagination';
import { ElButton, ElCheckbox, ElIcon, ElPopover, ElTag, ElText, type CheckboxValueType, type Column } from 'element-plus';
import { OrderColumn, type RequestSearch } from '~/types/request_search';
import CustomTable from '~/components/trums/table/customTable.vue';
import type { FunctionalComponent } from 'vue';
import type { SelectionCellProps } from '~/types/selection_cell_prop';
import { NuxtLink } from '#components';

  definePageMeta({
    middleware: ['auth', 'app']
  })

  const request_search = ref<RequestSearch>({
    keyword: '',
    column: null,
    limit: "10",
    offset: "1",
    table: 'inventories',
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    }
  });

  const dataCanvassing = ref<ResponsePagination<Canvassing[]>>({
    currentPage: 1,
    data: dataCanvasingExample,
    success: true,
    total_data: 1,
    total_page: 1,
  });


  const columns: Column<Canvassing>[] = [
    {
      title: "Unique Code",
      key: 'unique_code',
      width: 150,
      dataKey: 'unique_code',
      cellRenderer: ({rowData: row}) => (
        <NuxtLink href={`canvassing/detail/${row.unique_id}`}>{row.unique_code}</NuxtLink>
      )
    },
    {
      title: "Nomor Dokumen",
      key: 'source_document',
      width: 250,
      dataKey: 'source_document',
    },
    {
      title: "Description",
      key: 'description',
      width: 300,
      dataKey: 'description',
    },
    {
      title: "Status",
      key: 'status',
      width: 100,
      dataKey: 'status',
      cellRenderer: ({rowData: row}) => (
          
        row.status == 'draft' ? 
        <ElTag type="primary">{'Draft'}</ElTag> : 
        row.status == 'pending_approval' ? 
        <ElTag type="warning">{'Menunggu Approval'}</ElTag> : 
        row.status == 'cancel' ?
        <ElTag type="info">{'Dibatalkan'}</ElTag> :
        row.status == 'done' ?
        <ElTag type="success">{'Selesai'}</ElTag> :
        <ElTag type="primary">{row.status.toUpperCase()}</ElTag>

      ),
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

  columns.unshift({
    key: 'selection',
    width: 50,
    align: 'center',
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },
    headerCellRenderer: () => {
      const _data = unref(dataCanvassing);
      const onChange = (value: CheckboxValueType) =>
        (dataCanvassing.value = {success: true, currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, data: _data?.data?.map((row: any) => {
          row.checked = value
          return row
        })!})
      const allSelected = _data?.data.every((row: any) => row.checked)
      const containsChecked = _data?.data.some((row: any) => row.checked)

      return (
        <SelectionCell
          value={allSelected ?? false}
          intermediate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })


function onEdit(row: Canvassing): any {
  console.log('row', row)
}

function onDelete(row: Canvassing): any {
  console.log('row', row)
}
</script>



<template>
  <div class="w-auto">
    <el-row :gutter="20" class="mb-3">
      <el-col :span="6"><el-input v-model="request_search.keyword" size="large" placeholder="Type to search" /></el-col>
      <el-button size="large" @click="$router.push('canvassing/add')">New Canvassing</el-button>
    </el-row>
    <CustomTable :columns="columns" :data="dataCanvassing.data ?? []" />
    <div class="flex justify-end mt-3">
      <el-pagination background layout="prev, pager, next" :total="dataCanvassing?.total_page" />
    </div>
  </div>
</template>
