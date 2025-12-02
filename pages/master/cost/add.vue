<template>
  <TrumsWrapper>
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600 mr-3">Biaya Tambahan</span>
      </template>
    </el-page-header>
    <el-card class="form-card mt-6">

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="200px"
        label-position="left"
        
        :disabled="loading"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <!-- Kode Pajak -->
            <el-form-item label="Kode Pajak" prop="unique_code">
              <el-input
                v-model="form.unique_code"
                placeholder="Masukkan kode pajak (contoh: PPN11)"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>

            <!-- Nama Pajak -->
            <el-form-item label="Nama Pajak" prop="name">
              <el-input
                v-model="form.name"
                placeholder="Masukkan nama pajak"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <!-- Tipe Pajak -->
            <el-form-item label="Tipe Pajak" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="percent">Persentase (%)</el-radio>
                <el-radio label="fixed">Fixed Amount</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- Nilai Default -->
            <el-form-item label="Nilai Default" prop="default_value">
              <el-input
                v-model="form.default_value"
                :placeholder="form.type === 'percent' ? 'Masukkan persentase' : 'Masukkan jumlah fixed'"
              >
                <template #append>
                  {{ form.type === 'percent' ? '%' : 'IDR' }}
                </template>
              </el-input>
              <div class="form-tip">
                {{ form.type === 'percent' ? 'Contoh: 11 untuk 11%' : 'Contoh: 5000 untuk Rp 5.000' }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <!-- Operator -->
            <el-form-item label="Operator" prop="operator">
              <el-radio-group v-model="form.operator">
                <el-radio label="plus">Exclude</el-radio>
                <el-radio label="minus">Include</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- Allow Party -->
            <el-form-item label="Allow Party" prop="allow_party">
              <el-switch
                v-model="form.allow_party"
                active-text="Ya"
                inactive-text="Tidak"
              />
              <div class="form-tip">
                Jika diaktifkan, pajak dapat diterapkan ke party tertentu
              </div>
            </el-form-item>
            
            
          </el-col>
        </el-row>

        <!-- Action Buttons -->
        <el-form-item class="form-actions">
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="onSubmit"
          >
            {{ isEdit ? 'Update' : 'Simpan' }}
          </el-button>
          <el-button 
            :disabled="loading" 
            @click="onReset"
          >
            Reset
          </el-button>
          <el-button 
            v-if="isEdit"
            type="danger" 
            :loading="deleteLoading"
            @click="onDelete"
          >
            Hapus
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Preview Card -->
    <el-card class="preview-card" v-if="form.unique_code && form.name">
      <template #header>
        <span class="preview-title">Preview Pajak</span>
      </template>
      
      <div class="preview-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Kode Pajak">
            <el-tag type="primary">{{ form.unique_code }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Nama Pajak">
            {{ form.name }}
          </el-descriptions-item>
          <el-descriptions-item label="Tipe">
            <el-tag :type="form.type === 'percent' ? 'success' : 'warning'">
              {{ form.type === 'percent' ? 'Persentase' : 'Fixed Amount' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Nilai Default">
            <span class="preview-value">
              {{ form.default_value }}
              {{ form.type === 'percent' ? '%' : ' IDR' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Operator">
            <el-tag :type="form.operator === 'plus' ? 'success' : 'danger'">
              {{ form.operator === 'plus' ? 'Exclude' : 'Minus' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Allow Party">
            <el-tag :type="form.allow_party ? 'success' : 'info'">
              {{ form.allow_party ? 'Ya' : 'Tidak' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Versi">
            v.{{ form.version }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { FeeType, type AdjustmentTransaction } from '~/types/attribute_adjustment'
import type { BaseResponse } from '~/types/response'

definePageMeta({
  middleware: ["auth", "check-access"],
  requiredPermission: "adjustments_transaction-create",
  name: "Create Cost"
})

// Route and state
const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const deleteLoading = ref(false)

// Check if edit mode
const isEdit = computed(() => !!route.query.id)

// Form data
const form = ref<AdjustmentTransaction>({
    unique_id: '',
    unique_code: '',
    name: '',
    type: FeeType.PERCENT,
    default_value: 0,
    operator: 'plus',
    allow_party: false,
    version: 1,
    created_at: 0,
    updated_at: 0
})

// Validation rules
const rules = reactive<FormRules>({
  unique_code: [
    { required: true, message: 'Kode pajak wajib diisi', trigger: 'blur' },
    { min: 2, max: 20, message: 'Panjang kode 2-20 karakter', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: 'Hanya huruf kapital dan angka', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Nama pajak wajib diisi', trigger: 'blur' },
    { min: 2, max: 100, message: 'Panjang nama 2-100 karakter', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Tipe pajak wajib dipilih', trigger: 'change' }
  ],
  default_value: [
    { required: true, message: 'Nilai default wajib diisi', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('Nilai default wajib diisi'))
          return
        }
        
        const numValue = parseFloat(value)
        if (isNaN(numValue)) {
          callback(new Error('Nilai harus berupa angka'))
          return
        }
        
        if (form.value.type === 'percent') {
          if (numValue < 0 || numValue > 100) {
            callback(new Error('Persentase harus antara 0-100'))
            return
          }
        } else {
          if (numValue < 0) {
            callback(new Error('Nilai fixed tidak boleh negatif'))
            return
          }
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  operator: [
    { required: true, message: 'Operator wajib dipilih', trigger: 'change' }
  ],
  version: [
    { required: true, message: 'Versi wajib diisi', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: 'Versi harus 1-100', trigger: 'blur' }
  ]
})

// Load data for edit
const loadTaxData = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true;
    const response = await useFetchApi<BaseResponse<AdjustmentTransaction>>(
      `/adjustments-transaction-read/${route.query.id}`, 
      'get-tax-detail', 
      'get',
      null,
    )

    if (response.data.value?.success && response.data.value.data) {
      const taxData = response.data.value.data
      form.value = {
        unique_id: taxData.unique_id,
        unique_code: taxData.unique_code,
        name: taxData.name,
        type: taxData.type,
        default_value: taxData.default_value,
        operator: taxData.operator,
        allow_party: taxData.allow_party,
        version: taxData.version,
        created_at: taxData.created_at,
        updated_at: taxData.updated_at,
        checked: false,
      }
    } else {
      ElMessage.error('Data pajak tidak ditemukan')
      router.push('/master/tax')
    }
  } catch (error) {
    ElMessage.error('Gagal memuat data pajak')
    router.push('/master/tax')
  } finally {
    loading.value = false
  }
}

// Submit form
const onSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true


    
    const payload = {
        unique_id: form.value.unique_id,
        unique_code: form.value.unique_code,
        name: form.value.name,
        type: form.value.type,
        default_value: form.value.default_value,
        operator: form.value.operator,
        allow_party: form.value.allow_party,  
    }

    const response = await useFetchApi<BaseResponse<AdjustmentTransaction>>(
        '/adjustments-transaction-create', 
        'adjustment-create', 
        'post', 
        payload
    );

    if(response.status.value == 'success'){
        if (isEdit.value) {
            ElMessage.success('Setting Biaya Tambahan diupdate')
        } else {
            ElMessage.success('Setting Biaya Tambahan dibuat')
        }

        // Redirect back to list
        router.push('/master/cost')
    }else{
        ElMessage.error('Setting Biaya Tambahan Gagal Di Buat!')
    }
    
  } catch (error: any) {
    if (error?.errors) {
      // Validation errors handled by form
      return
    }
    ElMessage.error(isEdit.value ? 'Gagal mengupdate Biaya Tambahan' : 'Gagal membuat Biaya Tambahan')
  } finally {
    loading.value = false
  }
}

// Reset form
const onReset = () => {
  if (isEdit.value) {
    loadTaxData() // Reload original data
  } else {
    formRef.value?.resetFields()
    form.value.version = 1
    form.value.allow_party = false
  }
}

// Delete tax
const onDelete = async () => {
  try {
    const confirmed = await ElMessageBox.confirm(
      'Apakah Anda yakin ingin menghapus setting pajak ini?',
      'Konfirmasi Hapus',
      {
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        type: 'warning',
      }
    )
    
    if (confirmed) {
      deleteLoading.value = true
      await useFetchApi<BaseResponse<any>>(
        '/tax-delete',
        'delete-tax',
        'post',
        [form.value.unique_id]
      )
      
      ElMessage.success('Setting pajak berhasil dihapus')
      router.push('/master/tax')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Gagal menghapus setting pajak')
    }
  } finally {
    deleteLoading.value = false
  }
}

// Watch for type changes to update validation
watch(() => form.value.type, (newType) => {
  // Clear default value when type changes
  form.value.default_value = 0;
})

// Load data on mount if edit mode
onMounted(() => {
  if (isEdit.value) {
    loadTaxData()
  }
})


</script>

<style scoped>
.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.preview-card {
  margin-top: 20px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
}

.preview-content {
  max-width: 500px;
}

.preview-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>