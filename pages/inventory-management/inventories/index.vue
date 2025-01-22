<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import type { Catalogue } from '~/types/catalogue';
  import { type Inventory } from '~/types/inventory';
  import { InfoFilled } from '@element-plus/icons-vue'

  const inventories = ref<Inventory[]>([]);
  const loading = ref<boolean>(false);
  const search = ref('')


  const filterTableData = computed(() =>
    inventories.value.filter(
      (data) =>
        !search.value ||
        data.unique_code.toLowerCase().includes(search.value.toLowerCase()) ||
        data.unique_id.toLowerCase().includes(search.value.toLowerCase()) ||
        data.catalogue.name?.toLowerCase().includes(search.value.toLowerCase())
    )
  )


  const columns = [
    {
      label: 'Unique Code', 
      prop: 'unique_code',
      sortable: true,
    },
    {
      label: 'Item', 
      prop: 'catalogue.name'
    },
    {
      label: 'Location', 
      prop: 'location'
    },
    {
      label: 'Quantity', 
      prop: 'quantity'
    },
    {
      label: 'Traceable', 
      prop: 'is_traceable'
    },
    
  ]

  const handleEdit = (row: any) => {
    console.log("Editing:", row);
  };

  const handleDelete = (row: any) => {
    console.log("Deleting:", row);
  };

  const handleSelectionChange = (selection: any[]) => {
    console.log("Selected Rows:", selection);
  };

  const fetchData = async () => {
    const catalogue: Catalogue = {
            id: 1,
            unique_id: '1',
            unique_code: '001111',
            name: 'Macbook pro 2017',
            brand_id:null,
            year: null,
            sn: null,
            description: null,
            berat:null,
            volume:null,
            is_asset: null,
            version: null
    }

    inventories.value = [
      {
        id: 1,
        catalogue: catalogue,
        unique_id: '1',
        unique_code: '001',
        catalogue_id: '1',
        location_id: 1,
        is_traceable: 1,
        sn: 'KDN12134124',
        unit_id: 1,
        unit_name: 'unit',
        quantity: 1,
        cost: 20.000000,
      },
      {
        id: 1,
        catalogue: catalogue,
        unique_id: '1',
        unique_code: '002',
        catalogue_id: '1',
        location_id: 1,
        is_traceable: 1,
        sn: 'KDN12134124',
        unit_id: 1,
        unit_name: 'unit',
        quantity: 1,
        cost: 20.000000,
      }
    ]
  }


  onMounted(() => {
    
    loading.value = true;
    setTimeout(() => {
      fetchData();
      loading.value = false;
    }, 2000);
  })
  

</script>
<template>
  <el-row :gutter="20" class="mb-3">
    <el-col :span="6"><el-input v-model="search" size="large" placeholder="Type to search" /></el-col>
    <el-button size="large" @click="$router.push('inventories/add')">Contact</el-button>
  </el-row>
  <el-table class="w-screen" @selection-change="handleSelectionChange" :lazy="true" :loading="loading" :data="filterTableData">
      <el-table-column type="selection" width="55"  />
      <el-table-column 
        v-for="col in columns" 
        :key="col.prop || col.label" 
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
        >
      </el-table-column>
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            Edit
          </el-button>
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @confirm="handleDelete(scope.row)"
            @cancel="() => {}"
          >
            <template #reference>
              <el-button size="small" type="danger">Delete</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
  </el-table>
</template>


