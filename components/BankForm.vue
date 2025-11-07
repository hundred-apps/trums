<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import type { Bank } from '~/types/bank_account'
import type { BaseResponse } from '~/types/response';

interface Props {
  bank?: Bank | null
  isEditing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submitted', 'cancel'])

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  bank_name: props.bank?.bank_name || '',
  unique_id: props.bank?.unique_id || ''
})

const rules = reactive<FormRules>({
  bank_name: [
    { required: true, message: 'Nama bank/e-wallet wajib diisi', trigger: 'blur' },
    { min: 3, max: 100, message: 'Panjang 3-100 karakter', trigger: 'blur' }
  ]
})

const resetFormData = (bank?: Bank | null) => {
  form.bank_name = bank?.bank_name || ''
  form.unique_id = bank?.unique_id || ''
}

watch(() => props.bank, (newBank) => {
  resetFormData(newBank)
}, { immediate: true })


const submitForm = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    

    await useFetchApi<BaseResponse<Bank>>('/banks-create', 'create-bank', 'post', form);
      

    ElMessage.success(`Bank berhasil ${props.isEditing ? 'diubah' : 'ditambahkan'}`)
    emit('submitted')
    
    if (!props.isEditing) {
      formRef.value?.resetFields()
    }
    
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  console.log('on mounted', props.bank)
})

</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    label-position="top"
  >
    <el-form-item label="Nama Bank/E-Wallet" prop="bank_name">
      <el-input v-model="form.bank_name" placeholder="Contoh: Bank Mandiri" />
    </el-form-item>
  
    <div class="flex justify-end gap-3 mt-6">
      <el-button @click="emit('cancel')">Batal</el-button>
      <el-button 
        type="primary" 
        @click="submitForm"
        :loading="loading"
      >
        {{ isEditing ? 'Update' : 'Simpan' }}
      </el-button>
    </div>
  </el-form>
</template>