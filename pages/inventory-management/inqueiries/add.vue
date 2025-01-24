<script lang="tsx" setup>
  definePageMeta({
    middleware: ["auth", "app"],
  });
    interface ruleForm {
        date: string
        reference: string
        reference_id: string
        reference_view: string
        status: string
        priority: string
        description: string | null
    }

    import { reactive, ref, onMounted } from 'vue';
    import { type Inquiry } from '~/types/inquiry';
    import { type ComponentSize, ElButton, ElText, ElTag, type FormInstance, type FormRules, ElMessage, TableV2FixedDir, ElTooltip, ElIcon,} from 'element-plus'
    import type { Column, InputInstance, MainInstance } from 'element-plus'
    import { Search, Timer } from '@element-plus/icons-vue'
    import type { Maintenance } from '~/types/maintenance';
    import type { Contact } from '~/types/contact';
import type { Catalogue } from '~/types/catalogue';
import type { Unit } from '~/types/unit';
    
    
    const axios = useApi();

    const router = useRouter();

    const goBack = () => router.back();
    const dialogContacts = ref<boolean>(false);
    const dialogRepair = ref<boolean>(false);
    const formSize = ref<ComponentSize>('default')
    const ruleFormRef = ref<FormInstance>()
    const maintenances = ref<Maintenance[]>([]);
    const contacts = ref<Contact[]>([]);

    const dataTable = ref(
        Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        item: '',
        item_id: '',
        quantity: '1',
        unit_id: '',
        unit_name: '',
      }))
    );
    
    const ruleForm = reactive<ruleForm>({
        date: '',
        reference: '',
        reference_id: '',
        reference_view: '',
        status: '',
        priority: 'low',
        description: null
    })
    

    const rules = reactive<FormRules<ruleForm>>({
      date: [
        {
          type: 'date',
          required: true,
          message: 'Pilih Tanggal',
          trigger: 'change',
        },
      ],
      reference: [
        {
          required: true,
          message: 'Masukan Referensi Pembuatan Permintaan',
          trigger: 'change',
        },
      ],
      reference_id: [
        {
          required: true,
          message: 'Pilih Referensi Sumber Permintaan',
          trigger: 'change',
        },
      ],
      reference_view: [
        {
          required: true,
          message: 'Pilih Referensi Sumber Permintaan',
          trigger: 'change',
        },
      ],
    })

    const columnsContact: Column<any>[] = [
      {
        key: 'name',
        title: 'Nama',
        dataKey: 'name',
        width: 150,
      },
      {
        key: 'name',
        title: 'Name',
        dataKey: 'name',
        width: 150,
        align: 'center',
      },
      {
        key: 'email',
        title: 'Email',
        dataKey: 'email',
        width: 150,
      },
      {
        key: 'operations',
        title: 'Operations',
        cellRenderer: ({rowData: row}) => (
          <>
            <ElButton size="small" onClick={() => onSelectReference_id(row)} >Pilih</ElButton>
          </>
        ),
        width: 150,
        align: 'center',
      },
    ]

    const columnMaintenance: Column<any>[] = [
      {
        key: 'unique_code',
        title: 'Nomor Maintenance',
        dataKey: 'unique_code',
        width: 150,
      },
      {
        key: 'maintenance_date',
        title: 'Tanggal',
        dataKey: 'maintenance_date',
        width: 150,
        cellRenderer: ({ cellData: maintenance_date }) => (
          <ElTooltip content={formatLocalDate(maintenance_date)}>
            {
              <span class="flex items-center">
                <ElIcon class="mr-3">
                  <Timer />
                </ElIcon>
                {formatLocalDate(maintenance_date)}
              </span>
            }
          </ElTooltip>
        ),
      },
      {
        key: 'priority',
        title: 'Prioritas',
        dataKey: 'priority',
        width: 150,
        align: 'center',
        cellRenderer: ({ cellData: priority }) => (priority === 'low' ? <ElTag type="danger" >{priority}</ElTag> : priority === 'medium' ? <ElTag type="warning" >{priority}</ElTag> : <ElTag type="primary">{priority}</ElTag>)
      },
      {
        key: 'type',
        title: 'Type',
        dataKey: 'type',
        width: 150,
        cellRenderer: ({ cellData: type }) => ( type === 'corrective' ? <ElTag type="danger" >{type}</ElTag> : <ElTag type="primary" >{type}</ElTag>),
      },
      {
        key: 'operations',
        title: 'Operations',
        cellRenderer: ({rowData: row}) => (
          <>
            <ElButton size="small" onClick={() => onSelectReference_id(row)} >Pilih</ElButton>
          </>
        ),
        width: 150,
        align: 'center',
      },
    ]

    const units = ref<Unit[]>([
      {id: 1, name: 'unit', slug: 'unit'},
      {id: 2, name: 'box', slug: 'box'},
      {id: 3, name: 'container', slug: 'container'}
    ])



    const showDialog = () => {
      if(ruleForm.reference == 'repair'){
        dialogRepair.value = true;
      }else if(ruleForm.reference == 'internal'){
        dialogContacts.value = true;
      }else{
        ElMessage.warning('Pilih Referensi Terlebih Dahulu')
      }
    }

    const submitForm = async (formEl: FormInstance | undefined) => {
      console.log(dataTable.value);
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
          console.log('submit!')
        } else {
          console.log('error submit!', fields)
        }
      })
    }

    const resetForm = (formEl: FormInstance | undefined) => {
      if (!formEl) return
      formEl.resetFields()
    }

    const getContacts = async() => {
      try {
        const response = await axios.get('/contact-read');
        if(response.status == 200){
          contacts.value = response.data.data;
        }
      } catch (error: any) {
        console.log(`Gagal Mengambil Data Kontak ${error.response.data.message}`)
      }
    }

    const getMaintenance = async() => {
      try {
        const response = await axios.get('/maintenances-read');
        if(response.status == 200){
          maintenances.value = response.data.data;
        }
      } catch (error: any) {
        console.log(`Gagal Mengambil Data Maintenance ${error.response.data.message}`)
      }
    }

    const onSelectReference_id = async (data: any) => {
      console.log(data);
      if(ruleForm.reference == 'internal'){
        const contact = data as Contact;
        ruleForm.reference_id = contact.unique_id;
        ruleForm.reference_view = contact.name;
      }else{
        const maintenance = data as Maintenance;
        ruleForm.reference_id = maintenance.unique_id;
        ruleForm.reference_view = maintenance.unique_code;
      }

      dialogContacts.value = false;
      dialogRepair.value = false;
    }

    const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
      

        axios.get('/catalogues-read').then((response) => {
          if(response.status == 200){
            const catalogues = response.data.data.filter(
                                (data: Catalogue) =>
                                  !queryString ||
                                  data.unique_code?.toLowerCase().includes(queryString.toLowerCase()) ||
                                  data.unique_id?.toLowerCase().includes(queryString.toLowerCase()) ||
                                  data.name?.toLowerCase().includes(queryString.toLowerCase())
                              )
            const results = catalogues.map((data: Catalogue) => {
                return {value: `${data.name}-${data.sn}`, unique_id: data.unique_id};
            });    
            cb(results)
          }else{
            ElMessage.error(response.data.message);
          }
        }).catch((error: any) => {
          ElMessage.error(error.response.data.message);
        });
    }

    const createFilter = (queryString: string) => {
      return (restaurant: Unit) => {
        return (
          restaurant.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    }

    let timeout: ReturnType<typeof setTimeout>
    const querySearchAsyncUnit = (queryString: string, cb: (arg: any) => void) => {
      const filters = queryString
      ? units.value.filter(createFilter(queryString))
      : units.value

      const results = filters.map((data: Unit) => {
                return {value: `${data.name}`, id: data.id};
            });

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        cb(results)
      }, 3000 * Math.random())
    }

    const onHandleSelectItemAutocomplete = (item: Record<string, any>, scope: any) => {
      console.log(item)
      dataTable.value[scope.$index].item = item.value;
      dataTable.value[scope.$index].item_id = item.unique_id;
    }

    const onHandleSelectItemAutocompleteUnit = (item: Record<string, any>, scope: any) => {
      console.log(scope.$index)
      dataTable.value[scope.$index].unit_name = item.value;
      dataTable.value[scope.$index].unit_id = `${item.id}`;
    }

    const validateDecimal = (value: string, scope: any) => {
      const decimalRegex = /^[0-9]*\.?[0-9]*$/;
      if (!decimalRegex.test(value)) {
        const quantity = value.replace(/[^0-9.]/g, ""); // Hilangkan karakter non-angka atau titik
        dataTable.value[scope.$index].quantity = quantity;
      }
    };


    onMounted(() => {
      getContacts();
      getMaintenance();
    })

