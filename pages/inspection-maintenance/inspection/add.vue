<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> New Inspection </span>
        </template>
    </el-page-header>
    <el-card class="my-3">
        <template #header>
            <div class="card-header">
                <el-form-item>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        Simpan
                    </el-button>
                    <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
                </el-form-item>
            </div>
        </template>
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
              :fetch-suggestions="querySearchAsyncInventories"
              v-model="scope.row.name"
              
              placeholder="Please input"
              @select="(item: Record<string, any>) => onHandleSelectItemAutocomplete(item, scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="pic" label="PIC">
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchAsyncPic"
              v-model="scope.row.pic_name"
              placeholder="Input PIC"
              @select="(item: Record<string, any>) => onHandleSelectPICAutocomplete(item, scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Kondisi">
            <template #default="scope">
              <el-input
                :step="0.01"
                :min="0"
                v-model="scope.row.condition"
                placeholder="Masukkan Kondisi"
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
    import type { People } from '~/types/people';
import type { Inventory } from '~/types/inventory';

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


    const querySearchAsyncPic = (queryString: string, cb: (arg: any) => void) => {
        axios.get('/people-read').then((response) => {
            if(response.status == 200){
                // console.log(response.data.data.q);
                const peoples: People[] = response.data.data;

                const filters = queryString
                ? peoples.filter(
                    (data) => 
                    data.name?.toLowerCase().includes(queryString.toLowerCase()) ||
                    data.email?.toLowerCase().includes(queryString.toLowerCase()) ||
                    data.position?.toLowerCase().includes(queryString.toLowerCase())
                )
                : peoples

                const results = filters.map((data: People) => {
                            return {value: `${data.name}`, id: data.unique_id};
                });
                cb(results)
            }else{
                ElMessage.error(response.data.message);
            }
        }).catch((error: any) => {
            ElMessage.error(error.response.data.message);
        });
    }

    const querySearchAsyncInventories = (queryString: string, cb: (arg: any) => void) => {
        axios.get('/inventories-read').then((response) => {
            if(response.status == 200){
                // console.log(response.data.data.q);
                const inventories: Inventory[] = response.data.data.query;

                const filters = queryString
                ? inventories.filter(
                    (data) => 
                    data.catalogue?.name?.toLowerCase().includes(queryString.toLowerCase()) ||
                    data.catalogue?.sn?.toLowerCase().includes(queryString.toLowerCase())
                )
                : inventories

                const results = inventories.map((data: Inventory) => {
                    return {value: `${data.catalogue.name}-${data.location?.name}`, unique_id: data.unique_id};
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
        dataTable.value[scope.$index].name = item.value;
        dataTable.value[scope.$index].inventory_id = item.unique_id;
    }

    const onHandleSelectPICAutocomplete = (item: Record<string, any>, scope: any) => {
        console.log(item)
        dataTable.value[scope.$index].pic_name = item.value;
        dataTable.value[scope.$index].pic = item.unique_id;
    }

    const rules = reactive<FormRules<RuleForm>>({
        inspection_name: [
            { required: true, message: 'Nama Inspeksi', trigger: 'blur' },
        ],
        inspection_date: [
            { required: true, message: 'Masukan tanggal inspeksi', trigger: 'blur' },
        ],
        
    })

    const submitForm = async (formEl: FormInstance | undefined) => {
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

    onMounted(() => {
        // fetchCatalogues();
    })

</script>