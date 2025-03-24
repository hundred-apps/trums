<script lang="tsx" setup>
  definePageMeta({
    middleware: ["auth", "app"],
  });
  import { ref, onMounted } from 'vue';
  import { Filter, SetUp } from '@element-plus/icons-vue'
  import type { Inquiry } from '~/types/inquiry';
  import customTable from '~/components/trums/table/customTable.vue';
  import { OrderColumn, type RequestSearch } from '~/types/request_search';
  import type { ResponsePagination } from '~/types/response_pagination';
  import { ElButton, ElCheckbox, ElIcon, ElPopover, ElTag, TableV2FixedDir, type CheckboxValueType, type Column, type MainInstance, type SortBy } from 'element-plus';
  import type { Contact } from '~/types/contact';
  import type { Maintenance } from '~/types/maintenance';
  import type { CellRendererParams } from 'element-plus/es/components/table-v2/src/types.mjs';
  import SelectionCell from '~/components/trums/table/SelectionCell.vue';
  import DeleteButton from '~/components/trums/DeleteButton.vue';
import { NuxtLink } from '#components';
const column_selected = ref<string[]>(['selection', 'unique_code', 'date', 'reference', 'reference_view', 'setup']);
  const popoverRef = ref();
  const config = useRuntimeConfig();

  const axios = useApi();

  const request_search = ref<RequestSearch>({
    keyword: '',
    column: [
      {
        reference: [],
        priority: [],
        status: [],
      }
    ],
    limit: "10",
    offset: "1",
    table: 'inquiries',
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    }
  });

  const {data} = await useFetchApi<ResponsePagination<Inquiry[]>>(`/search`, 'inventories', 'post', request_search.value);
  const tmpInquiries = ref<Inquiry[]>([]);
  const dialogConfirmDelete = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const search = ref('')

  const availableColumn: Column<Inquiry>[] = [
    {
      title: '', 
      dataKey: '',
      key: 'selection',
      width: 50,
      cellRenderer: ({ rowData }) => {
        const onChange = (value: CheckboxValueType) => (rowData.checked = value)
        return <SelectionCell value={rowData.checked} onChange={onChange} />
      },
      maxWidth: 50,

      headerCellRenderer: () => {
        const _data = unref(data)
        const onChange = (value: CheckboxValueType) =>
          (data.value = {success: true, currentPage: _data?.currentPage ?? 0, total_data: _data?.total_data ?? 0, total_page: _data?.total_data ?? 0, data: _data?.data?.map((row: any) => {
            row.checked = value
            return row
          })!})
        const allSelected = _data!.data.every((row) => row.checked)
        const containsChecked = _data?.data.some((row) => row.checked)

        return (
          <SelectionCell
          style={{width: 50}}
            value={allSelected}
            interminate={(containsChecked && !allSelected)}
            onChange={onChange}
          />
        )
      },
    },
    {
      title: 'Unique Code', 
      dataKey: 'unique_code',
      key: 'unique_code',
      width: 200,
      cellRenderer: ({rowData: row}) => <NuxtLink href={`inqueiries/${row.unique_id}`} class={'text-blue-600'}>{row.unique_code}</NuxtLink>
    },
    {
      title: 'Tanggal', 
      dataKey: 'date',
      key: 'date',
      width: 200,
      sortable: true,
      cellRenderer: ({rowData: row}) => <p>{row.date == null ? '-' : formatLocalDate(row.date)}</p>
    },
    {
      title: 'Reference Type', 
      dataKey: 'reference',
      key: 'reference',
      width: 200,
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Reference Type</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <ElCheckbox value={'internal'} v-model={request_search.value.column[0].reference}>
                      Internal
                    </ElCheckbox>
                    <ElCheckbox value={'repair'} v-model={request_search.value.column[0].reference}>
                      Repair
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
      title: 'Reference', 
      dataKey: 'reference_view',
      key: 'reference_view',
      width: 200,
      cellRenderer: ({rowData: row}) => getReference(row)
    },
    {
      title: 'Priority', 
      dataKey: 'priority',
      key: 'priority',
      width: 200,
      cellRenderer: ({rowData: row}) => (
        row.priority == 'low' ? 
        <ElTag type="info">{'Low'}</ElTag> : 
        row.priority == 'medium' ? 
        <ElTag type="warning">{'Medium'}</ElTag> : 
        <ElTag type="danger">{'Hight'}</ElTag>
      ),
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Priority</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <ElCheckbox value={'low'} v-model={request_search.value.column[0].priority}>
                      Low
                    </ElCheckbox>
                    <ElCheckbox value={'medium'} v-model={request_search.value.column[0].priority}>
                      Medium
                    </ElCheckbox>
                    <ElCheckbox value={'height'} v-model={request_search.value.column[0].priority}>
                      Height
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
      title: 'Status', 
      dataKey: 'status',
      key: 'status',
      width: 200,
      
      cellRenderer: ({rowData: row}: CellRendererParams<Inquiry>) => getStatus(row),
      headerCellRenderer: () => (
        <div class="flex items-center justify-center">
          <span class="mr-2 text-xs">Reference Type</span>
          <ElPopover ref={popoverRef} trigger="click" {...{ width: 200 }}>
            {{
              default: () => (
                <div class="filter-wrapper">
                  <div class="filter-group flex flex-col">
                    <ElCheckbox value={'draft'} v-model={request_search.value.column[0].status}>
                      Draft
                    </ElCheckbox>
                    <ElCheckbox value={'waiting'} v-model={request_search.value.column[0].status}>
                      Waiting
                    </ElCheckbox>
                    <ElCheckbox value={'approve'} v-model={request_search.value.column[0].status}>
                      Approve
                    </ElCheckbox>
                    <ElCheckbox value={'done'} v-model={request_search.value.column[0].status}>
                      Done
                    </ElCheckbox>
                    <ElCheckbox value={'cancelled'} v-model={request_search.value.column[0].status}>
                      Cancelled
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
      title: 'Operasi',
      key: '',
      width: 250,
      cellRenderer: ({rowData: row}) => (
        <>
          <ElButton size="small" onClick={() => handleEdit(row)}>
            Edit
          </ElButton>
          <DeleteButton  onConfirm={() => handleDelete(row)} onCancel={() => {}} />
          
        </>
      ),
    },
    {
      title: '',
      key: 'setup',
      width: 50,
      fixed: TableV2FixedDir.RIGHT,
      
    }
  ]

  availableColumn[7].headerCellRenderer = () => {
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

  const getReference = (data: Inquiry) => {
    if(data.reference == 'internal'){
      const contact: Contact|null = data.reference_data as Contact;
      return (
        <div>{contact?.name}</div>
      );
    }else{
      const maintenance: Maintenance|null = data.reference_data as Maintenance;
      return (
        <div>{maintenance?.unique_code}</div>
      );
    }
  }
  const getStatus = (data: Inquiry) => {
    // 'draft','waiting','approve','done','cancelled','repair'
    
    if(data.status == 'draft'){
      return (
        <ElTag type='info'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }else if(data.status == 'waiting'){
      return (
        <ElTag type='warning'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }else if(data.status == 'approve'){
      return (
        <ElTag type='success'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }else if(data.status == 'done'){
      return (
        <ElTag type='primary'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }else if(data.status == 'cancelled'){
      return (
        <ElTag type='danger'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }else{
      return (
        <ElTag type='info'>{(data?.status ?? '').toUpperCase()}</ElTag>
      );
    }

    
  }

  const filterPriority = (value: string, row: Inquiry) => {
    return row.priority === value
  }

  const handleEdit = (row: any) => {
    console.log("Editing:", row);
  };

  const handleDelete = (row: Inquiry) => {
    handleSubmitDelete([row.unique_id!]);
  };

  const handleSubmitDelete = async (values: string[]) => {
    try {
      const response = await useFetchApi('/inquiries-delete', "delete_data", 'delete', values)
      if(response.status.value == 'success'){
        await refreshNuxtData('inventories');
      }
    } catch (error: any) {
      ElMessage.error(`${error?.response?.data?.message ?? error}`);
    }
  }

  const handleSelectionChange = (selection: Inquiry[]) => {
    tmpInquiries.value = selection;
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Inquiry[]>>(`/search`, 'inventories', 'post', request_search.value);

  
      if(response.status.value == 'success'){
        data.value = response.data.value as ResponsePagination<Inquiry[]>;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
      return [];
    } finally {
      loading.value = false;
    }
  }


  const deleteBulk = async () => {
    console.log('data deleted : ', tmpInquiries.value);
    tmpInquiries.value = [];
    dialogConfirmDelete.value = false;
  }

  const onSort = (sortBy: SortBy) => {
    console.log('sort', sortBy.key);
    console.log(request_search.value);
    const data:RequestSearch = {...request_search.value};
    data.sort = {
      column: sortBy.key.toString(),
      order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
    };
    request_search.value = data;

  }

  watch(request_search, fetchData, {immediate: true});

  onMounted(() => {
    fetchData();
  })
  

</script>
<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6"><el-input v-model="request_search.keyword" size="large" placeholder="Type to search" /></el-col>
    <el-button size="large" @click="$router.push('inqueiries/add')">Buat Inquiri</el-button>
    <el-button v-if="tmpInquiries.length > 0" @click="dialogConfirmDelete = true" size="large" type="danger">Hapus</el-button>
  </el-row>
  <customTable :column-sort="onSort" :columns="filteredColumn" :data="data?.data ?? []"  />
  <div class="flex justify-end mt-3">
    <el-pagination background layout="prev, pager, next" :total="data?.total_data" />
  </div>
  <el-dialog
    v-model="dialogConfirmDelete"
    title="Tips"
    width="500"
  >
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogConfirmDelete = false">Batal</el-button>
        <el-button type="primary" @click="deleteBulk">
          Hapus
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


