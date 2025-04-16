<template>
    <el-row :gutter="20" class="mb-3">
        <el-col :span="6"><el-input v-model="search" size="large" placeholder="Type to search" /></el-col>
        <el-button size="large" @click="() => handleAddNewLocation()">New Location</el-button>
    </el-row>
    <CustomTable :columns="columns" :data="data?.data ?? []" />
    <div class="flex justify-end">
      <el-pagination class="my-3" background layout="prev, pager, next" :total="data?.total_page" />
    </div>
    <el-dialog v-model="dialogFormVisible" title="Lokasi Baru" width="500">
        <el-form :model="form" :rules="rules">
          <el-form-item label="Nama" >
              <el-input v-model="form.name" :disabled="disable" autocomplete="off" />
          </el-form-item>
        </el-form>
        <template #footer>
        <div class="dialog-footer">
            <el-button @click="dialogFormVisible = false" :loading="disable" >Cancel</el-button>
            <el-button type="primary" @click="onSubmit" :loading="disable">
              Submit
            </el-button>
        </div>
        </template>
    </el-dialog>
</template>

<script lang="tsx" setup>

  
  import { ref, onMounted, type FunctionalComponent } from 'vue';
  import type { Catalogue } from '~/types/catalogue';
  import { InfoFilled } from '@element-plus/icons-vue'
  import { ElButton, ElCheckbox, type CheckboxValueType, type Column, type FormRules } from 'element-plus';
  import { useApi } from '#imports';
  import type { Pagination } from '~/types/pagination';
  import type { ResponsePagination } from '~/types/response_pagination';
  import { OrderColumn, type RequestSearch } from '~/types/request_search';
import CustomTable from '~/components/trums/table/customTable.vue';
import { column } from 'element-plus/es/components/table-v2/src/common.mjs';
import { NuxtLink } from '#components';

  const config = useRuntimeConfig()

  

  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await useFetch<ResponsePagination<Catalogue[]>>(`${config.public.baseURL}/search`, {
        key: 'catalogues',
        method: 'post',
        body: request_search.value,
      })

  
      if(response.status.value == 'success'){
        data.value = response.data.value;
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message ?? 'Gagal Mengambil Data!'}`);
      return [];
    } finally {
      loading.value = false;
    }
    
  }

  const request_search = ref<RequestSearch>({
    keyword: '',
    column: [{type: ["place"]}],
    limit: "10",
    offset: "1",
    table: 'catalogues',
    sort: {
      column: 'created_at',
      order: OrderColumn.ASC,
    }
  });

  const { data } = await useFetchApi<ResponsePagination<Catalogue[]>>(`/search`, 'catalogues', 'post', request_search.value);


  const loading = ref<boolean>(false);
  const disable = ref<boolean>(false);
  const search = ref('')
  const dialogFormVisible = ref(false)
  const formLabelWidth = '140px';

  const axios = useApi();

  interface formInterface {
    name: string,
    unique_id?: string,
  }

  const form = reactive<formInterface>({
    name: '',
  })

  const rules = reactive<FormRules>({
      name: [
          { required: true, message: 'Masukan Nama Lokasi', trigger: 'blur' },
      ],
  })

  const handleAddNewLocation = () => {
    dialogFormVisible.value = true;
    form.name = '';
    form.unique_id = undefined;
  }


  const columns: Column<Catalogue>[] = [
    {
      title: 'Unique Code', 
      key: 'unique_code',
      dataKey: 'unique_code',
      width: 250,
      cellRenderer: ({rowData: row}) => (
        <NuxtLink href={`location/${row.unique_id}`} class="text-blue-600">{row.unique_code}</NuxtLink>
      )
    },
    {
      title: 'Name', 
      key: 'name',
      dataKey: 'name',
      width: 250,
    },
    {
      title: 'Total Item', 
      key: 'quantity',
      dataKey: 'quantity',
      width: 250,
      cellRenderer: ({rowData: row}) => (
        <p>{row.inventories_location.length}</p>
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
          <ElButton size="small" type="danger" onClick={() => handleDelete(row)}>Delete</ElButton>
          
        </>
      ),
    }
  ]

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

  columns.unshift({
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

  const handleEdit = (row: Catalogue) => {
    form.unique_id = row.unique_id!;
    form.name = row.name!;
    dialogFormVisible.value = true;
  };

  const handleDelete = async (row: Catalogue) => {
    loading.value = false;
    try {
      
      const response = await useFetchApi<ResponsePagination<string[]>>(`/catalogues-delete`, 'catalogues', 'post', [row.unique_id]);
      if(response.status.value == "success"){
        await refreshNuxtData('catalogues');
      }
    } catch (error: any) {
      ElMessage.error(`${error.response?.data?.message}`);
    }finally{
      loading.value = false;
    }
  };

  const handleSelectionChange = (selection: any[]) => {
    console.log("Selected Rows:", selection);
  };

  

  const onSubmit = async () => {
    console.log(form);
    disable.value = true;
    try {
      const formData = new FormData();
      
      formData.append("name", form.name);
      formData.append("type", 'place');

      if(form.unique_id){
        formData.append("unique_id", form.unique_id);
      }

      const response = await axios.post('/catalogues-create', formData);
      if(response.status == 201){
        await refreshNuxtData('catalogues');
        dialogFormVisible.value = false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message);
    } finally {
      disable.value = false;
    }
  }


  // onMounted(() => {
    
  //   fetchData();
  // })
  

</script>