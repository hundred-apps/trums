<template>
  <div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="Kode Departemen" prop="unique_code">
        <el-input v-model="form.unique_code" placeholder="Misal: IT, HR, FIN" />
      </el-form-item>
      
      <el-form-item label="Nama Departemen" prop="name">
        <el-input v-model="form.name" placeholder="Masukkan nama departemen" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">
          {{ isEditing ? 'Update' : 'Simpan' }}
        </el-button>
        <el-button @click="$emit('cancel')">Batal</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Departement } from '~/types/departement';

const props = defineProps<{
  departement: Departement | null
  isEditing: boolean
}>()

const emit = defineEmits(['submitted', 'cancel'])

const formRef = ref<FormInstance>()
const form = ref<Partial<Departement>>({
  unique_code: '',
  name: '',
})

const rules = {
  unique_code: [
    { required: true, message: 'Kode departemen harus diisi', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Nama departemen harus diisi', trigger: 'blur' }
  ]
}

watch(() => props.departement, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  } else {
    form.value = { unique_code: '', name: '' }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // Call API to save
    const endpoint = props.isEditing 
      ? `/departements/${form.value.unique_id}`
      : '/departements'
    
    const method = props.isEditing ? 'put' : 'post'
    
    await useFetchApi(endpoint, 'save-departement', method, form.value)
    
    emit('submitted')
  } catch (error) {
    // Validation failed
  }
}
</script>