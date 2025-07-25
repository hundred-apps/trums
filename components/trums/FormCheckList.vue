<script setup lang="tsx">
import { TrumsWrapper } from '#components';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { ValueType, type ChecklistAttribute, type ChecklistOptionAttribute } from '~/types/checklist';
import type { BaseResponse } from '~/types/response';
import { Plus } from '@element-plus/icons-vue'
import type { MagicString } from 'vue/compiler-sfc';

const props = defineProps<{
    onSuccess?: (value: ChecklistAttribute) => void,
    onBack?: () => void,
    ruleForm: ChecklistAttribute,
}>();

const router = useRouter();


const loading = ref<boolean>(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const goBack = () => {
    if(props.onBack != undefined){
        return props.onBack();
    }else{
        router.back();
    }
}

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

const onSubmitChecklist = async (formEl: FormInstance | undefined) => {
    loading.value = true;
    try {
        const data = {
            unique_id: props.ruleForm.unique_id,
            name: props.ruleForm.name,
            value_type: props.ruleForm.value_type,
            maintenance_option: props.ruleForm.maintenance_options.map((value) => ({
                value: value.value,
                unique_id: value.unique_id,
            })),
        }


        const response = await useFetchApi<BaseResponse<ChecklistAttribute>>('/maintenance-checklist-create', 'maintenance-create', 'post', data);

        if(response.status.value == 'success'){
            props.ruleForm.unique_id = response.data.value!.data.unique_id;
            props.ruleForm.maintenance_options = response.data.value!.data.maintenance_options;
            ElMessage.success(`Data Berhasil Ditambahkan!`);
            if(props.onSuccess != undefined){
                props.onSuccess!(response.data.value!.data)
            }
            
        }
        
    } catch (error: any) {
        ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}



const submitForm = async (formEl: FormInstance | undefined) => {
    
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            onSubmitChecklist(formEl);
        } else {
            console.log('error submit!', fields)
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
    if(props.onBack){
        return props.onBack();
    }
}

const addNewOption = () => {
    props.ruleForm.maintenance_options.push({
        unique_id: null,
        checklist_id: null,
        value: '',
        is_new: true,
    })
}

const deleteOption = (index: number, data: ChecklistOptionAttribute) => {
    if(data.is_new){
        props.ruleForm.maintenance_options.splice(index,1);
    }else{
        deleteOptionAsync([data.unique_id!], index);
    }
}

const deleteOptionAsync = async (ids: string[], index: number) => {
    loading.value = true;
    try {
        
        const response = await useFetchApi<BaseResponse<any>>(`/maintenance-option-delete`, 'maintenance-checklist-option-delete', 'post', ids);
        if(response.status.value == 'success'){
            props.ruleForm.maintenance_options.splice(index,1);
        }    
    } catch (error: any) {
        ElMessage.error(`${error.response?.message ?? error}`);
    } finally {
        loading.value = false;
    }
}



</script>

<template>
    <el-card class="mb-3 mt-3">
        <template #header>
            <div class="card-header">
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">Simpan</el-button>
                <el-button @click="resetForm(ruleFormRef)">Batal</el-button>
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
            :disabled="loading"
        >
            <el-form-item label="Nama" prop="name">
                <el-input v-model="ruleForm.name" placeholder="Masukan nama checklist" />
            </el-form-item>
            <el-form-item label="Tipe Nilai" prop="value_type">
                <el-select v-model="ruleForm.value_type" placeholder="Pilih Tipe Nilai">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <div v-if="ruleForm.value_type == ValueType.Option || ruleForm.value_type == ValueType.Select">
                <p class="my-3 font-bold">Pilihan</p>
                <el-form-item v-for="data, index in ruleForm.maintenance_options" :label="`Pilihan ${index + 1}`"  :prop="`options.${index}.value`">
                    <el-input v-model="ruleForm.maintenance_options[index].value" placeholder="Masukan nama checklist">
                        <template #append>
                            <el-button type="" @click="() => deleteOption(index, data)">Hapus</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button type="" @click="addNewOption" :icon="Plus">Tambah Pilihan</el-button>
            </div>
        </el-form>
    </el-card>
</template>