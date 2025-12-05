<template>
  <div>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="Kode Posisi" prop="unique_code">
        <el-input v-model="form.unique_code" placeholder="Misal: SE, MGR, DIR" />
      </el-form-item>
      
      <el-form-item label="Nama Posisi" prop="name">
        <el-input v-model="form.name" placeholder="Masukkan nama posisi" />
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

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { Position } from '~/types/position';

const props = defineProps<{
  position: Position | null
  isEditing: boolean
}>()

const emit = defineEmits(['submitted', 'cancel'])

const formRef = ref<FormInstance>()
const form = ref<Partial<Position>>({
  unique_code: '',
  name: '',
})

const rules = {
  unique_code: [
    { required: true, message: 'Kode posisi harus diisi', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Nama posisi harus diisi', trigger: 'blur' }
  ]
}

watch(() => props.position, (newVal) => {
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
      ? `/positions/${form.value.unique_id}`
      : '/positions'
    
    const method = props.isEditing ? 'put' : 'post'
    
    await useFetchApi(endpoint, 'save-position', method, form.value)
    
    emit('submitted')
  } catch (error) {
    // Validation failed
  }
}
</script>