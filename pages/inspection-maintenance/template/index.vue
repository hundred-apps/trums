<template>
    <TrumsWrapper>
        <div class="w-auto">
            <el-row :gutter="20" class="mb-3">
                <el-col :span="6"><el-input v-model="request_search.keyword"  size="default" placeholder="Type to search" /></el-col>
                <NuxtLink href="/inspection-maintenance/template/add" class="el-button el-button--default">Buat Template</NuxtLink>
                <el-popconfirm
                
                
                  width="220"
                  :icon="InfoFilled"
                  icon-color="#626AEF"
                  title="Apakah Anda Yakin Ingin Menghapus Data ini?"
                  @cancel="() => {}"
                >
                <template #reference>
                    <el-button size="default" class="ml-3" type="danger">Delete</el-button>
                </template>
                <template #actions="{ confirm, cancel }">
                    <el-button size="small" @click="cancel">Batal</el-button>
                    <el-button
                    type="danger"
                    size="small"
                    @click="() => {}"
                    >
                    Hapus
                    </el-button>
                </template>
                </el-popconfirm>
            </el-row>
        </div>
        <customTable :height="500" :column-sort="onSort" :columns="availableColumn" :data="data?.data ?? []"   />
        <div class="flex justify-end mt-3">
            <el-pagination background layout="prev, pager, next" :total="data?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick" />
        </div>
    </TrumsWrapper>
</template>

<script setup lang="tsx">
  import { InfoFilled, SetUp } from '@element-plus/icons-vue'
import { ElButton, type CheckboxValueType, type Column, type SortBy } from 'element-plus';
  import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { TemplateChecklist } from '~/types/template_checklist';
import SelectionCell from '~/components/trums/table/SelectionCell.vue';
import type { ChecklistAttribute } from '~/types/checklist';
import type { ResponsePagination } from '~/types/response_pagination';
import { NuxtLink } from '#components';
import DeleteButton from '~/components/trums/DeleteButton.vue';
import customTable from '~/components/trums/table/customTable.vue';
import type { BaseResponse } from '~/types/response';

  definePageMeta({
      middleware: ["auth", "app"],
  });

  const popoverRef = ref();
  const loading = ref<boolean>(false);

  const request_search = ref<RequestSearch>({
    keyword: '',
    column: [
      {
        location_id: [],
        contact_id: [],
      }
    ],
    limit: "10",
    offset: "1",
    table: 'template_checklist',
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    }
  });

  const {data} = await useFetchApi<ResponsePagination<ChecklistAttribute[]>>(`/search`, 'template_checklist', 'post', request_search.value);

  const availableColumn: Column<TemplateChecklist>[] = [
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
        title: 'Nama', 
        dataKey: 'name',
        key: 'name',
        width: 300,
        sortable: true,
        cellRenderer: ({rowData: row}) => <NuxtLink to={`template/${row.unique_id}`} class={'text-blue-600'}>{row.name}</NuxtLink>
      },
      {
        title: 'Hour Meter', 
        dataKey: 'hour_meter',
        key: 'hour_meter',
        width: 200,
        
      },
      {
        title: 'Kilo Meter', 
        dataKey: 'kilo_meter',
        key: 'kilo_meter',
        width: 200,
      },
      {
        title: 'Dibuat Tgl', 
        dataKey: 'created_at',
        key: 'created_at',
        width: 200,
        cellRenderer: ({rowData: row}) => <p>{formatLocalDate(row.created_at)}</p>
      },
      {
        title: 'Diubah Tgl', 
        dataKey: 'updated_at',
        key: 'updated_at',
        width: 200,
        cellRenderer: ({rowData: row}) => <p>{formatLocalDate(row.updated_at)}</p>
      },
      {
        title: 'Dibuat Oleh', 
        dataKey: 'people.name',
        key: 'people.name',
        width: 200,
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
            <DeleteButton onConfirm={() => handleDelete([row.unique_id])} onCancel={() => {}} />
            
          </>
        ),
      },
  ];

  const handleEdit = (data: TemplateChecklist) => {
    const template_id = useCookie('template_id');
    template_id.value = data.unique_id;
    window.location.href = 'template/add';
  }

  const handleDelete = async (ids: string[]) => {
    loading.value = true;
    try {
      const response = await useFetchApi<BaseResponse<any>>('/template-checklist-delete', 'delete-checklist', 'post', ids);
        if(response.status.value == 'success'){
          await refreshNuxtData('template_checklist');
        }
    } catch (error: any) {
      ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
      loading.value = false;
    }
  }

  const paginationClick = (val: number) => {
      const data:RequestSearch = {...request_search.value};
      data.offset = val.toString();
      request_search.value = data;
  }

  const onSort = async (sortBy: SortBy) => {
      console.log('sort', sortBy.key);
      console.log(request_search.value);
      const data:RequestSearch = {...request_search.value};
      data.sort = {
          column: sortBy.key.toString(),
          order: request_search.value.sort?.order == OrderColumn.ASC ? OrderColumn.DESC : OrderColumn.ASC
      };
      request_search.value = data;


  }
</script>