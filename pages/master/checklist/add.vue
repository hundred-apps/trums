<script setup lang="tsx">
import { TrumsWrapper } from '#components';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { ValueType, type ChecklistAttribute, type ChecklistOptionAttribute } from '~/types/checklist';
import type { BaseResponse } from '~/types/response';
import { Plus } from '@element-plus/icons-vue'
import FormCheckList from '~/components/trums/FormCheckList.vue';

const router = useRouter();

const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<ChecklistAttribute>({
    unique_id: null,
    name: '',
    value_type: '',
    version: 0,
    maintenance_options: [
        {
            unique_id: null,
            checklist_id: null,
            value: '',
            is_new: true,
        }
    ],
});

const rules = reactive<FormRules<ChecklistAttribute>>({
    name: [{ required: true, message: "Nama Tidak Boleh Kosong!", trigger: "blur" }],
    value_type: [{ required: true, message: "Tipe Tidak Boleh Kosong!", trigger: "blur" }],
});

const options = [
    {
        value: ValueType.Text,
        label: ValueType.TextName,
    },
    {
        value: ValueType.Option,
        label: ValueType.OptionName,
    },
    {
        value: ValueType.Select,
        label: ValueType.SelectName,
    },
    {
        value: ValueType.MultiSelect,
        label: ValueType.MultiSelectName,
    },
    {
        value: ValueType.File,
        label: ValueType.FileName,
    },
]



const submitForm = async (formEl: FormInstance | undefined) => {
    
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
           
        } else {
            console.log('error submit!', fields)
        }
    })
}

const goBack = () => router.back();

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
}

const addNewOption = () => {
    ruleForm.maintenance_options.push({
        unique_id: null,
        checklist_id: null,
        value: '',
        is_new: true,
    })
}

const deleteOption = (index: number, data: ChecklistOptionAttribute) => {
    if(data.is_new){
        ruleForm.maintenance_options.splice(index,1);
    }else{
        deleteOptionAsync([data.unique_id!], index);
    }
}

const deleteOptionAsync = async (ids: string[], index: number) => {
    loading.value = true;
    try {
        
        const response = await useFetchApi<BaseResponse<any>>(`/maintenance-option-delete`, 'maintenance-checklist-option-delete', 'post', ids);
        if(response.status.value == 'success'){
            ruleForm.maintenance_options.splice(index,1);
        }    
    } catch (error: any) {
        ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}

const getUpdateData = async () => {
    loading.value = true;
    try {
        const checklist_id = useCookie('checklist_id');

        const response = await useFetchApi<BaseResponse<ChecklistAttribute>>(`/maintenance-checklist-read/${checklist_id.value}`, 'maintenance-checklist-get', 'get', null);
        if(response.status.value == 'success'){
            const result: ChecklistAttribute = response.data.value!.data;
            ruleForm.unique_id = result.unique_id;
            ruleForm.name = result.name;
            ruleForm.value_type = result.value_type;
            ruleForm.version = result.version;
            ruleForm.maintenance_options = result.maintenance_options.map((value) => ({checklist_id: value.checklist_id, unique_id: value.unique_id, value: value.value, is_new: false}));
        }    
    } catch (error: any) {
        ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    const checklist_id = useCookie('checklist_id');
    console.log(checklist_id)
    if(checklist_id.value != null){
        getUpdateData();
    }
});

</script>

<template>
    <TrumsWrapper>
        <el-page-header @back="goBack">
            <template #content>
                <span class="text-large font-600 mr-3"> Buat Checklist </span>
            </template>
        </el-page-header>
        <FormCheckList :rule-form="ruleForm" />
    </TrumsWrapper>
</template>