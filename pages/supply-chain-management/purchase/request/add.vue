<template>
    <el-page-header @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Purchase Request </span>
        </template>
    </el-page-header>
    <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="requestFormRule"
        label-width="auto"
        class="demo-ruleForm"
        :size="formSize"
        status-icon
    >
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
            <el-form-item prop="order_deadline" label="Tanggal Order">
                <el-date-picker
                    v-model="requestFormRule.order_deadline!"
                    type="date"
                    aria-label="Pick a date"
                    placeholder="Pick a date"
                    style="width: 100%"
                />
            </el-form-item>
            <el-form-item label="Sumber Dokumen Lain" prop="source_document">
                <el-input v-model="requestFormRule.source_document" placeholder="Masukan sumber dokumen lainya" />
            </el-form-item>
            <el-form-item label="Prioritas" prop="priority">
                <el-radio-group v-model="requestFormRule.priority">
                    <el-radio-button label="Low" value="low" />
                    <el-radio-button label="Medium" value="medium" />
                    <el-radio-button label="Height" value="height" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Note">
                <el-input v-model="requestFormRule.description" type="textarea" />
            </el-form-item>
        </el-card>
    </el-form>
    <el-card>

        <el-table :data="itemRequest">
        <el-table-column prop="name" label="item" >
          <template #default="scope">
            <el-autocomplete
              :fetch-suggestions="querySearchAsync"
              v-model="scope.row.name"
              
              placeholder="Please input"
              @select="(item: Record<string, any>) => onHandleItemAautocomplete(item, scope)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="Quantity">
          <template #default="scope">
            <el-input v-model="scope.row.quantity" placeholder="Masukan Jumlah Permintaan" @input="(value) => validateDecimal(value)" />
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="unit">
            <template #default="scope">
              <el-input
                :step="0.01"
                :min="0"
                v-model="scope.row.unit"
                
                placeholder="Masukkan Unit"
              />
            </template>
        </el-table-column>
      </el-table>

    </el-card>
</template>

<script lang="ts" setup>
    import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
    import type { Catalogue } from '~/types/catalogue';
import type { ItemRequest } from '~/types/item_request';
    import type { RequestSearch } from '~/types/request_search';

    interface RequestForm {
        order_deadline: string
        priority: string,
        source_document: string,
        description: string,
    }
    
    definePageMeta({
        middleware: ["auth", "app"],
    });

    const formSize = ref<ComponentSize>('default')
    const ruleFormRef = ref<FormInstance>()
    const itemRequest = ref<ItemRequest[]>(Array.from({length: 4}, (_, i) => ({
        catalogue_id: null,
        catalogue_name: null,
        quantity: 1.0,
        unit_id: null,
        unit_name: null,
        id: i + 1,
        unique_id: null,
        catalogue: null,
        inventory_id: null,
        inventory: null,
        catalogue_version: 0,
        description: null,
        inquiry_id: null,
        inquiry: null,
        request_id: null,
        request: null,
        created_at: null,
        created_by: null,
        updated_at: null
    })))
    const requestFormRule = reactive<RequestForm>({
        order_deadline: '',
        priority: 'low',
        source_document: '',
        description: '',
    })

    const requestSearch = ref<RequestSearch>({
        keyword: '',
        table: '',
        column: null,
        sort: null,
        limit: '50',
        offset: '1',
    })

    const router = useRouter();
    const api = useApi();
    const goBack = () => router.back();

    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return
        console.log('submit!')
        
    }

    const resetForm = (formEl: FormInstance | undefined) => {
        if (!formEl) return
        formEl.resetFields()
    }

    const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
        requestSearch.value.keyword = queryString;
        api.post('/catalogues-search', requestSearch.value).then((response) => {
            if(response.status == 200){
                const resultApi: Catalogue[]  = response.data.data;
                cb(resultApi);
            }
        }).catch((error: any) => {
            ElMessage.error(error.response?.data?.message);
        })
    }

    const onHandleItemAautocomplete = (item: any, scope: any) => {
        if(item.unique_id == undefined){
            console.log('new');
        }else{
            console.log(item);
        }
    }

    const validateDecimal = (value: string) => {
      return validate_decimal(value);
    };

</script>