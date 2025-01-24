<script lang="ts" setup>
  definePageMeta({
    middleware: ["auth", "app"],
  });
  import { ref, onMounted } from 'vue';
  import { InfoFilled } from '@element-plus/icons-vue'
  import type { Inquiry } from '~/types/inquiry';

  const inquiries = ref<Inquiry[]>([]);
  const tmpInquiries = ref<Inquiry[]>([]);
  const dialogConfirmDelete = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const search = ref('')


  const filterTableData = computed(() =>
    inquiries.value.filter(
      (data) =>
        !search.value ||
        data.unique_code?.toLowerCase().includes(search.value.toLowerCase()) ||
        data.unique_id?.toLowerCase().includes(search.value.toLowerCase()) ||
        data.status?.toLowerCase().includes(search.value.toLowerCase()) ||
        data.priority?.toLowerCase().includes(search.value.toLowerCase()) ||
        data.reference?.toLowerCase().includes(search.value.toLowerCase()) ||
        data.reference_id?.toLowerCase().includes(search.value.toLowerCase()) ||
        formatLocalDate(data.date!).includes(search.value.toLowerCase())
    )
  )


  const columns = [
    {
      label: 'Unique Code', 
      prop: 'unique_code',
      sortable: true,
    },
    {
      label: 'Tanggal', 
      prop: 'date',
      sortable: true,
    },
    {
      label: 'Reference Type', 
      prop: 'reference'
    },
    {
      label: 'Reference', 
      prop: 'reference_view'
    },
    {
      label: 'Priority', 
      prop: 'priority',
      filters: [
        { text: 'Hight', value: 'hight' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
      filterMethod: (value: string, row: Inquiry) => filterPriority(value, row),
      filterPlacement:"bottom-end",
      
    },
    {
      label: 'Status', 
      prop: 'status'
    },
    
  ]

  const filterPriority = (value: string, row: Inquiry) => {
    return row.priority === value
  }

  const handleEdit = (row: any) => {
    console.log("Editing:", row);
  };

  const handleDelete = (row: any) => {
    console.log("Deleting:", row);
  };

  const handleSelectionChange = (selection: Inquiry[]) => {
    tmpInquiries.value = selection;
  };

  const fetchData = async () => {
    inquiries.value = [
      {
        unique_id: '1',
        unique_code: '0001',
        date: 1737542689,
        reference: 'internal',
        reference_id: '001',
        reference_view: 'Faizal',
        status: 'draft',
        priority: 'medium',
        description: null,
      },
      {
        unique_id: '1',
        unique_code: '0002',
        date: 1737542689,
        reference: 'repair',
        reference_id: '002',
        reference_view: 'MAIN#001',
        status: 'draft',
        priority: 'hight',
        description: null,
      },
      {
        unique_id: '1',
        unique_code: '0003',
        date: 1737542689,
        reference: 'sales',
        reference_id: '003',
        reference_view: 'SALES#001',
        status: 'draft',
        priority: 'low',
        description: null,
      }
    ]
  }


  const deleteBulk = async () => {
    console.log('data deleted : ', tmpInquiries.value);
    tmpInquiries.value = [];
    dialogConfirmDelete.value = false;
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
    <el-button size="large" @click="$router.push('inqueiries/add')">Buat Inquiri</el-button>
    <el-button v-if="tmpInquiries.length > 0" @click="dialogConfirmDelete = true" size="large" type="danger">Hapus</el-button>
  </el-row>
  <el-table class="w-screen" @selection-change="handleSelectionChange" :lazy="true" :loading="loading" :data="filterTableData">
      <el-table-column type="selection" width="55"  />
      <el-table-column 
        v-for="col in columns" 
        :key="col.prop || col.label" 
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
        :filters="col.filters"
        :filter-method="col.filterMethod"
        :filter-placement="col.filterPlacement"
        
        >
        <template #default="scope" v-if="col.prop == 'priority'">
          <el-tag
            :type="scope.row.priority === 'low' ? 'danger' : scope.row.priority === 'medium' ? 'warning' : 'primary'"
            disable-transitions
            >{{ scope.row.priority.toUpperCase() }}</el-tag
          >
        </template>
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