</script>
<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Buat Inquiri Baru </span>
        </template>
    </el-page-header>
    <el-form ref="ruleFormRef"
            
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            :size="formSize"
            status-icon
        >
    <el-card class="my-3">
            
        <el-form-item label="Tanggal Permintaan" prop="date">
          <el-date-picker
            v-model="ruleForm.date!"
            type="date"
            placeholder="Tanggal Inquiri"
          />
        </el-form-item>  
        <el-form-item label="Referensi" prop="reference">
          <el-select v-model="ruleForm.reference" placeholder="Masukan Referensi">
            <el-option label="Internal" value="internal" />
            <el-option label="Repair" value="repair" />
          </el-select>
        </el-form-item>
        <el-form-item label="Sumber Referensi" prop="reference_view"  >
          <div class="">
            <el-input
              v-model="ruleForm.reference_view"
              placeholder="Cari Sumber Referensi"
              class="input-with-select"
              :disabled="true"
            >
              <template #append>
                <el-button :icon="Search" @click="showDialog" />
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="Prioritas" label-position="right">
          <el-radio-group v-model="ruleForm.priority" aria-label="Prioritas">
            <el-radio-button value="low">Low</el-radio-button>
            <el-radio-button value="medium">Medium</el-radio-button>
            <el-radio-button value="hight">Hight</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
    </el-card>

    <el-card class="mb-3">
      
        <el-table :data="dataTable">
          <el-table-column prop="name" label="item" >
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsync"
                v-model="scope.row.name"
                
                placeholder="Please input"
                @select="(item) => onHandleSelectItemAutocomplete(item, scope)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="Quantity">
            <template #default="scope">
              <el-input
                :step="0.01"
                :min="0"
                v-model="scope.row.quantity"
                @input="(value) => validateDecimal(value, scope)"
                placeholder="Masukkan item"
              />
            </template>
          </el-table-column>
          <el-table-column prop="unit" label="Unit">
            <template #default="scope">
              <el-autocomplete
                :fetch-suggestions="querySearchAsyncUnit"
                v-model="scope.row.unit_name"
                placeholder="Input Units"
                @select="(item) => onHandleSelectItemAutocompleteUnit(item, scope)"
              />
            </template>
          </el-table-column>
        </el-table>
      
    </el-card>
    <el-card>
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">Simpan</el-button>
        <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
      </el-form-item>
    </el-card>
  </el-form>
    <el-dialog v-model="dialogContacts" title="Contacts" width="800">
      
      <el-table-v2
        :columns="columnsContact"
        :data="contacts"
        :width="760"
        :height="400"
        fixed
      />
    </el-dialog>
    <el-dialog v-model="dialogRepair" title="Maintenances" width="800">
      
      <el-table-v2
        :columns="columnMaintenance"
        :data="maintenances"
        :width="760"
        :height="400"
        fixed
      />
    </el-dialog>
</template>

