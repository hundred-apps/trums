<template>
  <TrumsWrapper>
    <div class="w-auto">
      <el-card class="my-3">
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
          <el-form-item label="Kode Unik" prop="unique_code">
            <el-input v-model="ruleForm.unique_code" placeholder="Masukan kode unik" />
          </el-form-item>

          <el-form-item label="Nama" prop="name">
            <el-input v-model="ruleForm.name" placeholder="Masukan nama adjustment" />
          </el-form-item>

          <el-form-item label="Tipe" prop="type">
            <el-select v-model="ruleForm.type" placeholder="Pilih tipe" style="width: 100%">
              <el-option label="Percent" value="percent" />
              <el-option label="Nominal" value="amount" />
            </el-select>
          </el-form-item>

          <el-form-item label="Nilai Default" prop="default_value">
            <el-input 
              v-model="ruleForm.default_value" 
              placeholder="Masukan nilai default"
              type="number"
            />
          </el-form-item>

          <el-form-item label="Operator" prop="operator">
            <el-select v-model="ruleForm.operator" placeholder="Pilih operator" style="width: 100%">
              <el-option label="Plus (+)" value="plus" />
              <el-option label="Minus (-)" value="minus" />
              <el-option label="Multiply (×)" value="multiply" />
              <el-option label="Divide (÷)" value="divide" />
            </el-select>
          </el-form-item>

          <el-form-item label="Allow Party" prop="allow_party">
            <el-switch v-model="ruleForm.allow_party" />
          </el-form-item>

          
        </el-form>
      </el-card>
    </div>
  </TrumsWrapper>
</template>

<script lang="tsx" setup>
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

definePageMeta({
  middleware: ["auth", "app"],
});


const props = defineProps<{
    onSubmit: () => void,
}>();

// Types
interface AdjustmentTransaction {
  unique_id: string;
  unique_code: string;
  name: string | null;
  type: 'percent' | 'fixed';
  default_value: string;
  operator: 'plus' | 'minus' | 'multiply' | 'divide';
  allow_party: boolean;
  version: number;
}

// Reactive data
const loading = ref<boolean>(false);
const router = useRouter();
const formSize = ref<'default' | 'small' | 'large'>('default');
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive<AdjustmentTransaction>({
  unique_id: '',
  unique_code: '',
  name: null,
  type: 'percent',
  default_value: '0',
  operator: 'plus',
  allow_party: true,
  version: 1,
  
});

// Validation rules
const rules = reactive<FormRules>({
  unique_code: [
    { required: true, message: 'Kode unik tidak boleh kosong!', trigger: 'blur' }
  ],
  name: [
    { required: false, message: 'Nama adjustment tidak boleh kosong!', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Tipe tidak boleh kosong!', trigger: 'change' }
  ],
  default_value: [
    { required: true, message: 'Nilai default tidak boleh kosong!', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (ruleForm.type === 'percent' && parseFloat(value) > 100) {
          callback(new Error('Persentase tidak boleh lebih dari 100%'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
  operator: [
    { required: true, message: 'Operator tidak boleh kosong!', trigger: 'change' }
  ],
  created_at: [
    { required: true, message: 'Tanggal dibuat tidak boleh kosong!', trigger: 'change' }
  ]
});

// Methods
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(async (valid, fields) => {
    if (!valid) {
      console.log('Validation errors:', fields);
      ElMessage.error('Harap periksa form yang diisi!');
      return;
    }

    loading.value = true;
    try {
      // Prepare data for submission
      const submitData = {
        ...ruleForm,
      };

      

      const response = await useFetchApi(
        '/adjustments-transaction-create', 
        'adjustment-create', 
        'post', 
        submitData
      );

      if (response.status.value === 'success') {
        ElMessage.success('Adjustment transaction berhasil dibuat!');
        resetForm(formEl);
        return props.onSubmit();
      } else {
        ElMessage.error('Gagal membuat adjustment transaction');
      }
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      ElMessage.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  formEl.resetFields();
  Object.assign(ruleForm, {
    unique_id: '',
    unique_code: '',
    name: null,
    type: 'percent',
    default_value: '0',
    operator: 'plus',
    allow_party: true,
    version: 1,
    created_by: '',
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    created_at_view: new Date().toISOString().split('T')[0]
  });
};

// Auto-generate unique code jika diperlukan
const generateUniqueCode = () => {
  if (!ruleForm.unique_code) {
    const timestamp = Date.now().toString().slice(-6);
    ruleForm.unique_code = `ADJ-${timestamp}`;
  }
};

// Watch for changes
watch(() => ruleForm.type, (newType) => {
  if (newType === 'percent' && parseFloat(ruleForm.default_value) > 100) {
    ruleForm.default_value = '100';
  }
});

onMounted(() => {
  generateUniqueCode();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-ruleForm {
  max-width: 600px;
}
</style>