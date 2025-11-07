<template>
  <TrumsWrapper>
    <el-page-header @back="goBack">
      <template #content>
        <span class="text-large font-600 mr-3"> 
          {{ formMode === 'add' ? 'Tambah Bank Baru' : 'Edit Bank' }} 
        </span>
      </template>
    </el-page-header>
    
    <el-card class="my-3">
      <el-form
        ref="bankFormRef"
        style="max-width: 600px"
        :model="bankForm"
        :rules="bankRules"
        label-width="auto"
        class="demo-bankForm"
        :size="formSize"
        status-icon
        :disabled="loading"
      >
        <el-form-item label="Nama Bank" prop="bank_name">
          <el-input
            v-model="bankForm.bank_name"
            placeholder="Masukan Nama Bank"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="Kode Unik" prop="unique_id">
          <el-input
            v-model="bankForm.unique_id"
            placeholder="Masukan Kode Unik Bank"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="flex justify-end align-center">
          <el-button type="info" plain @click="resetForm(bankFormRef)">
            Reset
          </el-button>
          <el-button 
            type="primary" 
            @click="submitForm(bankFormRef)"
            :loading="loading"
          >
            {{ formMode === 'add' ? 'Simpan' : 'Update' }}
          </el-button>
        </div>
      </template>
    </el-card>
  </TrumsWrapper>
</template>

<script lang="ts" setup>
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import type { Bank } from '~/types/bank_account';

definePageMeta({
  middleware: ["auth", "app"],
});

interface BankForm {
  id?: number;
  unique_id: string;
  bank_name: string;
}

const router = useRouter();
const route = useRoute();
const formSize = ref<ComponentSize>("default");
const bankFormRef = ref<FormInstance>();
const loading = ref(false);
const formMode = ref<'add' | 'edit'>('add');

const bankForm = reactive<BankForm>({
  unique_id: '',
  bank_name: ''
});

const bankRules = reactive<FormRules<BankForm>>({
  bank_name: [
    { required: true, message: 'Nama bank wajib diisi', trigger: 'blur' },
    { min: 3, max: 100, message: 'Panjang nama 3-100 karakter', trigger: 'blur' }
  ],
  unique_id: [
    { required: true, message: 'Kode unik wajib diisi', trigger: 'blur' },
    { min: 3, max: 20, message: 'Panjang kode 3-20 karakter', trigger: 'blur' }
  ]
});

const goBack = () => router.back();

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
  Object.assign(bankForm, {
    unique_id: '',
    bank_name: ''
  });
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const payload = {
          bank_name: bankForm.bank_name,
          unique_id: bankForm.unique_id
        };

        // Simulate API call
        if (formMode.value === 'add') {
          // await useApi().post('/banks', payload);
          console.log('Creating bank:', payload);
        } else {
          // await useApi().put(`/banks/${bankForm.id}`, payload);
          console.log('Updating bank:', payload);
        }

        ElMessage.success(
          `Bank berhasil ${formMode.value === 'add' ? 'ditambahkan' : 'diupdate'}`
        );
        router.push('/finance-management/banks');
      } catch (error: any) {
        ElMessage.error(
          error.response?.data?.message || 
          `Gagal ${formMode.value === 'add' ? 'menambahkan' : 'mengupdate'} bank`
        );
      } finally {
        loading.value = false;
      }
    }
  });
};

// Load bank data for edit mode
const loadBankData = async (bankId: string) => {
  loading.value = true;
  try {
    // Simulate API call
    // const response = await useApi().get(`/banks/${bankId}`);
    // const bank = response.data.data;
    
    const sampleBank = {
      id: 1,
      unique_id: 'bank_001',
      bank_name: 'Bank Contoh',
      created_at: Date.now(),
      created_by: 1,
      updated_at: Date.now()
    };

    bankForm.id = sampleBank.id;
    bankForm.unique_id = sampleBank.unique_id;
    bankForm.bank_name = sampleBank.bank_name;
    
  } catch (error) {
    ElMessage.error('Gagal memuat data bank');
    router.push('/finance-management/banks');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const bankId = route.params.id as string;
  if (bankId) {
    formMode.value = 'edit';
    loadBankData(bankId);
  }
});
</script>

<style scoped>
.el-select, .el-autocomplete {
  width: 100%;
}
</style>