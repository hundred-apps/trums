<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> New Inspection </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <el-form
            ref="ruleFormRef"
            style="max-width: 600px"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            :size="formSize"
            status-icon
        >
            <el-form-item label="Nama Inspeksi" prop="inspection_name">
                <el-input 
                v-model="ruleForm.inspection_name" 
                placeholder="Nama Inspeksi"  />
            </el-form-item>
            <el-form-item label="Tanggal Inspeksi" prop="inspection_date">
                <el-date-picker
                    v-model="ruleForm.inspection_date"
                    type="date"
                    placeholder="Tanggal Inspeksi"
                />
            </el-form-item>  
            <el-form-item label="Status" prop="status">
                <el-select v-model="ruleForm.status" placeholder="Pilih Status">
                    <el-option label="DRAFT" value="draft" />
                    <el-option label="PROGRESS" value="progress" />
                    <el-option label="REPAIR" value="repair" />
                    <el-option label="DONE" value="done" />
                    <el-option label="CANCEL" value="cancel" />
                </el-select>
            </el-form-item>
            <el-form-item label="Kondisi" prop="condition">
                <el-input v-model="ruleForm.condition" type="textarea" />
            </el-form-item>
        </el-form>
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
        <el-table-column prop="pic" label="PIC">
          <template #default="scope">
            <el-input
              :step="0.01"
              :min="0"
              v-model="scope.row.pic"
              @input="(value) => validateDecimal(value, scope)"
              placeholder="Masukkan item"
            />
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Kondisi">
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchAsyncUnit"
              v-model="scope.row.condition"
              placeholder="Input Units"
              @select="(item) => onHandleSelectItemAutocompleteUnit(item, scope)"
            />
          </template>
        </el-table-column>
      </el-table>
    
  </el-card>
</template>

<script lang="ts" setup>
    definePageMeta({
        middleware: ["auth", "app"],
    });
    interface RuleForm {
        inspection_name: string,
        inspection_date: number,
        condition: string,
        status: string,
    }

    import { reactive, ref, onMounted } from 'vue'
    import { type ComponentSize, type FormInstance, type FormRules, ElMessage } from 'element-plus'
    import { useApi } from '#imports'
    import { type Catalogue } from '~/types/catalogue'

    const router = useRouter();

    const goBack = () => router.back();

    const catalogues = ref<Catalogue[]>([])

    const formSize = ref<ComponentSize>('default')
    const ruleFormRef = ref<FormInstance>()
    const ruleForm = reactive<RuleForm>({
        inspection_name: '',
        inspection_date: 0,
        condition: '',
        status: 'draft',
    })

    const axios = useApi();

    const dataTable = ref(
        Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        inventory_id: '',
        name: '',
        pic: '',
        pic_name:'',
        condition: '',
      }))
    );

    

    const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
        axios.get('/inventories-read', {params: {'catalogue': {"name": queryString}}}).then((response) => {
            if(response.status == 200){
                // console.log(response.data.data.q);
                const inventories: Inquiry[] = response.data.data.query;
                const results = inventories.map((data: Inquiry) => {
                    return {value: `${data.catalogue.name}-${data.catalogue.sn} (${data.location.name})`, unique_id: data.unique_id};
                });    
                cb(results)
            }else{
                ElMessage.error(response.data.message);
            }
        }).catch((error: any) => {
            ElMessage.error(error.response.data.message);
        });
    }

    const onHandleSelectItemAutocomplete = (item: Record<string, any>, scope: any) => {
        console.log(item)
        dataTable.value[scope.$index].item = item.value;
        dataTable.value[scope.$index].inventory_id = item.unique_id;
    }

    const rules = reactive<FormRules<RuleForm>>({
        inspection_name: [
            { required: true, message: 'Nama Inspeksi', trigger: 'blur' },
        ],
        inspection_date: [
            { required: true, message: 'Masukan tanggal inspeksi', trigger: 'blur' },
        ],
        
    })
    

    const fetchCatalogues = async () => {
        try {
            const response = await api.get('/catalogues-read');

            if(response.status == 200){
                catalogues.value = response.data.data;
            }

        } catch (error: any) {
            ElMessage.error(error.response?.data?.message);
        }
    }

    const handleSelect = (item: Record<string, any>) => {
        console.log(item)
    }

    onMounted(() => {
        // fetchCatalogues();
    })

</script>