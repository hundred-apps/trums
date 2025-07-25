<script setup lang="tsx">
  import { NuxtLink, TrumsWrapper } from '#components';
  import { InfoFilled, SetUp } from '@element-plus/icons-vue'
import { ElButton, ElCheckbox, ElPopconfirm, type CheckboxValueType, type Column, type SortBy } from 'element-plus';
import type { FunctionalComponent } from 'vue';
import type { Quotation } from '~/types/quotation';
  import { OrderColumn, type RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';
import CustomTable from '~/components/trums/table/customTable.vue';
  definePageMeta({
      middleware: ["auth", "app"],
  });

  const router = useRouter();
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
    table: 'offers',
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    }
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await useFetchApi<ResponsePagination<Quotation[]>>(`/search`, 'offers', 'post', request_search.value);

  
      if(response.status.value == 'success'){
        data.value = response.data.value as ResponsePagination<Quotation[]>;
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message ?? error);
      return [];
    } finally {
      loading.value = false;
    }
    
  }

  const {data} = await useFetchApi<ResponsePagination<Quotation[]>>(`/search`, 'offers', 'post', request_search.value);
  watch(request_search, fetchData, {immediate: true});

  const availableColumn: Column<Quotation>[] = [
    {
      title: 'No',
      key: 'no',
      dataKey: 'no',
      width: 80,
      cellRenderer: ({ rowIndex }) => (
        <span>{rowIndex + 1}</span>
      )
    },
    {
      title: 'Kontak',
      key: 'contact.name',
      dataKey: 'contact.name',
      width: 80,
      cellRenderer: ({rowData: row}) => (
        <span>{row.contact?.name ?? '-'}</span>
      )
    },
    {
      title: 'Nomor Referensi',
      key: 'sourcing_number',
      dataKey: 'sourcing_number',
      width: 150,
    },
    {
      title: 'Tanggal Berlaku',
      key: 'date',
      dataKey: 'date',
      width: 150,
      sortable: true,
      cellRenderer: ({rowData: row}) => (
        <span>{formatLocalDate(row.date)}</span>
      )
    },
    {
      title: 'Dibuat Tanggal',
      key: 'created_at',
      dataKey: 'created_at',
      width: 150,
      sortable: true,
      cellRenderer: ({rowData: row}) => (
        <span>{formatLocalDate(row.created_at)}</span>
      )
    },
    {
      title: 'Terakhir diubah',
      key: 'updated_at',
      dataKey: 'updated_at',
      width: 150,
      sortable: true,
      cellRenderer: ({rowData: row}) => (
        <span>{formatLocalDate(row.updated_at)}</span>
      )
    },
    {
      title: 'Dibuat Oleh',
      key: 'created_by',
      dataKey: 'created_by',
      width: 150,
      
    },
    {
      title: 'Operasi',
      key: 'operasi',
      width: 250,
      cellRenderer: ({rowData: row}) => (
        <>
          
          <NuxtLink href={`/sales/pricelist/${row.unique_id}`} class="el-button el-button--small">Detail</NuxtLink>
          <ElButton size="small" onClick={() => handleEdit(row)}>
            Edit
          </ElButton>
          <ElPopconfirm
            title="Yakin ingin menghapus?"
            confirmButtonText="Ya"
            cancelButtonText="Tidak"
            onConfirm={() => handleDelete([row.unique_id])}
          >
            {{
              reference: () => (
                <ElButton size="small" type="danger">
                  Delete
                </ElButton>
              ),
            }}
          </ElPopconfirm>
          {/* <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton> */}
          
        </>
      ),
    },
  ];

  const handleEdit = (data: Quotation) => {
    
  }
  const handleDelete = (data: string[]) => {

  }

  type SelectionCellProps = {
    value: boolean
    intermediate?: boolean
    onChange: (value: CheckboxValueType) => void
  }

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

  availableColumn.unshift({
    key: 'selection',
    width: 50,
    cellRenderer: ({ rowData }) => {
      const onChange = (value: CheckboxValueType) => (rowData.checked = value)
      return <SelectionCell value={rowData.checked} onChange={onChange} />
    },

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
          value={allSelected}
          intermediate={containsChecked && !allSelected}
          onChange={onChange}
        />
      )
    },
  })

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

  const paginationClick = (val: number) => {
    const data:RequestSearch = {...request_search.value};
    data.offset = val.toString();
    request_search.value = data;

  }
</script>

<template>
    <TrumsWrapper>
      <div class="w-auto">
      <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="request_search.keyword"  size="default" placeholder="Type to search" /></el-col>
        <NuxtLink href="/sales/quotation/add" class="el-button el-button--default">Buat Penawaran</NuxtLink>
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
      <CustomTable :column-sort="onSort" :columns="availableColumn" :data="data?.data ?? []"  />
      <div class="flex justify-end mt-3">
        <el-pagination background layout="prev, pager, next" :total="data?.total_data" @next-click="paginationClick" @prev-click="paginationClick" @change="paginationClick" />
      </div>
    </div>
    </TrumsWrapper>
</template>