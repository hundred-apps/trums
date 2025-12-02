<template>
  <el-form
    ref="formRef"
    style="max-width: 600px"
    :model="formData"
    :rules="rules"
    label-width="auto"
    class="demo-ruleForm"
    :size="formSize"
    status-icon
    :disabled="loading"
  >
    <el-form-item label="Name" prop="name">
      <el-input v-model="formData.name" placeholder="Nama" />
    </el-form-item>
    
    <el-form-item label="Email" prop="email">
      <el-input v-model="formData.email" placeholder="Email" />
    </el-form-item>
    
    <el-form-item label="Phone" prop="phone">
      <el-input v-model="formData.phone" placeholder="Phone" />
    </el-form-item>
    
    <el-form-item label="NPWP" prop="tax_id">
      <el-input v-model="formData.tax_id" placeholder="NPWP" />
    </el-form-item>
    
    <el-form-item label="Website" prop="website">
      <el-input v-model="formData.website" placeholder="Website" />
    </el-form-item>
    
    <el-form-item label="Title" prop="title">
      <el-input v-model="formData.title" placeholder="Title" />
    </el-form-item>
    
    <el-form-item label="Tipe">
      <el-checkbox 
        v-model="formData.is_personal" 
        label="Personal" 
        border 
      />
      <el-checkbox
        v-model="formData.is_company!"
        label="Perusahaan"
        border
      />
    </el-form-item>
    
    <el-form-item label="Ownership?">
      <el-switch v-model="formData.ownership" />
    </el-form-item>
    
    <el-form-item label="Tags" prop="tags">
      <el-input-tag
        v-model="formData.tmp_tags!"
        :max="3"
        clearable
        placeholder="enter up to 3 tags"
      />
    </el-form-item>

    <el-form-item>
      <div class="flex justify-start align-center">
        <el-button type="primary" @click="handleSubmit">
          Simpan
        </el-button>
        <el-button type="info" plain @click="$emit('reset')">
          Reset
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules, ComponentSize } from 'element-plus'
import type { Contact } from '~/types/contact'

interface Props {
  contactData: Contact
  loading?: boolean
}

const props = defineProps<Props>()

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (isValid) {
    emit('submit', { ...formData }) // ✅ Kirim data form
  }
}



const emit = defineEmits<{
  submit: [formData: Contact]
  reset: []
}>()

const { t } = useI18n()

// Refs
const formRef = ref<FormInstance>()
const formSize = ref<ComponentSize>('default')

const formData = reactive<Contact>({
    unique_id: '',
    unique_code: '',
    is_personal: false,
    is_company: false,
    internal_id: '',
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    website: '',
    title: '',
    tags: '',
    tmp_tags: [],
    ownership: false,
    address: [],
    id: 0,
    created_at: 0,
    created_by: '',
    updated_at: 0,
    version: 0
})

// Rules
const rules = reactive<FormRules<Contact>>({
  name: [
    {
      required: true,
      message: t('form.validate.name'),
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: t('form.validate.phone'), trigger: 'blur' },
    {
      min: 11,
      max: 13,
      message: t('form.validate.phoneLength'),
      trigger: ['blur', 'change'],
    },
  ],
  tax_id: [
    {
      pattern: /^(\d{10}|\d{15}|\d{16})$/,
      message: 'Masukan format NPWP yang valid',
      trigger: ['blur', 'change'],
    },
  ],
  website: [
    {
      type: 'url',
      message: 'Masukan URL yang valid',
      trigger: ['blur', 'change'],
    },
  ],
})

// Methods
const validateForm = async (): Promise<boolean> => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

watch(() => props.contactData, (newContactData) => {
  if (newContactData) {
    Object.assign(formData, {
      ...newContactData,
      tags: (newContactData.tmp_tags ?? []).join(', '),
    })
  }
}, { immediate: true, deep: true })

const resetForm = () => {
  formRef.value?.resetFields()
}

defineExpose({
  validateForm,
  resetForm
})
</script>